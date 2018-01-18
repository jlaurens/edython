import pathlib
import re

import html.parser

class MyHTMLParser(html.parser.HTMLParser):
    def __init__(self, *, convert_charrefs=True):
        """Initialize and reset this instance."""
        super(MyHTMLParser, self).__init__(convert_charrefs = convert_charrefs)
        self.pre_pos_data = []
        self.did_start_pre = False

    def handle_starttag(self, tag, attrs):
        if tag == 'pre':
            self.start_pos = self.getpos()
            self.pre_data = ''
            self.did_start_pre = True

    def handle_endtag(self, tag):
        if tag == 'pre':
            if self.did_start_pre:
                self.pre_pos_data.append((self.pre_data, self.start_pos, self.getpos()))
            self.did_start_pre = True
            self.start_pos = None

    def handle_data(self, data):
        """ Records data while in pre element """
        if self.did_start_pre:
            self.pre_data += data

    def get_pre_pos_data(self):
        return self.pre_pos_data

class Xpr:
    """An Xpr represents a python 3 expression"""
    d = {
        '(': 'LPAR',
        ')': 'RPAR',
        '[': 'LBRACKET',
        ']': 'RBRACKET',
        '|': 'PIPE',
    }
    re_optional_1 = re.compile(r'\[[^\]]*\]')
    re_optional_n = re.compile(r'\([^\)]*\)\s*\*')
    re_parenth_1 = re.compile(r'^\s*(?:OPTIONAL\s*)*\(([^\)]*)\)\s*(?:OPTIONAL\s*)*$')
    re_parenth_2 = re.compile(r'\(([^\)]*)\|([^\)]*)\)')

    def __init__(self, n, name, definition):
        """
        n is the line number,
        name is the expression name: proper_slicing, m_expr, and_test...
        definition is the rhs in the ... ::= ... line
        """
        self.n = n
        self.name = name
        self.definition = definition
        self.count = 0
        self.require = []
        self.provide = []
        self.deep_require = []
        self.deep_provide = []
        self.wrapper = False
        self.one_shot = True
        for k, v in Xpr.d.items():
            definition = definition.replace('"' + k + '"', v)
        while True:
            definition, n = Xpr.re_optional_1.subn('OPTIONAL', definition)
            if not n: break
        while True:
            definition, n = Xpr.re_optional_n.subn('OPTIONAL', definition)
            if not n: break
        definition = Xpr.re_parenth_1.sub(r'\g<1>', definition)
        definition = Xpr.re_parenth_2.sub(r'BGROUP \g<1> OR \g<2> EGROUP', definition)
        self.short_definition = definition

    def __repr__(self):
        return repr(self.__dict__)

class Xprs:
    re1 = re.compile(r'\s*\|\s*')
    re2 = re.compile(r'^\s*([a-z_]+)\s*$')

    def __init__(self, *paths):
        self.all = {}
        matcher = re.compile(r"\b(\S*?)(_stmt|_statement)?\s*::=\s*(.*)")
        for path in paths:
            print('Parsing:', path)
            with path.open() as f:
                data = f.read()
                parser = MyHTMLParser()
                parser.feed(data)
                n = 0
                for x in parser.get_pre_pos_data():
                    data = x[0].replace('\n ','')
                    data = re.sub(r' +', ' ', data)
                    for l in data.splitlines():
                        m = matcher.match(l)
                        if m and m.group(1) != 'name' and not m.group(2):
                            t = Xpr(n, m.group(1), m.group(3))
                            self.all[t.name] = t
                            n += 1

    def __repr__(self):
        return repr(self.__dict__)

    def __iter__(self):
        for t in self.all.values():
            yield t

    def make_shallow(self):
        more_t = {}
        for t in self:
            t.wrapper = True
            require = set()
            definition = t.short_definition
            cs = Xprs.re1.split(definition)
            for c in cs:
                if 'OPTIONAL' in c:
                    t.wrapper = False
                    t.one_shot = False
                    c = c.replace('OPTIONAL', '')
                m = Xprs.re2.match(c)
                if m:
                    c = m.group(1)
                    try:
                        tt = self.all[c]
                    except:
                        try:
                            tt = more_t[c]
                        except:
                            tt = more_t[c] = Xpr(-len(self.all)-len(more_t), c, '')
                            tt.require = []
                    require.add(tt)
                else:
                    t.wrapper = False
                    t.one_shot = False
            t.require = list(require)
        self.all.update(more_t)
        for t in self:
            t.temp_ = set()
        for t in self:
            for tt in t.require:
                tt.temp_.add(t)
        for t in self:
            t.provide = list(t.temp_)
            del t.temp_

    def make_deep_(self, shallow_key, deep_key, filter):
        for t in self:
            t.temp_ = set(tt for tt in getattr(t, shallow_key) if filter(tt))
        once_more = True
        while once_more:
            once_more = False
            for t in self:
                more = set()
                for tt in t.temp_:
                    for ttt in tt.temp_:
                        if not ttt in t.temp_:
                            more.add(ttt)
                            once_more = True
                if len(more):
                    t.temp_ |= more
        for t in self:
            setattr(t, deep_key, list(t.temp_))
            del t.temp_
        for t in self:
            t.one_shot = t.one_shot and not len(t.require) and len(t.provide) == 1

    def make_cycle(self):
        for t in self:
            t.temp_ = set()
        for t in self:
            for tt in self:
                if not t == tt:
                    if t in tt.deep_provide and tt in t.deep_require:
                        t.temp_.add(tt)
                        tt.temp_.add(t)
        for t in self:
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

        # for t in self:
        #     more = set()
        #     for tt in t.deep_require:
        #         for ttt in tt.deep_require:
        #             more.add(tt)
        #             break
        #     t.temp_ = set(t.deep_require) - more
        # for t in self:
        #     t.deep_require = list(t.temp_)
        #     del t.temp_

    def remove_type(self, name):
        type = self.all[name]
        if type:
            for t in self:
                try:
                    t.deep_require.remove(type)
                except: pass
                try:
                    t.deep_provide.remove(type)
                except: pass
            del self.all[name]

    def print_require(self):
        for t in self:
            if len(t.deep_require) == 1:
                print(t.name, ', '.join(tt.name for tt in t.deep_require), sep = '<-')
        for t in self:
            if len(t.deep_require) > 1:
                print(t.name, ', '.join(tt.name for tt in t.deep_require), sep = '<-')

    def print_provide(self):
        for t in self:
            if len(t.name) and len(t.deep_provide) == 1:
                print(t.name, ', '.join(tt.name for tt in t.deep_provide), sep = '->')
        for t in self:
            if len(t.name) and len(t.deep_provide) > 1:
                print(t.name, ', '.join(tt.name for tt in t.deep_provide), sep='->')

    def make_require_tree(self):
        self.require_root = Node()
        for t in self:
            c = self.require_root
            for a in sorted(t.deep_require, key = lambda x: (-len(x.deep_provide), x.name)):
                c = c.child(a)
            c.add_node(t)

    def print_require_tree(self):
        self.require_root.deep_print()

    def make_provide_tree(self):
        self.provide_root = Node()
        for t in self:
            c = self.provide_root
            for a in sorted(t.deep_provide, key = lambda x: (len(x.deep_provide), x.name)):
                c = c.child(a)
            c.add_node(t)

    def print_provide_tree(self, filter = None):
        self.provide_root.deep_print(filter=filter, sep='<-')


    def print_T3(self):
        Ts = sorted(self.all.values(), key=lambda t: (t.n, t.name))
        i = 0
        for t in Ts:
            t.short_name = str(i)
            i += 1
        print('ezP.T3 = {')
        for t in Ts:
            print(' ', t.name, ': "', t.short_name, '",', sep='')
        print('}\n')
        print('ezP.T3.Require = {')
        for t in Ts:
            if len(t.deep_require):
                print(' ', t.name, ': [', sep='')
                for tt in sorted((tt for tt in t.deep_require), key=lambda t: (t.n, t.name)):
                    print('    ezP.T3.', tt.name, ',', sep='')
                print(' ],')
        print('}\n')
        print('ezP.T3.Provide = {')
        for t in Ts:
            if len(t.deep_provide):
                print(' ', t.name, ': [', sep='')
                for tt in sorted((tt for tt in t.deep_provide), key=lambda t: (t.n, t.name)):
                    print('    ezP.T3.', tt.name, ',', sep='')
                print(' ],')
        print('}\n')


class Node:
    def __init__(self, parent = None, type = None):
        self.parent = parent
        self.type = type
        self.children = {}
        self.nodes = set()
    name = property(lambda self: self.type.name if self.type else '')

    def get_name(self):
        return self.type.name if self.type else ''

    def add_node(self, type):
        self.nodes.add(type)

    def child(self, t):
        if not t.name in self.children:
            self.children[t.name] = Node(self, t)
        return self.children[t.name]

    def get_path(self):
        l = []
        a = self
        while a:
            l.insert(0,a.name)
            a = a.parent
        return '/'.join(l)
    path = property(get_path)

    def deep_print(self, filter = None, sep = '->'):
        if (not filter or filter(self)) and len(self.nodes) and len(self.path):
            print(self.path, ', '.join(l.name for l in self.nodes), sep = sep)
        for c in self.children.values():
            c.deep_print(filter, sep = sep)


if __name__ != "main":
    path = pathlib.Path(__file__).parent / 'expressions.html'
    print(path)
    path2 = pathlib.Path(__file__).parent / 'simple_stmts.html'
    print(path2)
    path3 = pathlib.Path(__file__).parent / 'simple_stmts_xtd.html'
    print(path3)
    types = Xprs(path, path2, path3)
    #types = Xprs(path3)
    print('# Make the require and the provide')
    types.make_shallow()
    print('# Make the deep')
    types.make_deep()
    types.print_T3()
