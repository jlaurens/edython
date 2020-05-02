from .path import *
import re

re_begin = re.compile(r"""^\s*//<<<\s*(.*?:\s*)?(?P<it>.*?)\s*$""", re.X)
re_cont = re.compile(r"""^\s*//\.\.\.(?P<indent>\s*)(?P<cont>.*?)\s*$""", re.X)
re_end = re.compile(r"""^\s*//>>>""", re.X)
re_it = re.compile(r"""\s*\|\|\|\s*""", re.X)

def getInlineTest(path):
  class Line:
    def __init__(self, n, l):
      self.describe = False
      self.n = self.cont = self.indent = self.end = self.it_start = self.it = None
      m = re_begin.match(l)
      if m:
        self.n = n
        self.it_start = m.group('it')
        return
      m = re_cont.match(l)
      if m:
        self.n = n
        self.cont = m.group('cont')
        self.indent = m.group('indent')
        return
      m = re_end.match(l)
      if m:
        self.n = n
        return

  # read all the lines
  # record the line number and
  # parse for inline testing
  lines = []
  with path.open() as f:
    for l in f:
      lines.append(Line(len(lines)+1, l))
  # filter out the lines that are not inline tests
  # those with no line number
  lines = tuple(filter(lambda l: l.n is not None, lines))
  # fixing the `it` of all the lines
  stack = []
  l_start = None
  indent = None
  for l in lines:
    if l.it_start is not None:
      if l_start is not None:
        l_start.describe = True
      stack.append(l_start)
      it = re_it.split(l.it_start)
      if it == (''):
        it = ('Basics')
      l.it = it
      l_start = l
      indent = None
    else:
      assert l_start is not None, f'''Missing a '//<<<' line before line {l.n} at {path}'''
      l.it = l_start.it
      if l.indent is None:
        l_start = stack.pop()
      elif indent is None:
        indent = l.indent
        l.indent = ''
      elif len(indent) <= len(l.indent):
        l.indent = l.indent[len(indent):]

  assert l_start is None, f'''Missing a '//>>>' line after line {lines[-1].n} at {path}'''
  ans = []
  if len(lines):
    ans.append(f'describe(`Inline tests at {path.relative_to(path_js)}`' ''', function () {
  this.timeout(10000)
  var flag, onr
  beforeEach (function() {
    flag = new eYo.test.Flag()
    onr = eYo.c9r && eYo.c9r.new({
      methods: {
        flag (what, ...$) {
          flag.push(1, what, ...$)
          return what
        },
      },
    }, 'onr')
  })
''')
    depth = 1
    for l in lines:
      if l.it_start is not None:
        for x in l.it:
          name = 'describe' if l.describe or x != l.it[-1] else 'it'
          ans.append('  '*depth + f'{name}(`{x}`, function () {{')
          depth += 1
      elif l.cont is not None:
        ans.append('  ' * depth + l.indent + l.cont)
      else:
        for x in l.it:
          depth -= 1
          ans.append('  '*depth + f'}})')
    ans.append('''
})
''')
  return '\n'.join(ans)

