"""
Inspect the files.
"""
from pathlib import Path
import re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'

def last_title_case(s):
  ra = s.split('.')
  s = ra[-1]
  ra[-1] = s[0].upper() + s[1:]
  return '.'.join(ra)

def refactor():
  for p in eyo_path.rglob('*.js'):
    before = p.read_text()
    lines = []
    with p.open() as f:
      for l in f.readlines():
        m = re.search(r't3\.stmt\.(?=[A-Z])', l)
        if m:
          i = m.span(0)[1]
          l = l[:i] + l[i].lower() + l[i+1:]
        lines.append(l)
    after = ''.join(lines)
    if after != before and len(after) == len(before):
      print(f'Updating {p}')
      p.write_text(after)


refactor()

print('done')
