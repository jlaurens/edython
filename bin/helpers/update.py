"""
Generates a dependency javascript file from a directory.
Build test html files.
"""

import re, os, stat, json
from my_util import *
from pathlib import Path
import datetime

def update_inline_test():
  print(format.title('Updating inline tests...'))
  tests = (x for x in path_js.rglob('*.test.js') if x.is_file())
  for p_test in tests:
    p_base = p_test.parent / (p_test.stem.split('.')[0])
    p_js = p_base.with_suffix('.js')
    p_inline = p_base.with_suffix('.test.inline.js')
    try:
      if p_js.stat().st_mtime < p_inline.stat().st_mtime:
        print(f'Skip {p_inline.relative_to(path_js)}')
        continue
    except: pass
    it = getInlineTest(p_js)
    if len(it):
      print(format.emph(f'Update {p_inline.relative_to(path_js)}'))
      p_inline.write_text(f'// This file was generated by "update.py" on {datetime.datetime.utcnow()}\n\n' + it)
    else:
      try:
        p_inline.unlink()
      except FileNotFoundError:
        pass
  print(format.ok('... DONE'))
  return 0

if __name__ == "__main__":

  print(format.warning('''Maybe you should run `npm run eyo:prepare` instead.
'''))
  out = update_inline_test()
  exit(out)