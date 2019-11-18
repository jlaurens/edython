"""
Generates a dependency javacript file from a directory.
Build test html files.
"""
import pathlib
import re
import shutil
import os, stat

path_root = pathlib.Path(__file__).resolve().parent.parent.parent
path_src = path_root / 'src'
path_eyo = path_src / 'lib' / 'eyo'
path_helpers = path_root / 'build' / 'helpers'
path_helpers.mkdir(parents=True, exist_ok=True)

# read the build.sh, change it and save the modified file to the build
def updateBuild(path_in, path_out, path_deps):
    re_good = re.compile(r"^--js ")
    with path_in.open('r', encoding='utf-8') as f:
        head = []
        tail = []
        fill = head
        for l in f.readlines():
            if re_good.match(l):
                fill = tail
            else:
                fill.append(l)
        with path_deps.open('r', encoding='utf-8') as f:
            head.append(f.read())
            head.extend(tail)
            path_out.write_text(''.join(head), encoding='utf-8')
            st = os.stat(path_out.as_posix())
            os.chmod(path_out.as_posix(), st.st_mode | stat.S_IEXEC)
            return 0
    return 1

def updateWeb(path_in, path_out, path_deps):
    re_start = re.compile(r"^\s*<\!--\s+DYNAMIC DEPS START\s+-->\s*$")
    re_end = re.compile(r"^\s*<\!--\s+DYNAMIC DEPS END\s+-->\s*$")
    with path_in.open('r', encoding='utf-8') as f:
        head = []
        tail = []
        fill = head
        for l in f.readlines():
            if re_start.match(l):
                fill.append(l)
                fill = None
            elif re_end.match(l):
                fill = tail
                fill.append(l)
            elif fill is not None:
                fill.append(l)
        with path_deps.open('r', encoding='utf-8') as f:
            head.append(f.read())
            head.extend(tail)
            path_out.write_text(''.join(head), encoding='utf-8')
            return 0
    return 1

def updateTest(path_in, path_out, path_deps):
    re_start = re.compile(r"^\s*//\s*DYNAMIC DEPS START\s+.*$")
    re_end = re.compile(r"^\s*//\s*DYNAMIC DEPS END\s+.*$")
    with path_in.open('r', encoding='utf-8') as f:
        head = []
        tail = []
        fill = head
        for l in f.readlines():
            if re_start.match(l):
                fill.append(l)
                fill = None
            elif re_end.match(l):
                fill = tail
                fill.append(l)
            elif fill is not None:
                fill.append(l)
        with path_deps.open('r', encoding='utf-8') as f:
            head.append(f.read())
            head.extend(tail)
            path_out.write_text(''.join(head), encoding='utf-8')
            return 0
    return 1

class HTML:

  def head(root):
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mocha Tests</title>
  <script src="{root}src/lib/xregexp-all/xregexp-all.js"></script>
  <script src="{root}src/lib/brython/www/src/brython.js"></script>
  <script src="{root}src/lib/brython/www/src/brython_stdlib.js"></script>
  <script src="{root}src/lib/closure-library/closure/goog/base.js"></script>
'''

  def deps(path_deps, root):
    ans = ''
    with path_deps.open('r', encoding='utf-8') as f:
      ans = f.read()
      ans = ans.replace('PATH_ROOT/', root)
    return ans

  def body(root):
    return f'''    <link rel="stylesheet" href="{root}node_modules/mocha/mocha.css">
  </head>
  <body style="background-color: snow">
    <div id="eyo-desk" style="height: 95.375px; width: 412.5px;"></div>
    <div id="mocha"></div>
    <script src="{root}node_modules/mocha/mocha.js"></script>
    <script src="{root}node_modules/chai/chai.js"></script>
    <script>mocha.setup('bdd')</script>
    <script src="{root}test/common.test.js"></script>
'''

  def test(basename):
    return HTML.script(f'./{basename}.test.js')

  def script(relative):
    return f'''    <script src="{relative}" charset="utf-8"></script>
'''

  def mocha(root):
    return f'''    <script src="{root}src/lib/eyo/debugging.js"></script>
    <script>mocha.run();</script>
'''

def minimalTests(path_src):
  print('Updating minimal tests...')
  for js in [x for x in path_src.rglob('*.js')
    if x.is_file() if not x.name.endswith('.test.js')]:
    test = js.with_suffix('').with_suffix('.test').with_suffix('.js')
    if not test.is_file():
      name = test.stem.capitalize()
      test.write_text(f'''NS = Object.create()
describe ('Tests: {test.stem}', function () {{
  it ('{name}: basic', function () {{

  }})
}})
''')
      print('Creating ', test)
  exit(-1)
  return 0

def updateWebTests(path_eyo, path_deps):

  print('Updating web tests...')
  tests = [x for x in path_root.rglob('*.test.js')
    if x.is_file()]
  for path_test in tests:
    relative = path_test.relative_to(path_root)
    print(relative)
    root = '../' * (len(relative.parts) - 1)
    path_base = path_test.with_suffix('').with_suffix('')
    basename = path_base.stem
    lines = [
      HTML.head(root),
      HTML.deps(path_deps, root),
      HTML.body(root),
    ]
    basename = path_base.stem
    lines.append(HTML.test(basename))
    lines.append(HTML.mocha(root))
    try:
      path_in = path_base.with_suffix('.in.xml')
      with path_in.open('r', encoding='utf-8') as f:
        s = f.read()
        lines.append(s)
    except: pass
    lines.append(f'''</body>
</html>
''')
    path_out = path_base.with_suffix('.test.html')
    path_out.write_text(''.join(lines), encoding='utf-8')
  print('... Updating web tests: DONE')
  return 0

def updateWebTestWrappers(path_eyo, path_deps):
  '''In each directory, 
  1) we create a `test.xml` file that lists all
  the `*.test.js` files in there.
  2) we create a test file wrapper for local test files names `test_local.html`
  3) we create a `test.js` file with local test files and test files in any subdirectories
  '''
  print('Updating web test wrappers...')
  for path_dir in [x for x in path_eyo.rglob('*')
    if x.is_dir()
  ]:
    tests = [x for x in path_dir.glob('*.test.js')]
    tests = map(lambda x: f'''    <script src="ROOT_PLACE_HOLDER/{x.name}" charset="utf-8"></script>
''', tests)
    content = ''.join(tests)
    if len(content):
      content = '''<!-- Created by `npm run eyo:prepare` -->
  ''' + content
      path_out = path_dir / 'test.xml'
      path_out.write_text(content, encoding='utf-8')
      print(path_out.relative_to(path_root))

  for path_test in [x for x in path_eyo.rglob('*')
    if x.is_dir()
  ]:
    tests = list(path_test.glob('*.test.js'))
    if (len(tests)):
      relative = path_test.relative_to(path_root)
      root = '../' * len(relative.parts)
      lines = [
        HTML.head(root),
        HTML.deps(path_deps, root),
        HTML.body(root),
      ]
      for f in tests:
        lines.append(HTML.script(f.relative_to(path_test)))
      lines.append(HTML.mocha(root))
      for f in tests:
        try:
          path_in = path_test.with_suffix('').with_suffix('').with_suffix('.in.xml')
          with path_in.open('r', encoding='utf-8') as f:
            s = f.read()
            lines.append(s)
        except: pass
      lines.append(f'''</body>
</html>
''')
      path_out = path_test / 'test_local.html'
      path_out.write_text(''.join(lines), encoding='utf-8')
      print(path_out.relative_to(path_eyo))
  # Now deep test files
  for path_test in [x for x in path_eyo.rglob('*')
    if x.is_dir()
  ]:
    tests = list(path_test.rglob('*.test.js'))
    if (len(tests)):
      relative = path_test.relative_to(path_root)
      root = '../' * len(relative.parts)
      lines = [
        HTML.head(root),
        HTML.deps(path_deps, root),
        HTML.body(root),
      ]
      for f in tests:
        lines.append(HTML.script(f.relative_to(path_test)))
      lines.append(HTML.mocha(root))
      for f in tests:
        try:
          path_in = path_test.with_suffix('').with_suffix('').with_suffix('.in.xml')
          with path_in.open('r', encoding='utf-8') as f:
            s = f.read()
            lines.append(s)
        except: pass
      lines.append(f'''</body>
</html>
''')
      path_out = path_test / 'test.html'
      path_out.write_text(''.join(lines), encoding='utf-8')
      print(path_out.relative_to(path_eyo))
 
  print('... Updating web test wrappers: DONE')
  return 0

print('Step 3:')
print('=======')

print('Create minimal test files.')
out = minimalTests(path_eyo)

print('Update source files.')
out = updateBuild(path_root / 'bin' / 'build.sh',
                  path_root / 'bin' / 'build.sh',
                path_helpers / 'deps-build.txt'
                  )

out = updateWeb(path_root / 'src' / 'index.ejs',
                path_root / 'src' / 'index.ejs',
                     path_helpers / 'deps-vue.txt')

out = updateTest(path_root / 'test' / 'import.js',
                path_root / 'test' / 'import.js',
                     path_helpers / 'deps-test-import.txt')

path_deps = path_helpers / 'deps-web-test.txt'
out = updateWebTests(path_eyo, path_deps)

out = updateWebTestWrappers(path_eyo, path_deps)

try:
    out = updateWeb(path_root / 'sandbox' / 'html' / 'toolbox.html',
                    path_root / 'sandbox' / 'html' / 'toolbox.html',
                    path_helpers / 'deps-web-dev.txt')
except:
    # this is just a convenient method to update developer's test file
    pass
exit(out)
