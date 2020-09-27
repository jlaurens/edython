from .path import *
from .bdd import BDD
from .html import HTML
from .termformat import format
from .test import extract_inline_test, update_inline_test
from .compile import compile_typescript, update_compile_typescript

bdd = None

global_args = None
def parse_args():
  global global_args
  import argparse

  parser = argparse.ArgumentParser(description='Tool.')

  parser.add_argument('--verbose', dest='verbose', action='store_const',
                      const=True, default=False,
                      help='Be verbose')

  global_args = parser.parse_args()

def get_bdd(verbose=False):
  global bdd
  if bdd is None: bdd = BDD()
  return bdd
