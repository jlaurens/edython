from sty import fg, bg, ef, rs, Style, RgbFg, Sgr

class format:

  @classmethod
  def title(cls, what): return f'{ef.b}{ef.u}{what}{rs.u}{rs.all}'

  @classmethod
  def emph(cls, what): return f'{ef.b}{what}{rs.all}'

  @classmethod
  def error(cls, what): return f'{ef.b}{fg.red}{what}{fg.rs}{rs.all}'

  @classmethod
  def ok(cls, what): return f'{ef.b}{fg.green}{what}{fg.rs}{rs.all}'

  @classmethod
  def warning(cls, what): return f'{ef.b}{fg.magenta}{what}{fg.rs}{rs.all}'

if __name__ == '__main__':
  print(format.title('title: hello world!'))
  print(format.emph('emph: hello world!'))
  print(format.error('error: hello world!'))
  print(format.warning('warning: hello world!'))
  print(format.ok('ok: hello world!'))
