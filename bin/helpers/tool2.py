"""Create a list of deps from a list of requirements
Each line of the file_name named 'required.txt' is what is put in goog.require('blablabla')
"""
import argparse

parser = argparse.ArgumentParser(description='Tool.')

parser.add_argument('--verbose', dest='verbose', action='store_const',
                    const=True, default=False,
                    help='Be verbose')

global_args = parser.parse_args()

from my_util import *

from pathlib import Path

if __name__ != "main":
    print('Step 2:')
    print('=======')
    print('Resolve deps.')
    #deps contains a list of alll the available key found from the sources.
    ddb = BDD(path_goog_deps, path_eyo_deps, verbose=global_args.verbose)
    if global_args.verbose:
        print("""
Dependencies:
=============""")
        print(ddb)
    
    todo_required2 = getRQR(path_required)
    todo_required = set(todo_required2)
    if global_args.verbose:
        print("""
Required:
=========""")
        print(*sorted([x for x in todo_required if x.startswith('eYo')]), sep = '\n')
    # todo_required contains a list of all the required keys.
    done = set()
    assert 'eYo.flyout.View' in todo_required, 'FAILURE (todo_required)'
    #
    while len(todo_required):
        # get an element from todo_required and move it to done
        r = todo_required.pop()
        done.add(r)
        # get the dep record
        dep = ddb[r]
        if dep is None: continue
        # mark it as done
        dep.done = True
        # for each requirement, which is not already done, add it to the todo_required list
        for r in dep.required:
          provided = ddb[r]
          if provided is None:
              print('***', r, dep.file_name)
          elif not provided.done:
              todo_required.add(r)
    if len(ddb.missing):
      print(*ddb.missing, sep='\n')
      raise Exception('Missing providers')
    if global_args.verbose:
        print("""
Cascaded required:
==================""")
        print(*sorted([x for x in done if x.startswith('eYo')]), sep = '\n')

    # Actually, done contains all the keys provided by edython
    # but it actually contains only some of the goog keys.
    assert 'eYo.flyout.View' in done, 'FAILURE (done)'
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
    
    assert 'eYo.flyout.View' in sorted_deps, 'FAILURE (sorted)'
    final = []
    for r in sorted_deps:
        dep = ddb[r]
        if not dep.done:
            final.append(dep.file_name)
            dep.done = True
    control_middle = len(final)
    final_goog = ['src/lib/closure-library/closure/goog/' + r for r in final if not r.startswith('src/lib/')]
    final_eYo = [r for r in final if r.startswith('src/lib/e')]
    final_goog.extend(final_eYo)
    final = final_goog
    control_after = len(final)
    if control_after > control_before:
        print(control_before, control_middle, control_after, len(done))
        raise Exception('ERROR')
    
    def export(p_out, mapper):
        print('Exporting to', p_out)
        p_out.write_text(''.join(map(mapper, final)))
   
    export(
      path_deps,
      lambda r: f'''src/{Path(r).relative_to('src').as_posix()}\n'''
    )
    export(
      path_deps_test,
      lambda r: f'''src/{Path(r).with_suffix('.test.js').relative_to('src').as_posix()}\n'''
    )
    export(
      path_deps_build,
      lambda r: f'--js "{r}" \\\n'
    )
    export(
      path_deps_vue,
      lambda r: f'''      <script src="{Path(r).relative_to('src').as_posix()}"></script>\n'''
    )
    export(
      path_deps_web_dev,
      lambda r: f'''      <script src="../../src/{Path(r).relative_to('src').as_posix()}"></script>\n'''
    )
    export(
      path_deps_web_test,
      lambda r: f'''      <script src="PATH_ROOT/src/{Path(r).relative_to('src').as_posix()}"></script>\n'''
    )
    export(
      path_deps_test_import,
      lambda r: f'''import_file("src/{Path(r).relative_to('src').as_posix()}")\n'''
    )
    
