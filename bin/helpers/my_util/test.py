from .path import *
import re

re_begin = re.compile(r"""^\s*//<<<\s*(?:(?P<type>.*?)\s*:\s*)?(?P<what>.*?)\s*$""", re.X)
re_cont = re.compile(r"""^\s*//\.\.\.(?P<indent>\s*)(?P<cont>.*?(?P<chai>\bchai\.(?:expect|assert|should)\b)?.*)\s*$""", re.X)
re_end = re.compile(r"""^\s*//>>>""", re.X)
re_it = re.compile(r"""\s*\|\|\|\s*""", re.X)

def getInlineTest(path):
  class Line:
    def __init__(self, n, l):
      self.describe = False
      self.n = self.cont = self.code = self.indent = self.end = self.begin = self.what = self.raw = None
      self.chai = False
      m = re_begin.match(l)
      if m:
        self.n = n
        self.begin = m.group('what')
        self.raw = '...' == self.begin
        return
      m = re_cont.match(l)
      if m:
        self.n = n
        self.cont = m.group('cont')
        self.chai = m.group('chai') is not None
        self.indent = m.group('indent')
        return
      m = re_end.match(l)
      if m:
        self.n = n
        return
      self.code = l.rstrip()

  # read all the lines
  # record the line number and
  # parse for inline testing
  lines = []
  with path.open() as f:
    for l in f:
      lines.append(Line(len(lines)+1, l))
  # filter out the lines that are not inline tests
  # those with no line number
  # lines = tuple(filter(lambda l: l.n is not None, lines))
  # fixing the `what` of all the lines
  stack = []
  l_start = None
  l_chai = False
  indent = None
  raw = None
  for l in lines:
    if l.begin is not None:
      assert not l_chai, f'''Missing a '//>>>' line before line {l.n} at {path}'''
      if l_start is not None:
        l_start.describe = True
      stack.append(l_start)
      what = re_it.split(l.begin)
      if what == (''):
        what = ('Basics')
      l.what = what
      l_start = l
      indent = None
      raw = l.raw
    elif l.n is not None:
      if l_chai:
        assert l_start is not None, f'''Missing a '//<<<' line before line {l.n} at {path}'''
      if l_start:
        l.what = l_start.what
      if l.chai and not raw:
        l_chai = True
      elif l.cont is None:
        l_chai = False
        l.raw = raw
      if l.indent is None:
        l_start = stack.pop()
        l_chai = False
        raw = False
      elif indent is None:
        indent = l.indent
        l.indent = ''
      elif len(indent) <= len(l.indent):
        l.indent = l.indent[len(indent):]

  assert l_start is None, f'''Missing a '//>>>' line after line {lines[-1].n} at {path}'''
  ans = []
  if len(tuple(filter(lambda l: l.n is not None, lines))):
    ans.append(f'describe(`Inline tests at {path.relative_to(path_js)}`' ''', function () {
  this.timeout(10000)
  var flag, onr
  let makeOnr = () => {
    return eYo.c9r && eYo.c9r.new({
      methods: {
        flag (what, ...$) {
          flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  }
  let setup = function () {
    flag = new eYo.test.Flag()
    onr = makeOnr()
  }
  beforeEach (setup)
  setup()
''')
    depth = 1
    for l in lines:
      if l.begin is not None:
        for x in l.what:
          if x == l.what[-1] and x == '...':
            pass
          else:
            name = 'describe' if l.describe or x != l.what[-1] else 'it'
            ans.append('  '*depth + f'{name}(`{x}`, function () {{')
            depth += 1
      elif l.cont is not None:
        ans.append('  ' * depth + l.indent + l.cont)
      elif l.n is not None:
        for x in l.what:
          if x == l.what[-1] and x == '...':
            pass
          else:
            depth -= 1
            ans.append('  '*depth + f'}})')
      else:
        ans.append('//  '+l.code)
    ans.append('''
})
''')
  return '\n'.join(ans)

