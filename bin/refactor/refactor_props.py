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
    with p.open() as f:
      all = []
      suffix = None
      between = False
      def process(l):
        all.append(l)
      for l in f.readlines():
        if suffix:
          if re.match(suffix, l):
            def process(l):
              all.append(l)
            suffix = None
            continue
        else:
          m = re.match(r'^(?P<prefix>\s+)(?:statement|props).*', l)
          if m:
            prefix = m.group('prefix')
            suffix = rf'^{prefix}}}.*'
            between = True
            def process(l):
              all.append(re.sub('^  ', '', l))
            continue
        process(l)
      if between:
        print(p)
        p.write_text(''.join(all))

refactor()
