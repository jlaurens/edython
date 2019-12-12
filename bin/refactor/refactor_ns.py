"""
Inspect the files.
"""
from pathlib import Path
import re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'


names = set()

def refactor():
  for p in eyo_path.rglob('*.js'):
    with p.open() as f:
      for l in f.readlines():
        m = re.search(r'eYo\.ns\.(?P<ns>\w+)', l)
        if m:
          names.add(m.group('ns'))
  print(names)

refactor()
