"""Create a list of deps from a list of requirements
Each line of the file_name named 'required.txt' is what is put in goog.require('blablabla')
"""

from .path import *
from .bdd import *

from pathlib import Path

def sort_deps(bdd, verbose):

  if len(bdd.missing):
    print(*bdd.missing, sep='\n')
    raise Exception('Missing providers')

  if verbose:
    print("""
Actual dependencies:
====================""")
    print(bdd)

  """
  A resolved dependency has either
  * no requirements
  * resolved requirements
  Resolved dependencies are recognized because they have a not None level.
  """
  todo = list(bdd.deps)
  for d in todo:
    d.required_to_resolve = set(d.required)
  
  again = []
  max_level = 0
  while True:
    before = len(todo)
    while len(todo):
      d = todo.pop()
      for r in list(d.required_to_resolve):
        dd = bdd[r]
        if dd.level is None:
          # this requirement is not resolved, break
          again.append(d)
          break
        # the requirement is resolved
        if dd.level >= d.level_min:
          d.level_min = dd.level + 1
        d.required_to_resolve.remove(r)
        for rr in dd.required_deep:
          d.required_deep_append(rr)
        d.required_deep_append(r)
      else:
        # all the requirements are resolved
        d.level = d.level_min
        if d.level > max_level: max_level = d.level
    # todo is void
    if len(again) < before:
      again, todo = todo, again
    elif len(again):
      print(*again, sep='\n')
      raise Exception('Unresolved dependencies')
    else:
      break
  print(bdd['eYo'])
  print(*bdd['eYo'].required_deep, sep='\n')
  print(bdd['eYo.c9r'])
  print(*bdd['eYo.c9r'].required_deep, sep='\n')
  exit(-1)
  todo_required = []
  with path_required.open('r', encoding='utf-8') as f:
    todo_required = [line.rstrip() for line in f.readlines()]

  by_level = {k:[] for k in range(max_level+1)}
  for r in todo_required:
    d = bdd[r]
    if d:
      by_level[d.level].append(d)
    else:
      raise Exception(f'Unknown requirement: {r}')
  
  sorted_deps = []
  for v in by_level.values():
    for vv in sorted(map(lambda d: d.file_name, v)):
      sorted_deps.append(vv)

  bdd.sorted_deps = sorted_deps
  return bdd.sorted_deps

'''
  todo_required2 = []
  with path_required.open('r', encoding='utf-8') as f:
    todo_required2 = [line.rstrip() for line in f.readlines()]
  
  todo_required = set(todo_required2)

  # todo_required is the set of all the required symbols: 'eYo', 'eYo.do', 'eYo.c9r', ... and some goog symbols until they are replaced.
  # todo_required contains a list of all the keys required by any object.

  done = set()
  assert 'eYo.flyout.View' in todo_required, 'FAILURE (todo_required)'
  #

  while len(todo_required):
    # get an element from todo_required and move it to done
    r = todo_required.pop()
    done.add(r)
    # get the dep record
    dep = bdd[r]
    if dep is None: continue
    # mark it as done
    dep.done = True
    # for each requirement, which is not already done, add it to the todo_required list
    for r in dep.required:
      provided = bdd[r]
      if provided is None:
        print('***', r, dep.file_name)
      elif not provided.done:
        todo_required.add(r)

  # Actually, done contains all the keys provided by edython
  # but it actually contains only some of the goog keys.
  assert 'eYo.flyout.View' in done, 'FAILURE (done)'
  # now order the deps
  # we start with objects with no requirements at all
  # we remove them from the list of all the other requirements
  control_before = len(done)
  # prepare the deps by setting the `done` attribute to false.
  for r in done:
    dep = bdd[r]
    dep.required_ = set(dep.required)
    dep.done = False
  sorted_deps = []
  if verbose:
    print('Managing', len(done), 'deps')
  while len(done):
    remove = set()
    for r in done:
      dep = bdd[r]
      if len(dep.required_) == 0:
        assert r in dep.provided, 'FAILURE (provided)'
        for p in dep.provided:
          remove.add(p)
    if len(remove):
      sorted_deps.extend(sorted(remove))
      done -= remove
      for r in done:
        dep = bdd[r]
        dep.required_ -= remove
    else:
      break
  if len(done):
    # finding circular deps
    # prepare
    for r in done: bdd[r].done = False
    for r in done:
      dep = bdd[r]
      if not dep.done:
        dep.required_cumul.append(set(dep.required_))
        dep.required_delta.append(dep.required_cumul[-1])
        dep.done = True
    for r in done:
      assert len(bdd[r].required_cumul)
    for i in range(len(done)):
      for r in done:
        dep = bdd[r]
        dep.done = False
      for r in done:
        dep = bdd[r]
        if dep.done:
          continue
        dep.done = True
        cumul = set(dep.required_cumul[-1])
        delta = set()
        for r in dep.required_delta[-1]:
          p = bdd[r]
          for q in p.required_:
            if not q in cumul:
              delta = delta.union({q})
              cumul = cumul.union({q})
        if len(delta) > 0:
          dep.required_cumul.append(cumul)
          dep.required_delta.append(delta)
    for r in done:
      dep = bdd[r]
      dep.required_delta_ = list(dep.required_delta)
    more = True
    for r in done:
      dep = bdd[r]
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
    #print(*map(lambda r: bdd[r], done), sep = '\n')
    assert False, 'Circular deps ?'
      
  if verbose:
    print("""
1)
==""", *sorted([x for x in sorted_deps if x.startswith('eYo')]), ".", sep = '\n')
  
  assert 'eYo.flyout.View' in sorted_deps, 'FAILURE (sorted)'
  final = []
  for r in sorted_deps:
    print(r)
    dep = bdd[r]
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
  bdd.sorted_deps = final
'''
