class HTML:

  def head(root):
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mocha Tests</title>
  <script src="{root}src/lib/xregexp-all/xregexp-all.js"></script>
  <script src="{root}src/lib/brython/www/src/brython.js"></script>
  <script src="{root}src/lib/brython/www/src/brython_stdlib.js"></script>
  <script src="{root}src/lib/closure-library/closure/goog/base.js"></script>
'''

  def deps(path_deps_web_test, root):
    ans = ''
    with path_deps_web_test.open('r', encoding='utf-8') as f:
      ans = f.read()
      ans = ans.replace('PATH_ROOT/', root)
    return ans

  def body(root, js):
    return f'''    <link rel="stylesheet" href="{root}node_modules/mocha/mocha.css">
  </head>
  <body style="background-color: snow">
    <div id="eyo-desk" style="height: 95.375px; width: 412.5px;"></div>
    <div id="mocha"></div>
    <script src="{root}node_modules/mocha/mocha.js"></script>
    <script src="{root}node_modules/chai/chai.js"></script>
    <script  type="text/javascript">//<![CDATA[
mocha.setup('bdd')
eYo.path_root = '{root}'
eYo.path_js = '{js}'
//]]></script>
    <script src="{js}test/chai_extension.js"></script>
    <script src="{js}test/common.test.js"></script>
'''

  def test(basename):
    return HTML.script(f'./{basename}.test.js')

  def script(relative):
    return f'''    <script src="./{relative}" charset="utf-8"></script>
'''

  def mocha(root):
    return f'''    <script src="{root}src/lib/eyo/debugging.js"></script>
    <script  type="text/javascript">//<![CDATA[
      mocha.run();//]]></script>
'''
