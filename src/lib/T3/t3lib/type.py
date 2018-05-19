import re
from .formatter import Formatter


class Type:
    """A Type represents a python 3 expression or statement"""

    re_name = re.compile(r"^\s*(?P<name>"
                         r"(?P<is_group>if|elif|else|for|while|with|funcdef|classdef|"
                         r"try|except|void_except|try_else|finally|last_else)"
                         r"|(?P<is_suite>suite)|(?P<is_statement>statement|stmt_list)"
                         r"|(?:"
                         r"(?P<is_stmt_1>stmt_|statement_)?"
                         r"\S+?"
                         r"(?:(?P<is_stmt_2>_stmt|_statement|def)|(?P<is_part>_part)?)"
                         r")"
                         r")\s*$")
    re_compound = re.compile(r"^.*\bsuite\b.*$")
    re_statement = re.compile(r"^.*(?:\bNEWLINE\b).*$")

    def __init__(self, n, name, definition='', category='unknown'):
        """
        n is the line number,
        name is the expression or statement name: proper_slice, m_Type, and_test...
        definition is the rhs in the ... ::= ... line
        """
        self.n = n
        self.category = category
        self.count = 0
        self.require = []
        self.provide = []
        self.similar = []
        self.deep_require = []
        self.deep_provide = []
        self.is_wrapper = False
        self.ignored = False
        self.one_shot = True
        self.is_list = None
        self.is_shallow = False
        self.is_shallow_required = False
        self.list_separator = None
        self.list_require = []
        self.alias = None
        self.same_checks = None
        self.is_group = None
        self.is_part = None
        self.is_compound = None
        self.is_stmt = None
        self.definition = None
        self.to_dom = None
        self.setup_name(name)
        self.setup_definition(definition)

    def setup_name(self, name):
        self.name = name
        self.short_name = None
        self.setup_stmt_()

    def setup_definition(self, definition, append=False):
        if self.definition and len(self.definition):
            if append:
                if len(definition):
                    candidate = self.definition + ' | ' + definition
                    print('****  Overriding the definition of', self.name)
                    print('old ::=', self.definition)
                    print('new ::=', candidate)
                else:
                    return
            else:
                candidate = definition
            print('DEFINITION CHANGE OF', self.name, ':', self.definition, '->', candidate)
        else:
            candidate = definition
        self.definition = candidate
        self.setup_stmt_()

    def setup_stmt_(self):
        if self.definition is not None:
            m = self.__class__.re_name.match(self.name)
            assert m, 'Bad name: ' + self.name
            assert not m.group('is_suite') and not m.group('is_statement'), 'Bad name too: ' + self.name
            self.is_group = not not m.group('is_group')
            self.is_part = not not m.group('is_part')
            self.is_compound = not not self.__class__.re_compound.match(self.definition)
            self.is_stmt = not not m.group('is_stmt_1') \
                           or not not m.group('is_stmt_2') \
                           or self.is_part \
                           or self.is_compound \
                           or not not self.__class__.re_statement.match(self.definition)

    def get_normalized_definition(self):
        return Formatter.normalize(self.definition)

    def get_shortenized_definition(self):
        return Formatter.shortenize(self.definition)

    def get_minimized_definition(self):
        return Formatter.minimize(self.definition)

    def get_checks(self):
        L = None
        if not self.is_list and not self.alias and not self.is_shallow:
            L = self.deep_require
        elif self.is_list:
            L = self.list_require
        else:  # if self.is_shallow:
            L = self.require
        return sorted([t for t in L if not t.is_wrapper], key=lambda t: (t.n, t.name))

    def __repr__(self):
        return repr(self.__dict__)
