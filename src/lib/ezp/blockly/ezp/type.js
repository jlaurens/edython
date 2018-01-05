/**
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
 * @name ezP.Const
 * @namespace
 **/
goog.provide('ezP.Type')

goog.require('ezP')

// Connection types
ezP.Type = ezP.Type || {}

ezP.Type.Xpr = {
  any_all: '0',
  expression: '0',
  identifier: '0.1',
  forif: '1',
  star_or_xpr: '2', // “*” or_expr
  comprehension: '3',
  comp_for: '4',
  comp_if: '5',
  or_test: '6',
  lambda_expr_nocond: '7',
  parameter_positional: '8.1',
  parameter_1_star: '8.2',
  parameter_keyed: '8.3',
  parameter_2_stars: '8.4',
  TUPLE: '9',
}

ezP.Type.Xpr.Provide = {
  any: [ezP.Type.Xpr.any_all],
  star_or_expr: [ezP.Type.Xpr.star_or_xpr],
  comprehension: [ezP.Type.Xpr.comprehension],
  comp_for: [ezP.Type.Xpr.comp_for],
  comp_if: [ezP.Type.Xpr.comp_if],
  get: [ezP.Type.Xpr.identifier,
    ezP.Type.Xpr.parameter_positional,
    ezP.Type.Xpr.parameter_1_star,
    ezP.Type.Xpr.parameter_keyed,
    ezP.Type.Xpr.parameter_2_stars],
}

ezP.Type.Xpr.Require = {
  any: [ezP.Type.Xpr.any_all],
  expression: [ezP.Type.Xpr.any_all],
  forif: [ezP.Type.Xpr.forif],
  starred_item: [ezP.Type.Xpr.expression, ezP.Type.Xpr.star_or_xpr],
  or_expr: [ezP.Type.Xpr.any_all],
  target_list: [ezP.Type.Xpr.any_all],
  or_test: [ezP.Type.Xpr.any_all],
  comp_iter: [ezP.Type.Xpr.comp_for, ezP.Type.Xpr.comp_if],
  expression_nocond: [ezP.Type.Xpr.or_test, ezP.Type.Xpr.lambda_expr_nocond]
}

/*
expression_nocond      ::=  or_test | lambda_expr_nocond


starred_expression ::=  expression | ( starred_item “,” )* [starred_item]
starred_item       ::=  expression | “*” or_expr


atom      ::=  identifier | literal | enclosure
enclosure ::=  parenth_form | list_display | dict_display | set_display
               | generator_expression | yield_atom
literal ::=  stringliteral | bytesliteral
             | integer | floatnumber | imagnumber
expression


list_display ::=  “[” [starred_list | comprehension] “]”
set_display ::=  “{” (starred_list | comprehension) “}”

dict_display       ::=  “{” [key_datum_list | dict_comprehension] “}”
key_datum_list     ::=  key_datum (“,” key_datum)* [“,”]
key_datum          ::=  expression “:” expression | “**” or_expr
dict_comprehension ::=  expression “:” expression comp_for

generator_expression ::=  “(” expression comp_for “)”

yield_atom       ::=  “(” yield_expression “)”
yield_expression ::=  “yield” [expression_list | “from” expression]

primary ::=  atom | attributeref | subscription | slicing | call

attributeref ::=  primary “.” identifier
subscription ::=  primary “[” expression_list “]”

slicing      ::=  primary “[” slice_list “]”
slice_list   ::=  slice_item (“,” slice_item)* [“,”]
slice_item   ::=  expression | proper_slice
proper_slice ::=  [lower_bound] “:” [upper_bound] [ “:” [stride] ]
lower_bound  ::=  expression
upper_bound  ::=  expression
stride       ::=  expression

call                 ::=  primary “(” [argument_list [“,”] | comprehension] “)”
argument_list        ::=  positional_arguments [“,” starred_and_keywords]
                            [“,” keywords_arguments]
                          | starred_and_keywords [“,” keywords_arguments]
                          | keywords_arguments
positional_arguments ::=  [“*”] expression (“,” [“*”] expression)*
starred_and_keywords ::=  (“*” expression | keyword_item)
                          (“,” “*” expression | “,” keyword_item)*
keywords_arguments   ::=  (keyword_item | “**” expression)
                          (“,” keyword_item | “,” “**” expression)*
keyword_item         ::=  identifier “=” expression

await_expr ::=  “await” primary

power ::=  ( await_expr | primary ) [“**” u_expr]

u_expr ::=  power | “-” u_expr | “+” u_expr | “~” u_expr

m_expr ::=  u_expr | m_expr “*” u_expr | m_expr “@” m_expr |
            m_expr “//” u_expr| m_expr “/” u_expr |
            m_expr “%” u_expr
a_expr ::=  m_expr | a_expr “+” m_expr | a_expr “-” m_expr

shift_expr ::=  a_expr | shift_expr ( “<<” | “>>” ) a_expr

and_expr ::=  shift_expr | and_expr “&” shift_expr
xor_expr ::=  and_expr | xor_expr “^” and_expr
or_expr  ::=  xor_expr | or_expr “|” xor_expr

comparison    ::=  or_expr ( comp_operator or_expr )*
comp_operator ::=  “<” | “>” | “==” | “>=” | “<=” | “!=”
                   | “is” [“not”] | [“not”] “in”

or_test  ::=  and_test | or_test “or” and_test
and_test ::=  not_test | and_test “and” not_test
not_test ::=  comparison | “not” not_test

conditional_expression ::=  or_test [“if” or_test “else” expression]
expression             ::=  conditional_expression | lambda_expr

lambda_expr        ::=  “lambda” [parameter_list]: expression
lambda_expr_nocond ::=  “lambda” [parameter_list]: expression_nocond

parameter_list ::=  (defparameter “,”)*
                    | “*” [parameter] (“,” defparameter)* [“,” “**” parameter]
                    | “**” parameter
                    | defparameter [“,”] )
parameter      ::=  identifier [“:” expression]
defparameter   ::=  parameter [“=” expression]

expression_list    ::=  expression ( “,” expression )* [“,”]
starred_list       ::=  starred_item ( “,” starred_item )* [“,”]


*/

/*
In the first column the statement before.
X means that the statement is forbidden
for example, there must not be 2 consecutive else clauses.
        any   if    elif  else  loop
any     O     O     X     X     O
if      O     O     O     O     O
elif    O     O     O     O     O
else    O     O     X     X     O
loop    O     O     X     O     O
*/
/* any means everything else,
 * loop means for or while
 * all means everything.
 * See the rendered connection subclass
 **/
ezP.Type.Stt = {
  any_all: 0,
  if_elif: 1,
  if_elif_bounded: 2,
  if_else: 3,
  loop_else: 4
}
ezP.Type.Stt.Check = {
  none: [-1],
  after_any: [ezP.Type.Stt.any_all],
  before_any: [ezP.Type.Stt.any_all],
  after_if: [ezP.Type.Stt.any_all,
    ezP.Type.Stt.if_elif,
    ezP.Type.Stt.if_else],
  before_if: [ezP.Type.Stt.any_all],
  after_elif: [ezP.Type.Stt.any_all,
    ezP.Type.Stt.if_elif,
    ezP.Type.Stt.if_else],
  before_elif: [ezP.Type.Stt.if_elif],
  after_else: [ezP.Type.Stt.any_all],
  before_else: [ezP.Type.Stt.if_else,
    ezP.Type.Stt.loop_else],
  before_if_else: [ezP.Type.Stt.if_else],
  before_loop_else: [ezP.Type.Stt.loop_else],
  after_loop: [ezP.Type.Stt.any_all,
    ezP.Type.Stt.loop_else],
  before_loop: [ezP.Type.Stt.any_all]
}
