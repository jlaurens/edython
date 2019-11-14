/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Flyout overriden.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo')

goog.require('eYo.T3')

goog.require('eYo.Const')
goog.require('eYo.Tooltip')
goog.provide('eYo.Library')

/**
 * Flyout list of node models by category.
 */
eYo.Library = {
  test: [
    {
      type: eYo.T3.Stmt.expression_stmt,
      slots: {
        expression: {
          type: eYo.T3.Expr.call_expr,
          data: {
            name: 'remove',
            variant: eYo.Key.BLOCK_NAME,
            ary: 1
          }
        }
      }
    },
  ],
  basic: [
    eYo.T3.Stmt.start_stmt,
    {
      type: eYo.T3.Stmt.call_stmt,
      name_p: 'print',
      n_ary_s: {
        slots: {
          O: "'...'"
        }
      }
    },
    eYo.T3.Expr.shortliteral,
    eYo.T3.Expr.numberliteral,
    {
      type: eYo.T3.Stmt.assignment_stmt,
      value_s: {
        slots: {
          O: {
            type: eYo.T3.Expr.call_expr,
            name_p: 'input',
            n_ary_s: {
              slots: {
                O: "'...'"
              }
            },
          },
        },
      },
    },
    {
      type: eYo.T3.Stmt.assignment_stmt,
      value_s: {
        slots: {
          O: {
            type: eYo.T3.Expr.call_expr,
            name_p: 'int',
            n_ary_s: {
              slots: {
                O: {
                  type: eYo.T3.Expr.call_expr,
                  name_p: 'input'
                }
              }
            },
          },
        },
      },
    },
    {
      type: eYo.T3.Stmt.assignment_stmt,
      value_s: {
        slots: {
          O: {
            type: eYo.T3.Expr.call_expr,
            name_p: 'float',
            n_ary_s: {
              slots: {
                O: {
                  type: eYo.T3.Expr.call_expr,
                  name_p: 'input'
                }
              }
            },
          },
        },
      },
    },
    eYo.T3.Stmt.assignment_stmt,
    eYo.T3.Expr.identifier,
    eYo.T3.Expr.u_expr,
    {
      type: eYo.T3.Expr.a_expr,
      operator_p: '+'
    },
    {
      type: eYo.T3.Expr.a_expr,
      operator_p: '-'
    },
    {
      type: eYo.T3.Expr.m_expr,
      operator_p: '*'
    },
    {
      type: eYo.T3.Expr.m_expr,
      operator_p: '/'
    },
    {
      type: eYo.T3.Expr.m_expr,
      operator_p: '//'
    },
    eYo.T3.Expr.power,
  ],
  intermediate: [
    eYo.T3.Stmt.expression_stmt,
    eYo.T3.Stmt.expression_stmt,
    eYo.T3.Expr.parenth_form,
    eYo.T3.Expr.list_display,
    eYo.T3.Expr.set_display,
    eYo.T3.Expr.dict_display,
    eYo.T3.Expr.builtin__object,
    eYo.T3.Stmt.import_stmt,
    {
      type: eYo.T3.Stmt.import_stmt,
      data: {
        variant: eYo.Key.FROM_MODULE_IMPORT
      },
      title: eYo.Tooltip.Title.import_stmt
    },
    {
      type: eYo.T3.Expr.identifier,
      variant_p: eYo.Key.ALIASED
    },
    eYo.T3.Stmt.docstring_stmt,
    eYo.T3.Expr.longliteral,
    eYo.T3.Expr.attributeref,
    eYo.T3.Expr.slicing,
    eYo.T3.Expr.proper_slice,
  ],
  advanced: [
    eYo.T3.Stmt.augmented_assignment_stmt,
    eYo.T3.Expr.shift_expr,
    eYo.T3.Expr.and_expr,
    eYo.T3.Expr.xor_expr,
    eYo.T3.Expr.or_expr,
    eYo.T3.Expr.any,
    eYo.T3.Stmt.expression_stmt,
    eYo.T3.Expr.star_expr,
    eYo.T3.Stmt.global_stmt,
    eYo.T3.Stmt.nonlocal_stmt,
    eYo.T3.Stmt.del_stmt,
    eYo.T3.Expr.comprehension,
    eYo.T3.Expr.comp_for,
    eYo.T3.Expr.comp_if,
    {
      type: eYo.T3.Expr.comprehension,
      expression_s: eYo.T3.Expr.key_datum
    },
  ],
  expert: [
    eYo.T3.Stmt.with_part,
    eYo.T3.Stmt.try_part,
    eYo.T3.Stmt.except_part,
    {
      type: eYo.T3.Stmt.except_part,
      expression_p: 'IndexError'
    },
    {
      type: eYo.T3.Stmt.except_part,
      expression_p: 'KeyError'
    },
    eYo.T3.Stmt.finally_part,
    eYo.T3.Stmt.assert_stmt,
    eYo.T3.Stmt.raise_stmt,
    eYo.T3.Expr.yield_expr,
    eYo.T3.Stmt.yield_stmt
  ],
  branching: [
    {
      type: eYo.T3.Stmt.assignment_stmt,
    },
    {
      type: eYo.T3.Expr.identifier,
    },
    eYo.T3.Stmt.if_part,
    eYo.T3.Expr.number_comparison,
    eYo.T3.Expr.or_test,
    eYo.T3.Expr.and_test,
    eYo.T3.Stmt.elif_part,
    eYo.T3.Stmt.else_part,
    eYo.T3.Expr.not_test,
    eYo.T3.Expr.object_comparison,
    {
      type: eYo.T3.Expr.builtin__object,
      value_p: 'None'
    },
    eYo.T3.Expr.builtin__object,
    eYo.T3.Expr.conditional_expression,
  ],
  looping: [
    eYo.T3.Stmt.assignment_stmt,
    eYo.T3.Expr.identifier,
    eYo.T3.Stmt.for_part,
    eYo.T3.Expr.builtin__range_expr,
    eYo.T3.Expr.numberliteral,
    eYo.T3.Stmt.while_part,
    eYo.T3.Expr.number_comparison,
    eYo.T3.Expr.not_test,
    eYo.T3.Expr.and_test,
    eYo.T3.Expr.or_test,
    eYo.T3.Expr.object_comparison,
    eYo.T3.Expr.builtin__object,
    eYo.T3.Stmt.break_stmt,
    eYo.T3.Stmt.continue_stmt,
    eYo.T3.Stmt.else_part,
  ],
  function: [
    {
      type: eYo.T3.Stmt.assignment_stmt,
    },
    eYo.T3.Expr.identifier,
    {
      type: eYo.T3.Expr.call_expr,
      name_p: ''
    },
    {
      type: eYo.T3.Stmt.call_stmt,
      name_p: ''
    },
    eYo.T3.Expr.lambda,
    eYo.T3.Stmt.funcdef_part,
    eYo.T3.Expr.star_expr,
    eYo.T3.Stmt.return_stmt,
    eYo.T3.Stmt.pass_stmt,
    eYo.T3.Expr.yield_expr,
    eYo.T3.Stmt.yield_stmt,
    eYo.T3.Stmt.classdef_part,
    eYo.T3.Stmt.global_stmt,
    eYo.T3.Stmt.nonlocal_stmt,
    {
      type: eYo.T3.Stmt.decorator_stmt,
      name_p: eYo.Key.STATICMETHOD
    },
    {
      type: eYo.T3.Stmt.decorator_stmt,
      name_p: eYo.Key.CLASSMETHOD
    },
    {
      type: eYo.T3.Stmt.decorator_stmt,
      name_p: eYo.Key.PROPERTY
    },
    eYo.T3.Stmt.decorator_stmt
  ],
  list: [
    {
      type: eYo.T3.Stmt.assignment_stmt,
      value_s: {
        slots: {
          O: {
            type: eYo.T3.Expr.list_display,
            expression_s: "'...'"
          },
        },
      },
    },
    {
      type: eYo.T3.Expr.identifier,
    },
    {
      type: eYo.T3.Expr.slicing,
      variant_p: eYo.Key.NAME,
      slice_s: {
        slots: {
          O: 0
        }
      }
    },
    eYo.T3.Expr.proper_slice,
    {
      type: eYo.T3.Expr.list_display,
      slots: {
        expression: "'...'",
      }
    },
    {
      type: eYo.T3.Stmt.call_stmt,
      name_p: 'print',
      n_ary_s: {
        slots: {
          O: {
            type: eYo.T3.Expr.star_expr,
            modifier_p: '*',
            modified_p: ''
          }
        }
      }
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'len'
    },
    {
      type: eYo.T3.Stmt.call_stmt,
      name_p: 'insert',
      dotted_p: 1,
      title: 'list_insert'
    },
    {
      type: eYo.T3.Stmt.call_stmt,
      name_p: 'append',
      dotted_p: 1,
      title: 'list_append'
    },
    {
      type: eYo.T3.Stmt.call_stmt,
      name_p: 'remove',
      dotted_p: 1,
      title: 'list_remove'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'index',
      dotted_p: 1,
      title: 'list_index'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'count',
      dotted_p: 1,
      title: 'list_count'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'pop',
      dotted_p: 1,
      n_ary_s: {
        slots: {
          O: {
            type: eYo.T3.Expr.integer,
            placeholder: -1
          }
        }
      },
      title: 'list_pop'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'reverse',
      dotted_p: 1,
      title: 'list_reverse'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'copy',
      dotted_p: 1,
      title: 'list_copy'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'min'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'max'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'sum'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'all'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'any'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'list',
      n_ary_s: {
        slots: {
          O: "'...'"
        }
      }
    },
    eYo.T3.Stmt.del_stmt,
    {
      type: eYo.T3.Stmt.del_stmt,
      del_s: {
        slots: {
          O: eYo.T3.Expr.slicing
        }
      }
    },
    {
      type: eYo.T3.Stmt.call_stmt,
      name_p: 'pop',
      dotted_p: 1,
      n_ary_s: {
        slots: {
          O: {
            type: eYo.T3.Expr.integer,
            placeholder: -1
          }
        }
      },
      title: 'list_pop'
    }
  ],
  text: [
    {
      type: eYo.T3.Stmt.assignment_stmt,
      value_s: {
        slots: {
          O: "'...'",
        },
      },
      title: 'text_assignment'
    },
    {
      type: eYo.T3.Expr.identifier,
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'print',
      n_ary_s: {
        slots: {
          O: "'...'"
        }
      }
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'len',
      title: 'text_len'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'startswith',
      dotted_p: 1,
      title: 'text_startswith'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'endswith',
      dotted_p: 1,
      title: 'text_endswith'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'find',
      dotted_p: 1,
      title: 'text_find'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'replace',
        dotted: 1
      },
      title: 'text_replace'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'count',
        dotted: 1
      },
      title: 'text_count'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'upper',
        dotted: 1
      },
      title: 'text_upper'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'lower',
        dotted: 1
      },
      title: 'text_lower'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'join',
        dotted: 1
      },
      title: 'text_join'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'split',
        dotted: 1
      },
      title: 'text_split'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'rsplit',
        dotted: 1
      },
      title: 'text_rsplit'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'splitlines',
        dotted: 1
      },
      title: 'text_splitlines'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'index',
        dotted: 1
      },
      title: 'text_index'
    }
  ],
  math: [
    {
      type: eYo.T3.Stmt.assignment_stmt,
      value_s: {
        slots: {
          O: 0,
        },
      },
    },
    {
      type: eYo.T3.Expr.identifier,
    },
    {
      type: eYo.T3.Expr.integer
    },
    eYo.T3.Expr.u_expr,
    {
      type: eYo.T3.Expr.a_expr,
      operator_p: '+'
    },
    {
      type: eYo.T3.Expr.a_expr,
      operator_p: '-'
    },
    {
      type: eYo.T3.Expr.m_expr,
      operator_p: '*'
    },
    {
      type: eYo.T3.Expr.m_expr,
      operator_p: '/'
    },
    {
      type: eYo.T3.Expr.m_expr,
      operator_p: '//'
    },
    {
      type: eYo.T3.Expr.m_expr,
      operator_p: '%'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'divmod'
    },
    eYo.T3.Expr.power,
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'pow'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'min'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'max'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'sum'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'abs',
    },
    {
      type: eYo.T3.Expr.m_expr,
      operator_p: '@'
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'int',
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'float',
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'round',
    },
    '1j',
    {
      type: eYo.T3.Expr.a_expr,
      operator_p: '+',
      rhs_s: {
        type: eYo.T3.Expr.m_expr,
        operator_p: '*',
        rhs_s: '1j'
      }
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'complex',
        ary: 2
      }
    },
    {
      type: eYo.T3.Expr.call_expr,
      name_p: 'conjugate',
      ary_p: 0,
      dotted_p: 1
    },
    {
      type: eYo.T3.Expr.attributeref,
      name_p: 'real',
      dotted_p: 1
    },
    {
      type: eYo.T3.Expr.attributeref,
      name_p: 'imag',
      dotted_p: 1
    }
  ]
}
