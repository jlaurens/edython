import re
from .formatter import Formatter

class Type:
    """A Type represents a python 3 expression or statement"""

    re_name = re.compile(r"^\s*(?P<name>"
                         r"(?P<is_name>name)|(?P<is_suite>suite)|(?P<is_statement>statement)"
                         r"|"
                         r"(?:"
                         r"(?P<is_stmt_1>sstmt_|statement_)?"
                         r"\S+?"
                         r"(?:(?P<is_stmt_2>_stmt|_statement|def)|(?P<is_part>_part)?)"
                         r")"
                         r")\s*$")
    re_compound = re.compile(r"^.*\bsuite\b.*$")
    re_statement = re.compile(r"^.*(?:\bNEWLINE\b|decorator).*$")

    def __init__(self, n, name, definition = ''):
        """
        n is the line number,
        name is the expression or statement name: proper_slice, m_Type, and_test...
        definition is the rhs in the ... ::= ... line
        """
        self.n = n
        self.count = 0
        self.require = []
        self.provide = []
        self.deep_require = []
        self.deep_provide = []
        self.is_wrapper = False
        self.ignored = False
        self.one_shot = True
        self.is_list = None
        self.list_separator = None
        self.list_require = []
        self.alias = None
        self.setup_name(name)
        self.definition = None
        self.setup_definition(definition)

    def setup_name(self, name):
        self.name = name
        self.short_name = None
        m = self.__class__.re_name.match(name)
        assert m, 'Bad name '+name
        assert not m.group('is_name') and not m.group('is_suite') and not m.group('is_statement'), 'Bad name too '+name
        self.is_part = not not m.group('is_part')
        self.is_stmt = self.is_part or not not m.group('is_stmt_1') or not not m.group('is_stmt_2')

    def setup_definition(self, definition):
        if self.definition and len(self.definition):
            print('****  Overriding the definition of', self.name)
            print('old ::=', self.definition)
            print('new ::=', definition)
        self.definition = definition
        m = self.__class__.re_compound.match(definition)
        self.is_compound = not not m if m else None
        if self.__class__.re_statement.match(definition):
            self.is_stmt = True

    def get_normalized_definition(self):
        return Formatter.normalize(self.definition)

    def get_shortenized_definition(self):
        return Formatter.shortenize(self.definition)

    def get_minimized_definition(self):
        return Formatter.minimize(self.definition)


    def __repr__(self):
        return repr(self.__dict__)
