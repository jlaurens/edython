import re

from .parser import Parser
from .type import Type
from .formatter import Formatter

class Types:
    """
    The functions are defined in the order they should be called

    """
    re_pipe = re.compile(r'\s*\|\s*')
    re_concrete_candidate = re.compile(r'\s*([a-z_][a-z_\d]*)\s*\|\s*(.*)\s*$')
    re_star_identifier = re.compile(r'^\s*"(\*+)"\s*([a-z_][a-z_\d]*)\s*$')

    def __init__(self, *paths):
        self.all = {}
        self.is_before = {}
        self.is_after = {}
        self.lincks = {}
        self.n = 0
        self.lists_made = False
        for path in paths:
            self.read(path)
        self.make_ignore()
        self.make_lists()
        self.make_concrete()
        self.make_before_after()
        self.make_shallow()
        self.make_alias()
        self.make_deep()
        self.make_compound()
        self.remove_wrappers()
        self.make_list_require()
        self.make_link()


    def __repr__(self):
        return repr(self.__dict__)

    def __iter__(self):
        for t in self.all.values():
            yield t

    def get_statements(self):
        for t in (t for t in self if t.is_stmt and not t.ignored):
            yield t

    def get_expressions(self):
        for t in (t for t in self if not t.is_stmt and not t.ignored):
            yield t

    def get_list_expressions(self):
        for t in (t for t in self if t.is_list and not t.ignored):
            yield t

    def read(self, path):
        print('Parsing:', path)
        with path.open() as f:
            data = f.read()
            parser = Parser()
            parser.feed(data)
            for x in parser.get_pre_pos_data():
                self.digest(x[0])

    def get_type(self, name, create = False):
        if name in self.all:
            return self.all[name]
        if create:
            nn = self.n
            self.n += 1
            t = Type(nn, name)
            self.all[t.name] = t
            return t
        return None

    def digest(self, data):
        data = data.replace('\n ', ' ')
        data = re.sub(r'  +', ' ', data)
        re_definition = re.compile(r"^\s*(?P<name>[a-zA-Z_][a-zA-Z_\d]*?)\s*(?P<op>::=|!!=|\|\|=)\s*(?P<definition>.*)\s*$")
        re_stmt_order = re.compile(r"^\s*(\S+)\s*(<|>)\s*(.*)\s*$")
        re_linck = re.compile(r"^\s*(?P<definition>\S+)\s*->\s*(?P<alias>.*)\s*$")
        for l in data.splitlines():
            m = re_definition.match(l)
            if m:
                name, op, definition = m.group('name'), m.group('op'), m.group('definition')
                try:
                    t = self.get_type(name, create=True)
                    t.setup_definition(definition, op == r'||=')
                    if (op == '!!='):
                        t.is_shallow = True
                except Exception as exc:
                    print(exc)
            else:
                m = re_stmt_order.match(l)
                if m:
                    name, what, is_before = m.group(1), m.group(3), m.group(2) == '<'
                    where = self.is_before if is_before else self.is_after
                    if not name in where:
                        where[name] = set()
                    already = where[name]
                    already.update(re.split(r'\s*\|\s*', what))
                else:
                    m = re_linck.match(l)
                    if m:
                        self.lincks[m.group('definition')] = m.group('alias')

    def make_compound(self):
        while True:
            for t in self.get_statements():
                if t.is_compound == None:
                    try:
                        ds = t.depends_
                    except:
                        ds = t.depends_ = [x for x in re.split(r'[\s|]+', t.get_minimized_definition()) if len(x)]
                    for k in t.depends_:
                        try:
                            type = self.get_type(k)
                            if type and type.is_compound:
                                t.is_compound = True
                                break # this type has changed status
                        except: pass
                    else:
                        continue # this type has not changed status, try the next one
                    break # this type has changed status
            else:
                return # no type has changed status, stop here

    def make_concrete(self):
        """
        Automatically creates "concrete" types for declarations like
        foo ::= bla | an operation
        It is functionally equivalent to the declaration
        foo ::= bla | foo_concrete
        foo_concrete ::= an operation
        More to come...
        """
        self.make_lists()
        more = {}
        for t in self.get_expressions():
            definition = t.definition
            cs = Types.re_pipe.split(definition)[1:]
            if len(cs) > 0:
                cs = [x for x in cs if Formatter.get_identifier(x)]
                if len(cs) == 0:
                    m = Types.re_concrete_candidate.match(t.definition)
                    if m:
                        def_alias = m.group(1)
                        def_concrete = m.group(2)
                        def_guessed = '{} | {}'.format(def_alias, def_concrete)
                        if def_guessed == t.definition:
                            mm = Types.re_star_identifier.match(def_concrete)
                            if mm:
                                if len(mm.group(1)) == 1:
                                    name_concrete = 'starred_' + mm.group(2)
                                elif len(mm.group(1)) == 2:
                                    name_concrete = 'double_star_' + mm.group(2)
                                elif len(mm.group(1)) == 3:
                                    name_concrete = 'triple_star_' + mm.group(2)
                                else:
                                    name_concrete = 'multi_star_' + mm.group(2)
                            else:
                                name_concrete = t.name + '_concrete'
                            def_new = '{} | {}'.format(def_alias, name_concrete)
                            t.original_definition = t.definition
                            t.definition = def_new
                            t.is_wrapper = True
                            tt = Type(t.n, name_concrete, def_concrete)
                            more[tt.name] = tt
                            print('**** new concrete type from', t.name, '::=', t.definition, '::=',
                                  t.original_definition)
                            print('****', name_concrete, '::=', def_concrete)
                            continue
            if not t.is_wrapper and not t.is_list:
                cs = Formatter.get_alternate_components(definition)
                if len(cs)>1:
                    concretes = []
                    defs = []
                    i = 0
                    for def_concrete in cs:
                        if Formatter.get_identifier(def_concrete):
                            defs.append(def_concrete)
                        else:
                            name_concrete = t.name + '_concrete_' + str(i)
                            i += 1
                            defs.append(name_concrete)
                            tt = Type(t.n, name_concrete, def_concrete)
                            concretes.append(tt)
                    if len(concretes) and len(concretes) < len(defs):
                        t.original_definition = t.definition
                        t.definition = ' | '.join(defs)
                        t.is_wrapper = True
                        if len(concretes) == 1:
                            name_concrete = t.name + '_concrete'
                            t.definition = t.definition.replace(concretes[0].name, name_concrete)
                            concretes[0].setup_name(name_concrete)
                        print('**** new concrete type from', t.name, '::=', t.definition, '::=', t.original_definition)
                        for tt in concretes:
                            more[tt.name] = tt
                            tt.etercnoc = t
                            print('****', tt.name, '::=', tt.definition)
                        continue
            identifier, option = Formatter.get_identifier_option(t.definition)
            if identifier:
                name_concrete = t.name + '_concrete'
                def_concrete = re.sub(r' +', ' ', identifier + ' ' + option)
                def_new = identifier + ' | ' + name_concrete
                t.original_definition = t.definition
                t.definition = def_new
                t.is_wrapper = True
                tt = Type(t.n, name_concrete, def_concrete)
                more[tt.name] = tt
                tt.etercnoc = t
                print('**** new concrete type from', t.name, '::=', t.definition, '::=', t.original_definition)
                print('****', name_concrete, '::=', def_concrete)
                continue
        self.all.update(more)

    def make_before_after(self):
        for k, v in self.is_before.items():
            try:
                t = self.all[k]
                t.is_before = [self.all[tt] for tt in v if tt in self.all]
            except:
                print('IGNORED', k, '<', v)
        for k, v in self.is_after.items():
            try:
                t = self.all[k]
                t.is_after = [self.all[tt] for tt in v if tt in self.all]
            except:
                print('IGNORED', k, '>', v)

    def make_lists(self):
        if self.lists_made:
            return
        self.lists_made = True
        for t in self.get_expressions():
            definition = t.get_normalized_definition()
            m = re.match(r'(\S*)\s*\(\s*(\S*)\s*\1\s*\)\s*\*(?:\s*\[\s*\2\s*\]\s*)?$', definition)
            t.is_list = not not m
            if t.is_list:
                if len(m.group(1)):
                    t.list_require.append(m.group(1))
                    t.list_separator = m.group(2)
                elif len(m.group(2)):
                    t.list_require.append(m.group(2))

    def make_link(self):
        for t in self:
            try:
                a = self.lincks[t.name]
                t.old_name = t.name
                t.name = a
                print('**** AS:', t.old_name, '->', t.name)
            except: pass

    def make_shallow(self):
        more_t = {}
        for t in self.get_expressions():
            t.is_wrapper = True
            require = set()
            definition = t.get_shortenized_definition()
            cs = Types.re_pipe.split(definition)
            for c in cs:
                if 'OPTIONAL' in c:
                    t.is_wrapper = False
                    t.one_shot = False
                else:
                    c = Formatter.get_identifier(c)
                    if c:
                        try:
                            tt = self.all[c]
                        except:
                            try:
                                tt = more_t[c]
                            except:
                                tt = more_t[c] = Type(-len(self.all)-len(more_t), c, '')
                                tt.require = []
                        require.add(tt)
                    else:
                        t.is_wrapper = False
                        t.one_shot = False
            t.require = list(require)
        self.all.update(more_t)
        for t in self:
            t.temp_ = set()
        for t in self.get_expressions():
            for tt in t.require:
                tt.temp_.add(t)
        for t in self.get_expressions():
            t.provide = list(t.temp_)
        for t in self:
            del t.temp_
        for t in self.get_expressions():
            t.one_shot = t.one_shot and not len(t.require) and len(t.provide) == 1
        for t in self.get_expressions():
            if t.is_shallow:
                for tt in t.require:
                    tt.is_shallow_required = True

    def make_deep_(self, shallow_key, deep_key, filter):
        for t in self:
            t.temp_ = set(tt for tt in getattr(t, shallow_key) if filter(tt))
        once_more = True
        while once_more:
            once_more = False
            for t in self.get_expressions():
                if t.is_shallow: continue
                more = set()
                for tt in t.temp_:
                    for ttt in tt.temp_:
                        if not ttt in t.temp_:
                            more.add(ttt)
                            once_more = True
                if len(more):
                    t.temp_ |= more
        for t in self.get_expressions():
            if t.is_shallow:
                setattr(t, deep_key, getattr(t, shallow_key))
            else:
                setattr(t, deep_key, list(t.temp_))
        for t in self:
            del t.temp_

    def make_cycle(self):
        for t in self.get_expressions():
            t.temp_ = set()
        for t in self.get_expressions():
            if t.is_shallow: pass
            for tt in self.get_expressions():
                if t != tt:
                    if t in tt.deep_provide and tt in t.deep_require:
                        t.temp_.add(tt)
                        tt.temp_.add(t)
        for t in self.get_expressions():
            if t.is_shallow: pass
            if len(t.temp_):
                t.cycle = sorted(list(t.temp_), key = lambda x: (-len(x.deep_provide), x.name))
                t.cycle_entry = t.cycle[0]
            else:
                t.cycle = []
                t.cycle_entry = t
        for t in self.get_expressions():
            del t.temp_

    def make_deep(self):
        self.make_deep_('require', 'deep_require', lambda x: True)
        self.make_deep_('provide', 'deep_provide', lambda x: True)
        self.make_cycle()

    def make_list_require(self):
        for t in self.get_list_expressions():
            require = set()
            for name in t.list_require:
                tt = self.get_type(name)
                if len(tt.deep_require):
                    require.update(tt.deep_require)
                else:
                    require.add(tt)
            t.list_require = list(require)

    def remove_type(self, name):
        type = self.all[name]
        if type:
            for t in self.get_expressions():
                try:
                    t.deep_require.remove(type)
                except: pass
                try:
                    t.deep_provide.remove(type)
                except: pass
            del self.all[name]

    def remove_wrappers(self):
        for wrapper in [t for t in self.get_expressions() if t.is_wrapper]:
            for t in self.get_expressions():
                if t.is_shallow: continue
                try:
                    t.deep_require.remove(wrapper)
                except: pass
                try:
                    t.list_require.remove(wrapper)
                except: pass

    def make_alias(self):
        for t in self:
            if not t.is_stmt and len(t.require) == 1 and not t.is_shallow_required:
                candidate = self.get_type(t.definition)
                if candidate.name != t.name:
                    t.alias = candidate
        for t in self:
            a = t.alias
            while a:
                a = a.alias
                if a:
                    t.alias = a
                else:
                    break

    def make_ignore(self):
        for t in self:
            t.ignored = t.definition == 'IGNORE' or t.definition == 'REMOVE'
            if t.ignored:
                print('**** IGNORED:', t.name)

    def get_T3_data(self, **kwargs):
        formatter = Formatter(self, **kwargs)
        return formatter.get_T3_data()

    def get_T3_all(self):
        formatter = Formatter(self)
        return formatter.get_T3_all()

    def get_T3_delegates(self):
        formatter = Formatter(self)
        return formatter.get_T3_delegates()
