/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('eYo.ns.Brick')

eYo.require('eYo.Change')

eYo.require('eYo.ns.Brick.List')
eYo.provide('eYo.Stmt')

eYo.forwardDeclare('eYo.XRE')
eYo.forwardDeclare('eYo.Msg')
eYo.forwardDeclare('eYo.ns.Brick.Operator')

goog.forwardDeclare('goog.dom')

/**
 * Class for a Delegate, statement brick.
 * Not normally called directly, eYo.ns.Brick.create(...) is preferred.
 * For edython.
 */
eYo.ns.Brick.makeSubclass('Stmt', {
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
})
eYo.ns.Brick.mngr.registerAll(eYo.T3.Stmt, eYo.Stmt, true)

Object.defineProperties(eYo.Stmt.prototype, {
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
eYo.Stmt.prototype.insertParentWithModel = function (model) {
  var magnet = this.head_m
  if (magnet) {
    var parent
    eYo.Events.disableWrap(
      () => {
        parent = eYo.ns.Brick.newReady(this, model)
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
                parent.moveTo(this.xy)
              }
              parent.render()
              magnet.target = p_magnet
              parent.initUI(this.hasUI)
              if (this.hasFocus) {
                parent.hasFocus
              }
            })
          } else {
            parent.dispose(true)
            parent = eYo.NA
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
eYo.Stmt.prototype.insertBrickAfter = function (belowPrototypeName) {
  return eYo.Events.groupWrap(() => {
    var below = eYo.ns.Brick.newReady(this, belowPrototypeName)
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
    if (this.hasFocus) {
      after.focusOn()
    }
    return after
  })
}

/**
 * Class for a Delegate, comment_stmt.
 * For edython.
 */
eYo.Stmt.makeSubclass(eYo.T3.Stmt.comment_stmt, {
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
          this.doChange(eYo.Key.BLANK)
        } else {
          this.doChange(eYo.Key.COMMENT)
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
  eYo.Stmt[k] = eYo.Stmt.comment_stmt
  eYo.ns.Brick.mngr.register(k)
})

Object.defineProperties(eYo.Stmt.comment_stmt.prototype, {
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
 * Not normally called directly, eYo.ns.Brick.create(...) is preferred.
 * For edython.
 */
eYo.ns.Brick.List.makeSubclass(eYo.T3.Expr.non_void_identifier_list, {
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
eYo.Stmt.makeSubclass(eYo.T3.Stmt.global_stmt, {
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
  eYo.Stmt[k] = eYo.Stmt.global_stmt
  eYo.ns.Brick.mngr.register(k)
})

/**
 * The type and connection depend on the properties modifier, value and variant.
 * For edython.
 */
eYo.Stmt.global_stmt.prototype.getType = eYo.Change.decorate(
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
eYo.Stmt.global_stmt.prototype.xmlAttr = function () {
  return this.variant_p
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.ns.Brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.Stmt.global_stmt.prototype.populateContextMenuFirst_ = function (mngr) {
  var current = this.variant_p
  var variants = this.variant_d.getAll()
  var F = (i) => {
    var key = variants[i]
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN(key, 'eyo-code-reserved')
    )
    var menuItem = mngr.newMenuItem(content, () => {
      this.variant_p = key
    })
    mngr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(0)
  F(1)
  F(2)
  mngr.shouldSeparate()
  F = (i) => {
    var key = variants[i]
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN(key, 'eyo-code-reserved'),
      eYo.Do.createSPAN(' …', 'eyo-code-placeholder')
    )
    var menuItem = mngr.newMenuItem(content, () => {
      this.variant_p = key
    })
    mngr.addChild(menuItem, true)
    menuItem.setEnabled(key !== current)
  }
  F(3)
  F(4)
  F(5)
  F(6)
  mngr.shouldSeparate()
  return eYo.Stmt.global_stmt.superClass_.populateContextMenuFirst_.call(this, mngr)
}

/**
 * Class for a Delegate, docstring_stmt.
 * For edython.
 */
eYo.Stmt.makeSubclass('docstring_stmt', {
  link: eYo.T3.Expr.longliteral
}, true)

Object.defineProperties(eYo.Stmt.docstring_stmt.prototype, {
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

eYo.Stmt.T3s = [
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
