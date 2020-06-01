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

eYo.require('stmt.group')

eYo.require('changer')

eYo.provide('brick.try')

eYo.forward('msg')

//g@@g.forwardDeclare('g@@g.dom')

/**
 * Class for a Delegate, try_part brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.stmt.group[eYo.$makeSubC9r]('try_part', true, {
  fields: {
    prefix: 'try'
  }
})

/**
 * Class for a Delegate, except_part brick.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.stmt.group[eYo.$makeSubC9r]('except_part', true, {
  data: {
    variant: {
      all: [
        eYo.key.NONE,
        eYo.key.EXPRESSION,
        eYo.key.ALIASED
      ],
      init: eYo.key.NONE,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.expression_d.requiredIncog_ = after !== eYo.key.NONE
        b3k.alias_d.requiredIncog_ = after === eYo.key.ALIASED
      },
      xml: false
    },
    expression: {
      order: 200,
      init: '',
      placeholder: eYo.msg.placeholder.EXPRESSION,
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required_from_model = this.brick.variant !== eYo.key.NONE
          this.save(element, opt)
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        var b3k = this.brick
        if (this.required_from_saved && b3k.variant !== eYo.key.ALIASED) {
          b3k.variant_ = eYo.key.EXPRESSION
        }
      }
    },
    alias: {
      order: 400,
      init: '',
      placeholder: eYo.msg.placeholder.ALIAS,
      synchronize: true,
      validate (after) /** @suppress {globalThis} */ {
        var type = eYo.t3.profile.get(after).expr
        return type === eYo.t3.expr.unset
        || type === eYo.t3.expr.identifier
        || type === eYo.t3.expr.builtin__name
        ? after
        : eYo.INVALID
      },
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required_from_model = this.brick.variant === eYo.key.ALIASED
          this.save(element, opt)
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          this.brick.variant_ = eYo.key.ALIASED
        }
      }
    }
  },
  fields: {
    prefix: 'except'
  },
  slots: {
    expression: {
      order: 1,
      fields: {
        bind: {
          validate: true,
          endEditing: true
        }
      },
      check: eYo.t3.expr.check.expression,
      didLoad () /** @suppress {globalThis} */ {
        if (this.brick.variant === eYo.key.NONE && this.required_from_saved) {
          this.brick.variant_ = eYo.key.EXPRESSION
        }
      },
      didConnect: /** @suppress {globalThis} */ function  (oldTargetM4t, targetOldM4t) {
        var O = this.brick
        b3k.variant === eYo.key.ALIASED || (b3k.variant_ = eYo.key.EXPRESSION)
      }
    },
    alias: {
      order: 3000,
      fields: {
        label: 'as',
        bind: {
          validate: true,
          endEditing: true,
          variable: true
        }
      },
      validateIncog () /** @suppress {globalThis} */ {
        return this.brick.variant !== eYo.key.ALIASED
      },
      check: eYo.t3.expr.identifier,
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          this.brick.variant_ = eYo.key.ALIASED
        }
      },
      didConnect: /** @suppress {globalThis} */ function  (oldTargetM4t, targetOldM4t) {
        var O = this.brick
        b3k.variant_ = eYo.key.ALIASED
      }
    }
  },
  head: {
    check (type) /** @suppress {globalThis} */ {
      return type === eYo.t3.stmt.except_part
      ? eYo.t3.stmt.previous.except_part
      : eYo.t3.stmt.previous.void_except_part
    }
  },
  foot: {
    check (type) /** @suppress {globalThis} */ {
      return type === eYo.t3.stmt.except_part
      ? eYo.t3.stmt.next.except_part
      : eYo.t3.stmt.next.void_except_part
    }
  }
})

;[
  'void_except_part'
].forEach(k => {
  eYo.c9r.register(k, (eYo.stmt[k] = eYo.stmt.except_part))
})
/**
 * The type and connection depend on the properties modifier, value and variant.
 * For edython.
 */
eYo.stmt.except_part.prototype.getType = eYo.changer.memoize(
  'getType',
  function () {
    this.setupType(
      this.variant === eYo.key.NONE
      ? eYo.t3.stmt.void_except_part
      : eYo.t3.stmt.except_part
    )
    return this.type
  }
)

/**
 * Class for a Delegate, raise_stmt.
 * For edython.
 */
eYo.stmt.makeC9r('raise_stmt', true, {
  data: {
    variant: {
      all: [
        eYo.key.NONE,
        eYo.key.EXPRESSION,
        eYo.key.FROM
      ],
      init: eYo.key.NONE,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.expression_d.requiredIncog_ = after !== eYo.key.NONE
        b3k.from_d.requiredIncog_ = after === eYo.key.FROM
      },
      xml: false
    },
    expression: {
      order: 200,
      init: '',
      placeholder: eYo.msg.placeholder.EXPRESSION,
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required_from_model = this.brick.variant !== eYo.key.NONE
          this.save(element, opt)
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          this.brick.variant_ = eYo.key.EXPRESSION
        }
      }
    },
    from: {
      order: 400,
      init: '',
      placeholder: eYo.msg.placeholder.EXPRESSION,
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required_from_model = this.brick.variant === eYo.key.FROM
          this.save(element, opt)
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          this.brick.variant_ = eYo.key.FROM
        }
      }
    }
  },
  fields: {
    prefix: 'raise'
  },
  slots: {
    expression: {
      order: 1,
      fields: {
        bind: {
          validate: true,
          endEditing: true
        }
      },
      check: eYo.t3.expr.check.expression,
      xml: {
        load (element, opt) /** @suppress {globalThis} */ {
          this.load(element, opt)
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved && this.brick.variant === eYo.key.NONE) {
          this.brick.variant_ = eYo.key.EXPRESSION
        }
      }
    },
    from: {
      order: 2,
      fields: {
        label: 'from',
        bind: {
          validate: true,
          endEditing: true
        }
      },
      check: eYo.t3.expr.check.expression,
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          this.brick.variant_ = eYo.key.FROM
        }
      }
    }
  }
})

/**
 * Class for a Delegate, assert_stmt.
 * For edython.
 */
eYo.stmt.makeC9r('assert_stmt', true, {
  data: {
    variant: {
      all: [
        eYo.key.UNARY,
        eYo.key.BINARY
      ],
      init: eYo.key.UNARY,
      synchronize (builtin, after) /** @suppress {globalThis} */{
        builtin()
        this.brick.expression2_d.incog = after !== eYo.key.BINARY
      }
    },
    expression: {
      init: '',
      synchronize: true
    },
    expression2: {
      init: '',
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          this.required_from_model = this.brick.variant === eYo.key.BINARY
          this.save(element, opt)
        }
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          this.brick.variant_ = eYo.key.BINARY
        }
      }
    }
  },
  slots: {
    expression: {
      order: 1,
      fields: {
        label: 'assert',
        bind: {
          endEditing: true,
          placeholder: eYo.msg.placeholder.EXPRESSION
        }
      },
      check: eYo.t3.expr.check.expression
    },
    expression2: {
      order: 2,
      fields: {
        label: ',',
        bind: {
          endEditing: true,
          placeholder: eYo.msg.placeholder.EXPRESSION
        }
      },
      check: eYo.t3.expr.check.expression,
      didLoad () /** @suppress {globalThis} */ {
        if (this.required_from_saved) {
          this.brick.variant_ = eYo.key.BINARY
        }
      }
    }
  }
})
