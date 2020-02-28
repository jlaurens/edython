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

eYo.require('change.Base')

eYo.require('decorate')
eYo.require('consolidator.List')

/**
 * @name{eYo.expr.List}
 * @constructor
 * Class for a Delegate, list value brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.makeC9r('List', {
  init: function () {
    this.slotList_ = new Proxy(this, eYo.expr.List.SlotsHandler)
  },
  list: {}
})

eYo.expr.List.SlotsHandler = {
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
        brick.slotForEach(slot => {
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
 * @return {eYo.slot.Base} The slot object, or null if slot does not exist or eYo.NA for the default brick implementation.
 */
eYo.expr.List_p.getSlot = function (name, dontCreate) {
  var slot = eYo.expr.List.eyo.C9r_s.getSlot.call(this, name)
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
eYo.expr.List_p.createConsolidator = eYo.decorate.reentrant_method(
  'createConsolidator',
  function (force) {
    var type = this.type
    if (!type) {
      console.error('unexpected void type')
    }
    var D = eYo.model.forKey(type).list
    eYo.assert(D, '`model`.list is missing in ' + type)
    var C10r = this.consolidatorConstructor || D.consolidator || eYo.consolidator.List
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
  }
)

/**
 * Hook point.
 * @param {eYo.magnet.Base} m4t.
 * @param {eYo.magnet.Base} oldTargetM4t.
 * @param {eYo.magnet.Base} targetOldM4t
 */
eYo.expr.List_p.didConnect = function (m4t, oldTargetM4t, targetOldM4t) {
  eYo.expr.List.eyo.C9r_s.didConnect.call(this, m4t, oldTargetM4t, targetOldM4t)
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
eYo.expr.List_p.doConsolidate = (() => {
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
    if (eYo.expr.List.eyo.C9r_s.doConsolidate.call(this, deep, force)) {
      return !this.connectionsIncog && (this.consolidator.consolidate(this, deep, force))
    }
  }
  return function (deep, force) {
    this.createConsolidator()
    this.doConsolidate = doConsolidate
    return doConsolidate.apply(this, arguments)// this is not recursive
  }
}) ()

// eYo.expr.List_p.consolidator = eYo.NA

/**
 * Clear the list af all items.
 * For edython.
 * @private
 */
eYo.expr.List_p.removeItems = function () {
  eYo.event.groupWrap(() => {
    this.slotForEach(slot => {
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
eYo.expr.List_p.changeInputDone = function () {
  this.slotForEach(slot => {
    var t9k = slot.targetBrick
    t9k && (t9k.changeDone())
  })
  this.changeDone()
}

Object.defineProperties(eYo.expr.List_p, {
  firstTarget: {
    get () {
      var t
      this.slotSome(slot => (t = slot.targetBrick))
      return t
    }
  }
})

/**
 * Class for a Delegate, optional expression_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.List.makeInheritedC9r('optional_expression_list', {
  list: {
    check: eYo.t3.expr.check.expression,
    mandatory: 0,
    presep: ','
  }
})

/**
 * Class for a Delegate, non_void_expression_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.List.makeInheritedC9r('non_void_expression_list', {
  list: {
    check: eYo.t3.expr.check.expression,
    mandatory: 1,
    presep: ','
  }
})

/**
 * Class for a Delegate, slice_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.List.makeInheritedC9r('slice_list', {
  list: {
    check: eYo.t3.expr.check.slice_item,
    mandatory: 1,
    presep: ','
  }
})

/**
 * Class for a Delegate, with_item_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.List.makeInheritedC9r('with_item_list', {
  list: {
    check: eYo.t3.expr.check.with_item,
    mandatory: 1,
    presep: ','
  }
})

/**
 * Class for a Delegate, enclosure brick.
 * This brick is for subclassing only.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
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
eYo.expr.List.makeInheritedC9r('enclosure', {
  data: {
    variant: {
      order: 0,
      all: [
        eYo.key.PAR,
        eYo.key.SQB,
        eYo.key.BRACE
      ],
      init: eYo.key.PAR,
      synchronize (after) /** @suppress {globalThis} */ {
        var b3k = this.brick
        b3k.prefix_f.text = after[0]
        b3k.suffix_f.text = after[1]
      },
      fromType (type) /** @suppress {globalThis} */ {
        return {
          [eYo.t3.expr.enclosure]: eYo.key.PAR,
          [eYo.t3.expr.parenth_form]: eYo.key.PAR,
          [eYo.t3.expr.parenth_target_list]: eYo.key.PAR,
          [eYo.t3.expr.list_display]: eYo.key.SQB,
          [eYo.t3.expr.bracket_target_list]: eYo.key.SQB
        } [type] || eYo.key.BRACE
      }
    }
  },
  fields: {
    prefix: '',
    suffix: ''
  },
  list: (() => {
    var unique = {
      [eYo.t3.expr.parenth_form]: eYo.t3.expr.check.enclosure_list_unique,
      [eYo.t3.expr.parenth_target_list]: eYo.t3.expr.check.enclosure_list_unique,
      [eYo.t3.expr.list_display]: [eYo.t3.expr.comprehension],
      [eYo.t3.expr.bracket_target_list]: [eYo.t3.expr.comprehension],
      [eYo.t3.expr.one_set_display]: [eYo.t3.expr.comprehension, eYo.t3.expr.dict_comprehension],
      [eYo.t3.expr.set_display]: [eYo.t3.expr.comprehension, eYo.t3.expr.dict_comprehension],
      [eYo.t3.expr.one_dict_display]: [eYo.t3.expr.comprehension, eYo.t3.expr.dict_comprehension],
      [eYo.t3.expr.dict_display]: [eYo.t3.expr.comprehension, eYo.t3.expr.dict_comprehension],
      [eYo.t3.expr.void_dict_display]: [eYo.t3.expr.comprehension, eYo.t3.expr.dict_comprehension]
    }
    var check = {
      [eYo.t3.expr.parenth_form]: eYo.t3.expr.check.starred_item_38,
      [eYo.t3.expr.list_display]: eYo.t3.expr.check.starred_item_38,
      [eYo.t3.expr.parenth_target_list]: eYo.t3.expr.check.starred_item_38,
      [eYo.t3.expr.bracket_target_list]: eYo.t3.expr.check.starred_item_38,
      [eYo.t3.expr.one_set_display]: eYo.t3.expr.check.starred_item,
      [eYo.t3.expr.set_display]: eYo.t3.expr.check.starred_item,
      [eYo.t3.expr.one_dict_display]: eYo.t3.expr.check.key_datum_all,
      [eYo.t3.expr.dict_display]: eYo.t3.expr.check.key_datum_all
    }
    check[eYo.t3.expr.void_dict_display] = goog.array.concat(eYo.t3.expr.check.starred_item, eYo.t3.expr.check.key_datum_all)
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
    ;[eYo.t3.expr.parenth_form,
      eYo.t3.expr.parenth_target_list,
      eYo.t3.expr.list_display,
      eYo.t3.expr.bracket_target_list,
      eYo.t3.expr.set_display,
      eYo.t3.expr.dict_display].forEach(k => {
      all[k] = goog.array.concat(me.unique(k), me.check(k))
    })
    all[eYo.t3.expr.void_dict_display] = all[eYo.t3.expr.one_set_display] = all[eYo.t3.expr.one_dict_display] = goog.array.concat(
      me.unique(eYo.t3.expr.one_set_display),
      me.check(eYo.t3.expr.dict_display),
      me.check(eYo.t3.expr.set_display))
    me.all = (type) => {
      return all [type]
    }
    return me
  }) (),
  out: {
    check (type, subtype) /** @suppress {globalThis} */ {
      // retrieve the brick
      var brick = this.brick
      var p5e = brick.profile
      return brick.getOutCheck(p5e)
    }
  },
  value: {
    profile : {
      get () {
        var p = this.getProfile()
        return this.profile__ === p
          ? this.profile__
          : (this.profile__ = p)
      }
    }
  },
})

/**
 * getProfile.
 * @return {!Object} with `ans` key.
 */
eYo.expr.enclosure.prototype.getProfile = eYo.change.decorate(
  'getProfile',
  function () {
    // this may be called very very early when
    // neither `data` nor `slots` may exist yet
    if (this.data && this.slots) {
      var f = (target, no_target) => {
        return {ans: this.slotSome(slot => {
            var t = slot.targetBrick
            if (t && (t = t.out_m.check_)) {
              return t.some(x => eYo.t3.expr.check.target.indexOf(x) >= 0)
            }
          })
          ? target
          : no_target
        }
      }
      var variant = this.Variant_p
      if (variant === eYo.key.PAR) {
        return f(eYo.t3.expr.parenth_target_list, eYo.t3.expr.parenth_form)
      }
      if (variant === eYo.key.SQB) {
        return f(eYo.t3.expr.bracket_target_list, eYo.t3.expr.list_display)
      }
      var target = this.firstTarget
      if (target) {
        if (target.type === eYo.t3.expr.comprehension) {
          return {ans: eYo.t3.expr.set_display}
        } else if (target.type === eYo.t3.expr.dict_comprehension) {
          return {ans: eYo.t3.expr.dict_display}
        } else if (this.slots.length === 3) {
            if (this.model.all(eYo.t3.expr.set_display).indexOf(target.type) >= 0) {
              return {ans: eYo.t3.expr.one_set_display}
            } else {
              return {ans: eYo.t3.expr.one_dict_display}
            }
        } else if (this.model.all(eYo.t3.expr.set_display).indexOf(target.type) >= 0) {
          return {ans: eYo.t3.expr.set_display}
        } else {
          return {ans: eYo.t3.expr.dict_display}
        }
      }
      return {ans: eYo.t3.expr.void_dict_display}
    }
    return {ans: eYo.t3.expr.parenth_form}
  }
)

/**
 * getOutCheck.
 * The check_ array of the output connection.
 * @param {Object} profile
 */
eYo.expr.enclosure.prototype.getOutCheck = function (profile) {
  if (profile === eYo.t3.expr.parenth_target_list) {
    return [eYo.t3.expr.parenth_target_list, eYo.t3.expr.parenth_form]
  } else if (profile === eYo.t3.expr.bracket_target_list) {
    return [eYo.t3.expr.bracket_target_list, eYo.t3.expr.list_display]
  } else if (profile === eYo.t3.expr.void_dict_display) {
    return [profile, eYo.t3.expr.dict_display]
  } else if (profile === eYo.t3.expr.one_dict_display) {
    return [profile, eYo.t3.expr.dict_display]
  } else if (profile === eYo.t3.expr.one_set_display) {
    return [profile, eYo.t3.expr.set_display]
  } else {
    return [profile]
  }
}

/**
 * getBaseType.
 * The type depends on the variant and the modifiers.
 * As side effect, the subtype is set.
 */
eYo.expr.enclosure.prototype.getBaseType = function () {
  return this.profile
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
  eYo.c9r.register(k, (eYo.expr[k] = eYo.expr.enclosure))
})
