/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
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

  // var highlighted = this.getHighlighted();
  // if (highlighted && typeof highlighted.handleKeyEvent == 'function' &&
  //     highlighted.handleKeyEvent(e)) {
  //   return true;
  // }

  // // Give the open control the chance to handle the key event.
  // if (this.openItem_ && this.openItem_ != highlighted &&
  //     typeof this.openItem_.handleKeyEvent == 'function' &&
  //     this.openItem_.handleKeyEvent(e)) {
  //   return true;
  // }

  // // Do not handle the key event if any modifier key is pressed.
  // if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
  //   return false;
  // }

  // // Either nothing is highlighted, or the highlighted control didn't handle
  // // the key event, so attempt to handle it here.
  // switch (e.keyCode) {
  //   case goog.events.KeyCodes.ESC:
  //     if (this.isFocusable()) {
  //       this.getKeyEventTarget().blur();
  //     } else {
  //       return false;
  //     }
  //     break;

  //   case goog.events.KeyCodes.HOME:
  //     this.highlightFirst();
  //     break;

  //   case goog.events.KeyCodes.END:
  //     this.highlightLast();
  //     break;

  //   case goog.events.KeyCodes.UP:
  //     if (this.orientation_ == goog.ui.Container.Orientation.VERTICAL) {
  //       this.highlightPrevious();
  //     } else {
  //       return false;
  //     }
  //     break;

  //   case goog.events.KeyCodes.LEFT:
  //     if (this.orientation_ == goog.ui.Container.Orientation.HORIZONTAL) {
  //       if (this.isRightToLeft()) {
  //         this.highlightNext();
  //       } else {
  //         this.highlightPrevious();
  //       }
  //     } else {
  //       return false;
  //     }
  //     break;

  //   case goog.events.KeyCodes.DOWN:
  //     if (this.orientation_ == goog.ui.Container.Orientation.VERTICAL) {
  //       this.highlightNext();
  //     } else {
  //       return false;
  //     }
  //     break;

  //   case goog.events.KeyCodes.RIGHT:
  //     if (this.orientation_ == goog.ui.Container.Orientation.HORIZONTAL) {
  //       if (this.isRightToLeft()) {
  //         this.highlightPrevious();
  //       } else {
  //         this.highlightNext();
  //       }
  //     } else {
  //       return false;
  //     }
  //     break;

  //   default:
  //     return false;
  // }

  return true;
};

/**
 * Key handler class.
 * For ezPython.
 * @param {!constructor} constructor is either a constructor or the name of a constructor.
 */
ezP.KeyHandler = function() {
  var me = {MAX_CHILD_COUNT: 20}
  var keys_ = []
  var shortcuts_ = [] // an array of {key: ..., action: ...} objects ordered by key
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
    var key = event.key
    if (key === 'Dead') {
      if (event.keyCode === 78) { // this is on osx, change it twice if necessary
        key = '~'
      } else if (event.keyCode === 219) { // this is on osx
        key = '^'
      } else {
        return
      }
    } else if (key === 'Backspace') {
      event.preventDefault()
      event.stopPropagation()  
      key = undefined
    }
    if (me.updateMenu(key)) {
      event.preventDefault()
      event.stopPropagation()  
      return true
    }
    return false
  }
  me.handleMenuItemAction = function (event) {
    var MI = event.target
    var s = MI.getModel()
    if (goog.isFunction(s.action)) {
      s.action(s.key)
    } else if (s.action) {
      var B = Blockly.selected
      if (B) {
         B.ezp.insertBlockOfType(B, s.action)
       }
    } else {
      console.log('Unknown', s.key)
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
      if (current_.length) {
        var l = current_[0].components.length - 2
        if (l < 3) {
          return
        }
        var newCurrent = []
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
      }
    } else if (sep.length === 1) {
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
      return
    }
    var oldLength = current_.length
    if (newCurrent.length) {
      current_ = newCurrent
    } else {
      return 0
    }
    var MI = menu_.getHighlighted()
    if (MI) {
      var highlighted = MI.model
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
      if ((MI = menu_.getChildAt(i))) {
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
    while ((MI = menu_.getChildAt(i))) {
      menu_.removeChild(MI, true)      
    }
    return oldLength - current_.length
  }
  me.populateMenu = function (sep) {
    current_.length = 0
    menu_.removeChildren(true)
    if (sep.length !== 1) {
      return
    }
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
    if (menu_.isVisible()) {
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
    var key = event.key
    if (key.toLowerCase() === 'dead') {
      if (event.keyCode === 78) { // this is on osx
        key = '~'
      } else if (event.keyCode === 219) { // this is on osx
        key = '^'
      } else {
        return
      }
    }
    if (B = Blockly.selected) {
      if (event.key === ' ') {
        event.preventDefault()
        event.stopPropagation()
        ezP.MenuManager.shared().showMenu(B, event)
        return
      }
      me.populateMenu(key)
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
            setTimeout(function () {// try/finally?
              if (me.alreadyListened_) {
                console.log('************* I have already listened!')
                return
              }
              me.alreadyListened = true
              me.handleMenuItemAction(event)
            }, 100)// TODO be sure that this 100 is suffisant
          })    
        }
        var scaledHeight = ezP.Font.lineHeight() * B.workspace.scale
        var xy = goog.style.getPageOffset(B.svgGroup_)
        menu_.showMenu(B.svgGroup_, xy.x, xy.y + scaledHeight+2)
        menu_.highlightFirst()
      } else {
        var F = function (f) {
          event.preventDefault()
          event.stopPropagation()
          f.call(B.ezp, B)
        }  
        switch(event.key.toLowerCase()) {
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
      switch(event.key.toLowerCase()) {
        case 'arrowdown': F(function(P) {return P.y}); return
        case 'arrowup': F(function(P) {return -P.y}); return
        case 'arrowleft': F(function(P) {return -P.x}); return
        case 'arrowright': F(function(P) {return P.x}); return
      }
    }
    return

    if (B && event.keyCode === 13) {// Enter
      if (menu_.isVisible()) {
        // let someone else catch that event
        return
      }

      var key = keys_.join('')
      var action = shortcuts_[key]
      if (goog.isFunction(action)) {
        action(key)
      } else if (action) {
        if (B) {
           B.ezp.insertBlockOfType(B, action)
         }
      } else {
        console.log('Unknown', key)
      }
      keys_ = []
    } else if (event.key === ' ' && !keys_.length){
      event.preventDefault()
      event.stopPropagation()
      if (B) {
        ezP.MenuManager.shared().showMenu(B, event)
      }
    } else if (event.key.length<2){
      event.preventDefault()
      event.stopPropagation()
      keys_.push(event.key)
    } else if (event.key === 'Dead') {
      if (event.keyCode === 78) { // this is on osx
        keys_.push('~')
      } else if (event.keyCode === 219) { // this is on osx
        keys_.push('^')
      }
      event.preventDefault()
    } else if (B = Blockly.selected) {
      event.preventDefault()
      event.stopPropagation()
      switch(event.key) {
        case 'arrowDown': B.ezp.selectBlockBelow(B); return
        case 'arrowUp': B.ezp.selectBlockAbove(B); return
        case 'arrowLeft': B.ezp.selectBlockLeft(B); return
        case 'arrowRight': B.ezp.selectBlockRight(B); return
      }
    }
  }
  return me
} ()

ezP.KeyHandler.register('if', ezP.T3.Stmt.if_part)

var Ks = {
  'if': ezP.T3.Stmt.if_part,
  'elif': ezP.T3.Stmt.elif_part,
  'else':  ezP.T3.Stmt.else_part,
  'class': ezP.T3.Stmt.classdef_part,
  'except': ezP.T3.Stmt.except_part,
  'finally': ezP.T3.Stmt.finally_part,
  'for': ezP.T3.Stmt.for_part,
  '@': ezP.T3.Stmt.decorator_stmt,
  'def': ezP.T3.Stmt.funcdef_part,
  'import': ezP.T3.Stmt.import_part,
  'try': ezP.T3.Stmt.try_part,
  'while': ezP.T3.Stmt.while_part,
  'with': ezP.T3.Stmt.with_part,
  'lambda': ezP.T3.Expr.lambda_expr,
  '… if … else …': ezP.T3.Expr.conditional_expression_concrete,
  'identifier': ezP.T3.Expr.identifier,
  'name': ezP.T3.Expr.identifier,
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
  'not': function(key) {
    var B = Blockly.selected
    if (B) {
      var parent = B.getSurroundParent()
      if (parent && (parent.type === ezP.T3.Expr.not_test_concrete)) {
        B.ezp.replaceBlock(B, parent)
        return
      }
      B.ezp.insertBlockOfType(B, ezP.T3.Expr.not_test_concrete)
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
      B.ezp.insertBlockOfType(B, ezP.T3.Expr.u_expr_concrete, '-')
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
      B.ezp.insertBlockOfType(B, ezP.T3.Expr.u_expr_concrete, '~')
    }
  },
}
var K
for (K in Ks) {
  ezP.KeyHandler.register(K, Ks[K]);
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
  ezP.KeyHandler.register(K, {
    type: ezP.T3.Expr.object_comparison,
    subtype: K,
  });
}
Ks = ['<', '>', '==', '>=', '<=', '!=']
for (var i = 0; (K = Ks[i++]); ) {
  ezP.KeyHandler.register(K, {
    type: ezP.T3.Expr.number_comparison,
    subtype: K,
  });
}
