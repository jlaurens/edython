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
  statement: {
    left: {
      check: /** @suppress {globalThis} */ function (type) {
        return this.b_eyo.previous || this.b_eyo.next
        ? []
        : eYo.T3.Stmt.Left.simple_stmt
      }
    },
    right: {
      fields: {
        label: { // don't call it 'operator'
          value: ';',
          css: 'reserved',
          hidden: true
        }
      },
      check: /** @suppress {globalThis} */ function (type) {
        return eYo.T3.Stmt.Right.simple_stmt
      },
      didConnect: /** @suppress {globalThis} */ function  (oldTargetC8n, targetOldC8n) {
        var b_eyo = this.b_eyo
        b_eyo.isGroup || b_eyo.inputRight.eyo.fields.label.setVisible(true)
      },
      didDisconnect: /** @suppress {globalThis} */ function  (oldTargetC8n) {
        this.b_eyo.inputRight.eyo.fields.label.setVisible(false)
      }
    },
    previous: {
      check: /** @suppress {globalThis} */ function (type) {
        return this.b_eyo.left
        ? []
        : null
      }
    },
    next: {
      check: /** @suppress {globalThis} */ function (type) {
        return this.b_eyo.left
        ? []
        : null
      }
    }
  }
})
eYo.Delegate.Manager.registerAll(eYo.T3.Stmt, eYo.DelegateSvg.Stmt, true)

Object.defineProperties(eYo.DelegateSvg.Stmt.prototype, {
  isStmt: {
    get () {
      return true
    }
  },
  depth: {
    get () {
      var group = this.group
      return (group && (group.depth + 1)) || 0
    }
  }
})

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
 * Statement block path.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.Stmt.prototype.pathStatementDef_ = function () {
  return eYo.Shape.definitionWithBlock(this)
} /* eslint-enable indent */

eYo.DelegateSvg.Stmt.prototype.pathShapeDef_ =
  eYo.DelegateSvg.Stmt.prototype.pathContourDef_ =
    eYo.DelegateSvg.Stmt.prototype.pathHilightDef_ =
      eYo.DelegateSvg.Stmt.prototype.pathStatementDef_

/**
 * Path definition for a statement block selection.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.Stmt.prototype.pathSelectDef_ = function () {
  return eYo.Shape.definitionWithBlock(this, {dido: true})
}

/**
 * Prepare rendering.
 * @param {?Object} recorder  When null, this is not the start of a statement
 * @return {!Object} a local recorder
 * @private
 */
eYo.DelegateSvg.Stmt.prototype.renderDrawModelBegin_ = function (recorder) {
  var  io = eYo.DelegateSvg.Stmt.superClass_.renderDrawModelBegin_.call(this, recorder)
  io.common.inputDone = undefined
  return io
}


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
 * Render the right statement connection and its target block, if relevant.
 * @param {!Object} io the input/output argument.
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.DelegateSvg.Stmt.prototype.renderDrawInputRight_ = function (io) {
  // adding a ';' or not.
  var c8n = this.rightStmtConnection
  if (c8n) {
    this.renderDrawFieldFrom_(io.input.eyo.fromStartField, io)
    c8n.eyo.setOffset(io.cursor)
  }
}

/**
 * Render the suite block, if relevant.
 * @return {boolean=} true if a rendering message was sent, false othrwise.
 */
eYo.DelegateSvg.Stmt.prototype.renderRight_ = function (io) {
  var c8n = this.rightStmtConnection
  if (c8n) {
    var c_eyo = c8n.eyo
    var target = c8n.targetBlock()
    if (target) {
      var t_eyo = target.eyo
      try {
        t_eyo.startOfLine = io.common.startOfLine
        t_eyo.startOfStatement = io.common.startOfStatement
        t_eyo.mayBeLast = t_eyo.hasRightEdge
        t_eyo.downRendering = true
        if (eYo.DelegateSvg.debugStartTrackingRender) {
          console.log(eYo.DelegateSvg.debugPrefix, 'DOWN')
        }
        if (t_eyo.wrapped_) {
          // force target rendering
          t_eyo.incrementChangeCount()
        }
        if (!t_eyo.upRendering) {
          t_eyo.render(false, io)
          if (!t_eyo.wrapped_) {
            io.common.field.shouldSeparate = false
            io.common.field.beforeIsSeparator = true
          }
        }
        io.cursor.c = c_eyo.where.c
      } catch(err) {
        console.error(err)
        throw err
      } finally {
        t_eyo.downRendering = false
        var size = t_eyo.size
        if (size.w) {
          io.cursor.advance(size.w, size.h - 1)
          // We just rendered a block
          // it is potentially the rightmost object inside its parent.
          if (t_eyo.hasRightEdge || io.common.shouldPack) {
            io.common.ending.push(t_eyo)
            t_eyo.rightCaret = undefined
            io.common.field.shouldSeparate = false
          }
          io.common.field.beforeIsCaret = false
        }
      }
      return true
    }
  }
}

/**
 * Render the inputs of the block.
 * @param {!Blockly.Block} block
 * @protected
 */
eYo.DelegateSvg.Stmt.prototype.minBlockW = function () {
  return eYo.Font.tabW
}

/**
 * Did disconnect this block's connection from another connection.
 * @param {!Blockly.Connection} blockConnection
 * @param {!Blockly.Connection} oldTargetC8n that was connected to blockConnection
 */
eYo.DelegateSvg.Stmt.prototype.didDisconnect = function (connection, oldTargetC8n) {
  this.isRightStatement = false
  eYo.DelegateSvg.Stmt.superClass_.didDisconnect.call(this, connection, oldTargetC8n)
}

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
                if (eYo.Selected.block === block) {
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
      if (eYo.Selected.block === block) {
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
  var show = false
  var content =
  eYo.Do.createSPAN(show ? eYo.Msg.Placeholder.REMOVE_COMMENT : eYo.Msg.Placeholder.ADD_COMMENT, null)
  var menuItem = mgr.newMenuItem(content, block.eyo.doAndRender())
  mgr.addChild(menuItem, true)
  return true
}

/**
 * Class for a DelegateSvg, comment_stmt.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass(eYo.T3.Stmt.comment_stmt, {
  data: {
    comment: {
      order: 1000000,
      init: '',
      placeholder: eYo.Msg.Placeholder.COMMENT,
      validate: /** @suppress {globalThis} */ function (newValue) {
        return {validated: XRegExp.exec(newValue, eYo.XRE.comment).value || ''}
      },
      synchronize: true,
      placeholderText: eYo.Msg.Placeholder.COMMENT
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
  },
})

/**
 * comment blocks are white.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
eYo.DelegateSvg.Stmt.comment_stmt.prototype.isWhite = function () {
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
        O.return_s.setIncog(newValue !== eYo.Key.RETURN)
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
      wrap: eYo.T3.Expr.non_void_identifier_list,
      xml: {
        key: 'list',
        save: /** @suppress {globalThis} */ function (element) {
          var variant = this.owner.variant_p
          if (variant === eYo.Key.GLOBAL || variant === eYo.Key.NONLOCAL) {
            this.save(element)
          }
        },
        load: /** @suppress {globalThis} */ function (element) {
          var variant = this.owner.variant_p
          if (variant === eYo.Key.GLOBAL || variant === eYo.Key.NONLOCAL) {
            this.load(element)
          }
        }
      }
    },
    del: {
      order: 2,
      wrap: eYo.T3.Expr.target_list,
      xml: {
        key: 'list',
        save: /** @suppress {globalThis} */ function (element) {
          if (this.owner.variant_p === eYo.Key.DEL) {
            this.save(element)
          }
        },
        load: /** @suppress {globalThis} */ function (element) {
          if (this.owner.variant_p === eYo.Key.DEL) {
            this.load(element)
          }
        }
      }
    },
    return: {
      order: 3,
      wrap: eYo.T3.Expr.optional_expression_list,
      xml: {
        key: 'list',
        save: /** @suppress {globalThis} */ function (element) {
          if (this.owner.variant_p === eYo.Key.RETURN) {
            this.save(element)
          }
        },
        load: /** @suppress {globalThis} */ function (element) {
          if (this.owner.variant_p === eYo.Key.RETURN) {
            this.load(element)
          }
        }
      }
    }
  }
})

;[
  'pass',
  'continue',
  'break',
  'nonlocal',
  'del',
  'return'
].forEach((k) => {
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
 * @return !String
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

eYo.DelegateSvg.Stmt.T3s = [
  eYo.T3.Stmt.comment_stmt,
  eYo.T3.Stmt.pass_stmt,
  eYo.T3.Stmt.break_stmt,
  eYo.T3.Stmt.continue_stmt,
  eYo.T3.Stmt.global_stmt,
  eYo.T3.Stmt.nonlocal_stmt,
  eYo.T3.Stmt.docstring__stmt,
  eYo.T3.Stmt.del_stmt,
  eYo.T3.Stmt.return_stmt
]
