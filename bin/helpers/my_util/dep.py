"""
Javascript source dependency.
"""

from .path import *
from .isa import IsA

class Dep:
  def __init__(self,
    bdd: 'Owning dependecies database',
    is_eyo: IsA(bool, 'Whether this is an edython dependency or a google dependency'),
    relative: 'relative path as string.  Reference differs depending on ``is_eyo``',
    provided: 'an array of strings, provided symbols',
    required: 'an array of strings, required symbols',
    forwarded: 'an array of strings, forwarded symbols',
    is_complete:'Whether the dependency is complete.'=False):
    """
    Creates a dependency record in a database.

    :param bdd: the owning database
    :type bdd: BDD
    :param relative: the relative path as string. Reference differs depending on ``is_eyo``.
    :type relative: str
    :param provided: an array of string, provided symbols.
    :type provided: array<str>
    :param required: and array of strings, required symbols.
    :type required: array<str>
    :param forwarded: an array of strings, forwarded symbols.
    :type forwarded: array<str>
    :param is_eyo: Whether the dependency belongs to edython.
    :type is_eyo: bool
    :param is_complete: Whether the dependency is complete.
    :type is_complete: bool
    """
    self.bdd = bdd
    self.is_eyo = is_eyo
    self.relative = relative
    self.provided = provided
    for s in provided:
      if s in required:
        required.remove(s)
      if s in forwarded:
        forwarded.remove(s)
    self.required = required
    for s in required:
      if s in forwarded:
        forwarded.remove(s)
    self.forwarded = forwarded
    self.is_complete: IsA(bool, 'whether the receiver is complete') = is_complete
    self.n: IsA(int, 'The index in the database') = None
    self.level = None # pre requirements
    self.is_required = None

  @property
  def file_name(self):
    p = (component_js if self.is_eyo else component_goog)
    return (p / self.relative).as_posix()

  def __str__(self):
    ra = [f'{self.file_name}({self.level}):']
    ra.append('  provided:')
    if len(self.provided) < 10:
      ra += ['    ' + x for x in self.provided]
    else:
      ra += ['    …']
      i = 0
    ra.append('  required:')
    if len(self.required) < 20:
      ra += ['    ' + x for x in self.required]
    else:
      ra += ['    …']
    ra.append('  forwarded:')
    if len(self.forwarded) < 20:
      ra += ['    ' + x for x in self.forwarded]
    else:
      ra = ra + ['    …']
    return '\n'.join(ra)

  @property
  def order_key(self):
    return self.is_eyo, self.level, self.file_name

  @property
  def json_object(self):
    if not self.is_complete:
      raise RuntimeError(f'Dependency is not complete: {self.file_name}')
    ans = {}
    ans['is_eyo'] = ans.is_eyo
    ans['provided'] = ans.provided
    ans['required'] = ans.required
    ans['forwarded'] = ans.forwarded
    return ans

  def __lt__(self, lhs):
    return self.n < lhs.n if self.n is not None and lhs.n is not None else self.order_key < lhs.order_key
