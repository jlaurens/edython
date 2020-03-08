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

/**
 * Class for a Delegate, comment_stmt.
 * For edython.
 */
eYo.stmt.makeC9r(eYo.t3.stmt.comment_stmt, {
  data: {
    variant: {
      all: [
        eYo.key.COMMENT, // A comment only
        eYo.key.BLANK // blank line
      ],
      init: eYo.key.COMMENT,
      xml: false,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.comment_d.requiredIncog_ = after !== eYo.key.BLANK
      },
      fromType (type) /** @suppress {globalThis} */ {
        if (type === eYo.t3.stmt.blank_stmt) {
          // expression statement defaults to a python comment line
          // but it should change because of the 'comment_stmt' below
          this.doChange(eYo.key.BLANK)
        } else {
          this.doChange(eYo.key.COMMENT)
        }
      }
    },
    comment: {
      order: 1000000,
      init: '',
      placeholder: eYo.msg.placeholder.COMMENT,
      validate (after) /** @suppress {globalThis} */ {
        return XRegExp.exec(after, eYo.xre.Comment).value || ''
      },
      synchronize: true,
      getPlaceholderText: eYo.msg.placeholder.COMMENT
    }
  },
  slots: {
    comment: {
      order: 1000001,
      fields: {
        label: {
          reserved: '#'
        },
        bind: {
          validate: true,
          endEditing: true,
          comment: ''
        }
      }
    }
  },
  properties: {
    /**
     * @readonly
     * @property {Boolean} whether the receiver is a comment.
     */
    isComment: {
      get () {
        return this.type === eYo.t3.stmt.comment_stmt
      },
    },
    /**
     * @readonly
     * @property {Boolean} whether the receiver is a blank statement: a line consisting of only white spaces, if any.
     */
    isBlank: {
      get () {
        return this.type === eYo.t3.stmt.blank_stmt
      },
    },
    /**
     * @readonly
     * @property {Boolean} comment bricks are white
     */
    isWhite: {
      get () {
        return true
      },
    },
  },
})

;['blank_stmt'].forEach(k => {
  eYo.c9r.register(k, (eYo.stmt[k] = eYo.stmt.comment_stmt))
})
