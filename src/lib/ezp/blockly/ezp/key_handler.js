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

goog.require('ezP.DelegateSvg')

/**
 * Key handler class.
 * For ezPython.
 * @param {!constructor} constructor is either a constructor or the name of a constructor.
 */
ezP.KeyHandler = function() {
  var me = {
    FLUSH_TIME: 2000,
  }
  var t_ = new Date().getTime()
  var keys_ = []
  var shortcuts_ = {}
  var target_
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
    shortcuts_[key] = action
  }
  me.handleKeyDown_ = function(event) {
    console.log(event)
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
    var t = new Date().getTime()
    if (t > t_ + me.FLUSH_TIME) {
      keys_ = []
    }
    t_ = t
    B = Blockly.selected
    if (event.keyCode === 13) {// Enter
      event.preventDefault()
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
      if (B) {
        ezP.MenuManager.shared().showMenu(B, event)
      }
    } else if (event.key.length<2){
      event.preventDefault()
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
      switch(event.key) {
        case 'ArrowDown': B.ezp.selectBlockBelow(B); return
        case 'ArrowUp': B.ezp.selectBlockAbove(B); return
        case 'ArrowLeft': B.ezp.selectBlockLeft(B); return
        case 'ArrowRight': B.ezp.selectBlockRight(B); return
      }
    } else {
      event.preventDefault()
      var F = function (f) {
        var block = ezP.DelegateSvg.getBestBlock(workspace, f)
        if (block) {
          block.select()
        }
      }
      switch(event.key) {
        case 'ArrowDown': F(function(P) {return P.y}); return
        case 'ArrowUp': F(function(P) {return -P.y}); return
        case 'ArrowLeft': F(function(P) {return -P.x}); return
        case 'ArrowRight': F(function(P) {return P.x}); return
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
  'or': ezP.T3.Expr.or_test_concrete,
  'and': ezP.T3.Expr.and_test_concrete,
  'if else': ezP.T3.Expr.conditional_expression_concrete,
  'id': ezP.T3.Expr.identifier,
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

// if (ezP.KeyHandler.shared) {
//   return
// }
// ezP.KeyHandler.shared = new goog.ui.KeyboardShortcutHandler(document)

// ezP.KeyHandler.shared.registerShortcut('↓', goog.events.KeyCodes.DOWN);
// ezP.KeyHandler.shared.registerShortcut('↑', goog.events.KeyCodes.UP);
// ezP.KeyHandler.shared.registerShortcut('→', goog.events.KeyCodes.RIGHT);
// ezP.KeyHandler.shared.registerShortcut('←', goog.events.KeyCodes.LEFT);
// ezP.KeyHandler.shared.registerShortcut(' ', goog.events.KeyCodes.SPACE);
// var keys = {
//   'i f': ezP.T3.Stmt.if_part,
//   'e l i f': ezP.T3.Stmt.elif_part,
//   'e l s e':  ezP.T3.Stmt.else_part,
//   'c l a s s': ezP.T3.Stmt.classdef_part,
//   // 'd e': ezP.T3.Stmt.decorator_stmt,
//   'e x c e p t': ezP.T3.Stmt.except_part,
//   'f i n a l l y': ezP.T3.Stmt.finally_part,
//   'f o r': ezP.T3.Stmt.for_part,
//   'd e f': ezP.T3.Stmt.funcdef_part,
//   'i f': ezP.T3.Stmt.if_part,
//   'i m p o r t': ezP.T3.Stmt.import_part,
//   't r y': ezP.T3.Stmt.try_part,
//   'w h i l e': ezP.T3.Stmt.while_part,
//   'w i t h': ezP.T3.Stmt.with_part,
//   'l a m b d a': ezP.T3.Expr.lambda_expr,
//   'o r': ezP.T3.Expr.or_test_concrete,
//   'a n d': ezP.T3.Expr.and_test_concrete,
//   'i f e l s e': ezP.T3.Expr.conditional_expression_concrete,
// }
// var key
// for (key in keys) {
//   ezP.KeyHandler.shared.registerShortcut(keys[key], key+' enter');
// }
// var NONE = goog.ui.KeyboardShortcutHandler.Modifiers.NONE;
// var ENTER = goog.events.KeyCodes.ENTER

// ezP.KeyHandler.shared.registerShortcut(ezP.T3.Expr.m_expr_concrete,
//   goog.events.KeyCodes.NUM_MULTIPLY	, NONE, ENTER
// )
// ezP.KeyHandler.shared.registerShortcut(ezP.T3.Expr.m_expr_concrete,
//   'o k enter'
// )
// /*
//   m_expr_concrete           /*   ::= m_expr "*" u_expr | m_expr "@" m_expr | m_expr "//" u_expr| m_expr "/" u_expr | m_expr "%" u_expr (default)  : "ezp_m_expr_concrete",
//   a_expr_concrete           /*   ::= a_expr "+" m_expr | a_expr "-" m_expr              (default)  : "ezp_a_expr_concrete",
//   shift_expr_concrete       /*   ::= shift_expr ( "<<" | ">>" ) a_expr                  (default)  : "ezp_shift_expr_concrete",
//   and_expr_concrete         /*   ::= and_expr "&" shift_expr                            (default)  : "ezp_and_expr_concrete",
//   xor_expr_concrete         /*   ::= xor_expr "^" and_expr                              (default)  : "ezp_xor_expr_concrete",
//   or_expr_concrete          /*   ::= or_expr "|" xor_expr                               (default)  : "ezp_or_expr_concrete",
//    /*   ::= or_test "if" or_test "else" expression             (default)  : "ezp_conditional_expression_concrete",
//   lambda_expr               /*   ::= lambda_expression "dynamic with cond"              (default)  : "ezp_lambda_expr",
//   lambda_expr_nocond        /*   ::= lambda_expression "dynamic without cond"           (default)  : "ezp_lambda_expr_nocond",
//   builtin_object            /*   ::= 'None' | 'True' | 'False' | 'Ellipsis' | '...' |'NotImplemented' (default)  : "ezp_builtin_object",

//   */
// var keys = [
//   goog.events.KeyCodes.AT_SIGN,
// ]
// var key
// for (key in keys) {
//   ezP.KeyHandler.shared.registerShortcut(keys[key], key+' enter');
// }

// ezP.KeyHandler.shared.registerShortcut(ezP.T3.Stmt.decorator_stmt,
//   goog.events.KeyCodes.AT_SIGN);

// ezP.KeyHandler.shared.listen(
//   goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED,
//   function(e) {
//     var B = Blockly.selected
//     if (B) {
//       var type = e.identifier.split(':')
//       switch(type[0]) {
//         case ' ': ezP.MenuManager.shared().showMenu(B, e); return
//         case '↓': B.ezp.selectBlockBelow(B); return
//         case '↑': B.ezp.selectBlockAbove(B); return
//         case '←': B.ezp.selectBlockLeft(B); return
//         case '→': B.ezp.selectBlockRight(B); return
//         default:
//         B.ezp.insertBlockOfType(B, type[0], type[1])
//         console.log('selected', e.identifier)
//       }
//     } else {
//       var F = function (f) {
//         var block = ezP.DelegateSvg.getBestBlock(workspace, f)
//         if (block) {
//           block.select()
//         }
//       }
//       switch(e.identifier) {
//         case '↓': F(function(P) {return P.y}); return
//         case '↑': F(function(P) {return -P.y}); return
//         case '←': F(function(P) {return -P.x}); return
//         case '→': F(function(P) {return P.x}); return
//       }
//       console.log(e.identifier)
//     }
//   }
// )
