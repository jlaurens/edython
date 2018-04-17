/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Block delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.KeyHandler')
goog.provide('ezP.KeyHandlerMenu')

goog.require('ezP.DelegateSvg')
goog.require('ezP.PopupMenu')

ezP.KeyHandlerMenu = function(opt_domHelper, opt_renderer) {
  ezP.KeyHandlerMenu.superClass_.constructor.call(this, opt_domHelper, opt_renderer)
}
goog.inherits(ezP.KeyHandlerMenu, ezP.PopupMenu)

/**
 * Attempts to handle a keyboard event; returns true if the event was handled,
 * false otherwise.  If the container is enabled, and a child is highlighted,
 * calls the child control's `handleKeyEvent` method to give the control
 * a chance to handle the event first.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the event was handled by the container (or one of
 *     its children).
 */
ezP.KeyHandlerMenu.prototype.handleKeyEventInternal = function(e) {
  // Give the highlighted control the chance to handle the key event.
  if (ezP.KeyHandlerMenu.superClass_.handleKeyEventInternal.call(this, e)) {
    return true
  }
  return this.ezp.handleMenuKeyEvent(e)
};

console.warn('Problem inserting a print block')
/**
 * Key handler class.
 * For ezPython.
 * @param {!constructor} constructor is either a constructor or the name of a constructor.
 */
ezP.KeyHandler = function() {
  var me = {MAX_CHILD_COUNT: 20}
  var keys_ = []
  var shortcuts_ = [] // an array of {key: ..., action: ...} objects
  var current_ = []
  var target_
  var menu_ = new ezP.KeyHandlerMenu(/*undefined, ContextMenuRenderer*/)
  menu_.ezp = me
/**
 * Setup the shared key handler.
 * For ezPython.
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
    var c8n = ezP.SelectedConnection.get()
    if (B && !c8n && B.ezp.setSubtype(B, shortcut)) {
      return
    }
    var type = ezP.Do.typeOfString(shortcut)
    if (me.handleType(type, shortcut)) {
      return
    }
    if (B && B.ezp.setSubtype(B, shortcut)) {
      return
    }
    if (current_.length) {
      shortcut = current_[0]
      me.handleAction(shortcut)
      return
    }
  }

  me.handleType = function (type, subtype) {
    if (ezP.DelegateSvg.Manager.get(type)) {
      var B = Blockly.selected
      if (B) {
        var c8n = ezP.SelectedConnection.get()
        if (c8n) {
          var c8nType = c8n.type
          var newB
          if ((newB = B.ezp.insertBlockOfType(B, type, subtype)) || (newB = B.ezp.insertParent(B, type, subtype))) {
            // There was a selected connection,
            // we try to select another one, with possibly the same type
            // First we take a look at B : is there an unconnected input connection
            if (c8nType === Blockly.INPUT_VALUE) {
              var parent = B, last
              do {
                var e8r = parent.ezp.inputEnumerator(parent)
                while (e8r.next()) {
                  if ((c8n = e8r.here.connection) && c8n.type === c8nType && ! c8n.ezp.optional_ && ! c8n.targetConnection) {
                    if (!c8n.ezp.s7r_) {
                      ezP.SelectedConnection.set(c8n)
                      return true
                    } else {
                      last = c8n
                    }
                  }
                }
                if (last) {
                  ezP.SelectedConnection.set(last)
                  return true
                }
              } while ((parent = parent.getSurroundParent(parent)))
            } else if ((c8n === B.nextConnection) && (c8n = newB.nextConnection)) {
              ezP.SelectedConnection.set(c8n)
              return true
            }
            ezP.SelectedConnection.set(null)
            newB.select()
            return true
          }
        }
        if ((newB = B.ezp.insertBlockOfType(B, type, subtype)) || (newB = B.ezp.insertParent(B, type, subtype))) {
          var parent = B
          do {
            var e8r = parent.ezp.inputEnumerator(parent)
            while (e8r.next()) {
              if ((c8n = e8r.here.connection) && c8n.type === Blockly.INPUT_VALUE && ! c8n.ezp.optional_ && ! c8n.targetConnection) {
                ezP.SelectedConnection.set(c8n)
                return true
              }
            }
          } while ((parent = parent.getSurroundParent(parent)))
          ezP.SelectedConnection.set(null)
          newB.select()
          return true
        }
      }
    }
    return false
  }

  me.handleAction = function (shortcut) {
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
        if (ezP.XRE.id_continue.test(As[1]) && (!As[0].length || !ezP.XRE.id_continue.test(As[0]))) {
          var bonusA = true
        }
      }
      if (Bs.length > 1) {
        if (ezP.XRE.id_continue.test(Bs[1]) && (!Bs[0].length || !ezP.XRE.id_continue.test(Bs[0]))) {
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
        if (ezP.XRE.id_continue.test(As[As.length-2]) && (!As[As.length-1].length || !ezP.XRE.id_continue.test(As[As.length-1][0]))) {
          var bonusA = true
        }
      }
      if (Bs.length > 2) {
        if (ezP.XRE.id_continue.test(Bs[Bs.length-2]) && (!Bs[Bs.length-1].length || !ezP.XRE.id_continue.test(Bs[Bs.length-1][0]))) {
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
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
    ezP.Do.createSPAN(k, 'ezp-code-emph'))
    MI.setContent(content)
    MI.getModel().key = k
    if (current_.length) {
      if (menu_.getChildCount()<2) {
        menu_.addChild(new ezP.Separator(), true)
      }
      for (var i = 0, s; (s = current_[i]); i++) {
        Cs = s.components
        var j = 0, c = Cs[j++], d
        var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
          goog.dom.createTextNode(c))
        while ((d = Cs[j++]) != undefined && (c = Cs[j++]) != undefined) {
          content.appendChild(ezP.Do.createSPAN(d, 'ezp-code-emph'))
          content.appendChild(goog.dom.createTextNode(c))
        }
        if ((MI = menu_.getChildAt(i+2))) {
          MI.setModel(s)
          MI.setContent(content)
        } else {
          MI = new ezP.MenuItem(content, s)
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
    var content = ezP.Do.createSPAN(sep, 'ezp-code-emph')
    var MI = new ezP.MenuItem(content, {key: sep, action: me.handleFirstMenuItemAction})
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
      menu_.addChild(new ezP.Separator(), true)
    }
    i = 0
    while ( i < me.MAX_CHILD_COUNT && (shortcut = current_[i++])) {
      var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
        goog.dom.createTextNode(shortcut.components[0]),
        ezP.Do.createSPAN(shortcut.components[1], 'ezp-code-emph'),
        goog.dom.createTextNode(shortcut.components[2]),
      )
      var MI = new ezP.MenuItem(content, shortcut)
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
      if ((B = Blockly.selected) && B.ezp.showEditor) {
        event.preventDefault()
        event.stopPropagation()
        B.ezp.showEditor(B)
        return
      }
    }
    if ((B = Blockly.selected)) {
      if (K === ' ') {
        event.preventDefault()
        event.stopPropagation()
        ezP.MenuManager.shared().showMenu(B, event)
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
        var scaledHeight = ezP.Font.lineHeight() * B.workspace.scale
        var c8n = ezP.SelectedConnection.get()
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
          f.call(B.ezp, B)
        }  
        switch(k) {
          case 'arrowdown': return F(B.ezp.selectBlockBelow)
          case 'arrowup': return F(B.ezp.selectBlockAbove)
          case 'arrowleft': return F(B.ezp.selectBlockLeft)
          case 'arrowright': return F(B.ezp.selectBlockRight)
        }  
      }
    } else {
      var F = function (f) {
        event.preventDefault()
        event.stopPropagation()
        var block = ezP.DelegateSvg.getBestBlock(workspace, f)
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

ezP.KeyHandler.register('if', ezP.T3.Stmt.if_part)

var Ks = {
  'start': ezP.T3.Stmt.start_stmt,
  'if': ezP.T3.Stmt.if_part,
  'elif': ezP.T3.Stmt.elif_part,
  'else':  ezP.T3.Stmt.else_part,
  'class': ezP.T3.Stmt.classdef_part,
  'except': {
    type: ezP.T3.Stmt.except_part,
    subtype: 0,
  },
  'except …': {
    type: ezP.T3.Stmt.except_part,
    subtype: 1,
  },
  'except … as …': {
    type: ezP.T3.Stmt.except_part,
    subtype: 2,
  },
  'finally': ezP.T3.Stmt.finally_part,
  'for': ezP.T3.Stmt.for_part,
  '@': ezP.T3.Stmt.decorator_stmt,
  'def': ezP.T3.Stmt.funcdef_part,
  'import': ezP.T3.Stmt.import_stmt,
  'try': ezP.T3.Stmt.try_part,
  'while': ezP.T3.Stmt.while_part,
  'with': ezP.T3.Stmt.with_part,
  'lambda': ezP.T3.Expr.lambda_expr,
  '… if … else …': ezP.T3.Expr.conditional_expression_concrete,
  'identifier': ezP.T3.Expr.identifier,
  'name': ezP.T3.Expr.identifier,
  'not': function(key) {
    var B = Blockly.selected
    if (B) {
      var parent = B.getSurroundParent()
      if (parent && (parent.type === ezP.T3.Expr.not_test_concrete)) {
        B.ezp.replaceBlock(B, parent)
        return
      }
      if (ezP.SelectedConnection.get()) {
        B.ezp.insertBlockOfType(B, ezP.T3.Expr.not_test_concrete)
      } else {
        B.ezp.insertParent(B, ezP.T3.Expr.not_test_concrete)
      }
    }
  },                                    
  '±': function(key) {
    var B = Blockly.selected
    if (B) {
      var parent = B.getSurroundParent()
      if (parent && (parent.type === ezP.T3.Expr.u_expr_concrete) && parent.ezp.getSubtype() === '-') {
        B.ezp.replaceBlock(B, parent)
        return
      }
      if (ezP.SelectedConnection.get()) {
        B.ezp.insertBlockOfType(B, ezP.T3.Expr.u_expr_concrete, '-')
      } else {
        B.ezp.insertParent(B, ezP.T3.Expr.u_expr_concrete, '-')
      }
    }
  },                                    
  '~': function(key) {
    var B = Blockly.selected
    if (B) {
      var parent = B.getSurroundParent()
      if (parent && (parent.type === ezP.T3.Expr.u_expr_concrete) && parent.ezp.getSubtype() === '~') {
        B.ezp.replaceBlock(B, parent)
        return
      }
      if (ezP.SelectedConnection.get()) {
        B.ezp.insertBlockOfType(B, ezP.T3.Expr.u_expr_concrete, '~')
      } else {
        B.ezp.insertParent(B, ezP.T3.Expr.u_expr_concrete, '~')
      }
    }
  },
}
var K
for (K in Ks) {
  ezP.KeyHandler.register(K, Ks[K]);
}
Ks = {
  '+': {
    type: ezP.T3.Expr.a_expr_concrete,
    subtype: '+',
    input: ezP.Key.LHS,
  },
  '-': {
    type: ezP.T3.Expr.a_expr_concrete,
    subtype: '-',
    input: ezP.Key.LHS,
  },
  '*': {
    type: ezP.T3.Expr.m_expr_concrete,
    subtype: '*',
    input: ezP.Key.LHS,
  },
  '//': {
    type: ezP.T3.Expr.m_expr_concrete,
    subtype: '//',
    input: ezP.Key.LHS,
  },
  '/': {
    type: ezP.T3.Expr.m_expr_concrete,
    subtype: '/',
    input: ezP.Key.LHS,
  },
  '%': {
    type: ezP.T3.Expr.m_expr_concrete,
    subtype: '%',
    input: ezP.Key.LHS,
  },
  '@': {
    type: ezP.T3.Expr.m_expr_concrete,
    subtype: '@',
    input: ezP.Key.LHS,
  },
  '<<': {
    type: ezP.T3.Expr.shift_expr_concrete,
    subtype: '<<',
    input: ezP.Key.LHS,
  },
  '>>': {
    type: ezP.T3.Expr.shift_expr_concrete,
    subtype: '>>',
    input: ezP.Key.LHS,
  },
  '&': ezP.T3.Expr.and_expr_concrete,
  '^': ezP.T3.Expr.xor_expr_concrete,
  '|': ezP.T3.Expr.or_expr_concrete,
  'or': ezP.T3.Expr.or_test_concrete,
  'and': ezP.T3.Expr.and_test_concrete,
}
for (K in Ks) {
  ezP.KeyHandler.register('… '+K+' …', Ks[K]);
}
Ks = ['True', 'False', 'None', '...']
for (var i = 0; (K = Ks[i++]); ) {
  ezP.KeyHandler.register(K, {
    type: ezP.T3.Expr.builtin_object,
    subtype: K,
  });
}
Ks = ['is', 'is not', 'in', 'not in']
for (var i = 0; (K = Ks[i++]); ) {
  ezP.KeyHandler.register('… '+K+' …', {
    type: ezP.T3.Expr.object_comparison,
    subtype: K,
  });
}
Ks = ['<', '>', '==', '>=', '<=', '!=']
for (var i = 0; (K = Ks[i++]); ) {
  ezP.KeyHandler.register('… '+K+' …', {
    type: ezP.T3.Expr.number_comparison,
    subtype: K,
  });
}

Ks = {
  '… = …': ezP.T3.Stmt.assignment_stmt,
  '…:… = …': ezP.T3.Stmt.annotated_assignment_stmt,
  'start': ezP.T3.Stmt.start_stmt,
  'assert …': ezP.T3.Stmt.assert_stmt,
  'pass': ezP.T3.Stmt.pass_stmt,
  'break': ezP.T3.Stmt.break_stmt,
  'continue': ezP.T3.Stmt.continue_stmt,
  'del …': ezP.T3.Stmt.del_stmt,
  'return …': ezP.T3.Stmt.return_stmt,
  'yield …': ezP.T3.Stmt.yield_stmt,
  'raise': {
    type: ezP.T3.Stmt.raise_stmt,
    subtype: 0,
  },
  'raise …': {
    type: ezP.T3.Stmt.raise_stmt,
    subtype: 1,
  },
  'raise … from …': {
    type: ezP.T3.Stmt.raise_stmt,
    subtype: 2,
  },
  // 'from future import …': ezP.T3.Stmt.future_statement,
  'import …': ezP.T3.Stmt.import_stmt,
  '# comment': ezP.T3.Stmt.comment_stmt,
  'global …': {
    type: ezP.T3.Stmt.global_nonlocal_stmt,
    subtype: 'global',
  },
  'nonlocal …': {
    type: ezP.T3.Stmt.global_nonlocal_stmt,
    subtype: 'nonlocal',
  },
  '@decorator': ezP.T3.Stmt.decorator_stmt,
  '"""…"""(def)': ezP.T3.Stmt.docstring_def_stmt,
  "'''…'''(def)": ezP.T3.Stmt.docstring_def_stmt,
  '"""…"""': {
    type: ezP.T3.Expr.longstringliteral,
    subtype: '"""',
  },
  "'''…'''": {
    type: ezP.T3.Expr.longstringliteral,
    subtype: "'''",
  },
  'print(…)': ezP.T3.Stmt.builtin_print_stmt,
  'input(…)': ezP.T3.Expr.builtin_input_expr,
  'range(…)': {
    type: ezP.T3.Expr.builtin_call_expr,
    subtype: 'range',
    key: ezP.Key.UPPER_BOUND,
  },
  'list(…)': {
    type: ezP.T3.Expr.builtin_call_expr,
    subtype: 'list',
  },
  'set(…)': {
    type: ezP.T3.Expr.builtin_call_expr,
    subtype: 'set',
  },
  'len(…)': {
    type: ezP.T3.Expr.builtin_call_expr,
    subtype: 'len',
  },
  'sum(…)': {
    type: ezP.T3.Expr.builtin_call_expr,
    subtype: 'sum',
  },
  'module as alias': ezP.T3.Expr.module_as_concrete,
  '(…)': ezP.T3.Expr.parenth_form,
  '[…]': ezP.T3.Expr.list_display,
  '{…:…}': ezP.T3.Expr.dict_display,
  '{…}': ezP.T3.Expr.set_display,
}
console.warn('Implement support for `key` in range above')
console.warn('Problem when there can be both a statement and an expression for the same shortcut')
var K
for (K in Ks) {
  ezP.KeyHandler.register(K, Ks[K]);
}

Ks = ['+=', '-=', '*=', '@=', '/=', '//=', '%=', '**=',]
for (var i = 0; (K = Ks[i++]); ) {
  ezP.KeyHandler.register('… '+K+' …', {
    type: ezP.T3.Stmt.augassign_numeric_stmt,
    subtype: K,
  });
}
Ks = ['>>=', '<<=', '&=', '^=', '|=',]
for (var i = 0; (K = Ks[i++]); ) {
  ezP.KeyHandler.register('… '+K+' …', {
    type: ezP.T3.Stmt.augassign_bitwise_stmt,
    subtype: K,
  });
}
