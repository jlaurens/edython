import shutil
from my_util import *

def copy(src):
  
  print(
    format.emph('Copy'),
    path_t3_src.relative_to(path_root) / src,
    '→',
    path_t3_dst.relative_to(path_root) / src
  )
  shutil.copy2(str(path_t3_src / src), str(path_t3_dst))

copy('t3.js')
copy('t3_all.js')
print(format.ok('... DONE'))
