from pathlib import Path
import regex as re

project_path = Path(__file__).resolve().parent.parent.parent
src_path = project_path / 'src'
eyo_path = project_path / 'src/lib/eyo'
driver_path = eyo_path / 'js/application/driver'
fcls_path = driver_path / 'fcls'

once = False
def refactor():
  for p in driver_path.rglob('*.js'):
    content = p.read_text()
    if re.search(r'eYo.Svg.\S*?.prototype.initUI\s*=\s*eYo.(?:Svg|Dom).Decorate.initUI\([^)]*?function\s*\(', content):
      content = re.sub(r'eYo.Svg.\S*?.prototype.initUI\s*=\s*eYo.(?:Svg|Dom).Decorate.initUI\([^)]*?function\s*', 'initUI ', content)
      p.write_text(content)
    if re.search(r'eYo.Svg.\S*?.prototype.disposeUI\s*=\s*eYo.(?:Svg|Dom).Decorate.disposeUI\([^)]*?function\s*\(', content):
      content = re.sub(r'eYo.Svg.\S*?.prototype.disposeUI\s*=\s*eYo.(?:Svg|Dom).Decorate.disposeUI\([^)]*?function\s*', 'disposeUI ', content)
      p.write_text(content)
    if re.search(r'eYo.Svg.\S*?.prototype.initUI\s*=\s*eYo.Svg.eyo.initUIMake', content):
      content = re.sub(r'eYo.Svg.\S*?.prototype.initUI\s*=\s*eYo.Svg.eyo.initUIMake\s*', 'initUI ', content)
      p.write_text(content)
    if re.search(r'eYo.Svg.\S*?.prototype.disposeUI\s*=\s*eYo.Svg.eyo.disposeUIMake', content):
      content = re.sub(r'eYo.Svg.\S*?.prototype.disposeUI\s*=\s*eYo.Svg.eyo.disposeUIMake\s*', 'disposeUI ', content)
      p.write_text(content)

#eYo.Svg.Brick.prototype.initUI = eYo.Svg.eyo.initUIMake
#eYo.Dom.Desk.prototype.initUI = eYo.Dom.Decorate.initUI(function(
refactor()
