"""
Private class to parse a javascript file and extract the dependency information.
"""

from .path import *
import re

class Info:
  re_provide = re.compile(r"""^\s*
  (?:eYo|goog)\.(?:(?P<provide>provide)|(?P<require>require)|forward(?:Declare)?)
  \s*\(\s*
  (?:'|")(?P<what>[^'"]+)(?:'|")
  .*""", re.X)
  #re_provide = re.compile(r"^\s*eYo.(?P<provide>provide)\('(?P<what>[^']+)'\)[;\s]*$")

  # eYo.info.makeNS(ns, 'BAR')
  #eYo.Consolidator.makeC9r(ns, 'Dlgt', ...
  re_make = re.compile(r"""^\s*
  (?P<NS>eYo(?:\.[a-z][\w0-9_]*)*)
  \.make(?:Driver)?(?P<what>C9r|NS|Singleton)\s*\(\s*
  (?P<suite>.*)""", re.X)

  assert re.match(re_make, "eYo.makeNS('Brick')"), 'BAD re_make 2'
  assert re.match(re_make, "eYo.dnd.makeC9r('Mngr', {"), 'BAD re_make 3'
  assert re.match(re_make, "eYo.o4t.makeSingleton(eYo, 'font', {"), 'BAD re_make 3a'

  m = re.match(re_make, "eYo.o3d.makeC9r(eYo.pane, 'WorkspaceControl', {")
  assert m, 'BAD re_make 4'
  assert m.group('NS') == "eYo.o3d", 'BAD re_make 5'
  suite = m.group('suite')
  assert suite == "eYo.pane, 'WorkspaceControl', {", 'BAD re_make 6'

  re_arg_ns = re.compile(r"""^
  (?P<ns>eYo(?:\.[a-z][\w0-9_]*)*)
  (?:\s*,\s* (?P<suite>.*))?$""", re.X)

  m = re.match(re_arg_ns, suite)
  assert m, 'BAD re_arg_ns 1'
  assert m.group('ns') == "eYo.pane", 'BAD re_arg_ns 2'

  # eYo.pane.WorkspaceControl[eYo.$makeSubC9r]('TrashCan', {
  re_makeSubC9r = re.compile(r"""^\s*
  (?P<NS>eYo(?:\.[a-z][\w0-9_]*)*)
  \.(?P<Super>[A-Z][\w0-9_]*)
  \[eYo\.\$makeSubC9r\]\s*\(\s*
  (?P<suite>.*)""", re.X)

  m = re.match(re_makeSubC9r, "eYo.pane.WorkspaceControl[eYo.$makeSubC9r]('TrashCan', {")
  assert m, 'BAD re_makeSubC9r 1'
  assert m.group('NS') == "eYo.pane", 'BAD re_makeSubC9r 2'
  assert m.group('Super') == "WorkspaceControl", 'BAD re_makeSubC9r 3'
  suite = m.group('suite')
  assert suite == "'TrashCan', {", 'BAD re_makeSubC9r 4'
  m = re.match(re_arg_ns, suite)
  assert not m, 'BAD re_arg_ns 3'

  re_arg_key = re.compile(r"""^
  (?:'|")(?P<key>[^'"]+?)(?:'|")
  .*$""", re.X)

  m = re.match(re_arg_key, suite)
  assert m, 'BAD re_arg_key 1'
  assert m.group('key') == "TrashCan", 'BAD re_arg_ns 2'

  re_arg_t3 = re.compile(r"""^
  eYo\.t3\.(?:stmt|expr)\.(?P<type>[a-z][\w0-9_]*)
  (?:\s*,\s*(?P<suite>.*))?
  $""", re.X)

  re_arg_Super = re.compile(r"""^
  (?P<ns>eYo(?:\.[a-z][\w0-9_]*)*)\.(?P<key>[A-Z][\w0-9_]*)
  (?:\s*,\s*(?P<suite>.*)|\W*)?""", re.X)
  
  m = re.match(re_make, "eYo.view.makeC9r(eYo.p6y.List)")
  assert m, 'BAD re_make 7'
  assert m.group('NS') == "eYo.view", 'BAD re_make 8'
  suite = m.group('suite')
  assert suite == "eYo.p6y.List)", 'BAD re_make 9'
  m = re.match(re_arg_Super, suite)
  assert m, 'BAD re_arg_Super 1'

  re_assignment = re.compile(r"""^\s*
  (?P<assigned>(?P<ns>eYo(?:\.[a-z][\w0-9_]*)*)\.[A-Z][\w0-9_]*)
  \s*=(?!=).*""", re.X)

  # eYo.protocol.add(eYo.Module.Item, 'Register', 'module')
  re_protocol = re.compile(r"""^\s*
  eYo\.protocol\.add\s*\(\s*eYo(?:\.[a-z]\w*)*
  \s*,\s*
  (?:'|")(?P<Key>[^'"]+)(?:'|")
  .*""", re.X)

  # eYo.widget.makeBaseC9r()
  re_makeBaseC9r = re.compile(r"""^\s*
  (?P<ns>eYo(?:\.[a-z]\w*)*)(?:\.(?P<key>[a-z]\w*))\.makeBaseC9r\s*\(.*""", re.X)

  # eYo.driver.makeMngr(model)
  re_makeMngr = re.compile(r"""^\s*
  (?P<ns>eYo(?:\.[a-z]\w*)*)\.makeMngr\s*\(.*""", re.X)
  re_makeForwarder = re.compile(r"""^\s*
  (?P<ns>eYo(?:\.[a-z]\w*)*)\.makeForwarder\s*\(.*""", re.X)

  # eYo.o3d.Base.eyo.propertiesMerge({
  re_propertiesMerge = re.compile(r"""^\s*
  (?P<extended>eYo(?:\.[a-z]\w*)*\.[A-Z]\w*)\.eyo\.(?:properties|methods)Merge\s*\(.*""", re.X)

  # eYo.view.Base_p.doDisposeUI = function (...args) {
  re_protocol2 = re.compile(r"""^\s*
  (?P<required>eYo(?:\.[a-z]\w*)*\.[A-Z]\w*)_p\.\w+\s*=.*""", re.X)

  # eYo.setup.register(
  re_setup = re.compile(r"""^\s*
  (?P<required>eYo\.setup)\.register\s*\(""", re.X)

  # eYo.register.add(
  re_register = re.compile(r"""^\s*
  (?P<required>eYo\.register)\.add\s*\(""", re.X)

  # eYo.....merge(
  re_merge = re.compile(r"""^\s*
  (?P<ns>eYo(?:\.[a-z]\w*)*)(?:\.[A-Z]\w*\.\w*)*\.(?:[a-z]\w*M|m)erge \s*\(""", re.X)

  # eYo.....allowPath, allowShortcut(
  re_more = re.compile(r"""^\s*
  (?P<ns>eYo\.more)""", re.X)

  # eYo.....allowPath, allowShortcut(
  re_model = re.compile(r"""^\s*
  (?P<ns>eYo(?:\.[a-z]\w*)*)\.allowModel(?:Path|Shortcut)\s*\(""", re.X)

  # eYo.o4t.p6yEnhanced
  re_p6yEnhanced = re.compile(r"""^\s*
  (?P<ns>eYo(?:\.[a-z]\w*)*)\.p6yEnhanced\s*\(""", re.X)

  # eYo.....Merge(
  re_merge_MPA = re.compile(r"""^\s*
  (?P<ns>eYo(?:\.[a-z]\w*)*)\.[A^Z]\w*\.(?:methods|aliases|properties)Merge\s*\(""", re.X)

  # eYo.....enhancedO4t(
  re_enhanced = re.compile(r"""^\s*
  (?P<ns>eYo(?:\.[a-z]\w*)*)\.enhanced[A-Z]\w+\s*\(""", re.X)

  # eYo.mixinR(eYo.key, {
  re_mixinR = re.compile(r"""^\s*eYo\.mixinR\s*\(\s*
  (?P<ns>eYo\.[a-z]\w*)""", re.X)

  pathByProvided = {}
  ignored = []

  def __init__(self, path):
    """
    we scan the file and look separately for provide, require, forwardDeclare, makeNS, makeClass, makeSubC9r... lines.
    Build a list of 'provided' and 'required' symbols.
    """
    self.path = path
    with path.open('r', encoding='utf-8') as f:
      prompt = f'======= {path}\n'
      relative = path.relative_to(path_root)
      provided = []
      def addProvided(what):
        last = what.split('.')[-1]
        if last in ['DB'] or re.search('[a-z]', last):
          if not what in provided:
            provided.append(what) 
        else:
          Info.ignored.append(what)
      required = set()
      forwarded = set()
      classed = set()
      namespaced = set()
      if path.stem == 'eyo':
        addProvided('eYo')
        def base_require(l):
          pass
      else:
        def base_require(l):
          if re.search(r'^\s*eYo', l):
            required.add('eYo')
          if re.search(r'^\s*eYo\.c9r\.', l):
            required.add('eYo.c9r')
      for l in f.readlines():
        base_require(l)
        m = self.re_makeBaseC9r.match(l)
        if m:
          ns = m.group('ns')
          k = m.group('key')
          required.add(f'{ns}')
          addProvided(f'{ns}.{k}.BaseC9r')
          K = k.title()
          if k != K:
            addProvided(f'{ns}.{K}')
          continue
        m = self.re_makeMngr.match(l)
        if m:
          ns = m.group('ns')
          required.add(f'{ns}')
          addProvided(f'{ns}.Mngr')
          addProvided(f'{ns}.BaseC9r')
          continue
        m = self.re_makeForwarder.match(l)
        if m:
          ns = m.group('ns')
          required.add(f'{ns}')
          continue
        m = self.re_protocol.match(l)
        if m:
          K = m.group('Key')
          required.add(f'eYo.protocol.{K}')
          continue
        m = self.re_assignment.match(l)
        if m:
          assigned = m.group('assigned')
          if not assigned.endswith('.prototype'):
            ns = m.group('ns')
            if ns.endswith('.prototype') or re.search(r'_[ps]\b', ns):
              continue
            required.add(ns)
            addProvided(assigned)
          continue
        m = self.re_propertiesMerge.match(l)
        if m:
          required.add(m.group('extended'))
          continue
        m = self.re_protocol2.match(l)
        if m:
          req = m.group('required')
          if not req.endswith('Dlgt'):
            required.add(req)
          continue
        m = self.re_setup.match(l)
        if m:
          required.add(m.group('required'))
          continue
        m = self.re_register.match(l)
        if m:
          required.add(m.group('required'))
          continue
        m = self.re_merge.match(l)
        if m:
          required.add(m.group('ns'))
          continue
        m = self.re_more.match(l)
        if m:
          required.add(m.group('ns'))
          continue
        m = self.re_model.match(l)
        if m:
          required.add(m.group('ns'))
          continue
        m = self.re_p6yEnhanced.match(l)
        if m:
          required.add('eYo.p6y')
          continue
        m = self.re_merge_MPA.match(l)
        if m:
          required.add(m.group('ns'))
          continue
        m = self.re_enhanced.match(l)
        if m:
          required.add('eYo.o4t')
          continue
        ns = key = superKey = None
        def parse_args(suite):
          nonlocal ns, key, superKey
          ns = key = superKey = None
          m = self.re_arg_t3.match(suite)
          if m:
            key = m.group('type')
            suite = m.group('suite')
          else:
            m = self.re_arg_ns.match(suite)
            if m:
              ns = m.group('ns')
              suite = m.group('suite')
            m = self.re_arg_key.match(suite)
            if m:
              key = m.group('key')
            else:
              m = self.re_arg_Super.match(suite)
              if m:
                superKey = m.group('key')
        m = self.re_make.match(l)
        if m:
          if m.group('what') != 'NS':
            required.add('eYo.c9r')
          NS = m.group('NS')
          required.add(NS)
          parse_args(m.group('suite'))
          if key:
            if ns:
              required.add(ns)
              addProvided(f'{ns}.{key}')
            else:
              addProvided(f'{NS}.{key}')
          elif superKey:
            if ns:
              required.add(ns)
              addProvided(f'{ns}.{superKey}')
            else:
              addProvided(f'{NS}.{superKey}')
          continue
        m = self.re_makeSubC9r.match(l)
        if m:
          required.add('eYo.c9r')
          NS = m.group('NS')
          key = m.group('Super')
          required.add(f'{NS}.{key}')
          parse_args(m.group('suite'))
          if ns:
            required.add(ns)
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
            required.add(what)
          else:
            forwarded.add(what)
        m = self.re_mixinR.match(l)
        if m:
          required.add(m.group('ns'))
        continue
      for p in provided:
        if p in self.pathByProvided:
          raise f'''At least two providers for {p}:
{self.pathByProvided[p]}
{path}
'''
      self.provided = provided
      self.required = required - set(provided)
      self.forwarded = forwarded
