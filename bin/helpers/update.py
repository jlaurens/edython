"""
Generates a dependency javascript file from a directory.
Build test html files.
"""

import re, os, stat, json
from my_util import *
from pathlib import Path
import datetime

if __name__ == "__main__":

  print(format.warning('''Maybe you should run `npm run eyo:prepare` instead.
'''))
  out = update_inline_test()
  out and exit(out)

  out = update_compile_typescript()
  out and exit(out)
