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

eYo.require('expr')

eYo.provide('brick.range')

eYo.t3.expr.builtin__range_expr = 'eyo:builtin__range_expr'

/**
 * Class for a Delegate, range brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.newC9r('builtin__range_expr', true, {
  xml: {
    attr: 'range',
  },
  data: {
    variant: {
      all:[
        eYo.key.NONE,
        eYo.key.START,
        eYo.key.STEP
      ],
      init: eYo.key.NONE,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        this.brick.start_d.incog = after === eYo.key.NONE
        this.brick.sep_s.incog = after === eYo.key.NONE
        this.brick.step_d.incog = after !== eYo.key.STEP
      },
      xml: false
    },
    start: {
      placeholder: 0,
      synchronize: true,
      init: '',
      xml: {
        save (element) /** @suppress {globalThis} */ {
          if (this.brick.variant !== eYo.key.NONE) {
            this.save(element)
          }
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        this.didLoad()
        if (this.required_from_saved && after !== eYo.key.STEP) {
          this.brick.variant_ = eYo.key.START
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
          if (this.brick.variant === eYo.key.STEP) {
            this.save(element)
          }
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        this.didLoad()
        if (this.required_from_saved) {
          this.brick.variant_ = eYo.key.STEP
        }
      }
    }
  },
  slots: {
    open: {
      order: 5,
      fields: {
        label: {
          builtin: 'range'
        },
        open: '(',
      },
    },
    start: {
      order: 10,
      fields: {
        bind: {
          endEditing: true,
          placeholder: 0
        }
      },
      check: eYo.t3.expr.check.argument_any
    },
    sep: {
      order: 20,
      fields: {
        sep: {
          value: ',',
          separator: true
        }
      }
    },
    stop: {
      order: 30,
      fields: {
        bind: {
          endEditing: true,
          placeholder: 0
        }
      },
      check: eYo.t3.expr.check.argument_any
    },
    step: {
      order: 40,
      fields: {
        label: {
          value: ',',
          separator: true
        },
        bind: {
          endEditing: true,
          placeholder: 0
        }
      },
      check: eYo.t3.expr.check.argument_any
    },
    close: {
      order: 100,
      fields: {
        close: {
          value: ')',
        }
      },
    },
  },
  out: {
    check: [
      eYo.t3.expr.builtin__range_expr,
      eYo.t3.expr.call_expr
    ]
  }
})

/**
 * The xml `eyo` attribute of this brick, as it should appear in the saved data.
 * For edython.
 */
eYo.expr.builtin__range_expr.prototype.xmlAttr = function () {
  return 'range'
}
