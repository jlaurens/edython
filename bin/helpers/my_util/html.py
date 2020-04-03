from pathlib import Path
from .path import *
from .isa import IsA

class HTML:

  def __init__(self, path: IsA(Path, 'full path of the HTML file')):
    # for example .../src/lib/foo/.../bar/chi.test.html
    # all included script come from .../src/lib/
    # foo/.../bar/chi.test.html
    self.to_js = '../'*len(path.parent.relative_to(path_js).parts)
    self.to_lib = '../'*len(path.parent.relative_to(path_lib).parts)
    self.to_root = '../'*len(path.parent.relative_to(path_root).parts)
    self.basename = path.with_suffix('').stem
    self.path = path
    self.parent = path.parent
  
  def head_begin(self):
    self.lines = []
    self.lines.append(f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mocha Tests</title>
''')
    self.script_lib('xregexp-all/xregexp-all.js')
    self.script_lib('brython/www/src/brython.js')
    self.script_lib('brython/www/src/brython_stdlib.js')
    self.script_lib('closure-library/closure/goog/base.js')

  def head_end(self):
    self.lines.append(f'''  <link rel="stylesheet" href="{self.to_root}node_modules/mocha/mocha.css">
</head>
''')

  def body_begin(self):
    self.lines.append(f'''<body style="background-color: snow">
  <div id="eyo-desk" style="height: 95.375px; width: 412.5px;"></div>
  <div id="mocha"></div>
''')
    self.script_root('node_modules/mocha/mocha.js')
    self.script_root('node_modules/chai/chai.js')
    self.script_DATA(f'''
mocha.setup('bdd')
eYo.path_root = '{self.to_root}'
eYo.path_js = '{self.to_root}src/lib/eyo/js'
''')
    self.script_js('test/chai_extension.js')
    self.script_js('test/common.test.js')

  def script_DATA(self, data):
    self.lines.append(f'''  <script  type="text/javascript">//<![CDATA[
{data}
//]]></script>
''')

  def body_end(self):
    self.lines.append(f'''</body>
</html>
''')

  def script(self, path):
    self.lines.append(f'''  <script src="{path.relative_to(self.path.parent).as_posix()}"></script>
''')

  def test(self, test=''):
    test = '.test' if test else ''
    self.lines.append(f'''  <script src="{self.basename}{test}.js"></script>
''')

  def script_root(self,relative):
    self.lines.append(f'''  <script src="{self.to_root}{relative}"></script>
''')

  def script_lib(self,relative):
    self.lines.append(f'''  <script src="{self.to_lib}{relative}"></script>
''')

  def script_js(self,relative):
    self.lines.append(f'''  <script src="{self.to_js}{relative}"></script>
''')

  def mocha(self):
    self.lines.append(f'''  <script src="{self.to_lib}eyo/debugging.js"></script>
  <script  type="text/javascript">//<![CDATA[
    mocha.run();//]]></script>
''')

  def write(self):
    self.path.write_text(''.join(self.lines), encoding='utf-8')
  