"""Create a list of deps from a list of requirements
Each line of the file_name named 'required.txt' is what is put in goog.require('blablabla')
"""
from pathlib import Path
import re
import json
import argparse

parser = argparse.ArgumentParser(description='Tool.')

parser.add_argument('--verbose', dest='verbose', action='store_const',
                    const=True, default=False,
                    help='Be verbose')

global_args = parser.parse_args()

# re to parse the 
re_addDep = re.compile(r"""^(?:eYo|goog)\.addDependency\(
    (?P<file_name>'[^']+'),\s+
    (?P<provided>\[[^\]]*\])\s*,\s+
    (?P<required>\[[^\]]*\])\s*,\s+
    (?P<options>\{[^\}]*\})\s*
    \)\s*;?\s*$""", re.X)

def loads(input):
    return json.loads(input.replace("'", '"'))

# Dependencies data base
class DDB:
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

    def __init__(self, *args):
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
                        dep = DDB.Dep(self, file_name, provided, required, options)
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
                    elif global_args.verbose:
                      print('Ignored:', line.rstrip())
        self.deps.sort(key = lambda x: ' ' + x.file_name if not x.file_name.startswith('src/lib/eyo') else x.file_name)

    def getDep(self, provide):
        """
        The provide -> dep mapping is not one to one.
        Care is taken to manage the redundancy.
        """
        if provide in self.by_provide:
            return self.by_provide[provide]
        raise Exception('No provider for', provide)

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

if __name__ != "main":
#    path0 = Path(__file__).parent / 'lexical.html'
#    print(path0)
#    path00 = Path(__file__).parent / 'lexical_xtd.html'
#    print(path00)
    print('Step 2:')
    print('=======')
    print('Resolve deps.')
    print(Path(__file__).resolve())
    pathRoot = Path(__file__).resolve().parent.parent.parent
    pathBuild = pathRoot / 'build' / 'helpers'
    print(pathBuild)
    pathBuild.mkdir(parents=True, exist_ok=True)
    #deps contains a list of alll the available key found from the sources.
    ddb = DDB(pathRoot / 'src' / 'lib' / 'closure-library' / 'closure' / 'goog' / 'deps.js',
              pathBuild / 'blockly_deps.js',
              pathBuild / 'eyo_deps.js')
    if global_args.verbose:
        print("""
Dependencies:
=============""")
        print(ddb)
    
    todo_required1 = getRQR(pathBuild / 'blockly_required.txt')
    todo_required2 = getRQR(pathBuild / 'eyo_required.txt')
    todo_required1.extend(todo_required2)
    todo_required = set(todo_required1)
    if global_args.verbose:
        print("""
Required:
=========""")
        print(*sorted([x for x in todo_required if x.startswith('eYo')]), sep = '\n')
    # todo_required contains a list of all the required keys.
    done = set()
    assert 'eYo.Flyout' in todo_required, 'FAILURE (todo_required)'
    #
    while len(todo_required):
        # get an element from todo_required and move it to done
        r = todo_required.pop()
        done.add(r)
        # get the dep record
        dep = ddb[r]
        # mark it as done
        dep.done = True
        # for each requirement, which is not already done, add it to the todo_required list
        for r in dep.required:
            dep = ddb[r]
            if not dep.done:
                todo_required.add(r)
    if global_args.verbose:
        print("""
Cascaded required:
==================""")
        print(*sorted([x for x in done if x.startswith('eYo')]), sep = '\n')

    # Actually, done contains all the keys provided by both edython and blockly
    # but it actually contains only some of the goog keys.
    assert 'eYo.Flyout' in done, 'FAILURE (done)'
    # now order the deps
    # we start with objects with no requirements at all
    # we remove them from the list of all the other requirements
    control_before = len(done)
    # prepare the deps by setting the `done` attribute to false.
    for r in done:
        dep = ddb[r]
        dep.required_ = set(dep.required)
        dep.done = False
    sorted_deps = []
    if global_args.verbose:
        print('Managing', len(done), 'deps')
    while len(done):
        remove = set()
        for r in done:
            dep = ddb[r]
            if len(dep.required_) == 0:
                assert r in dep.provided, 'FAILURE (provided)'
                for p in dep.provided:
                    remove.add(p)
        if len(remove):
            sorted_deps.extend(sorted(remove))
            done -= remove
            for r in done:
                dep = ddb[r]
                dep.required_ -= remove
        else:
            break
    if len(done):
        # finding circular deps
        # prepare
        for r in done:
            dep = ddb[r]
            dep.done = False
        for r in done:
            dep = ddb[r]
            if not dep.done:
                dep.required_cumul.append(set(dep.required_))
                dep.required_delta.append(dep.required_cumul[-1])
                dep.done = True
        for r in done:
            assert len(ddb[r].required_cumul)
        for i in range(len(done)):
            for r in done:
                dep = ddb[r]
                dep.done = False
            for r in done:
                dep = ddb[r]
                if dep.done:
                    continue
                dep.done = True
                cumul = set(dep.required_cumul[-1])
                delta = set()
                for r in dep.required_delta[-1]:
                    p = ddb[r]
                    for q in p.required_:
                        if not q in cumul:
                            delta = delta.union({q})
                            cumul = cumul.union({q})
                if len(delta) > 0:
                    dep.required_cumul.append(cumul)
                    dep.required_delta.append(delta)
        for r in done:
            dep = ddb[r]
            dep.required_delta_ = list(dep.required_delta)
        more = True
        for r in done:
            dep = ddb[r]
            if more:
                while len(dep.required_delta_):
                    delta = dep.required_delta_.pop()
                    if r in delta:
                        more = False
                        print("""! Circular dependency:
=====================""", r, sep = '\n')
                        while len(dep.required_delta_):
                            print(*dep.required_delta_.pop(), sep = ', ')
            else:
                break
        #print(*map(lambda r: ddb[r], done), sep = '\n')
        assert False, 'Circular deps ?'
        
    if global_args.verbose:
        print("""
1)
==""", *sorted([x for x in sorted_deps if x.startswith('eYo')]), sep = '\n')
    
    assert 'eYo.Flyout' in sorted_deps, 'FAILURE (sorted)'
    final = []
    for r in sorted_deps:
        dep = ddb[r]
        if not dep.done:
            final.append(dep.file_name)
            dep.done = True
    control_middle = len(final)
    final_goog = ['src/lib/closure-library/closure/goog/' + r for r in final if not r.startswith('src/lib/')]
    final_Blockly = [r for r in final if r.startswith('src/lib/b')]
    final_eYo = [r for r in final if r.startswith('src/lib/e')]
    final_goog.extend(final_Blockly)
    final_goog.extend(final_eYo)
    final = final_goog
    control_after = len(final)
    if control_after > control_before:
        print(control_before, control_middle, control_after, len(done))
        raise Exception('ERROR')
    
    def export(component, mapper):
        p_out = pathBuild / component
        print('Exporting to', p_out)
        p_out.write_text(''.join(map(mapper, final)))
   
    export(
      'deps-build.txt',
      lambda r: f'--js "{r}" \\\n'
    )
    export(
      'deps-vue.txt',
      lambda r: f'''      <script src="{Path(r).relative_to('src').as_posix()}"></script>\n'''
    )
    export(
      'deps-web-dev.txt',
      lambda r: f'''      <script src="../../src/{Path(r).relative_to('src').as_posix()}"></script>\n'''
    )
    export(
      'deps-web-test.txt',
      lambda r: f'''      <script src="PATH_ROOT/src/{Path(r).relative_to('src').as_posix()}"></script>\n'''
    )
    export(
      'deps-test-import.txt',
      lambda r: f'''import_file("src/{Path(r).relative_to('src').as_posix()}")\n'''
    )
    
