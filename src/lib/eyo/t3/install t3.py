import pathlib
import shutil

t3_path = pathlib.Path(__file__).parent
dst = str(t3_path.parent / 'js' / 'core')

def copy(src):
  shutil.copy2(str(t3_path / src), dst)

copy('t3.js')
copy('t3_all.js')
print('Done')
