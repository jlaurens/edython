/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Block delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.KeyHandler')
goog.provide('eYo.KeyHandlerMenu')

goog.require('eYo.DelegateSvg')
goog.require('eYo.PopupMenu')
goog.require('eYo.MenuItem')
goog.require('eYo.Separator')

eYo.KeyHandlerMenu = function(opt_domHelper, opt_renderer) {
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
eYo.KeyHandlerMenu.prototype.handleKeyEventInternal = function(e) {
  // Give the highlighted control the chance to handle the key event.
  if (eYo.KeyHandlerMenu.superClass_.handleKeyEventInternal.call(this, e)) {
    return true
  }
  return this.eyo.handleMenuKeyEvent(e)
};

console.warn('Problem inserting a print block')
/**
 * Key handler class.
 * For edython.
 * @param {!constructor} constructor is either a constructor or the name of a constructor.
 */
eYo.KeyHandler = function() {
  var me = {MAX_CHILD_COUNT: 20}
  var keys_ = []
  var shortcuts_ = [] // an array of {key: ..., action: ...} objects
  var current_ = []
  var target_
  var menu_ = new eYo.KeyHandlerMenu(/*undefined, ContextMenuRenderer*/)
  menu_.eyo = me
/**
 * Setup the shared key handler.
 * For edython.
 * @param {!constructor} constructor is either a constructor or the name of a constructor.
 */
  me.setup = function(document) {
    target_ = document
    goog.events.listen(
      document, goog.events.EventType.KEYDOWN, me.handleKeyDown_,
      undefined /* opt_capture */, me
    )
  }
  me.register = function(key, action) {
    // manage duplicates
    if (key.length) {
      goog.asserts.assert(action, 'No action to register for '+key)
      for (var i = 0, s; (s = shortcuts_[i]); i++) {
        if (s.key === key) {
          shortcuts_[i] = {
            key: key,
            action: action,
          }
          return
        }
      }
      shortcuts_.push({
        key: key,
        action: action,
      })
    }
  }
  console.warn('Change the value and subtype')
  /**
   * Separate key in 2 parts: what is before the frst occurrence of sep and what is after.
   * If sep is not in the list, returns undefined.
   * split('foo', 'f') -> ['', 'oo']
   * split('foo', 'o') -> ['f', 'o']
   * split('bar', 'r') -> ['ba', '']
   * split('foo', 'b') -> undefined
   * @param {string} key
   * @param {string} sep
   * @return an array of 2 elements, what is before sep and what is after
   */
  me.split = function (key, sep) {
    var i = key.indexOf(sep)
    if (i < 0) {
      return undefined
    }
    return [key.substring(0, i), key.substring(i+sep.length)]
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
  me.handleFirstMenuItemAction = function (shortcut) {
    // if key is a number, then create a number block
    // if the shortcut fits an identifier, then create an identifier
    // if the shortcut fits a number, then create a number
    // if the shortcut fits a string literal, then create a string literal
    // otherwise, take the first shortcut and pass it to handleAction
    // if the selected block supports subtypes, then set it
    var B = Blockly.selected
    var c8n = eYo.SelectedConnection.get()
    if (B && !c8n && B.eyo.data.subtype.set(shortcut)) {
      return
    }
    var type = eYo.Do.typeOfString(shortcut)
    if (me.handleType(type, shortcut)) {
      return
    }
    if (B && B.eyo.data.subtype.set(shortcut)) {
      return
    }
    if (current_.length) {
      shortcut = current_[0]
      me.handleAction(shortcut)
      return
    }
  }

  me.handleType = function (type, subtype) {
    console.log('me.handleType',type, subtype)
    if (eYo.DelegateSvg.Manager.get(type)) {
      var B = Blockly.selected
      if (B) {
        var c8n = eYo.SelectedConnection.get()
        if (c8n) {
          var c8nType = c8n.type
          var newB
          if ((newB = B.eyo.insertBlockOfType(B, type, subtype)) || (newB = B.eyo.insertParent(B, type, subtype))) {
            // There was a selected connection,
            // we try to select another one, with possibly the same type
            // First we take a look at B : is there an unconnected input connection
            var doFirst = function(block, type) {
              var e8r = block.eyo.inputEnumerator(block)
              while (e8r.next()) {
                if ((c8n = e8r.here.connection) && c8n.type === type) {
                  if (!c8n.hidden_ && !c8n.targetConnection) {
                    eYo.SelectedConnection.set(c8n)
                    return true
                  } else if (c8n.targetConnection) {
                    return doFirst(c8n.targetBlock(), type)
                  }
                }
              }
            }
            if (doFirst(newB, Blockly.INPUT_VALUE)) {
              return true
            } else if ((c8n === B.nextConnection) && (c8n = newB.nextConnection) && !c8n.hidden_) {
              eYo.SelectedConnection.set(c8n)
              return true
            }
            eYo.SelectedConnection.set(null)
            newB.select()
            return true
          }
        }
        if ((newB = B.eyo.insertBlockOfType(B, type, subtype)) || (newB = B.eyo.insertParent(B, type, subtype))) {
          var parent = B
          do {
            var e8r = parent.eyo.inputEnumerator(parent)
            while (e8r.next()) {
              if ((c8n = e8r.here.connection) && c8n.type === Blockly.INPUT_VALUE && ! c8n.eyo.optional_ && ! c8n.targetConnection) {
                eYo.SelectedConnection.set(c8n)
                return true
              }
            }
          } while ((parent = parent.getSurroundParent(parent)))
          eYo.SelectedConnection.set(null)
          newB.select()
          return true
        }
      }
      console.log('NO selected')
    }
    return false
  }

  me.handleAction = function (shortcut) {
    console.log('me.handleAction',shortcut)
    if (goog.isFunction(shortcut.action)) {
      shortcut.action(shortcut.key)
    } else if (shortcut.action) {
      me.handleType(shortcut.action.type || shortcut.action, shortcut.action.subtype)
    } else {
      return false
    }
    menu_.removeChildren(true)
    return true
  }
  /**
   * The me.split must have been called
   * @param {Object} shortcut
   * @private
   */
  me.insertShortcutInArray_ = function(shortcut, current_) {
    var lhs = shortcut.components
    var compare = function(As, Bs) {
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
        if (eYo.XRE.id_continue.test(As[As.length-2]) && (!As[As.length-1].length || !eYo.XRE.id_continue.test(As[As.length-1][0]))) {
          var bonusA = true
        }
      }
      if (Bs.length > 2) {
        if (eYo.XRE.id_continue.test(Bs[Bs.length-2]) && (!Bs[Bs.length-1].length || !eYo.XRE.id_continue.test(Bs[Bs.length-1][0]))) {
          var bonusB = true
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
    for (var j = 0, s;(s = current_[j]); j++) {
      var cmp = compare(lhs, s.components)
      if (cmp<=0) {
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
        for (var i = 0, s; (s = shortcuts_[i++]); ) {
          var Cs = s.components
          if (Cs) {
            if (Cs.length === l) {
              me.insertShortcutInArray_(s, newCurrent)
            } else if (Cs.length > l) {
              var last = Cs.slice(Cs.length-3, Cs.length).join('')
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
        for (var i = 0, s; (s = current_[i++]); ) {
          var Cs = s.components
          var last = Cs[Cs.length-1]
          var split = me.split(last, sep)
          if (split) {
            Cs.splice(Cs.length-1, 1, split[0], sep, split[1])
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
    MI.getModel().key = k
    if (current_.length) {
      if (menu_.getChildCount()<2) {
        menu_.addChild(new eYo.Separator(), true)
      }
      for (var i = 0, s; (s = current_[i]); i++) {
        Cs = s.components
        var j = 0, c = Cs[j++], d
        content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
          goog.dom.createTextNode(c))
        while ((d = Cs[j++]) != undefined && (c = Cs[j++]) != undefined) {
          content.appendChild(eYo.Do.createSPAN(d, 'eyo-code-emph'))
          content.appendChild(goog.dom.createTextNode(c))
        }
        if ((MI = menu_.getChildAt(i+2))) {
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
      while ((MI = menu_.getChildAt(i+2))) {
        menu_.removeChild(MI, true)
      }
    } else {
      while ((MI = menu_.getChildAt(1))) {
        menu_.removeChild(MI, true)
      }
    }
  }
  me.populateMenu = function (sep) {
    current_.length = 0
    menu_.removeChildren(true)
    if (sep.length !== 1) {
      return
    }
    keys_.push(sep)
    var content = eYo.Do.createSPAN(sep, 'eyo-code-emph')
    var MI = new eYo.MenuItem(content, {key: sep, action: me.handleFirstMenuItemAction})
    menu_.addChild(MI, true)

    // initialize the shortcuts to hold informations
    // - to build the menuitem content
    // - to sort and filter the menu items
    var i = 0, shortcut, split
    while ((shortcut = shortcuts_[i++])) {
      if ((split = me.split(shortcut.key, sep))) {
        shortcut.components = [split[0], sep, split[1]]
        me.insertShortcutInArray_(shortcut, current_)
      } else {
        shortcut.components = undefined
      }
    }
    if (current_.length) {
      menu_.addChild(new eYo.Separator(), true)
    }
    i = 0
    while ( i < me.MAX_CHILD_COUNT && (shortcut = current_[i++])) {
      content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
        goog.dom.createTextNode(shortcut.components[0]),
        eYo.Do.createSPAN(shortcut.components[1], 'eyo-code-emph'),
        goog.dom.createTextNode(shortcut.components[2]),
      )
      MI = new eYo.MenuItem(content, shortcut)
      menu_.addChild(MI, true)
    }
    return
  }
  me.handleKeyDown_ = function(event) {
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
          goog.events.listenOnce(menu_, 'action', function (event) {
            me.alreadyListening_ = false
            var target = event.target
            if (target) {
              var shortcut = target.getModel()
              if (shortcut) {
                setTimeout(function () {// try/finally?
                  if (me.alreadyListened_) {
                    console.log('************* I have already listened!')
                    return
                  }
                  me.alreadyListened = true
                  shortcut.key && me.handleAction(shortcut)
                  || me.handleFirstMenuItemAction(shortcut)
                }, 100)// TODO be sure that this 100 is suffisant
              }
            }
          })
        }
        var scaledHeight = eYo.Font.lineHeight() * B.workspace.scale
        var c8n = eYo.SelectedConnection.get()
        if (c8n && c8n.sourceBlock_) {
          var xy = goog.style.getPageOffset(c8n.sourceBlock_.svgGroup_)
          var xxyy = c8n.offsetInBlock_.clone().scale(B.workspace.scale)
          xy.translate(xxyy)
        } else {
          var xy = goog.style.getPageOffset(B.svgGroup_)
        }
        menu_.showMenu(B.svgGroup_, xy.x, xy.y + scaledHeight+2)
        menu_.highlightFirst()
      } else {
        var F = function (f) {
          event.preventDefault()
          event.stopPropagation()
          f.call(B.eyo, B)
        }
        switch(k) {
          case 'arrowdown': return F(B.eyo.selectBlockBelow)
          case 'arrowup': return F(B.eyo.selectBlockAbove)
          case 'arrowleft': return F(B.eyo.selectBlockLeft)
          case 'arrowright': return F(B.eyo.selectBlockRight)
        }
      }
    } else {
      var F = function (f) {
        event.preventDefault()
        event.stopPropagation()
        var block = eYo.DelegateSvg.getBestBlock(B.workspace, f)
        if (block) {
          block.select()
        }
      }
      switch(k) {
        case 'arrowdown': F(function(P) {return P.y}); return
        case 'arrowup': F(function(P) {return -P.y}); return
        case 'arrowleft': F(function(P) {return -P.x}); return
        case 'arrowright': F(function(P) {return P.x}); return
      }
    }
    return
  }
  return me
} ()

eYo.KeyHandler.register('if', eYo.T3.Stmt.if_part)

var Ks = {
  'start': eYo.T3.Stmt.start_stmt,
  'if': eYo.T3.Stmt.if_part,
  'elif': eYo.T3.Stmt.elif_part,
  'else':  eYo.T3.Stmt.else_part,
  'class': eYo.T3.Stmt.classdef_part,
  'except': {
    type: eYo.T3.Stmt.except_part,
    subtype: 0,
  },
  'except …': {
    type: eYo.T3.Stmt.except_part,
    subtype: 1,
  },
  'except … as …': {
    type: eYo.T3.Stmt.except_part,
    subtype: 2,
  },
  'finally': eYo.T3.Stmt.finally_part,
  'for': eYo.T3.Stmt.for_part,
  '@': eYo.T3.Stmt.decorator,
  'def': eYo.T3.Stmt.funcdef_part,
  'import': eYo.T3.Stmt.import_stmt,
  'try': eYo.T3.Stmt.try_part,
  'while': eYo.T3.Stmt.while_part,
  'with': eYo.T3.Stmt.with_part,
  'lambda': eYo.T3.Expr.lambda_expr,
  '… if … else …': eYo.T3.Expr.conditional_expression_s3d,
  'identifier': eYo.T3.Expr.identifier,
  'name': eYo.T3.Expr.identifier,
  'not': function(key) {
    var B = Blockly.selected
    if (B) {
      var parent = B.getSurroundParent()
      if (parent && (parent.type === eYo.T3.Expr.not_test_s3d)) {
        B.eyo.replaceBlock(B, parent)
        return
      }
      if (eYo.SelectedConnection.get()) {
        B.eyo.insertBlockOfType(B, eYo.T3.Expr.not_test_s3d)
      } else {
        B.eyo.insertParent(B, eYo.T3.Expr.not_test_s3d)
      }
    }
  },
  '±': function(key) {
    var B = Blockly.selected
    if (B) {
      var parent = B.getSurroundParent()
      if (parent && (parent.type === eYo.T3.Expr.u_expr_s3d) && parent.eyo.data.subtype.get() === '-') {
        B.eyo.replaceBlock(B, parent)
        return
      }
      if (eYo.SelectedConnection.get()) {
        B.eyo.insertBlockOfType(B, eYo.T3.Expr.u_expr_s3d, '-')
      } else {
        B.eyo.insertParent(B, eYo.T3.Expr.u_expr_s3d, '-')
      }
    }
  },
  '~': function(key) {
    var B = Blockly.selected
    if (B) {
      var parent = B.getSurroundParent()
      if (parent && (parent.type === eYo.T3.Expr.u_expr_s3d) && parent.eyo.data.subtype.get() === '~') {
        B.eyo.replaceBlock(B, parent)
        return
      }
      if (eYo.SelectedConnection.get()) {
        B.eyo.insertBlockOfType(B, eYo.T3.Expr.u_expr_s3d, '~')
      } else {
        B.eyo.insertParent(B, eYo.T3.Expr.u_expr_s3d, '~')
      }
    }
  },
}
var K
for (K in Ks) {
  eYo.KeyHandler.register(K, Ks[K]);
}
Ks = {
  '+': {
    type: eYo.T3.Expr.a_expr_s3d,
    subtype: '+',
    input: eYo.Key.LHS,
  },
  '-': {
    type: eYo.T3.Expr.a_expr_s3d,
    subtype: '-',
    input: eYo.Key.LHS,
  },
  '*': {
    type: eYo.T3.Expr.m_expr_s3d,
    subtype: '*',
    input: eYo.Key.LHS,
  },
  '//': {
    type: eYo.T3.Expr.m_expr_s3d,
    subtype: '//',
    input: eYo.Key.LHS,
  },
  '/': {
    type: eYo.T3.Expr.m_expr_s3d,
    subtype: '/',
    input: eYo.Key.LHS,
  },
  '%': {
    type: eYo.T3.Expr.m_expr_s3d,
    subtype: '%',
    input: eYo.Key.LHS,
  },
  '@': {
    type: eYo.T3.Expr.m_expr_s3d,
    subtype: '@',
    input: eYo.Key.LHS,
  },
  '<<': {
    type: eYo.T3.Expr.shift_expr_s3d,
    subtype: '<<',
    input: eYo.Key.LHS,
  },
  '>>': {
    type: eYo.T3.Expr.shift_expr_s3d,
    subtype: '>>',
    input: eYo.Key.LHS,
  },
  '&': eYo.T3.Expr.and_expr_s3d,
  '^': eYo.T3.Expr.xor_expr_s3d,
  '|': eYo.T3.Expr.or_expr_s3d,
  'or': eYo.T3.Expr.or_test_s3d,
  'and': eYo.T3.Expr.and_test_s3d,
}
for (K in Ks) {
  eYo.KeyHandler.register('… '+K+' …', Ks[K]);
}
Ks = ['True', 'False', 'None', '...']
for (var i = 0; (K = Ks[i++]); ) {
  eYo.KeyHandler.register(K, {
    type: eYo.T3.Expr.builtin_object,
    subtype: K,
  });
}
Ks = ['is', 'is not', 'in', 'not in']
for (i = 0; (K = Ks[i++]); ) {
  eYo.KeyHandler.register('… '+K+' …', {
    type: eYo.T3.Expr.object_comparison,
    subtype: K,
  });
}
Ks = ['<', '>', '==', '>=', '<=', '!=']
for (i = 0; (K = Ks[i++]); ) {
  eYo.KeyHandler.register('… '+K+' …', {
    type: eYo.T3.Expr.number_comparison,
    subtype: K,
  });
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
  'raise': {
    type: eYo.T3.Stmt.raise_stmt,
    subtype: 0,
  },
  'raise …': {
    type: eYo.T3.Stmt.raise_stmt,
    subtype: 1,
  },
  'raise … from …': {
    type: eYo.T3.Stmt.raise_stmt,
    subtype: 2,
  },
  // 'from future import …': eYo.T3.Stmt.future_statement,
  'import …': eYo.T3.Stmt.import_stmt,
  '# comment': eYo.T3.Stmt.any_stmt,
  'global …': {
    type: eYo.T3.Stmt.global_nonlocal_stmt,
    subtype: 'global',
  },
  'nonlocal …': {
    type: eYo.T3.Stmt.global_nonlocal_stmt,
    subtype: 'nonlocal',
  },
  '@decorator': eYo.T3.Stmt.decorator,
  '"""…"""(def)': eYo.T3.Stmt.docstring_def_stmt,
  "'''…'''(def)": eYo.T3.Stmt.docstring_def_stmt,
  '"""…"""': {
    type: eYo.T3.Expr.longstringliteral,
    subtype: '"""',
  },
  "'''…'''": {
    type: eYo.T3.Expr.longstringliteral,
    subtype: "'''",
  },
  'print(…)': eYo.T3.Stmt.builtin_print_stmt,
  'input(…)': eYo.T3.Expr.builtin_input_expr,
  'range(…)': {
    type: eYo.T3.Expr.builtin_call_expr,
    subtype: 'range',
    key: eYo.Key.UPPER_BOUND,
  },
  'list(…)': {
    type: eYo.T3.Expr.builtin_call_expr,
    callee: 'list',
  },
  'set(…)': {
    type: eYo.T3.Expr.builtin_call_expr,
    callee: 'set',
  },
  'len(…)': {
    type: eYo.T3.Expr.builtin_call_expr,
    callee: 'len',
  },
  'sum(…)': {
    type: eYo.T3.Expr.builtin_call_expr,
    callee: 'sum',
  },
  'module as alias': eYo.T3.Expr.module_as_s3d,
  '(…)': eYo.T3.Expr.parenth_form,
  '[…]': eYo.T3.Expr.list_display,
  '{…:…}': eYo.T3.Expr.dict_display,
  '{…}': eYo.T3.Expr.set_display,
}
console.warn('Implement support for `key` in range above')
console.warn('Problem when there can be both a statement and an expression for the same shortcut')
for (K in Ks) {
  eYo.KeyHandler.register(K, Ks[K]);
}

Ks = ['+=', '-=', '*=', '@=', '/=', '//=', '%=', '**=','>>=', '<<=', '&=', '^=', '|=',]
for (i = 0; (K = Ks[i++]); ) {
  eYo.KeyHandler.register('… '+K+' …', {
    type: eYo.T3.Stmt.augmented_assignment_stmt,
    operator: K,
  });
}
