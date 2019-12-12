"""
Once the drivers as UI delegates were gathered into one big file.
"""
from pathlib import Path
import regex as re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'

for p in eyo_path.glob('**/*.js'):
  name = p.name
  if name.endwith('__model.js'):
    q = p.with_name(name[:-10]+'__module.js')
    p.rename(q)
