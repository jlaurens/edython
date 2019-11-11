from pathlib import Path
import regex as re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'
driver_path = eyo_path / 'src/application/driver'
fcls_path = driver_path / 'fcls'
once = False
def refactor(dir):
  path = driver_path / dir
  for p in path.glob('*'):
    try:
      content = p.read_text()
      if not '@license' in content: continue
      if 'makeManagerClass' in content: continue
      if 'makeSubclass' in content: continue
      if not "goog.require('eYo.Driver')" in content: continue
      print(p)
      name = p.stem[5:].capitalize()
      Dir = dir.capitalize()
      pattern = re.escape('''goog.require('eYo.Driver')

goog.provide('eYo.Driver.PLACEHOLDER')

/**
 * Shared application driver.
 */
eYo.Driver.application = Object.create({
  init: eYo.Do.nothing,
  dispose: eYo.Do.nothing,
})''').replace('PLACEHOLDER', r'\S*')
      content = re.sub(pattern, f'''goog.require('eYo.{Dir}')

goog.provide('eYo.{Dir}.{name}')

goog.forwardDeclare('eYo.{name}')

/**
 * Shared application driver.
 */
eYo.{Dir}.makeDriverClass('{name}')''', content)
      if once:
        print(p, content)
        break
      else:
        once = True
        p.write_text(content, encoding='utf-8')
    except UnicodeDecodeError: pass

refactor('dom')
