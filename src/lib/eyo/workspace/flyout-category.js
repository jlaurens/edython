/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Flyout overriden.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('eYo.FlyoutCategory');

goog.require('eYo.T3');

/**
 * Flyout list of node models by catedgory.
 */
eYo.FlyoutCategory = {
  'test': [
    {
      type: eYo.T3.Stmt.assignment_stmt,
      slots: {
        assigned: {
          slots: {
            O: {
              type: eYo.T3.Expr.builtin__input_expr,
              slots: {
                expression: "'…'",
              },
            },
          },
        },
      },
    },
  ],
  'basic': [
    eYo.T3.Stmt.start_stmt,
    eYo.T3.Expr.shortliteral,
    eYo.T3.Expr.numberliteral,
    eYo.T3.Stmt.builtin__print_stmt,
    {
      type: eYo.T3.Stmt.assignment_stmt,
      slots: {
        assigned: {
          slots: {
            O: {
              type: eYo.T3.Expr.builtin__input_expr,
              slots: {
                expression: "'...'",
              },
            }, 
          },
        },
      },
    },
    // '<edython xmlns="urn:edython:1.0" xmlns:eyo="urn:edython:1.0"><s eyo="assignment_stmt"><x eyo="list" slot="assigned"><x eyo="builtin__input_expr" slot="O"></x></x></s></edython>', // eYo.T3.Expr.builtin__input_expr,
    eYo.T3.Stmt.assignment_stmt,
    eYo.T3.Expr.term,
    eYo.T3.Expr.u_expr,
    eYo.T3.Expr.m_expr,
    eYo.T3.Expr.a_expr,
    eYo.T3.Expr.power,
  ],
  'intermediate': [
    eYo.T3.Stmt.any_stmt,
    eYo.T3.Expr.parenth_form,
    eYo.T3.Expr.list_display,
    eYo.T3.Expr.set_display,
    eYo.T3.Expr.dict_display,
    eYo.T3.Expr.builtin__object,
    eYo.T3.Stmt.augmented_assignment_stmt,
    eYo.T3.Stmt.import_stmt,
    eYo.T3.Stmt.docstring_top_stmt,
    eYo.T3.Expr.longliteral,
    eYo.T3.Expr.attributeref,
    eYo.T3.Expr.proper_slice,
    eYo.T3.Expr.slicing,
  ],
  'advanced': [
    eYo.T3.Expr.any,
    eYo.T3.Stmt.expression_stmt,
    eYo.T3.Expr.shift_expr,
    eYo.T3.Expr.and_expr,
    eYo.T3.Expr.xor_expr,
    eYo.T3.Expr.or_expr,
    eYo.T3.Expr.starred_expression,
    eYo.T3.Stmt.del_stmt,
    eYo.T3.Expr.parenth_target_list,
    eYo.T3.Expr.bracket_target_list,
  ],
  'expert': [
    eYo.T3.Expr.builtin__print_expr,
    eYo.T3.Expr.comprehension,
    eYo.T3.Expr.comp_for,
    eYo.T3.Expr.comp_if,
    eYo.T3.Expr.dict_comprehension,
    eYo.T3.Expr.key_datum,
    eYo.T3.Stmt.with_part,
    eYo.T3.Stmt.try_part,
    eYo.T3.Stmt.except_part,
    eYo.T3.Stmt.finally_part,
    eYo.T3.Stmt.assert_stmt,
    eYo.T3.Stmt.raise_stmt,
    eYo.T3.Expr.yield_expression,
    eYo.T3.Stmt.yield_stmt,
  ],
  'branching': [
    eYo.T3.Expr.builtin__object,
    eYo.T3.Expr.not_test,
    eYo.T3.Expr.number_comparison,
    eYo.T3.Expr.object_comparison,
    eYo.T3.Expr.or_test,
    eYo.T3.Expr.and_test,
    eYo.T3.Stmt.if_part,
    eYo.T3.Stmt.elif_part,
    eYo.T3.Stmt.else_part,
    eYo.T3.Expr.conditional_expression,
  ],
  'looping': [
    eYo.T3.Expr.builtin__object,
    eYo.T3.Expr.not_test,
    eYo.T3.Expr.number_comparison,
    eYo.T3.Expr.object_comparison,
    eYo.T3.Expr.or_test,
    eYo.T3.Expr.and_test,
    eYo.T3.Stmt.while_part,
    eYo.T3.Expr.builtin__range,
    eYo.T3.Stmt.for_part,
    eYo.T3.Stmt.else_part,
    eYo.T3.Stmt.break_stmt,
    eYo.T3.Stmt.continue_stmt,
  ],
  'function': [
    eYo.T3.Expr.call_expr,
    eYo.T3.Stmt.call_stmt,
    eYo.T3.Stmt.funcdef_part,
    eYo.T3.Stmt.return_stmt,
    eYo.T3.Stmt.pass_stmt,
    eYo.T3.Expr.lambda,
    eYo.T3.Stmt.classdef_part,
    eYo.T3.Stmt.decorator,
    eYo.T3.Stmt.global_nonlocal_stmt,
    eYo.T3.Stmt.docstring_def_stmt,
  ],
  'list': [
    {
      type: eYo.T3.Stmt.assignment_stmt,
      slots: {
        assigned: {
          slots: {
            O: {
              type: eYo.T3.Expr.list_display,
              slots: {
                expression: "'...'",
              },
            }, 
          },
        },
      },
    },
    {
      type: eYo.T3.Expr.list_display,
      slots: {
        expression: "'...'",
      }
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'len'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'list',
      slots: {
        n_ary: {
          slots: {
            O: "'...'"
          }
        }
      }
    },
    {
      type: eYo.T3.Expr.slicing,
      slots: {
        slice: {
          slots: {
            O: 0
          }
        }
      }
    },
    {
      type: eYo.T3.Expr.slicing,
      data: {
        variant: 1 // move this to the const namespace
      },
      slots: {
        slice: {
          slots: {
            O: 0
          }
        }
      }
    },
    eYo.T3.Expr.proper_slice,
    {
      type: eYo.T3.Stmt.expression_stmt,
      slot: {
        expression: {
          type: eYo.T3.Expr.call_expr,
          data: {
            name: 'append',
            variant: 3,
            ary: 1
          }
        }
      }
    },
    {
      type: eYo.T3.Stmt.expression_stmt,
      slot: {
        expression: {
          type: eYo.T3.Expr.call_expr,
          data: {
            name: 'insert',
            variant: 3,
            ary: 2
          }
        }
      }
    },
    {
      type: eYo.T3.Stmt.expression_stmt,
      slot: {
        expression: {
          type: eYo.T3.Expr.call_expr,
          data: {
            name: 'remove',
            variant: 3,
            ary: 1
          }
        }
      }
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'index',
        variant: 3,
        ary: 1
      }
    },
    eYo.T3.Expr.a_expr,
    eYo.T3.Expr.m_expr
  ]
}
console.warn('key handler: "foo.bar", "foo[]", "foo(…)"')
