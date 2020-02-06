/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Key handler for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('popupMenu')

eYo.provide('keyHandler')

eYo.forwardDeclare('xre')
eYo.forwardDeclare('dom')
eYo.forwardDeclare('navigate')
eYo.forwardDeclare('menuItem')
eYo.forwardDeclare('separator')

eYo.keyHandler.makeC9r('Menu')

/**
 * Attempts to handle a keyboard event; returns true if the event was handled,
 * false otherwise.  If the container is enabled, and a child is highlighted,
 * calls the child control's `handleKeyEvent` method to give the control
 * a chance to handle the event first.
 * @param {goog.events.KeyEvent} e Key event to handle.
 * @return {boolean} Whether the event was handled by the container (or one of
 *     its children).
 */
eYo.keyHandler.Menu_p.handleKeyEventInternal = function (e) {
  // Give the highlighted control the chance to handle the key event.
  if (eYo.keyHandler.Menu.eyo.C9r_s.handleKeyEventInternal.call(this, e)) {
    return true
  }
  return this.handleMenuKeyEvent(e)
}

/**
 * Key handler class.
 * For edython.
 * @param {constructor} constructor is either a constructor or the name of a constructor.
 */
eYo.keyHandler = (() => {
  var me = {
    MAX_CHILD_COUNT: 20
  }
  var keys_ = []
  var shortcuts_ = [] // an array of {key: ..., model: ...} objects
  var current_ = []
  var target_
  var menu_ = new eYo.keyHandler.Menu(/* eYo.NA, ContextMenuRenderer */)
  // menu_.eyo = me
  /**
 * Setup the shared key handler.
 * For edython.
 * @param {constructor} constructor is either a constructor or the name of a constructor.
 */
  me.setup = function (document) {
    target_ = document
    goog.events.listen(
      document, goog.events.EventType.KEYDOWN, me.handleKeyDown_,
      eYo.NA /* opt_capture */, me
    )
  }
  me.register = function (key, model) {
    // manage duplicates
    if (key.length) {
      eYo.assert(eYo.isStr(model) || eYo.isF(model) || eYo.isF(model.action) || eYo.isStr(model.type), 'No model to register for ' + key)
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
      eYo.dom.gobbleEvent(e)
      K = eYo.NA
    }
    if (me.updateMenu(K)) {
      eYo.dom.gobbleEvent(e)
      return true
    }
    return false
  }
  me.handleFirstMenuItemAction = function (model) {
    // first check to see if the selected brick can handle the model
    var eyo = eYo.app.Focus_mngr.Brick
    var m4t = eYo.focus.magnet
    if (eyo && !m4t) {
      var D = model.data
      if (D && eyo.setDataWithModel(D)) {
        // yes it does
        return
      }
      // Maybe the main data can handle the model
      var main = eyo.main_d
      if (main && main.validate(model)) {
        // yes it does
        main.set(model)
        return
      }
      if (eyo.dataForEach(d => {
        if (!d.incog && d.validate(model)) {
          d.doChange(model)
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
    // if key is a number, then create a number brick
    // otherwise, take the first model and pass it to handleModel
    if (eYo.isF(model.action)) {
      model.action.call(me, model.model)
      return
    }
    var eyo = eYo.app.Focus_mngr.Brick
    if (eyo) {
      var m4t = eYo.focus.magnet
      var newB = m4t && (eyo.insertBrickWithModel(model, m4t))
        || (model.parent || model.slot
          ? eyo.insertParentWithModel(model) || eyo.insertBrickWithModel(model, m4t)
          : eyo.insertBrickWithModel(model, m4t) || eyo.insertParentWithModel(model))
      if (newB) {
        if (m4t) {
          // There was a selected connection,
          // we try to select another one, with possibly the same type
          // First we take a look at B : is there an unconnected input connection
          var doFirst = (eyo, type) => {
            return eyo.slotSomeMagnet(m4t => {
              if (m4t.type === type) {
                var t9k = m4t.targetBrick
                if (!m4t.hidden_ && !t9k && (!m4t.source || !m4t.source.bindField)) {
                  m4t.focusOn()
                  return true
                } else {
                  return t9k && (doFirst(t9k, type))
                }
              }
            })
          }
          if (doFirst(newB, eYo.magnet.IN)) {
            return true
          } else if ((m4t === eyo.foot_m) && (m4t = newB.foot_m) && !m4t.hidden_) {
            m4t.focusOn()
            return true
          }
          eYo.focus.magnet = null
          newB.focusOn()
          return true
        }
        // no selected magnet
        var parent = eyo
        do {
          if (parent.slotSomeMagnet(m4t => {
            if (m4t.isSlot && !m4t.optional_ && !m4t.target && !m4t.hidden_) {
              m4t.focusOn()
              return true
            }
          })) {
            return true
          }
        } while ((parent = parent.group))
        eYo.focus.magnet = null
        newB.focusOn()
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
        if (eYo.xre.id_continue.test(As[1]) && (!As[0].length || !eYo.xre.id_continue.test(As[0]))) {
          var bonusA = true
        }
      }
      if (Bs.length > 1) {
        if (eYo.xre.id_continue.test(Bs[1]) && (!Bs[0].length || !eYo.xre.id_continue.test(Bs[0]))) {
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
        if (eYo.xre.id_continue.test(As[As.length - 2]) && (!As[As.length - 1].length ||
          !eYo.xre.id_continue.test(As[As.length - 1][0]))) {
          bonusA = true
        }
      }
      if (Bs.length > 2) {
        if (eYo.xre.id_continue.test(Bs[Bs.length - 2]) && (!Bs[Bs.length - 1].length ||
          !eYo.xre.id_continue.test(Bs[Bs.length - 1][0]))) {
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
    if (sep === eYo.NA) {
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
      eYo.do.CreateSPAN(k, 'eyo-code-emph'))
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
        while ((d = Cs[j++]) !== eYo.NA && (c = Cs[j++]) !== eYo.NA) {
          content.appendChild(eYo.do.CreateSPAN(d, 'eyo-code-emph'))
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
    var content = eYo.do.CreateSPAN(key, 'eyo-code-emph')
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
        shortcut.components = eYo.NA
      }
    }
    if (current_.length) {
      menu_.addChild(new eYo.Separator(), true)
    }
    i = 0
    while (i < me.MAX_CHILD_COUNT && (shortcut = current_[i++])) {
      content = goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
        goog.dom.createTextNode(shortcut.components[0]),
        eYo.do.CreateSPAN(shortcut.components[1], 'eyo-code-emph'),
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
    var brick = event.target
    if (brick !== target_) {
      if (!(brick = brick.parent)) {
        return
      }
      if (brick !== target_) {
        if (!(brick = brick.parent) || (brick !== target_)) {
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
      if ((brick = eYo.app.Focus_mngr.Brick)) {
        eYo.dom.gobbleEvent(e)
        return
      }
    }
    if ((brick = eYo.app.Focus_mngr.Brick)) {
      if (K === ' ') {
        eYo.dom.gobbleEvent(e)
        eYo.MenuManager.Shared().showMenu(brick, event)
        return
      }
      keys_ = []
      me.populateMenu(K)
      if (menu_.getChildCount()) {
        eYo.dom.gobbleEvent(e)
        if (!menu_.inDocument_) {
          menu_.render()
        }
        if (!me.alreadyListening_) {
          me.alreadyListening_ = true
          me.alreadyListened = false
          goog.events.listenOnce(menu_, 'action', (e) => {
            me.alreadyListening_ = false
            var target = e.target
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
                    if (eYo.isF(model)) {
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
        var scaledHeight = eYo.unit.y * brick.board.scale
        var m4t = eYo.focus.magnet
        if (m4t && m4t.brick) {
          var xy = goog.style.getPageOffset(m4t.brick.dom.svg.group_)
          var xxyy = m4t.whereInBrick.scale(brick.board.scale)
          xy.translate(xxyy)
        } else {
          xy = goog.style.getPageOffset(brick.dom.svg.group_)
        }
        menu_.showMenu(brick.dom.svg.group_, xy.x, xy.y + scaledHeight + 2)
        menu_.highlightFirst()
      } else {
        var F = f => {
          eYo.dom.gobbleEvent(e)
          f()
        }
        switch (k) {
        case 'arrowdown': return F(eYo.focus.ChooseBelow)
        case 'arrowup': return F(eYo.focus.ChooseAbove)
        case 'arrowleft': return F(eYo.focus.ChooseLeft)
        case 'arrowright': return F(eYo.focus.ChooseRight)
        }
      }
    } else {
      // B is not always a brick!
      F = f => {
        eYo.dom.gobbleEvent(e)
        var brick = eYo.brick.getBestBrick(eYo.app.Board, f)
        if (brick) {
          brick.focusOn().scrollToVisible()
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
 * If sep is not in the list, returns eYo.NA.
 * split('foo', 'f') -> ['', 'oo']
 * split('foo', 'o') -> ['f', 'o']
 * split('bar', 'r') -> ['ba', '']
 * split('foo', 'b') -> eYo.NA
 *
 * @param {*} key
 * @param {*} sep
 * @return an array of 2 elements, what is before `sep` and what is after
 */
eYo.keyHandler.Split = function (key, sep) {
  var i = key.indexOf(sep)
  if (i < 0) {
    return eYo.NA
  }
  return [key.substring(0, i), key.substring(i + sep.length)]
}

  /**
 * Turn the selected brick into a call brick or insert a call brick.
 * @param {*} model
 */
eYo.keyHandler.makeCall = function (model) {
  this.handleModel(model)
}

/**
 * Turn the selected brick into a slicing, or insert a slicing
 * @param {*} model
 */
eYo.keyHandler.makeSlicing = function (model) {
  this.handleModel(model)
}

eYo.keyHandler.register('if', eYo.t3.stmt.if_part)

for (let [K, V] of Object.entries({
    'start': eYo.t3.stmt.start_stmt,
    'if': eYo.t3.stmt.if_part,
    'elif': eYo.t3.stmt.elif_part,
    'else': eYo.t3.stmt.else_part,
    class: eYo.t3.stmt.classdef_part,
    'except': {
      type: eYo.t3.stmt.except_part,
      variant_p: eYo.key.NONE
    },
    'except …': {
      type: eYo.t3.stmt.except_part,
      variant_p: eYo.key.EXPRESSION
    },
    'except … as …': {
      type: eYo.t3.stmt.except_part,
      variant_p: eYo.key.ALIASED
    },
    'finally': eYo.t3.stmt.finally_part,
    'for': eYo.t3.stmt.for_part,
    '@': eYo.t3.stmt.decorator_stmt,
    'def': eYo.t3.stmt.funcdef_part,
    'import': eYo.t3.stmt.import_stmt,
    'try': eYo.t3.stmt.try_part,
    'while': eYo.t3.stmt.while_part,
    'with': eYo.t3.stmt.with_part,
    'lambda': eYo.t3.expr.lambda,
    '… if … else …': eYo.t3.expr.conditional_expression,
    'identifier': eYo.t3.expr.identifier,
    'name': eYo.t3.expr.identifier,
    'not …': function (key) {
      var eyo = eYo.app.Focus_mngr.Brick
      if (eyo) {
        var parent = eyo.surround
        if (parent && parent.board.options.smartUnary && (parent.type === eYo.t3.expr.not_test)) {
          eyo.replaceBrick(parent)
          return
        }
        if (eYo.focus.magnet) {
          eyo.insertBrickWithModel(eYo.t3.expr.not_test)
        } else {
          eyo.insertParentWithModel(eYo.t3.expr.not_test)
        }
      }
    },
    '+…': function (key) {
      var eyo = eYo.app.Focus_mngr.Brick
      if (eyo) {
        var parent = eyo.surround
        if (parent && parent.board.options.smartUnary && (parent.type === eYo.t3.expr.u_expr) && parent.Operator_p === '+') {
          return
        }
        var model = {
          type: eYo.t3.expr.u_expr,
          operator_p: '+'
        }
        if (eYo.focus.magnet) {
          eyo.insertBrickWithModel(model)
        } else {
          eyo.insertParentWithModel(model)
        }
      }
    }
})) {
  eYo.keyHandler.register(K, V)
}

;(() => {
  var F = (key, op) => {
    var brick = eYo.app.Focus_mngr.Brick
    if (brick) {
      var parent = eyo.surround
      if (parent && parent.board.options.smartUnary && (parent.type === eYo.t3.expr.u_expr) && parent.operator_ === op) {
        brick.replaceBrick(parent)
        return
      }
      var model = {
        type: eYo.t3.expr.u_expr,
        operator_p: op
      }
      eYo.focus.magnet
        ? brick.insertBrickWithModel(model)
        : brick.insertParentWithModel(model)
    }
  }
  for (let [K, V] of Object.entries({
    '-': function (key) {
      return F(key, '-')
    },
    '~': function (key) {
      return F(key, '~')
    }
  })) {
    eYo.keyHandler.register(K + '…', V)
  }
  console.warn('Implement support for `key` in range above')
  console.warn('Problem when there can be both a statement and an expression for the same shortcut')

}) ()

for (let [K, V] of Object.entries({
  '+': {
    type: eYo.t3.expr.a_expr,
    operator_p: '+',
    slot: eYo.key.LHS
  },
  '-': {
    type: eYo.t3.expr.a_expr,
    operator_p: '-',
    slot: eYo.key.LHS
  },
  '*': {
    type: eYo.t3.expr.m_expr,
    operator_p: '*',
    slot: eYo.key.LHS
  },
  '//': {
    type: eYo.t3.expr.m_expr,
    operator_p: '//',
    slot: eYo.key.LHS
  },
  '/': {
    type: eYo.t3.expr.m_expr,
    operator_p: '/',
    slot: eYo.key.LHS
  },
  '%': {
    type: eYo.t3.expr.m_expr,
    operator_p: '%',
    slot: eYo.key.LHS
  },
  '@': {
    type: eYo.t3.expr.m_expr,
    operator_p: '@',
    slot: eYo.key.LHS
  },
  '**': {
    type: eYo.t3.expr.power,
    slot: eYo.key.LHS
  },
  '<<': {
    type: eYo.t3.expr.shift_expr,
    operator_p: '<<',
    slot: eYo.key.LHS
  },
  '>>': {
    type: eYo.t3.expr.shift_expr,
    operator_p: '>>',
    slot: eYo.key.LHS
  },
  '&': eYo.t3.expr.and_expr,
  '^': eYo.t3.expr.xor_expr,
  '|': eYo.t3.expr.or_expr,
  'or': eYo.t3.expr.or_test,
  'and': eYo.t3.expr.and_test
})) {
  eYo.keyHandler.register(`… ${K} …`, V)
}

;['True', 'False', 'None', '...'].forEach(K => {
  eYo.keyHandler.register(K, {
    type: eYo.t3.expr.builtin__object,
    data: K
  })
})

;['is', 'is not', 'in', 'not in'].forEach(K => {
  eYo.keyHandler.register(`… ${K} …`, {
    type: eYo.t3.expr.object_comparison,
    operator_p: K
  })
})

;['<', '>', '==', '>=', '<=', '!='].forEach(K => {
  eYo.keyHandler.register(`… ${K} …`, {
    type: eYo.t3.expr.number_comparison,
    operator_p: K
  })
})

for (let [K, V] of Object.entries({
  '… = …': eYo.t3.stmt.assignment_stmt,
  '…:… = …': eYo.t3.stmt.annotated_assignment_stmt,
  'start': eYo.t3.stmt.start_stmt,
  'assert …': eYo.t3.stmt.assert_stmt,
  'pass': eYo.t3.stmt.pass_stmt,
  'break': eYo.t3.stmt.break_stmt,
  'continue': eYo.t3.stmt.continue_stmt,
  'del …': eYo.t3.stmt.del_stmt,
  'return …': eYo.t3.stmt.return_stmt,
  'yield …': eYo.t3.stmt.yield_stmt,
  'raise': eYo.t3.stmt.raise_stmt,
  'raise …': {
    type: eYo.t3.stmt.raise_stmt,
    variant_p: eYo.key.EXPRESSION
  },
  'raise … from …': {
    type: eYo.t3.stmt.raise_stmt,
    variant_p: eYo.key.FROM
  },
  // 'from future import …': eYo.t3.stmt.future_statement,
  'import …': eYo.t3.stmt.import_stmt,
  '# comment': eYo.t3.stmt.comment_stmt,
  'global …': eYo.t3.stmt.global_stmt,
  'nonlocal …': eYo.t3.stmt.nonlocal_stmt,
  '@decorator': eYo.t3.stmt.decorator_stmt,
  '"""…"""(stmt)': {
    type: eYo.t3.stmt.docstring_stmt,
    delimiter_p: '"""'
  },
  "'''…'''(stmt)": {
    type: eYo.t3.stmt.docstring_stmt,
    delimiter_p: "'''"
  },
  '"""…"""': {
    type: eYo.t3.expr.longliteral,
    delimiter_p: '"""'
  },
  "'''…'''": {
    type: eYo.t3.expr.longliteral,
    delimiter_p: "'''"
  },
  "'…'": {
    type: eYo.t3.expr.shortliteral,
    delimiter_p: "'"
  },
  '"…"': {
    type: eYo.t3.expr.shortliteral,
    delimiter_p: '"'
  },
  'print(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'print'
  },
  'input(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'input'
  },
  'range(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'range'
  },
  'int(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'int'
  },
  'float(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'float'
  },
  'complex(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'complex'
  },
  'list(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'List'
  },
  'set(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'set'
  },
  'len(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'len'
  },
  'min(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'min'
  },
  'max(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'max'
  },
  'sum(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'sum'
  },
  'pow(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'pow'
  },
  'trunc(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'trunc'
  },
  'abs(…)': {
    type: eYo.t3.expr.call_expr,
    name_p: 'abs'
  },
  '….conjugate()': {
    type: eYo.t3.expr.call_expr,
    name_p: 'conjugate',
    dotted_p: 1
  },
  'f(…)': {
    action: eYo.keyHandler.makeCall,
    model: {
      type: eYo.t3.expr.call_expr,
      name_p: ''
    }
  },
  'x[…]': {
    action: eYo.keyHandler.makeSlicing,
    model: {
      type: eYo.t3.expr.slicing,
      parent: true
    }
  },
  'module as alias': eYo.t3.expr.dotted_name_as,
  '(…)': {
    type: eYo.t3.expr.parenth_form,
    parent: true
  },
  '[…]': {
    type: eYo.t3.expr.list_display,
    parent: true
  },
  '…:…': {
    type: eYo.t3.expr.proper_slice,
    parent: true
  },
  '{…:…}': {
    type: eYo.t3.expr.dict_display,
    parent: true
  },
  '{…}': {
    type: eYo.t3.expr.set_display,
    parent: true
  }
})) {
  eYo.keyHandler.register(K, V)
}

;['+=', '-=', '*=', '@=', '/=', '//=', '%=', '**=', '>>=', '<<=', '&=', '^=', '|='].forEach(K => {
  eYo.keyHandler.register(`… ${K} …`, {
    type: eYo.t3.stmt.augmented_assignment_stmt,
    operator: K
  })
})
// cmath
;['real', 'imag'].forEach(K => {
  eYo.keyHandler.register(`… ${K} …`, {
    type: eYo.t3.expr.call_expr,
    name_p: K
  })
})
