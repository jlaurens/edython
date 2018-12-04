/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Range')

goog.require('eYo.DelegateSvg.Expr')

eYo.T3.Expr.builtin__range_expr = 'eyo:builtin__range_expr'

/**
 * Class for a DelegateSvg, range block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('builtin__range_expr', {
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
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        this.owner.start_d.setIncog(newValue === eYo.Key.NONE)
        this.owner.sep_s.setIncog(newValue === eYo.Key.NONE)
        this.owner.step_d.setIncog(newValue !== eYo.Key.STEP)
      },
      xml: false
    },
    start: {
      placeholder: 0,
      synchronize: true,
      init: '',
      xml: {
        save: /** @suppress {globalThis} */ function (element) {
          if (this.owner.variant_p !== eYo.Key.NONE) {
            this.save(element)
          }
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        this.didLoad()
        if (this.isRequiredFrom() && newValue !== eYo.Key.STEP) {
          this.owner.variant_p = eYo.Key.START
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
        save: /** @suppress {globalThis} */ function (element) {
          if (this.owner.variant_p === eYo.Key.STEP) {
            this.save(element)
          }
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        this.didLoad()
        if (this.isRequiredFrom()) {
          this.owner.variant_p = eYo.Key.STEP
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
          value: 'range',
          css: 'builtin'
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
  output: {
    check: [
      eYo.T3.Expr.builtin__range_expr,
      eYo.T3.Expr.call_expr
    ]
  }
}, true)

/**
 * The xml `eyo` attribute of this block, as it should appear in the saved data.
 * For edython.
 */
eYo.DelegateSvg.Expr.builtin__range_expr.prototype.xmlAttr = function () {
  return 'range'
}

eYo.DelegateSvg.Range.T3s = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.builtin__range_expr
]
