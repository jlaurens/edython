"""
Inspect the files.
"""
from pathlib import Path
import re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'

def refactor():
  for p in eyo_path.rglob('*.js'):
    lines = []
    before = p.read_text()
    with p.open() as f:
      for l in f.readlines():
        m = re.search(r"lass\([^)']'(?=[a-z])", l)
        if m:
          i = m.span(0)[1]
          l = l[:i] + l[i].upper() + l[i+1:]
        lines.append(l)
    after = ''.join(lines)
    if after != before and len(after) == len(before):
      print(f'Updating {p}')
      p.write_text(after)


refactor()

print('done')
