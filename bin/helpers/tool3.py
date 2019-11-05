"""Generates a dependency javacript file from a directory.
"""
import pathlib, os
import re
import shutil
import os
import stat

pathRoot = pathlib.Path(__file__).resolve().parent.parent.parent
pathBuild = pathRoot / 'build' / 'helpers'
pathBuild.mkdir(parents=True, exist_ok=True)

pathTest = pathRoot / 'test' / 'test.js'
pathSrcLib = pathRoot / 'src' / 'lib'

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

def updateWebTests(path_root, path_deps):
  re_start = re.compile(r"^\s*<\!--\s+DYNAMIC DEPS START\s+-->\s*$")
  re_end = re.compile(r"^\s*<\!--\s+DYNAMIC DEPS END\s+-->\s*$")
  global pathRoot
  files = [x for x in path_root.rglob('*')
    if x.is_file()
    if os.path.basename(x).endswith('.test.js')]
  for path_test in files:
    print(f'Updating {path_test}')
    relative = path_test.relative_to(pathRoot)
    root = '../' * (len(relative.parts) - 1)
    path_base = path_test.with_suffix('').with_suffix('')
    basename = path_base.stem
    path_in = path_base.with_suffix('.in.xml')
    path_out = path_base.with_suffix('.test.html')
    lines = []
    lines.append(f'''<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Mocha Tests</title>
    <script src="{root}src/lib/xregexp-all/xregexp-all.js"></script>
    <script src="{root}src/lib/brython/www/src/brython.js"></script>
    <script src="{root}src/lib/brython/www/src/brython_stdlib.js"></script>
    <script src="{root}src/lib/closure-library/closure/goog/base.js"></script>
''')
    with path_deps.open('r', encoding='utf-8') as f:
      s = f.read()
      s = s.replace('PATH_ROOT/', root)
      lines.append(s)
    lines.append(f'''    <link rel="stylesheet" href="{root}node_modules/mocha/mocha.css">
</head>
<body style="background-color: snow">
  <div id="eyo-desk" style="height: 95.375px; width: 412.5px;"></div>
  <div id="mocha"></div>
  <script src="{root}node_modules/mocha/mocha.js"></script>
  <script src="{root}node_modules/chai/chai.js"></script>
  <script>mocha.setup('bdd')</script>
  <script src="{root}test/common.test.js"></script>
  <script src="./{basename}.test.js" charset="utf-8"></script>
  <script src="{root}/src/lib/eyo/debugging.js"></script>
  <script>
    mocha.run();
  </script>
''')
    try:
      with path_in.open('r', encoding='utf-8') as f:
        s = f.read()
        lines.append(s)
    except: pass
    lines.append(f'''</body>
</html>
''')
    path_out.write_text(''.join(lines), encoding='utf-8')
  return 0

print('Step 3:')
print('=======')
print('Update source files.')
out = updateBuild(pathRoot / 'bin' / 'build.sh',
                  pathRoot / 'bin' / 'build.sh',
                pathBuild / 'deps-build.txt'
                  )

out = updateWeb(pathRoot / 'src' / 'index.ejs',
                pathRoot / 'src' / 'index.ejs',
                     pathBuild / 'deps-vue.txt')

out = updateTest(pathRoot / 'test' / 'import.js',
                pathRoot / 'test' / 'import.js',
                     pathBuild / 'deps-test-import.txt')

out = updateWebTests(pathRoot / 'src/lib/eyo', pathBuild / 'deps-web-test.txt')

try:
    out = updateWeb(pathRoot / 'sandbox' / 'html' / 'toolbox.html',
                    pathRoot / 'sandbox' / 'html' / 'toolbox.html',
                    pathBuild / 'deps-web-dev.txt')
except:
    # this is just a convenient method to update developer's test file
    pass
exit(out)
