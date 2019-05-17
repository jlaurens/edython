/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Block delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Brick.List')

goog.require('eYo.Decorate')
goog.require('eYo.Consolidator.List')
goog.require('eYo.Brick.Expr')

/**
 * Class for a Delegate, value brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Expr.makeSubclass('List', {
  list: {}
}, eYo.Brick)

/**
 * Fetches the named input object, getInput.
 * @param {String} name The name of the input.
 * @param {?Boolean} dontCreate Whether the receiver should create inputs on the fly.
 * @return {eYo.Input} The input object, or null if input does not exist or undefined for the default brick implementation.
 */
eYo.Brick.List.prototype.getInput = function (name, dontCreate) {
  var input = eYo.Brick.List.superClass_.getInput.call(this, name)
  if (!input) {
    this.createConsolidator()
    input = this.consolidator.getInput(this, name, dontCreate)
  }
  return input
}

/**
 * Create a consolidator.
 *
 * @param {boolean} force
 */
eYo.Brick.List.prototype.createConsolidator = eYo.Decorate.reentrant_method(
  'createConsolidator',
  function (force) {
  var type = this.type
  if (!type) {
    console.error('unexpected void type')
  }
  var D = eYo.Brick.Manager.getModel(type).list
  goog.asserts.assert(D, 'inputModel__.list is missing in ' + type)
  var C10r = this.consolidatorConstructor || D.consolidator || eYo.Consolidator.List
  if (this.consolidator) {
    if (this.consolidator.constructor !== C10r) {
      this.consolidator = new C10r(D)
      goog.asserts.assert(this.consolidator, `Could not create the consolidator ${type}`)
    } else {
      this.consolidator.init(D)
    }
    if (force) {
      this.consolidate()
    }
  } else {
    this.consolidator = new C10r(D)
    goog.asserts.assert(this.consolidator, `Could not create the consolidator ${type}`)
    this.consolidate()
  }
})

/**
 * Fetches the named input object, getInput.
 * @param {!eYo.Magnet} m4t.
 * @param {!eYo.Magnet} oldTargetM4t.
 * @param {!eYo.Magnet} targetOldM4t
 */
eYo.Brick.List.prototype.didConnect = function (m4t, oldTargetM4t, targetOldM4t) {
  eYo.Brick.List.superClass_.didConnect.call(this, m4t, oldTargetM4t, targetOldM4t)
  if (m4t.isOutput) {
    this.createConsolidator(true)
  }
}

/**
 * Consolidate the input.
 * Removes empty place holders.
 * This must not be overriden.
 *
 * @param {!Block} brick
 */
eYo.Brick.List.prototype.doConsolidate = (() => {
  // this is a closure
  /**
   * Consolidate the input.
   * Removes empty place holders.
   * This must not be overriden.
   */
  var doConsolidate = function (deep, force) {
    if (this.will_connect_ || this.change.level) {
      // reentrant flag or wait for the new connection
      // to be established before consolidating
      // reentrant is essential because the consolidation
      // may cause rerendering ad vitam eternam.
      return
    }
    force = true  // always force consolidation because of the dynamics
    if (eYo.Brick.List.superClass_.doConsolidate.call(this, deep, force)) {
      return !this.connectionsIncog && this.consolidator.consolidate(this, deep, force)
    }
  }
  return function (deep, force) {
    this.createConsolidator()
    this.doConsolidate = doConsolidate
    return doConsolidate.apply(this, arguments)// this is not recursive
  }
}) ()

// eYo.Brick.List.prototype.consolidator = undefined

/**
 * Clear the list af all items.
 * For edython.
 * @private
 */
eYo.Brick.List.prototype.removeItems = function () {
  eYo.Events.groupWrap(() => {
    this.inputList.forEach(input => {
      var m4t = input.magnet
      var t9k = m4t.targetBrick
      if (t9k) {
        m4t.disconnect()
        t9k.dispose()
      }
    })
    this.consolidate()
  })
}

/**
 * Increment the change count.
 * Force to recompute the chain tile.
 * For edython.
 */
eYo.Brick.List.prototype.incrementInputChangeCount = function () {
  this.forEachInput(input => {
    var t9k = input.magnet.targetBrick
    t9k && t9k.incrementChangeCount()
  })
  this.incrementChangeCount()
}

Object.defineProperties(eYo.Brick.List.prototype, {
  firstTarget: {
    get () {
      var t
      this.inputList.some(input => (t = input.targetBrick))
      return t
    }
  }
})

/**
 * Class for a Delegate, optional expression_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.List.makeSubclass('optional_expression_list', {
  list: {
    check: eYo.T3.Expr.Check.expression,
    mandatory: 0,
    presep: ','
  }
})

/**
 * Class for a Delegate, non_void_expression_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.List.makeSubclass('non_void_expression_list', {
  list: {
    check: eYo.T3.Expr.Check.expression,
    mandatory: 1,
    presep: ','
  }
})

/**
 * Class for a Delegate, slice_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.List.makeSubclass('slice_list', {
  list: {
    check: eYo.T3.Expr.Check.slice_item,
    mandatory: 1,
    presep: ','
  }
})

/**
 * Class for a Delegate, with_item_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.List.makeSubclass('with_item_list', {
  list: {
    check: eYo.T3.Expr.Check.with_item,
    mandatory: 1,
    presep: ','
  }
})

/**
 * Class for a Delegate, enclosure brick.
 * This brick is for subclassing only.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 * There are 4 kinds of enclosure lists:
 * 1) parent_form and generator expression
 * 2) list_display
 * 3) set_display
 * 4) dict_display
 * Depending on the content of the list, the type is one of these.
 * We do not make the difference, except concerning the delimiters.
 * When the list is void, the type is not set_display.
 * Actually, the lists are stored as expression in xml.
 * There `eyo` attribute is built upon the delimiter,
 * '()' for parenth_form, '[]' for list_display,
 * '{}' for set_display and dict_display.
 * To make the difference between set_display and dict_display,
 * we must see the content.
 * The first connection will decide whether it is one or the other.
 * What is the check for a unique connection:
 * '()' and '[]': enclosure_list_unique
 * '{}': dict_comprehension
 * What are the checks for all the connections, when not unique
 * '()' and '{}': starred_item
 * '{}': key_datum_all
 * What are the possibilities with braces.
 * 1) void :
 * what can be connected: comprehension, dict_comprehension, star_item, key_datum_all
 * 2) singleton set_display: replacement for the unique connection: same as above
 * 3) singleton dict_display: replacement for the unique connection: same as above
 */
eYo.Brick.List.makeSubclass('enclosure', {
  data: {
    variant: {
      order: 0,
      all: [
        eYo.Key.PAR,
        eYo.Key.SQB,
        eYo.Key.BRACE
      ],
      init: eYo.Key.PAR,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        var o = this.owner
        o.prefix_f.text = newValue[0]
        o.suffix_f.text = newValue[1]
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        return {
          [eYo.T3.Expr.enclosure]: eYo.Key.PAR,
          [eYo.T3.Expr.parenth_form]: eYo.Key.PAR,
          [eYo.T3.Expr.parenth_target_list]: eYo.Key.PAR,
          [eYo.T3.Expr.list_display]: eYo.Key.SQB,
          [eYo.T3.Expr.bracket_target_list]: eYo.Key.SQB
        } [type] || eYo.Key.BRACE
      }
    }
  },
  fields: {
    prefix: '',
    suffix: ''
  },
  list: (() => {
    var unique = {
      [eYo.T3.Expr.parenth_form]: eYo.T3.Expr.Check.enclosure_list_unique,
      [eYo.T3.Expr.parenth_target_list]: eYo.T3.Expr.Check.enclosure_list_unique,
      [eYo.T3.Expr.list_display]: [eYo.T3.Expr.comprehension],
      [eYo.T3.Expr.bracket_target_list]: [eYo.T3.Expr.comprehension],
      [eYo.T3.Expr.one_set_display]: [eYo.T3.Expr.comprehension, eYo.T3.Expr.dict_comprehension],
      [eYo.T3.Expr.set_display]: [eYo.T3.Expr.comprehension, eYo.T3.Expr.dict_comprehension],
      [eYo.T3.Expr.one_dict_display]: [eYo.T3.Expr.comprehension, eYo.T3.Expr.dict_comprehension],
      [eYo.T3.Expr.dict_display]: [eYo.T3.Expr.comprehension, eYo.T3.Expr.dict_comprehension],
      [eYo.T3.Expr.void_dict_display]: [eYo.T3.Expr.comprehension, eYo.T3.Expr.dict_comprehension]
    }
    var check = {
      [eYo.T3.Expr.parenth_form]: eYo.T3.Expr.Check.starred_item_38,
      [eYo.T3.Expr.list_display]: eYo.T3.Expr.Check.starred_item_38,
      [eYo.T3.Expr.parenth_target_list]: eYo.T3.Expr.Check.starred_item_38,
      [eYo.T3.Expr.bracket_target_list]: eYo.T3.Expr.Check.starred_item_38,
      [eYo.T3.Expr.one_set_display]: eYo.T3.Expr.Check.starred_item,
      [eYo.T3.Expr.set_display]: eYo.T3.Expr.Check.starred_item,
      [eYo.T3.Expr.one_dict_display]: eYo.T3.Expr.Check.key_datum_all,
      [eYo.T3.Expr.dict_display]: eYo.T3.Expr.Check.key_datum_all
    }
    check[eYo.T3.Expr.void_dict_display] = goog.array.concat(eYo.T3.Expr.Check.starred_item, eYo.T3.Expr.Check.key_datum_all)
    var me = {
      unique: (type) => {
        return unique[type]
      },
      check: (type) => {
        return check[type]
      },
      mandatory: 0,
      presep: ','
    }
    var all = Object.create(null)
    ;[eYo.T3.Expr.parenth_form,
      eYo.T3.Expr.parenth_target_list,
      eYo.T3.Expr.list_display,
      eYo.T3.Expr.bracket_target_list,
      eYo.T3.Expr.set_display,
      eYo.T3.Expr.dict_display].forEach(k => {
      all[k] = goog.array.concat(me.unique(k), me.check(k))
    })
    all[eYo.T3.Expr.void_dict_display] = all[eYo.T3.Expr.one_set_display] = all[eYo.T3.Expr.one_dict_display] = goog.array.concat(
      me.unique(eYo.T3.Expr.one_set_display),
      me.check(eYo.T3.Expr.dict_display),
      me.check(eYo.T3.Expr.set_display))
    me.all = (type) => {
      return all [type]
    }
    return me
  }) (),
  out: {
    check: /** @suppress {globalThis} */ function (type, subtype) {
      // retrieve the brick delegate
      var brick = this.brick
      var p5e = brick.profile_p
      return brick.getOutCheck(p5e)
    }
  }
})

Object.defineProperties(eYo.Brick.Expr.enclosure.prototype, {
  profile_p : {
    get () {
      var p = this.getProfile()
      return this.profile_ === p
        ? this.profile_
        : (this.profile_ = p)
    },
    set (newValue) {
      this.profile_ = newValue
    }
  }
})

/**
 * getProfile.
 * @return {!Object} with `ans` key.
 */
eYo.Brick.Expr.enclosure.prototype.getProfile = eYo.Decorate.onChangeCount(
  'getProfile',
  function () {
    // this may be called very very early when
    // neither `data` nor `slots` may exist yet
    if (this.data && this.slots) {
      var f = (target, no_target) => {
        return {ans: this.someInput(input => {
            var t = input.targetBrick
            if (t && (t = t.out_m.check_)) {
              return t.some(x => eYo.T3.Expr.Check.target.indexOf(x) >= 0)
            }
          })
          ? target
          : no_target
        }
      }
      var variant = this.variant_p
      if (variant === eYo.Key.PAR) {
        return f(eYo.T3.Expr.parenth_target_list, eYo.T3.Expr.parenth_form)
      }
      if (variant === eYo.Key.SQB) {
        return f(eYo.T3.Expr.bracket_target_list, eYo.T3.Expr.list_display)
      }
      var target = this.firstTarget
      if (target) {
        if (target.type === eYo.T3.Expr.comprehension) {
          return {ans: eYo.T3.Expr.set_display}
        } else if (target.type === eYo.T3.Expr.dict_comprehension) {
          return {ans: eYo.T3.Expr.dict_display}
        } else if (this.inputList.length === 3) {
            if (this.model.list.all(eYo.T3.Expr.set_display).indexOf(target.type) >= 0) {
              return {ans: eYo.T3.Expr.one_set_display}
            } else {
              return {ans: eYo.T3.Expr.one_dict_display}
            }
        } else if (this.model.list.all(eYo.T3.Expr.set_display).indexOf(target.type) >= 0) {
          return {ans: eYo.T3.Expr.set_display}
        } else {
          return {ans: eYo.T3.Expr.dict_display}
        }
      }
      return {ans: eYo.T3.Expr.void_dict_display}
    }
    return {ans: eYo.T3.Expr.parenth_form}
  }
)

/**
 * getOutCheck.
 * The check_ array of the output connection.
 * @param {!Object} profile
 */
eYo.Brick.Expr.enclosure.prototype.getOutCheck = function (profile) {
  if (profile === eYo.T3.Expr.parenth_target_list) {
    return [eYo.T3.Expr.parenth_target_list, eYo.T3.Expr.parenth_form]
  } else if (profile === eYo.T3.Expr.bracket_target_list) {
    return [eYo.T3.Expr.bracket_target_list, eYo.T3.Expr.list_display]
  } else if (profile === eYo.T3.Expr.void_dict_display) {
    return [profile, eYo.T3.Expr.dict_display]
  } else if (profile === eYo.T3.Expr.one_dict_display) {
    return [profile, eYo.T3.Expr.dict_display]
  } else if (profile === eYo.T3.Expr.one_set_display) {
    return [profile, eYo.T3.Expr.set_display]
  } else {
    return [profile]
  }
}

/**
 * getBaseType.
 * The type depends on the variant and the modifiers.
 * As side effect, the subtype is set.
 */
eYo.Brick.Expr.enclosure.prototype.getBaseType = function () {
  return this.profile_p
}
;['parenth_form',
'parenth_target_list',
'list_display',
'bracket_target_list',
'void_dict_display',
'one_set_display',
'set_display',
'dict_display',
'one_dict_display'].forEach(k => {
  eYo.Brick.Expr[k] = eYo.Brick.Expr.enclosure
  eYo.Brick.Manager.register(k)
})

eYo.Brick.List.T3s = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.comprehension,
  eYo.T3.Expr.dict_comprehension,
  eYo.T3.Expr.key_datum,
  eYo.T3.Expr.optional_expression_list,
  eYo.T3.Expr.parenth_form,
  eYo.T3.Expr.parenth_target_list,
  eYo.T3.Expr.list_display,
  eYo.T3.Expr.bracket_target_list,
  eYo.T3.Expr.void_dict_display,
  eYo.T3.Expr.one_set_display,
  eYo.T3.Expr.set_display,
  eYo.T3.Expr.one_dict_display,
  eYo.T3.Expr.dict_display,
  eYo.T3.Expr.slice_list,
  eYo.T3.Expr.dict_display,
  eYo.T3.Expr.with_item_list
]
