/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Block delegates for edython, `star` modifications.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Brick.Starred')

goog.require('eYo.Msg')
goog.require('eYo.Decorate')
goog.require('eYo.Brick')
goog.require('eYo.T3.All')
goog.require('goog.dom');

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

eYo.Brick.Expr.makeSubclass('Starred', {
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
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var O = this.owner
        O.modified_d.incog = newValue === eYo.Key.STAR
        if (newValue === eYo.Key.STAR) {
          O.modifier_p = '*'
        }
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        // the `didLoad` will be performed afterwards.
        this.set(type === eYo.T3.Expr.star ? eYo.Key.STAR : eYo.Key.NONE)
      },
      xml: false
    },
    modifier: {
      order: 99,
      all: ['*', '**'],
      init: '*',
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var O = this.owner
        if (newValue !== '*') {
          O.variant_p = eYo.Key.NONE
        }
      },
      fromType: /** @suppress {globalThis} */ function (type) {
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
      placeholder: /** @suppress {globalThis} */ function () {
        var t = this.owner && this.owner.type
        if (t === eYo.T3.Expr.parameter_star || t === eYo.T3.Expr.parameter_star_star || t === eYo.T3.Expr.target_star) {
          return eYo.Msg.Placeholder.NAME
        } else {
          return eYo.Msg.Placeholder.EXPRESSION
        }
      },
      validate: /** @suppress {globalThis} */ function (newValue) {
        var p5e = eYo.T3.Profile.get(newValue, null)
        return p5e.expr === eYo.T3.Expr.unset
        || p5e.expr === eYo.T3.Expr.identifier
        || p5e.expr === eYo.T3.Expr.dotted_name
          ? {validated: newValue}
          : null
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        if (newValue.length) {
          this.owner.variant_p = eYo.Key.NONE
        }
      },
      synchronize: true,
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          this.required = this.owner.variant_p !== eYo.Key.STAR && this.owner.modifier_p === '*'
          this.save(element, opt)
        },
        load: /** @suppress {globalThis} */ function (element, opt) {
          this.load(element, opt)
        }
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        // the `didLoad` will be performed afterwards.
        this.required_from_type = type !== eYo.T3.Expr.star
      },
      didLoad: /** @suppress {globalThis} */ function () {
        this.owner.variant_p = this.required_from_type || this.isRequiredFromModel()
          ? eYo.Key.NONE
          : eYo.Key.STAR
        this.required_from_type = false
      }
    }
  },
  fields: {
    modifier: {
      value: '',
      css: 'reserved'
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
      check: /** @suppress {globalThis} */ function (type) {
        return this.b_eyo.modifier_p === '*'
          ? eYo.T3.Expr.Check._or_expr_all_or_parameter_or_target
          : eYo.T3.Expr.Check._expression_or_parameter
      },
      didConnect: /** @suppress {globalThis} */ function (oldTargetM4t, targetOldM4t) {
        if (eYo.Events.recordUndo) {
          this.b_eyo.variant_p = eYo.Key.NONE
        }
      }
    }
  },
  output: {
    check: /** @suppress {globalThis} */ function (type) {
      // retrieve the brick delegate
      var b_eyo = this.b_eyo
      if (b_eyo.variant_p === eYo.Key.STAR) {
        return [eYo.T3.Expr.star]
      }
      var b = b_eyo.modified_b
      var types = []
      if (b_eyo.modifier_p === '*') {
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
eYo.Brick.Expr.Starred.prototype.getType = eYo.Decorate.onChangeCount(
  'getType',
  function () {
    var check = this.magnets.output.check_
    return check && check[0]
  }
)

/**
 * The xml `eyo` attribute of this brick, as it should appear in the saved data.
 * For edython.
 * @return {String}
 */
eYo.Brick.Expr.Starred.prototype.xmlAttr = function () {
  return this.modifier_p
}

// /**
//  * Did connect this brick's connection from another connection.
//  * @param {!eYo.Magnet} m4t
//  * @param {!eYo.Magnet} oldTargetM4t that was connected to connection
//  * @param {!eYo.Magnet} targetOldM4t that was connected to the old target connection.
//  */
// eYo.Brick.Expr.Starred.prototype.didConnect = function (m4t, oldTargetM4t, targetOldM4t) {
//   eYo.Brick.Expr.Starred.superClass_.didConnect.call(this, m4t, oldTargetM4t, targetOldM4t)
//   if (m4t === this.modified_s.magnet) {

//   }
// }

// /**
//  * Did disconnect this brick's connection from another connection.
//  * @param {!Blockly.Connection} blockConnection
//  * @param {!eYo.Magnet} oldTargetM4t that was connected to blockConnection
//  */
// eYo.Brick.Expr.Starred.prototype.didDisconnect = function (connection, oldTargetM4t) {
//   eYo.Brick.Expr.Starred.superClass_.didDisconnect.call(this, connection, oldTargetM4t)
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
].forEach(key => {
  eYo.Brick.Expr[key] = eYo.Brick.Expr.Starred
  eYo.Brick.Manager.register(key)
})
