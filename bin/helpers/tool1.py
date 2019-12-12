"""Generates a dependency javacript file from a directory.
"""
import pathlib
import re
import json
import pprint

pathRoot = pathlib.Path(__file__).resolve().parent.parent.parent
pathBuild = pathRoot / 'build' / 'helpers'
pathBuild.mkdir(parents=True, exist_ok=True)

class Foo:

  re_provide = re.compile(r"^\s*(?:eYo|goog)\.(?:(?P<provide>provide)|(?P<require>require)|forwardDeclare)\s*\('(?P<what>[^']+)'\)[;\s]*(?://.*)?$")
  #re_provide = re.compile(r"^\s*eYo.(?P<provide>provide)\('(?P<what>[^']+)'\)[;\s]*$")

  #eYo.Consolidator.makeClass('Dlgt')
  re_make = re.compile(r"""^\s*(?:(?P<makeClass>[\w.]+)\.make(?:Driver)?Class|(?P<makeSubclass>[\w.]+)\.makeSubclass|(?P<makeNS>eYo\.[\w.]*makeNS))\s*\(\s*(?P<ns>[\w.]+)?(?:\s*,\s*)?(?:(?:'|")(?P<what>[\w.]+)(?:'|"))?.*""")

  assert re.match(re_make, "eYo.makeNS('Brick')"), 'BAD re_make 2'

  pathByProvided = {}
  nsByClass = {}

  # we scan all the files and look separately for provide, require, forwardDeclare, makeNS, makeClass, makeSubclass lines.
  def __init__(self, path):
    self.path = path
    with path.open('r', encoding='utf-8') as f:
      relative = path.relative_to(pathRoot)
      provided = set()
      required = set()
      forwarded = set()
      classed = set()
      subclassed = set()
      namespaced = set()
      if path.stem == 'eyo':
        def base_require(l):
          pass
      else:
        def base_require(l):
          if re.search('^\s*eYo', l):
            required.add('eYo')

      for l in f.readlines():
        base_require(l)
        m = self.re_make.match(l)
        if m:
          makeClass = m.group('makeClass')
          makeSubclass = m.group('makeSubclass')
          makeNS = m.group('makeNS')
          ns = m.group('ns')
          what = m.group('what')
          if re.search('eYo.Driver.Dlgt.makeSubclass(eYo.Svg)', l):
          # eYo.Driver.Dlgt.makeSubclass(eYo.Svg)
          #if makeSubclass is 'eYo.Driver.Dlgt' and ns is 'eYo.Svg':
            print('FOUND', makeSubclass, what)
            exit(-1)
          if what:
            what = '.' + what
          elif makeSubclass:
            what = pathlib.Path(makeSubclass).suffix
          else:
            continue
          if makeNS:
            what = 'eYo' + what
            provided.add(what)
            namespaced.add(what)
          elif makeClass:
            what = (ns if ns else makeClass) + what
            provided.add(what)
            classed.add(what)
            self.nsByClass[what] = ns if ns else makeClass
          elif ns:
            what = ns + what
            provided.add(what)
          else:
            subclassed.add((makeSubclass, what))
        m = self.re_provide.match(l)
        if m:
          what = m.group('what')
          if not what.startswith('eYo.'):
            what = 'eYo.' + what
          if m.group('provide'):
            provided.add(what)
          elif m.group('require'):
            required.add(what)
          else:
            forwarded.add(what)
      for p in provided:
        if p in self.pathByProvided:
          raise f'''At least two providers for {p}:
{self.pathByProvided[p]}
{path}
'''
      self.provided = provided
      self.required = required
      self.forwarded = forwarded
      self.subclassed = subclassed

def buildDeps(library, library_name):
    pathInput = pathRoot / 'src/lib/' / library
    print('Scanning folder\n    ', pathInput, '\nfor `*.js` files:')
    files = [x for x in pathInput.rglob('*')
             if x.is_file() and x.suffix == '.js'
             if not x.name.endswith('test.js')
             if '/dev/' not in x.as_posix()]
    print(*files, sep='\n')
    foos = []
    for file in files:
      foos.append(Foo(file))

    dependency_lines = []
    requirement_lines = set()

    for k in Foo.nsByClass:
      print(k, '->', Foo.nsByClass[k])
    print('----------------------')
    for foo in foos:
      for x in foo.subclassed:
        makeSubclass = x[0]
        what = x[1]
        if makeSubclass in Foo.nsByClass:
          foo.provided.add(f'{Foo.nsByClass[makeSubclass]}{what}')
        else:
          p = pathlib.Path(makeSubclass)
          foo.provided.add(p.with_suffix(what))

    for foo in foos:
      requirement_lines.update(foo.required)
      requirement_lines.update(foo.forwarded)
      provide = '['
      provide_sep = ''
      for what in foo.provided:
        provide += provide_sep + f"'{what}'"
        provide_sep = ', '
      require = '['
      require_sep = ''
      for what in foo.required:
        require += require_sep + f"'{what}'"
        require_sep = ', '
      if len(provide) + len(require)>2:
        provide += ']'
        require += ']'
        relative = foo.path.relative_to(pathRoot)
        dependency_lines.append("eYo.addDependency('" + relative.as_posix() + "', " + provide + ', ' + require + ', {});\n')

    p_out = pathBuild / (library_name+'_deps.js')
    print('Writing dependencies in\n   ', p_out)
    dependency_lines.sort()
    p_out.write_text(''.join(dependency_lines))
    p_out = pathBuild / (library_name+'_required.txt')
    print('Writing requirements in\n   ', p_out)
    requirement_lines = sorted(requirement_lines)
    p_out.write_text('\n'.join(requirement_lines))
print('Step 1:')
print('=======')
print('Building eyo deps')
buildDeps('eyo', 'eyo')
print('Building blockly/core deps')
buildDeps('blockly/core', 'blockly')

exit(0)
