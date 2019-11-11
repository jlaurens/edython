from pathlib import Path

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'
driver_path = eyo_path / 'src/application/driver'

for p in driver_path.glob('*'):
  if p.is_dir():
    start = p.stem
    prefix = start + '_'
    for q in p.glob('*'):
      if q.is_file():
        if not q.name.startswith(start):
          print(f'{q} => {q.with_name(prefix+q.name)}')
          q.rename(q.with_name(prefix+q.name))
