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

goog.provide('eYo.Brick.Expr')

goog.require('eYo.Msg')
goog.require('eYo.Decorate')
goog.require('eYo.Brick')
goog.require('eYo.T3.All')
goog.require('goog.dom');

/**
 * Class for a Delegate, value brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.makeSubclass('Expr')

// Default delegate for all expression bricks
eYo.Brick.Manager.registerAll(eYo.T3.Expr, eYo.Brick.Expr, true)

Object.defineProperties(eYo.Brick.Expr.prototype, {
  isExpr: {
    get () {
      return true
    }
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
eYo.Brick.Expr.prototype.incrementChangeCount = function (deep) {
  eYo.Brick.Expr.superClass_.incrementChangeCount.call(this, deep)
  var parent = this.parent
  parent && parent.incrementChangeCount()
}

/**
 * getType.
 * The default implementation just returns the raw type.
 * Subclassers will override getModifier and getBaseType.
 * This should be used instead of direct brick querying.
 * @return {String} The type of the receiver's brick.
 */
eYo.Brick.Expr.prototype.getType = eYo.Decorate.onChangeCount(
  'getType',
  function () {
    return {
      ans: this.getBaseType()
    }
  }
)

/**
 * Whether the receiver's brick is of the given type.
 * Blocks may have different types (eg identifier and dotted_name).
 * This is recorded in the output connection.
 * @param {!String} type
 * @return {Boolean}
 */
eYo.Brick.Expr.prototype.checkOutputType = function (type) {
  var m4t = this.magnets.output
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
 * @param {!eYo.Brick} brick  the brick to be replaced
 */
eYo.Brick.Expr.prototype.canReplaceDlgt = function (brick) {
  if (brick) {
    var m4t = brick.magnets.output
    if (!m4t) {
      return true
    }
    m4t = m4t.target
    if (!m4t || m4t.checkType_(this.magnets.output)) {
      // the parent brick has an output connection that can connect to the brick's one
      return true
    }
  }
  return false
}

/**
 * Remove and bypass the other brick.
 * If the parent's output connection is connected,
 * connects the brick's output connection to it.
 * The connection cannot always establish.
 * @param {!eYo.Brick} brick
 */
eYo.Brick.Expr.prototype.replaceDlgt = function (brick) {
  if (this.workspace && brick && brick.workspace) {
    eYo.Events.groupWrap(() => {
      eYo.Do.tryFinally(() => {
        var my_m4t = this.magnets.output
        my_m4t.disconnect()
        var its_m4t = brick.magnets.output
        if (its_m4t && (its_m4t = its_m4t.target) && its_m4t.checkType_(my_m4t)) {
          // the other brick has an output connection that can connect to the brick's one
          var brick = its_m4t.brick
          var selected = brick.selected
          // next operations may unselect the brick
          var old = brick.consolidating_
          its_m4t.connect(my_m4t)
          brick.consolidating_ = old
          if (selected) {
            eYo.Selected.brick = brick
          }
        } else {
          var its_xy = brick.ui.xyInSurface
          var my_xy = this.ui.xyInSurface
          this.moveByXY(its_xy.x - my_xy.x, its_xy.y - my_xy.y)
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
eYo.Brick.Expr.prototype.willRender_ = function (recorder) {
  eYo.Brick.Expr.superClass_.willRender_.call(this, recorder)
  var field = this.fields.await
  if (field) {
    field.setVisible(this.await_)
  }
}

/**
 * Whether the brick can have an 'await' prefix.
 * Only bricks that are top brick or that are directy inside function definitions
 * are awaitable
 * @return yes or no
 */
eYo.Brick.Expr.prototype.awaitable = function () {
  if (!this.fields.await) {
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
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.Brick.Expr.prototype.populateContextMenuFirst_ = function (mgr) {
  var yorn = eYo.Brick.Expr.superClass_.populateContextMenuFirst_.call(this, mgr)
  if (this.await_ || (this.awaitable && this.awaitable())) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('await', 'eyo-code-reserved'),
      goog.dom.createTextNode(' ' + eYo.Msg.AT_THE_LEFT)
    )
    if (this.await_) {
      mgr.shouldSeparateRemove()
      mgr.addRemoveChild(mgr.newMenuItem(content, () => {
        this.await_p = false
      }))
    } else {
      mgr.shouldSeparateInsert()
      mgr.addInsertChild(mgr.newMenuItem(content, () => {
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
 * @param {!Block} brick
 * @param {Object} model
 * @return the created brick
 */
eYo.Brick.Expr.prototype.insertParentWithModel = function (model) {
  var parentSlotName = model.slot || model.input
  var parent
  eYo.Events.disableWrap(() => {
    parent = eYo.Brick.newComplete(this, model)
  })
  if (!parent) {
    return parent
  }
  if (model.slot) {
    // start by the slots
    var slot = parent.slots[model.slot]
    var parentInput = slot && slot.input
    goog.asserts.assert(parentInput, 'No input named ' + model.slot)
    var parentInputM4t = parentInput.eyo.magnet
    goog.asserts.assert(parentInputM4t, 'Unexpected dummy input ' + model.slot+ ' in ' + parent.type)
  } else if ((parentInput = parent.getInput(eYo.Key.LIST, true))) {
    var list = parentInput.eyo.magnet.targetBrick
    goog.asserts.assert(list, 'Missing list brick inside ' + this.type)
    // the list has many potential inputs,
    // none of them is actually connected because this is very fresh
    // get the middle input.
    parentInput = list.getInput(eYo.Do.Name.middle_name)
    parentInputM4t = parentInput.eyo.magnet
    goog.asserts.assert(parentInputM4t, 'Unexpected dummy input ' + parentSlotName)
  } else {
    // find the first parent's connection that can accept brick
    var findM4t = y => {
      var foundM4t, t9k
      y.someInput(input => {
        var m4t = input.magnet
        if (m4t) {
          var candidate
          if (m4t.checkType_(this.magnets.output) && (!m4t.bindField || !m4t.bindField.getText().length)) {
            candidate = m4t
          } else if ((t9k = m4t.targetBrick)) {
            candidate = findM4t(t9k)
          }
          if (candidate) {
            if (candidate.name === parentSlotName) {
              foundM4t = candidate
              return input
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
  var outputM4t = this.magnets.output
  if (parentInputM4t && parentInputM4t.checkType_(outputM4t)) {
    eYo.Events.groupWrap(() => { // `this` is catched
      eYo.Events.fireDlgtCreate(parent)
      var targetM4t = parentInputM4t.target
      if (targetM4t) {
        console.log('input already connected, disconnect and dispose target')
        var brick = targetM4t.brick
        targetM4t.disconnect()
        brick.dispose(true)
        brick = undefined
        targetM4t = undefined
      }
      // the old parent connection
      targetM4t = outputM4t.target
      var bumper
      if (targetM4t) {
        if (parent.magnets.output && targetM4t.checkType_(parent.magnets.output)) {
          // do not disconnect here because it causes a consolidation
          // and a connection mangling
          targetM4t.connect(parent.magnets.output)
        } else {
          targetM4t.disconnect()
          bumper = targetM4t.brick
          var its_xy = bumper.ui.xyInSurface
          var my_xy = parent.ui.xyInSurface
          parent.moveByXY(its_xy.x - my_xy.x, its_xy.y - my_xy.y)
        }
        targetM4t = undefined
      } else {
        its_xy = this.ui.xyInSurface
        my_xy = parent.ui.xyInSurface
        parent.moveByXY(its_xy.x - my_xy.x, its_xy.y - my_xy.y)
      }
      parentInputM4t.connect(outputM4t)
      parent.render()
      if (bumper) {
        bumper.ui.bumpNeighbours_()
      }
    })
  } else {
    parent.dispose(true)
    parent = undefined
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
 * @param {!Boolean} deep
 * @param {!Boolean} force
 * @return {Boolean} true when consolidation occurred, false otherwise
 */
eYo.Brick.Expr.prototype.doConsolidate = function (deep, force) {
  if (eYo.Brick.Expr.superClass_.doConsolidate.call(this, deep, force)) {
    var parent = this.parent
    return (parent && parent.consolidate()) || true
  }
}

/**
 * Class for a Delegate, proper_slice brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Expr.makeSubclass('proper_slice', {
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
        this.owner.stride_d.requiredIncog = newValue === eYo.Key.STRIDE
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
          if (this.owner.variant_p === eYo.Key.STRIDE) {
            this.save(element, opt)
          }
        }
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.STRIDE
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
      optional: true,
      hole_value: 'min'
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
      optional: true,
      hole_value: 'end'
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
      hole_value: 'stride',
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.STRIDE
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
eYo.Brick.Expr.makeSubclass('conditional_expression', {
  slots: {
    expression: {
      order: 1,
      check: eYo.T3.Expr.Check.or_test_all,
      hole_value: 'name'
    },
    if: {
      order: 2,
      fields: {
        label: 'if'
      },
      check: eYo.T3.Expr.Check.or_test_all,
      hole_value: 'condition'
    },
    else: {
      order: 3,
      fields: {
        label: 'else'
      },
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'alternate'
    }
  }
}, true)

/**
 * Class for a Delegate, builtin object.
 * For edython.
 */
eYo.Brick.Expr.makeSubclass('builtin__object', {
  data: {
    value: {
      all: ['True', 'False', 'None', 'Ellipsis', '...', 'NotImplemented'],
      init: 'True',
      synchronize: true
    }
  },
  fields: {
    value: {
      css: 'reserved'
    }
  }
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {!Blockly.Block} brick The brick.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.Brick.Expr.builtin__object.prototype.populateContextMenuFirst_ = function (mgr) {
  mgr.populateProperties(this, 'value')
  mgr.shouldSeparateInsert()
  eYo.Brick.Expr.builtin__object.superClass_.populateContextMenuFirst_.call(this, mgr)
  return true
}

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} brick The brick.
 * @param {string} op op is the operator
 * @private
 */
eYo.Brick.Expr.builtin__object.prototype.makeTitle = function (op) {
  return eYo.Do.createSPAN(op, 'eyo-code-reserved')
}

/**
 * Class for a Delegate, any object.
 * For edython.
 */
eYo.Brick.Expr.makeSubclass('any', {
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
  output: {
    check: null // means that every output type will fit, once we have a python parser...
  }
}, true)

eYo.Brick.Expr.T3s = [
  eYo.T3.Expr.proper_slice,
  eYo.T3.Expr.conditional_expression,
  eYo.T3.Expr.starred_expression,
  eYo.T3.Expr.builtin__object,
  eYo.T3.Expr.any
]
