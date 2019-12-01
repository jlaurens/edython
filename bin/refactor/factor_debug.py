from pathlib import Path
import re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'
driver_path = eyo_path / 'js/application/driver'
fcls_path = driver_path / 'fcls'

def refactor():
  for p in eyo_path.rglob('*.js'):
    content = p.read_text()
    if not re.search(r'eYo.Debug.test\s*\(', content, flags = re.M|re.S):
      line = f'''
eYo && eYo.Debug && eYo.Debug.test && eYo.Debug.test('{p}') // remove this line when finished
'''
      p.write_text(line + content + line)

def defactor():
  for p in eyo_path.rglob('*.js'):
    content = p.read_text()

    if re.search(r'^eYo && eYo.Debug && eYo.Debug.test && eYo.Debug.test\(', content, flags = re.M|re.S):
      content = re.sub(r'.^eYo && eYo.Debug && eYo.Debug.test && eYo.Debug.test\(.*$.', '', content, flags = re.M|re.S)
      p.write_text(content)

# refactor()
defactor()
