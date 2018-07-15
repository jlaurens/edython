import pathlib
import shutil

parent = pathlib.Path(__file__).parent
dst = str(parent.parent / 'eyo' / 'core')

def copy(src):
  shutil.copy2(str(parent / src), dst)

copy('T3.js')
copy('T3_all.js')
print('Done')
