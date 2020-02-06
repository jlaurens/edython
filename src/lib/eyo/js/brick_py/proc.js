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

eYo.require('stmt.Group')

eYo.require('xre')

eYo.require('msg')
eYo.require('expr.primary')
eYo.require('menuItem')
goog.require('goog.dom');
eYo.provide('brick.proc')

eYo.do.readOnlyMixin(eYo.xre, {
  decorator: XRegExp(`^@?
    (?:
      (?<property> property) |
      (?<classmethod> classmethod) |
      (?<staticmethod> staticmethod) |
      (?:
        (?<property_name>${eYo.xre[eYo.key._IDENTIFIER]})?
        \\.
        (?:
          (?<setter> setter) |
          (?<deleter> deleter)
        )
      ) |
      (?<dotted_name>
        (?<dots> \\.*)
        (?<dotted>
          (?:${eYo.xre[eYo.key._IDENTIFIER]}\\.)*
        )
        (?<name>${eYo.xre[eYo.key._IDENTIFIER]}?) # matches a void string
      )
    )
    $`, 'x'
  )
})
/**
 * Class for a Delegate, decorator.
 * For edython.
 */
eYo.stmt.makeC9r('decorator_stmt', {
  xml: {
    attr: '@'
  },
  data: {
    property: {
      all: [
        eYo.key.GETTER,
        eYo.key.SETTER,
        eYo.key.DELETER
      ],
      init: null,
      didChange (builtin, after) /** @suppress {globalThis} */ {
        // the property change may echo into a decorator change
        builtin()
        if (after === eYo.key.GETTER) {
          var variant = this.brick.Variant_p
          if (variant === eYo.key.NONE || variant === eYo.key.N_ARY) {
            this.brick.Decorator_p = this.brick.Saved_p || ''
          } else {
            this.brick.Decorator_p = variant || ''
          }
        } else if (after) {
          this.brick.Decorator_p = this.brick.Saved_p + '.' + after
        }
      },
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        this.incog = after === eYo.key.GETTER
        // update the placeholder for the name field.
        this.brick.name_d.field.getPlaceholderText(true)
      },
      xml: false
    },
    variant: {
      all: [
        eYo.key.NONE, // custom name with no arguments, possibly attributes
        eYo.key.STATICMETHOD, // @staticmethod
        eYo.key.CLASSMETHOD, // @classmethod
        eYo.key.PROPERTY, // @property
        eYo.key.N_ARY // custom name with arguments
      ],
      init: eYo.key.NONE,
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        if (after !== eYo.key.PROPERTY) {
          this.brick.Property_p = eYo.key.GETTER
        }
        if (after === eYo.key.N_ARY) {
          this.brick.Chooser_p = eYo.key.N_ARY
          this.brick.MainChooser_p = eYo.key.NONE
        } else {
          this.brick.MainChooser_p = after
        }
      },
      synchronize (builtin, after) /** @suppress {globalThis} */ { // would variants synchronize?
        this.incog = after !== eYo.key.N_ARY
        builtin()
        this.brick.n_ary_s.incog = after !== eYo.key.N_ARY
      },
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          if (this.get() === eYo.key.N_ARY) {
            var b = this.brick.n_ary_b
            if (b && !b.children_.length) {
              this.save(element, opt)
            }
          }
        }
      }
    },
    saved: {
      init: '',
      synchronize: false,
      xml: false
    },
    name: {
      all: [ // accepted types
        eYo.t3.expr.dotted_name,
        eYo.t3.expr.identifier,
        eYo.t3.expr.unset
      ],
      init: '',
      placeholder () /** @suppress {globalThis} */ {
        var b3k = this.brick
        return b3k.Variant_p === eYo.key.PROPERTY && b3k.Property_p !== eYo.key.GETTER
        ? eYo.msg.placeholder.IDENTIFIER
        : eYo.msg.placeholder.DECORATOR
      },
      validate (after) /** @suppress {globalThis} */ {
        var p5e = eYo.t3.profile.get(after, null)
        return this.getAll().indexOf(p5e.expr) >= 0 ? after : eYo.INVALID
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        var p = b3k.Property_p
        if (p && p !== eYo.key.GETTER) {
          after = after + '.' + p
        }
        b3k.Decorator_p = after || ''
      },
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var d = this.field.ui_driver_mngr
        d && (d.setVisualAttribute(this.field, after))
      },
      xml: false
    },
    decorator: {
      all: [ // accepted types
        eYo.t3.expr.dotted_name,
        eYo.t3.expr.identifier,
        eYo.t3.expr.unset
      ],
      init: '',
      validate (after) /** @suppress {globalThis} */ {
        var p5e = eYo.t3.profile.get(after, null)
        return this.getAll().indexOf(p5e.expr) >= 0 || this.getAll().indexOf(p5e.base) >= 0 ? after: eYo.INVALID
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        var m = XRegExp.exec(after, eYo.xre.decorator)
        if (m) {
          if (m.setter) {
            b3k.Target_p = b3k.Saved_p = m.property_name
            if (b3k.Variant_p === eYo.key.N_ARY) {
              b3k.Variant_p = eYo.key.NONE
            }
            b3k.Property_p = eYo.key.SETTER
            b3k.MainChooser_p = eYo.key.NONE
            b3k.Chooser_p = eYo.key.SETTER
          } else if(m.deleter) {
            b3k.Target_p = b3k.Saved_p = m.property_name
            if (b3k.Variant_p === eYo.key.N_ARY) {
              b3k.Variant_p = eYo.key.NONE
            }
            b3k.Property_p = eYo.key.DELETER
            b3k.MainChooser_p = eYo.key.NONE
            b3k.Chooser_p = eYo.key.DELETER
          } else {
            b3k.Property_p = eYo.key.GETTER
            b3k.Chooser_p = eYo.key.NONE
            if (m.property) {
              b3k.Variant_p = b3k.Target_p = eYo.key.PROPERTY
              b3k.MainChooser_p = eYo.key.PROPERTY
            } else if (m.staticmethod) {
              b3k.Variant_p = b3k.Target_p = eYo.key.STATICMETHOD
              b3k.MainChooser_p = eYo.key.STATICMETHOD
            } else if (m.classmethod) {
              b3k.Variant_p = b3k.Target_p = eYo.key.CLASSMETHOD
              b3k.MainChooser_p = eYo.key.CLASSMETHOD
            } else {
              if (b3k.Variant_p !== eYo.key.N_ARY) {
                b3k.Variant_p = eYo.key.NONE
              }
              b3k.Target_p = b3k.Saved_p = after
              b3k.MainChooser_p = eYo.key.NONE
            }
          }
        } else {
          b3k.Target_p = after
          b3k.Property_p = eYo.key.GETTER
          b3k.MainChooser_p = eYo.key.NONE
          b3k.Chooser_p = eYo.key.NONE
        }
      },
      synchronize: true,
      xml: true
    },
    mainChooser: {
      all: [
        eYo.key.NONE, // custom name with no arguments
        eYo.key.STATICMETHOD, // @staticmethod
        eYo.key.CLASSMETHOD, // @classmethod
        eYo.key.PROPERTY // @property
      ],
      init: null,
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        if (after === eYo.key.NONE) {
          this.brick.Variant_p = eYo.key.NONE
          this.brick.Decorator_p = this.brick.Saved_p || ''
        } else {
          this.brick.Chooser_p = eYo.key.NONE
          this.brick.Decorator_p = after || ''
        }
      },
      synchronize: false,
      xml: false
    },
    chooser: {
      all: [
        eYo.key.NONE, // custom name with no arguments
        eYo.key.N_ARY, // custom name with arguments
        // eYo.key.GETTER,
        eYo.key.SETTER,
        eYo.key.DELETER
      ],
      init: null,
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        switch(after) {
          case eYo.key.NONE:
          this.brick.Variant_p = eYo.key.NONE
          this.brick.Decorator_p = this.brick.Saved_p || ''
          break
          case eYo.key.N_ARY:
          if(this.brick.Variant_p !== eYo.key.NONE) {
            this.brick.Decorator_p = this.brick.Saved_p || ''
          }
          this.brick.Variant_p = eYo.key.N_ARY
          this.brick.MainChooser_p = eYo.key.NONE
          break
          case eYo.key.SETTER:
          case eYo.key.DELETER:
          this.brick.MainChooser_p = eYo.key.NONE
          this.brick.Decorator_p = this.brick.Saved_p + '.' + after
          break
        }
      },
      synchronize: false,
      xml: false
    }
  },
  fields: {
    prefix: {
      reserved: '@'
    }
  },
  slots: {
    name: {
      order: 1,
      fields: {
        bind: {
          validate: true,
          endEditing: true,
          variable: true,
          // left_space: true,
          css_class () /** @suppress {globalThis} */ {
            return [
              eYo.key.PROPERTY,
              eYo.key.STATICMETHOD,
              eYo.key.CLASSMETHOD
            ].indexOf(this.brick.Decorator_p) >= 0
            ? 'eyo-code-reserved'
            : 'eyo-code'
          }
        }
      }
    },
    property: {
      order: 2,
      fields: {
        prefix: '.',
        bind: {
          reserved: ''
        }
      }
    },
    n_ary: {
      order: 3,
      fields: {
        start: '(',
        end: ')'
      },
      promise: eYo.t3.expr.argument_list,
      didLoad () /** @suppress {globalThis} */ {
        var t = this.targetBrick // may be null ?
        if (t && t.children_.length) {
          this.brick.Variant_p = eYo.key.N_ARY
        }
      }
    }
  },
  foot: {
    required: true
  }
}, true)

Object.defineProperties(eYo.stmt.decorator_stmt.prototype, {
  /**
   * @readonly
   * @property {Boolean} decorator bricks are white when followed by a statement.
   */
  isWhite: {
    get () {
      return !!this.foot
    }
  }
})

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @override
 */
eYo.stmt.decorator_stmt.prototype.populateContextMenuFirst_ = function (mngr) {
  var variant_p = this.Variant_p
  if (variant_p !== eYo.key.NONE) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('@', 'eyo-code-reserved'),
      eYo.do.CreateSPAN(eYo.msg.placeholder.DECORATOR, 'eyo-code-placeholder')
    )
    mngr.addChild(mngr.newMenuItem(content, () => {
      this.Chooser_p = eYo.key.NONE
    }))
  }
  var builtins = [
    eYo.key.STATICMETHOD,
    eYo.key.CLASSMETHOD,
    eYo.key.PROPERTY
  ]
  builtins.forEach((builtin) => {
    if (builtin !== this.Target_p) {
      var content = eYo.do.CreateSPAN('@' + builtin, 'eyo-code-reserved')
      mngr.addChild(mngr.newMenuItem(content, () => {
          this.Chooser_p = builtin
        }
      ))
    }
  })
  if (variant_p !== eYo.key.N_ARY) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.do.CreateSPAN('@', 'eyo-code-reserved'),
      eYo.do.CreateSPAN(eYo.msg.placeholder.DECORATOR, 'eyo-code-placeholder'),
      eYo.do.CreateSPAN('(…)', 'eyo-code')
    )
    mngr.addChild(mngr.newMenuItem(content, () => {
      this.Chooser_p = eYo.key.N_ARY
    }))
  }
  if (this.Decorator_p.length) {
    builtins = [
      eYo.key.SETTER,
      eYo.key.DELETER
    ]
    builtins.forEach((builtin) => {
      if (builtin !== this.Property_p) {
        var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
          eYo.do.CreateSPAN('@', 'eyo-code-reserved'),
          eYo.do.CreateSPAN(eYo.msg.placeholder.IDENTIFIER, 'eyo-code-placeholder'),
          eYo.do.CreateSPAN('.', 'eyo-code'),
          eYo.do.CreateSPAN(builtin, 'eyo-code-reserved')
        )
        mngr.addChild(mngr.newMenuItem(content, () => {
          this.Chooser_p = builtin
        }))
      }
    })
  }
  mngr.shouldSeparate()
  return eYo.stmt.decorator_stmt.SuperProto_.populateContextMenuFirst_.call(this, mngr)
}

/**
 * Class for a Delegate, funcdef_part.
 * For edython.
 */
eYo.stmt.Group.makeInheritedC9r('funcdef_part', {
  data: {
    variant: {
      all: [null, eYo.key.TYPE],
      init: null,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        this.brick.type_s.requiredIncog = after === eYo.key.TYPE
      }
    },
    name: {
      init: '',
      placeholder: eYo.msg.placeholder.IDENTIFIER,
      validate (after) /** @suppress {globalThis} */ {
        var p5e = eYo.t3.profile.get(after, null)
        return p5e.expr === eYo.t3.expr.identifier
          || p5e.expr === eYo.t3.expr.unset
          ? after
          : eYo.INVALID
      },
      synchronize: true
    }
  },
  slots: {
    name: {
      order: 1,
      fields: {
        prefix: 'def',
        bind: {
          validate: true,
          endEditing: true
        }
      }
    },
    parameters: {
      order: 2,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.t3.expr.parameter_list
    },
    type: {
      order: 3,
      fields: {
        label: '->'
      },
      check: eYo.t3.expr.check.expression
    }
  }
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.stmt.funcdef_part.prototype.populateContextMenuFirst_ = function (mngr) {
  var variants = this.variant_d.getAll()
  var variant = this.Variant_p
  var F = (content, key) => {
    var menuItem = mngr.newMenuItem(content, () => {
      this.Variant_p = key
    })
    mngr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.do.CreateSPAN('def', 'eyo-code-reserved'),
    eYo.do.CreateSPAN(' f', 'eyo-code-placeholder'),
    goog.dom.createTextNode('(…)')
  ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.do.CreateSPAN('def', 'eyo-code-reserved'),
    eYo.do.CreateSPAN(' f', 'eyo-code-placeholder'),
    goog.dom.createTextNode('(…) -> …')
  ), variants[1])
  mngr.shouldSeparate()
  return eYo.stmt.funcdef_part.SuperProto_.populateContextMenuFirst_.call(this, mngr)
}

/*
classdef_part ::=  "class" classname [parenth_argument_list] ':'
*/

/**
 * Class for a Delegate, classdef_part brick.
 * For edython.
 */
eYo.stmt.Group.makeInheritedC9r('classdef_part', {
  data: {
    variant: {
      all: [eYo.key.NONE, eYo.key.N_ARY],
      init: eYo.key.NONE,
      synchronize (builtin, after) /** @suppress {globalThis} */{
        builtin()
        this.brick.n_ary_s.requiredIncog = after === eYo.key.N_ARY
      },
      xml: false
    },
    name: {
      init: '',
      placeholder: eYo.msg.placeholder.IDENTIFIER,
      validate (after) /** @suppress {globalThis} */ {
        var p5e = eYo.t3.profile.get(after, null)
        return p5e.expr === eYo.t3.expr.identifier
          || p5e.expr === eYo.t3.expr.unset
          ? after
          : eYo.INVALID
      },
      synchronize: true
    }
  },
  slots: {
    name: {
      order: 1,
      fields: {
        label: 'class',
        bind: {
          validate: true,
          endEditing: true,
          variable: true
        }
      }
    },
    n_ary: {
      order: 2,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.t3.expr.argument_list,
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.Variant_p = eYo.key.N_ARY
        }
      }
    }
  }
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {eYo.brick.Dflt} brick The brick.
 * @param {eYo.MenuManager} mngr mngr.menu is the menu to populate.
 * @private
 */
eYo.stmt.Classdef_part.prototype.populateContextMenuFirst_ = function (mngr) {
  var variants = this.variant_d.getAll()
  var variant = this.variant_d.get()
  var F = (content, key) => {
    var menuItem = mngr.newMenuItem(content, () => {
      this.Variant_p = key
    })
    mngr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.do.CreateSPAN('class', 'eyo-code-reserved'),
    eYo.do.CreateSPAN(' name', 'eyo-code-placeholder')
  ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.do.CreateSPAN('class', 'eyo-code-reserved'),
    eYo.do.CreateSPAN(' name', 'eyo-code-placeholder'),
    goog.dom.createTextNode('(…)')
  ), variants[1])
  mngr.shouldSeparate()
  return eYo.stmt.classdef_part.SuperProto_.populateContextMenuFirst_.call(this, mngr)
}

eYo.brick.Proc.t3s = [
  eYo.t3.expr.identifier,
  eYo.t3.stmt.decorator_stmt,
  eYo.t3.stmt.funcdef_part,
  eYo.t3.stmt.classdef_part
]
