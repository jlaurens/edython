"""
Generates a dependency javascript file from a directory.
Build test html files.
"""

import re, os, stat, json
from my_util import *
from pathlib import Path

verbose = global_args and global_args.verbose
print('Collecting dependencies...')
bdd = get_bdd(verbose=verbose)
print('... DONE')

print(*bdd['eYo.attr'].required, sep='\n')

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

# read the build.sh, change it and save the modified file to the build
def updateBuild():
  print('Updating build.sh.')
  path_in = path_out = path_bin / 'build.sh'
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
    # path_deps_build
    # --js "src/lib/closure-library/closure/goog/color/names.js" \
    for d in bdd.required_deps:
      head.append(f'--js "{d.file_name}" \\\n')
    head.extend(tail)
    path_out.write_text(''.join(head), encoding='utf-8')
    st = os.stat(path_out.as_posix())
    os.chmod(path_out.as_posix(), st.st_mode | stat.S_IEXEC)
    print('... DONE')
    return 0
  return 1

def update_ejs():
  path_in = path_out = path_src / 'index.ejs'
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
    # path_deps_build :
    for d in bdd.required_deps:
      """
  <!--  DYNAMIC DEPS START  -->
  <script src="lib/closure-library/closure/goog/color/names.js"></script>
      """
      head.append(rf'      <script src="{(path_lib / d.file_name).relative_to(path_src)}"></script>\n')
    head.extend(tail)
    path_out.write_text(''.join(head), encoding='utf-8')
    print('... DONE')
    return 0
  return 1

def update_test():
  print('Updating web tests...')
  # dependencies: read path_deps_tree
  dependencies = json.loads(path_deps_tree.read_text())
  tests = (x for x in path_js.rglob('*.test.js') if x.is_file())
  for path_test in tests:
    path_base = path_test.with_suffix('').with_suffix('')
    fn = path_base.with_suffix('.js').relative_to(path_lib).as_posix()
    try:
      d = bdd.by_file_name[fn]
    except KeyError as e:
      for k, v in bdd.by_file_name.items():
        print('k', '->', v)
      raise e
    for r in d.required:
      dd = bdd[r]
    try:
      html = HTML(path_base.with_suffix('.test.html'))
      html.head_begin()
      for r in d.required:
        dd = bdd[r]
        html.script_lib(dd.file_name)
      html.test()
      for r in d.forwarded:
        dd = bdd[r]
        html.script_lib(dd.file_name)
      html.head_end()
      html.body_begin()
      html.test(True)
      html.mocha()
      try:
        path_in = path_base.with_suffix('.in.xml')
        html.lines.append(path_in.read_text())
      except FileNotFoundError: pass
      html.body_end()
      html.write()
      print(html.path.relative_to(path_js))
    except Exception as e: raise e; pass
  print('... DONE')
  return 0

def save_html(path, tests):
  if len(tests) > 1:
    html = HTML(path)
    html.head_begin()
    required = set()
    fns = {}
    for path_test in tests:
      path_base = path_test.with_suffix('').with_suffix('')
      fn = path_base.with_suffix('.js').relative_to(path_lib).as_posix()
      fns[fn] = path_test
      d = bdd.by_file_name[fn]
      if not d:
        raise RuntimeError(f'Missing dependency: {fn}')
      required.add(d)
      required.update(bdd[r] for r in d.required)
      required.update(bdd[r] for r in d.forwarded)
    for d in sorted(required):
      html.script_lib(d.file_name)
    html.head_end()
    html.body_begin()
    for fn in sorted(fns.keys(), key=lambda fn: bdd.by_file_name[fn]):
      html.script(fns[fn])
    html.mocha()
    try:
      path_in = path_base.with_suffix('.in.xml')
      html.lines.append(path_in.read_text())
    except FileNotFoundError: pass
    html.body_end()
    html.write()
    print(html.path.relative_to(path_js))

def update_test_dir():
  print('Updating ./**/test.html:')
  dirs = [x for x in path_js.rglob('*') if x.is_dir()]
  dirs.append(path_js)
  for dir_test in dirs:
    tests = list(dir_test.rglob('*/*.test.js'))
    save_html(dir_test / 'test.html', tests)
 
  print('... DONE')
  return 0

def update_test_local():
  print('Updating ./**/test_local.html:')
  dirs = [x for x in path_js.rglob('*') if x.is_dir()]
  for dir_test in dirs:
    # path_test is path_js/.../
    tests = list(dir_test.glob('*.test.js'))
    save_html(dir_test / 'test_local.html', tests)

  print('... DONE')
  return 0

if __name__ == "__main__":
  print('Preparing dependencies:')
  print('=======================')

  out = minimalTests(path_js)
  out and exit(out)

  out = updateBuild()
  out and exit(out)

  out = update_test()
  out and exit(out)
  out = update_test_local()
  out and exit(out)
  out = update_test_dir()
  out and exit(out)

  out = update_ejs()
  out and exit(out)

  exit(out)

# vue: '''      <script src="{Path(r).relative_to('src').as_posix()}"></script>\n'''