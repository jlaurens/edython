/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview General python support.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('eYo')

eYo.require('eYo.Field')

eYo.require('eYo.ns.Brick')
eYo.provide('eYo.Py.Exporter')

eYo.forwardDeclare('eYo.XRE')
eYo.forwardDeclare('eYo.Slot')

/**
 * Python code generator.
 * For edython.
 * @param {string} [One] indentation, defaults to 4 spaces.
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
eYo.Py.Exporter.prototype.newline_ = function () {
  this.line && (this.lines.push(this.line.join('')))
  this.lineShouldAddBoard = false
  this.line = [this.indent]
  this.isFirst = true
  this.shouldSeparateField = false
  this.wasSeparatorField = false
  this.wasColon = false
  this.wasContinue = false
  this.wasLeftParenth = false
  this.wasRightParenth = false
}

/**
 * Add a space to the line.
 * For edython.
 * @param {String} s  the string to be appended to the line.
 */
eYo.Py.Exporter.prototype.addBoard = function () {
  this.line.length > 1 && (this.lineShouldAddBoard = true) // this line contains at least one indentation string
}

/**
 * Add some string material to the line.
 * For edython.
 * @param {String} s  the string to be appended to the line.
 */
eYo.Py.Exporter.prototype.linePush = function (s) {
  if (this.lineShouldAddBoard) {
    this.lineShouldAddBoard = false
    this.line.push(' ')
  }
  this.line.push(s)
}

/**
 * Convert the brick to python code.
 * For edython.
 * @param {eYo.ns.Brick.Dflt} brick The owner of the receiver, to be converted to python.
 * @param {Object} [opt]  See the eponym parameter in `eYo.Xml.domToBrick`.
 * @return some python code
 */
eYo.Py.Exporter.prototype.exportAsExpression_ = function (brick, opt) {
  if (brick.async_) {
    if (!this.isSeparatorField && !this.wasSeparatorField  && this.shouldSeparateField && !this.starSymbol) {
      // add a separation
      this.addBoard()
    }
    this.linePush('async ')
    this.shouldSeparateField = false
  } else if (brick.await) {
    if (!this.isSeparatorField && !this.wasSeparatorField  && this.shouldSeparateField && !this.starSymbol) {
      // add a separation
      this.addBoard()
    }
    this.linePush('await ')
    this.shouldSeparateField = false
  } else if (brick.parenth_p) {
    this.linePush('(')
  }
  if (brick instanceof eYo.Expr.primary) {
    if (brick.dotted_p === 0 && brick.target_p === 'print' && brick.variant_p === eYo.Key.CALL_EXPR) {
      this.use_print = true
    }
  } else if (brick instanceof eYo.Stmt.call_stmt) {
    if (brick.dotted_p === 0 && brick.target_p === 'print') {
      this.use_print = true
    }
  }
  if (brick.type === eYo.T3.Stmt.import_stmt && !brick.disabled) {
    var importedModules = brick.importedModules
    if (importedModules && importedModules['turtle']) {
      this.use_turtle = true
    }
  }
  var field, slot
  if ((field = brick.fieldAtStart)) {
    do {
      this.exportField_(field, opt)
    } while ((field = field.nextField))
  }
  if ((slot = brick.slotAtHead)) {
    do {
      this.exportSlot_(slot, opt)
    } while ((slot = slot.next))
  }
  if ((field = brick.toEndField)) {
    do {
      this.exportField_(field, opt)
    } while ((field = field.nextField))
  }
  if (brick.orphan_comma_p) {
    this.linePush(',')
  }
  if (brick.parenth_p) {
    this.linePush(')')
  }
}

/**
 * Convert the brick to python code.
 * For edython.
 * @param {eYo.ns.Brick.Dflt} eyo The owner of the receiver, to be converted to python.
 * @param {Object} [opt]  flags, `is_deep` whether next bricks should be exported too.
 * @return some python code
 */
eYo.Py.Exporter.prototype.exportBrick_ = function (brick, opt) {
  var is_deep = !brick.isControl && opt.is_deep
  if (!brick.out_m) {
    if (brick.disabled) {
      this.indent_('# ')
      this.linePush('# ')
    }
  }
  this.exportAsExpression_(brick, opt)
  var m4t, rightM4t, t9k
  if ((rightM4t = brick.right_m) && (t9k = rightM4t.targetBrick)) {
    this.exportField_(rightM4t.label_f)
    this.exportBrick_(t9k, opt)
  } else if ((m4t = brick.suite_m)) {
    // a brick with a suite must also have a right connection
    this.exportField_(rightM4t.label_f)
    var f = () => {
      if ((t9k = m4t.targetBrick)) {
        eYo.Do.tryFinally(() => {
          opt.is_deep = true
          this.newline_()
          this.exportBrick_(t9k, opt)
        }, () => {
          opt.is_deep = is_deep
        })
      } else {
        this.newline_()
        this.linePush('<MISSING STATEMENT>')
        this.missing_statements.push(m4t)
      }
    }
    if (brick.isControl) {
      f()
    } else {
      eYo.Do.makeWrapper(() => {
        this.indent_()
      }, () => {
        this.dedent_()
      })(f)
    }
  } else if ((m4t = brick.right_m)) {
    if ((t9k = m4t.targetBrick)) {
      this.exportField_(m4t.label_f)
      this.exportBrick_(t9k, opt)
    }
  }
  if (!brick.out_m) {
    if (brick.disabled) {
      this.dedent_()
    }
  }
  if (is_deep && (t9k = brick.foot)) {
    this.newline_()
    this.exportBrick_(t9k, opt)
  }
}

/**
 * Convert the brick to python code.
 * For edython.
 * @param {eYo.ns.Brick.Dflt} brick The owner of the receiver, to be converted to python.
 * @param {Object} [opt]  flags, `is_deep` whether next bricks should be exported too.
 * @return some python code
 */
eYo.Py.Exporter.prototype.export = function (brick, opt) {
  this.line = eYo.NA
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
      this.exportBrick_(brick, opt)
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
 * @param {eYo.Field}
 * @private
 */
eYo.Py.Exporter.prototype.exportField_ = function (field) {
  if (field.visible) {
    var text = field.getPythonText_()
    if (!text.length) {
      var d = field.data
      if (d) {
        if (goog.isDef(d.model.python)) {
          text = eYo.Do.valueOf(d.model.python, d) || ''
        } else if (!field.optional_ && goog.isDef(d.model.placeholder)) {
          text = eYo.Do.valueOf(d.model.placeholder, d) || ''
        }
      }
    }
    if (text.length) {
      this.isSeparatorField = field.name === 'separator' || (field.model && field.model.separator)
      // if the text is void, it can not change whether
      // the last character was a letter or not
      var head = text[0]
      if (text === ':=') {
        this.addBoard()
      } else if (this.wasRightParenth) {
        // do not always add white space
        if (eYo.XRE.id_continue.test(head)) {
          this.addBoard()
        }
      } else if (this.wasColon && (eYo.XRE.id_continue.test(head) || head === '[')) {
        // add a separation
        this.addBoard()
      } else if (!this.isSeparatorField && !this.wasSeparatorField  && this.shouldSeparateField && !this.starSymbol && text !== '**' && (eYo.XRE.operator.test(head) || head === '.' || eYo.XRE.id_continue.test(head))) {
        // add a separation
        this.addBoard()
      } else if (field.isLabel && eYo.XRE.id_continue.test(head)) {
        // add a separation here too
        this.addBoard()
      }
      this.linePush(text)
      var isContinue = eYo.XRE.tail_continue.test(text) // what about surrogate pairs ?
      var tail = text[text.length - 1]
      this.wasColon = tail === ':'
      this.shouldSeparateField = isContinue ||
      eYo.XRE.operator.test(tail) ||
      tail === ';' ||
      tail === ',' ||
      (tail === '.' && (!(field instanceof eYo.FieldInput)))
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
 * @param {eYo.Slot} slot
 * @param {Object} opt
 * @private
 */
eYo.Py.Exporter.prototype.exportSlot_ = function (slot, opt) {
  if (slot && slot.visible) {
    var m4t = slot.magnet
    if (m4t) {
      var t9k = m4t.targetBrick
      if (t9k) {
        this.exportAsExpression_(t9k)
      } else if (!m4t.optional_ && !m4t.disabled_ && !m4t.s7r_ && !slot.bindField) {
        console.error('BREAK HERE')
        this.shouldSeparateField && (this.addBoard())
        this.linePush('<MISSING INPUT>')
        this.shouldSeparateField = true
        // NEWLINE
        this.missing_expressions.push(m4t)
      } else {
        slot.fieldRow.forEach(f => this.exportField_(f))
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
  if (slot.incog) {
    return
  }
  var bindField
  if ((bindField = slot.bindField)) {
    var m4t = slot.magnet
    bindField.visible = !m4t || !m4t.unwrappedTarget
  }
  var field
  if ((field = slot.fieldAtStart)) {
    do {
      this.exportField_(field)
    } while ((field = field.nextField))
  }
  this.exportMagnet_(slot.magnet)
  var m4t = slot.magnet
  if (m4t) {
    var t9k = m4t.targetBrick
    if (t9k) {
      this.exportAsExpression_(t9k)
    }
  }
  if ((field = slot.toEndField)) {
    do {
      this.exportField_(field)
    } while ((field = field.nextField))
  }
}

Object.defineProperties(eYo.ns.Brick.Dflt.prototype, {
  toString: {
    get () {
      return new eYo.Py.Exporter().export(this, {is_deep: true})
    }
  },
  toLinearString: {
    get () {
      var s = this.toString
      return s.replace(/(?:\r\n|\r|\n)/g, '\\n')
    }
  }
})

/**
 * Get the text from this field for use in python code.
 * @return {string} text.
 * @private
 * @suppress{accessControls}
 */
eYo.Field.prototype.getPythonText_ = function() {
  return this.text
}

/**
 * Get the text from this field to be use in python code.
 * @return {string} text.
 * @private
 * @suppress{accessControls}
 */
eYo.FieldInput.prototype.getPythonText_ = function () {
  if (this.model.variable) {
    var candidate = this.text_ || ''
    return !XRegExp.match(candidate, /\s/) && candidate || (!this.optional_ && '<MISSING NAME>')  
  }
  var t = eYo.FieldInput.superClass_.getPythonText_.call(this)
  if (!t.length && !this.optional_) {
    if (!this.model.canEmpty && (this.placeholder || (this.data && this.data.placeholder))) {
      var t = `<missing ${this.getPlaceholderText().trim()}>`.toUpperCase()
      return t
    }
  }
  return t
}
