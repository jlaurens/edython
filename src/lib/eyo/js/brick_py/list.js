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

eYo.require('eYo.Expr')

eYo.require('eYo.Change')

eYo.require('eYo.Decorate')
eYo.require('eYo.Consolidator.List')
eYo.provide('eYo.Brick.List')

/**
 * Class for a Delegate, list value brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('List', {
  init: function () {
    this.slotList_ = new Proxy(this, eYo.Brick.List.slotsHandler)
  },
  list: {}
}, eYo.Brick)

eYo.Brick.List.slotsHandler = {
  get: function (brick, k) {
    if (k === 'length') {
      var slot = brick.slotAtHead
      var ans = 0
      while (slot) {
        ++ans
        slot = slot.next
      }
      return ans
    } else if (k === 'push') {
      return function (what) {
        var slot = brick.slotAtHead
        if (slot) {
          while (slot.next) {
            slot = slot.next
          }
          slot.next = what
        } else {

          return brick.slotAtHead = what
        }
        what && (what.previous = slot)
      }
    } else if (k === 'insert') {
      return function (what, where) {
        var head = brick.slotAtHead
        if (head) {
          var i = where
          while (i-- > 0) {
            if (head.next) {
              head = head.next
            } else {
              head.next = what
              what && (what.previous = head)
              return what
            }
          }
          var b = what.previous = head.previous
          ;(b && (b.next = what)) || (brick.slotAtHead = what)
          while (what.next) {
            what = what.next
          }
          what.next = head
          head && (head.previous = what)
        } else {
          return brick.slotAtHead = what
        }
      }
    } else if (k === 'map') {
      return function (f) {
        var ans = []
        brick.forEachSlot(slot => {
          ans.push(f(slot))
        })
        return ans
      }
    } else if (isNaN(k)) {
      return undefined
    }
    var ans = brick.slotAtHead
    var i = k
    while (i-- > 0) {
      ans = ans.next
    }
    return ans
  },
  set: function (brick, k, value) {
    if (isNaN(k) || !value) {
      return false
    }
    var i = k
    var ans = brick.slotAtHead
    while (i-- > 0) {
      ans = ans.next
    }
    var v = value.previous = ans.previous
    v ? (v.next = value) : (brick.slotAtHead = value)
    v = value.next = ans.next
    v && (v.previous = value)
    ans.previous = ans.next = null
    return true
  },
  deleteProperty: function (brick, k) {
    if (isNaN(k)) {
      return false
    }
    var i = k
    var ans = brick.slotAtHead
    while (i-- > 0) {
      ans = ans.next
    }
    // remove the ans object
    var v = ans.previous
    v ? (v.next = ans.next) : (brick.slotAtHead = ans.next)
    v = ans.next
    v && (v.previous = ans.previous)
    ans.previous = ans.next = null
    return true
  }
}

/**
 * Fetches the named slot object, getSlot.
 * @param {String} name The name of the slot.
 * @param {Boolean} [dontCreate] Whether the receiver should create slots on the fly.
 * @return {eYo.Slot} The slot object, or null if slot does not exist or eYo.NA for the default brick implementation.
 */
eYo.Brick.List.prototype.getSlot = function (name, dontCreate) {
  var slot = eYo.Brick.List.superClass_.getSlot.call(this, name)
  if (!slot) {
    this.createConsolidator()
    slot = this.consolidator.getSlot(this, name, dontCreate)
  }
  return slot
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
  var D = eYo.Brick.mngr.getModel(type).list
  eYo.assert(D, '`model`.list is missing in ' + type)
  var C10r = this.consolidatorConstructor || D.consolidator || eYo.Consolidator.List
  if (this.consolidator) {
    if (this.consolidator.constructor !== C10r) {
      this.consolidator = new C10r(D)
      eYo.assert(this.consolidator, `Could not create the consolidator ${type}`)
    } else {
      this.consolidator.init(D)
    }
    if (force) {
      this.consolidate()
    }
  } else {
    this.consolidator = new C10r(D)
    eYo.assert(this.consolidator, `Could not create the consolidator ${type}`)
    this.consolidate()
  }
})

/**
 * Hook point.
 * @param {eYo.Magnet} m4t.
 * @param {eYo.Magnet} oldTargetM4t.
 * @param {eYo.Magnet} targetOldM4t
 */
eYo.Brick.List.prototype.didConnect = function (m4t, oldTargetM4t, targetOldM4t) {
  eYo.Brick.List.superClass_.didConnect.call(this, m4t, oldTargetM4t, targetOldM4t)
  if (m4t.isOutput) {
    this.createConsolidator(true)
  }
}

/**
 * Consolidate the slots.
 * Removes empty place holders.
 * This must not be overriden.
 *
 * @param {Brick} brick
 */
eYo.Brick.List.prototype.doConsolidate = (() => {
  // this is a one shot function
  /**
   * Consolidate the slots.
   * Removes empty place holders.
   * This must not be overriden.
   */
  var doConsolidate = function (deep, force) {
    if (this.will_connect_ || this.change.level) {
      // reentrant flag or wait for the new connection
      // to be established before consolidating
      // reentrant is essential because the consolidation
      // may cause rerendering ad vitam aeternam.
      return
    }
    force = true  // always force consolidation because of the dynamics
    if (eYo.Brick.List.superClass_.doConsolidate.call(this, deep, force)) {
      return !this.connectionsIncog && (this.consolidator.consolidate(this, deep, force))
    }
  }
  return function (deep, force) {
    this.createConsolidator()
    this.doConsolidate = doConsolidate
    return doConsolidate.apply(this, arguments)// this is not recursive
  }
}) ()

// eYo.Brick.List.prototype.consolidator = eYo.NA

/**
 * Clear the list af all items.
 * For edython.
 * @private
 */
eYo.Brick.List.prototype.removeItems = function () {
  eYo.Events.groupWrap(() => {
    this.forEachSlot(slot => {
      var m4t = slot.magnet
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
eYo.Brick.List.prototype.changeInputDone = function () {
  this.forEachSlot(slot => {
    var t9k = slot.targetBrick
    t9k && (t9k.changeDone())
  })
  this.changeDone()
}

Object.defineProperties(eYo.Brick.List.prototype, {
  firstTarget: {
    get () {
      var t
      this.someSlot(slot => (t = slot.targetBrick))
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
        var b3k = this.brick
        b3k.prefix_f.text = newValue[0]
        b3k.suffix_f.text = newValue[1]
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
      // retrieve the brick
      var brick = this.brick
      var p5e = brick.profile_p
      return brick.getOutCheck(p5e)
    }
  }
})

Object.defineProperties(eYo.Expr.enclosure.prototype, {
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
eYo.Expr.enclosure.prototype.getProfile = eYo.Change.decorate(
  'getProfile',
  function () {
    // this may be called very very early when
    // neither `data` nor `slots` may exist yet
    if (this.data && this.slots) {
      var f = (target, no_target) => {
        return {ans: this.someSlot(slot => {
            var t = slot.targetBrick
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
        } else if (this.slots.length === 3) {
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
 * @param {Object} profile
 */
eYo.Expr.enclosure.prototype.getOutCheck = function (profile) {
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
eYo.Expr.enclosure.prototype.getBaseType = function () {
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
  eYo.Expr[k] = eYo.Expr.enclosure
  eYo.Brick.mngr.register(k)
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
