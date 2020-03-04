import re

class Formatter:

    symbols = {
        '(': 'LPAR',
        ')': 'RPAR',
        '[': 'LBRACKET',
        ']': 'RBRACKET',
        '|': 'PIPE',
        '@': 'AT',
        '->': 'ARROW',
        '=': 'EQUALS',
        ',': 'COMMA',
        '*': 'STAR',
        '**': 'DOUBLE_STAR',
        ':': 'COLON',
        ';': 'SEMICOLON',
        '.': 'DOT',
        '...': 'THREE_DOTS',
    }
    # https://docs.python.org/3.7/reference/lexical_analysis.html#keywords
    keywords = [
        'False', 'await', 'else', 'import', 'pass',
        'None', 'break', 'except', 'in', 'raise',
        'True', 'class', 'finally', 'is', 'return',
        'and', 'continue', 'for', 'lambda', 'try',
        'as', 'def', 'from', 'nonlocal', 'while',
        'assert', 'del', 'global', 'not', 'with',
        'async', 'elif', 'if', 'or', 'yield']
    re_optional_1 = re.compile(r'\[[^\[\]]*\]')
    re_optional_n = re.compile(r'\([^\(\)]*\)\s*\*')
    re_parenth_1 = re.compile(r'^\s*(?:OPTIONAL\s*)*\(([^\)]*)\)\s*(?:OPTIONAL\s*)*$')
    re_parenth_2 = re.compile(r'\(([^\)]*)\|([^\)]*)\)')
    re_identifier_only = re.compile(r'^\s*(?P<identifier>[a-z_][a-z_\d]*)\s*$')
    re_identifier_option = re.compile(r'^\s*(?P<identifier>[a-z_][a-z_\d]*)\s*\[\s*(?P<option>[^\[\]]+?)\s*\]\s*$')

    @classmethod
    def normalize(cls, text):
        """
        Change text into some normalized format.
        Used essentially to compare definitions.
        :param text: the definition of a type
        :return: text with symbols replaced by an uppercase textual representation,
        keywords are changed the same way, with their enclosing quote.
        """
        data = text
        for k, v in cls.symbols.items():
            data = data.replace('"' + k + '"', " " + v + " ")
        for k in cls.keywords:
            data = data.replace('"' + k + '"', " " + k.upper() + " ")
        data = cls.re_parenth_1.sub(r'\g<1>', data)
        data = cls.re_parenth_2.sub(r'BGROUP \g<1> OR \g<2> EGROUP', data)
        data = re.sub(r'^ +', '', data)
        for k in ['(', ')', '[', ']', '|']:
            data = data.replace(k, ' ' + k + ' ')
        data = re.sub(r' +', ' ', data)
        return data

    @classmethod
    def shortenize(cls, text):
        """
        After normalization
        :param text: the normalized definition of a type
        :return: text with optional patterns replace by the word "OPTIONAL"
        """
        data = cls.normalize(text)
        while True:
            data, n = cls.re_optional_1.subn('OPTIONAL', data)
            if not n: break
        while True:
            data, n = cls.re_optional_n.subn('OPTIONAL', data)
            if not n: break
        data = re.sub(r' +', ' ', data)
        return data

    @classmethod
    def minimize(cls, text):
        """
        Used to make some types solid
        :param text: the shortenized (part of a) definition of a type
        :return: text with any occurrence of "OPTIONAL" removed
        """
        data = cls.shortenize(text)
        data = data.replace('OPTIONAL','')
        data = re.sub(r' +', ' ', data)
        return data

    @classmethod
    def get_identifier(cls, text):
        """
        If test is an identifier with possible surrounding whitespace,
        return the text with no whitespace, otherwise it returns None
        :param text: in general some part of a definition
        :return: The identifier if any
        """
        m = cls.re_identifier_only.match(text)
        return m.group('identifier') if m else None

    @classmethod
    def get_identifier_option(cls, text):
        """
        If test is an identifier with possible surrounding whitespace,
        return the text with no whitespace, otherwise it returns None
        :param text: in general some part of a definition
        :return: The identifier if any
        """
        m = cls.re_identifier_option.match(text)
        return (m.group('identifier'), m.group('option')) if m else (None, None)

    @classmethod
    def get_alternate_components(cls, text, trace = False):
        """
        If text is an alternate with options, returns every component
        :param text: in general some part of a definition
        :return: The list of components
        """
        components = []
        atomicals = {}
        # first
        n = 0
        t = text
        re_0 = re.compile(r'^\s*(?P<before>.*?)'
                          r'\s*\[\s*'
                          r'(?P<atomical>[^\[\]]*?)'
                          r'\s*\]\s*'
                          r'(?P<after>.*?)'
                          r'\s*$')
        while True:
            m = re_0.match(t)
            if m:
                atomical = m.group('atomical')
                if len(atomical):
                    k = '<@tomic@l' + str(n)+'/>'
                    n += 1
                    atomicals[k] = ' [ ' + atomical + ' ] '
                    t = m.group('before')+' '+k+' '+m.group('after')
                    if trace:
                        print(n, t)
                else:
                    return [text]
            else:
                break
        re_0 = re.compile(r'^\s*(?P<before>.*?)'
                          r'\s*\(\s*'
                          r'(?P<atomical>[^\(\)]*?)'
                          r'\s*\)\s*'
                          r'(?P<after>.*?)'
                          r'\s*$')
        while True:
            m = re_0.match(t)
            if m:
                atomical = m.group('atomical')
                if len(atomical):
                    k = '<@tomic@l' + str(n)+'/>'
                    n += 1
                    atomicals[k] = ' ( '+atomical+' ) '
                    t = m.group('before')+' '+k+' '+m.group('after')
                    if trace:
                        print(n, t)
                else:
                    return [text]
            else:
                break
        if trace:
            for k, v in atomicals.items():
                print(k, '->', v)
        cs = []
        for c in re.split(r'\s*\|\s*', t):
            while '<@tomic@l' in c:
                for k, v in atomicals.items():
                    c = c.replace(k, v)
                if trace:
                    print(c)
            c = re.sub(r' +', ' ', c)
            cs.append(c)
        return cs

    def __init__(self, types, **kwargs):
        self.types = types
        self.kwargs = kwargs
        self.t3_data_ = []
        self.Ts = [t for t in types.all.values() if not t.ignored]
        self.Ts = sorted(self.Ts, key=lambda t: (t.n, t.name))
        self.debug = not not self.kwargs['debug'] if 'debug' in kwargs else False
        self.setup()

    def append(self, text):
        self.t3_data_.append(text)

    def __iter__(self):
        for t in self.Ts:
            yield t

    def get_statements(self):
        for t in (t for t in self if t.is_stmt):
            yield t

    def get_expressions(self):
        for t in (t for t in self if not t.is_stmt and not t.alias):
            yield t

    preamble = """/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Type constants for edython, used as bricks prototypes.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'
"""
    def setup(self) -> None:
        """
        Initialize the model
        :return: None
        """
        i = 0
        for t in self:
            t.short_name = str(i)
            i += 1
        self.append(self.__class__.preamble)

    def feed_expressions(self):
        """
        Feed the t3_data_ with expression types.
        :return:
        """
        template = '  {:<25} : /*   ::= {:<50} ({}) */ "eyo:{}",'
        self.append('eYo.t3.expr = {')
        self.append('// core expressions')
        for t in self.get_expressions():
            if not t.is_list and not t.is_wrapper:
                self.append(template.format(t.name, t.definition, t.category, t.name))
        self.append('// lists')
        for t in self.get_expressions():
            if t.is_list:
                self.append(template.format(t.name, t.definition, t.category, t.name))
        self.append('// wrappers, like starred_item ::=  expression | star_expr')
        for t in self.get_expressions():
            if t.is_wrapper and not t.alias:
                self.append(template.format(t.name, t.definition, t.category, t.name))
        self.append('// wrappers, like module_name ::= identifier because module_name is used in some Check array')
        for t in self.get_expressions():
            if t.alias and t.is_shallow_required:
                self.append(template.format(t.name, t.definition, t.category, t.name))
        self.append('}')

    def feed_statements(self):
        template = '  {:<25}: /*   ::= {:<50} ({}) */ "eyo:{}",'
        self.append('eYo.t3.stmt = {')
        self.append('// part statements')
        for t in self.get_statements():
            if t.is_part:
                self.append(template.format(t.name, t.definition, t.category, t.name))
        self.append('// other simple statements')
        for t in self.get_statements():
            if not t.is_part and not t.is_compound:
                self.append(template.format(t.name, t.definition, t.category, t.name))
        self.append('// compound statements')
        for t in self.get_statements():
            if t.is_compound:
                self.append(template.format(t.name, t.definition, t.category, t.name))
        self.append('}')

    def feed_aliases(self):
        self.append('// aliases')
        for t in self.Ts:
            if t.alias and t.name != t.alias.name:
                self.append('eYo.t3.expr.{} = eYo.t3.expr.{}'.format(t.name, t.alias.name))

    def feed_alias_checks(self):
        self.append('// alias checks')
        for t in self.Ts:
            if t.alias and t.name != t.alias.name:
                self.append('eYo.t3.expr.check.{} = eYo.t3.expr.check.{}'.format(t.name, t.alias.name))

    def feed_special_aliases(self):
        self.append('// special aliases, some types that change naming across the documentation')
        special = {
            'or_expr_star': 'star_expr',
        }
        for k, v in special.items():
            self.append('eYo.t3.expr.{} = eYo.t3.expr.{}'.format(k, v))

    def feed_expression_checks(self):
        self.append('eYo.t3.expr.check = {')
        template = '    eYo.t3.expr.{},'
        for t in self.get_expressions():
            checks = t.get_checks()
            if (not t.alias or t.name == t.alias.name) and not t.same_checks and len(checks):
                self.append('  {}: [ // count {}'.format(t.name, len(checks)))
                for tt in sorted(checks, key=lambda t: (t.n, t.name)):
                    self.append(template.format(tt.name))
                self.append(template.format(self.types.get_type('any').name))
                self.append('  ],')
        self.append('}')
        self.append('\n// same checks')
        for t in self.get_expressions():
            if t.same_checks:
                self.append('eYo.t3.expr.check.{} = eYo.t3.expr.check.{}'.format(t.name, t.same_checks.name))

    def feed_statement_pnlr(self, label, attr):
        self.append('eYo.t3.stmt.{} = {{'.format(label))
        template = '    eYo.t3.stmt.{},'
        template_name = '    eYo.t3.stmt.{}+"."+eYo.key.{},'
        for t in self.get_statements():
            try:
                ts = getattr(t, attr)
                if len(ts):
                    self.append('  {}: [ // count {}'.format(t.name, len(ts)))
                    for tt in sorted((tt for tt in ts), key=lambda t: (t[0].n, t[0].name)):
                        if tt[1]:
                            self.append(template_name.format(tt[0].name, tt[1].upper()))
                        else:
                            self.append(template.format(tt[0].name))
                    self.append('  ],')
            except:
                pass
        self.append('}\n')

    def feed_statement_previous(self):
        self.feed_statement_pnlr('previous', 'is_below')

    def feed_statement_next(self):
        self.feed_statement_pnlr('next', 'is_above')

    def feed_statement_left(self):
        # Only for the simple_stmt
        attr = 'is_right_of'
        label = 'left'
        self.append('eYo.t3.stmt.{} = {{'.format(label))
        template = '    eYo.t3.stmt.{},'
        template_name = '    eYo.t3.stmt.{}+"."+eYo.key.{},'
        t = list(t for t in self.get_statements() if t.name == 'simple_stmt')[0]
        try:
            ts = getattr(t, attr)
            if len(ts):
                self.append('  {}: [ // count {}'.format(t.name, len(ts)))
                for tt in sorted((tt for tt in ts), key=lambda t: (t.n, t.name)):
                    self.append(template.format(tt.name))
                self.append('  ],')
        except:
            pass
        self.append('}\n')

    def feed_statement_right(self):
        # Only for the simple_stmt
        attr = 'is_left_of'
        label = 'right'
        self.append('eYo.t3.stmt.{} = {{'.format(label))
        template = '    eYo.t3.stmt.{},'
        template_name = '    eYo.t3.stmt.{}+"."+eYo.key.{},'
        t = list(t for t in self.get_statements() if t.name == 'simple_stmt')[0]
        try:
            ts = getattr(t, attr)
            if len(ts):
                self.append('  {}: [ // count {}'.format(t.name, len(ts)))
                for tt in sorted((tt for tt in ts), key=lambda t: (t.n, t.name)):
                    self.append(template.format(tt.name))
                self.append('  ],')
        except:
            pass
        self.append('}\n')

    def feed_statement_any(self):
        self.append('eYo.t3.stmt.any = [ // count {}'.format(len(self.get_statements())))
        template = '    eYo.t3.stmt.{},'
        for t in self.get_statements():
            self.append(template.format(t.name))
        self.append(']\n')

    def feed_expression_available(self):
        self.append('eYo.t3.expr.available = []')

    def feed_statement_available(self):
        self.append('eYo.t3.stmt.available = []')

    def feed_xml_tags(self):
        self.append('''eYo.t3.xml = {
    toDom: {},
}''')
        from_dom = {}
        Ts = [t for t in self.get_statements() if t.to_dom and len(t.to_dom) == 1]
        self.append('eYo.t3.xml.toDom.stmt = {{ // count {}'.format(len(Ts)))
        template = "    {}: '{}',"
        for t in Ts:
            k = t.to_dom[0]
            self.append(template.format(t.name, k))
            if not k in from_dom:
                from_dom[k] = []
            from_dom[k].append(t)
        self.append('}\n')

        Ts = [t for t in self.get_expressions() if t.to_dom and len(t.to_dom) == 1]
        self.append('eYo.t3.xml.toDom.expr = {{ // count {}'.format(len(Ts)))
        template = "    {}: '{}',"
        for t in Ts:
            k = t.to_dom[0]
            self.append(template.format(t.name, k))
            if not k in from_dom:
                from_dom[k] = []
            from_dom[k].append(t)
        self.append('}\n')

        Ts = [(k, v) for k, v in from_dom.items()]
        self.append('eYo.t3.xml.fromDom = {{ // count {}'.format(len(Ts)))
        template = "    {}: {},"
        for k,v in Ts:
            if len(v) == 1:
                t = v[0]
                prefix = 'stmt' if t.is_stmt else 'expr'
                self.append(template.format(k, 'eYo.t3.' + prefix + '.' + t.name))
            else:
                ra = []
                for t in v:
                    ra.append('eYo.t3.'+('stmt' if t.is_stmt else 'expr') + '.' + t.name)
                self.append(template.format(k, '[' + ', '.join(ra) + ']'))
        self.append('}\n')

    def get_t3_data(self):
        self.append("""/**
 * @name {eYo.t3}
 * @namespace
 **/

eYo.c9r.makeNS(eYo, 't3')

""")
        self.feed_statements()
        self.append('')
        self.feed_statement_previous()
        self.append('')
        self.feed_statement_next()
        self.append('')
        self.feed_statement_left()
        self.append('')
        self.feed_statement_right()
        self.append('')
        self.feed_statement_available()
        self.append('')
        self.feed_expressions()
        self.append('')
        self.feed_aliases()
        self.append('')
        self.feed_special_aliases()
        self.append('')
        self.feed_expression_checks()
        self.append('')
        self.feed_alias_checks()
        self.append('')
        self.feed_expression_available()
        self.append('')
        self.feed_xml_tags()
        return '\n'.join(self.t3_data_)

    def get_t3_all(self):
        """
        Initialize the model
        :return: None
        """
        self.append("""/**
 * @name eYo.t3.all
 * @namespace
 **/

eYo.t3.makeNS('all')

""")
        Ts = sorted((t for t in self.get_expressions() if not t.ignored), key=lambda t: t.name)
        template = '    eYo.t3.expr.{},'
        TTs = [t for t in Ts if not t.is_list and not t.is_wrapper]
        self.append('eYo.t3.all.core_expressions = [ // count {}'.format(len(TTs)))
        for t in TTs:
            self.append(template.format(t.name))
        self.append(']')
        TTs = [t for t in Ts if t.is_list]
        self.append('eYo.t3.all.lists = [ // count {}'.format(len(TTs)))
        for t in TTs:
            self.append(template.format(t.name))
        self.append(']')
        TTs = [t for t in Ts if t.is_wrapper and not t.alias]
        self.append('eYo.t3.all.wrappers = [ // count {}'.format(len(TTs)))
        for t in TTs:
            self.append(template.format(t.name))
        self.append(']')
        Ts = sorted(self.get_statements(), key=lambda t: t.name)
        template = '    eYo.t3.stmt.{},'
        TTs = [t for t in Ts if t.is_part]
        self.append('eYo.t3.all.part_statements = [ // count {}'.format(len(TTs)))
        for t in TTs:
            self.append(template.format(t.name))
        self.append(']')
        TTs = [t for t in Ts if t.is_part and not t.is_compound]
        self.append('eYo.t3.all.simple_statements = [ // count {}'.format(len(TTs)))
        for t in TTs:
            self.append(template.format(t.name))
        self.append(']')
        TTs = [t for t in Ts if t.is_compound]
        self.append('eYo.t3.all.compound_statements = [ // count {}'.format(len(TTs)))
        for t in TTs:
            self.append(template.format(t.name))
        self.append(']')
        self.append('''
eYo.t3.all.containsStatement = function(type) {
  return eYo.t3.all.part_statements.indexOf(type)>=0
  || eYo.t3.all.simple_statements.indexOf(type)>=0
  || eYo.t3.all.compound_statements.indexOf(type)>=0
}

eYo.t3.all.containsExpression = function(type) {
  return eYo.t3.all.core_expressions.indexOf(type)>=0
  || eYo.t3.all.lists.indexOf(type)>=0
  || eYo.t3.all.wrappers.indexOf(type)>=0
}

eYo.t3.all.contains = function(type) {
  return eYo.t3.all.containsStatement(type)
  || eYo.t3.all.containsExpression(type)
}

''')
        return '\n'.join(self.t3_data_)
