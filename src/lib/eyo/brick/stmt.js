/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Block delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Brick.Stmt')

goog.require('eYo.Brick')


goog.require('eYo.XRE')
goog.require('eYo.Msg')
goog.require('eYo.Brick.Operator')
goog.require('eYo.Brick.List')

goog.require('goog.dom');

/**
 * Class for a Delegate, statement brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.makeSubclass('Stmt', {
  statement: {
    left: {
      check: /** @suppress {globalThis} */ function (type) {
        return this.brick.head || this.brick.foot
        ? [eYo.T3.Stmt.comment_stmt]
        : eYo.T3.Stmt.Left.simple_stmt
      }
    },
    right: {
      fields: {
        label: { // don't call it 'operator'
          reserved: ';',
          hidden: true
        }
      },
      check: /** @suppress {globalThis} */ function (type) {
        return eYo.T3.Stmt.Right.simple_stmt
      }
    },
    head: {
      check: /** @suppress {globalThis} */ function (type) {
        return this.brick.left
        ? []
        : null // except start_stmt ? connections must also have an uncheck_
      }
    },
    foot: {
      check: /** @suppress {globalThis} */ function (type) {
        return this.brick.left
        ? []
        : null
      }
    }
  }
})
eYo.Brick.Manager.registerAll(eYo.T3.Stmt, eYo.Brick.Stmt, true)

Object.defineProperties(eYo.Brick.Stmt.prototype, {
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
 * Insert a brick above.
 * If the brick's previous connection is connected,
 * connects the brick above to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {Object} model
 * @return the created brick
 */
eYo.Brick.Stmt.prototype.insertParentWithModel = function (model) {
  var magnet = this.head_m
  if (magnet) {
    var parent
    eYo.Events.disableWrap(
      () => {
        parent = eYo.Brick.newComplete(this, model)
      },
      () => {
        if (parent) {
          var p_magnet = parent.foot_m
          if (p_magnet && magnet.checkType_(p_magnet)) {
            eYo.Events.groupWrap(() => {
              eYo.Events.fireBrickCreate(parent)
              var targetMagnet = magnet.target
              if (targetMagnet) {
                targetMagnet.disconnect()
                if ((targetMagnet = parent.head_m)) {
                  p_magnet.target = targetMagnet
                }
              } else {
                var its_xy = this.ui.xyInWorkspace
                var my_xy = parent.ui.xyInWorkspace
                parent.moveByXY(its_xy.x - my_xy.x, its_xy.y - my_xy.y)
              }
              parent.render()
              magnet.target = p_magnet
              parent.makeUI(this.hasUI)
              if (this.isSelected) {
                parent.isSelected
              }
            })
          } else {
            parent.dispose(true)
            parent = undefined
          }
        }
      }
    )
    return parent
  }
}

/**
 * Insert a brick below the receiver.
 * If the receiver's next connection is connected,
 * connects the brick below to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {string} belowPrototypeName
 * @return the created brick
 */
eYo.Brick.Stmt.prototype.insertBlockAfter = function (belowPrototypeName) {
  return eYo.Events.groupWrap(() => {
    var below = eYo.Brick.newComplete(this, belowPrototypeName)
    var magnet = this.foot_m
    var targetMagnet = magnet.target
    var magnets = below.magnets
    if (targetMagnet) {
      targetMagnet.disconnect()
      if (targetMagnet.checkType_(foot_m)) {
        targetMagnet.target = foot_m
      }
    }
    magnet.target = head_m
    if (this.isSelected) {
      after.select()
    }
    return after
  })
}

/**
 * Populate the context menu for the given brick.
 * @param {!Blockly.Block} brick The brick.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.Brick.Stmt.prototype.populateContextMenuComment = function (mgr) {
  var brick = this
  var show = false
  var content =
  eYo.Do.createSPAN(show ? eYo.Msg.Placeholder.REMOVE_COMMENT : eYo.Msg.Placeholder.ADD_COMMENT, null)
  var menuItem = mgr.newMenuItem(content, brick.doAndRender())
  mgr.addChild(menuItem, true)
  return true
}

/**
 * Class for a Delegate, comment_stmt.
 * For edython.
 */
eYo.Brick.Stmt.makeSubclass(eYo.T3.Stmt.comment_stmt, {
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
        var b3k = this.brick
        b3k.comment_d.requiredIncog = newValue !== eYo.Key.BLANK
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
      getPlaceholderText: eYo.Msg.Placeholder.COMMENT
    }
  },
  slots: {
    comment: {
      order: 1000001,
      fields: {
        label: {
          order: 0,
          reserved: '#'
        },
        bind: {
          order: 1,
          validate: true,
          endEditing: true,
          comment: ''
        }
      }
    }
  },
})

;['blank_stmt'].forEach(k => {
  eYo.Brick.Stmt[k] = eYo.Brick.Stmt.comment_stmt
  eYo.Brick.Manager.register(k)
})

Object.defineProperties(eYo.Brick.Stmt.comment_stmt.prototype, {
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
   * @property {Boolean} comment bricks are white
   */
  isWhite: {
    get () {
      return true
    }
  }
})

/// /////// gobal/nonlocal statement
/**
 * Class for a Delegate, non_void_identifier_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.List.makeSubclass(eYo.T3.Expr.non_void_identifier_list, {
  list: {
    check: eYo.T3.Expr.Check.non_void_identifier_list,
    presep: ',',
    mandatory: 1
  }
})

/**
 * Class for a Delegate, global_stmt.
 * For edython.
 */
eYo.Brick.Stmt.makeSubclass(eYo.T3.Stmt.global_stmt, {
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
        var b3k = this.brick
        b3k.identifiers_s.incog = newValue !== eYo.Key.GLOBAL && newValue !== eYo.Key.NONLOCAL
        b3k.del_s.incog = newValue !== eYo.Key.DEL
        b3k.return_s.incog = newValue !== eYo.Key.RETURN
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
        },
        load: /** @suppress {globalThis} */ function (element) {
          this.brick.variant_p = element.getAttribute(eYo.Key.EYO)
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
      reserved: ''
    }
  },
  slots: {
    identifiers: {
      order: 1,
      promise: eYo.T3.Expr.non_void_identifier_list,
      xml: {
        key: 'list',
        save: /** @suppress {globalThis} */ function (element) {
          var variant = this.brick.variant_p
          if (variant === eYo.Key.GLOBAL || variant === eYo.Key.NONLOCAL) {
            this.save(element)
          }
        },
        load: /** @suppress {globalThis} */ function (element) {
          var variant = this.brick.variant_p
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
          if (this.brick.variant_p === eYo.Key.DEL) {
            this.save(element)
          }
        },
        load: /** @suppress {globalThis} */ function (element) {
          if (this.brick.variant_p === eYo.Key.DEL) {
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
          if (this.brick.variant_p === eYo.Key.RETURN) {
            this.save(element)
          }
        },
        load: /** @suppress {globalThis} */ function (element) {
          if (this.brick.variant_p === eYo.Key.RETURN) {
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
  eYo.Brick.Stmt[k] = eYo.Brick.Stmt.global_stmt
  eYo.Brick.Manager.register(k)
})

/**
 * The type and connection depend on the properties modifier, value and variant.
 * For edython.
 */
eYo.Brick.Stmt.global_stmt.prototype.getType = eYo.Decorate.onChangeCount(
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
 * The xml `eyo` attribute of this brick, as it should appear in the saved data.
 * For edython.
 * @return !String
 */
eYo.Brick.Stmt.global_stmt.prototype.xmlAttr = function () {
  return this.variant_p
}

/**
 * Populate the context menu for the given brick.
 * @param {!Blockly.Block} brick The brick.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.Brick.Stmt.global_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
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
  return eYo.Brick.Stmt.global_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
}

/**
 * Class for a Delegate, docstring_stmt.
 * For edython.
 */
eYo.Brick.Stmt.makeSubclass('docstring_stmt', {
  link: eYo.T3.Expr.longliteral
}, true)

Object.defineProperties(eYo.Brick.Stmt.docstring_stmt.prototype, {
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

eYo.Brick.Stmt.T3s = [
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
