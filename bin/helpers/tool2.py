"""Create a list of dependencies from a list of requirements
Each line of the file named 'required.txt' is what is put in goog.require('blablabla')
"""
import pathlib
import re
import json

re_addDep = re.compile(r"^goog.addDependency\((?P<file>'[^']+'), (?P<provided>\[[^\]]*\]), (?P<required>\[[^\]]*\]), (?P<options>\{[^\}]*\})\);?$")

def loads(input):
    print(input)
    return json.loads(input.replace("'", '"'))

class Provide:
    def __init__(self, provide, file):
        self.provide = provide
        self.file = file

class Require:
    def __init__(self, file, require):
        self.file = file
        self.require = require

class DB:
    class Dep:
        def __init__(self, db, file, provided, required, options):
            self.db = db
            self.file = file
            self.provided = provided
            self.required = required
            self.options = options
            self.done = False

    deps = []
    by_file = {}
    by_provide = {}

    def __init__(self, *args):
        for p in args:
            with p.open() as f:
                for line in f.readlines():
                    m = re_addDep.match(line)
                    if m:
                        file = loads(m.group('file'))
                        provided = loads(m.group('provided'))
                        required = loads(m.group('required'))
                        options = loads(m.group('options'))
                        for p in provided:
                            if p in required:
                                required.remove(p)
                        dep = DB.Dep(self, file, provided, required, options)
                        self.deps.append(dep)
                        assert self.by_file.get(file) is None, 'Same file appears twice at least '+file
                        self.by_file[file] = dep
                        for p in provided:
                            assert self.by_provide.get(p) is None, 'Same provide appears twice at least ' + p
                            self.by_provide[p] = dep

    def getDep(self, provide):
        return self.by_provide[provide]

    def getDepWithFile(self, file):
        return self.by_file[file]

def getRQR(p):
    RQR = []
    with p.open() as f:
        RQR = [line.rstrip() for line in f.readlines()]
    return RQR


if __name__ != "main":
#    path0 = pathlib.Path(__file__).parent / 'lexical.html'
#    print(path0)
#    path00 = pathlib.Path(__file__).parent / 'lexical_xtd.html'
#    print(path00)
    print(pathlib.Path(__file__).resolve())
    pathRoot = pathlib.Path(__file__).resolve().parent.parent.parent
    pathBuild = pathRoot / 'build' / 'helpers'
    print(pathBuild)
    pathBuild.mkdir(parents=True, exist_ok=True)
    #deps contains a list of alll the available key found from the sources.
    deps = DB(pathRoot / 'src' / 'lib' / 'closure-library' / 'closure' / 'goog' / 'deps.js',
              pathBuild / 'blockly_deps.js',
              pathBuild / 'eyo_deps.js')

    todo1 = getRQR(pathBuild / 'blockly_required.txt')
    todo2 = getRQR(pathBuild / 'eyo_required.txt')
    todo1.extend(todo2)
    todo = set(todo1)
    # todo contains a list of all the required keys.
    done = set()
    assert 'eYo.Flyout' in todo, 'FAILURE'
    #
    while len(todo):
        # get an element from todo and move it to done
        r = todo.pop()
        done.add(r)
        # get the dependency record
        dep = deps.getDep(r)
        # mark it as done
        dep.done = True
        # for each requirement, which is not already done, add it to the todo list
        for r in dep.required:
            dep = deps.getDep(r)
            if not dep.done:
                todo.add(r)
    # Actually, done contains all the keys provided by both edython and blockly
    # but it actually contains only some of the goog keys.
    assert 'eYo.Flyout' in done, 'FAILURE'
    # now order the deps
    # we start with objects with no requirements
    # we remove them from the list of all the other requirements
    control_before = len(done)
    sorted_deps = []
    for r in done:
        dep = deps.getDep(r)
        dep.required_ = set(dep.required)
        dep.done = False
    while len(done):
        remove = set()
        for r in done:
            dep = deps.getDep(r)
            if len(dep.required_) == 0:
                assert r in dep.provided, 'FAILURE'
                for p in dep.provided:
                    remove.add(p)
        if len(remove):
            sorted_deps.extend(sorted(remove))
            done -= remove
            for r in done:
                dep = deps.getDep(r)
                dep.required_ -= remove
        else:
            break
    for r in done:
        print(r, len(deps.getDep(r).required_))
        dep = deps.getDep(r)
        if len(dep.required_):
            for p in dep.required_:
                print('->',p, p in sorted_deps)
    assert 'eYo.Flyout' in sorted_deps, 'FAILURE'
    i = 0
    for r in sorted_deps:
        print(i, r)
        i += 1
    for r in done:
        print(r)
        dep = deps.getDep(r)
        for rr in dep.required_:
            print('->', rr)
    final = []
    for r in sorted_deps:
        dep = deps.getDep(r)
        if not dep.done:
            final.append(dep.file)
            print(dep.file)
            dep.done = True
    control_middle = len(final)
    final_g = ['src/lib/closure-library/closure/goog/' + r for r in final if not r.startswith('src/lib/')]
    final_B = [r for r in final if r.startswith('src/lib/b')]
    final_e = [r for r in final if r.startswith('src/lib/e')]
    print(len(final), len(final_g), len(final_B), len(final_e))
    final_g.extend(final_B)
    final_g.extend(final_e)
    final = final_g
    control_after = len(final)
    print(control_before, control_middle, control_after, len(done))
    if control_after > control_before:
        raise Exception('ERROR')
    out_lines = []
    goog = 'closure-library/closure/goog/'
    blockly = 'blockly/'
    library = blockly
    for r in final:
        print(r)
        out_lines.append(
            '--js "' + r + '" \\\n')
    p_out = pathBuild / 'deps-buid.txt'
    print(p_out)
    p_out.write_text(''.join(out_lines))
    out_lines = []
    for r in final:
        print(r)
        out_lines.append(
            '      <script src="/'+pathlib.Path(r).relative_to('src').as_posix()+'"></script>\n')

    p_out = pathBuild / 'deps-vue.txt'
    print(p_out)
    p_out.write_text(''.join(out_lines))
    out_lines = []
    for r in final:
        out_lines.append(
            '      <script src="../../src/' + pathlib.Path(r).relative_to('src').as_posix() + '"></script>\n')

    p_out = pathBuild / 'deps-wev-dev.txt'
    print(p_out)
    p_out.write_text(''.join(out_lines))
