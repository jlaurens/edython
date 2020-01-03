/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('Expr')

eYo.provide('Brick.Range')

eYo.T3.Expr.builtin__range_expr = 'eyo:builtin__range_expr'

/**
 * Class for a Delegate, range brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('builtin__range_expr', {
  xml: {
    attr: 'range',
  },
  data: {
    variant: {
      all:[
        eYo.Key.NONE,
        eYo.Key.START,
        eYo.Key.STEP
      ],
      init: eYo.Key.NONE,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        this.brick.start_d.incog = after === eYo.Key.NONE
        this.brick.sep_s.incog = after === eYo.Key.NONE
        this.brick.step_d.incog = after !== eYo.Key.STEP
      },
      xml: false
    },
    start: {
      placeholder: 0,
      synchronize: true,
      init: '',
      xml: {
        save (element) /** @suppress {globalThis} */ {
          if (this.brick.variant_p !== eYo.Key.NONE) {
            this.save(element)
          }
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        this.didLoad()
        if (this.requiredFromSaved && after !== eYo.Key.STEP) {
          this.brick.variant_p = eYo.Key.START
        }
      }
    },
    stop: {
      init: '',
      placeholder: 10,
      synchronize: true
    },
    step: {
      init: '',
      placeholder: 1,
      synchronize: true,
      xml: {
        save (element) /** @suppress {globalThis} */ {
          if (this.brick.variant_p === eYo.Key.STEP) {
            this.save(element)
          }
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        this.didLoad()
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.STEP
        }
      }
    }
  },
  slots: {
    open: {
      order: 5,
      fields: {
        label: {
          order:1,
          builtin: 'range'
        },
        open: {
          value: '(',
          order: 2
        }
      },
    },
    start: {
      order: 10,
      fields: {
        bind: {
          order: 1,
          endEditing: true,
          placeholder: 0
        }
      },
      check: eYo.T3.Expr.Check.argument_any
    },
    sep: {
      order: 20,
      fields: {
        sep:{
          value: ',',
          separator: true
        }
      }
    },
    stop: {
      order: 30,
      fields: {
        bind: {
          order: 1,
          endEditing: true,
          placeholder: 0
        }
      },
      check: eYo.T3.Expr.Check.argument_any
    },
    step: {
      order: 40,
      fields: {
        begin:{
          order: 1,
          value: ',',
          separator: true
        },
        bind: {
          order: 2,
          endEditing: true,
          placeholder: 0
        }
      },
      check: eYo.T3.Expr.Check.argument_any
    },
    close: {
      order: 100,
      fields: {
        close: {
          value: ')',
          order: -1
        }
      },
    },
  },
  out: {
    check: [
      eYo.T3.Expr.builtin__range_expr,
      eYo.T3.Expr.call_expr
    ]
  }
}, true)

/**
 * The xml `eyo` attribute of this brick, as it should appear in the saved data.
 * For edython.
 */
eYo.Expr.builtin__range_expr.prototype.xmlAttr = function () {
  return 'range'
}

eYo.Brick.Range.T3s = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.builtin__range_expr
]
