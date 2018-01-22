import pathlib
import re
import datetime
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
        name is the expression name: proper_slice, m_expr, and_test...
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

    def get_short_definition(self):
        definition = self.definition
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
        return definition

    def __repr__(self):
        return repr(self.__dict__)

class Xprs:
    re0 = re.compile(r"\b(\S*?)(_stmt|_statement)?\s*::=\s*(.*)")
    re1 = re.compile(r'\s*\|\s*')
    re2 = re.compile(r'^\s*([a-z_]+)\s*$')
    re3 = re.compile(r'\s*([a-z_]+)\s*\|\s*(.*)\s*$')
    re4 = re.compile(r'^\s*"(\*+)"\s*([a-z_]+)\s*$')

    def __init__(self, *paths):
        self.all = {}
        self.n = 0
        for path in paths:
            self.read(path)
            self.make_concrete()

    def read(self, path):
        print('Parsing:', path)
        with path.open() as f:
            data = f.read()
            parser = MyHTMLParser()
            parser.feed(data)
            for x in parser.get_pre_pos_data():
                data = x[0].replace('\n ','')
                data = re.sub(r' +', ' ', data)
                for l in data.splitlines():
                    m = Xprs.re0.match(l)
                    if m and m.group(1) != 'name' and not m.group(2):
                        nn = self.n
                        if m.group(1) in self.all:
                            nn = self.all[m.group(1)].n
                        t = Xpr(nn, m.group(1), m.group(3))
                        self.all[t.name] = t
                        self.n += 1

    def make_concrete(self):
        more = {}
        for t in self:
            definition = t.definition
            cs = Xprs.re1.split(definition)[1:]
            if len(cs) > 0:
                cs = [x for x in cs if Xprs.re2.match(x)]
                if len(cs) == 0:
                    m = Xprs.re3.match(t.definition)
                    if m:
                        def_alias = m.group(1)
                        def_concrete = m.group(2)
                        def_guessed = '{} | {}'.format(def_alias, def_concrete)
                        if def_guessed == t.definition:
                            mm = Xprs.re4.match(def_concrete)
                            if mm:
                                if len(mm.group(1)) == 1:
                                    name_concrete = 'starred_' + mm.group(2)
                                elif len(mm.group(1)) == 2:
                                    name_concrete = 'double_starred_' + mm.group(2)
                                elif len(mm.group(1)) == 3:
                                    name_concrete = 'triple_starred_' + mm.group(2)
                                else:
                                    name_concrete = 'multi_starred_' + mm.group(2)
                            else:
                                name_concrete = t.name + '_concrete'
                            def_new = '{} | {}'.format(def_alias, name_concrete)
                            t.definition = def_new
                            tt = Xpr(t.n, name_concrete, def_concrete)
                            more[tt.name] = tt
        self.all.update(more)

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
            definition = t.get_short_definition()
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

    def remove_wrappers(self):
        for wrapper in [t for t in self if t.wrapper]:
            for t in self:
                try:
                    t.deep_require.remove(wrapper)
                except: pass
                try:
                    t.deep_provide.remove(wrapper)
                except: pass

    def get_T3_data(self, **kwargs):
        l = []
        Ts = sorted(self.all.values(), key=lambda t: (t.n, t.name))
        i = 0
        for t in Ts:
            t.short_name = str(i)
            i += 1
        l.append("""/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Constants for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name ezP.T3
 * @namespace
 **/

goog.provide('ezP.T3')

goog.require('ezP')

ezP.T3 = {""")
        for t in Ts:
            l.append('  {:<25} /*   ::= {:<50} */ : "{}",'.format(t.name, t.definition, t.name if kwargs['debug'] else t.short_name))
        l.append('}\n')
        l.append('ezP.T3.Require = {')
        for t in Ts:
            if len(t.deep_require):
                l.append('  {}: ['.format(t.name))
                for tt in sorted((tt for tt in t.deep_require), key=lambda t: (t.n, t.name)):
                    l.append('    ezP.T3.{},'.format(tt.name))
                l.append('  ],')
        l.append('}\n')
        l.append('ezP.T3.Provide = {')
        for t in Ts:
            if len(t.deep_provide):
                l.append('  {}: ['.format(t.name))
                for tt in sorted((tt for tt in t.deep_provide), key=lambda t: (t.n, t.name)):
                    l.append('    ezP.T3.{},'.format(tt.name))
                l.append('  ],')
        l.append('}\n')
        return '\n'.join(l)

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
    path1 = pathlib.Path(__file__).parent / 'expressions.html'
    print(path1)
    path2 = pathlib.Path(__file__).parent / 'expressions_xtd.html'
    print(path2)
    path3 = pathlib.Path(__file__).parent / 'simple_stmts.html'
    print(path3)
    path4 = pathlib.Path(__file__).parent / 'simple_stmts_xtd.html'
    print(path4)
    # do not change the order of the path arguments
    types = Xprs(path1, path2, path3, path4)
    #types = Xprs(path3)
    print('# Make the require and the provide')
    types.make_shallow()
    print('# Make the deep')
    types.make_deep()
    print('# remove the wrappers')
    types.remove_wrappers()
    print(types.get_T3_data(debug = True))
    out = pathlib.Path(__file__).parent / 'T3.js'
    out.write_text('// This file was generated by "python types.py" on {}\n\n'.format(datetime.datetime.utcnow())+types.get_T3_data(debug = True))
