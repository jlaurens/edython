/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Block delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.KeyHandler')
goog.provide('eYo.KeyHandlerMenu')

goog.require('eYo.XRE')
goog.require('eYo.DelegateSvg')
goog.require('eYo.PopupMenu')
goog.require('eYo.MenuItem')
goog.require('eYo.Separator')
goog.require('goog.dom');

eYo.KeyHandlerMenu = function (opt_domHelper, opt_renderer) {
  eYo.KeyHandlerMenu.superClass_.constructor.call(this, opt_domHelper, opt_renderer)
}
goog.inherits(eYo.KeyHandlerMenu, eYo.PopupMenu)

/**
 * Attempts to handle a keyboard event; returns true if the event was handled,
 * false otherwise.  If the container is enabled, and a child is highlighted,
 * calls the child control's `handleKeyEvent` method to give the control
 * a chance to handle the event first.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the event was handled by the container (or one of
 *     its children).
 */
eYo.KeyHandlerMenu.prototype.handleKeyEventInternal = function (e) {
  // Give the highlighted control the chance to handle the key event.
  if (eYo.KeyHandlerMenu.superClass_.handleKeyEventInternal.call(this, e)) {
    return true
  }
  return this.eyo.handleMenuKeyEvent(e)
}

/**
 * Key handler class.
 * For edython.
 * @param {!constructor} constructor is either a constructor or the name of a constructor.
 */
eYo.KeyHandler = (() => {
  var me = {
    MAX_CHILD_COUNT: 20
  }
  var keys_ = []
  var shortcuts_ = [] // an array of {key: ..., model: ...} objects
  var current_ = []
  var target_
  var menu_ = new eYo.KeyHandlerMenu(/* undefined, ContextMenuRenderer */)
  menu_.eyo = me
  /**
 * Setup the shared key handler.
 * For edython.
 * @param {!constructor} constructor is either a constructor or the name of a constructor.
 */
  me.setup = function (document) {
    target_ = document
    goog.events.listen(
      document, goog.events.EventType.KEYDOWN, me.handleKeyDown_,
      undefined /* opt_capture */, me
    )
  }
  me.register = function (key, model) {
    // manage duplicates
    if (key.length) {
      goog.asserts.assert(goog.isString(model) || goog.isFunction(model) || goog.isFunction(model.action) || goog.isString(model.type), 'No model to register for ' + key)
      for (var i = 0, s; (s = shortcuts_[i]); i++) {
        if (s.key === key) {
          shortcuts_[i] = {
            key: key,
            model: model
          }
          return
        }
      }
      shortcuts_.push({
        key: key,
        model: model
      })
    }
  }
  me.handleMenuKeyEvent = function (event) {
    var K = event.key
    var k = K.toLowerCase()
    if (k === 'dead') {
      if (event.keyCode === 78) { // this is on osx, change it twice if necessary for other systems
        K = '~'
      } else if (event.keyCode === 219) { // this is on osx
        K = '^'
      } else {
        return
      }
    } else if (k === 'backspace') {
      event.preventDefault()
      event.stopPropagation()
      K = undefined
    }
    if (me.updateMenu(K)) {
      event.preventDefault()
      event.stopPropagation()
      return true
    }
    return false
  }
  me.handleFirstMenuItemAction = function (model) {
    // first check to see if the selected block can handle the model
    var B = Blockly.selected
    var c8n = eYo.SelectedConnection
    if (B && !c8n) {
      var D = model.data
      var done = false
      if (D && B.eyo.setDataWithModel(D)) {
        // yes it does
        return
      }
      // Maybe the main data can handle the model
      var main = B.eyo.main_d
      if (main && main.validate(model)) {
        // yes it does
        main.set(model)
        return
      }
      if (B.eyo.foreachData((d) => {
        if (!d.isIncog() && d.validate(model)) {
          d.change(model)
          return true
        }
      })) {
        return
      }
    }
    if (me.handleModel(model)) {
      // reentrant?
      return
    }
    if (current_.length) {
      model = current_[0].model
      me.handleModel(model)
    }
  }
  me.handleModel = function (model) {
    // if key is a number, then create a number block
    // otherwise, take the first model and pass it to handleModel
    if (goog.isFunction(model.action)) {
      model.action.call(me, model.model)
      return
    }
    var B = Blockly.selected
    if (B) {
      var c8n = eYo.SelectedConnection
      var newB = model.parent || model.slot
      ? B.eyo.insertParentWithModel(model) || B.eyo.insertBlockWithModel(model, c8n)
      : B.eyo.insertBlockWithModel(model, c8n) || B.eyo.insertParentWithModel(model)
      if (newB) {
        if (c8n) {
          // There was a selected connection,
          // we try to select another one, with possibly the same type
          // First we take a look at B : is there an unconnected input connection
          var doFirst = (block, type) => {
            return block.eyo.someInputConnection((c8n) => {
              if (c8n.type === type) {
                if (!c8n.hidden_ && !c8n.targetConnection && (!c8n.eyo.source || !c8n.eyo.source.bindField)) {
                  eYo.SelectedConnection = c8n
                  return true
                } else if (c8n.targetConnection) {
                  return doFirst(c8n.targetBlock(), type)
                }
              }
            })
          }
          if (doFirst(newB, Blockly.INPUT_VALUE)) {
            return true
          } else if ((c8n === B.nextConnection) && (c8n = newB.nextConnection) && !c8n.hidden_) {
            eYo.SelectedConnection = c8n
            return true
          }
          eYo.SelectedConnection = null
          newB.select()
          return true
        }
        // no selected connection
        var parent = B
        do {
          if (parent.eyo.someInputConnection((c8n) => {
            if (c8n.type === Blockly.INPUT_VALUE && !c8n.eyo.optional_ && !c8n.targetConnection && !c8n.hidden_) {
              eYo.SelectedConnection = c8n
              return true
            }
          })) {
            return true
          }
        } while ((parent = parent.getSurroundParent(parent)))
        eYo.SelectedConnection = null
        newB.select()
        return true
      }
    }
  }
  /**
   * The me.split must have been called
   * @param {Object} shortcut
   * @param {Object} current_
   * @private
   */
  me.insertShortcutInArray_ = function (shortcut, current_) {
    var lhs = shortcut.components
    var compare = (As, Bs) => {
      // put in front strings when there is a full match
      // For example "module as name" should come before "assert" for "as"
      // if As[0] is void or does not end with a letter
      // if the shortcut starts with one, left bonus
      if (As.length > 1) {
        if (eYo.XRE.id_continue.test(As[1]) && (!As[0].length || !eYo.XRE.id_continue.test(As[0]))) {
          var bonusA = true
        }
      }
      if (Bs.length > 1) {
        if (eYo.XRE.id_continue.test(Bs[1]) && (!Bs[0].length || !eYo.XRE.id_continue.test(Bs[0]))) {
          var bonusB = true
        }
      }
      if (bonusA && !bonusB) {
        return -1
      }
      if (bonusB && !bonusA) {
        return 1
      }
      // if the last As[] is void or does not start with a letter
      // if the shortcut starts with one, right bonus
      bonusA = bonusB = false
      if (As.length > 2) {
        if (eYo.XRE.id_continue.test(As[As.length - 2]) && (!As[As.length - 1].length ||
          !eYo.XRE.id_continue.test(As[As.length - 1][0]))) {
          bonusA = true
        }
      }
      if (Bs.length > 2) {
        if (eYo.XRE.id_continue.test(Bs[Bs.length - 2]) && (!Bs[Bs.length - 1].length ||
          !eYo.XRE.id_continue.test(Bs[Bs.length - 1][0]))) {
          bonusB = true
        }
      }
      if (bonusA && !bonusB) {
        return -1
      }
      if (bonusB && !bonusA) {
        return 1
      }
      for (var i = 0; i < As.length; i += 2) {
        var a = As[i]
        var b = Bs[i]
        var cmp = a.length - b.length
        if (cmp === 0) {
          cmp = a.localeCompare(b)
        }
        if (cmp) {
          return cmp
        }
      }
      return 0
    }
    for (var j = 0, s; (s = current_[j]); j++) {
      var cmp = compare(lhs, s.components)
      if (cmp <= 0) {
        break
      }
    }
    // append the shortcut:
    current_.splice(j, 0, shortcut)
  }
  me.updateMenu = function (sep) {
    var newCurrent = []
    if (sep === undefined) {
      var key = keys_.pop()
      if (current_.length) {
        var l = current_[0].components.length - 2
        if (l < 3) {
          return
        }
        for (var i = 0, s; (s = shortcuts_[i++]);) {
          var Cs = s.components
          if (Cs) {
            if (Cs.length === l) {
              me.insertShortcutInArray_(s, newCurrent)
            } else if (Cs.length > l) {
              var last = Cs.slice(Cs.length - 3, Cs.length).join('')
              Cs.splice(Cs.length - 3, 3, last)
              me.insertShortcutInArray_(s, newCurrent)
            }
          }
        }
      } else {
        me.populateMenu(key)
        return
      }
    } else if (sep.length === 1) {
      if (current_) {
        keys_.push(sep)
        for (i = 0; (s = current_[i++]);) {
          Cs = s.components
          last = Cs[Cs.length - 1]
          var split = me.split(last, sep)
          if (split) {
            Cs.splice(Cs.length - 1, 1, split[0], sep, split[1])
            me.insertShortcutInArray_(s, newCurrent)
          }
        }
      } else {
        me.populateMenu(sep)
        return
      }
    } else {
      return
    }
    current_ = newCurrent
    var MI = menu_.getHighlighted()
    if (MI) {
      var highlighted = MI.model
    }
    MI = menu_.getChildAt(0)
    var k = keys_.join('')
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
      eYo.Do.createSPAN(k, 'eyo-code-emph'))
    MI.setContent(content)
    MI.setModel(k)
    if (current_.length) {
      if (menu_.getChildCount() < 2) {
        menu_.addChild(new eYo.Separator(), true)
      }
      for (i = 0; (s = current_[i]); i++) {
        Cs = s.components
        var j = 0
        var c = Cs[j++]
        var d
        content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
          goog.dom.createTextNode(c))
        while ((d = Cs[j++]) !== undefined && (c = Cs[j++]) !== undefined) {
          content.appendChild(eYo.Do.createSPAN(d, 'eyo-code-emph'))
          content.appendChild(goog.dom.createTextNode(c))
        }
        if ((MI = menu_.getChildAt(i + 2))) {
          MI.setModel(s)
          MI.setContent(content)
        } else {
          MI = new eYo.MenuItem(content, s)
          menu_.addChild(MI, true)
        }
        if (s === highlighted) {
          menu_.setHighlighted(MI)
        }
      }
      while ((MI = menu_.getChildAt(i + 2))) {
        menu_.removeChild(MI, true)
      }
    } else {
      while ((MI = menu_.getChildAt(1))) {
        menu_.removeChild(MI, true)
      }
    }
  }
  me.populateMenu = function (key) {
    current_.length = 0
    menu_.removeChildren(true)
    if (key.length !== 1) {
      return
    }
    keys_.push(key)
    var content = eYo.Do.createSPAN(key, 'eyo-code-emph')
    var MI = new eYo.MenuItem(content, key)
    menu_.addChild(MI, true)

    // initialize the shortcuts to hold informations
    // - to build the menuitem content
    // - to sort and filter the menu items
    var i = 0
    var shortcut, split
    while ((shortcut = shortcuts_[i++])) {
      if ((split = me.split(shortcut.key, key))) {
        shortcut.components = [split[0], key, split[1]]
        me.insertShortcutInArray_(shortcut, current_)
      } else {
        shortcut.components = undefined
      }
    }
    if (current_.length) {
      menu_.addChild(new eYo.Separator(), true)
    }
    i = 0
    while (i < me.MAX_CHILD_COUNT && (shortcut = current_[i++])) {
      content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
        goog.dom.createTextNode(shortcut.components[0]),
        eYo.Do.createSPAN(shortcut.components[1], 'eyo-code-emph'),
        goog.dom.createTextNode(shortcut.components[2])
      )
      MI = new eYo.MenuItem(content, shortcut)
      menu_.addChild(MI, true)
    }
  }
  me.handleKeyDown_ = function (event) {
    if (menu_.isVisible() || event.metaKey) {
      // let someone else catch that event
      return
    }
    var B = event.target
    if (B !== target_) {
      if (!(B = B.parentNode)) {
        return
      }
      if (B !== target_) {
        if (!(B = B.parentNode) || (B !== target_)) {
          return
        }
      }
    }
    var K = event.key
    var k = K.toLowerCase()
    if (k === 'dead') {
      if (event.keyCode === 78) { // this is on osx
        K = '~'
      } else if (event.keyCode === 219) { // this is on osx
        K = '^'
      } else {
        return
      }
    } else if (k === 'enter' || k === 'return') {
      if ((B = Blockly.selected) && B.eyo.showEditor) {
        event.preventDefault()
        event.stopPropagation()
        B.eyo.showEditor(B)
        return
      }
    }
    if ((B = Blockly.selected)) {
      if (K === ' ') {
        event.preventDefault()
        event.stopPropagation()
        eYo.MenuManager.shared().showMenu(B, event)
        return
      }
      keys_ = []
      me.populateMenu(K)
      if (menu_.getChildCount()) {
        event.preventDefault()
        event.stopPropagation()
        if (!menu_.inDocument_) {
          menu_.render()
        }
        if (!me.alreadyListening_) {
          me.alreadyListening_ = true
          me.alreadyListened = false
          goog.events.listenOnce(menu_, 'action', (event) => {
            me.alreadyListening_ = false
            var target = event.target
            if (target) {
              var targetModel = target.model_
              if (targetModel) {
                setTimeout(() => { // try/finally?
                  if (me.alreadyListened_) {
                    console.log('************* I have already listened!')
                    return
                  }
                  me.alreadyListened = true
                  var key = targetModel.key
                  var model = targetModel.model || targetModel
                  if (key) {
                    if (goog.isFunction(model)) {
                      model(key)
                      return
                    }
                    if (me.handleModel(model)) {
                      return
                    }
                  }
                  me.handleFirstMenuItemAction(model)
                }, 100)// TODO be sure that this 100 is suffisant
              }
            }
          })
        }
        var scaledHeight = eYo.Font.lineHeight * B.workspace.scale
        var c8n = eYo.SelectedConnection
        if (c8n && c8n.sourceBlock_) {
          var xy = goog.style.getPageOffset(c8n.sourceBlock_.svgGroup_)
          var xxyy = c8n.offsetInBlock_.clone().scale(B.workspace.scale)
          xy.translate(xxyy)
        } else {
          xy = goog.style.getPageOffset(B.svgGroup_)
        }
        menu_.showMenu(B.svgGroup_, xy.x, xy.y + scaledHeight + 2)
        menu_.highlightFirst()
      } else {
        var F = (f) => {
          event.preventDefault()
          event.stopPropagation()
          f.call(B.eyo)
          if (!B.eyo.inVisibleArea()) {
            B.workspace.centerOnBlock(B.id)
          }
        }
        switch (k) {
        case 'arrowdown': return F(B.eyo.selectBlockBelow)
        case 'arrowup': return F(B.eyo.selectBlockAbove)
        case 'arrowleft': return F(B.eyo.selectBlockLeft)
        case 'arrowright': return F(B.eyo.selectBlockRight)
        }
      }
    } else {
      // B is not always a block!
      F = (f) => {
        event.preventDefault()
        event.stopPropagation()
        var block = eYo.DelegateSvg.getBestBlock(eYo.Session.workspace, f)
        if (block) {
          block.select()
          if (!block.eyo.inVisibleArea()) {
            block.workspace.centerOnBlock(block.id)
          }
        }
      }
      switch (k) {
      case 'arrowdown': F(P => P.y); return
      case 'arrowup': F(P => -P.y); return
      case 'arrowleft': F(P => -P.x); return
      case 'arrowright': F(P => P.x)
      }
    }
  }
  return me
})()

/**
 * Separate key in 2 parts: what is before the first occurrence of sep and what is after.
 * If sep is not in the list, returns undefined.
 * split('foo', 'f') -> ['', 'oo']
 * split('foo', 'o') -> ['f', 'o']
 * split('bar', 'r') -> ['ba', '']
 * split('foo', 'b') -> undefined
 * 
 * @param {*} key 
 * @param {*} sep 
 * @return an array of 2 elements, what is before `sep` and what is after
 */
eYo.KeyHandler.split = function (key, sep) {
  var i = key.indexOf(sep)
  if (i < 0) {
    return undefined
  }
  return [key.substring(0, i), key.substring(i + sep.length)]
}

  /**
 * Turn the selected block into a call block or insert a call block.
 * @param {*} model 
 */
eYo.KeyHandler.makeCall = function (model) {
  this.handleModel(model)
}

/**
 * Turn the selected block into a slicing, or inert a slicing
 * @param {*} model 
 */
eYo.KeyHandler.makeSlicing = function (model) {
  this.handleModel(model)
}

eYo.KeyHandler.register('if', eYo.T3.Stmt.if_part)

var Ks = {
  'start': eYo.T3.Stmt.start_stmt,
  'if': eYo.T3.Stmt.if_part,
  'elif': eYo.T3.Stmt.elif_part,
  'else': eYo.T3.Stmt.else_part,
  'class': eYo.T3.Stmt.classdef_part,
  'except': {
    type: eYo.T3.Stmt.except_part,
    variant_d: eYo.Key.NONE
  },
  'except …': {
    type: eYo.T3.Stmt.except_part,
    variant_d: eYo.Key.EXPRESSION
  },
  'except … as …': {
    type: eYo.T3.Stmt.except_part,
    variant_d: eYo.Key.ALIASED
  },
  'finally': eYo.T3.Stmt.finally_part,
  'for': eYo.T3.Stmt.for_part,
  '@': eYo.T3.Stmt.decorator_stmt,
  'def': eYo.T3.Stmt.funcdef_part,
  'import': eYo.T3.Stmt.import_stmt,
  'try': eYo.T3.Stmt.try_part,
  'while': eYo.T3.Stmt.while_part,
  'with': eYo.T3.Stmt.with_part,
  'lambda': eYo.T3.Expr.lambda,
  '… if … else …': eYo.T3.Expr.conditional_expression,
  'identifier': eYo.T3.Expr.identifier,
  'name': eYo.T3.Expr.identifier,
  'not …': function (key) {
    var B = Blockly.selected
    if (B) {
      var parent = B.getSurroundParent()
      if (parent && parent.workspace.eyo.options.smartUnary && (parent.type === eYo.T3.Expr.not_test)) {
        B.eyo.replaceBlock(parent)
        return
      }
      if (eYo.SelectedConnection) {
        B.eyo.insertBlockWithModel(eYo.T3.Expr.not_test)
      } else {
        B.eyo.insertParentWithModel(eYo.T3.Expr.not_test)
      }
    }
  },
  '+…': function (key) {
    var B = Blockly.selected
    if (B) {
      var parent = B.getSurroundParent()
      if (parent && parent.workspace.eyo.options.smartUnary && (parent.type === eYo.T3.Expr.u_expr) && parent.eyo.operator_p === '+') {
        return
      }
      var model = {
        type: eYo.T3.Expr.u_expr,
        operator_d: '+'
      }
      if (eYo.SelectedConnection) {
        B.eyo.insertBlockWithModel(model)
      } else {
        B.eyo.insertParentWithModel(model)
      }
    }
  }
}
var K
for (K in Ks) {
  eYo.KeyHandler.register(K, Ks[K])
}

Ks = (() => {
  var F = (key, op) => {
    var B = Blockly.selected
    if (B) {
      var parent = B.getSurroundParent()
      if (parent && parent.workspace.eyo.options.smartUnary && (parent.type === eYo.T3.Expr.u_expr) && parent.eyo.operator_ === op) {
        B.eyo.replaceBlock(parent)
        return
      }
      var model = {
        type: eYo.T3.Expr.u_expr,
        operator_d: op
      }
      if (eYo.SelectedConnection) {
        B.eyo.insertBlockWithModel(model)
      } else {
        B.eyo.insertParentWithModel(model)
      }
    }
  }
  return {
    '-': function (key) {
      return F(key, '-')
    },
    '~': function (key) {
      return F(key, '~')
    }
  }
})()

for (K in Ks) {
  eYo.KeyHandler.register(K + '…', Ks[K])
}

Ks = {
  '+': {
    type: eYo.T3.Expr.a_expr,
    operator_d: '+',
    slot: eYo.Key.LHS
  },
  '-': {
    type: eYo.T3.Expr.a_expr,
    operator_d: '-',
    slot: eYo.Key.LHS
  },
  '*': {
    type: eYo.T3.Expr.m_expr,
    operator_d: '*',
    slot: eYo.Key.LHS
  },
  '//': {
    type: eYo.T3.Expr.m_expr,
    operator_d: '//',
    slot: eYo.Key.LHS
  },
  '/': {
    type: eYo.T3.Expr.m_expr,
    operator_d: '/',
    slot: eYo.Key.LHS
  },
  '%': {
    type: eYo.T3.Expr.m_expr,
    operator_d: '%',
    slot: eYo.Key.LHS
  },
  '@': {
    type: eYo.T3.Expr.m_expr,
    operator_d: '@',
    slot: eYo.Key.LHS
  },
  '**': {
    type: eYo.T3.Expr.power,
    slot: eYo.Key.LHS
  },
  '<<': {
    type: eYo.T3.Expr.shift_expr,
    operator_d: '<<',
    slot: eYo.Key.LHS
  },
  '>>': {
    type: eYo.T3.Expr.shift_expr,
    operator_d: '>>',
    slot: eYo.Key.LHS
  },
  '&': eYo.T3.Expr.and_expr,
  '^': eYo.T3.Expr.xor_expr,
  '|': eYo.T3.Expr.or_expr,
  'or': eYo.T3.Expr.or_test,
  'and': eYo.T3.Expr.and_test
}
for (K in Ks) {
  eYo.KeyHandler.register('… ' + K + ' …', Ks[K])
}
Ks = ['True', 'False', 'None', '...']
for (var i = 0; (K = Ks[i++]);) {
  eYo.KeyHandler.register(K, {
    type: eYo.T3.Expr.builtin__object,
    data: K
  })
}
Ks = ['is', 'is not', 'in', 'not in']
for (i = 0; (K = Ks[i++]);) {
  eYo.KeyHandler.register('… ' + K + ' …', {
    type: eYo.T3.Expr.object_comparison,
    operator_d: K
  })
}
Ks = ['<', '>', '==', '>=', '<=', '!=']
for (i = 0; (K = Ks[i++]);) {
  eYo.KeyHandler.register('… ' + K + ' …', {
    type: eYo.T3.Expr.number_comparison,
    operator_d: K
  })
}

Ks = {
  '… = …': eYo.T3.Stmt.assignment_stmt,
  '…:… = …': eYo.T3.Stmt.annotated_assignment_stmt,
  'start': eYo.T3.Stmt.start_stmt,
  'assert …': eYo.T3.Stmt.assert_stmt,
  'pass': eYo.T3.Stmt.pass_stmt,
  'break': eYo.T3.Stmt.break_stmt,
  'continue': eYo.T3.Stmt.continue_stmt,
  'del …': eYo.T3.Stmt.del_stmt,
  'return …': eYo.T3.Stmt.return_stmt,
  'yield …': eYo.T3.Stmt.yield_stmt,
  'raise': eYo.T3.Stmt.raise_stmt,
  'raise …': {
    type: eYo.T3.Stmt.raise_stmt,
    variant_d: eYo.Key.EXPRESSION
  },
  'raise … from …': {
    type: eYo.T3.Stmt.raise_stmt,
    variant_d: eYo.Key.FROM
  },
  // 'from future import …': eYo.T3.Stmt.future_statement,
  'import …': eYo.T3.Stmt.import_stmt,
  '# comment': eYo.T3.Stmt.expression_stmt,
  'global …': {
    type: eYo.T3.Stmt.global_stmt
  },
  'nonlocal …': {
    type: eYo.T3.Stmt.nonlocal_stmt
  },
  '@decorator': eYo.T3.Stmt.decorator_stmt,
  '"""…"""(stmt)': {
    type: eYo.T3.Stmt.docstring_stmt,
    delimiter_d: '"""'
  },
  "'''…'''(stmt)": {
    type: eYo.T3.Stmt.docstring_stmt,
    delimiter_d: "'''"
  },
  '"""…"""': {
    type: eYo.T3.Expr.longliteral,
    delimiter_d: '"""'
  },
  "'''…'''": {
    type: eYo.T3.Expr.longliteral,
    delimiter_d: "'''"
  },
  "'…'": {
    type: eYo.T3.Expr.shortliteral,
    delimiter_d: "'"
  },
  '"…"': {
    type: eYo.T3.Expr.shortliteral,
    delimiter_d: '"'
  },
  'print(…)': eYo.T3.Stmt.builtin__print_stmt,
  'input(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'input'
  },
  'range(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'range'
  },
  'int(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'int'
  },
  'float(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'float'
  },
  'complex(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'complex'
  },
  'list(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'list'
  },
  'set(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'set'
  },
  'len(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'len'
  },
  'min(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'min'
  },
  'max(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'max'
  },
  'sum(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'sum'
  },
  'pow(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'pow'
  },
  'trunc(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'trunc'
  },
  'abs(…)': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'abs'
  },
  '….conjugate()': {
    type: eYo.T3.Expr.call_expr,
    name_d: 'conjugate',
    dotted_d: 1
  },
  'f(…)': {
    action: eYo.KeyHandler.makeCall,
    model: {
      type: eYo.T3.Expr.call_expr,
      name_d: '' 
    }
  },
  'x[…]': {
    action: eYo.KeyHandler.makeSlicing,
    model: {
      type: eYo.T3.Expr.slicing,
      parent: true
    }
  },
  'module as alias': eYo.T3.Expr.dotted_name_as,
  '(…)': {
    type: eYo.T3.Expr.parenth_form,
    parent: true
  },
  '[…]': {
    type: eYo.T3.Expr.list_display,
    parent: true
  },
  '{…:…}': {
    type: eYo.T3.Expr.dict_display,
    parent: true
  },
  '{…}': {
    type: eYo.T3.Expr.set_display,
    parent: true
  }
}
console.warn('Implement support for `key` in range above')
console.warn('Problem when there can be both a statement and an expression for the same shortcut')
for (K in Ks) {
  eYo.KeyHandler.register(K, Ks[K])
}

Ks = ['+=', '-=', '*=', '@=', '/=', '//=', '%=', '**=', '>>=', '<<=', '&=', '^=', '|=']
for (i = 0; (K = Ks[i++]);) {
  eYo.KeyHandler.register('… ' + K + ' …', {
    type: eYo.T3.Stmt.augmented_assignment_stmt,
    operator: K
  })
}

// cmath
Ks = ['real', 'imag']
for (i = 0; (K = Ks[i++]);) {
  eYo.KeyHandler.register('… ' + K + ' …', {
    type: eYo.T3.Expr.call_expr,
    name_d: K
  })
}
