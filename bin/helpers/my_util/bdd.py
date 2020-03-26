import re
from .path import *

import json

def loads(input):
    return json.loads(input.replace("'", '"'))

# re to parse the 
re_addDep = re.compile(r"""^(?:eYo|goog)\.addDependency\(
    (?P<file_name>'[^']+'),\s+
    (?P<provided>\[[^\]]*\])\s*,\s+
    (?P<required>\[[^\]]*\])\s*,\s+
    (?P<options>\{[^\}]*\})\s*
    \)\s*;?\s*$""", re.X)


# Dependencies data base
class BDD:
    class Dep:
        def __init__(self, ddb, file_name, provided, required, options):
            self.ddb = ddb
            self.file_name = file_name
            self.provided = provided
            self.required = required
            self.options = options
            self.done = False
            self.required_cumul = []
            self.required_delta = []
            self.required_delta_ = None

        def __str__(self):
            ra = [self.file_name + ':\n  provided:']
            if len(self.provided) < 10:
                ra = ra + ['    ' + x for x in self.provided]
            else:
                ra = ra + ['    …']
            if len(self.required_delta):
                ra = ra + ['  deltas:']
                i = 0
                for delta in self.required_delta:
                    ra = ra + ['    ' + str(i) + ':']
                    ra = ra + ['      ' + x for x in delta]
                    i = i + 1
                ra = ra + ['  cumuls:']
                i = 0
                for cumul in self.required_cumul:
                    ra = ra + ['    ' + str(i) + ':']
                    ra = ra + ['      ' + x for x in cumul]
                    i = i + 1
            else:
                ra = ra + ['  required:']
                if len(self.required) < 20:
                    ra = ra + ['    ' + x for x in self.required]
                else:
                    ra = ra + ['    …']
                if len(self.options):
                    ra = ra + ['  options:']
                    if len(self.options) < 10:
                        ra = ra + ['    ' + x for x in self.options]
                    else:
                        ra = ra + ['    …']
            return '\n'.join(ra)

    deps = []
    by_file_name = {}
    by_provide = {}
    missing = set()

    def __init__(self, *args, verbose=False):
        for path in args:
            with path.open('r', encoding='utf-8') as f:
                for line in f.readlines():
                    m = re_addDep.match(line)
                    if m:
                        file_name = loads(m.group('file_name'))
                        provided = loads(m.group('provided'))
                        required = loads(m.group('required'))
                        options = loads(m.group('options'))
                        for p in provided:
                            if p in required:
                                required.remove(p)
                        dep = BDD.Dep(self, file_name, provided, required, options)
                        self.deps.append(dep)
                        assert self.by_file_name.get(file_name) is None, 'Same file_name appears twice at least ' + file_name
                        self.by_file_name[file_name] = dep
                        for p in provided:
                          if self.by_provide.get(p) is dep:
                            continue
                          else:
                            assert self.by_provide.get(p) is None, 'Same provide appears twice at least ' + p + ', ' + path.as_posix()
                            self.by_provide[p] = dep
                          if p == 'eYo.Dnd.Mngr':
                            print('YOUPI')
                    elif verbose:
                      print('Ignored:', line.rstrip())
        self.deps.sort(key = lambda x: ' ' + x.file_name if not x.file_name.startswith('src/lib/eyo') else x.file_name)

    def getDep(self, provide):
        """
        The provide -> dep mapping is not one to one.
        Care is taken to manage the redundancy.
        """
        if provide in self.by_provide:
            return self.by_provide[provide]
        self.missing.add(provide)

    def __getitem__(self, i):
        return self.getDep(i)

    def getDepWithFileName(self, file_name):
        return self.by_file_name[file_name]

    def __str__(self):
        return '\n'.join(map(str, [x for x in self.deps if x.file_name.startswith('src/lib/eyo')]))

def getRQR(p):
    RQR = []
    with p.open('r', encoding='utf-8') as f:
        RQR = [line.rstrip() for line in f.readlines()]
    return RQR

