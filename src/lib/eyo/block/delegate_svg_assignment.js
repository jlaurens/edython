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
 * List consolidator for target list. Used is assignment.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
eYo.Consolidator.List.Target = function (D) {
  var d = {}
  goog.mixin(d, eYo.Consolidator.List.Target.model)
  goog.mixin(d, D)
  eYo.Consolidator.List.Target.superClass_.constructor.call(this, d)
}
goog.inherits(eYo.Consolidator.List.Target, eYo.Consolidator.List)

eYo.Consolidator.List.Target.model = {
  hole_value: 'name',
  check: null,
  mandatory: 1,
  presep: ','
}

eYo.Consolidator.List.makeSubclass('Target', {
  hole_value: 'name',
  check: null,
  mandatory: 1,
  presep: ','
})

/**
 * List consolidator for target list.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
eYo.Consolidator.List.Target.Void = function (D) {
  var d = {}
  goog.mixin(d, eYo.Consolidator.List.Target.Void.model)
  goog.mixin(d, D)
  eYo.Consolidator.List.Target.Void.superClass_.constructor.call(this, d)
}
goog.inherits(eYo.Consolidator.List.Target.Void, eYo.Consolidator.List.Target)

eYo.Consolidator.List.Target.Void.model = {
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
eYo.Consolidator.List.Target.prototype.doCleanup = (() => {
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
  var getCheckType = (io) => {
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
      if ((io.eyo.parameter_type_ = getCheckType(io)) === Type.STARRED) {
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
})()

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
    mandatory: 1,
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
}, true)

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
}, true)

goog.provide('eYo.DelegateSvg.Stmt.assignment_stmt')

/**
 * Class for a DelegateSvg, assignment_stmt.
 * This is for a single assignment `a = b`.
 * The lhs is either a field name or a target, or a targets list.
 * How would I code for `a, b = c, d = e, f`.
 * The problem is that `a = b` is also a block for primaries
 * such that in a … = … statement block, it must be possible to connect
 * some … = … expression block. It makes sense to connect in the
 * rhs position because assignment is evaluated from right to left.
 * 
 * We merge all assignment statements into only one visual block.
 * The visual block has 3 types and more variants.
 * annotated_assignment_stmt ::=  augtarget ":" expression ["=" expression]
 * augmented_assignment_stmt ::=  augtarget augop (expression_list | yield_expression)
 * assignment_stmt ::= target_list "=" assignment_value_list
 * assignment_value_list ::= value_list | assignment_chain | assignment_expr
 * The target_list is only used here.
 * The target_list may also accept an identifier_annotated block
 * or a augtarget_annotated which is a particular case of key_datum
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('assignment_stmt', {
  data: {
    variant: {
      all: [
        eYo.Key.NAME, // only a name
        eYo.Key.NAME_DEFINED,
        eYo.Key.TARGETS,
        eYo.Key.ANNOTATED,
        eYo.Key.ANNOTATED_DEFINED
      ],
      init: eYo.Key.NAME_DEFINED,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var O = this.owner
        O.name_d.setIncog(newValue === eYo.Key.TARGETS)
        var slot = O.targets_s
        slot.required = newValue === eYo.Key.TARGETS
        slot.setIncog()
        slot = O.value_s
        slot.required === newValue !== eYo.Key.ANNOTATED
        slot.setIncog()
        var d = O.annotation_d
        d.required = newValue === eYo.Key.ANNOTATED || newValue === eYo.Key.ANNOTATED_DEFINED
        d.setIncog()
      },
      isChanging: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.owner.consolidateType()
        this.isChanging(oldValue, newValue)
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Stmt.annotated_assignment_stmt) {
          if (this.get() !== eYo.Key.ANNOTATED) {
            this.set(eYo.Key.ANNOTATED_DEFINED)
          }
        } else if (this.get() !== eYo.Key.NAME_DEFINED) {
          this.set(eYo.Key.TARGETS)
        }
      },
      xml: false,
      consolidate: /** @suppress {globalThis} */ function () {
        var O = this.owner
        if (O.variant_p !== eYo.Key.TARGETS) {
          var t = O.name_t
          if (t && t.type === eYo.T3.Expr.identifier_annotated) {
            if (O.variant_p === eYo.Key.ANNOTATED || O.variant_p === eYo.Key.ANNOTATED_DEFINED) {

            }
          }

        }
        var prefix = this.owner.prefix_p
        var delimiter = this.owner.delimiter_p
        var content = this.owner.content_p
        if (goog.isDef(prefix) && goog.isDef(delimiter) && goog.isDef(content)) {
          this.set('' + prefix + delimiter + content + delimiter)
        }
      }
    },
    name: {
      init: '',
      placeholder: eYo.Msg.Placeholder.IDENTIFIER,
      subtypes: [
        eYo.T3.Expr.unset,
        eYo.T3.Expr.identifier,
        eYo.T3.Expr.dotted_name
      ],
      validate: /** @suppress {globalThis} */ function (newValue) {
        var p5e = eYo.T3.Profile.get(newValue, null)
        return this.model.subtypes.indexOf(p5e.expr) >= 0
        ? {validated: newValue}
        : null
      },
      synchronize: true,
      allwaysBoundField: true
    },
    annotation: {
      init: '',
      placeholder: eYo.Msg.Placeholder.EXPRESSION,
      validate: /** @suppress {globalThis} */ function (newValue) {
        return {validated: newValue}
      },
      synchronize: true,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved() && this.owner.variant_p !== eYo.Key.ANNOTATED) {
          this.owner.variant_p = eYo.Key.ANNOTATED_DEFINED
        }
      }
    },
    operator: {
      all: ['+=', '-=', '*=', '/=', '//=', '%=', '**=', '@=', '<<=', '>>=', '&=', '^=', '|='],
      init: '+=',
      synchronize: true,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.owner.numberOperator_p = newValue
        this.owner.bitwiseOperator_p = newValue
      },
      validate: false
    },
    numberOperator: {
      all: ['+=', '-=', '*=', '/=', '//=', '%=', '**=', '@='],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        if (oldValue && (newValue !== oldValue)) {
          this.didChange(oldValue, newValue)
          var O = this.owner
          O.operator_p = newValue
          O.operator_d.bitwise = (O.operator_p !== this.get())
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
          var O = this.owner
          O.operator_p = newValue
          O.operator_d.bitwise = (O.operator_p === this.get())
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
          validate: true,
          endEditing: true,
          variable: true
        }
      },
      check: eYo.T3.Expr.Check.target_annotated,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved() && this.owner.variant_p !== eYo.Key.ANNOTATED) {
          this.owner.variant_p = eYo.Key.NAME_DEFINED
        }
      }
    },
    targets: {
      order: 2,
      promise: eYo.T3.Expr.target_list,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.TARGETS
        }
      }
    },
    annotation: {
      order: 3,
      fields: {
        delimiter: {
          order: 1,
          value: ':',
          css: 'reserved'
        },
        bind: {
          order: 2,
          validate: true,
          endEditing: true,
          variable: true
        }
      },
      check: eYo.T3.Expr.Check.expression,
      xml: {
        attr: ':'
      },
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved()) {
          this.owner.variant_p = eYo.Key.ANNOTATED
        }
      }
    },
    value: {
      order: 4,
      fields: {
        operator: {
          value: '=',
          css: 'reserved'
        },
      },
      wrap: eYo.T3.Expr.assignment_value_list,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.isRequiredFromSaved() && this.owner.variant_p === eYo.Key.ANNOTATED) {
          this.owner.variant_p = eYo.Key.ANNOTATED_DEFINED
        }
      }
    }
  },
}, true)

;['annotated_assignment_stmt'].forEach(k => {
  eYo.DelegateSvg.Stmt[k] = eYo.DelegateSvg.Stmt.assignment_stmt
  eYo.DelegateSvg.Manager.register(k)
})

/**
 * getType.
 * @return {String} The type of the receiver's block.
 */
eYo.DelegateSvg.Stmt.assignment_stmt.prototype.getType = function () {
  var x = this.variant_p
  if (x === eYo.Key.ANNOTATED || x === eYo.Key.ANNOTATED_DEFINED) {
    return eYo.T3.Stmt.annotated_assignment_stmt
  }
  x = this.name_t
  if (x && x.type === eYo.T3.Expr.identifier_annotated) {
    return eYo.T3.Stmt.annotated_assignment_stmt
  }
  return eYo.T3.Stmt.assignment_stmt
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.assignment_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  var name_p = this.name_p
  var variant_p = this.variant_p
  var F = (content, newVariant) => {
    var menuItem = mgr.newMenuItem(content, () => {
      this.variant_p = newVariant
    })
    menuItem.setEnabled(newVariant !== variant_p)
    mgr.addChild(menuItem, true)
  }
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN(name_p || eYo.Msg.Placeholder.IDENTIFIER, name_p ? 'eyo-code' : 'eyo-code-placeholder'),
    eYo.Do.createSPAN(' = …', 'eyo-code')
  )
  F(content, eYo.Key.NAME_DEFINED)
  content = eYo.Do.createSPAN('…,… = …,…', 'eyo-code')
  F(content, eYo.Key.TARGETS)
  mgr.shouldSeparate()
  if (variant_p !== eYo.Key.TARGETS) {
    var menuItem = mgr.newMenuItem(eYo.Msg.RENAME, () => {
      this.name_d.field.showEditor()
    })
    mgr.addChild(menuItem, true)
    mgr.shouldSeparate()
  }
  eYo.DelegateSvg.Stmt.assignment_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
  return true
}

eYo.DelegateSvg.List.makeSubclass('assignment_value_list', {
  list: (() => {
    var me = {
      unique: (type, subtype) => {
        return {
          [eYo.T3.Stmt.assignment_stmt]: [eYo.T3.Expr.yield_expr, eYo.T3.Expr.assignment_chain],
          [eYo.T3.Expr.augmented_assignment_stmt]: [eYo.T3.Expr.yield_expr],
          [eYo.T3.Expr.annotated_assignment_stmt]: [eYo.T3.Expr.yield_expr]
        } [subtype]
      },
      check: (type, subtype) => {
        return {
          [eYo.T3.Stmt.assignment_stmt]: eYo.T3.Expr.Check.starred_item,
          [eYo.T3.Stmt.augmented_assignment_stmt]: eYo.T3.Expr.Check.expression,
          [eYo.T3.Stmt.annotated_assignment_stmt]: eYo.T3.Expr.Check.expression
        } [subtype]
      },
      mandatory: 0,
      presep: ','
    }
    var all = Object.create(null)
    ;[eYo.T3.Stmt.assignment_stmt,
      eYo.T3.Stmt.augmented_assignment_stmt,
      eYo.T3.Stmt.annotated_assignment_stmt].forEach(k => {
      all[k] = goog.array.concat(me.unique(null, k), me.check(null, k))
    })
    all[eYo.T3.Expr.one_set_display] = all[eYo.T3.Expr.one_dict_display] = goog.array.concat(
      me.unique(eYo.T3.Expr.one_set_display),
      me.check(eYo.T3.Expr.dict_display),
      me.check(eYo.T3.Expr.set_display))
    me.all = (type, subtype) => {
      return all [subtype]
    }
    return me
  }) ()
})

eYo.DelegateSvg.List.makeSubclass('augassigned_list', function () {
  var D = {
    check: eYo.T3.Expr.Check.expression,
    unique: eYo.T3.Expr.yield_expression,
    consolidator: eYo.Consolidator.List,
    mandatory: 1,
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
    target: {
      init: '',
      placeholder: eYo.Msg.Placeholder.IDENTIFIER,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var p5e = eYo.T3.Profile.get(newValue, null)
        return p5e.expr === eYo.T3.Expr.unset
        || p5e.expr === eYo.T3.Expr.identifier
        || p5e.expr === eYo.T3.Expr.dotted_name
          ? {validated: newValue}
          : null
      },
      synchronize: true,
      allwaysBoundField: true
    },
    operator: {
      all: ['+=', '-=', '*=', '/=', '//=', '%=', '**=', '@=', '<<=', '>>=', '&=', '^=', '|='],
      init: '+=',
      synchronize: true,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.owner.numberOperator_p = newValue
        this.owner.bitwiseOperator_p = newValue
      },
      validate: false
    },
    numberOperator: {
      all: ['+=', '-=', '*=', '/=', '//=', '%=', '**=', '@='],
      noUndo: true,
      xml: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        if (oldValue && (newValue !== oldValue)) {
          this.didChange(oldValue, newValue)
          var O = this.owner
          O.operator_p = newValue
          O.operator_d.bitwise = (O.operator_p !== this.get())
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
          var O = this.owner
          O.operator_p = newValue
          O.operator_d.bitwise = (O.operator_p === this.get())
        }
      },
      validate: true
    }
  },
  slots: {
    target: {
      order: 1,
      fields: {
        bind: {
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
    value: {
      order: 3,
      wrap: eYo.T3.Expr.augassigned_list
    }
  }
}, true)

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  var withTarget = this.target_t
  var target = this.target_p
  var operator = this.operator_p
  var withBitwise = this.operator_d.bitwise
  var operators = withBitwise
    ? this.bitwiseOperator_d.getAll()
    : this.numberOperator_d.getAll()
  var F = (i) => {
    var op = operators[i]
    if (op !== operator) {
      var content =
      goog.dom.createDom(goog.dom.TagName.SPAN, null,
        withTarget ? eYo.Do.createSPAN('…', 'eyo-code')
          : eYo.Do.createSPAN(target || eYo.Msg.Placeholder.IDENTIFIER, target ? 'eyo-code' : 'eyo-code-placeholder'),
        eYo.Do.createSPAN(' ' + op + ' ', 'eyo-code'),
        eYo.Do.createSPAN('…', 'eyo-code')
      )
      var menuItem = mgr.newMenuItem(content, function () {
        console.log('Change', withBitwise ? 'bitwise' : 'number', 'operator to', op)
        withBitwise ? block.eyo.bitwiseOperator_d.set(op) : block.eyo.numberOperator_d.set(op)
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
  var menuItem = mgr.newMenuItem(content, () => {
    this.operator_p = withBitwise
      ? this.numberOperator_p : this.bitwiseOperator_p
  })
  mgr.addChild(menuItem, true)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.augmented_assignment_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
}

eYo.DelegateSvg.Assignment.T3s = [
  eYo.T3.Expr.identifier,
  eYo.T3.Expr.yield_expression,
  eYo.T3.Expr.target_list,
  eYo.T3.Expr.void_target_list,
  eYo.T3.Expr.parenth_target_list,
  eYo.T3.Expr.bracket_target_list,
  eYo.T3.Stmt.assignment_stmt,
  eYo.T3.Expr.value_list,
  eYo.T3.Expr.augassigned_list,
  eYo.T3.Stmt.augmented_assignment_stmt
]
