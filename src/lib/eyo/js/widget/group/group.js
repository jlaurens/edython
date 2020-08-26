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

eYo.forward('msg')

//g@@g.forwardDeclare('g@@g.dom')

/**
 * @name{eYo.stmt.group}
 * Class for a Delegate, base group statement brick.
 * Base group is subclassed into Group and Control.
 * For edython.
 */
eYo.stmt.newC9r('group', {
  head (type) /** @suppress {globalThis} */ { // eslint-disable-line
    return null
  },
  left: eYo.NA,
  right: {
    check (type) /** @suppress {globalThis} */ { // eslint-disable-line
      return this.brick.suite
        ? [eYo.t3.stmt.comment_stmt]
        : eYo.t3.stmt.right.Simple_stmt
    },
    fields: {
      label: { // don't call it 'operator'
        reserved: ':',
        hidden: false
      }
    }
  },
  suite (type) /** @suppress {globalThis} */ { // eslint-disable-line
    return this.brick.right
      ? []
      : null
  },
  foot (type) /** @suppress {globalThis} */ { // eslint-disable-line
    return null
  },
  properties: {
    isGroup: true,
  }
})

/**
 * Class for a Delegate, if_part brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.stmt.group[eYo.$newSubC9r]('branch', true, {
  data: {
    variant: {
      all: [
        eYo.key.IF,
        eYo.key.ELIF,
        eYo.key.ELSE,
        eYo.key.WHILE
      ],
      init: eYo.key.IF,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        this.brick.if_d.incog = after === eYo.key.ELSE
      },
      fromType (type) /** @suppress {globalThis} */ {
        if (type === eYo.t3.stmt.while_part) {
          this.set(eYo.key.WHILE)
        } else if (type === eYo.t3.stmt.elif_part) {
          this.set(eYo.key.ELIF)
        } else if (type === eYo.t3.stmt.else_part) {
          this.set(eYo.key.ELSE)
        } else if (type === eYo.t3.stmt.try_else_part) {
          this.set(eYo.key.ELSE)
        } else if (type === eYo.t3.stmt.last_else_part) {
          this.set(eYo.key.ELSE)
        } else {
          this.set(eYo.key.IF)
        }
      },
      xml: {
        save (element, opt) /** @suppress {globalThis} */ { // eslint-disable-line
        },
        load (element) /** @suppress {globalThis} */ {
          this.brick.variant_p = element.getAttribute(eYo.key.EYO)
        },
      },
      onChange (builtin) /** @suppress {globalThis} */ { // same code for primary bricks
        this.brick.consolidateType()
        this.brick.consolidateMagnets()
        builtin()
      },
    },
    if: {
      init: '',
      placeholder: eYo.msg.placeholder.CONDITION,
      validate: false, // use the python interpreter to validate this
      synchronize: true,
    }
  },
  fields: {
    variant: {
      reserved: ''
    }
  },
  slots: {
    if: {
      order: 1,
      fields: {
        bind: {
          endEditing: true
        }
      },
      check: eYo.t3.expr.check.namedexpr_test
    }
  },
  head (type) /** @suppress {globalThis} */ {
    return eYo.t3.stmt[eYo.$previous][type.substring(4)]
  },
  foot (type) /** @suppress {globalThis} */ {
    return eYo.t3.stmt[eYo.$next][type.substring(4)]
  },
})

/**
 * The xml `eyo` attribute of this brick, as it should appear in the saved data.
 * For edython.
 * @return {String}
 */
eYo.stmt.branch_p.xmlAttr = function () {
  return this.variant_p
}

/**
 * getBaseType.
 * The type depends on the variant and the modifiers.
 * As side effect, the subtype is set.
 * When the type changes, the connections may change,
 * and when the connection changes, the type changes.
 * Each type change may imply a disconnection.
 * At least, the type may change to a value when no connection is connected.
 */
eYo.stmt.branch_p.getBaseType = function () {
  var T3 = eYo.t3.stmt
  var type = {
    [eYo.key.IF]: T3.if_part,
    [eYo.key.ELIF]: T3.elif_part,
    [eYo.key.WHILE]: T3.while_part
  } [this.variant_p]
  if (!type) {
    var targetMagnet
    if ((targetMagnet = this.head_m.target)) {
      // look at the high connection
      //
      var t9k = targetMagnet.brick
      if ((targetMagnet.check_ && targetMagnet.check_.indexOf(T3.last_else_part) < 0) || (T3.Previous.last_else_part && T3.Previous.last_else_part.indexOf(t9k.type) < 0)) {
        type = T3.try_else_part
      } else if ((targetMagnet.check_ && targetMagnet.check_.indexOf(T3.try_else_part) < 0) || (T3.Previous.try_else_part && T3.Previous.try_else_part.indexOf(t9k.type) < 0)) {
        type = T3.last_else_part
      }
    }
    if (!type && (targetMagnet = this.foot_m.target)) {
      // the high connection did not add any constrain
      // may be the low connection will?
      t9k = targetMagnet.brick
      if ((targetMagnet.check_ && targetMagnet.check_.indexOf(T3.last_else_part) < 0) || (T3.Next.last_else_part && T3.Next.last_else_part.indexOf(t9k.type) < 0)) {
        type = T3.try_else_part
      } else if ((targetMagnet.check_ && targetMagnet.check_.indexOf(T3.try_else_part) < 0) || (T3.Next.try_else_part && T3.Next.try_else_part.indexOf(t9k.type) < 0)) {
        type = T3.last_else_part
      }
    }
  }
  this.setupType(type || T3.else_part) // bad smell, the code has changed
  return this.type_
}

;[
  'if',
  'elif',
  'else',
  'while',
  'try_else',
  'last_else'
].forEach(name => {
  var k = name + '_part'
  eYo.c9r.register(k, (eYo.stmt[k] = eYo.stmt.branch))
})

/**
 * Will draw the brick. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {Brick} brick
 * @private
 */
eYo.stmt.group.prototype.willRender_ = function (recorder) {
  eYo.stmt.group.eyo.C9r_s.willRender_.call(this, recorder)
  var field = this.async_f
  if (field) {
    field.visible = this.async_
  }
}

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.C9rBase} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.stmt.group.prototype.populateContextMenuFirst_ = function (mngr) {
  if (this.async_f) {
    var content = eYo.dom.createDom(eYo.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('async', 'eyo-code-reserved'),
      eYo.dom.createTextNode(' ' + eYo.msg.AT_THE_LEFT)
    )
    if (this.async_) {
      mngr.addRemoveChild(mngr.newMenuItem(content, () => {
        this.async_ = false
      }))
      mngr.shouldSeparateRemove()
    } else {
      mngr.addInsertChild(mngr.newMenuItem(content, () => {
        this.async_ = true
      }))
      mngr.shouldSeparateInsert()
    }
  }
  return eYo.stmt.group.eyo.C9r_s.populateContextMenuFirst_.call(this, mngr)
}

/**
 * Class for a Delegate, for_part brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.stmt.group[eYo.$newSubC9r]('for_part', true, {
  slots: {
    for: {
      order: 1,
      fields: {
        label: 'for'
      },
      wrap: eYo.t3.expr.target_list
    },
    in: {
      order: 2,
      fields: {
        label: 'in'
      },
      wrap: eYo.t3.expr.expression_list
    }
  }
})

/**
 * Class for a Delegate, with_part brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.stmt.group[eYo.$newSubC9r]('with_part', true, {
  slots: {
    with: {
      order: 1,
      fields: {
        label: 'with'
      },
      wrap: eYo.t3.expr.with_item_list
    }
  }
})

