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
eYo.Stmt.makeClass(eYo.T3.Stmt.comment_stmt, {
  data: {
    variant: {
      all: [
        eYo.Key.COMMENT, // A comment only
        eYo.Key.BLANK // blank line
      ],
      init: eYo.Key.COMMENT,
      xml: false,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.comment_d.requiredIncog = after !== eYo.Key.BLANK
      },
      fromType (type) /** @suppress {globalThis} */ {
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
      validate (after) /** @suppress {globalThis} */ {
        return XRegExp.exec(after, eYo.XRE.comment).value || ''
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
  computed: {
    /**
     * @readonly
     * @property {Boolean} whether the receiver is a comment.
     */
    isComment () {
      return this.type === eYo.T3.Stmt.comment_stmt
    },
    /**
     * @readonly
     * @property {Boolean} whether the receiver is a blank statement: a line consisting of only white spaces, if any.
     */
    isBlank () {
      return this.type === eYo.T3.Stmt.blank_stmt
    },
    /**
     * @readonly
     * @property {Boolean} comment bricks are white
     */
    isWhite () {
      return true
    },
  },
})

;['blank_stmt'].forEach(k => {
  eYo.C9r.register(k, (eYo.Stmt[k] = eYo.Stmt.comment_stmt))
})
