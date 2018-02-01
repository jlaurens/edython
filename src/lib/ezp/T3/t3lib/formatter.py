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

    def normalize(text):
        data = text
        for k, v in Formatter.symbols.items():
            data = data.replace('"' + k + '"', " " + v + " ")
        for k in Formatter.keywords:
            data = data.replace('"' + k + '"', " " + k.upper() + " ")
        data = Formatter.re_parenth_1.sub(r'\g<1>', data)
        data = Formatter.re_parenth_2.sub(r'BGROUP \g<1> OR \g<2> EGROUP', data)
        data = re.sub(r'^ +', '', data)
        for k in ['(', ')', '[', ']', '|']:
            data = data.replace(k, ' ' + k + ' ')
        data = re.sub(r' +', ' ', data)
        return data

    def shortenize(text):
        data = Formatter.normalize(text)
        while True:
            data, n = Formatter.re_optional_1.subn('OPTIONAL', data)
            if not n: break
        while True:
            data, n = Formatter.re_optional_n.subn('OPTIONAL', data)
            if not n: break
        data = re.sub(r' +', ' ', data)
        return data

    def minimize(text):
        data = Formatter.shortenize(text)
        data = data.replace('OPTIONAL','')
        data = re.sub(r' +', ' ', data)
        return data

    def get_T3_data(types, **kwargs):
        l = []
        Ts = sorted(types.all.values(), key=lambda t: (t.n, t.name))
        i = 0
        for t in Ts:
            t.short_name = str(i)
            i += 1
        l.append("""/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Constants for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name ezP.T3
 * @namespace
 **/

goog.provide('ezP.T3')

goog.require('ezP')

""")
        l.append('ezP.T3 = {')
        l.append('// expressions')
        for t in [t for t in Ts if not t.is_stmt and not t.is_list and not t.wrapper]:
            l.append('  {:<25} /*   ::= {:<50} */ : "{}",'.format(t.name, t.definition, t.name if kwargs['debug'] else t.short_name))
        l.append('// lists')
        for t in [t for t in Ts if t.is_list]:
            l.append('  {:<25} /*   ::= {:<50} */ : "{}",'.format(t.name, t.definition, t.name if kwargs['debug'] else t.short_name))
        l.append('// wrappers')
        for t in [t for t in Ts if not t.is_stmt and not t.is_list and t.wrapper and not t.alias]:
            l.append('  {:<25} /*   ::= {:<50} */ : "{}",'.format(t.name, t.definition, t.name if kwargs['debug'] else t.short_name))
        l.append('// part statements')
        for t in [t for t in Ts if t.is_part]:
            l.append('  {:<25} /*   ::= {:<50} */ : "{}",'.format(t.name, t.definition, t.name if kwargs['debug'] else t.short_name))
        l.append('}\n')
        l.append('// aliases')
        for t in Ts:
            if t.alias:
                l.append('ezP.T3.{} = ezP.T3.{}'.format(t.name, t.alias.name))
        l.append('')
        l.append('ezP.T3.Previous = {')
        TTs = [t for t in Ts if t.is_stmt]
        for t in TTs:
            try:
                if len(t.is_after):
                    l.append('  {}: ['.format(t.name))
                    for tt in sorted((tt for tt in t.is_after), key=lambda t: (t.n, t.name)):
                        l.append('    ezP.T3.{},'.format(tt.name))
                    l.append('  ],')
            except:
                pass
        l.append('}\n')
        l.append('ezP.T3.Next = {')
        TTs = [t for t in Ts if t.is_stmt]
        for t in TTs:
            try:
                if len(t.is_before):
                    l.append('  {}: ['.format(t.name))
                    for tt in sorted((tt for tt in t.is_before), key=lambda t: (t.n, t.name)):
                        l.append('    ezP.T3.{},'.format(tt.name))
                    l.append('  ],')
            except:
                pass
        l.append('}\n')
        l.append('ezP.T3.Check = {')
        TTs = [t for t in Ts if not t.is_stmt and not t.is_list]
        for t in TTs:
            require = [tt for tt in t.deep_require if not tt.wrapper]
            if len(require):
                l.append('  {}: ['.format(t.name))
                for tt in sorted(require, key=lambda t: (t.n, t.name)):
                    l.append('    ezP.T3.{},'.format(tt.name))
                l.append('  ],')
        TTs = [t for t in Ts if t.is_list]
        for t in TTs:
            if len(t.list_require):
                l.append('  {}: ['.format(t.name))
                for tt in sorted((tt for tt in t.list_require), key=lambda t: (t.n, t.name)):
                    l.append('    ezP.T3.{},'.format(tt.name))
                l.append('  ],')
        l.append('}\n')
        """
        l.append('ezP.T3.Provide = {')
        for t in TTs:
            if len(t.deep_provide):
                l.append('  {}: ['.format(t.name))
                for tt in sorted((tt for tt in t.deep_provide), key=lambda t: (t.n, t.name)):
                    l.append('    ezP.T3.{},'.format(tt.name))
                l.append('  ],')
        l.append('}\n')
        """

        return '\n'.join(l)

