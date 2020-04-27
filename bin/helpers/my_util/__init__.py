from .path import *
from .bdd import BDD
from .html import HTML
from .test import getInlineTest
from .termformat import format

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
