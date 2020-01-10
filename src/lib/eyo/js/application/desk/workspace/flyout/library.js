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

eYo.section.makeC9r(eYo, 'Library')

eYo.Library.DATA = {
  test: [
    {
      type: eYo.t3.stmt.expression_stmt,
      slots: {
        expression: {
          type: eYo.t3.expr.call_expr,
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
    eYo.t3.stmt.start_stmt,
    {
      type: eYo.t3.stmt.call_stmt,
      name_p: 'print',
      n_ary_s: {
        slots: {
          O: "'...'"
        }
      }
    },
    eYo.t3.expr.shortliteral,
    eYo.t3.expr.numberliteral,
    {
      type: eYo.t3.stmt.assignment_stmt,
      value_s: {
        slots: {
          O: {
            type: eYo.t3.expr.call_expr,
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
      type: eYo.t3.stmt.assignment_stmt,
      value_s: {
        slots: {
          O: {
            type: eYo.t3.expr.call_expr,
            name_p: 'int',
            n_ary_s: {
              slots: {
                O: {
                  type: eYo.t3.expr.call_expr,
                  name_p: 'input'
                }
              }
            },
          },
        },
      },
    },
    {
      type: eYo.t3.stmt.assignment_stmt,
      value_s: {
        slots: {
          O: {
            type: eYo.t3.expr.call_expr,
            name_p: 'float',
            n_ary_s: {
              slots: {
                O: {
                  type: eYo.t3.expr.call_expr,
                  name_p: 'input'
                }
              }
            },
          },
        },
      },
    },
    eYo.t3.stmt.assignment_stmt,
    eYo.t3.expr.identifier,
    eYo.t3.expr.u_expr,
    {
      type: eYo.t3.expr.a_expr,
      operator_p: '+'
    },
    {
      type: eYo.t3.expr.a_expr,
      operator_p: '-'
    },
    {
      type: eYo.t3.expr.m_expr,
      operator_p: '*'
    },
    {
      type: eYo.t3.expr.m_expr,
      operator_p: '/'
    },
    {
      type: eYo.t3.expr.m_expr,
      operator_p: '//'
    },
    eYo.t3.expr.power,
  ],
  intermediate: [
    eYo.t3.stmt.expression_stmt,
    eYo.t3.stmt.expression_stmt,
    eYo.t3.expr.parenth_form,
    eYo.t3.expr.list_display,
    eYo.t3.expr.set_display,
    eYo.t3.expr.dict_display,
    eYo.t3.expr.builtin__object,
    eYo.t3.stmt.import_stmt,
    {
      type: eYo.t3.stmt.import_stmt,
      data: {
        variant: eYo.key.FROM_MODULE_IMPORT
      },
      title: eYo.tooltip.Title.import_stmt
    },
    {
      type: eYo.t3.expr.identifier,
      variant_p: eYo.key.ALIASED
    },
    eYo.t3.stmt.docstring_stmt,
    eYo.t3.expr.longliteral,
    eYo.t3.expr.attributeref,
    eYo.t3.expr.slicing,
    eYo.t3.expr.proper_slice,
  ],
  advanced: [
    eYo.t3.stmt.augmented_assignment_stmt,
    eYo.t3.expr.shift_expr,
    eYo.t3.expr.and_expr,
    eYo.t3.expr.xor_expr,
    eYo.t3.expr.or_expr,
    eYo.t3.expr.any,
    eYo.t3.stmt.expression_stmt,
    eYo.t3.expr.star_expr,
    eYo.t3.stmt.global_stmt,
    eYo.t3.stmt.nonlocal_stmt,
    eYo.t3.stmt.del_stmt,
    eYo.t3.expr.comprehension,
    eYo.t3.expr.comp_for,
    eYo.t3.expr.comp_if,
    {
      type: eYo.t3.expr.comprehension,
      expression_s: eYo.t3.expr.key_datum
    },
  ],
  expert: [
    eYo.t3.stmt.with_part,
    eYo.t3.stmt.try_part,
    eYo.t3.stmt.except_part,
    {
      type: eYo.t3.stmt.except_part,
      expression_p: 'IndexError'
    },
    {
      type: eYo.t3.stmt.except_part,
      expression_p: 'KeyError'
    },
    eYo.t3.stmt.finally_part,
    eYo.t3.stmt.assert_stmt,
    eYo.t3.stmt.raise_stmt,
    eYo.t3.expr.yield_expr,
    eYo.t3.stmt.yield_stmt
  ],
  branching: [
    {
      type: eYo.t3.stmt.assignment_stmt,
    },
    {
      type: eYo.t3.expr.identifier,
    },
    eYo.t3.stmt.if_part,
    eYo.t3.expr.number_comparison,
    eYo.t3.expr.or_test,
    eYo.t3.expr.and_test,
    eYo.t3.stmt.elif_part,
    eYo.t3.stmt.else_part,
    eYo.t3.expr.not_test,
    eYo.t3.expr.object_comparison,
    {
      type: eYo.t3.expr.builtin__object,
      value_p: 'None'
    },
    eYo.t3.expr.builtin__object,
    eYo.t3.expr.conditional_expression,
  ],
  looping: [
    eYo.t3.stmt.assignment_stmt,
    eYo.t3.expr.identifier,
    eYo.t3.stmt.for_part,
    eYo.t3.expr.builtin__range_expr,
    eYo.t3.expr.numberliteral,
    eYo.t3.stmt.while_part,
    eYo.t3.expr.number_comparison,
    eYo.t3.expr.not_test,
    eYo.t3.expr.and_test,
    eYo.t3.expr.or_test,
    eYo.t3.expr.object_comparison,
    eYo.t3.expr.builtin__object,
    eYo.t3.stmt.break_stmt,
    eYo.t3.stmt.continue_stmt,
    eYo.t3.stmt.else_part,
  ],
  function: [
    {
      type: eYo.t3.stmt.assignment_stmt,
    },
    eYo.t3.expr.identifier,
    {
      type: eYo.t3.expr.call_expr,
      name_p: ''
    },
    {
      type: eYo.t3.stmt.call_stmt,
      name_p: ''
    },
    eYo.t3.expr.lambda,
    eYo.t3.stmt.funcdef_part,
    eYo.t3.expr.star_expr,
    eYo.t3.stmt.return_stmt,
    eYo.t3.stmt.pass_stmt,
    eYo.t3.expr.yield_expr,
    eYo.t3.stmt.yield_stmt,
    eYo.t3.stmt.classdef_part,
    eYo.t3.stmt.global_stmt,
    eYo.t3.stmt.nonlocal_stmt,
    {
      type: eYo.t3.stmt.decorator_stmt,
      name_p: eYo.key.STATICMETHOD
    },
    {
      type: eYo.t3.stmt.decorator_stmt,
      name_p: eYo.key.CLASSMETHOD
    },
    {
      type: eYo.t3.stmt.decorator_stmt,
      name_p: eYo.key.PROPERTY
    },
    eYo.t3.stmt.decorator_stmt
  ],
  list: [
    {
      type: eYo.t3.stmt.assignment_stmt,
      value_s: {
        slots: {
          O: {
            type: eYo.t3.expr.list_display,
            expression_s: "'...'"
          },
        },
      },
    },
    {
      type: eYo.t3.expr.identifier,
    },
    {
      type: eYo.t3.expr.slicing,
      variant_p: eYo.key.NAME,
      slice_s: {
        slots: {
          O: 0
        }
      }
    },
    eYo.t3.expr.proper_slice,
    {
      type: eYo.t3.expr.list_display,
      slots: {
        expression: "'...'",
      }
    },
    {
      type: eYo.t3.stmt.call_stmt,
      name_p: 'print',
      n_ary_s: {
        slots: {
          O: {
            type: eYo.t3.expr.star_expr,
            modifier_p: '*',
            modified_p: ''
          }
        }
      }
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'len'
    },
    {
      type: eYo.t3.stmt.call_stmt,
      name_p: 'insert',
      dotted_p: 1,
      title: 'list_insert'
    },
    {
      type: eYo.t3.stmt.call_stmt,
      name_p: 'append',
      dotted_p: 1,
      title: 'list_append'
    },
    {
      type: eYo.t3.stmt.call_stmt,
      name_p: 'remove',
      dotted_p: 1,
      title: 'list_remove'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'index',
      dotted_p: 1,
      title: 'list_index'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'count',
      dotted_p: 1,
      title: 'list_count'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'pop',
      dotted_p: 1,
      n_ary_s: {
        slots: {
          O: {
            type: eYo.t3.expr.integer,
            placeholder: -1
          }
        }
      },
      title: 'list_pop'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'reverse',
      dotted_p: 1,
      title: 'list_reverse'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'copy',
      dotted_p: 1,
      title: 'list_copy'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'min'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'max'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'sum'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'all'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'any'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'List',
      n_ary_s: {
        slots: {
          O: "'...'"
        }
      }
    },
    eYo.t3.stmt.del_stmt,
    {
      type: eYo.t3.stmt.del_stmt,
      del_s: {
        slots: {
          O: eYo.t3.expr.slicing
        }
      }
    },
    {
      type: eYo.t3.stmt.call_stmt,
      name_p: 'pop',
      dotted_p: 1,
      n_ary_s: {
        slots: {
          O: {
            type: eYo.t3.expr.integer,
            placeholder: -1
          }
        }
      },
      title: 'list_pop'
    }
  ],
  text: [
    {
      type: eYo.t3.stmt.assignment_stmt,
      value_s: {
        slots: {
          O: "'...'",
        },
      },
      title: 'text_assignment'
    },
    {
      type: eYo.t3.expr.identifier,
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'print',
      n_ary_s: {
        slots: {
          O: "'...'"
        }
      }
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'len',
      title: 'text_len'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'startswith',
      dotted_p: 1,
      title: 'text_startswith'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'endswith',
      dotted_p: 1,
      title: 'text_endswith'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'find',
      dotted_p: 1,
      title: 'text_find'
    },
    {
      type: eYo.t3.expr.call_expr,
      data: {
        name: 'replace',
        dotted: 1
      },
      title: 'text_replace'
    },
    {
      type: eYo.t3.expr.call_expr,
      data: {
        name: 'count',
        dotted: 1
      },
      title: 'text_count'
    },
    {
      type: eYo.t3.expr.call_expr,
      data: {
        name: 'upper',
        dotted: 1
      },
      title: 'text_upper'
    },
    {
      type: eYo.t3.expr.call_expr,
      data: {
        name: 'lower',
        dotted: 1
      },
      title: 'text_lower'
    },
    {
      type: eYo.t3.expr.call_expr,
      data: {
        name: 'join',
        dotted: 1
      },
      title: 'text_join'
    },
    {
      type: eYo.t3.expr.call_expr,
      data: {
        name: 'split',
        dotted: 1
      },
      title: 'text_split'
    },
    {
      type: eYo.t3.expr.call_expr,
      data: {
        name: 'rsplit',
        dotted: 1
      },
      title: 'text_rsplit'
    },
    {
      type: eYo.t3.expr.call_expr,
      data: {
        name: 'splitlines',
        dotted: 1
      },
      title: 'text_splitlines'
    },
    {
      type: eYo.t3.expr.call_expr,
      data: {
        name: 'index',
        dotted: 1
      },
      title: 'text_index'
    }
  ],
  math: [
    {
      type: eYo.t3.stmt.assignment_stmt,
      value_s: {
        slots: {
          O: 0,
        },
      },
    },
    {
      type: eYo.t3.expr.identifier,
    },
    {
      type: eYo.t3.expr.integer
    },
    eYo.t3.expr.u_expr,
    {
      type: eYo.t3.expr.a_expr,
      operator_p: '+'
    },
    {
      type: eYo.t3.expr.a_expr,
      operator_p: '-'
    },
    {
      type: eYo.t3.expr.m_expr,
      operator_p: '*'
    },
    {
      type: eYo.t3.expr.m_expr,
      operator_p: '/'
    },
    {
      type: eYo.t3.expr.m_expr,
      operator_p: '//'
    },
    {
      type: eYo.t3.expr.m_expr,
      operator_p: '%'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'divmod'
    },
    eYo.t3.expr.power,
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'pow'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'min'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'max'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'sum'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'abs',
    },
    {
      type: eYo.t3.expr.m_expr,
      operator_p: '@'
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'int',
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'float',
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'round',
    },
    '1j',
    {
      type: eYo.t3.expr.a_expr,
      operator_p: '+',
      rhs_s: {
        type: eYo.t3.expr.m_expr,
        operator_p: '*',
        rhs_s: '1j'
      }
    },
    {
      type: eYo.t3.expr.call_expr,
      data: {
        name: 'complex',
        ary: 2
      }
    },
    {
      type: eYo.t3.expr.call_expr,
      name_p: 'conjugate',
      ary_p: 0,
      dotted_p: 1
    },
    {
      type: eYo.t3.expr.attributeref,
      name_p: 'real',
      dotted_p: 1
    },
    {
      type: eYo.t3.expr.attributeref,
      name_p: 'imag',
      dotted_p: 1
    }
  ]
}
