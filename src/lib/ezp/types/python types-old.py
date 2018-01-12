import os
import pathlib
import re

class Category:
    def __init__(self, name):
        self.name = name
        self.types = {}
    def __repr__(self):
        return repr(self.__dict__)
    def append(self, type):
        self.types[type.name] = type
        return self
class Categories:
    def __init__(self):
        self.categories = {}
    def __repr__(self):
        return repr(self.__dict__)
    def get(self, name):
        if not name in self.categories:
            self.categories[name] = Category(name)
        return self.categories[name]
class Type:
    def __init__(self, n, name, definition, category):
        self.n = n
        self.name = name
        self.definition = definition
        self.category = category
        category.append(self)
        self.count = 0
        self.children = set()
        self.parents = set()
        self.level = 0

    def __repr__(self):
        return repr(self.__dict__)
    def toCSV(self, key):
        return ';'.join([self.category.name, str(self.level), self.name, '::=',
                         self.definition])+';'+';'.join(t.name for t in key(self))

class Types:
    def __init__(self, path):
        self.categories = Categories()
        self.all = {}
        self.path = path
        with path.open() as f:
            l = 0
            for line in f.readlines():
                m = re.match('^(6.*|\s*#)$', line)
                if m:
                    if m.group(1)[0] == '6': category = m.group(1)
                else:
                    m = re.match(r"\b(\S*)\s*::=\s*(.*)", line)
                    if m:
                        t = Type(l, m.group(1), m.group(2), self.categories.get(category))
                        self.all[t.name] = t
                l += 1
    def __repr__(self):
        return repr(self.__dict__)
    def make_tree(self):
        for t in self.all.values():
            name = r".*\b" + t.name + r"\b"
            for tt in self.all.values():
                m = re.match(name, tt.definition)
                if m:
                    tt.children.add(t)
                    t.parents.add(tt)
    def make_all_tree(self):
        for t in self.all.values():
            t.allChildren = set(t.children)
            t.allParents = set(t.parents)
            t.level = 0
        once_more = True
        while once_more:
            once_more = False
            for t in self.all.values():
                more = set()
                for o in t.allParents:
                    for oo in o.allParents:
                        if not oo in t.allParents:
                            more.add(oo)
                            once_more = True
                if once_more:
                    t.allParents |= more
                else:
                    more = set()
                    for o in t.allChildren:
                        for oo in o.allChildren:
                            if not oo in t.allChildren:
                                more.add(oo)
                                once_more = True
                    if once_more:
                        t.allChildren |= more
    def make_recursive(self):
        self.recursive = []
        self.other = []
        for t in self.all.values():
            t.recursive = t in t.allParents
            t.root = not t.recursive
            if t.recursive:
                self.recursive.append(t)
            else:
                self.other.append(t)
    def make_root_tree(self):
        for t in self.all.values():
            t.rootChildren = [tt for tt in t.children if tt.root]
            t.allRootChildren = set(t.rootChildren)
        once_more = True
        while once_more:
            once_more = False
            for t in self.all.values():
                more = set()
                for tt in t.allRootChildren:
                    for ttt in tt.allRootChildren:
                        if not ttt in t.allRootChildren:
                            more.add(ttt)
                            once_more = True
                if once_more:
                    t.allRootChildren |= more
    def make_root_level(self):
        once_more = True
        while once_more:
            once_more = False
            for t in self.all.values():
                for tt in t.rootChildren:
                    if t.level <= tt.level:
                        once_more = True
                        t.level = tt.level + 1
    def make_level_once(self, limit):
        for t in self.all.values():
            if t.level: t.root = True
        self.make_root_tree()
        once_more = False
        if limit>0:
            for t in self.all.values():
                if not t.root:
                    for tt in t.children:
                        if tt.root and t.level <= tt.level:
                            once_more = True
                            t.level = tt.level + 1
        return once_more
    def make_level(self):
        limit = max(len(self.all),0)
        while self.make_level_once(limit):
            limit -= 1
            pass
    def make(self):
        self.make_tree()
        self.make_all_tree()
        self.make_recursive()
        self.make_root_tree()
        self.make_root_level()
        self.make_level()
    def print(self, where, key):
        path = self.path.parent / where
        with path.open('w') as f:
            l = list(self.all.values())
            i = -1
            while i<len(l)-1:
                i += 1
                if len(l[i].every_require):
                    self.commonNode = l[i].every_require
                    break
            while i<len(l)-1:
                i += 1
                if len(l[i].every_require):
                    self.commonNode &= l[i].every_require
            for t in sorted(self.all.values(), key = lambda x: (x.category.name, x.level, x.name)):
                k = key(t)
                if len(k): print(k, file=f)
            for i in self.commonNode:
                print(i.name)
    def make_require(self):
        for t in self.all.values():
            t.require = set()
            cs = re.compile('\s*\|\s*').split(t.definition)
            for c in cs:
                if re.match(r'^[\w|_]+$', c, re.UNICODE):
                    try:
                        t.require.add(self.all[c])
                    except:
                        pass
                else:
                    t.require = set()
                    break
            t.every_require = set(t.require)
        once_more = True
        while once_more:
            once_more = False
            for t in self.all.values():
                more = set()
                for tt in t.every_require:
                    for ttt in tt.every_require:
                        if not ttt in t.every_require:
                            more.add(ttt)
                            once_more = True
                if once_more:
                    t.every_require |= more
        for t in self.all.values():
            more = set()
            for tt in t.every_require:
                for ttt in tt.every_require:
                    more.add(tt)
                    break
            t.every_require -= more
    def make_provide(self):
        for t in self.all.values():
            t.every_provide = set()
        for t in self.all.values():
            for tt in t.every_require:
                tt.every_provide.add(t)

    def print_provide(self):
        for t in self.all.values():
            if len(t.every_provide) == 1:
                print(t.name, ', '.join(tt.name for tt in t.every_provide), sep = '->')
        for t in self.all.values():
            if len(t.every_provide) > 1:
                print(t.name, ', '.join(tt.name for tt in t.every_provide), sep='->')
    def make_require_tree(self):
        self.require_root = Node()
        for t in self.all.values():
            c = self.require_root
            for a in sorted(t.every_require, key = lambda x: (-len(x.every_provide), x.name)):
                c = c.child(a)
            c.add_node(t)
    def print_require_tree(self):
        self.require_root.deep_print()
    def make_provide_tree(self):
        self.provide_root = Node()
        for t in self.all.values():
            c = self.provide_root
            for a in sorted(t.every_provide, key = lambda x: (-len(x.every_provide), x.name)):
                c = c.child(a)
            c.add_node(t)
    def print_provide_tree(self, filter = None):
        self.provide_root.deep_print(filter=filter, sep='<-')

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
        if (not filter or filter(self)) and len(self.nodes):
            print(self.path, ', '.join(l.name for l in self.nodes), sep = sep)
        for c in self.children.values():
            c.deep_print(filter, sep = sep)

if __name__ == "main":
    path = pathlib.Path(os.getcwd()).parent.parent.parent.parent / 'doc' / 'Python 3 types.txt'
    print(path)
    types = Types(path)
    print('Make the tree')
    types.make_tree()
    print('Make the deep tree')
    types.make_all_tree()
    print('Tag recursive nodes')
    types.make_recursive()
    print('Make root tree')
    types.make_root_tree()
    print('Make root level')
    types.make_root_level()
    print('Make other level')
    types.make_level()
    print('print')
    types.print(lambda x: x.toCSV(lambda y: y.parents))
else:
    path = pathlib.Path(os.getcwd()).parent.parent.parent.parent / 'doc' / 'Python 3 types.txt'
    print(path)
    types = Types(path)
    print('Make the require')
    types.make_require()
    print('Make the provide')
    types.make_provide()
    print('Print the provide')
    types.print_provide()
    print('Make the provide tree')
    types.make_provide_tree()
    print('Make the require tree')
    types.make_require_tree()
    print('print the require tree')
    

