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

  # eYo.foo.makeNS(ns, 'BAR')
  #eYo.Consolidator.makeC9r(ns, 'Dlgt', ...
  re_make = re.compile(r"""^\s*
  (?P<NS>eYo(?:\.[a-z][\w0-9_]*)*)
  \.make(?:Driver)?(?P<what>C9r|NS)\s*\(\s*
  (?P<suite>.*)""", re.X)

  assert re.match(re_make, "eYo.makeNS('Brick')"), 'BAD re_make 2'
  assert re.match(re_make, "eYo.dnd.makeC9r('Mngr', {"), 'BAD re_make 3'

  m = re.match(re_make, "eYo.o3d.makeC9r(eYo.pane, 'WorkspaceControl', {")
  assert m, 'BAD re_make 4'
  assert m.group('NS') == "eYo.o3d", 'BAD re_make 5'
  suite = m.group('suite')
  assert suite == "eYo.pane, 'WorkspaceControl', {", 'BAD re_make 6'

  re_arg_ns = re.compile(r"""^
  (?P<ns>eYo(?:\.[a-z][\w0-9_]*)*)
  (?:\s*,\s*)?
  (?P<suite>.*)""", re.X)

  m = re.match(re_arg_ns, suite)
  assert m, 'BAD re_arg_ns 1'
  assert m.group('ns') == "eYo.pane", 'BAD re_arg_ns 2'

  # eYo.pane.WorkspaceControl.makeInheritedC9r('TrashCan', {
  re_makeInheritedC9r = re.compile(r"""^\s*
  (?P<NS>eYo(?:\.[a-z][\w0-9_]*)*)
  \.(?P<Super>[A-Z][\w0-9_]*)
  \.makeInheritedC9r\s*\(\s*
  (?P<suite>.*)""", re.X)

  m = re.match(re_makeInheritedC9r, "eYo.pane.WorkspaceControl.makeInheritedC9r('TrashCan', {")
  assert m, 'BAD re_makeInheritedC9r 1'
  assert m.group('NS') == "eYo.pane", 'BAD re_makeInheritedC9r 2'
  assert m.group('Super') == "WorkspaceControl", 'BAD re_makeInheritedC9r 3'
  suite = m.group('suite')
  assert suite == "'TrashCan', {", 'BAD re_makeInheritedC9r 4'
  m = re.match(re_arg_ns, suite)
  assert not m, 'BAD re_arg_ns 3'

  re_arg_key = re.compile(r"""^
  (?:'|")(?P<key>[^'"]+)(?:'|")
  .*""", re.X)

  m = re.match(re_arg_key, suite)
  assert m, 'BAD re_arg_key 1'
  assert m.group('key') == "TrashCan", 'BAD re_arg_ns 2'

  re_arg_t3 = re.compile(r"""^
  eYo\.t3\.(?:stmt|expr)\.(?P<type>[a-z][\w_]*)
  (?:\s*,\s*)?
  (?P<suite>.*)""", re.X)

  re_assignment = re.compile(r"""^\s*
  (?P<assigned>(?P<ns>eYo(?:\.[a-z][\w0-9_]*)*)\.[A-Z][\w0-9_]*)
  \s*=(?!=).*""", re.X)

  # eYo.protocol.add(eYo.Module.Item, 'Register', 'module')
  re_protocol = re.compile(r"""^\s*
  eYo\.protocol\.add\s*\(\s*eYo(?:\.[a-z]\w*)*
  \s*,\s*
  (?:'|")(?P<Key>[^'"]+)(?:'|")
  .*""", re.X)

  # eYo.widget.makeDflt()
  re_makeDflt = re.compile(r"""^\s*
  (?P<ns>eYo(?:\.[a-z]\w*)*)(?:\.(?P<key>[a-z]\w*))\.makeDflt\s*\(.*""", re.X)

  # eYo.driver.makeMngr(model)
  re_makeMngr = re.compile(r"""^\s*
  (?P<ns>eYo(?:\.[a-z]\w*)*)\.makeMngr\s*\(.*""", re.X)

  # eYo.o3d.Dflt.eyo.extendsProperties({
  re_extendsProperties = re.compile(r"""^\s*
  (?P<extended>eYo(?:\.[a-z]\w*)*\.[A-Z]\w*)\.eyo\.extendsProperties\s*\(.*""", re.X)

  # eYo.view.Dflt_p.doDisposeUI = function (...args) {
  re_protocol2 = re.compile(r"""^\s*
  (?P<required>eYo(?:\.[a-z]\w*)*\.[A-Z]\w*)_p\.\w+\s*=.*""", re.X)

  pathByProvided = {}
  nsByClass = {}

  # we scan all the files and look separately for provide, require, forwardDeclare, makeNS, makeClass, makeInheritedC9r lines.
  def __init__(self, path):
    self.path = path
    with path.open('r', encoding='utf-8') as f:
      prompt = f'======= {path}\n'
      print('', path)
      relative = path.relative_to(pathRoot)
      provided = set()
      def addProvided(what):
        last = what.split('.')[-1]
        if last in ['DB'] or re.search('[a-z]', last):
          provided.add(what)
        else:
          print(f'IGNORED provided {what}')
      required = set()
      def addRequired(what, assigned = None):
        nonlocal prompt
        if what == 'eYo.Desk':
          print(f'{prompt}*** Requirement {what}')
          prompt = ''
        required.add(what)
      forwarded = set()
      classed = set()
      subclassed = set()
      namespaced = set()
      if path.stem == 'eyo':
        addProvided('eYo')
        def base_require(l):
          pass
      else:
        def base_require(l):
          if re.search(r'^\s*eYo', l):
            addRequired('eYo')
          if re.search(r'^\s*eYo\.c9r\.', l):
            addRequired('eYo.c9r')
      for l in f.readlines():
        base_require(l)
        m = self.re_makeDflt.match(l)
        if m:
          ns = m.group('ns')
          k = m.group('key')
          addRequired(f'{ns}')
          addProvided(f'{ns}.{k.title()}')
          addProvided(f'{ns}.{k}.Dflt')
          continue
        m = self.re_makeMngr.match(l)
        if m:
          ns = m.group('ns')
          addRequired(f'{ns}')
          addProvided(f'{ns}.Mngr')
          addProvided(f'{ns}.Dflt')
          continue
        m = self.re_protocol.match(l)
        if m:
          K = m.group('Key')
          addRequired(f'eYo.protocol.{K}')
          continue
        m = self.re_assignment.match(l)
        if m:
          assigned = m.group('assigned')
          if not assigned.endswith('.prototype'):
            ns = m.group('ns')
            if ns.endswith('.prototype') or re.search(r'_[ps]\b', ns):
              continue
            addRequired(ns, assigned)
            addProvided(assigned)
          continue
        m = self.re_extendsProperties.match(l)
        if m:
          addRequired(m.group('extended'))
          continue
        m = self.re_protocol2.match(l)
        if m:
          req = m.group('required')
          if not req.endswith('Dlgt'):
            addRequired(req)
          continue
        ns = key = None
        def parse_args(suite):
          nonlocal ns, key
          ns = Key = None
          m = self.re_arg_t3.match(suite)
          if m:
            key = m.group('type')
            suite = m.group('suite')
          m = self.re_arg_t3.match(suite)
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
            addRequired('eYo.c9r')
          NS = m.group('NS')
          addRequired(NS)
          parse_args(m.group('suite'))
          if ns:
            addRequired(ns)
            addProvided(f'{ns}.{key}')
          else:
            addProvided(f'{NS}.{key}')
          if path.stem == 'workspace_control':
            print(NS, ns, key, provided)
          continue
        m = self.re_makeInheritedC9r.match(l)
        if m:
          addRequired('eYo.c9r')
          NS = m.group('NS')
          key = m.group('Super')
          addRequired(f'{NS}.{key}')
          parse_args(m.group('suite'))
          if ns:
            addRequired(ns)
            addProvided(f'{ns}.{key}')
          else:
            addProvided(f'{NS}.{key}')
          continue
        
        m = self.re_provide.match(l)
        if m:
          what = m.group('what')
          if not what.startswith('goog'):
            what = 'eYo.' + m.group('what')
          if m.group('provide'):
            addProvided(what)
          elif m.group('require'):
            addRequired(what)
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
      self.required = required - provided
      self.forwarded = forwarded
      self.subclassed = subclassed

def buildDeps(library, library_name):
    pathInput = pathRoot / 'src' / 'lib' / library
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
        makeInheritedC9r = x[0]
        what = x[1]
        if makeInheritedC9r in Foo.nsByClass:
          foo.provided.add(f'{Foo.nsByClass[makeInheritedC9r]}{what}')
        else:
          p = pathlib.Path(makeInheritedC9r)
          foo.provided.add(p.with_suffix(what))

    for foo in foos:
      requirement_lines.update(foo.required)
      requirement_lines.update(foo.forwarded)
      provide = '['
      provide_sep = ''
      for what in foo.provided:
        provide += f"{provide_sep}'{what}'"
        provide_sep = ', '
      require = '['
      require_sep = ''
      for what in foo.required:
        require += f"{require_sep}'{what}'"
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

print('Done')

exit(0)
