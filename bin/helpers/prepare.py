"""
Generates a dependency javascript file from a directory.
Build test html files.
"""

import re, os, stat, json
from my_util import *
from pathlib import Path
import datetime
import subprocess

verbose = global_args and global_args.verbose
print(format.title('Collecting dependencies...'))
bdd = get_bdd(verbose=verbose)
print(format.ok('... DONE'))

def minimalTests(path_src):
  print(format.title('Updating minimal tests...'))
  for js in [x for x in path_src.rglob('*.js')
    if x.is_file() if not x.name.endswith('test.js') if not x.name.endswith('test.inline.js')]:
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
  print(format.ok('... DONE'))
  return 0

# read the build.sh, change it and save the modified file to the build
def updateBuild():
  print(format.title('Updating build.sh.'))
  p_in = path_out = path_bin / 'build.sh'
  re_good = re.compile(r"^--js ")
  with p_in.open('r', encoding='utf-8') as f:
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
    print(format.ok('... DONE'))
    return 0
  return 1

def update_ejs():
  p_in = path_out = path_vue / 'index.ejs'
  re_start = re.compile(r"^\s*<\!--\s+DYNAMIC DEPS START\s+-->\s*$")
  re_end = re.compile(r"^\s*<\!--\s+DYNAMIC DEPS END\s+-->\s*$")
  with p_in.open('r', encoding='utf-8') as f:
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
      head.append(f'      <script src="{(path_lib / d.file_name).relative_to(path_src)}"></script>\n')
    head.extend(tail)
    path_out.write_text(''.join(head), encoding='utf-8')
    print(format.ok('... DONE'))
    return 0
  return 1

def update_test():
  print(format.title('Updating web tests...'))
  tests = tuple(x for x in path_js.rglob('*.test.[tj]s') if x.is_file())
  for p_test in tests:
    p_ext = p_test.suffix
    p_base = p_test.parent / (p_test.stem.split('.')[0])
    p_js = p_base.with_suffix(p_ext)
    fn = p_js.relative_to(path_lib).as_posix()
    try:
      d = bdd.by_file_name[fn]
    except KeyError as e:
      for k, v in bdd.by_file_name.items():
        print('k', '->', v)
    p_inline = p_base.with_suffix('.test.inline' + p_ext)
    try:
      html = HTML(p_base.with_suffix('.test.html'))
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
      try:
        with p_inline.open():
          html.test('.test.inline')
      except FileNotFoundError:
        pass
      html.test('.test')
      html.mocha()
      try:
        p_in = p_base.with_suffix('.in.xml')
        html.lines.append(p_in.read_text())
      except FileNotFoundError: pass
      html.body_end()
      html.write()
      print(html.path.relative_to(path_js))
    except Exception as e: raise e
  print(format.ok('... DONE'))
  return 0

def save_html(path, tests):
  if len(set(map(lambda p: p.name.split('.')[0], tests))) > 1:
    html = HTML(path)
    html.head_begin()
    required = set()
    fns = {}
    for p_test in tests:
      p_ext = p_test.suffix
      p_base = p_test.parent / p_test.stem.split('.')[0]
      fn = p_base.with_suffix(p_ext).relative_to(path_lib).as_posix()
      fns[fn] = p_test
      try:
        d = bdd.by_file_name[fn]
        required.add(d)
        required.update(bdd[r] for r in d.required)
        required.update(bdd[r] for r in d.forwarded)
      except KeyError:
        print(format.error('Error: '))
        for d in sorted(bdd.deps, key = lambda x: x.file_name):
          print(d.file_name)
        # raise RuntimeError(f'Missing dependency: {fn}')
    for d in sorted(required):
      html.script_lib(d.file_name)
    html.head_end()
    html.body_begin()
    for fn in sorted(fns.keys(), key=lambda fn: bdd.by_file_name[fn]):
      p_inline = fns[fn].with_suffix('.inline.js')
      try:
        with p_inline.open():
          html.script_lib(p_inline.relative_to(path_lib))
      except FileNotFoundError:
        pass
      html.script(fns[fn])
    html.mocha()
    html.body_end()
    html.write()
    print(html.path.relative_to(path_js))

def update_test_local():
  print(format.title('Updating ./**/test_local.html:'))
  dirs = [x for x in path_js.rglob('*') if x.is_dir()]
  for dir_test in dirs:
    # p_test is path_js/.../
    tests = tuple(dir_test.glob('*.test.js'))
    save_html(dir_test / 'test_local.html', tests)

  print(format.ok('... DONE'))
  return 0

def update_test_dir():
  print(format.title('Updating ./**/test.html:'))
  dirs = [x for x in path_js.rglob('*') if x.is_dir() and x.name != 'test']
  dirs.append(path_js)
  for dir_test in dirs:
    tests = tuple(dir_test.rglob('*.test.js'))
    save_html(dir_test / 'test.html', tests)

  print(format.ok('... DONE'))
  return 0

if __name__ == "__main__":

  out = minimalTests(path_js)
  out and exit(out)

  out = updateBuild()
  out and exit(out)

  out = extract_inline_test()
  out and exit(out)

  out = compile_typescript()
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
