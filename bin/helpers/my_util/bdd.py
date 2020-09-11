"""
Create a database of dependencies.
"""
import re
from .path import *
from .dep import Dep
from .info import Info
from .isa import IsA

import json
from pathlib import Path

def loads(input):
    return json.loads(input.replace("'", '"'))

# re to parse the
re_addDep = re.compile(r"""^goog\.addDependency\(
    (?P<file_name>'[^']+'),\s+
    (?P<provided>\[[^\]]*\])\s*,\s+
    (?P<required>\[[^\]]*\])\s*,\s+
    (?P<options_unused>\{[^\}]*\})\s*
    \)\s*;?\s*$""", re.X)

class __:
  """
  Namespace to gather utility methods
  """
  @staticmethod
  def feed_eyo(bdd, verbose=False):
    files = [x for x in path_js.rglob('*')
      if x.is_file() and x.suffix == '.js'
      if not x.name.endswith('test.js')
      if not x.name.endswith('test.inline.js')
      if '/dev/' not in x.as_posix()]
    for fn in files:
      info = Info(fn)
      __.add_dep(bdd, True, fn.relative_to(path_js).as_posix(), info.provided, info.required, info.forwarded)

  @staticmethod
  def feed_goog(bdd, verbose=False):
    with path_goog_deps.open('r', encoding='utf-8') as f:
      for line in f.readlines():
        m = re_addDep.match(line)
        if m:
          fn = loads(m.group('file_name'))
          provided = loads(m.group('provided'))
          required = loads(m.group('required'))
          __.add_dep(bdd, False, fn, provided, required, [])
        elif verbose:
          print('Ignored:', line.rstrip())

  @staticmethod
  def add_dep(bdd, is_eyo, relative, provided, required, forwarded, is_complete=False):
    for r in provided:
      assert bdd.by_provide.get(r) is None, f'Same provide appears twice at least {r}, {is_eyo}, {relative}'

    dep = Dep(bdd, is_eyo, relative, provided, required, forwarded, is_complete)
    assert bdd.by_file_name.get(dep.file_name) is None, 'Same file_name appears twice at least ' + dep.file_name
    bdd.deps.append(dep)
    bdd.by_file_name[dep.file_name] = dep
    for r in provided:
      if bdd.by_provide.get(r) is dep:
        continue
      else:
        bdd.by_provide[r] = dep

  @staticmethod
  def clean(bdd):
    for key in ['required', 'forwarded']:
      for d in bdd.deps:
        ra = []
        deps: IsA('set of dependencies already required or forwarded') = set()
        for r in getattr(d, key):
          dd = bdd[r]
          if not dd in deps:
            deps.add(r)
            ra.append(r)
        setattr(d, key, ra)

  @staticmethod
  def complete_required(bdd):
    """
    Resolves file dependencies: if foo.js requires bar.js,
    which in turns requires bar.js, then foo.js requires both bar.js and bar.js.
    At the end, each dependency's required is the array of
    all the dependencies, as deep as cen be.
    """
    for d in bdd.deps:
      # for r in d.forwarded: bdd[r].required.add(r)
      d.__required_to_resolve: IsA('set of provide') = set(d.required)
      d.__required: IsA('set of provide') = set()
      d.__level_min = 0
    todo = list(bdd.deps)
    again: IsA(list, 'of deps') = []
    max_level = 0
    while True:
      before = len(todo)
      while len(todo):
        d = todo.pop()
        for r in list(d.__required_to_resolve):
          dd = bdd[r]
          if dd is None:
            print(f'Missing provider for: {r}')
            for dd in bdd.deps:
              if r in dd.required:
                print(f'Required by: {dd.file_name}')
            exit(-1)
          if dd.level is None:
            # this requirement is not resolved, break
            again.append(d)
            break
          # the requirement is resolved
          if dd.level >= d.__level_min:
            d.__level_min = dd.level + 1
          d.__required_to_resolve.remove(r)
          for rr in dd.__required:
            d.__required.add(rr)
          d.__required.add(r)
        else:
          # all the requirements are resolved
          d.level = d.__level_min
          if d.level > max_level: max_level = d.level
      # todo is void
      if len(again) < before:
        again, todo = todo, again
      elif len(again):
        print('****')
        for d in again:
          for r in d.__required_to_resolve:
            dd = bdd[r]
            if dd.level is None:
              print(d.file_name, '->', r)
        raise Exception('Unresolved dependencies')
      else:
        break
    by_level = {k:[] for k in range(max_level+1)}
    for d in bdd.deps:
      by_level[d.level].append(d)
    sorted_deps = []
    for v in by_level.values():
      v.sort()
      for d in v:
        d.n = len(sorted_deps)
        sorted_deps.append(d)
    bdd.deps = sorted_deps
    for d in bdd.deps:
      del d.__required_to_resolve
      d.provided = sorted(d.provided)
      required = set(bdd[x].file_name for x in d.__required)
      required = list(bdd.by_file_name[x].provided[0] for x in required)
      d.required = sorted(required, key=lambda x: bdd[x])
      del d.__required
      del d.__level_min

  @staticmethod
  def complete_forwarded(bdd):
    """
    A forward declaration is used when a two or more javascript files
    are interlaced. One is required while the other is forwarded.
    It is no good idea to multiply the forward declaration.
    """
    for d in bdd.deps:
      d.__required = set(bdd[r] for r in d.required)
      d.__already = set(d.__required)
      d.__already.add(d)
      d.__forwarded = set()
      d.__delta = set(bdd[r] for r in d.forwarded)
      for dd in d.__required:
        d.__delta.update(dd.__delta)
    for d in bdd.deps:
      d.__delta -= d.__already

    more = True
    while more:
      more = False
      for d in bdd.deps:
        if len(d.__delta):
          more = True
          d.__forwarded.update(d.__delta)
          delta = set()
          for dd in d.__delta:
            delta.update(dd.__required)
            delta.update(dd.__forwarded)
          delta -= d.__already
          d.__delta = delta
          d.__already.update(delta)

    for d in bdd.deps:
      del d.__delta
      del d.__already
      d.forwarded = (sorted(dd.provided)[0] for dd in sorted(d.__forwarded))
      del d.__forwarded
      del d.__required

  @staticmethod
  def filter(bdd):
    """
    creates a list of required dependencies and mark these dependencies as such.
    """
    for d in bdd.deps:
      d.is_required = False
    todo = set(d for d in bdd.deps if d.is_eyo)
    again = set()
    while True:
      while len(todo):
        d = todo.pop()
        d.is_required = True
        for r in d.required:
          again.add(bdd[r])
      if len(again):
        todo, again = again, todo
      else:
        break
    for d in bdd.deps:
      if d.is_required:
        bdd.required_deps.append(d)

# Dependencies data base
class BDD:
  """
  Here a ``symbol`` is a string like 'eYo.c3s'.
  It corresponds to an object ``eYo.c3s`` defined in some file.
  This data bas keeps track of dependencies
  between different javascript source files.
  """
  deps = []
  required_deps = []
  by_file_name = {}
  by_provide = {}
  missing = set()

  def __init__(self, path=None, verbose=False):
    if path:
      pass
    else:
      __.feed_goog(self, verbose=verbose)
      __.feed_eyo(self, verbose=verbose)
      __.complete_required(self)
      __.complete_forwarded(self)
      __.clean(self)
      __.filter(self)
      for d in self.deps:
        d.is_complete = True

  def __getitem__(self, r: IsA(str, 'a provide identifier')):
    """
    The symbol -> dep mapping is not one to one.
    Care is taken to manage the redundancy.
    """
    if r in self.by_provide:
      return self.by_provide[r]
    self.missing.add(r)

  def getDepWithFileName(self, file_name):
    return self.by_file_name[file_name]

  def __str__(self):
    return '\n'.join(map(str, self.deps))

  def to_json_1(self):
    ans = {
      Path(d.file_name).with_suffix('').as_posix():
      list(map(lambda r: self[r].file_name, d.required))
      for d in self.deps if d.file_name.startswith('src/lib/eyo')
    }
    return json.dumps(ans, sort_keys=True, indent=2)
