"""
Inspect the files.
"""
from pathlib import Path
import regex as re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'

for p in eyo_path.glob('**/*.js'):
  content = p.read_text()
  m = re.search('(?<provide>^goog\.provide.*?$)(?<middle>.*?)(?<require>^goog\.require.*?$)', content, re.S | re.M)
  if m:
    before = content[:m.span(0)[0]]
    after = content[m.span(0)[1]:]
    provide = m.group('provide')
    middle = m.group('middle')
    require = m.group('require')
    print(f'''*** replace:
{provide}{middle}{require}
*** by
{require}{middle}{provide}
''')
    replace = before + require + middle + provide + after
    
print(p, m)
