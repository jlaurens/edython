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
        return this.b_eyo.top || this.b_eyo.bottom
        ? [eYo.T3.Stmt.comment_stmt]
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
      }
    },
    top: {
      check: /** @suppress {globalThis} */ function (type) {
        return this.b_eyo.left
        ? []
        : null // except start_stmt ? connections must also have an uncheck_
      }
    },
    bottom: {
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
 * Render the suite block, if relevant.
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.DelegateSvg.Stmt.prototype.renderRight_ = function (io) {
  var c8n = this.magnets.right
  if (c8n) {
    var c_eyo = c8n.eyo
    var target = c8n.targetBlock()
    if (target) {
      var t_eyo = target.eyo
      try {
        t_eyo.ui.startOfLine = io.common.startOfLine
        t_eyo.ui.startOfStatement = io.common.startOfStatement
        t_eyo.ui.mayBeLast = t_eyo.ui.hasRightEdge
        t_eyo.ui.down = true
        if (eYo.DelegateSvg.debugStartTrackingRender) {
          console.log(eYo.DelegateSvg.debugPrefix, 'DOWN')
        }
        if (t_eyo.wrapped_) {
          // force target rendering
          t_eyo.incrementChangeCount()
        }
        if (!t_eyo.ui.up) {
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
        t_eyo.ui.down = false
        var size = t_eyo.size
        if (size.w) {
          io.cursor.advance(size.w, size.h - 1)
          // We just rendered a block
          // it is potentially the rightmost object inside its parent.
          if (t_eyo.ui.hasRightEdge || io.common.shouldPack) {
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
 * Insert a block above.
 * If the block's previous connection is connected,
 * connects the block above to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {Object} model
 * @return the created block
 */
eYo.DelegateSvg.Stmt.prototype.insertParentWithModel = function (model) {
  var magnet = this.magnets.top
  if (magnet) {
    var parent
    eYo.Events.disableWrap(
      () => {
        parent = eYo.DelegateSvg.newComplete(this, model)
      },
      () => {
        if (parent) {
          var p_magnet = parent.magnets.bottom
          if (p_magnet && magnet.checkType_(p_magnet)) {
            eYo.Events.groupWrap(
              () => {
                eYo.Events.fireBlockCreate(parent.block_)
                var t_magnet = magnet.target
                if (t_magnet) {
                  t_magnet.break()
                  if ((t_magnet = parent.magnets.top)) {
                    p_magnet.target = t_magnet
                  }
                } else {
                  var its_xy = this.ui.xyInSurface
                  var my_xy = parent.ui.xyInSurface
                  parent.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y)
                }
                parent.render()
                magnet.target = p_magnet
                parent.beReady(this.isReady)
                if (eYo.Selected.eyo === this) {
                  eYo.Selected.eyo === parent
                }
              }
            )
          } else {
            parent.block_.dispose(true)
            parent = undefined
          }
        }    
      }
    )
    return parent
  }
}

/**
 * Insert a block below the receiver.
 * If the receiver's next connection is connected,
 * connects the block below to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {string} belowPrototypeName
 * @return the created block
 */
eYo.DelegateSvg.Stmt.prototype.insertBlockAfter = function (belowPrototypeName) {
  return eYo.Events.groupWrap(
    () => {
      var below = eYo.DelegateSvg.newComplete(this, belowPrototypeName)
      var magnet = this.magnets.bottom
      var t_magnet = magnet.target
      var b_m4ts = below.magnets
      if (t_magnet) {
        t_magnet.break()
        if (t_magnet.checkType_(b_m4ts.bottom)) {
          t_magnet.target = b_magnets.bottom
        }
      }
      magnet.target = b_m4ts.top
      if (eYo.Selected.eyo === this) {
        eYo.Selected.eyo = after
      }
      return after.block_
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
    variant: {
      all: [
        eYo.Key.COMMENT, // A comment only
        eYo.Key.BLANK // blank line
      ],
      init: eYo.Key.COMMENT,
      xml: false,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var O = this.owner
        O.comment_d.requiredIncog = newValue !== eYo.Key.BLANK
      },
      fromType: /** @suppress {globalThis} */ function (type) {
        if (type === eYo.T3.Stmt.blank_stmt) {
          // expression statement defaults to a python comment line
          // but it should change because of the 'comment_stmt' below
          this.change(eYo.Key.BLANK)
        } else {
          this.change(eYo.Key.COMMENT)
        }
      }
    },
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

;['blank_stmt'].forEach(k => {
  eYo.DelegateSvg.Stmt[k] = eYo.DelegateSvg.Stmt.comment_stmt
  eYo.DelegateSvg.Manager.register(k)
})

Object.defineProperties(eYo.DelegateSvg.Stmt.comment_stmt.prototype, {
  /**
   * @readonly
   * @property {Boolean} whether the receiver is a comment.
   */
  isComment: {
    get () {
      return this.type === eYo.T3.Stmt.comment_stmt
    }
  },
  /**
   * @readonly
   * @property {Boolean} whether the receiver is a blank statement: a line consisting of only white spaces, if any.
   */
  isBlank: {
    get () {
      return this.type === eYo.T3.Stmt.blank_stmt
    }
  },
  /**
   * @readonly
   * @property {Boolean} comment blocks are white
   */
  isWhite: {
    get () {
      return true
    }
  }
})

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
      promise: eYo.T3.Expr.non_void_identifier_list,
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

Object.defineProperties(eYo.DelegateSvg.Stmt.docstring_stmt.prototype, {
  /**
   * @readonly
   * @property {Boolean}  always true
   */
  isWhite: {
    get () {
      return true
    }
  }
})

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
