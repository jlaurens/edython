"""
Generates a dependency javascript file from a directory.
Build test html files.
"""

from .path import *
from .termformat import *
from pathlib import Path
import subprocess

def compile(p):
  print(p_ts.relative_to(path_js))
  subprocess.run(["npx", "tsc", p_ts.relative_to(path_root).as_posix()], check=True)

def compile_typescript():
  print(format.title('Compiling typescript...'))
  tests_ts = tuple(x for x in path_js.rglob('*.ts') if x.is_file())
  for p_ts in tests_ts:
    compile(p_ts)
  print(format.ok('... DONE'))

def update_compile_typescript():
  print(format.title('Compiling typescript...'))
  tests_ts = tuple(x for x in path_js.rglob('*.ts') if x.is_file())
  for p_ts in tests_ts:
    p_js = (p_ts.parent / p_ts.stem).with_suffix('.js')
    try:
      if p_js.stat().st_mtime < p_ts.stat().st_mtime:
        print(f'Skip {p_ts.relative_to(path_js)}')
        continue
    except: pass
    compile(p_ts)
  print(format.ok('... DONE'))
