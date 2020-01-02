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

eYo.require('Expr')

eYo.require('C9r.Change')

eYo.require('Decorate')
eYo.require('Msg')

eYo.require('T3.All')
eYo.provide('Brick.Starred')

/**
 * Convenient check list for starred expressions
 */
eYo.T3.Expr.Check._expression_or_parameter = eYo.T3.Expr.Check.expression.concat(eYo.T3.Expr.Check.parameter)

/**
 * Convenient check list for starred expressions
 */
eYo.T3.Expr.Check._or_expr_all_or_parameter_or_target = eYo.T3.Expr.Check.or_expr_all.concat(eYo.T3.Expr.Check.parameter).concat(eYo.T3.Expr.Check.target)

/**
 * Class for a Delegate, starred brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
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

eYo.Expr.Dflt.makeSubclass('Starred', {
  xml: {
    types: [
      eYo.T3.Expr.star_expr,
      eYo.T3.Expr.expression_star,
      eYo.T3.Expr.expression_star_star,
      eYo.T3.Expr.or_expr_star_star,
      eYo.T3.Expr.target_star,
      eYo.T3.Expr.star,
      eYo.T3.Expr.parameter_star,
      eYo.T3.Expr.parameter_star_star
    ]
  },
  data: {
    variant: {
      order: 98,
      all: [eYo.Key.NONE, eYo.Key.STAR],
      init: eYo.Key.NONE, // not a lonely '*'
      didChange (before, after) /** @suppress {globalThis} */ {
        this.didChange(before, after)
        var b3k = this.brick
        b3k.modified_d.incog = after === eYo.Key.STAR
        if (after === eYo.Key.STAR) {
          b3k.modifier_p = '*'
        }
      },
      fromType (type) /** @suppress {globalThis} */ {
        // the `didLoad` will be performed afterwards.
        this.set(type === eYo.T3.Expr.star ? eYo.Key.STAR : eYo.Key.NONE)
      },
      xml: false
    },
    modifier: {
      order: 99,
      all: ['*', '**'],
      init: '*',
      didChange (before, after) /** @suppress {globalThis} */ {
        this.didChange(before, after)
        var b3k = this.brick
        if (after !== '*') {
          b3k.variant_p = eYo.Key.NONE
        }
      },
      fromType (type) /** @suppress {globalThis} */ {
        /* if (type === eYo.T3.Expr.star) {
          this.set('*')
        } else if (type === eYo.T3.Expr.target_star) {
          this.set('*')
        } else if (type === eYo.T3.Expr.parameter_star) {
          this.set('*')
        } else if (type === eYo.T3.Expr.star_expr) {
          this.set('*')
        } else */ if (type === eYo.T3.Expr.parameter_star_star) {
          this.set('**')
        } else if (type === eYo.T3.Expr.expression_star_star) {
          this.set('**')
        } else if (type === eYo.T3.Expr.or_expr_star_star) {
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
        if (t === eYo.T3.Expr.parameter_star || t === eYo.T3.Expr.parameter_star_star || t === eYo.T3.Expr.target_star) {
          return eYo.Msg.Placeholder.NAME
        } else {
          return eYo.Msg.Placeholder.EXPRESSION
        }
      },
      validate (before, after) /** @suppress {globalThis} */ {
        var p5e = eYo.T3.Profile.get(after, null)
        return p5e.expr === eYo.T3.Expr.unset
        || p5e.expr === eYo.T3.Expr.identifier
        || p5e.expr === eYo.T3.Expr.dotted_name
          ? after
          : eYo.INVALID
      },
      didChange (before, after) /** @suppress {globalThis} */ {
        this.didChange(before, after)
        if (after.length) {
          this.brick.variant_p = eYo.Key.NONE
        }
      },
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required = this.brick.variant_p !== eYo.Key.STAR && this.brick.modifier_p === '*'
          this.save(element, opt)
        },
        load (element, opt) /** @suppress {globalThis} */ {
          this.load(element, opt)
        }
      },
      fromType (type) /** @suppress {globalThis} */ {
        // the `didLoad` will be performed afterwards.
        this.required_from_type = type !== eYo.T3.Expr.star
      },
      didLoad () /** @suppress {globalThis} */ {
        this.brick.variant_p = this.required_from_type || this.isRequiredFromModel()
          ? eYo.Key.NONE
          : eYo.Key.STAR
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
        return this.brick.modifier_p === '*'
          ? eYo.T3.Expr.Check._or_expr_all_or_parameter_or_target
          : eYo.T3.Expr.Check._expression_or_parameter
      },
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ {
        if (eYo.Events.recordingUndo) {
          this.brick.variant_p = eYo.Key.NONE
        }
      }
    }
  },
  out: {
    check (type) /** @suppress {globalThis} */ {
      // retrieve the brick
      var brick = this.brick
      if (brick.variant_p === eYo.Key.STAR) {
        return [eYo.T3.Expr.star]
      }
      var b = brick.modified_b
      var types = []
      if (brick.modifier_p === '*') {
        if (b) {
          var tt = b.type
          if (goog.array.contains(eYo.T3.Expr.Check.or_expr_all, tt)) {
            types.push(eYo.T3.Expr.star_expr)
          }
          if (goog.array.contains(eYo.T3.Expr.Check.expression, tt)) {
            types.push(eYo.T3.Expr.expression_star)
          }
          if (goog.array.contains(eYo.T3.Expr.Check.target, tt)) {
            types.push(eYo.T3.Expr.target_star)
          }
          if (goog.array.contains(eYo.T3.Expr.Check.parameter, tt)) {
            types.push(eYo.T3.Expr.parameter_star)
          }
          return types
        }
        return [eYo.T3.Expr.star_expr,
          eYo.T3.Expr.expression_star,
          eYo.T3.Expr.target_star,
          eYo.T3.Expr.parameter_star
        ]
      }
      if(b) {
        tt = b.type
        if (goog.array.contains(eYo.T3.Expr.Check.or_expr_all, tt)) {
          types.push(eYo.T3.Expr.or_expr_star_star)
        }
        if (goog.array.contains(eYo.T3.Expr.Check.expression, tt)) {
          types.push(eYo.T3.Expr.expression_star_star)
        }
        if (goog.array.contains(eYo.T3.Expr.Check.parameter, tt)) {
          types.push(eYo.T3.Expr.parameter_star_star)
        }
        return types
      }
      return [eYo.T3.Expr.or_expr_star_star,
        eYo.T3.Expr.expression_star_star,
        eYo.T3.Expr.parameter_star_star
      ]
    }
  }
})

/**
 * The type and connection depend on the properties modifier, value and variant.
 * For edython.
 */
eYo.Expr.Starred.prototype.getType = eYo.C9r.decorateChange(
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
eYo.Expr.Starred.prototype.xmlAttr = function () {
  return this.modifier_p
}

// /**
//  * Did connect this brick's connection from another connection.
//  * @param {eYo.Magnet.Dflt} m4t
//  * @param {eYo.Magnet.Dflt} oldTargetM4t that was connected to connection
//  * @param {eYo.Magnet.Dflt} targetOldM4t that was connected to the old target connection.
//  */
// eYo.Expr.Starred.prototype.didConnect = function (m4t, oldTargetM4t, targetOldM4t) {
//   eYo.Expr.Starred.superProto_.didConnect.call(this, m4t, oldTargetM4t, targetOldM4t)
//   if (m4t === this.modified_s.magnet) {

//   }
// }

// /**
//  * Did disconnect this brick's connection from another connection.
//  * @param {eYo.Magnet.Dflt} m4t
//  * @param {eYo.Magnet.Dflt} oldTargetM4t that was connected to m4t
//  */
// eYo.Expr.Starred.prototype.didDisconnect = function (m4t, oldTargetM4t) {
//   eYo.Expr.Starred.superProto_.didDisconnect.call(this, m4t, oldTargetM4t)
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
  eYo.C9r.register(k, (eYo.Expr[k] = eYo.Expr.Starred))
})
