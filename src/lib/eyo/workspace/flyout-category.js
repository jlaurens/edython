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
'use strict'

goog.provide('eYo.FlyoutCategory')

goog.require('eYo.T3')
goog.require('eYo.Const')

/**
 * Flyout list of node models by category.
 */
eYo.FlyoutCategory = {
  'test': [
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
              type: eYo.T3.Expr.call_expr,
              data: 'input',
              slots: {
                arguments: {
                  slots: {
                    O: "'...'"
                  }
                }
              },
            }, 
          },
        },
      },
    },
    /*
    <s eyo="assignment" xmlns="urn:edython:1.0" xmlns:eyo="urn:edython:1.0"><x eyo="list" slot="assigned"><x eyo="call" name="int" slot="O"><x eyo="list" slot="binary"><x eyo="input" slot="O"></x></x></x></x></s>
    <s eyo="assignment" variant="name_value" xmlns="urn:edython:1.0" xmlns:eyo="urn:edython:1.0"><x eyo="list" slot="assigned"><x eyo="call" name="int" slot="O"><x eyo="list" slot="arguments"><x eyo="call" name="input" slot="O"><x eyo="list" slot="arguments"><x eyo="literal" subtype="eyo:shortstringliteral" slot="O">''</x></x></x></x></x></x></s>
    */
    {
      type: eYo.T3.Stmt.assignment_stmt,
      slots: {
        assigned: {
          slots: {
            O: {
              type: eYo.T3.Expr.call_expr,
              data: 'int',
              slots: {
                arguments: {
                  slots: {
                    O: {
                      type: eYo.T3.Expr.call_expr,
                      data: 'input'
                    }
                  }
                }
              },
            },
          },
        },
      },
    },
    {
      type: eYo.T3.Stmt.assignment_stmt,
      slots: {
        assigned: {
          slots: {
            O: {
              type: eYo.T3.Expr.call_expr,
              data: 'float',
              slots: {
                arguments: {
                  slots: {
                    O: {
                      type: eYo.T3.Expr.call_expr,
                      data: 'input'
                    }
                  }
                }
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
    {
      type: eYo.T3.Expr.a_expr,
      data: '+'
    },
    {
      type: eYo.T3.Expr.a_expr,
      data: '-'
    },
    {
      type: eYo.T3.Expr.m_expr,
      data: '*'
    },
    {
      type: eYo.T3.Expr.m_expr,
      data: '/'
    },
    {
      type: eYo.T3.Expr.m_expr,
      data: '//'
    },
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
    {
      type: eYo.T3.Stmt.import_stmt,
      data: {
        variant: eYo.Key.FROM_MODULE_IMPORT
      }
    },
    {
      type: eYo.T3.Expr.term,
      data: {
        variant: eYo.Key.NAME_ALIAS
      }
    },
    eYo.T3.Stmt.docstring_stmt,
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
    eYo.T3.Expr.star_or_expr,
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
    eYo.T3.Stmt.for_part,
    {
      type: eYo.T3.Expr.call_expr,
      data: 'range'
    },
    eYo.T3.Stmt.else_part,
    eYo.T3.Stmt.break_stmt,
    eYo.T3.Stmt.continue_stmt,
  ],
  'function': [
    {
      type: eYo.T3.Expr.call_expr,
      data: ''
    },
    {
      type: eYo.T3.Stmt.call_stmt,
      data: ''
    },
    eYo.T3.Expr.parameter_star,
    eYo.T3.Expr.parameter_star_star,
    eYo.T3.Stmt.funcdef_part,
    eYo.T3.Stmt.return_stmt,
    eYo.T3.Stmt.pass_stmt,
    eYo.T3.Expr.lambda,
    eYo.T3.Stmt.classdef_part,
    eYo.T3.Stmt.global_nonlocal_stmt,
    {
      type: eYo.T3.Stmt.global_nonlocal_stmt,
      data: 'non_local'
    },
    eYo.T3.Stmt.decorator,
    {
      type: eYo.T3.Stmt.decorator,
      data: {
        variant: eYo.Key.BUILTIN,
        builtin: eYo.Key.STATICMETHOD
      }
    },
    {
      type: eYo.T3.Stmt.decorator,
      data: {
        variant: eYo.Key.BUILTIN,
        builtin: eYo.Key.CLASSMETHOD
      }
    },
    {
      type: eYo.T3.Stmt.decorator,
      data: {
        variant: eYo.Key.BUILTIN,
        builtin: eYo.Key.PROPERTY
      }
    }
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
      type: eYo.T3.Expr.slicing,
      data: {
        variant: eYo.Key.NAME
      },
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
        variant: eYo.Key.NAME
      },
      slots: {
        slice: {
          slots: {
            O: 0
          }
        }
      }
    },
    {
      type: eYo.T3.Stmt.expression_stmt,
      slots: {
        expression: {
          type: eYo.T3.Expr.call_expr,
          data: {
            name: 'insert',
            variant: eYo.Key.BLOCK_NAME,
            ary: 2
          }
        }
      },
      title: 'list_insert'
    },
    {
      type: eYo.T3.Stmt.expression_stmt,
      slots: {
        expression: {
          type: eYo.T3.Expr.call_expr,
          data: {
            name: 'append',
            variant: eYo.Key.BLOCK_NAME,
            ary: 1
          }
        }
      },
      title: 'list_append'
    },
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
      },
      title: 'list_remove'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'index',
        variant: eYo.Key.BLOCK_NAME,
        ary: 1
      },
      title: 'list_index'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'count',
        variant: eYo.Key.BLOCK_NAME,
        ary: 1
      },
      title: 'list_count'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'pop',
        variant: eYo.Key.BLOCK_NAME,
        ary: 1
      },
      slots: {
        n_ary: {
          slots: {
            O: {
              type: eYo.T3.Expr.list_display
            }
          }
        }
      },
      title: 'list_pop'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'reverse',
        variant: eYo.Key.BLOCK_NAME,
        ary: 0
      },
      title: 'list_reverse'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'min'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'max'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'sum'
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
    eYo.T3.Expr.proper_slice,
    eYo.T3.Expr.a_expr,
    {
      type: eYo.T3.Stmt.augmented_assignment_stmt,
      data: '+='
    },
    eYo.T3.Expr.m_expr,
    {
      type: eYo.T3.Stmt.augmented_assignment_stmt,
      data: '*='
    },
  ],
  'text': [
    {
      type: eYo.T3.Stmt.assignment_stmt,
      slots: {
        assigned: {
          slots: {
            O: "'...'", 
          },
        },
      },
      title: 'text_assignment'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'print',
      slots: {
        n_ary: {
          slots: {
            O: "'...'"
          }
        }
      }
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'len',
      title: 'text_len'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'startswith',
        variant: eYo.Key.BLOCK_NAME,
        ary: 3
      },
      title: 'text_startswith'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'endswith',
        variant: eYo.Key.BLOCK_NAME,
        ary: 3
      },
      title: 'text_endswith'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'find',
        variant: eYo.Key.BLOCK_NAME,
        ary: 3
      },
      title: 'text_find'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'replace',
        variant: eYo.Key.BLOCK_NAME,
        ary: 3
      },
      title: 'text_replace'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'count',
        variant: eYo.Key.BLOCK_NAME,
        ary: 3
      },
      title: 'text_count'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'upper',
        variant: eYo.Key.BLOCK_NAME,
        ary: 0
      },
      title: 'text_upper'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'lower',
        variant: eYo.Key.BLOCK_NAME,
        ary: 0
      },
      title: 'text_lower'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'join',
        variant: eYo.Key.BLOCK_NAME
      },
      title: 'text_join'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'split',
        variant: eYo.Key.BLOCK_NAME,
        ary: 2
      },
      title: 'text_split'
    },
    {
      type: eYo.T3.Expr.term,
      data: {
        name: 'sep',
        variant: eYo.Key.NAME_DEFINITION
      },
      slots: {
        definition: 'None'
      },
      title: 'text_split_sep'
    },
    {
      type: eYo.T3.Expr.term,
      data: {
        name: 'maxsplit',
        variant: eYo.Key.NAME_DEFINITION
      },
      slots: {
        definition: -1
      },
      title: 'text_split_maxsplit'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'splitlines',
        variant: eYo.Key.BLOCK_NAME,
        ary: 1,
        mandatory: 0
      },
      title: 'text_splitlines'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'index',
        variant: eYo.Key.BLOCK_NAME,
        ary: 3
      },
      title: 'text_index'
    }
  ],
  math: [
    1,
    eYo.T3.Expr.u_expr,
    {
      type: eYo.T3.Expr.a_expr,
      data: '+'
    },
    {
      type: eYo.T3.Expr.a_expr,
      data: '-'
    },
    {
      type: eYo.T3.Expr.m_expr,
      data: '*'
    },
    {
      type: eYo.T3.Expr.m_expr,
      data: '/'
    },
    {
      type: eYo.T3.Expr.m_expr,
      data: '//'
    },
    {
      type: eYo.T3.Expr.m_expr,
      data: '%'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'divmod',
        ary: 2
      }
    },
    eYo.T3.Expr.power,
    {
      type: eYo.T3.Expr.call_expr,
      data: {
        name: 'pow',
        ary: 2
      }
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'min'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'max'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'sum'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'abs',
    },
    {
      type: eYo.T3.Expr.m_expr,
      data: '@'
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'int',
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'float',
    },
    {
      type: eYo.T3.Expr.call_expr,
      data: 'trunc'
    },
    '1j',
    {
      type: eYo.T3.Expr.a_expr,
      data: '+',
      slots: {
        rhs: {
          type: eYo.T3.Expr.m_expr,
          data: '*',
          slots: {
            rhs: '1j'
          }
        }
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
      data: {
        name: 'conjugate',
        ary: 0,
        variant: eYo.Key.BLOCK_NAME
      }
    },
  ]
}
console.warn('key handler: "foo.bar", "foo[]", "foo(…)"')
