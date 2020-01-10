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

eYo.require('t3')
eYo.require('section')

eYo.require('const')
eYo.require('tooltip')

eYo.section.makeClass(eYo, 'Library')

eYo.Library.DATA = {
  test: [
    {
      type: eYo.t3.Stmt.expression_stmt,
      slots: {
        expression: {
          type: eYo.t3.Expr.Call_expr,
          data: {
            name: 'remove',
            variant: eYo.key.BLOCK_NAME,
            ary: 1
          }
        }
      }
    },
  ],
  basic: [
    eYo.t3.stmt.Start_stmt,
    {
      type: eYo.t3.Stmt.Call_stmt,
      name_p: 'print',
      n_ary_s: {
        slots: {
          O: "'...'"
        }
      }
    },
    eYo.t3.Expr.Shortliteral,
    eYo.t3.Expr.numberliteral,
    {
      type: eYo.t3.Stmt.Assignment_stmt,
      value_s: {
        slots: {
          O: {
            type: eYo.t3.Expr.Call_expr,
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
      type: eYo.t3.Stmt.Assignment_stmt,
      value_s: {
        slots: {
          O: {
            type: eYo.t3.Expr.Call_expr,
            name_p: 'int',
            n_ary_s: {
              slots: {
                O: {
                  type: eYo.t3.Expr.Call_expr,
                  name_p: 'input'
                }
              }
            },
          },
        },
      },
    },
    {
      type: eYo.t3.Stmt.Assignment_stmt,
      value_s: {
        slots: {
          O: {
            type: eYo.t3.Expr.Call_expr,
            name_p: 'float',
            n_ary_s: {
              slots: {
                O: {
                  type: eYo.t3.Expr.Call_expr,
                  name_p: 'input'
                }
              }
            },
          },
        },
      },
    },
    eYo.t3.Stmt.Assignment_stmt,
    eYo.t3.Expr.identifier,
    eYo.t3.Expr.u_expr,
    {
      type: eYo.t3.Expr.A_expr,
      operator_p: '+'
    },
    {
      type: eYo.t3.Expr.A_expr,
      operator_p: '-'
    },
    {
      type: eYo.t3.Expr.m_expr,
      operator_p: '*'
    },
    {
      type: eYo.t3.Expr.m_expr,
      operator_p: '/'
    },
    {
      type: eYo.t3.Expr.m_expr,
      operator_p: '//'
    },
    eYo.t3.Expr.power,
  ],
  intermediate: [
    eYo.t3.Stmt.expression_stmt,
    eYo.t3.Stmt.expression_stmt,
    eYo.t3.Expr.parenth_form,
    eYo.t3.Expr.list_display,
    eYo.t3.Expr.Set_display,
    eYo.t3.Expr.dict_display,
    eYo.t3.Expr.Builtin__object,
    eYo.t3.Stmt.import_stmt,
    {
      type: eYo.t3.Stmt.import_stmt,
      data: {
        variant: eYo.key.FROM_MODULE_IMPORT
      },
      title: eYo.tooltip.Title.import_stmt
    },
    {
      type: eYo.t3.Expr.identifier,
      variant_p: eYo.key.ALIASED
    },
    eYo.t3.Stmt.docstring_stmt,
    eYo.t3.Expr.longliteral,
    eYo.t3.Expr.Attributeref,
    eYo.t3.Expr.Slicing,
    eYo.t3.Expr.Proper_slice,
  ],
  advanced: [
    eYo.t3.Stmt.Augmented_assignment_stmt,
    eYo.t3.Expr.Shift_expr,
    eYo.t3.Expr.And_expr,
    eYo.t3.Expr.xor_expr,
    eYo.t3.Expr.or_expr,
    eYo.t3.Expr.Any,
    eYo.t3.Stmt.expression_stmt,
    eYo.t3.Expr.Star_expr,
    eYo.t3.Stmt.global_stmt,
    eYo.t3.Stmt.nonlocal_stmt,
    eYo.t3.Stmt.del_stmt,
    eYo.t3.Expr.Comprehension,
    eYo.t3.Expr.Comp_for,
    eYo.t3.Expr.Comp_if,
    {
      type: eYo.t3.Expr.Comprehension,
      expression_s: eYo.t3.Expr.key_datum
    },
  ],
  expert: [
    eYo.t3.Stmt.with_part,
    eYo.t3.Stmt.try_part,
    eYo.t3.Stmt.except_part,
    {
      type: eYo.t3.Stmt.except_part,
      expression_p: 'IndexError'
    },
    {
      type: eYo.t3.Stmt.except_part,
      expression_p: 'KeyError'
    },
    eYo.t3.Stmt.finally_part,
    eYo.t3.Stmt.Assert_stmt,
    eYo.t3.Stmt.raise_stmt,
    eYo.t3.Expr.yield_expr,
    eYo.t3.Stmt.yield_stmt
  ],
  branching: [
    {
      type: eYo.t3.Stmt.Assignment_stmt,
    },
    {
      type: eYo.t3.Expr.identifier,
    },
    eYo.t3.Stmt.if_part,
    eYo.t3.Expr.number_comparison,
    eYo.t3.Expr.or_test,
    eYo.t3.Expr.And_test,
    eYo.t3.Stmt.elif_part,
    eYo.t3.Stmt.else_part,
    eYo.t3.Expr.not_test,
    eYo.t3.Expr.object_comparison,
    {
      type: eYo.t3.Expr.Builtin__object,
      value_p: 'None'
    },
    eYo.t3.Expr.Builtin__object,
    eYo.t3.Expr.Conditional_expression,
  ],
  looping: [
    eYo.t3.Stmt.Assignment_stmt,
    eYo.t3.Expr.identifier,
    eYo.t3.Stmt.for_part,
    eYo.t3.Expr.Builtin__range_expr,
    eYo.t3.Expr.numberliteral,
    eYo.t3.Stmt.while_part,
    eYo.t3.Expr.number_comparison,
    eYo.t3.Expr.not_test,
    eYo.t3.Expr.And_test,
    eYo.t3.Expr.or_test,
    eYo.t3.Expr.object_comparison,
    eYo.t3.Expr.Builtin__object,
    eYo.t3.Stmt.Break_stmt,
    eYo.t3.Stmt.Continue_stmt,
    eYo.t3.Stmt.else_part,
  ],
  function: [
    {
      type: eYo.t3.Stmt.Assignment_stmt,
    },
    eYo.t3.Expr.identifier,
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: ''
    },
    {
      type: eYo.t3.Stmt.Call_stmt,
      name_p: ''
    },
    eYo.t3.Expr.lambda,
    eYo.t3.Stmt.funcdef_part,
    eYo.t3.Expr.Star_expr,
    eYo.t3.Stmt.return_stmt,
    eYo.t3.Stmt.pass_stmt,
    eYo.t3.Expr.yield_expr,
    eYo.t3.Stmt.yield_stmt,
    eYo.t3.Stmt.Classdef_part,
    eYo.t3.Stmt.global_stmt,
    eYo.t3.Stmt.nonlocal_stmt,
    {
      type: eYo.t3.Stmt.decorator_stmt,
      name_p: eYo.key.STATICMETHOD
    },
    {
      type: eYo.t3.Stmt.decorator_stmt,
      name_p: eYo.key.CLASSMETHOD
    },
    {
      type: eYo.t3.Stmt.decorator_stmt,
      name_p: eYo.key.PROPERTY
    },
    eYo.t3.Stmt.decorator_stmt
  ],
  list: [
    {
      type: eYo.t3.Stmt.Assignment_stmt,
      value_s: {
        slots: {
          O: {
            type: eYo.t3.Expr.list_display,
            expression_s: "'...'"
          },
        },
      },
    },
    {
      type: eYo.t3.Expr.identifier,
    },
    {
      type: eYo.t3.Expr.Slicing,
      variant_p: eYo.key.NAME,
      slice_s: {
        slots: {
          O: 0
        }
      }
    },
    eYo.t3.Expr.Proper_slice,
    {
      type: eYo.t3.Expr.list_display,
      slots: {
        expression: "'...'",
      }
    },
    {
      type: eYo.t3.Stmt.Call_stmt,
      name_p: 'print',
      n_ary_s: {
        slots: {
          O: {
            type: eYo.t3.Expr.Star_expr,
            modifier_p: '*',
            modified_p: ''
          }
        }
      }
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'len'
    },
    {
      type: eYo.t3.Stmt.Call_stmt,
      name_p: 'insert',
      dotted_p: 1,
      title: 'list_insert'
    },
    {
      type: eYo.t3.Stmt.Call_stmt,
      name_p: 'append',
      dotted_p: 1,
      title: 'list_append'
    },
    {
      type: eYo.t3.Stmt.Call_stmt,
      name_p: 'remove',
      dotted_p: 1,
      title: 'list_remove'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'index',
      dotted_p: 1,
      title: 'list_index'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'count',
      dotted_p: 1,
      title: 'list_count'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'pop',
      dotted_p: 1,
      n_ary_s: {
        slots: {
          O: {
            type: eYo.t3.Expr.integer,
            placeholder: -1
          }
        }
      },
      title: 'list_pop'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'reverse',
      dotted_p: 1,
      title: 'list_reverse'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'copy',
      dotted_p: 1,
      title: 'list_copy'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'min'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'max'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'sum'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'all'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'any'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'List',
      n_ary_s: {
        slots: {
          O: "'...'"
        }
      }
    },
    eYo.t3.Stmt.del_stmt,
    {
      type: eYo.t3.Stmt.del_stmt,
      del_s: {
        slots: {
          O: eYo.t3.Expr.Slicing
        }
      }
    },
    {
      type: eYo.t3.Stmt.Call_stmt,
      name_p: 'pop',
      dotted_p: 1,
      n_ary_s: {
        slots: {
          O: {
            type: eYo.t3.Expr.integer,
            placeholder: -1
          }
        }
      },
      title: 'list_pop'
    }
  ],
  text: [
    {
      type: eYo.t3.Stmt.Assignment_stmt,
      value_s: {
        slots: {
          O: "'...'",
        },
      },
      title: 'text_assignment'
    },
    {
      type: eYo.t3.Expr.identifier,
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'print',
      n_ary_s: {
        slots: {
          O: "'...'"
        }
      }
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'len',
      title: 'text_len'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'startswith',
      dotted_p: 1,
      title: 'text_startswith'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'endswith',
      dotted_p: 1,
      title: 'text_endswith'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'find',
      dotted_p: 1,
      title: 'text_find'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      data: {
        name: 'replace',
        dotted: 1
      },
      title: 'text_replace'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      data: {
        name: 'count',
        dotted: 1
      },
      title: 'text_count'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      data: {
        name: 'upper',
        dotted: 1
      },
      title: 'text_upper'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      data: {
        name: 'lower',
        dotted: 1
      },
      title: 'text_lower'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      data: {
        name: 'join',
        dotted: 1
      },
      title: 'text_join'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      data: {
        name: 'split',
        dotted: 1
      },
      title: 'text_split'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      data: {
        name: 'rsplit',
        dotted: 1
      },
      title: 'text_rsplit'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      data: {
        name: 'splitlines',
        dotted: 1
      },
      title: 'text_splitlines'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      data: {
        name: 'index',
        dotted: 1
      },
      title: 'text_index'
    }
  ],
  math: [
    {
      type: eYo.t3.Stmt.Assignment_stmt,
      value_s: {
        slots: {
          O: 0,
        },
      },
    },
    {
      type: eYo.t3.Expr.identifier,
    },
    {
      type: eYo.t3.Expr.integer
    },
    eYo.t3.Expr.u_expr,
    {
      type: eYo.t3.Expr.A_expr,
      operator_p: '+'
    },
    {
      type: eYo.t3.Expr.A_expr,
      operator_p: '-'
    },
    {
      type: eYo.t3.Expr.m_expr,
      operator_p: '*'
    },
    {
      type: eYo.t3.Expr.m_expr,
      operator_p: '/'
    },
    {
      type: eYo.t3.Expr.m_expr,
      operator_p: '//'
    },
    {
      type: eYo.t3.Expr.m_expr,
      operator_p: '%'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'divmod'
    },
    eYo.t3.Expr.power,
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'pow'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'min'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'max'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'sum'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'abs',
    },
    {
      type: eYo.t3.Expr.m_expr,
      operator_p: '@'
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'int',
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'float',
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'round',
    },
    '1j',
    {
      type: eYo.t3.Expr.A_expr,
      operator_p: '+',
      rhs_s: {
        type: eYo.t3.Expr.m_expr,
        operator_p: '*',
        rhs_s: '1j'
      }
    },
    {
      type: eYo.t3.Expr.Call_expr,
      data: {
        name: 'complex',
        ary: 2
      }
    },
    {
      type: eYo.t3.Expr.Call_expr,
      name_p: 'conjugate',
      ary_p: 0,
      dotted_p: 1
    },
    {
      type: eYo.t3.Expr.Attributeref,
      name_p: 'real',
      dotted_p: 1
    },
    {
      type: eYo.t3.Expr.Attributeref,
      name_p: 'imag',
      dotted_p: 1
    }
  ]
}
