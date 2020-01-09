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
    content = p.read_text()
    if re.search(r'=>\s*\n\s*\{', content):
      ra = re.split(r'=>\s*\n\s*\{', content)
      content = '=> {'.join(ra)
      p.write_text(content)

refactor()
