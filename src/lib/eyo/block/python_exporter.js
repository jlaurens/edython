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

goog.provide('eYo.Py.Exporter')

goog.require('eYo')
goog.require('eYo.XRE')
goog.require('eYo.Slot')
goog.require('eYo.DelegateSvg')
goog.require('eYo.FieldTextInput')

/**
 * Python code generator.
 * For edython.
 * @param {?string} One indentation, defaults to 4 spaces.
 * @constructor
 */
eYo.Py.Exporter = function (oneIndent) {
  this.oneIndent = oneIndent || this.constructor.indent
}

/**
 * Default indentation.
 * For edython.
 */
eYo.Py.Exporter.indent = '    '

/**
 * Indent, must be balanced by a dedent.
 */
eYo.Py.Exporter.prototype.indent_ = function (str) {
  this.indents.push(this.indent)
  this.indent += str || this.oneIndent
}

/**
 * dedent, must be balanced by an indent.
 */
eYo.Py.Exporter.prototype.dedent_ = function () {
  this.indent = this.indents.pop()
}

/**
 * Insert a newline_ array.
 */
eYo.Py.Exporter.prototype.newline_ = function (block) {
  if (block) {
    this.line.push(this.wasColon ? ' ' : '; ')
  } else {
    this.line && this.lines.push(this.line.join(''))
    this.line = [this.indent]
  }
  this.isFirst = true
  this.shouldSeparateField = false
  this.wasSeparatorField = false
  this.wasColon = false
  this.wasContinue = false
  this.wasLeftParenth = false
  this.wasRightParenth = false
}

/**
 * Convert the block to python code.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {?Object} opt  See the eponym parameter in `eYo.Xml.domToBlock`.
 * @return some python code
 */
eYo.Py.Exporter.prototype.exportAsExpression_ = function (block, opt) {
  var eyo = block.eyo
  if (eyo.async) {
    if (!this.isSeparatorField && !this.wasSeparatorField  && this.shouldSeparateField && !this.starSymbol) {
      // add a separation
      this.line.push(' ')
    }
    this.line.push('async ')
    this.shouldSeparateField = false
  } else if (eyo.await) {
    if (!this.isSeparatorField && !this.wasSeparatorField  && this.shouldSeparateField && !this.starSymbol) {
      // add a separation
      this.line.push(' ')
    }
    this.line.push('await ')
    this.shouldSeparateField = false
  } else if (eyo.parenth_p) {
    this.line.push('(')
  }
  if (eyo instanceof eYo.DelegateSvg.Expr.primary) {
    if (eyo.dotted_p === 0 && eyo.target_p === 'print' && eyo.variant_p === eYo.Key.CALL_EXPR) {
      this.use_print = true
    }
  } else if (eyo instanceof eYo.DelegateSvg.Stmt.call_stmt) {
    if (eyo.dotted_p === 0 && eyo.target_p === 'print') {
      this.use_print = true
    }
  } else if (eyo instanceof eYo.DelegateSvg.Stmt.builtin__print_stmt) {
    this.use_print = true
  } else if (eyo instanceof eYo.DelegateSvg.Expr.builtin__print_expr) {
    this.use_print = true
  }
  if (block.type === eYo.T3.Stmt.import_stmt && !block.disabled) {
    var importedModules = eyo.importedModules
    if (importedModules && importedModules['turtle']) {
      this.use_turtle = true
    }
  }
  var field, slot
  if ((field = eyo.fieldAtStart)) {
    do {
      this.exportField_(field, opt)
    } while ((field = field.eyo.nextField))
  }
  if ((slot = eyo.slotAtHead)) {
    do {
      this.exportSlot_(slot, opt)
    } while ((slot = slot.next))
  } else {
    // list blocks
    block.eyo.consolidate()
    block.eyo.forEachInput(input => {
      this.exportInput_(input, opt)
    })
  }
  if ((field = eyo.toEndField)) {
    do {
      this.exportField_(field, opt)
    } while ((field = field.eyo.nextField))
  }
  if (eyo.orphan_comma_p) {
    this.line.push(',')
  }
  if (eyo.parenth_p) {
    this.line.push(')')
  }
}

/**
 * Convert the block to python code.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {?Object} opt  flags, `is_deep` whether next blocks should be exported too.
 * @return some python code
 */
eYo.Py.Exporter.prototype.exportBlock_ = function (block, opt) {
  var eyo = block.eyo
  var is_deep = !eyo.isControl && opt.is_deep
  if (!block.outputConnection) {
    if (block.disabled) {
      this.indent_('# ')
      this.line.push('# ')
    }
  }
  this.exportAsExpression_(block, opt)
  var c8n, target
  if ((c8n = eyo.rightStmtConnection)) {
    this.exportField_(c8n.eyo.fields.label)
  }
  if ((c8n = eyo.suiteStmtConnection)) {
    var f = () => {
      if ((target = c8n.targetBlock())) {
        eYo.Do.tryFinally(() => {
          opt.is_deep = true
          this.newline_(target)
          this.exportBlock_(target, opt)
        }, () => {
          opt.is_deep = is_deep
        })
      } else if ((c8n = eyo.rightStmtConnection) && (target = c8n.targetBlock())) {
        this.exportBlock_(target, opt)
      } else {
        this.newline_()
        this.line.push('<MISSING STATEMENT>')
        this.missing_statements.push(c8n)
      }
    }
    if (block.eyo.isControl) {
      f()
    } else {
      eYo.Do.makeWrapper(() => {
        this.indent_()
      }, () => {
        this.dedent_()
      })(f)
    }
  } else if ((c8n = eyo.rightStmtConnection)) {
    if ((target = c8n.targetBlock())) {
      this.exportBlock_(target, opt)
    }
  }
  if (!block.outputConnection) {
    if (block.disabled) {
      this.dedent_()
    }
  }
  if (is_deep && (target = block.eyo.nextBlock)) {
    this.newline_(target)
    this.exportBlock_(target, opt)
  }  
}

/**
 * Convert the block to python code.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {?Object} opt  flags, `is_deep` whether next blocks should be exported too.
 * @return some python code
 */
eYo.Py.Exporter.prototype.export = function (block, opt) {
  this.line = undefined
  this.lines = []
  this.indents = []
  this.indent = ''
  this.depth = 0
  this.use_print = false
  this.use_turtle = false
  opt = opt || {}
  this.missing_statements = []
  this.missing_expressions = []
  this.newline_()
  eYo.Events.groupWrap(() => {
    eYo.Do.tryFinally(() => {
      ++this.depth
      this.expression = []
      this.exportBlock_(block, opt)
    }, () => {
      --this.depth
    })
  })
  if (!this.depth) {
    this.newline_()
    return this.lines.join('\n')
  } else {
    console.error('UNEXPECTED DEPTH', this.depth)
  }
}

/**
 * Export the field, which must be defined.
 *
 * @param {!Blockly.Field}
 * @private
 */
eYo.Py.Exporter.prototype.exportField_ = function (field) {
  if (field.isVisible()) {
    var text = (field.getPythonText_ && field.getPythonText_()) || field.getText()
    var eyo = field.eyo
    if (!text.length) {
      var d = eyo.data
      if (d) {
        if (goog.isDef(d.model.python)) {
          text = eYo.Do.valueOf(d.model.python, d) || ''
        } else if (!eyo.optional_ && goog.isDef(d.model.placeholder)) {
          text = eYo.Do.valueOf(d.model.placeholder, d) || ''
        }
      }
    }
    if (text.length) {
      this.isSeparatorField = field.name === 'separator' || (eyo.model && eyo.model.separator)
      // if the text is void, it can not change whether
      // the last character was a letter or not
      var head = text[0]
      if (text === ':=') {
        this.line.push(' ')
      } else if (this.wasRightParenth) {
        // do not always add white space
        if (eYo.XRE.id_continue.test(head)) {
          this.line.push(' ')
        }
      } else if (this.wasColon && (eYo.XRE.id_continue.test(head) || head === '[')) {
        // add a separation
        this.line.push(' ')
      } else if (!this.isSeparatorField && !this.wasSeparatorField  && this.shouldSeparateField && !this.starSymbol && text !== '**' && (eYo.XRE.operator.test(head) || head === '.' || eYo.XRE.id_continue.test(head))) {
        // add a separation
        this.line.push(' ')
      }
      this.line.push(text)
      var isContinue = eYo.XRE.tail_continue.test(text) // what about surrogate pairs ?
      var tail = text[text.length - 1]
      this.wasColon = tail === ':'
      this.shouldSeparateField = isContinue ||
      eYo.XRE.operator.test(tail) ||
      tail === ';' ||
      tail === ',' ||
      (tail === '.' && !(field instanceof eYo.FieldTextInput))
      this.starSymbol = ((this.isFirst || !this.wasContinue || this.wasLeftParenth) && (['*', '@', '+', '-', '~', '.'].indexOf(text) >= 0)) || text === '**'
      this.isFirst = false
      this.wasSeparatorField = this.isSeparatorField
      this.isSeparatorField = false
      this.wasRightParenth = tail === ')'
      this.wasLeftParenth = tail === '('
      this.wasContinue = isContinue
    }
  }
}

/**
 * Export the given slot in.
 * @param {Blockly.Input} input
 * @param {Object} input
 * @private
 */
eYo.Py.Exporter.prototype.exportInput_ = function (input, opt) {
  if (input && input.isVisible()) {
    var c8n = input.connection
    if (c8n) {
      var target = c8n.targetBlock()
      if (target) {
        this.exportAsExpression_(target)
      } else if (!c8n.eyo.optional_ && !c8n.eyo.disabled_ && !c8n.eyo.s7r_ && !input.eyo.bindField) {
        console.error('BREAK HERE')
        this.shouldSeparateField && this.line.push(' ')
        this.line.push('<MISSING INPUT>')
        this.shouldSeparateField = true
        // NEWLINE
        this.missing_expressions.push(c8n)
      } else {
        input.fieldRow.forEach(f => this.exportField_(f))
      }
    }
  } 
}

/**
 * Export the given slot in.
 * @param {eYo.Slot} slot
 * @private
 */
eYo.Py.Exporter.prototype.exportSlot_ = function (slot) {
  if (slot.isIncog()) {
    return
  }
  var bindField
  if ((bindField = slot.bindField)) {
    var c8n = slot.connection
    bindField.setVisible(!c8n || !c8n.eyo.unwrappedTargetBlock)
  }
  var field
  if ((field = slot.fieldAtStart)) {
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

/**
 * Get the text from this field for use in python code.
 * @return {string} text.
 * @private
 * @suppress{accessControls}
 */
Blockly.Field.prototype.getPythonText_ = Blockly.Field.prototype.getText

Object.defineProperties(eYo.Delegate.prototype, {
  toString: {
    get () {
      return new eYo.Py.Exporter().export(this.block_, {is_deep: true})
    }
  },
  toLinearString: {
    get () {
      var s = this.toString
      return s.replace(/(?:\r\n|\r|\n)/g, ';')
    }
  }
})