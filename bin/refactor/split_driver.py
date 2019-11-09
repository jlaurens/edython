"""
Once the drivers as UI delegates were gathered into one big file.
"""
from pathlib import Path
import regex as re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'

map_proto = {}
map_call = {}

for p in eyo_path.glob('**/*.js'):
  stem = p.stem
  name = stem.split('_')[-1]
  if name in ['svg', 'dom', 'effect', 'dragger', 'dnd']: continue
  with p.open() as f:
    content = f.read()
    all = re.findall(r'((?:Driver|Dom|Svg))\.prototype\.(((\p{Ll})(rashCan|rickDragger|\p{Ll}*?))(\p{Lu})(\w*))', content)
    for m in all:
      driver = m[0]
      find = m[1]
      head = m[2]
      first = m[3]
      lower = m[4]
      upper = m[5]
      rest = m[6]
      if head is 'contour':
        continue
      if head is 'path':
        continue
      if head is 'disconnect':
        continue
      if head.lower() == name or name == 'driver':
        k = f'{driver}.prototype.{find}'
        v = f'{driver}.{first.upper()}{lower}.prototype.{upper.lower()}{rest}'
        if k.endswith('Init') or k.endswith('Dispose'):
          v = v + 'UI'
        map_proto[k] = v
        k = f'.{find}'
        v = f'.{upper.lower()}{rest}'
        if k.endswith('Init') or k.endswith('Dispose'):
          v = v + 'UI'
        map_call[k + '('] = v + '('
      else:
        print('IGNORED', head, name)

for k in map_proto.keys():
  print(f'{k} -> {map_proto[k]}')

for k in map_call.keys():
  print(f'{k} -> {map_call[k]}')


# First change only the init/dispose

for p in eyo_path.glob('**/*.js'):
  stem = p.stem
  name = stem.split('_')[-1]
  if name in ['svg', 'dom', 'effect', 'dragger', 'dnd']: continue
  content = content0 = p.read_text()
  for k in map_proto.keys():
    content = content.replace(k, map_proto[k])
  for k in map_call.keys():
    content = content.replace(k, map_call[k])
  if content is not content0:
    print(f'SAVING to {p}')
    p.write_text(content)

