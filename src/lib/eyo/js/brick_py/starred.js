/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Bricks for edython, `star` modifications.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('expr')

eYo.require('o3d.Change')

eYo.require('decorate')
eYo.require('msg')

eYo.require('t3.all')
eYo.provide('brick.starred')

/**
 * Convenient check list for starred expressions
 */
eYo.t3.expr.check._expression_or_parameter = eYo.t3.expr.check.expression.Concat(eYo.t3.expr.check.parameter)

/**
 * Convenient check list for starred expressions
 */
eYo.t3.expr.check._or_expr_all_or_parameter_or_target = eYo.t3.expr.check.or_expr_all.Concat(eYo.t3.expr.check.parameter).concat(eYo.t3.expr.check.target)

/**
 * Class for a Delegate, starred brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 *
 * Involved types:
 *
 *   star_expr ::= "*" or_expr_all
 *   expression_star ::= "*" expression
 *   expression_star_star ::= "**" expression
 *   target_star ::= "*" target
 *   star ::= "*"
 *   parameter_star ::= "*" parameter
 *   parameter_star_star ::= "**" parameter
 *
 * For edython.
 */

eYo.expr.Dflt.makeInheritedC9r('Starred', {
  xml: {
    types: [
      eYo.t3.expr.star_expr,
      eYo.t3.expr.expression_star,
      eYo.t3.expr.expression_star_star,
      eYo.t3.expr.or_expr_star_star,
      eYo.t3.expr.target_star,
      eYo.t3.expr.star,
      eYo.t3.expr.parameter_star,
      eYo.t3.expr.parameter_star_star
    ]
  },
  data: {
    variant: {
      order: 98,
      all: [eYo.key.NONE, eYo.key.STAR],
      init: eYo.key.NONE, // not a lonely '*'
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.modified_d.incog = after === eYo.key.STAR
        if (after === eYo.key.STAR) {
          b3k.Modifier_p = '*'
        }
      },
      fromType (type) /** @suppress {globalThis} */ {
        // the `didLoad` will be performed afterwards.
        this.set(type === eYo.t3.expr.star ? eYo.key.STAR : eYo.key.NONE)
      },
      xml: false
    },
    modifier: {
      order: 99,
      all: ['*', '**'],
      init: '*',
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        if (after !== '*') {
          b3k.Variant_p = eYo.key.NONE
        }
      },
      fromType (type) /** @suppress {globalThis} */ {
        /* if (type === eYo.t3.expr.star) {
          this.set('*')
        } else if (type === eYo.t3.expr.target_star) {
          this.set('*')
        } else if (type === eYo.t3.expr.parameter_star) {
          this.set('*')
        } else if (type === eYo.t3.expr.star_expr) {
          this.set('*')
        } else */ if (type === eYo.t3.expr.parameter_star_star) {
          this.set('**')
        } else if (type === eYo.t3.expr.expression_star_star) {
          this.set('**')
        } else if (type === eYo.t3.expr.or_expr_star_star) {
          this.set('**')
        } else {
          this.set('*')
        }
        // this.set()
      },
      synchronize: true,
      xml: false
    },
    modified: {
      init: '',
      placeholder () /** @suppress {globalThis} */ {
        var t = this.owner && this.brick.type
        if (t === eYo.t3.expr.parameter_star || t === eYo.t3.expr.parameter_star_star || t === eYo.t3.expr.Target_star) {
          return eYo.msg.placeholder.NAME
        } else {
          return eYo.msg.placeholder.EXPRESSION
        }
      },
      validate (after) /** @suppress {globalThis} */ {
        var p5e = eYo.t3.profile.get(after, null)
        return p5e.expr === eYo.t3.expr.unset
        || p5e.expr === eYo.t3.expr.identifier
        || p5e.expr === eYo.t3.expr.dotted_name
          ? after
          : eYo.INVALID
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        if (after.length) {
          this.brick.Variant_p = eYo.key.NONE
        }
      },
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required = this.brick.Variant_p !== eYo.key.STAR && this.brick.Modifier_p === '*'
          this.save(element, opt)
        },
        load (element, opt) /** @suppress {globalThis} */ {
          this.load(element, opt)
        }
      },
      fromType (type) /** @suppress {globalThis} */ {
        // the `didLoad` will be performed afterwards.
        this.required_from_type = type !== eYo.t3.expr.star
      },
      didLoad () /** @suppress {globalThis} */ {
        this.brick.Variant_p = this.required_from_type || this.isRequiredFromModel()
          ? eYo.key.NONE
          : eYo.key.STAR
        this.required_from_type = false
      }
    }
  },
  fields: {
    modifier: {
      reserved: ''
    }
  },
  slots: {
    modified: {
      order: 10,
      fields: {
        bind: {
          endEditing: true
        }
      },
      check (type) /** @suppress {globalThis} */ {
        return this.brick.Modifier_p === '*'
          ? eYo.t3.expr.check._or_expr_all_or_parameter_or_target
          : eYo.t3.expr.check._expression_or_parameter
      },
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ {
        if (eYo.events.recordingUndo) {
          this.brick.Variant_p = eYo.key.NONE
        }
      }
    }
  },
  out: {
    check (type) /** @suppress {globalThis} */ {
      // retrieve the brick
      var brick = this.brick
      if (brick.Variant_p === eYo.key.STAR) {
        return [eYo.t3.expr.star]
      }
      var b = brick.modified_b
      var types = []
      if (brick.Modifier_p === '*') {
        if (b) {
          var tt = b.type
          if (goog.array.contains(eYo.t3.expr.check.or_expr_all, tt)) {
            types.push(eYo.t3.expr.star_expr)
          }
          if (goog.array.contains(eYo.t3.expr.check.expression, tt)) {
            types.push(eYo.t3.expr.expression_star)
          }
          if (goog.array.contains(eYo.t3.expr.check.target, tt)) {
            types.push(eYo.t3.expr.target_star)
          }
          if (goog.array.contains(eYo.t3.expr.check.parameter, tt)) {
            types.push(eYo.t3.expr.parameter_star)
          }
          return types
        }
        return [eYo.t3.expr.star_expr,
          eYo.t3.expr.expression_star,
          eYo.t3.expr.target_star,
          eYo.t3.expr.parameter_star
        ]
      }
      if(b) {
        tt = b.type
        if (goog.array.contains(eYo.t3.expr.check.or_expr_all, tt)) {
          types.push(eYo.t3.expr.or_expr_star_star)
        }
        if (goog.array.contains(eYo.t3.expr.check.expression, tt)) {
          types.push(eYo.t3.expr.expression_star_star)
        }
        if (goog.array.contains(eYo.t3.expr.check.parameter, tt)) {
          types.push(eYo.t3.expr.parameter_star_star)
        }
        return types
      }
      return [eYo.t3.expr.or_expr_star_star,
        eYo.t3.expr.expression_star_star,
        eYo.t3.expr.parameter_star_star
      ]
    }
  }
})

/**
 * The type and connection depend on the properties modifier, value and variant.
 * For edython.
 */
eYo.expr.Starred.prototype.getType = eYo.c9r.decorateChange(
  'getType',
  function () {
    var check = this.out_m.check_
    return check && check[0]
  }
)

/**
 * The xml `eyo` attribute of this brick, as it should appear in the saved data.
 * For edython.
 * @return {String}
 */
eYo.expr.Starred.prototype.xmlAttr = function () {
  return this.Modifier_p
}

// /**
//  * Did connect this brick's connection from another connection.
//  * @param {eYo.magnet.Dflt} m4t
//  * @param {eYo.magnet.Dflt} oldTargetM4t that was connected to connection
//  * @param {eYo.magnet.Dflt} targetOldM4t that was connected to the old target connection.
//  */
// eYo.expr.Starred.prototype.didConnect = function (m4t, oldTargetM4t, targetOldM4t) {
//   eYo.expr.Starred.SuperProto_.didConnect.call(this, m4t, oldTargetM4t, targetOldM4t)
//   if (m4t === this.modified_s.magnet) {

//   }
// }

// /**
//  * Did disconnect this brick's connection from another connection.
//  * @param {eYo.magnet.Dflt} m4t
//  * @param {eYo.magnet.Dflt} oldTargetM4t that was connected to m4t
//  */
// eYo.expr.Starred.prototype.didDisconnect = function (m4t, oldTargetM4t) {
//   eYo.expr.Starred.SuperProto_.didDisconnect.call(this, m4t, oldTargetM4t)
// }

;[
  'star_expr',
  'expression_star',
  'expression_star_star',
  'target_star',
  'star',
  'parameter_star',
  'parameter_star_star',
  'or_expr_star_star'
].forEach(k => {
  eYo.c9r.register(k, (eYo.expr[k] = eYo.expr.Starred))
})
