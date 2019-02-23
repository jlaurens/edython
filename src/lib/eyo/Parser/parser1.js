/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Parse helper.
 * This turns a list of tokens into a tree.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Parser1')
goog.provide('eYo.CST')

goog.require('eYo.Scan')
goog.require('eYo.Token')

eYo.Parser1 = function () {

}

Object.defineProperties(eYo.CST, {
  dotted_name: 'dotted_name'
})

eYo.Parser1.prototype.getCst = (() => {
  var forward = (self) => {
    self.token = self.scan.nextToken()
    return self.token.type !== eYo.Scan.ENDMARKER
  }
  var is_TYPE = (self, type) => {
    return self.token.type === type
  }
  var is_TOKEN = (self, type, subtype) => {
    return self.token.type === eYo.Scan._KEYWORD && self.token.subtype === subtype
  }
  var is_KEYWORD = (self, keyword) => {
    return self.token.type === eYo.Scan._KEYWORD && (!keyword || self.token.subtype === keyword)
  }
  var is_NAME = (self) => {
    return self.token.type === eYo.Scan.NAME
  }
    /*
# Grammar for Python

# NOTE WELL: You should also follow all the steps listed at
# https://devguide.python.org/grammar/

# Start symbols for the grammar:
#       single_input is a single interactive statement;
#       file_input is a module or sequence of commands read from an input file;
#       eval_input is the input for the eval() functions.
#       func_type_input is a PEP 484 Python 2 function type comment
# NB: compound_stmt in single_input is followed by extra NEWLINE!
# NB: due to the way TYPE_COMMENT is tokenized it will always be followed by a NEWLINE
single_input: NEWLINE | simple_stmt | compound_stmt NEWLINE
file_input: (NEWLINE | stmt)* ENDMARKER
eval_input: testlist NEWLINE* ENDMARKER

decorator: '@' dotted_name [ '(' [arglist] ')' ] NEWLINE
decorators: decorator+
decorated: decorators (classdef | funcdef | async_funcdef)

async_funcdef: 'async' funcdef
funcdef: 'def' NAME parameters ['->' test] ':' [TYPE_COMMENT] func_body_suite

parameters: '(' [typedargslist] ')'
typedargslist: (tfpdef ['=' test] (',' [TYPE_COMMENT] tfpdef ['=' test])* (TYPE_COMMENT | [',' [TYPE_COMMENT] [
        '*' [tfpdef] (',' [TYPE_COMMENT] tfpdef ['=' test])* (TYPE_COMMENT | [',' [TYPE_COMMENT] ['**' tfpdef [','] [TYPE_COMMENT]]])
      | '**' tfpdef [','] [TYPE_COMMENT]]])
  | '*' [tfpdef] (',' [TYPE_COMMENT] tfpdef ['=' test])* (TYPE_COMMENT | [',' [TYPE_COMMENT] ['**' tfpdef [','] [TYPE_COMMENT]]])
  | '**' tfpdef [','] [TYPE_COMMENT])
tfpdef: NAME [':' test]
varargslist: (vfpdef ['=' test] (',' vfpdef ['=' test])* [',' [
        '*' [vfpdef] (',' vfpdef ['=' test])* [',' ['**' vfpdef [',']]]
      | '**' vfpdef [',']]]
  | '*' [vfpdef] (',' vfpdef ['=' test])* [',' ['**' vfpdef [',']]]
  | '**' vfpdef [',']
)
vfpdef: NAME

stmt: simple_stmt | compound_stmt
simple_stmt: small_stmt (';' small_stmt)* [';'] NEWLINE
small_stmt: (expr_stmt | del_stmt | pass_stmt | flow_stmt |
             import_stmt | global_stmt | nonlocal_stmt | assert_stmt)
expr_stmt: testlist_star_expr (annassign | augassign (yield_expr|testlist) |
                     [('=' (yield_expr|testlist_star_expr))+ [TYPE_COMMENT]] )
annassign: ':' test ['=' (yield_expr|testlist)]
testlist_star_expr: (test|star_expr) (',' (test|star_expr))* [',']
augassign: ('+=' | '-=' | '*=' | '@=' | '/=' | '%=' | '&=' | '|=' | '^=' |
            '<<=' | '>>=' | '**=' | '//=')
# For normal and annotated assignments, additional restrictions enforced by the interpreter
del_stmt: 'del' exprlist
pass_stmt: 'pass'
flow_stmt: break_stmt | continue_stmt | return_stmt | raise_stmt | yield_stmt
break_stmt: 'break'
continue_stmt: 'continue'
return_stmt: 'return' [testlist_star_expr]
yield_stmt: yield_expr
raise_stmt: 'raise' [test ['from' test]]
import_stmt: import_name | import_from
import_name: 'import' dotted_as_names
# note below: the ('.' | '...') is necessary because '...' is tokenized as ELLIPSIS
import_from: ('from' (('.' | '...')* dotted_name | ('.' | '...')+)
              'import' ('*' | '(' import_as_names ')' | import_as_names))
import_as_name: NAME ['as' NAME]
*/
var parse_import_stmt = (self) => {
  if (is_KEYWORD('import')) {
    var t = this.token
    t.cst_type = [eYo.CST.import_stmt, eYo.CST.import_name]
    forward(self)
    t.cst_dotted = parse_dotted_as_names(self)
    t.cst_dotted.parent = t
    return t
  } else if (is_KEYWORD('from')) {
    var t = this.token
    t.cst_type = [eYo.CST.import_stmt, eYo.CST.import_from]
    forward(self)
    // parse the dots
    var tt = is_DOT_OR_ELLIPSIS(self)
    if (tt) {
      t.cst_from_dots = tt
      tt.cst_parent = t
      forward(self)
      var ttt = is_DOT_OR_ELLIPSIS(self)
      while (ttt) {
        tt = tt.cst_sibling = ttt
        tt.cst_parent = t
        forward(self)
      }
      // from ..import.foo import bar|*
      tt = null
      while (true) {
        if (is_KEYWORD(self, 'import')) {
          if (!is_next_type(eYo.Scan.DOT) || is_next_KEYWORD('import')) {
            //this is the last
            if (tt) {
              tt = tt.cst_sibling = this.token
            } else {
              tt = tt.cst_dotted = this.token
            }
            tt.cst_parent = t
            forward()
            break
          }
          if (is_NAME_or_KEYWORD(self)) {
            if (tt) {
              tt = tt.cst_sibling = this.token
            } else {
              tt = tt.cst_dotted = this.token
            }
            tt.cst_parent = t
            forward()
            if (is_DOT(self)) {
              if (tt) {
                tt = tt.cst_sibling = this.token
              } else {
                tt = tt.cst_dotted = this.token
              }
              tt.cst_parent = t
              forward()
              continue
            }
            break
          }
        }
      }    
    }
    
    return t
  }
}
/*
dotted_as_name: dotted_name ['as' NAME]
import_as_names: import_as_name (',' import_as_name)* [',']
dotted_as_names: dotted_as_name (',' dotted_as_name)*
dotted_name: NAME ('.' NAME)*
*/
/**
 * 
 * @param {*} self 
 */
var parse_dotted_as_name_ = (self) => {
  if (is_NAME(self)) {
    var parent = self.token
    if (forward_if_DOT(self)) {
      if (forward_if_NAME_or_KEYWORD(self)) {
        self.token.cst_parent = self.parent
        var dotted = parent.cst_dotted = self.token
        while (forward_if_DOT(self)) {
          var dot = this.token
          if (forward_if_NAME_or_KEYWORD(self)) {
            forward(self)
            self.token.cst_parent = parent
            dotted = dotted.cst_sibling = self.token
            continue
          } else {
            self.token.cst_error = 'MISSING_NAME_AFTER_DOT'
            break
          }
        }
      } else {
        self.token.cst_error = 'MISSING_NAME_AFTER_DOT'
      }
    }
    if (forward_if_KEYWORD(self, 'as')) {
      if (forward_if_NAME(self)) {
        self.token.cst_parent = parent
        parent.cst_as = self.token
      } else {
        self.token.cst_error = 'MISSING_NAME_AFTER_AS'
      }
    }
    if (parent.cst_dotted) {
      if (parent.cst_as) {
        parent.cst_type = [eYo.CST.dotted_as_name]
      } else {
        parent.cst_type = [eYo.CST.dotted_name]
      }
    } else if (parent.cst_as) {
      parent.cst_type = [eYo.CST.dotted_as_name, eYo.CST.import_as_name]
    } else {
      parent.cst_type = [eYo.CST.NAME]
    }
    return parent
  }
}
var parse_dotted_name = (self) => {
  if (is_NAME(self)) {
    var parent = self.token
    if (forward_if_DOT(self)) {
      if (forward_if_NAME_or_KEYWORD(self)) {
        self.token.cst_parent = self.parent
        var dotted = parent.cst_dotted = self.token
        while (forward_if_DOT(self)) {
          var dot = this.token
          if (forward_if_NAME_or_KEYWORD(self)) {
            forward(self)
            self.token.cst_parent = parent
            dotted = dotted.cst_sibling = self.token
            continue
          } else {
            self.token.cst_error = 'MISSING_NAME_AFTER_DOT'
            break
          }
        }
      } else {
        self.token.cst_error = 'MISSING_NAME_AFTER_DOT'
      }
    }
    if (parent.cst_dotted) {
      parent.cst_type = [eYo.CST.dotted_name]
    } else {
      parent.cst_type = [eYo.CST.NAME]
    }
    return parent
  }
}
/*
global_stmt: 'global' NAME (',' NAME)*
nonlocal_stmt: 'nonlocal' NAME (',' NAME)*
assert_stmt: 'assert' test [',' test]

compound_stmt: if_stmt | while_stmt | for_stmt | try_stmt | with_stmt | funcdef | classdef | decorated | async_stmt
async_stmt: 'async' (funcdef | with_stmt | for_stmt)
if_stmt: 'if' namedexpr_test ':' suite ('elif' namedexpr_test ':' suite)* ['else' ':' suite]
while_stmt: 'while' namedexpr_test ':' suite ['else' ':' suite]
for_stmt: 'for' exprlist 'in' testlist ':' [TYPE_COMMENT] suite ['else' ':' suite]
try_stmt: ('try' ':' suite
           ((except_clause ':' suite)+
            ['else' ':' suite]
            ['finally' ':' suite] |
           'finally' ':' suite))
with_stmt: 'with' with_item (',' with_item)*  ':' [TYPE_COMMENT] suite
with_item: test ['as' expr]
# NB compile.c makes sure that the default except clause is last
except_clause: 'except' [test ['as' NAME]]
suite: simple_stmt | NEWLINE INDENT stmt+ DEDENT

namedexpr_test: test [':=' test]
test: or_test ['if' or_test 'else' test] | lambdef
test_nocond: or_test | lambdef_nocond
lambdef: 'lambda' [varargslist] ':' test
lambdef_nocond: 'lambda' [varargslist] ':' test_nocond
or_test: and_test ('or' and_test)*
and_test: not_test ('and' not_test)*
not_test: 'not' not_test | comparison
comparison: expr (comp_op expr)*
# <> isn't actually a valid comparison operator in Python. It's here for the
# sake of a __future__ import described in PEP 401 (which really works :-)
comp_op: '<'|'>'|'=='|'>='|'<='|'<>'|'!='|'in'|'not' 'in'|'is'|'is' 'not'
star_expr: '*' expr
expr: xor_expr ('|' xor_expr)*
xor_expr: and_expr ('^' and_expr)*
and_expr: shift_expr ('&' shift_expr)*
shift_expr: arith_expr (('<<'|'>>') arith_expr)*
arith_expr: term (('+'|'-') term)*
term: factor (('*'|'@'|'/'|'%'|'//') factor)*
factor: ('+'|'-'|'~') factor | power
power: atom_expr ['**' factor]
atom_expr: ['await'] atom trailer*
*/
/*
atom: ('(' [yield_expr|testlist_comp] ')' |
       '[' [testlist_comp] ']' |
       '{' [dictorsetmaker] '}' |
       NAME | NUMBER | STRING+ | '...' | 'None' | 'True' | 'False')
*/
var parse_atom = (self) => {
  if (is_TYPE(self, eYo.Scan.NAME)
  || is_TYPE(self, eYo.Scan.NUMBER)
  || is_TYPE(self, eYo.Scan.ELLIPSIS)
  || is_KEYWORD(self, eYo.Scan.NONE)
  || is_KEYWORD(self, eYo.Scan.True)
  || is_KEYWORD(self, eYo.Scan.False)) {
    forward(self)
    return true
  }
  
}
/*
testlist_comp: (namedexpr_test|star_expr) ( comp_for | (',' (namedexpr_test|star_expr))* [','] )
trailer: '(' [arglist] ')' | '[' subscriptlist ']' | '.' NAME
subscriptlist: subscript (',' subscript)* [',']
subscript: test | [test] ':' [test] [sliceop]
sliceop: ':' [test]
exprlist: (expr|star_expr) (',' (expr|star_expr))* [',']
testlist: test (',' test)* [',']
dictorsetmaker: ( ((test ':' test | '**' expr)
                   (comp_for | (',' (test ':' test | '**' expr))* [','])) |
                  ((test | star_expr)
                   (comp_for | (',' (test | star_expr))* [','])) )

classdef: 'class' NAME ['(' [arglist] ')'] ':' suite

arglist: argument (',' argument)*  [',']

# The reason that keywords are test nodes instead of NAME is that using NAME
# results in an ambiguity. ast.c makes sure it's a NAME.
# "test '=' test" is really "keyword '=' test", but we have no such token.
# These need to be in a single rule to avoid grammar that is ambiguous
# to our LL(1) parser. Even though 'test' includes '*expr' in star_expr,
# we explicitly match '*' here, too, to give it proper precedence.
# Illegal combinations and orderings are blocked in ast.c:
# multiple (test comp_for) arguments are blocked; keyword unpackings
# that precede iterable unpackings are blocked; etc.
argument: ( test [comp_for] |
            test ':=' test |
            test '=' test |
            '**' test |
            '*' test )

comp_iter: comp_for | comp_if
sync_comp_for: 'for' exprlist 'in' or_test [comp_iter]
comp_for: ['async'] sync_comp_for
comp_if: 'if' test_nocond [comp_iter]

# not used in grammar, but may appear in "node" passed from Parser1 to Compiler
encoding_decl: NAME

yield_expr: 'yield' [yield_arg]
yield_arg: 'from' test | testlist_star_expr

# the TYPE_COMMENT in suites is only parsed for funcdefs,
# but can't go elsewhere due to ambiguity
func_body_suite: simple_stmt | NEWLINE [TYPE_COMMENT NEWLINE] INDENT stmt+ DEDENT

func_type_input: func_type NEWLINE* ENDMARKER
func_type: '(' [typelist] ')' '->' test
# typelist is a modified typedargslist (see above)
typelist: (test (',' test)* [','
       ['*' [test] (',' test)* [',' '**' test] | '**' test]]
     |  '*' [test] (',' test)* [',' '**' test] | '**' test)

*/


  /**
   * Given a chain of eYo.Token instances starting at `token`,
   * adds links between the tokens to turn this into a
   * concrete syntax tree.
   * That is not completely automatized, such a pain...
   */
  return function(token) {
    this.parent = token
    parse(this, token)
  }
})()
