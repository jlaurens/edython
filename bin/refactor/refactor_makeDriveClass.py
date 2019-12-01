from pathlib import Path
import regex as re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'

def refactor():
  for p in eyo_path.rglob('*.js'):
    content = p.read_text()
    m = re.search(r'''makeDriverClass\((?<key>'\S*')\)''', content, flags = re.M | re.S)
    if m:
      content = re.sub(r'''makeDriverClass\((?<key>'\S*?')\)''', r'''makeDriverClass({
  key: \1,
)}''', content, flags = re.M | re.S)
      print (content)
      exit(0)

refactor()
