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

goog.provide('edY.DelegateSvg.Assignment')

goog.require('edY.DelegateSvg.Term')
goog.require('edY.DelegateSvg.List')
goog.require('edY.DelegateSvg.Stmt')

//["edy:attributeref", "edy:subscription", "edy:slicing", "edy:parenth_target_list", "edy:bracket_target_list", "edy:target_star", "edy:identifier", "edy:any"]

/**
 * Class for a DelegateSvg, '*...' block.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.makeSubclass('target_star', {
  tiles: {
    expression: {
      order: 1,
      fields: {
        label: {
          value: '*',
          css_class: 'edy-code-reserved',
        },
      },
      check: edY.T3.Expr.Check.target,
      hole_value: 'target',
    },
  },
})



/**
 * List consolidator for target list. Used is assignment.
 * Main entry: consolidate
 * @param {!String} single, the required type for a single element....
 */
edY.Consolidator.List.Target = function(D) {
  var d = {}
  goog.mixin(d, edY.Consolidator.List.Target.data)
  goog.mixin(d, D)
  edY.Consolidator.List.Target.superClass_.constructor.call(this, d)
}
goog.inherits(edY.Consolidator.List.Target, edY.Consolidator.List)

edY.Consolidator.List.Target.data = {
  hole_value: 'name',
  check: null,
  empty: false,
  presep: ',',
}

edY.Consolidator.List.makeSubclass('Target', {
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
edY.Consolidator.List.Target.Void = function(D) {
  var d = {}
  goog.mixin(d, edY.Consolidator.List.Target.Void.data)
  goog.mixin(d, D)
  edY.Consolidator.List.Target.Void.superClass_.constructor.call(this, d)
}
goog.inherits(edY.Consolidator.List.Target.Void, edY.Consolidator.List.Target)

edY.Consolidator.List.Target.Void.data = {
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
edY.Consolidator.List.Target.prototype.getIO = function(block) {
  var io = edY.Consolidator.List.Target.superClass_.getIO.call(this, block)
  io.first_starred = io.last = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 * @param {object} io
 */
edY.Consolidator.List.Target.prototype.doCleanup = function () {
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
    if (goog.array.contains(check, edY.T3.Expr.target_star)) {
      return Type.STARRED
    } else {
      return Type.OTHER
    }
  }
  var setupFirst = function (io) {
    io.first_starred = io.last = -1
    this.setupIO(io, 0)
    while (!!io.edy) {
      if ((io.edy.parameter_type_ = getCheckType.call(this, io)) === Type.STARRED) {
        if (io.first_starred < 0) {
          io.first_starred = io.i
        }
      } else if (io.edy.parameter_type_ === Type.OTHER) {
        io.last = io.i
      }
      this.nextInput(io)
    }
  }
  return function(io) {
    edY.Consolidator.List.Target.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    if (io.first_starred>=0) {
      // ther must be only one starred
      this.setupIO(io, io.first_starred + 2)
      while (!!io.edy) {
        if (io.edy.parameter_type_ === Type.STARRED) {
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
edY.Consolidator.List.Target.prototype.getCheck = function (io) {
  if (io.first_starred < 0 || io.i === io.first_starred) {
    return edY.T3.Expr.Check.target
  } else {
    return edY.T3.Expr.Check.target_unstar
  }
}

/**
 * Class for a DelegateSvg, target_list block.
 * This block may be sealed.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.List.makeSubclass('target_list', {
  list: {
    consolidator: edY.Consolidator.List.Target,
    hole_value: 'name',
  },
})

/**
 * Class for a DelegateSvg, void_target_list block.
 * This block may be sealed.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.List.makeSubclass('void_target_list', {
  list: {
    consolidator: edY.Consolidator.List.Target,
    empty: true,
    hole_value: 'name',
  },
})

/**
 * Class for a DelegateSvg, parenth_target_list block.
 * This block may be sealed.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.void_target_list.makeSubclass('parenth_target_list', {
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
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.Expr.void_target_list.makeSubclass('bracket_target_list', {
  fields: {
    prefix: {
      value: '[',
    },
    suffix: {
      value: ']',
    },
  },
})

goog.provide('edY.DelegateSvg.Stmt.assignment_stmt')

/**
 * Class for a DelegateSvg, target_list_list block.
 * This block may be sealed.
 * Not normally called directly, edY.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
edY.DelegateSvg.List.makeSubclass('target_list_list', {
  list: {
    check: edY.T3.Expr.target_list,
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
edY.DelegateSvg.Stmt.makeSubclass('assignment_stmt', {
  data: {
    subtype: {
      all: [edY.T3.Expr.identifier, edY.T3.Expr.dotted_name, ],
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
        var type = edY.Do.typeOfString(newValue)
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
      fields: {
        edit: {
          placeholder: edY.Msg.Placeholder.IDENTIFIER,
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
      check: edY.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    target: {
      order: 3,
      wrap: edY.T3.Expr.target_list_list,
    },
    assigned: {
      order: 4,
      fields: {
        operator: {
          value: '=',
          css: 'reserved',
        },
      },
      wrap: edY.T3.Expr.assigned_list,
    },
  },
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Stmt.assignment_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var name = this.data.name.get()
  var M = this.data.variant.model
  var current = this.data.variant.get()
  var F = function(content, variant) {
    var menuItem = new edY.MenuItem(content, function() {
      block.edy.data.variant.set(variant)
    })
    menuItem.setEnabled(variant != current)
    mgr.addChild(menuItem, true)
  }
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    edY.Do.createSPAN(name || edY.Msg.Placeholder.IDENTIFIER, name? 'edy-code': 'edy-code-placeholder'),
    edY.Do.createSPAN(' = …', 'edy-code'),
  )
  F(content, M.NAME_VALUE)
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    edY.Do.createSPAN(name || edY.Msg.Placeholder.IDENTIFIER, name? 'edy-code': 'edy-code-placeholder'),
    edY.Do.createSPAN(': … = …', 'edy-code'),
  )
  F(content, M.NAME_ANNOTATION_VALUE)
  var content = edY.Do.createSPAN('…,… = …,…', 'edy-code')
  F(content, 2)
  mgr.shouldSeparate()
  if (current != M.TARGET_VALUE) {
    var menuItem = new edY.MenuItem(edY.Msg.RENAME, function() {
        block.edy.data.name.field.showEditor()
      })
    mgr.addChild(menuItem, true)
    mgr.shouldSeparate()
  }
  edY.DelegateSvg.Stmt.assignment_stmt.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

edY.DelegateSvg.List.makeSubclass('assigned_list', function() {
  var D = {
    check: edY.T3.Expr.Check.starred_item,
    unique: edY.T3.Expr.yield_expression,
    consolidator: edY.Consolidator.List.Singled,
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

edY.DelegateSvg.List.makeSubclass('augassigned_list', function() {
  var D = {
    check: edY.T3.Expr.Check.expression,
    unique: edY.T3.Expr.yield_expression,
    consolidator: edY.Consolidator.List.Singled,
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

goog.provide('edY.DelegateSvg.AugAssign')

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
edY.DelegateSvg.Stmt.makeSubclass('augmented_assignment_stmt', {
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
        var type = edY.Do.typeOfString(newValue)
        return type === edY.T3.Expr.identifier || type === edY.T3.Expr.dotted_name?
        {validated: newValue}: null
      },
      synchronize: function(newValue) {
        this.setFieldValue(newValue || '')
      },
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
          placeholder: edY.Msg.Placeholder.IDENTIFIER,
          validate: true,
          endEditing: true,
        },
      },
    },
    target: {
      order: 2,
      check: edY.T3.Expr.Check.augtarget,
    },
    expressions: {
      order: 3,
      fields: {
        operator: {// only one `operator` field
          value: '',
        },
      },
      wrap: edY.T3.Expr.augassigned_list,
    },
  },
})

console.warn('in initBlock,Search for field names corresponding to data names: model.data.foo -> model.u_*.foo')

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!edY.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
edY.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var variantData = this.data.variant
  var model = variantData.model
  const current = variantData.get()
  var withTarget = edY.Do.getVariantFlag(current, model.TARGET)
  var name = this.data.name.get()
  var operator = this.data.operator.get()
  var withBitwise = edY.Do.getVariantFlag(current, model.BITWISE)
  var operators = withBitwise? 
  this.data.bitwiseOperator.getAll():
  this.data.numberOperator.getAll()
  var F = function(i) {
    var op = operators[i]
    if (op !== operator) {
      var content =
      goog.dom.createDom(goog.dom.TagName.SPAN, null,
        withTarget? edY.Do.createSPAN('…', 'edy-code'):
        edY.Do.createSPAN(name || edY.Msg.Placeholder.IDENTIFIER, name? 'edy-code': 'edy-code-placeholder'),
        edY.Do.createSPAN(' '+op+' ', 'edy-code'),
        edY.Do.createSPAN('…', 'edy-code'),
      )
      var menuItem = new edY.MenuItem(content, function() {
        console.log('Change', withBitwise?'bitwise':'number', 'operator to', op)
        withBitwise? block.edy.data.bitwiseOperator.set(op): block.edy.data.numberOperator.set(op)
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
      var menuItem = new edY.MenuItem(content, function() {
        block.edy.data.variant.set(variant)
      })
      mgr.addChild(menuItem, true)
    }
  }
  var variant = model.NAME_EXPRESSIONS
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, null,
    edY.Do.createSPAN(name || edY.Msg.Placeholder.IDENTIFIER, name? 'edy-code': 'edy-code-placeholder'),
    edY.Do.createSPAN(' '+operator+' …', 'edy-code'),
  )
  F(model.NAME_EXPRESSIONS, content)
  var content =
  goog.dom.createDom(goog.dom.TagName.SPAN, 'edy-code',
    goog.dom.createTextNode('… '+operator+' …'),
  )
  F(model.TARGET_EXPRESSIONS, content)
  mgr.shouldSeparate()
  var content =
  edY.Do.createSPAN(withBitwise? '+=, -=, /= …': '<<=, >>=, &= …', 'edy-code')
  var menuItem = function(edy) {
    return new edY.MenuItem(content, function() {
      edy.data.operator.set(withBitwise? edy.data.bitwiseOperator.toText(): edy.data.numberOperator.toText())
  })
  } (this)
  mgr.addChild(menuItem, true)
  mgr.shouldSeparate()
  return edY.DelegateSvg.Stmt.augmented_assignment_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

edY.DelegateSvg.Assignment.T3s = [
  edY.T3.Expr.term,
  edY.T3.Expr.yield_expression,
  edY.T3.Expr.target_list,
  edY.T3.Expr.target_list_list,
  edY.T3.Expr.void_target_list,
  edY.T3.Expr.parenth_target_list,
  edY.T3.Expr.bracket_target_list,
  edY.T3.Stmt.assignment_stmt,
  edY.T3.Expr.assigned_list,
  edY.T3.Expr.augassigned_list,
  edY.T3.Stmt.augmented_assignment_stmt,
]