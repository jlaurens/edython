"""
Inspect the files.
"""
from pathlib import Path
import re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'

names = set()

def get_names():
  for p in eyo_path.rglob('*.js'):
    with p.open() as f:
      for l in f.readlines():
        m = re.search(r'''eYo\.(?:provide|require|forwardDeclare)\(['"](?P<ns>[A-Z][^\s.]*(?:\.[A-Z][^\s.]*)*)['"]\)''', l)
        if m:
          names.add(m.group('ns'))

def sentence_case(str):
  mapper = {
    'ID': 'Id',
    'TKN': 'Tkn',
    'GMR': 'Gmr',
    'DnD': 'Dnd',
    'XRE': 'Xre',
    'BSMOwned': 'BsmOwned'
  }
  return '.'.join(
    map(lambda s: s[0].lower()+s[1:],
        map(lambda s: mapper[s] if s in mapper else s, str.split('.'))))

def title_case(s):
  return s[0].upper() + s[1:]

def refactor_usage():
  for p in eyo_path.rglob('*.js'):
    content = p.read_text()
    for name in names:
      print(f"eYo.{name} -> eYo.{sentence_case(name)}")
      # content = content.replace(f"eYo.{name}", f"eYo.{sentence_case(name)}")
      content = content.replace(f"'{name}'", f"'{sentence_case(name)}'")
    p.write_text(content)

# regex = re.compile(r"(?:makeClass, makeSubclass, makeDriverClass)\([^)]'[A-Z]")
regex = re.compile(r"lass\([^)']*?'(?P<class>[A-Z]\w*)'")

classes = set()

def get_classes():
  for p in eyo_path.rglob('*.js'):
    with p.open() as f:
      for l in f.readlines():
        m = re.search(regex, l)
        if m:
          classes.add(m.group('class'))


def refactor_classes():
  for p in eyo_path.rglob('*.js'):
    lines = []
    before = p.read_text()
    with p.open() as f:
      for l in f.readlines():
        for name in classes:
          n = sentence_case(name)
          m = re.search(f'eYo[\.\w]*\.(?={n})', l)
          if m:
            print(m, name)
            i = m.span(0)[1]
            l = l [:i] + l[i].upper() + l[i+1:]
        lines.append(l)
    after = ''.join(lines)
    if after != before and len(after) == len(before):
      print(f'Updating {p}')
      p.write_text(after)

"""
    while True:
      m = re.search(regex, content)
      if m:
        i = m.span(0)[1]
        letter = content[i-1]
        l = len(content)
        content = content[:i-1] + letter.lower() + content[i:]
        assert l == len(content)
      else:
        break
    p.write_text(content)
"""

get_names()
get_classes()

print(names)
print(classes)

refactor_usage()
refactor_classes()

print('done')
