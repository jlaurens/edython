"""
Inspect the files.
"""
from pathlib import Path
import regex as re
import subprocess

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'

count = 10

def inherits():
  ps = [p for p in eyo_path.rglob('*.js')]
  if len(ps):
    for p in ps:
      content = p.read_text()
      m = re.search(r'''makeDriverClass\('(\S*)'\)''', content, flags = re.S | re.M)
      if m:
        print(p.relative_to(eyo_path))


inherits()
