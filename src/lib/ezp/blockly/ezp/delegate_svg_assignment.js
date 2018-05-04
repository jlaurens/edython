/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Assignment')

goog.require('ezP.DelegateSvg.Term')
goog.require('ezP.DelegateSvg.List')
goog.require('ezP.DelegateSvg.Stmt')

//["ezp:attributeref", "ezp:subscription", "ezp:slicing", "ezp:parenth_target_list", "ezp:bracket_target_list", "ezp:target_star", "ezp:identifier", "ezp:any"]

/**
 * Class for a DelegateSvg, '*...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.makeSubclass('target_star', {
  tiles: {
    expression: {
      order: 1,
      label: '*',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.target,
      hole_value: 'target',
    },
  },
})



/**
 * List consolidator for target list. Used is assignment.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
ezP.Consolidator.List.Target = function(D) {
  var d = {}
  goog.mixin(d, ezP.Consolidator.List.Target.data)
  goog.mixin(d, D)
  ezP.Consolidator.List.Target.superClass_.constructor.call(this, d)
}
goog.inherits(ezP.Consolidator.List.Target, ezP.Consolidator.List)

ezP.Consolidator.List.Target.data = {
  hole_value: 'name',
  check: null,
  empty: false,
  presep: ',',
}

ezP.Consolidator.List.makeSubclass('Target', {
  hole_value: 'name',
  check: null,
  empty: false,
  presep: ',',
})

/**
 * List consolidator for target list.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
ezP.Consolidator.List.Target.Void = function(D) {
  var d = {}
  goog.mixin(d, ezP.Consolidator.List.Target.Void.data)
  goog.mixin(d, D)
  ezP.Consolidator.List.Target.Void.superClass_.constructor.call(this, d)
}
goog.inherits(ezP.Consolidator.List.Target.Void, ezP.Consolidator.List.Target)

ezP.Consolidator.List.Target.Void.data = {
  hole_value: 'name',
  check: null,
  empty: true,
  presep: ',',
}

/**
 * Prepare io, just before walking through the input list.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.Block} block, owner or the receiver.
 */
ezP.Consolidator.List.Target.prototype.getIO = function(block) {
  var io = ezP.Consolidator.List.Target.superClass_.getIO.call(this, block)
  io.first_starred = io.last = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
ezP.Consolidator.List.Target.prototype.doCleanup = function () {
  // preparation: walk through the list of inputs and
  // find the first_starred input
  var Type = {
    UNCONNECTED: 0,
    STARRED: 1,
    OTHER: 2,
  }
    /**
   * Whether the input corresponds to an identifier...
   * Called when io.input is connected.
   * @param {Object} io, parameters....
   */
  var getCheckType = function(io) {
    var target = io.c8n.targetConnection
    if (!target) {
      return Type.UNCONNECTED
    }
    var check = target.check_
    if (goog.array.contains(check, ezP.T3.Expr.target_star)) {
      return Type.STARRED
    } else {
      return Type.OTHER
    }
  }
  var setupFirst = function (io) {
    io.first_starred = io.last = -1
    this.setupIO(io, 0)
    while (!!io.ezp) {
      if ((io.ezp.parameter_type_ = getCheckType.call(this, io)) === Type.STARRED) {
        if (io.first_starred < 0) {
          io.first_starred = io.i
        }
      } else if (io.ezp.parameter_type_ === Type.OTHER) {
        io.last = io.i
      }
      this.nextInput(io)
    }
  }
  return function(io) {
    ezP.Consolidator.List.Target.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    if (io.first_starred>=0) {
      // ther must be only one starred
      this.setupIO(io, io.first_starred + 2)
      while (!!io.ezp) {
        if (io.ezp.parameter_type_ === Type.STARRED) {
          // disconnect this
          var c8n = io.c8n
          var target = c8n.targetConnection
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
} ()

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
ezP.Consolidator.List.Target.prototype.getCheck = function (io) {
  if (io.first_starred < 0 || io.i === io.first_starred) {
    return ezP.T3.Expr.Check.target
  } else {
    return ezP.T3.Expr.Check.target_unstar
  }
}

/**
 * Class for a DelegateSvg, target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('target_list', {
  list: {
    consolidator: ezP.Consolidator.List.Target,
    hole_value: 'name',
  },
})

/**
 * Class for a DelegateSvg, void_target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('void_target_list', {
  list: {
    consolidator: ezP.Consolidator.List.Target,
    empty: true,
    hole_value: 'name',
  },
})

/**
 * Class for a DelegateSvg, parenth_target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.void_target_list.makeSubclass('parenth_target_list', {
  fields: {
    prefix: {
      label: '(',
    },
    suffix: {
      label: ')',
    },
  },
})

/**
 * Class for a DelegateSvg, bracket_target_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.void_target_list.makeSubclass('bracket_target_list', {
  fields: {
    prefix: {
      label: '[',
    },
    suffix: {
      label: ']',
    },
  },
})

goog.provide('ezP.DelegateSvg.Stmt.assignment_stmt')

/**
 * Class for a DelegateSvg, target_list_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.List.makeSubclass('target_list_list', {
  list: {
    check: ezP.T3.Expr.target_list,
    empty: false,
    postsep: '=',
  },
})

/**
 * Class for a DelegateSvg, assignment_stmt.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass('assignment_stmt', {
  data: {
    subtype: {
      all: [ezP.T3.Expr.identifier, ezP.T3.Expr.dotted_name, ],
    },
    variant: {
      all: [0, 1, 2],
      synchronize: function(newValue) {
        this.ui.tiles.name.setDisabled(newValue == 2)
        this.ui.tiles.annotation.setDisabled(newValue != 1)
        this.ui.tiles.target.setDisabled(newValue != 2)
      },
    },
    name: {
      default: '',
      validate: function(newValue) {
        var types = this.data.subtype.getAll()
        var type = ezP.Do.typeOfString(newValue)
        return types.indexOf(type) >= 0? {validated: newValue}: null
      },
      synchronize: function(newValue) {
        this.setFieldValue(this.toText() || '')
      },
    },
  },
  tiles: {
    name: {
      order: 1,
      edit: {
        placeholder: ezP.Msg.Placeholder.IDENTIFIER,
        validate: true,
        onEndEditing: true,
      },
    },
    annotation: {
      order: 2,
      label: ':',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    target: {
      order: 3,
      wrap: ezP.T3.Expr.target_list_list,
    },
    assigned: {
      order: 4,
      operator: '=',
      wrap: ezP.T3.Expr.assigned_list,
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.assignment_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var value = this.data.value.get()
  var current = this.data.variant.get()
  var F = function(content, variant) {
    var menuItem = new ezP.MenuItem(content, function() {
      block.ezp.data.variant.set(variant)
    })
    menuItem.setEnabled(variant != current)
    mgr.addChild(menuItem, true)
  }
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    ezP.Do.createSPAN(value || ezP.Msg.Placeholder.IDENTIFIER, value? 'ezp-code': 'ezp-code-placeholder'),
    ezP.Do.createSPAN(' = …', 'ezp-code'),
  )
  F(content, 0)
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    ezP.Do.createSPAN(value || ezP.Msg.Placeholder.IDENTIFIER, value? 'ezp-code': 'ezp-code-placeholder'),
    ezP.Do.createSPAN(': … = …', 'ezp-code'),
  )
  F(content, 1)
  var content = ezP.Do.createSPAN('…,… = …,…', 'ezp-code')
  F(content, 2)
  mgr.shouldSeparate()
  if (current != 2) {
    var menuItem = new ezP.MenuItem(ezP.Msg.RENAME, function() {
        block.ezp.ui[1].fields.value.showEditor()
      })
    mgr.addChild(menuItem, true)
    mgr.shouldSeparate()
  }
  ezP.DelegateSvg.Stmt.assignment_stmt.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

ezP.DelegateSvg.List.makeSubclass('assigned_list', function() {
  var D = {
    check: ezP.T3.Expr.Check.starred_item,
    unique: ezP.T3.Expr.yield_expression,
    consolidator: ezP.Consolidator.List.Singled,
    empty: false,
    presep: ',',
  }
  var RA = goog.array.concat(D.check,D.unique)
  goog.array.removeDuplicates(RA)
  D.all = RA
  return {
    list: D,
  }
})

ezP.DelegateSvg.List.makeSubclass('augassigned_list', function() {
  var D = {
    check: ezP.T3.Expr.Check.expression,
    unique: ezP.T3.Expr.yield_expression,
    consolidator: ezP.Consolidator.List.Singled,
    empty: false,
    presep: ',',
  }
  var RA = goog.array.concat(D.check,D.unique)
  goog.array.removeDuplicates(RA)
  D.all = RA
  return {
    list: D,
  }
})

goog.provide('ezP.DelegateSvg.AugAssign')

/**
 * Class for a DelegateSvg, augmented_assignment_stmt block.
 * Multiple ops.
 * As there are many possible operators, we split the list into
 * number operators (+=, -=, /= ...) and bitwise operators (<<=, >>=,...)
 * 
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Stmt.makeSubclass('augmented_assignment_stmt', function() {
  var D = {
    data: {
      name: {
        default: '',
        validate: function(newValue) {
          var type = ezP.Do.typeOfString(newValue)
          return type === ezP.T3.Expr.identifier || type === ezP.T3.Expr.dotted_name?
          {validated: newValue}: null
        },
        synchronize: function(newValue) {
          this.setFieldValue(newValue || '')
        },
      },
      operator: {
        default: '+=',
        synchronize: function (newValue) {
          this.setFieldValue(this.toText())
        },
        didChange: function(oldValue, newValue) {
          this.data.numberOperator.set(newValue)
          this.data.bitwiseOperator.set(newValue)
        }
      },
      numberOperator: {
        all: ['+=','-=','*=','/=','//=','%=','**=','@='],
        noUndo: true,
        didChange: function(oldValue, newValue) {
          this.data.operator.set(newValue)
        },
      },
      bitwiseOperator: {
        all: ['<<=', '>>=', '&=', '^=', '|='],
        noUndo: true,
        didChange: function(newValue) {
          this.data.operator.set(newValue)
        },
      },
    },
    tiles: {
      name: {
        order: 1,
        edit: {
          placeholder: ezP.Msg.Placeholder.IDENTIFIER,
          validate: function(txt) {
            return this.ezp.validateData(goog.isDef(txt)? txt: this.getValue())
          },
          onEndEditing: function () {
            this.ezp.setData(this.getValue())
            // this.ezp.data.fromText(this.getValue())
          },
        },
      },
      target: {
        order: 2,
        check: ezP.T3.Expr.Check.augtarget,
      },
      expressions: {
        order: 3,
        operator: {},
        wrap: ezP.T3.Expr.augassigned_list,
      },
    },
  }
  D.data.variant = {
    NAME_EXPRESSIONS: 0,
    TARGET_EXPRESSIONS: 1,
    synchronize: function (newVariant) {
      this.ui.tiles.name.setDisabled(newVariant)
      this.ui.tiles.target.setDisabled(!newVariant)
    },
  }
  D.data.variant.all = [D.data.variant.NAME_EXPRESSIONS, D.data.variant.TARGET_EXPRESSION]
  return D
} ())

console.warn('in initBlock,Search for field names corresponding to data names: model.data.foo -> model.u_*.foo')

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var variantData = this.data.variant
  var model = variantData.model
  const current = variantData.get()
  var withTarget = ezP.Do.getVariantFlag(current, model.TARGET)
  var name = this.data.name.get()
  var operator = this.data.operator.get()
  var withBitwise = ezP.Do.getVariantFlag(current, model.BITWISE)
  var operators = withBitwise? 
  this.data.bitwiseOperator.getAll():
  this.data.numberOperator.getAll()
  var F = function(i) {
    var op = operators[i]
    if (op !== operator) {
      var content =
      goog.dom.createDom(goog.dom.TagName.SPAN, null,
        withTarget? ezP.Do.createSPAN('…', 'ezp-code'):
        ezP.Do.createSPAN(name || ezP.Msg.Placeholder.IDENTIFIER, name? 'ezp-code': 'ezp-code-placeholder'),
        ezP.Do.createSPAN(' '+op+' ', 'ezp-code'),
        ezP.Do.createSPAN('…', 'ezp-code'),
      )
      var menuItem = new ezP.MenuItem(content, function() {
        console.log('Change', withBitwise?'bitwise':'number', 'operator to', op)
        withBitwise? block.ezp.data.bitwiseOperator.set(op): block.ezp.data.numberOperator.set(op)
      })
      mgr.addChild(menuItem, true)
    }
  }
  for (var i = 0; i < operators.length; i++) {
    F(i)
  }
  mgr.shouldSeparate()
  var F = function(variant, content) {
    if (variant !== current) {
      var menuItem = new ezP.MenuItem(content, function() {
        block.ezp.data.variant.set(variant)
      })
      mgr.addChild(menuItem, true)
    }
  }
  var variant = model.NAME_EXPRESSIONS
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    ezP.Do.createSPAN(name || ezP.Msg.Placeholder.IDENTIFIER, name? 'ezp-code': 'ezp-code-placeholder'),
    ezP.Do.createSPAN(' '+operator+' …', 'ezp-code'),
  )
  F(model.NAME_EXPRESSIONS, content)
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    goog.dom.createTextNode('… '+operator+' …'),
  )
  F(model.TARGET_EXPRESSIONS, content)
  mgr.shouldSeparate()
  var content =
  ezP.Do.createSPAN(withBitwise? '+=, -=, /= …': '<<=, >>=, &= …', 'ezp-code')
  var menuItem = function(ezp) {
    return new ezP.MenuItem(content, function() {
      ezp.data.operator.set(withBitwise? ezp.data.bitwiseOperator.toText(): ezp.data.numberOperator.toText())
  })
  } (this)
  mgr.addChild(menuItem, true)
  mgr.shouldSeparate()
  return ezP.DelegateSvg.Stmt.augmented_assignment_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

ezP.DelegateSvg.Assignment.T3s = [
  ezP.T3.Expr.term,
  ezP.T3.Expr.yield_expression,
  ezP.T3.Expr.target_list,
  ezP.T3.Expr.target_list_list,
  ezP.T3.Expr.void_target_list,
  ezP.T3.Expr.parenth_target_list,
  ezP.T3.Expr.bracket_target_list,
  ezP.T3.Stmt.assignment_stmt,
  ezP.T3.Expr.assigned_list,
  ezP.T3.Expr.augassigned_list,
  ezP.T3.Stmt.augmented_assignment_stmt,
]