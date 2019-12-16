"""
Once the drivers as UI delegates were gathered into one big file.
"""
from pathlib import Path
import regex as re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'

for p in eyo_path.rglob('*.*'):
  name = p.name
  if name.endswith('_module.js'):
    q = p.with_name('module_' + name[:-10] + '.js')
    p.rename(q)
  elif name.endswith('_module.test.js'):
    q = p.with_name('module_' + name[:-15]+'.test.js')
    p.rename(q)
  elif name.endswith('_module.test.html'):
    q = p.with_name('module_' + name[:-17] + '.test.html')
    p.rename(q)
