import re

from .parser import Parser
from .type import Type
from .formatter import Formatter

class Types:
    """
    The functions are defined in the order they should be called

    """
    re_pipe = re.compile(r'\s*\|\s*')
    re_identifier_only = re.compile(r'^\s*([a-z_][a-z_\d]*)\s*$')
    re_concrete_candidate = re.compile(r'\s*([a-z_][a-z_\d]*)\s*\|\s*(.*)\s*$')
    re_star_identifier = re.compile(r'^\s*"(\*+)"\s*([a-z_][a-z_\d]*)\s*$')

    def __init__(self, *paths):
        self.all = {}
        self.is_before = {}
        self.is_after = {}
        self.n = 0
        for path in paths:
            self.read(path)
        self.make_lists()
        self.make_concrete()
        self.make_before_after()
        self.make_shallow()
        self.make_alias()
        self.make_deep()
        self.remove_wrappers()
        self.make_list_require()

    def __repr__(self):
        return repr(self.__dict__)

    def __iter__(self):
        for t in self.all.values():
            yield t

    def get_statements(self):
        for t in (t for t in self if t.is_stmt):
            yield t

    def get_expressions(self):
        for t in (t for t in self if not t.is_stmt):
            yield t

    def get_list_expressions(self):
        for t in (t for t in self if t.is_list):
            yield t

    def read(self, path):
        print('Parsing:', path)
        with path.open() as f:
            data = f.read()
            parser = Parser()
            parser.feed(data)
            for x in parser.get_pre_pos_data():
                self.digest(x[0])

    def get_type(self, name):
        if name in self.all:
            return self.all[name]
        nn = self.n
        self.n += 1
        return Type(nn, name)

    def digest(self, data):
        data = data.replace('\n ', ' ')
        data = re.sub(r'  +', ' ', data)
        re_definition = re.compile(r"^\s*(?P<name>[a-zA-Z_][a-zA-Z_\d]*?)\s*::=\s*(?P<definition>.*)\s*$")
        re_stmt_order = re.compile(r"^\s*(\S+)\s*(<|>)\s*(.*)\s*$")
        for l in data.splitlines():
            m = re_definition.match(l)
            if m:
                name, definition = m.group('name'), m.group('definition')
                if len(definition):
                    nn = self.n
                    if name in self.all:
                        # override the previous definition, keep the same number
                        nn = self.all[name].n
                    try:
                        t = Type(nn, name, definition)
                        self.all[name] = t
                        self.n += 1
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

    def make_concrete(self):
        """
        Automatically creates "concrete" types for declarations like
        foo ::= bla | an operation
        It is functionally equivalent to the declaration
        foo ::= bla | foo_concrete
        foo_concrete ::= an operation
        More to come...
        """
        more = {}
        for t in self.get_expressions():
            definition = t.definition
            cs = Types.re_pipe.split(definition)[1:]
            if len(cs) > 0:
                cs = [x for x in cs if Types.re_identifier_only.match(x)]
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
                            t.definition = def_new
                            tt = Type(t.n, name_concrete, def_concrete)
                            more[tt.name] = tt
                            continue
            definition = t.definition
            cs = Types.re_pipe.split(definition)
            if len(cs)>1 and len([x for x in cs if not Types.re_identifier_only.match(Formatter.minimize(x))]) == 0:
                ds = []
                for i in range(len(cs)):
                    def_concrete = cs[i]
                    if Types.re_identifier_only.match(def_concrete):
                        ds.append(def_concrete)
                    else:
                        name_concrete = t.name + '_concrete_' + str(i)
                        ds.append(name_concrete)
                        tt = Type(t.n, name_concrete, def_concrete)
                        more[tt.name] = tt
                t.definition = ' | '.join(ds)
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

    def make_shallow(self):
        more_t = {}
        for t in self.get_expressions():
            t.wrapper = True
            require = set()
            definition = t.get_shortenized_definition()
            cs = Types.re_pipe.split(definition)
            for c in cs:
                if 'OPTIONAL' in c:
                    t.wrapper = False
                    t.one_shot = False
                else:
                    m = Types.re_identifier_only.match(c)
                    if m:
                        c = m.group(1)
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
                        t.wrapper = False
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

    def make_deep_(self, shallow_key, deep_key, filter):
        for t in self:
            t.temp_ = set(tt for tt in getattr(t, shallow_key) if filter(tt))
        once_more = True
        while once_more:
            once_more = False
            for t in self.get_expressions():
                more = set()
                for tt in t.temp_:
                    for ttt in tt.temp_:
                        if not ttt in t.temp_:
                            more.add(ttt)
                            once_more = True
                if len(more):
                    t.temp_ |= more
        for t in self.get_expressions():
            setattr(t, deep_key, list(t.temp_))
        for t in self:
            del t.temp_
        for t in self.get_expressions():
            t.one_shot = t.one_shot and not len(t.require) and len(t.provide) == 1

    def make_cycle(self):
        for t in self.get_expressions():
            t.temp_ = set()
        for t in self.get_expressions():
            for tt in self.get_expressions():
                if not t == tt:
                    if t in tt.deep_provide and tt in t.deep_require:
                        t.temp_.add(tt)
                        tt.temp_.add(t)
        for t in self.get_expressions():
            if len(t.temp_):
                t.cycle = sorted(list(t.temp_), key = lambda x: (-len(x.deep_provide), x.name))
                t.cycle_entry = t.cycle[0]
            else:
                t.cycle = []
                t.cycle_entry = t

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
        for wrapper in [t for t in self.get_expressions() if t.wrapper]:
            for t in self.get_expressions():
                try:
                    t.deep_require.remove(wrapper)
                except: pass
                try:
                    t.deep_provide.remove(wrapper)
                except: pass
                try:
                    t.list_require.remove(wrapper)
                except: pass

    def make_alias(self):
        for t in self:
            if not t.is_stmt and len(t.require) == 1:
                t.alias = self.get_type(t.require[0].name)
        for t in self:
            a = t.alias
            while a:
                a = a.alias
                if a:
                    t.alias = a
                else:
                    break

    def get_T3_data(self, **kwargs):
        return Formatter.get_T3_data(self, **kwargs)

