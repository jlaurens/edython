/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Workspace override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Workspace')

goog.require('Blockly.Workspace')
goog.require('eYo.Helper')
goog.require('eYo.Block')

/**
 * Class for a workspace.  This is a data structure that contains blocks.
 * There is no UI, and can be created headlessly.
 * @param {Blockly.Options} optOptions Dictionary of options.
 * @constructor
 */
eYo.WorkspaceDelegate = function (workspace) {
  eYo.WorkspaceDelegate.superClass_.constructor.call(this)
  this.workspace_ = workspace
}
goog.inherits(eYo.WorkspaceDelegate, eYo.Helper)

/**
 * Class for a workspace.  This is a data structure that contains blocks.
 * There is no UI, and can be created headlessly.
 * @param {Blockly.Options} optOptions Dictionary of options.
 * @constructor
 */
eYo.Workspace = function (optOptions) {
  eYo.Workspace.superClass_.constructor.call(this, optOptions)
  this.eyo = new eYo.WorkspaceDelegate(this)
}
goog.inherits(eYo.Workspace, Blockly.Workspace)

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 * @suppress{accessControls}
 */
Blockly.Workspace.prototype.dispose = function () {
  this.listeners_.length = 0
  this.clear()
  this.eyo.dispose()
  this.eyo = null
  // Remove from workspace database.
  delete Blockly.Workspace.WorkspaceDB_[this.id]
}

/**
 * Obtain a newly created block.
 * Returns a block subclass for EZP blocks.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} optId Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!Blockly.Block} The created block.
 */
eYo.Workspace.prototype.newBlock = function (prototypeName, optId) {
  if (prototypeName.startsWith('eyo:')) {
    return new eYo.Block(/** Blockly.Workspace */ this, prototypeName, optId)
  } else {
    return new Blockly.Block(/** Blockly.Workspace */ this, prototypeName, optId)
  }
}

eYo.Workspace.prototype.logAllConnections = function (comment) {
  comment = comment || ''
  var dbList = this.connectionDBList
  console.log(comment + '> Blockly.INPUT_VALUE connections')
  var db = dbList[Blockly.INPUT_VALUE]
  for (var i = 0, c8n; (c8n = db[i]); ++i) {
    console.log(i + ':' + [c8n.x_, c8n.y_, c8n.sourceBlock_.type])
  }
  console.log(comment + '> Blockly.OUTPUT_VALUE connections')
  db = dbList[Blockly.OUTPUT_VALUE]
  for (i = 0; (c8n = db[i]); ++i) {
    console.log(i + ':' + [c8n.x_, c8n.y_, c8n.sourceBlock_.type])
  }
  console.log(comment + '> Blockly.NEXT_STATEMENT connections')
  db = dbList[Blockly.NEXT_STATEMENT]
  for (i = 0; (c8n = db[i]); ++i) {
    console.log(i + ':' + [c8n.x_, c8n.y_, c8n.sourceBlock_.type])
  }
  console.log(comment + '> Blockly.PREVIOUS_STATEMENT connections')
  db = dbList[Blockly.PREVIOUS_STATEMENT]
  for (i = 0; (c8n = db[i]); ++i) {
    console.log(i + ':' + [c8n.x_, c8n.y_, c8n.sourceBlock_.type])
  }
}

/**
 * Find all the uses of a named variable.
 * @param {string} name Name of variable.
 * @return {!Array.<!Blockly.Block>} Array of block usages.
 */
eYo.Workspace.prototype.getVariableUses = function (name, all) {
  var uses = all ? eYo.Workspace.superClass_.getVariableUses.call(name) : []
  var blocks = this.getAllBlocks()
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    var eyo = blocks[i].eyo
    if (eyo) {
      var blockVariables = eyo.getVars(blocks[i])
      if (blockVariables) {
        for (var j = 0; j < blockVariables.length; j++) {
          var varName = blockVariables[j]
          // Variable name may be null if the block is only half-built.
          if (varName && name && Blockly.Names.equals(varName, name)) {
            uses.push(blocks[i])
          }
        }
      }
    }
  }
  return uses
}

/**
 * Find the block on this workspace with the specified ID.
 * @param {string} id ID of block to find.
 * @return {?Blockly.Block} The sought after block or null if not found.
 */
eYo.Workspace.savedGetBlockById = Blockly.Workspace.prototype.getBlockById
Blockly.Workspace.prototype.getBlockById = function (id) {
  var block = eYo.Workspace.savedGetBlockById.call(this, id)
  if (block) {
    return block
  }
  var m = XRegExp.exec(id, eYo.XRE.id_wrapped)
  if (m && (block = eYo.Workspace.savedGetBlockById.call(this, m.id))) {
    var e8r = block.eyo.inputEnumerator(block)
    while (e8r.next()) {
      var c8n = e8r.here.connection
      if (c8n) {
        var target = c8n.targetBlock()
        if (target && target.id === id) {
          return target
        }
      }
    }
  }
}


/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
eYo.Workspace.prototype.undo = function(redo) {
  var inputStack = redo ? this.redoStack_ : this.undoStack_
  var outputStack = redo ? this.undoStack_ : this.redoStack_
  while (true) {
    var inputEvent = inputStack.pop()
    if (!inputEvent) {
      return
    }
    var events = [inputEvent]
    // Do another undo/redo if the next one is of the same group.
    while (inputStack.length && inputEvent.group &&
        inputEvent.group == inputStack[inputStack.length - 1].group) {
      events.push(inputStack.pop())
    }
    events = Blockly.Events.filter(events, redo)
    if (events.length) {
      // Push these popped events on the opposite stack.
      for (var i = 0, event; event = events[i]; i++) {
        outputStack.push(event)
      }
      Blockly.Events.recordUndo = false
      try {
        for (var i = 0, event; event = events[i]; i++) {
          event.run(redo)
        }
      } finally {
        Blockly.Events.recordUndo = true
      }
      return  
    }
  }
}

/**
 * Obtain a newly created block.
 * Returns a block subclass for EZP blocks.
 * @param {!string} category Name of the categorr.
 * @return {!Array<string>} An array os string.
 */
eYo.WorkspaceDelegate.prototype.getFlyoutsForCategory = function (category) {
  switch(category) {
    case 'test':
    return [
      {
        type: eYo.T3.Stmt.assignment_stmt,
        input: {
          assigned: {
            input: {
              O: {
                type: eYo.T3.Expr.builtin_input_expr,
                data: {
                  name: 'input',
                },
              },
            },
          },
        },
      },
    ]
    case 'basic':
    return [
      eYo.T3.Stmt.start_stmt,
      eYo.T3.Expr.shortliteral,
      eYo.T3.Expr.numberliteral,
      eYo.T3.Stmt.builtin_print_stmt,
      {
        type: eYo.T3.Stmt.assignment_stmt,
        input: {
          assigned: {
            input: {
              O: {
                type: eYo.T3.Expr.builtin_input_expr,
                data: {
                  name: 'input',
                },
              },
            },
          },
        },
      },
      // '<xml xmlns:eyo="urn:edython:1.0"><eyo:assignment_stmt><eyo:list eyo:input="assigned"><eyo:builtin_input_expr eyo:input="O"></eyo:builtin_input_expr></eyo:list></eyo:assignment_stmt></xml>', // eYo.T3.Expr.builtin_input_expr,
      eYo.T3.Stmt.assignment_stmt,
      eYo.T3.Expr.term,
      eYo.T3.Expr.u_expr,
      eYo.T3.Expr.m_expr,
      eYo.T3.Expr.a_expr,
      eYo.T3.Expr.power,
    ]
    case 'intermediate':
    return [
      eYo.T3.Expr.parenth_form,
      eYo.T3.Expr.list_display,
      eYo.T3.Expr.set_display,
      eYo.T3.Expr.dict_display,
      eYo.T3.Expr.builtin_object,
      eYo.T3.Stmt.augmented_assignment_stmt,
      eYo.T3.Stmt.import_stmt,
      eYo.T3.Stmt.docstring_top_stmt,
      eYo.T3.Expr.longliteral,
      eYo.T3.Expr.attributeref,
      eYo.T3.Expr.proper_slice,
      eYo.T3.Expr.slicing,
    ]
    case 'advanced':
    return [
      eYo.T3.Expr.any,
      eYo.T3.Stmt.expression_stmt,
      eYo.T3.Stmt.any_stmt,
      eYo.T3.Expr.shift_expr,
      eYo.T3.Expr.and_expr,
      eYo.T3.Expr.xor_expr,
      eYo.T3.Expr.or_expr,
      eYo.T3.Expr.starred_expression,
      eYo.T3.Stmt.del_stmt,
      eYo.T3.Stmt.global_nonlocal_stmt,
      eYo.T3.Expr.lambda,
      eYo.T3.Expr.parenth_target_list,
      eYo.T3.Expr.bracket_target_list,
    ]
    case 'expert':
    return [
      eYo.T3.Expr.builtin_print_expr,
      eYo.T3.Expr.comprehension,
      eYo.T3.Expr.comp_for,
      eYo.T3.Expr.comp_if,
      eYo.T3.Expr.dict_comprehension,
      eYo.T3.Expr.key_datum,
      eYo.T3.Stmt.with_part,
      eYo.T3.Stmt.try_part,
      eYo.T3.Stmt.except_part,
      eYo.T3.Stmt.finally_part,
      eYo.T3.Stmt.assert_stmt,
      eYo.T3.Stmt.raise_stmt,
      eYo.T3.Expr.yield_expression,
      eYo.T3.Stmt.yield_stmt,
    ]
    case 'branching':
    return [
      eYo.T3.Expr.builtin_object,
      eYo.T3.Expr.not_test,
      eYo.T3.Expr.number_comparison,
      eYo.T3.Expr.object_comparison,
      eYo.T3.Expr.or_test,
      eYo.T3.Expr.and_test,
      eYo.T3.Stmt.if_part,
      eYo.T3.Stmt.elif_part,
      eYo.T3.Stmt.else_part,
      eYo.T3.Expr.conditional_expression,
    ]
    case 'looping':
    return [
      eYo.T3.Expr.builtin_object,
      eYo.T3.Expr.not_test,
      eYo.T3.Expr.number_comparison,
      eYo.T3.Expr.object_comparison,
      eYo.T3.Expr.or_test,
      eYo.T3.Expr.and_test,
      eYo.T3.Stmt.while_part,
      { type:eYo.T3.Expr.call_expr, data: {name: 'range'}},
      eYo.T3.Stmt.for_part,
      eYo.T3.Stmt.else_part,
      eYo.T3.Stmt.break_stmt,
      eYo.T3.Stmt.continue_stmt,
    ]
    case 'function':
    return [
      eYo.T3.Expr.call_expr,
      eYo.T3.Stmt.call_stmt,
      eYo.T3.Stmt.funcdef_part,
      eYo.T3.Stmt.return_stmt,
      eYo.T3.Stmt.pass_stmt,
      eYo.T3.Expr.lambda,
      eYo.T3.Stmt.classdef_part,
      eYo.T3.Stmt.decorator,
      eYo.T3.Stmt.docstring_def_stmt,
    ]
    default:
    return []
  }
};
