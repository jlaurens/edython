import re
from .formatter import Formatter

class Type:
    """A Type represents a python 3 expression or statement"""

    def __init__(self, n, name, definition = ''):
        """
        n is the line number,
        name is the expression or statement name: proper_slice, m_Type, and_test...
        definition is the rhs in the ... ::= ... line
        """
        self.n = n
        self.name = name
        self.definition = definition
        self.count = 0
        self.require = []
        self.provide = []
        self.deep_require = []
        self.deep_provide = []
        self.wrapper = False
        self.one_shot = True
        re_name = re.compile(r"^\s*(?P<name>"
                                   r"(?P<is_name>name)|(?P<is_suite>suite)|(?P<is_statement>statement)"
                                   r"|"
                                   r"(?:"
                                   r"(?P<is_stmt_1>sstmt_|statement_)?"
                                   r"\S+?"
                                   r"(?:(?P<is_stmt_2>_stmt|_statement|def)|(?P<is_part>_part)?)"
                                   r")"
                                   r")\s*$")
        m = re_name.match(name)
        assert m, 'Bad name '+name
        assert not m.group('is_name') and not m.group('is_suite') and not m.group('is_statement'), 'Bad name too '+name
        self.is_part = not not m.group('is_part')
        self.is_stmt = self.is_part or not not m.group('is_stmt_1') or not not m.group('is_stmt_2')
        self.is_list = None
        self.list_require = []
        self.list_separator = None
        self.alias = None

    def get_normalized_definition(self):
        return Formatter.normalize(self.definition)

    def get_shortenized_definition(self):
        return Formatter.shortenize(self.definition)


    def __repr__(self):
        return repr(self.__dict__)
