import re

from .parser import Parser
from .type import Type
from .formatter import Formatter

class Types:
    """
    The functions are defined in the order they should be called

    """
    re_pipe = re.compile(r'\s*\|\s*')
    re_filter = re.compile(r'^(?:def |for |with |class |except |async |TypeError|Traceback|None|True|False'
                           r'|Execution |Don\'t |(?:expr|[\d, +*(\-)=])+$|inst[.= ]|[xi] |if |yield |\S+Error:'
                           r'|i,|print\(|raise |The |During |import |from |[a-zA-Z\d ]*=|while |else:|try:|except:'
                           r')')
    re_definition = re.compile(r"^\s*(?P<name>[a-zA-Z_][a-zA-Z_\d]*)"
                               r"(?:\s*\(\s*(?P<is_stmt>stmt)\s*\)\s*)?"
                               r"(?:\s*\(\s*\[\s*(?P<weight>\d+)\s*\]\s*\)\s*)?"
                               r"(?:\s*/\s*(?P<to_dom>[a-zA-Z_](?:[a-zA-Z_\d\|]*[a-zA-Z_\d])?)?)"
                               r"?\s*(?P<op>::=|!!=|\|\|=)?"
                               r"\s*(?P<definition>(?:[^\\]|\\.)*?)"
                               r"\s*(?:#.*)?$")
    re_stmt_order = re.compile(r"^\s*(?P<name>\S+)\s*(?P<order>T0F|B0F|L0F|R0F)\s*(?P<what>.*)\s*$")
    re_type_name = re.compile(r"^\s*(?P<type>[^\s\.]*)(?:\.(?P<name>[^\s\.]+))?\s*$")
    re_link = re.compile(r"^\s*(?P<source>\S+)\s*->\s*(?P<alias>.*)\s*$")
    re_category = re.compile(r"^\s*category\s*:[\s.\d]*(?P<category>[a-zA-Z\s_]*).*$")
    re_ignore = re.compile(r"^\s*[\d@#.'({].*")

    all = {}
    is_above = {}
    is_below = {}
    is_left_of = {}
    is_right_of = {}
    links = {}
    n = 0
    current_category = 'default'
    lists_made = False

    def __init__(self, *paths):
        for path in paths:
            self.read(path)
        print('Input files are read.')
        self.make_ignore()
        self.make_lists()
        self.make_before_after()
        self.make_left_right()
        self.make_shallow()
        self.make_alias()
        self.make_deep()
        self.make_compound()
        self.remove_wrappers()
        self.make_list_require()
        self.make_link()
        self.make_similar_providers()
        self.make_same_check()
        self.make_same_left()
        self.make_same_right()

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
        with path.open('r', encoding='utf-8') as f:
            data = f.read()
            parser = Parser()
            parser.feed(data)
            for x in parser.get_pre_pos_data():
                self.digest(x[0])

    def get_type(self, name, create = False):
        if name in self.all:
            t = self.all[name]
            self.current_category = t.category
            return t
        if create:
            nn = self.n
            self.n += 1
            t = Type(nn, name, category = self.current_category)
            self.all[t.name] = t
            return t
        return None

    def digest(self, data):
        """
        Digest the given data. When possible, recognize a type definition
        :param data: a string
        :return: None
        """
        data = data.replace('\n ', ' ')
        data = re.sub(r' {2,}', ' ', data)
        for l in data.splitlines():
            if self.re_filter.match(l):
                continue
            m = self.re_definition.match(l)
            if m:
                name, is_stmt, weight, to_dom, op, definition = m.group('name'), m.group('is_stmt'), \
                                            m.group('weight'), m.group('to_dom'), m.group('op'), m.group('definition')
                if to_dom or op:
                    try:
                        t = self.get_type(name, create=True)
                        if op:
                            t.setup_definition(definition, op == r'||=')
                        if is_stmt:
                            t.is_stmt = True
                        if weight:
                            t.weight = int(weight)
                        if to_dom:
                            t.to_dom = self.re_pipe.split(to_dom)
                        if op == '!!=':
                            t.is_shallow = True
                        if not op:
                            print('************ ONLY XML TAG', t.name)
                    except Exception as exc:
                        print(exc)
                    continue
            m = self.re_stmt_order.match(l)
            if m:
                name = m.group('name')
                order = m.group('order')
                where = self.is_above if order == 'T0F' else (self.is_below if order == 'B0F' else (self.is_left_of if order == 'L0F' else self.is_right_of))
                if not name in where:
                    where[name] = set()
                already = where[name]
                already.update(re.split(r'\s*\|\s*', m.group('what')))
                continue
            m = self.re_link.match(l)
            if m:
                self.links[m.group('source')] = m.group('alias')
                continue
            m = self.re_category.match(l)
            if m:
                self.current_category = m.group('category')
                continue
            m = self.re_ignore.match(l)
            if m:
                continue
            if len(l):
                print('************************* potential danger:', l)


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

    def make_before_after(self):
        print('====> MAKE BEFORE AFTER')
        def f(attr):
            items = getattr(self, attr).items()
            for k, v in items:
                try:
                    t = self.all[k]
                    print(k, t.name)
                    ts = []
                    setattr(t, attr, ts)
                    for tt in v:
                        m = self.re_type_name.match(tt)
                        if m and m.group('type') in self.all:
                            ts.append((self.all[m.group('type')], m.group('name')))
                except KeyError as e:
                    print('**** DANGER: unknown type', e)

        f('is_above')
        f('is_below')

    def make_left_right(self):
        """ 
        Make the left and right arrays.
        Only simple statements have checks for left and right connections.
        Compound statements have no left connection, but have right connections.
        Their right connection has no constrain.
        :return: None
        """
        print('====> MAKE LEFT RIGHT')
        # based on the simple_stmt definition
        more_t = {}
        t = self.all['simple_stmt']
        t.is_wrapper = True
        require = set()
        definition = t.get_shortenized_definition()
        cs = Types.re_pipe.split(definition)
        tts = [t] # all the types that appear as simple_stmt, no recursion
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
                            tt = more_t[c] = Type(-len(self.all)-len(more_t), c, '', category = t.category)
                            tt.require = []
                    require.add(tt)
                    tts.append(tt)
                else:
                    t.is_wrapper = False
                    t.one_shot = False
        t.require = sorted(list(require), key = lambda x: (x.n, x.name))
        self.all.update(more_t)
        for tt in tts:
            tt.is_left_of = tt.is_right_of = t.require
        items = self.is_right_of.items()
        for k, v in items:
            try:
                t = self.all[k]
                ts = set(require)
                for tt in v:
                    m = self.re_type_name.match(tt)
                    if m and m.group('type') in self.all:
                        ts.add(self.all[m.group('type')])
                t.is_right_of = sorted(list(ts), key = lambda x: (x.n, x.name))
            except KeyError as e:
                print('**** DANGER: unknown type', e)

    def make_lists(self):
        if self.lists_made:
            return
        print('====> MAKE LISTS')
        self.lists_made = True
        for t in self.get_expressions():
            definition = t.get_normalized_definition()
            m = re.match(r'(?P<item>\S*)\s*\(\s*(?P<sep>\S*)\s*\1\s*\)\s*\*(?:\s*\[\s*\2\s*\]\s*)?$', definition)
            t.is_list = not not m
            if t.is_list:
                if len(m.group('item')):
                    t.list_require.append(m.group('item'))
                    t.list_separator = m.group('sep')
                elif len(m.group('sep')):
                    t.list_require.append(m.group('sep'))

    def make_link(self):
        print('====> MAKE LINK')
        for t in self:
            a = self.links.get(t.name)
            if a is not None:
                t.old_name = t.name
                t.name = a
                t.alias = self.get_type(a)
                print('**** AS:', t.old_name, '->', t.name)

    def make_shallow(self):
        print('====> MAKE SHALLOW')
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
                                tt = more_t[c] = Type(-len(self.all)-len(more_t), c, '', category = t.category)
                                tt.require = []
                        require.add(tt)
                    else:
                        t.is_wrapper = False
                        t.one_shot = False
            t.require = sorted(list(require), key = lambda x: (x.n, x.name))
        self.all.update(more_t)
        for t in self:
            t.temp_ = set()
        for t in self.get_expressions():
            for tt in t.require:
                tt.temp_.add(t)
        for t in self.get_expressions():
            t.provide = sorted(list(t.temp_), key = lambda x: (x.n, x.name))
        for t in self:
            del t.temp_
        for t in self.get_expressions():
            t.one_shot = t.one_shot and not len(t.require) and len(t.provide) == 1
        for t in self.get_expressions():
            if t.is_shallow:
                for tt in t.require:
                    tt.is_shallow_required = True

    def make_deep_(self, shallow_key, deep_key, filter):
        print('====> MAKE DEEP')
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
                setattr(t, deep_key, sorted(list(t.temp_), key=lambda x: (x.n, x.name)))
        for t in self:
            del t.temp_

    def make_cycle(self):
        print('====> MAKE CYCLE')
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
        print('====> MAKE DEEP')
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
            t.list_require = sorted(list(require), key=lambda x: (x.n, x.name))

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
        print('====> MAKE ALIAS')
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
        print('====> IGNORE or REMOVE')
        for t in self:
            t.ignored = t.definition == 'IGNORE' or t.definition == 'REMOVE'
            if t.ignored:
                print('**** IGNORED:', t.name)


    def make_same_check(self):
        print('====> MAKE SAME CHECK')
        for t in self.get_expressions():
            if t.is_list:
                checks = t.get_checks()
                if len(checks)>1:
                    for tt in self.get_expressions():
                        if t != tt and not tt.same_checks and checks == tt.get_checks():
                            tt.same_checks = t

    def make_same_left(self):
        print('====> MAKE SAME LEFT')
        ts = self.get_statements()
        for t in ts:
            if t.is_list:
                original = t.get_left()
                if len(original)>1:
                    for tt in ts:
                        if t != tt and not tt.same_left and original == tt.get_left():
                            tt.same_left = t

    def make_same_right(self):
        print('====> MAKE SAME RIGHT')
        ts = self.get_statements()
        for t in ts:
            if t.is_list:
                original = t.get_right()
                if len(original)>1:
                    for tt in ts:
                        if t != tt and not tt.same_right and original == tt.v():
                            tt.same_right = t

    def make_similar_providers(self):
        '''
        Find the types that have the same provide list
        At the end, all expression types have a `similar` attribute
         filled with expression types with exactly the same `require` list.
         Of course Any such list contains at least the type of the owner.
        :return: None
        '''
        print('====> MAKE SIMILAR PROVIDERS')
        for t in self.get_expressions():
            t.temp_ = set()
        for t in self.get_expressions():
            for tt in self.get_expressions():
                if t.provide == tt.provide:
                    t.temp_.add(tt)
                    tt.temp_.add(t)
        for t in self.get_expressions():
            t.similar = sorted(list(t.temp_), key=lambda x: (x.n, x.name))
        for t in self.get_expressions():
            del t.temp_
        print('**** SIMILAR:')
        for t in self.get_expressions():
            if len(t.similar)>1 and t.similar[0] == t:
                print(t.name, ' ~', end='', sep='')
                for t in t.similar:
                    if t != t.similar[0]:
                        print(' ', t.name, ',', end='', sep='')
                print()

    def get_t3_data(self, **kwargs):
        formatter = Formatter(self, **kwargs)
        return formatter.get_t3_data()

    def get_t3_all(self):
        formatter = Formatter(self)
        return formatter.get_t3_all()
