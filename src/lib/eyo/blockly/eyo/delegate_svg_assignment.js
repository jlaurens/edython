/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Assignment')

goog.require('eYo.DelegateSvg.Term')
goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Stmt')

//["eyo:attributeref", "eyo:subscription", "eyo:slicing", "eyo:parenth_target_list", "eyo:bracket_target_list", "eyo:target_star", "eyo:identifier", "eyo:any"]

/**
 * Class for a DelegateSvg, '*...' block.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.Expr.makeSubclass('target_star', {
  tiles: {
    expression: {
      order: 1,
      fields: {
        label: {
          value: '*',
          css_class: 'eyo-code-reserved',
        },
      },
      check: eYo.T3.Expr.Check.target,
      hole_value: 'target',
    },
  },
})



/**
 * List consolidator for target list. Used is assignment.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
eYo.Consolidator.List.Target = function(D) {
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
  presep: ',',
}

eYo.Consolidator.List.makeSubclass('Target', {
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
eYo.Consolidator.List.Target.Void = function(D) {
  var d = {}
  goog.mixin(d, eYo.Consolidator.List.Target.Void.data)
  goog.mixin(d, D)
  eYo.Consolidator.List.Target.Void.superClass_.constructor.call(this, d)
}
goog.inherits(eYo.Consolidator.List.Target.Void, eYo.Consolidator.List.Target)

eYo.Consolidator.List.Target.Void.data = {
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
eYo.Consolidator.List.Target.prototype.getIO = function(block) {
  var io = eYo.Consolidator.List.Target.superClass_.getIO.call(this, block)
  io.first_starred = io.last = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
eYo.Consolidator.List.Target.prototype.doCleanup = function () {
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
    if (goog.array.contains(check, eYo.T3.Expr.target_star)) {
      return Type.STARRED
    } else {
      return Type.OTHER
    }
  }
  var setupFirst = function (io) {
    io.first_starred = io.last = -1
    this.setupIO(io, 0)
    while (!!io.eyo) {
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
  return function(io) {
    eYo.Consolidator.List.Target.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    if (io.first_starred>=0) {
      // ther must be only one starred
      this.setupIO(io, io.first_starred + 2)
      while (!!io.eyo) {
        if (io.eyo.parameter_type_ === Type.STARRED) {
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
eYo.Consolidator.List.Target.prototype.getCheck = function (io) {
  if (io.first_starred < 0 || io.i === io.first_starred) {
    return eYo.T3.Expr.Check.target
  } else {
    return eYo.T3.Expr.Check.target_unstar
  }
}

/**
 * Class for a DelegateSvg, target_list block.
 * This block may be sealed.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.List.makeSubclass('target_list', {
  list: {
    consolidator: eYo.Consolidator.List.Target,
    hole_value: 'name',
  },
})

/**
 * Class for a DelegateSvg, void_target_list block.
 * This block may be sealed.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.List.makeSubclass('void_target_list', {
  list: {
    consolidator: eYo.Consolidator.List.Target,
    empty: true,
    hole_value: 'name',
  },
})

/**
 * Class for a DelegateSvg, parenth_target_list block.
 * This block may be sealed.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.Expr.void_target_list.makeSubclass('parenth_target_list', {
  fields: {
    prefix: {
      value: '(',
    },
    suffix: {
      value: ')',
    },
  },
})

/**
 * Class for a DelegateSvg, bracket_target_list block.
 * This block may be sealed.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.Expr.void_target_list.makeSubclass('bracket_target_list', {
  fields: {
    prefix: {
      value: '[',
    },
    suffix: {
      value: ']',
    },
  },
})

goog.provide('eYo.DelegateSvg.Stmt.assignment_stmt')

/**
 * Class for a DelegateSvg, target_list_list block.
 * This block may be sealed.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.List.makeSubclass('target_list_list', {
  list: {
    check: eYo.T3.Expr.target_list,
    empty: false,
    postsep: '=',
  },
})

/**
 * Class for a DelegateSvg, assignment_stmt.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.Stmt.makeSubclass('assignment_stmt', {
  data: {
    subtype: {
      all: [eYo.T3.Expr.identifier, eYo.T3.Expr.dotted_name, ],
    },
    variant: {
      NAME_VALUE: 0,
      NAME_ANNOTATION_VALUE: 1,
      TARGET_VALUE: 2,
      all: [0, 1, 2],
      synchronize: function(newValue) {
        var M = this.model
        this.ui.tiles.name.setIncog(newValue == M.TARGET_VALUE)
        this.ui.tiles.annotation.setIncog(newValue != M.NAME_ANNOTATION_VALUE)
        this.ui.tiles.target.setIncog(newValue != M.TARGET_VALUE)
      },
    },
    name: {
      default: '',
      validate: function(newValue) {
        var types = this.data.subtype.getAll()
        var type = eYo.Do.typeOfString(newValue)
        return types.indexOf(type) >= 0? {validated: newValue}: null
      },
      synchronize: true,
    },
  },
  tiles: {
    name: {
      order: 1,
      fields: {
        edit: {
          placeholder: eYo.Msg.Placeholder.IDENTIFIER,
          validate: true,
          endEditing: true,
        },
      },
    },
    annotation: {
      order: 2,
      fields: {
        label: {
          value: ':',
          css: 'reserved',
        },
      },
      check: eYo.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    target: {
      order: 3,
      wrap: eYo.T3.Expr.target_list_list,
    },
    assigned: {
      order: 4,
      fields: {
        operator: {
          value: '=',
          css: 'reserved',
        },
      },
      wrap: eYo.T3.Expr.assigned_list,
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.assignment_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var name = this.data.name.get()
  var M = this.data.variant.model
  var current = this.data.variant.get()
  var F = function(content, variant) {
    var menuItem = new eYo.MenuItem(content, function() {
      block.eyo.data.variant.set(variant)
    })
    menuItem.setEnabled(variant != current)
    mgr.addChild(menuItem, true)
  }
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN(name || eYo.Msg.Placeholder.IDENTIFIER, name? 'eyo-code': 'eyo-code-placeholder'),
    eYo.Do.createSPAN(' = …', 'eyo-code'),
  )
  F(content, M.NAME_VALUE)
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN(name || eYo.Msg.Placeholder.IDENTIFIER, name? 'eyo-code': 'eyo-code-placeholder'),
    eYo.Do.createSPAN(': … = …', 'eyo-code'),
  )
  F(content, M.NAME_ANNOTATION_VALUE)
  var content = eYo.Do.createSPAN('…,… = …,…', 'eyo-code')
  F(content, 2)
  mgr.shouldSeparate()
  if (current != M.TARGET_VALUE) {
    var menuItem = new eYo.MenuItem(eYo.Msg.RENAME, function() {
        block.eyo.data.name.field.showEditor()
      })
    mgr.addChild(menuItem, true)
    mgr.shouldSeparate()
  }
  eYo.DelegateSvg.Stmt.assignment_stmt.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

eYo.DelegateSvg.List.makeSubclass('assigned_list', function() {
  var D = {
    check: eYo.T3.Expr.Check.starred_item,
    unique: eYo.T3.Expr.yield_expression,
    consolidator: eYo.Consolidator.List.Singled,
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

eYo.DelegateSvg.List.makeSubclass('augassigned_list', function() {
  var D = {
    check: eYo.T3.Expr.Check.expression,
    unique: eYo.T3.Expr.yield_expression,
    consolidator: eYo.Consolidator.List.Singled,
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

goog.provide('eYo.DelegateSvg.AugAssign')

/**
 * Class for a DelegateSvg, augmented_assignment_stmt block.
 * Multiple ops.
 * As there are many possible operators, we split the list into
 * number operators (+=, -=, /= ...) and bitwise operators (<<=, >>=,...)
 * 
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.DelegateSvg.Stmt.makeSubclass('augmented_assignment_stmt', {
  data: {
    variant: {
      NAME_EXPRESSIONS: 0,
      TARGET_EXPRESSIONS: 1,
      all: [0, 1],
      synchronize: function (newVariant) {
        this.ui.tiles.name.setIncog(newVariant)
        this.ui.tiles.target.setIncog(!newVariant)
      },
    },
    name: {
      default: '',
      validate: function(newValue) {
        var type = eYo.Do.typeOfString(newValue)
        return type === eYo.T3.Expr.identifier || type === eYo.T3.Expr.dotted_name?
        {validated: newValue}: null
      },
      synchronize: true,
    },
    operator: {
      default: '+=',
      synchronize: true,
      didChange: function(oldValue, newValue) {
        this.data.numberOperator.set(newValue)
        this.data.bitwiseOperator.set(newValue)
      }
    },
    numberOperator: {
      all: ['+=','-=','*=','/=','//=','%=','**=','@='],
      noUndo: true,
      xml: false,
      didChange: function(oldValue, newValue) {
        this.data.operator.set(newValue)
      },
    },
    bitwiseOperator: {
      all: ['<<=', '>>=', '&=', '^=', '|='],
      noUndo: true,
      xml: false,
      didChange: function(newValue) {
        this.data.operator.set(newValue)
      },
    },
  },
  tiles: {
    name: {
      order: 1,
      fields: {
        edit: {
          placeholder: eYo.Msg.Placeholder.IDENTIFIER,
          validate: true,
          endEditing: true,
        },
      },
    },
    target: {
      order: 2,
      check: eYo.T3.Expr.Check.augtarget,
    },
    expressions: {
      order: 3,
      fields: {
        operator: {// only one `operator` field
          value: '',
        },
      },
      wrap: eYo.T3.Expr.augassigned_list,
    },
  },
})

console.warn('in initBlock,Search for field names corresponding to data names: model.data.foo -> model.u_*.foo')

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var variantData = this.data.variant
  var model = variantData.model
  const current = variantData.get()
  var withTarget = eYo.Do.getVariantFlag(current, model.TARGET)
  var name = this.data.name.get()
  var operator = this.data.operator.get()
  var withBitwise = eYo.Do.getVariantFlag(current, model.BITWISE)
  var operators = withBitwise? 
  this.data.bitwiseOperator.getAll():
  this.data.numberOperator.getAll()
  var F = function(i) {
    var op = operators[i]
    if (op !== operator) {
      var content =
      goog.dom.createDom(goog.dom.TagName.SPAN, null,
        withTarget? eYo.Do.createSPAN('…', 'eyo-code'):
        eYo.Do.createSPAN(name || eYo.Msg.Placeholder.IDENTIFIER, name? 'eyo-code': 'eyo-code-placeholder'),
        eYo.Do.createSPAN(' '+op+' ', 'eyo-code'),
        eYo.Do.createSPAN('…', 'eyo-code'),
      )
      var menuItem = new eYo.MenuItem(content, function() {
        console.log('Change', withBitwise?'bitwise':'number', 'operator to', op)
        withBitwise? block.eyo.data.bitwiseOperator.set(op): block.eyo.data.numberOperator.set(op)
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
      var menuItem = new eYo.MenuItem(content, function() {
        block.eyo.data.variant.set(variant)
      })
      mgr.addChild(menuItem, true)
    }
  }
  var variant = model.NAME_EXPRESSIONS
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    eYo.Do.createSPAN(name || eYo.Msg.Placeholder.IDENTIFIER, name? 'eyo-code': 'eyo-code-placeholder'),
    eYo.Do.createSPAN(' '+operator+' …', 'eyo-code'),
  )
  F(model.NAME_EXPRESSIONS, content)
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    goog.dom.createTextNode('… '+operator+' …'),
  )
  F(model.TARGET_EXPRESSIONS, content)
  mgr.shouldSeparate()
  var content =
  eYo.Do.createSPAN(withBitwise? '+=, -=, /= …': '<<=, >>=, &= …', 'eyo-code')
  var menuItem = function(eyo) {
    return new eYo.MenuItem(content, function() {
      eyo.data.operator.set(withBitwise? eyo.data.bitwiseOperator.toText(): eyo.data.numberOperator.toText())
  })
  } (this)
  mgr.addChild(menuItem, true)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.augmented_assignment_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

eYo.DelegateSvg.Assignment.T3s = [
  eYo.T3.Expr.term,
  eYo.T3.Expr.yield_expression,
  eYo.T3.Expr.target_list,
  eYo.T3.Expr.target_list_list,
  eYo.T3.Expr.void_target_list,
  eYo.T3.Expr.parenth_target_list,
  eYo.T3.Expr.bracket_target_list,
  eYo.T3.Stmt.assignment_stmt,
  eYo.T3.Expr.assigned_list,
  eYo.T3.Expr.augassigned_list,
  eYo.T3.Stmt.augmented_assignment_stmt,
]