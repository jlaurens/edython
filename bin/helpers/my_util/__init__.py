from .path import *
from .build_deps import build_deps
from .sort_deps import sort_deps
from .bdd import BDD, re_addDep
from .html import HTML

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

def make_bdd(*args, verbose=False):
  global bdd
  bdd = BDD(*args, verbose=verbose)