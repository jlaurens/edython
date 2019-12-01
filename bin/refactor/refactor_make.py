from pathlib import Path
import regex as re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'
driver_path = eyo_path / 'js/application/driver'
fcls_path = driver_path / 'fcls'

def refactor():
  for p in eyo_path.rglob('*.js'):
    content = p.read_text()
    if re.search(r'makeSubclass\(\{.*?key:\s*\S*\s*,\s*', content, flags = re.M|re.S):
      content = re.sub(r'makeSubclass\(\{(\s*?)key:\s*(\S*?)\s*,\s*', r'makeSubclass(\2, {\1', content, flags = re.M|re.S)
      p.write_text(content)

refactor()
