"""
Inspect the files.
"""
from pathlib import Path
import regex as re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'


def swap_provide_require():
  ps = [p for p in eyo_path.glob('**/*.js')]
  while len(ps):
    new_p = []
    for p in ps:
      content = p.read_text()
      m = re.search('(?<provide>^goog\.provide.*?$)(?<middle>.*?)(?<require>^goog\.require.*?$)', content, re.S | re.M)
      if m:
        new_p.append(p)
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
        p.write_text(replace)
    ps = new_p

def late_provide():
  for p in eyo_path.glob('**/*.js'):
    content = p.read_text()
    ra = content.split('goog.provide')
    if len(ra) > 1:
      n = len(content) - len(ra[-1])
      if n > 3000:
        print(n, p)

late_provide()
