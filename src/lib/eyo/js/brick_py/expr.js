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

eYo.require('Brick')

eYo.require('Change')
eYo.require('Msg')

eYo.require('Decorate')
eYo.require('T3.All')
goog.require('goog.dom');

eYo.provide('Expr')

/**
 * Class for a Delegate, value brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Dflt.makeSubclass(eYo.Expr, 'Dflt')

// Default delegate for all expression bricks
eYo.Brick.mngr.registerAll(eYo.T3.Expr, eYo.Expr.Dflt, true)

Object.defineProperties(eYo.Expr.Dflt.prototype, {
  isExpr: {
    value: true
  },
  depth: {
    get () {
      var stmt = this.stmtParent
      return (stmt && stmt.depth) || 0
    }
  }
})

/**
 * Increment the change count.
 * For expressions, the change count is also forwarded to the parent.
 * For edython.
 * @param {*} deep  Whether to propagate the message to children.
 */
eYo.Expr.Dflt.prototype.changeDone = function (deep) {
  eYo.Expr.Dflt.superClass_.changeDone.call(this, deep)
  var parent = this.parent
  parent && parent.changeDone()
}

/**
 * getType.
 * The default implementation just returns the raw type.
 * Subclassers will override getModifier and getBaseType.
 * This should be used instead of direct brick querying.
 * @return {String} The type of the receiver's brick.
 */
eYo.Expr.Dflt.prototype.getType = eYo.Change.decorate(
  'getType',
  function () {
    return {
      ans: this.getBaseType()
    }
  }
)

/**
 * Whether the receiver's brick is of the given type.
 * Bricks may have different types (eg identifier and dotted_name).
 * This is recorded in the output connection.
 * @param {String} type
 * @return {Boolean}
 */
eYo.Expr.Dflt.prototype.checkOutputType = function (type) {
  var m4t = this.out_m
  if (m4t.check_) {
    if (type.indexOf) {
      if (m4t.check_.some(t => type.indexOf(t) >= 0)) {
        return true
      }
    } else {
      return m4t.check_.indexOf(type) >= 0
    }
  } else /* if (m4t.check_ === null) */ {
    return true
  }
}

/**
 * Can remove and bypass the parent?
 * If the parent's output connection is connected,
 * can connect the brick's output connection to it?
 * The connection cannot always establish.
 * @param {eYo.Brick.Dflt} brick  the brick to be replaced
 */
eYo.Expr.Dflt.prototype.canReplaceBrick = function (brick) {
  if (brick) {
    var m4t = brick.out_m
    if (!m4t) {
      return true
    }
    m4t = m4t.target
    if (!m4t || m4t.checkType_(this.out_m)) {
      // the parent brick has an output connection that can connect to the brick's one
      return true
    }
  }
  return false
}

/**
 * Remove and bypass the other brick.
 * If the parent's output magnet is connected,
 * connects the brick's output magnet to it.
 * The connection cannot always establish.
 * @param {eYo.Brick.Dflt} brick
 */
eYo.Expr.Dflt.prototype.replaceBrick = function (brick) {
  if (this.board && brick && brick.board) {
    eYo.Events.groupWrap(() => {
      eYo.Do.tryFinally(() => {
        var my_m4t = this.out_m
        my_m4t.disconnect()
        var its_m4t = brick.out_m
        if (its_m4t && (its_m4t = its_m4t.target) && its_m4t.checkType_(my_m4t)) {
          // the other brick has an output connection that can connect to the brick's one
          var brick = its_m4t.brick
          var selected = brick.hasFocus
          // next operations may unselect the brick
          var old = brick.consolidating_
          its_m4t.connect(my_m4t)
          brick.consolidating_ = old
          if (selected) {
            brick.focusOn()
          }
        } else {
          this.moveTo(brick.xy)
        }
      })
    })
  }
}

/**
 * Will draw the brick. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @private
 */
eYo.Expr.Dflt.prototype.willRender_ = function (recorder) {
  eYo.Expr.Dflt.superClass_.willRender_.call(this, recorder)
  var field = this.await_f
  if (field) {
    field.visible = this.await_
  }
}

/**
 * Whether the brick can have an 'await' prefix.
 * Only bricks that are top brick or that are directy inside function definitions
 * are awaitable
 * @return yes or no
 */
eYo.Expr.Dflt.prototype.awaitable = function () {
  if (!this.await_f) {
    return false
  }
  var parent = this.parent
  if (!parent) {
    return true
  }
  do {
    if (parent.type === eYo.T3.Stmt.funcdef_part) {
      return !!parent.async_
    }
  } while ((parent = parent.parent))
  return false
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.Expr.Dflt.prototype.populateContextMenuFirst_ = function (mngr) {
  var yorn = eYo.Expr.Dflt.superClass_.populateContextMenuFirst_.call(this, mngr)
  if (this.await_ || (this.awaitable && this.awaitable())) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('await', 'eyo-code-reserved'),
      goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_LEFT)
    )
    if (this.await_) {
      mngr.shouldSeparateRemove()
      mngr.addRemoveChild(mngr.newMenuItem(content, () => {
        this.await_p = false
      }))
    } else {
      mngr.shouldSeparateInsert()
      mngr.addInsertChild(mngr.newMenuItem(content, () => {
        this.await_p = true
      }))
    }
  }
  return yorn
}

/**
 * Insert a parent.
 * If the brick's output connection is connected,
 * connects the parent's output to it.
 * The connection cannot always establish.
 * The holes are filled when fill_holes is true.
 * @param {Brick} brick
 * @param {Object} model
 * @return the created brick
 */
eYo.Expr.Dflt.prototype.insertParentWithModel = function (model) {
  var parentSlotName = model.slot || model.input
  var parent
  eYo.Events.disableWrap(() => {
    parent = eYo.Brick.newReady(this, model)
  })
  if (!parent) {
    return parent
  }
  if (model.slot) {
    // start by the slots
    var slot = parent.slots[model.slot]
    var parentSlot = slot
    eYo.assert(parentSlot, 'No input named ' + model.slot)
    var parentInputM4t = parentSlot.magnet
    eYo.assert(parentInputM4t, 'Unexpected dummy input ' + model.slot+ ' in ' + parent.type)
  } else if ((parentSlot = parent.getSlot(eYo.Key.LIST, true))) {
    var list = parentSlot.targetBrick
    eYo.assert(list, 'Missing list brick inside ' + this.type)
    // the list has many potential inputs,
    // none of them is actually connected because this is very fresh
    // get the middle input.
    parentSlot = list.getSlot(eYo.Do.Name.middle_name)
    parentInputM4t = parentSlot.magnet
    eYo.assert(parentInputM4t, 'Unexpected dummy input ' + parentSlotName)
  } else {
    // find the first parent's connection that can accept brick
    var findM4t = y => {
      var foundM4t, t9k
      y.someSlot(slot => {
        var m4t = slot.magnet
        if (m4t) {
          var candidate
          if (m4t.checkType_(this.out_m) && (!m4t.bindField || !m4t.bindField.text.length)) {
            candidate = m4t
          } else if ((t9k = m4t.targetBrick)) {
            candidate = findM4t(t9k)
          }
          if (candidate) {
            if (candidate.name === parentSlotName) {
              foundM4t = candidate
              return slot
            }
            if (!foundM4t) {
              foundM4t = candidate
            }
          }
        }
      })
      return foundM4t
    }
    parentInputM4t = findM4t(parent)
  }
  // Next connections should be connected
  var outputM4t = this.out_m
  if (parentInputM4t && parentInputM4t.checkType_(outputM4t)) {
    eYo.Events.groupWrap(() => { // `this` is catched
      eYo.Events.fireBrickCreate(parent)
      var targetM4t = parentInputM4t.target
      if (targetM4t) {
        console.log('input already connected, disconnect and dispose target')
        var brick = targetM4t.brick
        targetM4t.disconnect()
        brick.dispose(true)
        brick = eYo.NA
        targetM4t = eYo.NA
      }
      // the old parent connection
      targetM4t = outputM4t.target
      var bumper
      if (targetM4t) {
        if (parent.out_m && targetM4t.checkType_(parent.out_m)) {
          // do not disconnect here because it causes a consolidation
          // and a connection mangling
          targetM4t.connect(parent.out_m)
        } else {
          targetM4t.disconnect()
          bumper = targetM4t.brick
          parent.moveTo(bumper.xy)
        }
        targetM4t = eYo.NA
      } else {
        parent.moveTo(this.xy)
      }
      parentInputM4t.connect(outputM4t)
      parent.render()
      if (bumper) {
        bumper.ui.bumpNeighbours_()
      }
    })
  } else {
    parent.dispose(true)
    parent = eYo.NA
  }
  return parent
}

/**
 * Do not call this method, except when overriding.
 * This methods is a state mutator.
 * At return type, the brick is in a consistent state.
 * All the connections and components are consolidated.
 * Sends a `consolidate` message to each component of the brick.
 * However, there might be some caveats related to undo management.
 * @param {Boolean} deep
 * @param {Boolean} force
 * @return {Boolean} true when consolidation occurred, false otherwise
 */
eYo.Expr.Dflt.prototype.doConsolidate = function (deep, force) {
  if (eYo.Expr.Dflt.superClass_.doConsolidate.call(this, deep, force)) {
    var parent = this.parent
    return (parent && parent.consolidate()) || true
  }
}

/**
 * Class for a Delegate, proper_slice brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('proper_slice', {
  data: {
    variant: {
      all: [
        eYo.Key.NONE,
        eYo.Key.STRIDE
      ],
      init: eYo.Key.NONE,
      validate: true,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.brick.stride_d.requiredIncog = newValue === eYo.Key.STRIDE
      },
      xml: false
    },
    lower_bound: {
      init: '',
      synchronize: true,
      placeholder: 'min',
      python: /** @suppress {globalThis} */ function () {
        return this.get()
      }
    },
    upper_bound: {
      init: '',
      synchronize: true,
      placeholder: 'end',
      python: /** @suppress {globalThis} */ function () {
        return this.get()
      }
    },
    stride: {
      init: '',
      synchronize: true,
      placeholder: 'step',
      python: /** @suppress {globalThis} */ function () {
        return this.get()
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          if (this.brick.variant_p === eYo.Key.STRIDE) {
            this.save(element, opt)
          }
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.STRIDE
        }
      }
    }
  },
  slots: {
    lower_bound: {
      order: 1,
      fields: {
        end: ':',
        bind: {
          endEditing: true,
          canEmpty: true
        }
      },
      check: eYo.T3.Expr.Check.expression,
      optional: true
    },
    upper_bound: {
      order: 2,
      fields: {
        bind: {
          endEditing: true,
          canEmpty: true
        }
      },
      check: eYo.T3.Expr.Check.expression,
      optional: true
    },
    stride: {
      order: 3,
      fields: {
        start: ':',
        bind: {
          endEditing: true,
          canEmpty: true
        }
      },
      check: eYo.T3.Expr.Check.expression,
      optional: true,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.STRIDE
        }
      }
    }
  }
}, true)

/**
 * Class for a Delegate, conditional_expression brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('conditional_expression', {
  slots: {
    expression: {
      order: 1,
      check: eYo.T3.Expr.Check.or_test_all
    },
    if: {
      order: 2,
      fields: {
        label: 'if'
      },
      check: eYo.T3.Expr.Check.or_test_all
    },
    else: {
      order: 3,
      fields: {
        label: 'else'
      },
      check: eYo.T3.Expr.Check.expression
    }
  }
}, true)

/**
 * Class for a Delegate, builtin object.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('builtin__object', {
  data: {
    value: {
      all: ['True', 'False', 'None', 'Ellipsis', '...', 'NotImplemented'],
      init: 'True',
      synchronize: true
    }
  },
  fields: {
    value: {
      reserved: ''
    }
  }
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.Expr.builtin__object.prototype.populateContextMenuFirst_ = function (mngr) {
  mngr.populateProperties(this, 'value')
  mngr.shouldSeparateInsert()
  eYo.Expr.builtin__object.superClass_.populateContextMenuFirst_.call(this, mngr)
  return true
}

/**
 * Get the content for the menu item.
 * @param {eYo.Brick.Dflt} brick The brick.
 * @param {string} op op is the operator
 * @private
 */
eYo.Expr.builtin__object.prototype.makeTitle = function (op) {
  return eYo.Do.createSPAN(op, 'eyo-code-reserved')
}

/**
 * Class for a Delegate, any object.
 * For edython.
 */
eYo.Expr.Dflt.makeSubclass('any', {
  data: {
    expression: {
      init: '',
      placeholder: eYo.Msg.Placeholder.EXPRESSION,
      synchronize: true
    }
  },
  fields: {
    expression: {
      endEditing: true
    }
  },
  out: {
    check: null // means that every output type will fit, once we have a python parser...
  }
}, true)

eYo.Expr.T3s = [
  eYo.T3.Expr.proper_slice,
  eYo.T3.Expr.conditional_expression,
  eYo.T3.Expr.starred_expression,
  eYo.T3.Expr.builtin__object,
  eYo.T3.Expr.any
]
