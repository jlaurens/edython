/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview General python support.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.PythonExporter')

goog.require('eYo')
goog.require('eYo.Slot')
goog.require('eYo.DelegateSvg')
goog.require('eYo.FieldTextInput')

/**
 * Python code generator.
 * For edython.
 * @param {?string} One indentation, defaults to 4 spaces.
 * @constructor
 */
eYo.PythonExporter = function (oneIndent = '    ') {
  this.lines = []
  this.indents = []
  this.indent = ''
  this.oneIndent = oneIndent
}

/**
 * Indent, must be balanced by a dedent.
 */
eYo.PythonExporter.prototype.indent_ = function () {
  this.indents.push(this.indent)
  this.indent += this.oneIndent
}

/**
 * dedent.
 */
eYo.PythonExporter.prototype.dedent_ = function () {
  this.indent = this.indents.pop()
}

/**
 * Insert a newline_ array.
 */
eYo.PythonExporter.prototype.newline_ = function () {
  this.line && this.lines.push(this.line.join(''))
  this.line = [this.indent]
  this.isFirst = true
  this.shouldSeparateField = false
}

/**
 * Convert the block to python code.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @return some python code
 */
eYo.PythonExporter.prototype.exportExpression_ = function (block) {
  var field, input, slot
  if ((field = block.eyo.fromStartField)) {
    do {
      this.exportField_(field)
    } while ((field = field.eyo.nextField))
  }
  if ((slot = block.eyo.headSlot)) {
    do {
      this.exportSlot_(slot)
    } while ((slot = slot.next))
  } else {
    // list blocks
    block.eyo.consolidate(block)
    var e8r = block.eyo.inputEnumerator(block)
    while (e8r.next()) {
      if (e8r.here !== block.eyo.inputSuite) {
        this.exportInput_(e8r.here)
      }
    }
  }
  if ((field = block.eyo.toEndField)) {
    do {
      this.exportField_(field)
    } while ((field = field.eyo.nextField))
  }

}

/**
 * Convert the block to python code.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {boolean} is_deep whether next blocks should be exported too.
 * @return some python code
 */
eYo.PythonExporter.prototype.export = function (block, is_deep) {
  this.newline_()

  this.expression = []
  var field, input, slot
  
  this.exportExpression_(block)

  if ((input = block.eyo.inputSuite)) {
    try {
      this.indent_()
      var target = input.connection.targetBlock()
      if (target) {
        this.export(target, true)
      } else {
        this.newline_()
        this.line.push('MISSING STATEMENT')
      }
    } finally {
      this.dedent_()
    }
  }
  if (is_deep && block.nextConnection && (target = block.nextConnection.targetBlock())) {
    this.export(target, true)
  }
  if (!this.indents.length) {
    this.newline_()
    return this.lines.join('\n')
  }
}

/**
 * Export the field, which must be defined.
 *
 * @param {!Blockly.Field}
 * @private
 */
eYo.PythonExporter.prototype.exportField_ = function (field) {
  if (field.isVisible()) {
    var text = field.getDisplayText_()
    var eyo = field.eyo
    if (text.length) {
      // if the text is void, it can not change whether
      // the last character was a letter or not
      if (this.shouldSeparateField && !this.starSymbol && (eYo.XRE.operator.test(text[0]) || text[0] === '.' || eYo.XRE.id_continue.test(text[0]) || eyo.isEditing)) {
        // add a separation
        this.line.push(' ')
      }
      this.line.push(text)
      this.shouldSeparateField = eYo.XRE.id_continue.test(text[text.length - 1]) ||
      eYo.XRE.operator.test(text[text.length - 1]) ||
      text[text.length - 1] === ':' ||
      (text[text.length - 1] === '.' && !(field instanceof eYo.FieldTextInput))
      this.starSymbol = (this.isFirst && (['*', '@', '+', '-', '~', '.'].indexOf(text[text.length - 1]) >= 0))
      this.isFirst = false
    }
  }
}

/**
 * Export the given slot in.
 * @param {Blockly.Input} input
 * @private
 */
eYo.PythonExporter.prototype.exportInput_ = function (input) {
  if (input && input.isVisible() && !input.eyo.disabled_ && input.connection) {
    var c8n = input.connection
    var target = c8n.targetBlock()
    if (target) {
      this.exportExpression_(target)
    } else if (!c8n.eyo.optional_ && !c8n.eyo.disabled_ && !c8n.eyo.s7r_) {
      this.line.push('<MISSING EXPRESSION>')
      // NEWLINE
    } else {
      for (var j = 0, field; (field = input.fieldRow[j++]);) {
        this.exportField_(field)
      }
    }
  }
}

/**
 * Export the given slot in.
 * @param {eYo.Slot} slot
 * @private
 */
eYo.PythonExporter.prototype.exportSlot_ = function (slot) {
  if (slot.isIncog()) {
    return
  }
  var field, input
  if ((field = slot.fromStartField)) {
    do {
      this.exportField_(field)
    } while ((field = field.eyo.nextField))
  }
  this.exportInput_(slot.input)
  if ((field = slot.toEndField)) {
    do {
      this.exportField_(field)
    } while ((field = field.eyo.nextField))
  }
}