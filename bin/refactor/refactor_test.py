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
    m = re.match(r'^(?P<head>(?:var|const)\s*NS\s*=\s*Object.create\((?:null)?\)\s*)(?P<tail>.*)', content, flags=re.MULTILINE|re.DOTALL)
    if m:
      content = m.group('tail')
      print("CHANGED", p, content)
      p.write_text(content)


refactor()
