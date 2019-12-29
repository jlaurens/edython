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

  re_provide = re.compile(r"""^\s*
  (?:eYo|goog)\.(?:(?P<provide>provide)|(?P<require>require)|forwardDeclare)
  \s*\(\s*
  (?:'|")(?P<what>[^'"]+)(?:'|")
  .*""", re.X)
  #re_provide = re.compile(r"^\s*eYo.(?P<provide>provide)\('(?P<what>[^']+)'\)[;\s]*$")

  # eYo.Foo.makeNS(ns, 'BAR')
  #eYo.Consolidator.makeClass(ns, 'Dlgt', ...
  re_make = re.compile(r"""^\s*
  (?P<NS>eYo(?:\.[A-Z][\w0-9_]*)*)
  \.make(?:Driver)?(?P<what>Class|NS)\s*\(\s*
  (?P<suite>.*)""", re.X)

  assert re.match(re_make, "eYo.makeNS('Brick')"), 'BAD re_make 2'
  assert re.match(re_make, "eYo.DnD.makeClass('Mngr', {"), 'BAD re_make 3'

  # eYo.Foo.makeSubclass(ns, 'bar')
  re_makeSubclass = re.compile(r"""^\s*
  (?P<NS>eYo(?:\.[A-Z][\w0-9_]*)*)
  \.(?P<Super>[A-Z][\w0-9_]*)
  \.makeSubclass\s*\(\s*
  (?P<suite>.*)""", re.X)

  re_arg_ns = re.compile(r"""^
  (?P<ns>eYo(?:\.[A-Z][\w0-9_]*)*)
  (?:\s*,\s*)?
  (?P<suite>.*)""", re.X)

  re_arg_T3 = re.compile(r"""^
  eYo\.T3\.(?:Stmt|Expr)\.(?P<type>[a-z][\w_]*)
  (?:\s*,\s*)?
  (?P<suite>.*)""", re.X)

  re_arg_key = re.compile(r"""^
  (?:'|")(?P<key>[^'"]+)(?:'|")
  .*""", re.X)

  re_assignment = re.compile(r"""^\s*
  (?P<assigned>(?P<ns>eYo(?:\.[A-Z][\w0-9_]*)*)\.[A-Z][\w0-9_]*)
  \s*=(?!=).*""", re.X)

  # eYo.Protocol.add(eYo.Module.Item, 'Register', 'module')
  re_protocol = re.compile(r"""^\s*
  eYo\.Protocol\.add\s*\(\s*eYo(?:\.[A-Z]\w*)*
  \s*,\s*
  (?:'|")(?P<Key>[^'"]+)(?:'|")
  .*""", re.X)

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
        provided.add('eYo')
        def base_require(l):
          pass
      else:
        def base_require(l):
          if re.search('^\s*eYo', l):
            required.add('eYo')
      for l in f.readlines():
        base_require(l)
        m = self.re_protocol.match(l)
        if m:
          K = m.group('Key')
          required.add(f'eYo.Protocol.{K}')
          continue
        m = self.re_assignment.match(l)
        if m:
          ns = m.group('ns')
          if not re.search(r'_[ps]\b', ns):
            required.add(ns)
            provided.add(m.group('assigned'))
          continue
        ns = key = None
        def parse_args(suite):
          nonlocal ns, key
          m = self.re_arg_T3.match(suite)
          if m:
            key = m.group('type')
            suite = m.group('suite')
          m = self.re_arg_T3.match(suite)
          if m:
            key = m.group('type')
            suite = m.group('suite')
          m = self.re_arg_ns.match(suite)
          if m:
            ns = m.group('ns')
            suite = m.group('suite')
          m = self.re_arg_ns.match(suite)
          if m:
            ns = m.group('ns')
            suite = m.group('suite')
          m = self.re_arg_key.match(suite)
          if m:
            key = m.group('key')
        m = self.re_make.match(l)
        if m:
          if m.group('what') != 'NS':
            required.add('eYo.C9r')
          NS = m.group('NS')
          required.add(NS)
          parse_args(m.group('suite'))
          if ns:
            required.add(ns)
            provided.add(f'{ns}.{key}')
          else:
            provided.add(f'{NS}.{key}')
          continue
        m = self.re_makeSubclass.match(l)
        if m:
          required.add('eYo.C9r')
          NS = m.group('NS')
          required.add(NS)
          key = m.group('Super')
          parse_args(m.group('suite'))
          if ns:
            required.add(ns)
            provided.add(f'{ns}.{key}')
          else:
            provided.add(f'{NS}.{key}')
          continue
        m = self.re_provide.match(l)
        if m:
          what = m.group('what')
          if not what.startswith('goog'):
            what = 'eYo.' + m.group('what')
          if m.group('provide'):
            provided.add(what)
          elif m.group('require'):
            required.add(what)
          else:
            forwarded.add(what)
        continue
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
        dependency = f"eYo.addDependency('{relative.as_posix()}', {provide}, {require}, {{}});\n"
        dependency_lines.append(dependency)

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
