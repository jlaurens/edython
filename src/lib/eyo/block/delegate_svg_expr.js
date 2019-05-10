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

goog.provide('eYo.DelegateSvg.Expr')

goog.require('eYo.Msg')
goog.require('eYo.Decorate')
goog.require('eYo.DelegateSvg')
goog.require('eYo.T3.All')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, value block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.makeSubclass('Expr')

// Default delegate for all expression blocks
eYo.Delegate.Manager.registerAll(eYo.T3.Expr, eYo.DelegateSvg.Expr, true)

Object.defineProperties(eYo.DelegateSvg.Expr.prototype, {
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
eYo.DelegateSvg.Expr.prototype.incrementChangeCount = function (deep) {
  eYo.DelegateSvg.Expr.superClass_.incrementChangeCount.call(this, deep)
  var parent = this.parent
  parent && parent.incrementChangeCount()
}

/**
 * getType.
 * The default implementation just returns the raw type.
 * Subclassers will override getModifier and getBaseType.
 * This should be used instead of direct block querying.
 * @return {String} The type of the receiver's block.
 */
eYo.DelegateSvg.Expr.prototype.getType = eYo.Decorate.onChangeCount(
  'getType',
  function () {
    return {
      ans: this.getBaseType()
    }
  }
)

/**
 * Whether the receiver's block is of the given type.
 * Blocks may have different types (eg identifier and dotted_name).
 * This is recorded in the output connection.
 * @param {!String} type
 * @return {Boolean}
 */
eYo.DelegateSvg.Expr.prototype.checkOutputType = function (type) {
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
 * can connect the block's output connection to it?
 * The connection cannot always establish.
 * @param {!eYo.Delegate} dlgt  the Dlgt to be replaced
 */
eYo.DelegateSvg.Expr.prototype.canReplaceDlgt = function (dlgt) {
  if (dlgt) {
    var m4t = dlgt.magnets.output
    if (!m4t) {
      return true
    }
    m4t = m4t.target
    if (!m4t || m4t.checkType_(this.magnets.output)) {
      // the parent block has an output connection that can connect to the block's one
      return true
    }
  }
  return false
}

/**
 * Remove and bypass the other block.
 * If the parent's output connection is connected,
 * connects the block's output connection to it.
 * The connection cannot always establish.
 * @param {!eYo.Delegate} dlgt
 */
eYo.DelegateSvg.Expr.prototype.replaceDlgt = function (dlgt) {
  if (this.workspace && dlgt && dlgt.workspace) {
    eYo.Events.groupWrap(() => {
      eYo.Do.tryFinally(() => {
        var my_m4t = this.magnets.output
        my_m4t.break()
        var its_m4t = dlgt.magnets.output
        if (its_m4t && (its_m4t = its_m4t.target) && its_m4t.checkType_(my_m4t)) {
          // the other block has an output connection that can connect to the block's one
          var b_eyo = its_m4t.b_eyo
          var selected = eYo.Selected.eyo === b_eyo
          // next operations may unselect the block
          var old = b_eyo.consolidating_
          its_m4t.connect(my_m4t)
          b_eyo.consolidating_ = old
          if (selected) {
            eYo.Selected.eyo = b_eyo
          }
        } else {
          var its_xy = dlgt.ui.xyInSurface
          var my_xy = this.ui.xyInSurface
          this.moveByXY(its_xy.x - my_xy.x, its_xy.y - my_xy.y)
        }
      })
    })
  }
}

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @private
 */
eYo.DelegateSvg.Expr.prototype.willRender_ = function (recorder) {
  eYo.DelegateSvg.Expr.superClass_.willRender_.call(this, recorder)
  var field = this.fields.await
  if (field) {
    field.setVisible(this.await_)
  }
}

/**
 * Whether the block can have an 'await' prefix.
 * Only blocks that are top block or that are directy inside function definitions
 * are awaitable
 * @return yes or no
 */
eYo.DelegateSvg.Expr.prototype.awaitable = function () {
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
 * Populate the context menu for the given block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.prototype.populateContextMenuFirst_ = function (mgr) {
  var yorn = eYo.DelegateSvg.Expr.superClass_.populateContextMenuFirst_.call(this, mgr)
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
 * If the block's output connection is connected,
 * connects the parent's output to it.
 * The connection cannot always establish.
 * The holes are filled when fill_holes is true.
 * @param {!Block} block
 * @param {Object} model
 * @return the created block
 */
eYo.DelegateSvg.Expr.prototype.insertParentWithModel = function (model) {
  var parentSlotName = model.slot || model.input
  var parent
  eYo.Events.disableWrap(() => {
    parent = eYo.DelegateSvg.newComplete(this, model)
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
    var list = parentInput.eyo.magnet.t_eyo
    goog.asserts.assert(list, 'Missing list block inside ' + this.type)
    // the list has many potential inputs,
    // none of them is actually connected because this is very fresh
    // get the middle input.
    parentInput = list.getInput(eYo.Do.Name.middle_name)
    parentInputM4t = parentInput.eyo.magnet
    goog.asserts.assert(parentInputM4t, 'Unexpected dummy input ' + parentSlotName)
  } else {
    // find the first parent's connection that can accept block
    var findM4t = y => {
      var foundM4t, t_eyo
      y.someInput(input => {
        var m4t = input.eyo.magnet
        if (m4t) {
          var candidate
          if (m4t.checkType_(this.magnets.output) && (!m4t.bindField || !m4t.bindField.getText().length)) {
            candidate = m4t
          } else if ((t_eyo = m4t.t_eyo)) {
            candidate = findM4t(t_eyo)
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
        var b_eyo = targetM4t.b_eyo
        targetM4t.break()
        b_eyo.block_.dispose(true)
        b_eyo = undefined
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
          targetM4t.break()
          bumper = targetM4t.b_eyo
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
    parent.block_.dispose(true)
    parent = undefined
  }
  return parent
}

/**
 * Do not call this method, except when overriding.
 * This methods is a state mutator.
 * At return type, the block is in a consistent state.
 * All the connections and components are consolidated.
 * Sends a `consolidate` message to each component of the block.
 * However, there might be some caveats related to undo management.
 * @param {!Boolean} deep
 * @param {!Boolean} force
 * @return {Boolean} true when consolidation occurred, false otherwise
 */
eYo.DelegateSvg.Expr.prototype.doConsolidate = function (deep, force) {
  if (eYo.DelegateSvg.Expr.superClass_.doConsolidate.call(this, deep, force)) {
    var parent = this.parent
    return (parent && parent.consolidate()) || true
  }
}

/**
 * Class for a DelegateSvg, proper_slice block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('proper_slice', {
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
 * Class for a DelegateSvg, conditional_expression block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('conditional_expression', {
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
 * Class for a DelegateSvg, builtin object.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('builtin__object', {
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
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.builtin__object.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  mgr.populateProperties(block, 'value')
  mgr.shouldSeparateInsert()
  eYo.DelegateSvg.Expr.builtin__object.superClass_.populateContextMenuFirst_.call(this, mgr)
  return true
}

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
eYo.DelegateSvg.Expr.builtin__object.prototype.makeTitle = function (op) {
  return eYo.Do.createSPAN(op, 'eyo-code-reserved')
}

/**
 * Class for a DelegateSvg, any object.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('any', {
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

eYo.DelegateSvg.Expr.T3s = [
  eYo.T3.Expr.proper_slice,
  eYo.T3.Expr.conditional_expression,
  eYo.T3.Expr.starred_expression,
  eYo.T3.Expr.builtin__object,
  eYo.T3.Expr.any
]
