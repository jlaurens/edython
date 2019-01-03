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

goog.provide('eYo.DelegateSvg.Stmt')

goog.require('eYo.XRE')
goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Operator')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.makeSubclass('Stmt', {
  data: {
    comment: {
      order: 1000000,
      init: '',
      placeholder: eYo.Msg.Placeholder.COMMENT,
      validate: /** @suppress {globalThis} */ function (newValue) {
        return {validated: XRegExp.exec(newValue, eYo.XRE.comment).value || ''}
      },
      synchronize: true,
      placeholderText: eYo.Msg.Placeholder.COMMENT,
      didLoad: /** @suppress {globalThis} */ function () {
        this.owner.comment_variant_p = this.isRequiredFromSaved() ? eYo.Key.COMMENT : eYo.Key.NONE
      }
    },
    comment_variant: { // variant are very useful with undo/redo
      NONE: eYo.Key.NONE,
      COMMENT: eYo.Key.COMMENT,
      order: 1000001, // initialization comes last
      all: [eYo.Key.NONE, eYo.Key.COMMENT],
      init: eYo.Key.NONE,
      xml: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        this.owner.comment_d.required = newValue === eYo.Key.COMMENT
        this.owner.comment_d.setIncog()
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.set(this.owner.comment_d.isIncog() ? eYo.Key.NONE : eYo.Key.COMMENT)
      }
    }
  },
  slots: {
    comment: {
      order: 1000001,
      fields: {
        label: {
          order: 0,
          value: '#',
          css: 'reserved'
        },
        bind: {
          order: 1,
          validate: true,
          endEditing: true,
          css: 'comment'
        }
      }    
    }
  }
})
eYo.Delegate.Manager.registerAll(eYo.T3.Stmt, eYo.DelegateSvg.Stmt, true)

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * @extends {Blockly.Block}
 * @constructor
 */
eYo.DelegateSvg.Stmt.prototype.postInitSvg = function () {
  if (this.svgSharpGroup_) {
    return
  }
  eYo.DelegateSvg.Stmt.superClass_.postInitSvg.call(this)
  var block = this.block_
  goog.asserts.assert(this.svgPathContour_, 'Missing svgPathContour_')
  this.svgSharpGroup_ = Blockly.utils.createSvgElement('g',
    {'class': 'eyo-sharp-group'}, null)
  goog.dom.insertSiblingAfter(this.svgSharpGroup_, this.svgPathContour_)
  goog.dom.classlist.add(this.svgShapeGroup_, 'eyo-stmt')
  goog.dom.classlist.add(this.svgContourGroup_, 'eyo-stmt')
}

/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects...
 * @protected
 */
eYo.DelegateSvg.Stmt.prototype.disposeInternal = function () {
  goog.dom.removeNode(this.svgSharpGroup_)
  this.svgSharpGroup_ = undefined
  eYo.DelegateSvg.superClass_.disposeInternal.call(this)
}

/**
 * True for statement blocks only.
 */
eYo.DelegateSvg.Stmt.prototype.isStmt = true

/**
 * Statement block path.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.Stmt.prototype.statementPathDef_ = function () {
  return eYo.Shape.definitionWithBlock(this)
} /* eslint-enable indent */

eYo.DelegateSvg.Stmt.prototype.shapePathDef_ =
  eYo.DelegateSvg.Stmt.prototype.contourPathDef_ =
    eYo.DelegateSvg.Stmt.prototype.selectPathDef_ =
      eYo.DelegateSvg.Stmt.prototype.statementPathDef_

/**
 * Statement block path.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.Stmt.prototype.hilightPathDef_ = function () {
  return eYo.Shape.definitionWithBlock(this, {dido: true})
} /* eslint-enable indent */

/**
 * Render the leading # character for disabled statement blocks.
 * @param io
 * @private
 * @override
 */
eYo.DelegateSvg.Stmt.prototype.renderDrawSharp_ = function (io) {
  if (io.block.disabled) {
    var children = goog.dom.getChildren(this.svgSharpGroup_)
    var length = children.length
    if (!length) {
      var y = eYo.Font.totalAscent
      var text = Blockly.utils.createSvgElement('text',
        {'x': 0, 'y': y},
        this.svgSharpGroup_)
      this.svgSharpGroup_.appendChild(text)
      text.appendChild(document.createTextNode('#'))
      length = 1
    }
    var expected = io.block.eyo.getStatementCount()
    while (length < expected) {
      y = eYo.Font.totalAscent + length * eYo.Font.lineHeight
      text = Blockly.utils.createSvgElement('text',
        {'x': 0, 'y': y},
        this.svgSharpGroup_)
      this.svgSharpGroup_.appendChild(text)
      text.appendChild(document.createTextNode('#'))
      ++length
    }
    while (length > expected) {
      text = children[--length]
      this.svgSharpGroup_.removeChild(text)
    }
    this.svgSharpGroup_.setAttribute('transform', 'translate(' + (io.cursor.x) +
        ', ' + eYo.Padding.t + ')')
    io.cursor.c += 2
    io.common.startOfLine = io.common.startOfStatement = false
  } else {
    goog.dom.removeChildren(this.svgSharpGroup_)
  }
}

/**
 * Render one input of value block.
 * @param io
 * @private
 */
eYo.DelegateSvg.Stmt.prototype.renderDrawInput_ = function (io) {
  this.renderDrawValueInput_(io)
}

/**
 * Render the inputs of the block.
 * @param {!Blockly.Block} block
 * @protected
 */
eYo.DelegateSvg.Stmt.prototype.minBlockW = function () {
  return eYo.Font.tabW
}

console.error('workspace cancel last gesture?')

/**
 * Insert a block above.
 * If the block's previous connection is connected,
 * connects the block above to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {!Block} block
 * @param {string} prototypeName
 * @param {string} parentInputName, which parent's connection to use
 * @return the created block
 */
eYo.DelegateSvg.Stmt.prototype.insertParentWithModel = function (model) {
  var block = this.block_
  var c8n = block.previousConnection
  if (c8n) {
    var parentBlock
    eYo.Events.disableWrap(
      () => {
        parentBlock = eYo.DelegateSvg.newBlockReady(block.workspace, model)
      },
      () => {
        if (parentBlock) {
          var parentC8n = parentBlock.nextConnection
          if (parentC8n && c8n.checkType_(parentC8n)) {
            eYo.Events.groupWrap(
              () => {
                eYo.Events.fireBlockCreate(parentBlock)
                var targetC8n = c8n.targetConnection
                if (targetC8n) {
                  targetC8n.disconnect()
                  if (parentBlock.previousConnection) {
                    targetC8n.connect(parentBlock.previousConnection)
                  }
                } else {
                  var its_xy = block.getRelativeToSurfaceXY()
                  var my_xy = parentBlock.getRelativeToSurfaceXY()
                  parentBlock.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y)
                }
                var holes = eYo.HoleFiller.getDeepHoles(parentBlock)
                eYo.HoleFiller.fillDeepHoles(parentBlock.workspace, holes)
                parentBlock.render()
                c8n.connect(parentC8n)
                if (Blockly.selected === block) {
                  parentBlock.select()
                }
              }
            )
          } else {
            parentBlock.dispose(true)
            parentBlock = undefined
          }
        }    
      }
    )
    return parentBlock
  }
}

/**
 * Insert a block below.
 * If the block's next connection is connected,
 * connects the block below to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {!Block} block
 * @param {string} prototypeName
 * @param {string} parentInputName, which parent's connection to use
 * @return the created block
 */
eYo.DelegateSvg.Stmt.prototype.insertBlockAfter = function (belowPrototypeName) {
  return eYo.Events.groupWrap(
    () => {
      var block = this.block_
      var blockAfter = eYo.DelegateSvg.newBlockReady(block.workspace, belowPrototypeName)
      var c8n = block.nextConnection
      var targetC8n = c8n.targetConnection
      if (targetC8n) {
        targetC8n.disconnect()
        if (targetC8n.checkType_(blockAfter.nextConnection)) {
          targetC8n.connect(blockAfter.nextConnection)
        }
      }
      var holes = eYo.HoleFiller.getDeepHoles(blockAfter)
      eYo.HoleFiller.fillDeepHoles(blockAfter.workspace, holes)
      blockAfter.render()
      block.nextConnection.connect(blockAfter.previousConnection)
      if (Blockly.selected === block) {
        blockAfter.select()
      }
      return blockAfter
    }
  )
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.prototype.populateContextMenuComment = function (mgr) {
  var block = this.block_
  var show = !this.comment_d.isIncog()
  var content =
  eYo.Do.createSPAN(show ? eYo.Msg.Placeholder.REMOVE_COMMENT : eYo.Msg.Placeholder.ADD_COMMENT, null)
  var menuItem = mgr.newMenuItem(content, block.eyo.doAndRender( function () {
    this.comment_d.setIncog(show)
  }))
  mgr.addChild(menuItem, true)
  return true
}

/// /////// gobal/nonlocal statement
/**
 * Class for a DelegateSvg, non_void_identifier_list block.
 * This block may be wrapped.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.List.makeSubclass(eYo.T3.Expr.non_void_identifier_list, {
  list: {
    check: eYo.T3.Expr.Check.non_void_identifier_list,
    presep: ',',
    mandatory: 1
  }
})

/**
 * Class for a DelegateSvg, global_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass(eYo.T3.Stmt.global_stmt, {
  data: {
    variant: {
      all: [
        eYo.Key.PASS,
        eYo.Key.CONTINUE,
        eYo.Key.BREAK,
        eYo.Key.GLOBAL,
        eYo.Key.NONLOCAL,
        eYo.Key.DEL,
        eYo.Key.RETURN
      ],
      init: eYo.Key.PASS,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var O = this.owner
        O.identifiers_s.setIncog(newValue !== eYo.Key.GLOBAL && newValue !== eYo.Key.NONLOCAL)
        O.del_s.setIncog(newValue !== eYo.Key.DEL)
        O.ans_s.setIncog(newValue !== eYo.Key.RETURN)
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
        },
        load: /** @suppress {globalThis} */ function (element) {
          this.owner.variant_p = element.getAttribute(eYo.Key.EYO)
        }
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        this.set({
          [eYo.T3.Stmt.pass_stmt]: eYo.Key.PASS,
          [eYo.T3.Stmt.continue_stmt]: eYo.Key.CONTINUE,[eYo.T3.Stmt.break_stmt]: eYo.Key.BREAK,
          [eYo.T3.Stmt.global_stmt]: eYo.Key.GLOBAL,
          [eYo.T3.Stmt.nonlocal_stmt]: eYo.Key.NONLOCAL,
          [eYo.T3.Stmt.del_stmt]: eYo.Key.DEL,
          [eYo.T3.Stmt.return_stmt]: eYo.Key.RETURN
        } [type])
      }
    }
  },
  fields: {
    variant: {
      css: 'reserved'
    }
  },
  slots: {
    identifiers: {
      order: 1,
      wrap: eYo.T3.Expr.non_void_identifier_list
    },
    del: {
      order: 2,
      wrap: eYo.T3.Expr.target_list
    },
    ans: {
      order: 3,
      wrap: eYo.T3.Expr.optional_expression_list
    }
  }
})

var names = [
  'pass',
  'continue',
  'break',
  'nonlocal',
  'del',
  'return'
]
names.forEach((k) => {
  k = k + '_stmt'
  eYo.DelegateSvg.Stmt[k] = eYo.DelegateSvg.Stmt.global_stmt
  eYo.DelegateSvg.Manager.register(k)  
})

/**
 * The type and connection depend on the properties modifier, value and variant.
 * For edython.
 */
eYo.DelegateSvg.Stmt.global_stmt.prototype.getType = eYo.Decorate.onChangeCount(
  'getType',
  function () {
    this.setupType(
      {
        [eYo.Key.PASS]: eYo.T3.Stmt.pass_stmt,
        [eYo.Key.CONTINUE]: eYo.T3.Stmt.continue_stmt,
        [eYo.Key.BREAK]: eYo.T3.Stmt.break_stmt,
        [eYo.Key.GLOBAL]: eYo.T3.Stmt.global_stmt,
        [eYo.Key.NONLOCAL]: eYo.T3.Stmt.nonlocal_stmt,
        [eYo.Key.DEL]: eYo.T3.Stmt.del_stmt,
        [eYo.Key.RETURN]: eYo.T3.Stmt.return_stmt
      } [this.variant_p]
    )
    return this.type
  }
)

/**
 * The xml `eyo` attribute of this block, as it should appear in the saved data.
 * For edython.
 * @return true if the given value is accepted, false otherwise
 */
eYo.DelegateSvg.Stmt.global_stmt.prototype.xmlAttr = function () {
  return this.variant_p
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.global_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  var block = this.block_
  var current = this.variant_p
  var variants = this.variant_d.getAll()
  var F = (i) => {
    var key = variants[i]
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN(key, 'eyo-code-reserved')
    )
    var menuItem = mgr.newMenuItem(content, () => {
      this.variant_p = key
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(0)
  F(1)
  F(2)
  mgr.shouldSeparate()
  F = (i) => {
    var key = variants[i]
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN(key, 'eyo-code-reserved'),
      eYo.Do.createSPAN(' …', 'eyo-code-placeholder')
    )
    var menuItem = mgr.newMenuItem(content, () => {
      this.variant_p = key
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(3)
  F(4)
  F(5)
  F(6)
  mgr.shouldSeparate()
  return eYo.DelegateSvg.Stmt.global_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
}

/**
 * Class for a DelegateSvg, docstring_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('docstring_stmt', {
  link: eYo.T3.Expr.longliteral
}, true)

/**
 * docstring blocks are white, to be confirmed.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
eYo.DelegateSvg.Stmt.docstring_stmt.prototype.isWhite = function () {
  return true
}

/**
 * Class for a DelegateSvg, expression_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('expression_stmt', {
  data: {
    variant: {
      NONE: eYo.Key.NONE,
      EXPRESSION: eYo.Key.EXPRESSION,
      order: 10000, // initialization comes last
      all: [
        eYo.Key.NONE,
        eYo.Key.EXPRESSION,
      ],
      init: eYo.Key.NONE,
      xml: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.afterChange(oldValue, newValue)
        var data = this.owner.expression_d
        data.required = newValue === eYo.Key.EXPRESSION
        data.setIncog()
      },
      consolidate: /** @suppress {globalThis} */ function () {
        if (this.owner.comment_d.isIncog()) {
          this.change(eYo.Key.EXPRESSION)
        }
      }
    },
    expression: {
      init: '',
      placeholder: eYo.Msg.Placeholder.EXPRESSION,
      synchronize: true,
      validate: /** @suppress {globalThis} */ function (newValue) {
        // remove any newline character from newValue
        var clean = newValue.replace(/[\n\r]+/g, '')
        return {validated: clean}
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        if (this.isIncog()) {
          this.owner.comment_variant_p = eYo.Key.COMMENT
        }
      },
      xml: {
        text: true, // there must be an only one
        willLoad: /** @suppress {globalThis} */ function (txt) {
          return txt.trim()
        }
      },
      willLoad: /** @suppress {globalThis} */ function () {
        this.required = false
      }
    },
    comment: {
      init: /** @suppress {globalThis} */ function () {
        this.owner.comment_variant_p = eYo.Key.COMMENT
        this.setIncog(false)
        return ''
      },
      willLoad: /** @suppress {globalThis} */ function () {
        this.required = false
      },
      consolidate: /** @suppress {globalThis} */ function () {
        if (this.owner.expression_d.isIncog()) {
          this.setIncog(false)
        }
      }
    }
  },
  slots: {
    expression: {
      order: 1,
      fields: {
        bind: {
          endEditing: true
        }
      },
      check: eYo.T3.Expr.Check.expression
    }
  },
  didLoad: /** @suppress {globalThis} */ function () {
    var requiredExpression = this.expression_s.isRequiredFromSaved() || this.expression_d.isRequiredFromSaved()
    var requiredComment = this.comment_d.isRequiredFromSaved()
    if (requiredComment || requiredExpression) {
      this.variant_p = requiredExpression
        ? eYo.Key.EXPRESSION
        : eYo.Key.NONE   
      this.comment_variant_p = requiredComment || !requiredExpression
        ? eYo.Key.COMMENT
        : eYo.Key.NONE
    } else if (this.variant_p === eYo.Key.NONE) {
      this.comment_variant_p === eYo.Key.COMMENT
    }
  }
}, true)

/**
 * comment blocks are white.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
eYo.DelegateSvg.Stmt.expression_stmt.prototype.isWhite = function () {
  return this.variant_p === eYo.Key.COMMENT
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.expression_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  if (this.comment_variant_p === eYo.Key.COMMENT) {
    var current = this.variant_p
    var comment = this.comment_d.toText()
    var code = this.expression_d.toText()
    if (code.length > 32) {
      var short_code = code.substring(0, 31) + '…'
    }
    if (comment.length > 32) {
      var short_comment = comment.substring(0, 31) + '…'
    }
    var total = code.length + comment.length
    if (total > 30) {
      var short_code_all = code.substring(0, Math.floor(30 * code.length / total) + 2) + '…'
      var short_comment_all = comment.substring(0, Math.floor(30 * comment.length / total) + 2) + '…'
    }
    var F = (content, variant) => {
      if (variant !== current) {
        var menuItem = mgr.newMenuItem(content, () => {
          this.variant_p = variant
        })
        mgr.addChild(menuItem)
      }
    }
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('# ', 'eyo-code-reserved'),
      eYo.Do.createSPAN(short_comment || comment || eYo.Msg.Placeholder.COMMENT,
        'eyo-code-comment')
    )
    F(content, eYo.Key.NONE)
    content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN(short_code_all || code || eYo.Msg.Placeholder.CODE,
        'eyo-code'),
      eYo.Do.createSPAN(' # ', 'eyo-code-reserved'),
      eYo.Do.createSPAN(short_comment_all || comment || eYo.Msg.Placeholder.COMMENT,
        'eyo-code-comment')
    )
    F(content, eYo.Key.EXPRESSION)
  }
  return eYo.DelegateSvg.Stmt.expression_stmt.superClass_.populateContextMenuFirst_.call(this, mgr) || true
}

eYo.DelegateSvg.Stmt.T3s = [
  eYo.T3.Stmt.pass_stmt,
  eYo.T3.Stmt.break_stmt,
  eYo.T3.Stmt.continue_stmt,
  eYo.T3.Stmt.global_stmt,
  eYo.T3.Stmt.nonlocal_stmt,
  eYo.T3.Stmt.expression_stmt,
  eYo.T3.Stmt.docstring__stmt,
  eYo.T3.Stmt.del_stmt,
  eYo.T3.Stmt.return_stmt
]
