"""
Generates a dependency javascript file from a directory.
Build test html files.
"""

import re, os, stat, json
from my_util import *
from pathlib import Path

# read the build.sh, change it and save the modified file to the build
def updateBuild(path_in, path_out, path_deps_web_test):
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
        with path_deps_web_test.open('r', encoding='utf-8') as f:
            head.append(f.read())
            head.extend(tail)
            path_out.write_text(''.join(head), encoding='utf-8')
            st = os.stat(path_out.as_posix())
            os.chmod(path_out.as_posix(), st.st_mode | stat.S_IEXEC)
            return 0
    return 1

def updateWeb(path_in, path_out, path_deps_web_test):
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
        with path_deps_web_test.open('r', encoding='utf-8') as f:
            head.append(f.read())
            head.extend(tail)
            path_out.write_text(''.join(head), encoding='utf-8')
            return 0
    return 1

def updateTest(path_in, path_out, path_deps_web_test):
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
        with path_deps_web_test.open('r', encoding='utf-8') as f:
            head.append(f.read())
            head.extend(tail)
            path_out.write_text(''.join(head), encoding='utf-8')
            return 0
    return 1

def minimalTests(path_src):
  print('Updating minimal tests...')
  for js in [x for x in path_src.rglob('*.js')
    if x.is_file() if not x.name.endswith('test.js')]:
    test = js.with_suffix('.test.js')
    if not test.is_file():
      name = js.stem.capitalize()
      test.write_text(f'''NS = Object.create(null)
describe ('Tests: {js.stem}', function () {{
  it ('{name}: basic', function () {{
    chai.assert(false, 'NOT YET IMPLEMENTED')
  }})
}})
''')
      print('Creating ', test)
  print('... DONE')
  return 0

def updateWebTests():

  print('Updating web tests...')

  # dependencies: read path_deps_tree
  dependencies = json.loads(path_deps_tree.read_text())
  tests = (x for x in path_js.rglob('*.test.js') if x.is_file())
  for path_test in tests:
    relative = path_test.relative_to(path_root)
    k = relative.with_suffix('').with_suffix('').as_posix()
    deps = dependencies[k] if k in dependencies else None
    try:
      root = '../' * (len(relative.parts) - 1)
      lines = [
        HTML.head(root),
      ]
      path_base = path_test.with_suffix('').with_suffix('')
      basename = path_base.stem
      if deps:
        lines.append(HTML.deps(deps, root))
        lines.append(HTML.test(basename))
      else:
        lines.append(HTML.deps(path_deps_web_test, root))
      relative = path_test.relative_to(path_js)
      js = '../' * (len(relative.parts) - 1)
      lines.append(HTML.body(root, js))
      lines.append(HTML.test(basename, True))
      lines.append(HTML.mocha(root))
      try:
        path_in = path_base.with_suffix('.in.xml')
        lines.append(path_in.read_text())
      except FileNotFoundError: pass
      lines.append(f'''</body>
</html>
  ''')
      path_out = path_base.with_suffix('.test.html')
      path_out.write_text(''.join(lines), encoding='utf-8')
      print(f'Updated: {path_out.relative_to(path_eyo)}')
    except Exception as e: raise e; pass
  print('... DONE')
  return 0

def updateWebTestWrappers():
  '''In each directory, 
  1) we create a `test.xml` file that lists all
  the `*.test.js` files in there.
  2) we create a test file wrapper for local test files names `test_local.html`
  3) we create a `test.js` file with local test files and test files in any subdirectories
  '''
  dirs = [x for x in path_js.rglob('*') if x.is_dir()]
  # read the content at path_deps_test and split by parent
  by_parent = {}
  with open(path_deps_test) as f:
    for line in f.readlines():
      p = Path(line.rstrip())
      parent = p.parent
      try:
        by = by_parent[parent]
      except KeyError:
        by = by_parent[parent] = []
      by.append(p)
  for path_dir in dirs:
    k = path_dir.relative_to(path_root).parent
    #print('k =', k, k.as_posix())
    content = ''.join(f'''  <script src="PATH_ROOT/{x.name}" charset="utf-8"></script>
''' for x in path_dir.glob('*.test.js'))
    if len(content):
      content = '''<!-- Automatically created by `npm run eyo:prepare` -->
  ''' + content
      path_out = path_dir / 'test.xml'
      path_out.write_text(content, encoding='utf-8')
      print(f'Updated: {path_out.relative_to(path_root)}')

  # Now local test files
  for path_test in dirs:
    # path_test is path_js/.../
    tests = list(path_test.glob('*.test.js'))
    if (len(tests)):
      relative = path_test.relative_to(path_root)
      root = '../' * len(relative.parts)
      lines = [
        HTML.head(root),
        HTML.deps(path_deps_web_test, root),
      ]
      relative = path_test.relative_to(path_js)
      js = '../' * len(relative.parts)
      lines.append(HTML.body(root, js))
      
      try:
        k = path_test.relative_to(path_root)
        by = by_parent[k]
        for f in by:
          # f : path_test/foo.test.js
          # 
          f = path_root / f.as_posix()
          try:
            lines.append(HTML.script(f.relative_to(path_test)))
          except: pass
        lines.append(HTML.mocha(root))
      except KeyError:
        for f in tests:
          # f : path_test/foo.test.js
          # 
          try:
            lines.append(HTML.script(f.relative_to(path_test)))
          except Exception as e: print(e);pass
        lines.append(HTML.mocha(root))
      for f in tests:
        try:
          path_in = path_test.with_suffix('').with_suffix('').with_suffix('.in.xml')
          lines.append(path_in.read_text())
        except FileNotFoundError: pass
      lines.append(f'''</body>
</html>
''')
      path_out = path_test / 'test_local.html'
      path_out.write_text(''.join(lines), encoding='utf-8')
      print(f'Updated: {path_out.relative_to(path_root)}...')

  # second version
  # read the contents of path_deps_test
  with path_deps_test.open() as f:
    for line in f:
      line = line.rstrip()
      # example: src/lib/eyo/js/core/eyo.test.js

  # Now deep test files
  dirs.append(path_js)
  for path_test in dirs:
    tests = list(path_test.rglob('*/*.test.js'))
    if (len(tests)):
      relative = path_test.relative_to(path_root)
      root = '../' * len(relative.parts)
      lines = [
        HTML.head(root),
        HTML.deps(path_deps_web_test, root),
      ]
      relative = path_test.relative_to(path_js)
      js = '../' * len(relative.parts)
      lines.append(HTML.body(root, js))
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
      print(f'Updated: {path_out.relative_to(path_root)}')
 
  print('... DONE')
  return 0

if __name__ == "__main__":
  print('Step 3:')
  print('=======')

  out = minimalTests(path_eyo)
  out and exit(out)

  print('Update source files.')
  out = updateBuild(
    path_bin / 'build.sh',
    path_bin / 'build.sh',
    path_deps_build
  )
  out and exit(out)

  out = updateWeb(
    path_src / 'index.ejs',
    path_src / 'index.ejs',
    path_deps_vue
  )
  out and exit(out)

  out = updateTest(
    path_test / 'import.js',
    path_test / 'import.js',
    path_deps_test_import
  )
  out and exit(out)

  out = updateWebTests()
  out and exit(out)

  out = updateWebTestWrappers()
  out and exit(out)

  out = updateWeb(
    path_root / 'sandbox' / 'html' / 'toolbox.html',
    path_root / 'sandbox' / 'html' / 'toolbox.html',
    path_deps_web_dev
  )

  exit(out)
