import pathlib
import shutil

parent = pathlib.Path(__file__).parent
dst = str(parent.parent / 'eyo' / 'js' / 'core')

def copy(src):
  shutil.copy2(str(parent / src), dst)

copy('t3.js')
copy('t3_all.js')
print('Done')
