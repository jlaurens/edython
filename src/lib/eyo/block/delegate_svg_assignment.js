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

goog.provide('eYo.DelegateSvg.Assignment')

goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Primary')
goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Stmt')
goog.require('goog.dom');

// ["eyo:attributeref", "eyo:subscription", "eyo:slicing", "eyo:parenth_target_list", "eyo:bracket_target_list", "eyo:target_star", "eyo:identifier", "eyo:any"]

/**
 * Class for a DelegateSvg, '*...' block.
 * For edython.
 */
eYo.DelegateSvg.Expr.makeSubclass('target_star', {
  slots: {
    expression: {
      order: 1,
      fields: {
        label: {
          value: '*',
          css_class: 'eyo-code-reserved'
        }
      },
      check: eYo.T3.Expr.Check.target,
      hole_value: 'target'
    }
  }
})

/**
 * List consolidator for target list. Used is assignment.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
eYo.Consolidator.List.Target = function (D) {
  var d = {}
  goog.mixin(d, eYo.Consolidator.List.Target.data)
  goog.mixin(d, D)
  eYo.Consolidator.List.Target.superClass_.constructor.call(this, d)
}
goog.inherits(eYo.Consolidator.List.Target, eYo.Consolidator.List)

eYo.Consolidator.List.Target.data = {
  hole_value: 'name',
  check: null,
  empty: false,
  presep: ','
}

eYo.Consolidator.List.makeSubclass('Target', {
  hole_value: 'name',
  check: null,
  empty: false,
  presep: ','
})

/**
 * List consolidator for target list.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
eYo.Consolidator.List.Target.Void = function (D) {
  var d = {}
  goog.mixin(d, eYo.Consolidator.List.Target.Void.data)
  goog.mixin(d, D)
  eYo.Consolidator.List.Target.Void.superClass_.constructor.call(this, d)
}
goog.inherits(eYo.Consolidator.List.Target.Void, eYo.Consolidator.List.Target)

eYo.Consolidator.List.Target.Void.data = {
  hole_value: 'name',
  check: null,
  mandatory: 0,
  presep: ','
}

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.Block} block, owner or the receiver.
 */
eYo.Consolidator.List.Target.prototype.getIO = function (block) {
  var io = eYo.Consolidator.List.Target.superClass_.getIO.call(this, block)
  io.first_starred = io.last = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
eYo.Consolidator.List.Target.prototype.doCleanup = (function () {
  // preparation: walk through the list of inputs and
  // find the first_starred input
  var Type = {
    UNCONNECTED: 0,
    STARRED: 1,
    OTHER: 2
  }
  /**
   * Whether the input corresponds to an identifier...
   * Called when io.input is connected.
   * @param {Object} io, parameters....
   */
  var getCheckType = function (io) {
    var target = io.c8n.targetConnection
    if (!target) {
      return Type.UNCONNECTED
    }
    var check = target.check_
    if (check) {
      if (goog.array.contains(check, eYo.T3.Expr.target_star)) {
        return Type.STARRED
      } else {
        if (!io.annotatedInput && goog.array.contains(check, eYo.T3.Expr.identifier_annotated)) {
          io.annotatedInput = io.input
        }
        return Type.OTHER
      }
    } else {
      return Type.OTHER
    }
  }
  var setupFirst = function (io) {
    io.first_starred = io.last = -1
    this.setupIO(io, 0)
    while (io.eyo) {
      if ((io.eyo.parameter_type_ = getCheckType.call(this, io)) === Type.STARRED) {
        if (io.first_starred < 0) {
          io.first_starred = io.i
        }
      } else if (io.eyo.parameter_type_ === Type.OTHER) {
        io.last = io.i
      }
      this.nextInput(io)
    }
  }
  return function (io) {
    eYo.Consolidator.List.Target.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    if (io.first_starred >= 0) {
      // ther must be only one starred
      this.setupIO(io, io.first_starred + 2)
      while (io.eyo) {
        if (io.eyo.parameter_type_ === Type.STARRED) {
          // disconnect this
          var c8n = io.c8n
          c8n.disconnect()
          // remove that input and the next one
          this.disposeAtI(io, io.i)
          this.disposeAtI(io, io.i)
        } else {
          this.setupIO(io, io.i + 2)
        }
      }
    }
  }
}())

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
eYo.Consolidator.List.Target.prototype.getCheck = function (io) {
  if (io.first_starred < 0 || io.i === io.first_starred) {
    return eYo.T3.Expr.Check.target
  } else {
    return eYo.T3.Expr.Check.target_unstar
  }
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
eYo.Consolidator.List.Target.prototype.doFinalize = function (io) {
  eYo.Consolidator.List.Target.superClass_.doFinalize.call(this, io)
  if (this.setupIO(io, 0)) {
    do {
      io.c8n.eyo.setIncog(io.annotatedInput && io.annotatedInput !== io.input)
    } while (this.nextInput(io))
  }
}

/**
 * Class for a DelegateSvg, target_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('target_list', {
  list: {
    consolidator: eYo.Consolidator.List.Target,
    hole_value: 'name'
  }
})

/**
 * Class for a DelegateSvg, void_target_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('void_target_list', {
  list: {
    consolidator: eYo.Consolidator.List.Target,
    mandatory: 0,
    hole_value: 'name'
  }
})

/**
 * Class for a DelegateSvg, parenth_target_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.void_target_list.makeSubclass('parenth_target_list', {
  fields: {
    prefix: {
      value: '('
    },
    suffix: {
      value: ')'
    }
  }
})

/**
 * Class for a DelegateSvg, bracket_target_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.void_target_list.makeSubclass('bracket_target_list', {
  fields: {
    prefix: {
      value: '['
    },
    suffix: {
      value: ']'
    }
  }
})

goog.provide('eYo.DelegateSvg.Stmt.assignment_stmt')

/**
 * Class for a DelegateSvg, target_list_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass('target_list_list', {
  list: {
    check: eYo.T3.Expr.target_list,
    empty: false,
    postsep: '='
  }
})

/**
 * Class for a DelegateSvg, assignment_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('assignment_stmt', {
  data: {
    variant: {
      NAME: eYo.Key.NAME,
      TARGET: eYo.Key.TARGET,
      all: [
        eYo.Key.NAME,
        eYo.Key.TARGET
      ],
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        this.data.name.setIncog(newValue === this.TARGET)
        var slot = this.owner.target_s
        slot.required = newValue === this.TARGET
        slot.setIncog(!slot.required)
      },
      xml: false
    },
    name: {
      init: '',
      subtypes: [
        eYo.T3.Expr.unset,
        eYo.T3.Expr.identifier,
        eYo.T3.Expr.dotted_name
      ],
      validate: /** @suppress {globalThis} */ function (newValue) {
        var tos = eYo.Do.typeOfString(newValue, null)
        return this.model.subtypes.indexOf(tos.expr) >= 0
        ? {validated: newValue}
        : null
      },
      synchronize: true,
    },
  },
  slots: {
    name: {
      order: 1,
      fields: {
        bind: {
          placeholder: /** @suppress {globalThis} */ function () {
            return eYo.Msg.Placeholder.IDENTIFIER
          },
          validate: true,
          endEditing: true,
          variable: true
        }
      },
      check: eYo.T3.Expr.Check.target,
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromModel()) {
            this.owner.variant_p = eYo.Key.NAME
          }
        }
      }
    },
    target: {
      order: 2,
      wrap: eYo.T3.Expr.target_list,
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromModel()) {
            this.owner.variant_p = eYo.Key.TARGET
          }
        }
      }
    },
    assigned: {
      order: 4,
      fields: {
        operator: {
          value: '=',
          css: 'reserved'
        },
      },
      wrap: eYo.T3.Expr.assigned_list
    }
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.assignment_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  var name = this.data.name.get()
  var variant_d = this.data.variant
  var variant = variant_d.get()
  var F = function (content, newVariant) {
    var menuItem = mgr.newMenuItem(content, function () {
      variant_d.set(newVariant)
    })
    menuItem.setEnabled(newVariant !== variant)
    mgr.addChild(menuItem, true)
  }
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN(name || eYo.Msg.Placeholder.IDENTIFIER, name ? 'eyo-code' : 'eyo-code-placeholder'),
    eYo.Do.createSPAN(' = …', 'eyo-code')
  )
  F(content, variant_d.NAME)
  content = eYo.Do.createSPAN('…,… = …,…', 'eyo-code')
  F(content, 2)
  mgr.shouldSeparate()
  if (variant !== variant_d.TARGET) {
    var menuItem = mgr.newMenuItem(eYo.Msg.RENAME, function () {
      block.eyo.data.name.field.showEditor()
    })
    mgr.addChild(menuItem, true)
    mgr.shouldSeparate()
  }
  eYo.DelegateSvg.Stmt.assignment_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
  return true
}

eYo.DelegateSvg.List.makeSubclass('assigned_list', function () {
  var D = {
    check: eYo.T3.Expr.Check.starred_item,
    unique: eYo.T3.Expr.yield_expression,
    consolidator: eYo.Consolidator.List.Singled,
    empty: false,
    presep: ','
  }
  var RA = goog.array.concat(D.check, D.unique)
  goog.array.removeDuplicates(RA)
  D.all = RA
  return {
    list: D
  }
})

eYo.DelegateSvg.List.makeSubclass('augassigned_list', function () {
  var D = {
    check: eYo.T3.Expr.Check.expression,
    unique: eYo.T3.Expr.yield_expression,
    consolidator: eYo.Consolidator.List.Singled,
    empty: false,
    presep: ','
  }
  var RA = goog.array.concat(D.check, D.unique)
  goog.array.removeDuplicates(RA)
  D.all = RA
  return {
    list: D
  }
})

goog.provide('eYo.DelegateSvg.AugAssign')

/**
 * Class for a DelegateSvg, augmented_assignment_stmt block.
 * Multiple ops.
 * As there are many possible operators, we split the list into
 * number operators (+=, -=, /= ...) and bitwise operators (<<=, >>=,...)
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('augmented_assignment_stmt', {
  data: {
    name: {
      init: '',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var tos = eYo.Do.typeOfString(newValue, null)
        return tos.expr === eYo.T3.Expr.unset
        || tos.expr === eYo.T3.Expr.identifier
        || tos.expr === eYo.T3.Expr.dotted_name
          ? {validated: newValue}
          : null
      },
      synchronize: true
    },
    operator: {
      all: ['+=', '-=', '*=', '/=', '//=', '%=', '**=', '@=', '<<=', '>>=', '&=', '^=', '|='],
      init: '+=',
      synchronize: true,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.data.numberOperator.set(newValue)
        this.data.bitwiseOperator.set(newValue)
      },
      validate: false,
      main: true
    },
    numberOperator: {
      all: ['+=', '-=', '*=', '/=', '//=', '%=', '**=', '@='],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        if (oldValue && (newValue !== oldValue)) {
          this.didChange(oldValue, newValue)
          this.data.operator.set(newValue)
          this.data.operator.bitwise = (this.data.operator.get() !== this.get())
        }
      },
      validate: true
    },
    bitwiseOperator: {
      all: ['<<=', '>>=', '&=', '^=', '|='],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        if (oldValue && (newValue !== oldValue)) {
          this.data.operator.set(newValue)
          this.data.operator.bitwise = (this.data.operator.get() === this.get())
        }
      },
      validate: true
    }
  },
  slots: {
    name: {
      order: 1,
      fields: {
        bind: {
          placeholder: /** @suppress {globalThis} */ function () {
            return eYo.Msg.Placeholder.IDENTIFIER
          },
          validate: true,
          endEditing: true,
          variable: true
        }
      },
      check: eYo.T3.Expr.Check.augtarget
    },
    operator: {
      order: 2,
      fields: {
        bind: {// only one `operator` field
          value: ''
        }
      }
    },
    expressions: {
      order: 3,
      wrap: eYo.T3.Expr.augassigned_list
    }
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  var withTarget = this.name_s.connection.targetBlock()
  var name = this.name_p
  var operator = this.data.operator.get()
  var withBitwise = this.data.operator.bitwise
  var operators = withBitwise
    ? this.data.bitwiseOperator.getAll()
    : this.data.numberOperator.getAll()
  var F = function (i) {
    var op = operators[i]
    if (op !== operator) {
      var content =
      goog.dom.createDom(goog.dom.TagName.SPAN, null,
        withTarget ? eYo.Do.createSPAN('…', 'eyo-code')
          : eYo.Do.createSPAN(name || eYo.Msg.Placeholder.IDENTIFIER, name ? 'eyo-code' : 'eyo-code-placeholder'),
        eYo.Do.createSPAN(' ' + op + ' ', 'eyo-code'),
        eYo.Do.createSPAN('…', 'eyo-code')
      )
      var menuItem = mgr.newMenuItem(content, function () {
        console.log('Change', withBitwise ? 'bitwise' : 'number', 'operator to', op)
        withBitwise ? block.eyo.data.bitwiseOperator.set(op) : block.eyo.data.numberOperator.set(op)
      })
      mgr.addChild(menuItem, true)
    }
  }
  for (var i = 0; i < operators.length; i++) {
    F(i)
  }
  mgr.shouldSeparate()
  var content =
  eYo.Do.createSPAN(withBitwise ? '+=, -=, /= …' : '<<=, >>=, &= …', 'eyo-code')
  var menuItem = (function (eyo) {
    return mgr.newMenuItem(content, function () {
      eyo.data.operator.set(withBitwise
        ? eyo.data.numberOperator.get() : eyo.data.bitwiseOperator.get())
    })
  }(this))
  mgr.addChild(menuItem, true)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.augmented_assignment_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
}

eYo.DelegateSvg.Assignment.T3s = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.yield_expression,
  eYo.T3.Expr.target_list,
  eYo.T3.Expr.target_list_list,
  eYo.T3.Expr.void_target_list,
  eYo.T3.Expr.parenth_target_list,
  eYo.T3.Expr.bracket_target_list,
  eYo.T3.Stmt.assignment_stmt,
  eYo.T3.Expr.assigned_list,
  eYo.T3.Expr.augassigned_list,
  eYo.T3.Stmt.augmented_assignment_stmt
]
