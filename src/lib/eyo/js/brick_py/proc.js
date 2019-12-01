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

goog.require('eYo.Brick.Group')

goog.require('eYo.XRE')

goog.require('eYo.Msg')
goog.require('eYo.Brick.Primary')
goog.require('eYo.MenuItem')
goog.require('goog.dom');
goog.provide('eYo.Brick.Proc')

eYo.Do.readOnlyMixin(eYo.XRE, {
  decorator: XRegExp(`^@?
    (?:
      (?<property> property) |
      (?<classmethod> classmethod) |
      (?<staticmethod> staticmethod) |
      (?:
        (?<property_name>${eYo.XRE[eYo.Key._IDENTIFIER]})?
        \\.
        (?:
          (?<setter> setter) |
          (?<deleter> deleter)
        )
      ) |
      (?<dotted_name>
        (?<dots> \\.*)
        (?<dotted>
          (?:${eYo.XRE[eYo.Key._IDENTIFIER]}\\.)*
        )
        (?<name>${eYo.XRE[eYo.Key._IDENTIFIER]}?) # matches a void string
      )
    )
    $`, 'x'
  )
})
/**
 * Class for a Delegate, decorator.
 * For edython.
 */
eYo.Stmt.makeSubclass('decorator_stmt', {
  xml: {
    attr: '@'
  },
  data: {
    property: {
      all: [
        eYo.Key.GETTER,
        eYo.Key.SETTER,
        eYo.Key.DELETER
      ],
      init: null,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        // the property change may echo into a decorator change
        this.didChange(oldValue, newValue)
        if (newValue === eYo.Key.GETTER) {
          var variant = this.brick.variant_p
          if (variant === eYo.Key.NONE || variant === eYo.Key.N_ARY) {
            this.brick.decorator_p = this.brick.saved_p || ''
          } else {
            this.brick.decorator_p = variant || ''
          }
        } else if (newValue) {
          this.brick.decorator_p = this.brick.saved_p + '.' + newValue
        }
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        this.incog = newValue === eYo.Key.GETTER
        // update the placeholder for the name field.
        this.brick.name_d.field.getPlaceholderText(true)
      },
      xml: false
    },
    variant: {
      all: [
        eYo.Key.NONE, // custom name with no arguments, possibly attributes
        eYo.Key.STATICMETHOD, // @staticmethod
        eYo.Key.CLASSMETHOD, // @classmethod
        eYo.Key.PROPERTY, // @property
        eYo.Key.N_ARY // custom name with arguments
      ],
      init: eYo.Key.NONE,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        if (newValue !== eYo.Key.PROPERTY) {
          this.brick.property_p = eYo.Key.GETTER
        }
        if (newValue === eYo.Key.N_ARY) {
          this.brick.chooser_p = eYo.Key.N_ARY
          this.brick.mainChooser_p = eYo.Key.NONE
        } else {
          this.brick.mainChooser_p = newValue
        }
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) { // would variants synchronize?
        this.incog = newValue !== eYo.Key.N_ARY
        this.synchronize(newValue)
        this.brick.n_ary_s.incog = newValue !== eYo.Key.N_ARY
      },
      xml: {
        save: /** @suppress {globalThis} */ function (element, opt) {
          if (this.get() === eYo.Key.N_ARY) {
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
        eYo.T3.Expr.dotted_name,
        eYo.T3.Expr.identifier,
        eYo.T3.Expr.unset
      ],
      init: '',
      placeholder: /** @suppress {globalThis} */ function () {
        var b3k = this.brick
        return b3k.variant_p === eYo.Key.PROPERTY && b3k.property_p !== eYo.Key.GETTER
        ? eYo.Msg.Placeholder.IDENTIFIER
        : eYo.Msg.Placeholder.DECORATOR
      },
      validate: /** @suppress {globalThis} */ function (newValue) {
        var p5e = eYo.T3.Profile.get(newValue, null)
        if (this.getAll().indexOf(p5e.expr) >= 0) {
          return {validated: newValue}
        }
        return null
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var b3k = this.brick
        var p = b3k.property_p
        if (p && p !== eYo.Key.GETTER) {
          newValue = newValue + '.' + p
        }
        b3k.decorator_p = newValue || ''
      },
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var d = this.field.ui_driver_mgr
        d && (d.setVisualAttribute(this.field, newValue))
      },
      xml: false
    },
    decorator: {
      all: [ // accepted types
        eYo.T3.Expr.dotted_name,
        eYo.T3.Expr.identifier,
        eYo.T3.Expr.unset
      ],
      init: '',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var p5e = eYo.T3.Profile.get(newValue, null)
        if (this.getAll().indexOf(p5e.expr) >= 0 || this.getAll().indexOf(p5e.base) >= 0) {
          return {validated: newValue}
        }
        return null
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        var b3k = this.brick
        var m = XRegExp.exec(newValue, eYo.XRE.decorator)
        if (m) {
          if (m.setter) {
            b3k.target_p = b3k.saved_p = m.property_name
            if (b3k.variant_p === eYo.Key.N_ARY) {
              b3k.variant_p = eYo.Key.NONE
            }
            b3k.property_p = eYo.Key.SETTER
            b3k.mainChooser_p = eYo.Key.NONE
            b3k.chooser_p = eYo.Key.SETTER
          } else if(m.deleter) {
            b3k.target_p = b3k.saved_p = m.property_name
            if (b3k.variant_p === eYo.Key.N_ARY) {
              b3k.variant_p = eYo.Key.NONE
            }
            b3k.property_p = eYo.Key.DELETER
            b3k.mainChooser_p = eYo.Key.NONE
            b3k.chooser_p = eYo.Key.DELETER
          } else {
            b3k.property_p = eYo.Key.GETTER
            b3k.chooser_p = eYo.Key.NONE
            if (m.property) {
              b3k.variant_p = b3k.target_p = eYo.Key.PROPERTY
              b3k.mainChooser_p = eYo.Key.PROPERTY
            } else if (m.staticmethod) {
              b3k.variant_p = b3k.target_p = eYo.Key.STATICMETHOD
              b3k.mainChooser_p = eYo.Key.STATICMETHOD
            } else if (m.classmethod) {
              b3k.variant_p = b3k.target_p = eYo.Key.CLASSMETHOD
              b3k.mainChooser_p = eYo.Key.CLASSMETHOD
            } else {
              if (b3k.variant_p !== eYo.Key.N_ARY) {
                b3k.variant_p = eYo.Key.NONE
              }
              b3k.target_p = b3k.saved_p = newValue
              b3k.mainChooser_p = eYo.Key.NONE
            }
          }
        } else {
          b3k.target_p = newValue
          b3k.property_p = eYo.Key.GETTER
          b3k.mainChooser_p = eYo.Key.NONE
          b3k.chooser_p = eYo.Key.NONE
        }
      },
      synchronize: true,
      xml: true
    },
    mainChooser: {
      all: [
        eYo.Key.NONE, // custom name with no arguments
        eYo.Key.STATICMETHOD, // @staticmethod
        eYo.Key.CLASSMETHOD, // @classmethod
        eYo.Key.PROPERTY // @property
      ],
      init: null,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        if (newValue === eYo.Key.NONE) {
          this.brick.variant_p = eYo.Key.NONE
          this.brick.decorator_p = this.brick.saved_p || ''
        } else {
          this.brick.chooser_p = eYo.Key.NONE
          this.brick.decorator_p = newValue || ''
        }
      },
      synchronize: false,
      xml: false
    },
    chooser: {
      all: [
        eYo.Key.NONE, // custom name with no arguments
        eYo.Key.N_ARY, // custom name with arguments
        // eYo.Key.GETTER,
        eYo.Key.SETTER,
        eYo.Key.DELETER
      ],
      init: null,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.didChange(oldValue, newValue)
        switch(newValue) {
          case eYo.Key.NONE:
          this.brick.variant_p = eYo.Key.NONE
          this.brick.decorator_p = this.brick.saved_p || ''
          break
          case eYo.Key.N_ARY:
          if(this.brick.variant_p !== eYo.Key.NONE) {
            this.brick.decorator_p = this.brick.saved_p || ''
          }
          this.brick.variant_p = eYo.Key.N_ARY
          this.brick.mainChooser_p = eYo.Key.NONE
          break
          case eYo.Key.SETTER:
          case eYo.Key.DELETER:
          this.brick.mainChooser_p = eYo.Key.NONE
          this.brick.decorator_p = this.brick.saved_p + '.' + newValue
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
          css_class: /** @suppress {globalThis} */ function () {
            return [
              eYo.Key.PROPERTY,
              eYo.Key.STATICMETHOD,
              eYo.Key.CLASSMETHOD
            ].indexOf(this.brick.decorator_p) >= 0
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
      promise: eYo.T3.Expr.argument_list,
      didLoad: /** @suppress {globalThis} */ function () {
        var t = this.targetBrick // may be null ?
        if (t && t.children_.length) {
          this.brick.variant_p = eYo.Key.N_ARY
        }
      }
    }
  },
  statement: {
    foot: {
      required: true
    }
  }
}, true)

Object.defineProperties(eYo.Stmt.decorator_stmt.prototype, {
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
 * @param {!eYo.Brick.Dflt} brick The brick.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @override
 */
eYo.Stmt.decorator_stmt.prototype.populateContextMenuFirst_ = function (mgr) {
  var variant_p = this.variant_p
  if (variant_p !== eYo.Key.NONE) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('@', 'eyo-code-reserved'),
      eYo.Do.createSPAN(eYo.Msg.Placeholder.DECORATOR, 'eyo-code-placeholder')
    )
    mgr.addChild(mgr.newMenuItem(content, () => {
      this.chooser_p = eYo.Key.NONE
    }))
  }
  var builtins = [
    eYo.Key.STATICMETHOD,
    eYo.Key.CLASSMETHOD,
    eYo.Key.PROPERTY
  ]
  builtins.forEach((builtin) => {
    if (builtin !== this.target_p) {
      var content = eYo.Do.createSPAN('@' + builtin, 'eyo-code-reserved')
      mgr.addChild(mgr.newMenuItem(content, () => {
          this.chooser_p = builtin
        }
      ))
    }
  })
  if (variant_p !== eYo.Key.N_ARY) {
    var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
      eYo.Do.createSPAN('@', 'eyo-code-reserved'),
      eYo.Do.createSPAN(eYo.Msg.Placeholder.DECORATOR, 'eyo-code-placeholder'),
      eYo.Do.createSPAN('(…)', 'eyo-code')
    )
    mgr.addChild(mgr.newMenuItem(content, () => {
      this.chooser_p = eYo.Key.N_ARY
    }))
  }
  if (this.decorator_p.length) {
    builtins = [
      eYo.Key.SETTER,
      eYo.Key.DELETER
    ]
    builtins.forEach((builtin) => {
      if (builtin !== this.property_p) {
        var content = goog.dom.createDom(goog.dom.TagName.SPAN, null,
          eYo.Do.createSPAN('@', 'eyo-code-reserved'),
          eYo.Do.createSPAN(eYo.Msg.Placeholder.IDENTIFIER, 'eyo-code-placeholder'),
          eYo.Do.createSPAN('.', 'eyo-code'),
          eYo.Do.createSPAN(builtin, 'eyo-code-reserved')
        )
        mgr.addChild(mgr.newMenuItem(content, () => {
          this.chooser_p = builtin
        }))
      }
    })
  }
  mgr.shouldSeparate()
  return eYo.Stmt.decorator_stmt.superClass_.populateContextMenuFirst_.call(this, mgr)
}

/**
 * Class for a Delegate, funcdef_part.
 * For edython.
 */
eYo.Brick.Group.makeSubclass('funcdef_part', {
  data: {
    variant: {
      all: [null, eYo.Key.TYPE],
      init: null,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        this.brick.type_s.requiredIncog = newValue === eYo.Key.TYPE
      }
    },
    name: {
      init: '',
      placeholder: eYo.Msg.Placeholder.IDENTIFIER,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var p5e = eYo.T3.Profile.get(newValue, null)
        return p5e.expr === eYo.T3.Expr.identifier
          || p5e.expr === eYo.T3.Expr.unset
          ? {validated: newValue}
          : null
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
      wrap: eYo.T3.Expr.parameter_list
    },
    type: {
      order: 3,
      fields: {
        label: '->'
      },
      check: eYo.T3.Expr.Check.expression
    }
  }
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {!eYo.Brick.Dflt} brick The brick.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.Stmt.funcdef_part.prototype.populateContextMenuFirst_ = function (mgr) {
  var variants = this.variant_d.getAll()
  var variant = this.variant_p
  var F = (content, key) => {
    var menuItem = mgr.newMenuItem(content, () => {
      this.variant_p = key
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('def', 'eyo-code-reserved'),
    eYo.Do.createSPAN(' f', 'eyo-code-placeholder'),
    goog.dom.createTextNode('(…)')
  ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('def', 'eyo-code-reserved'),
    eYo.Do.createSPAN(' f', 'eyo-code-placeholder'),
    goog.dom.createTextNode('(…) -> …')
  ), variants[1])
  mgr.shouldSeparate()
  return eYo.Stmt.funcdef_part.superClass_.populateContextMenuFirst_.call(this, mgr)
}

/*
classdef_part ::=  "class" classname [parenth_argument_list] ':'
*/

/**
 * Class for a Delegate, classdef_part brick.
 * For edython.
 */
eYo.Brick.Group.makeSubclass('classdef_part', {
  data: {
    variant: {
      all: [eYo.Key.NONE, eYo.Key.N_ARY],
      init: eYo.Key.NONE,
      synchronize: /** @suppress {globalThis} */ function (newValue){
        this.synchronize(newValue)
        this.brick.n_ary_s.requiredIncog = newValue === eYo.Key.N_ARY
      },
      xml: false
    },
    name: {
      init: '',
      placeholder: eYo.Msg.Placeholder.IDENTIFIER,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var p5e = eYo.T3.Profile.get(newValue, null)
        return p5e.expr === eYo.T3.Expr.identifier
          || p5e.expr === eYo.T3.Expr.unset
          ? {validated: newValue}
          : null
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
      wrap: eYo.T3.Expr.argument_list,
      didLoad: /** @suppress {globalThis} */ function () {
        if (this.requiredFromSaved) {
          this.brick.variant_p = eYo.Key.N_ARY
        }
      }
    }
  }
}, true)

/**
 * Populate the context menu for the given brick.
 * @param {!eYo.Brick.Dflt} brick The brick.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.Stmt.classdef_part.prototype.populateContextMenuFirst_ = function (mgr) {
  var variants = this.variant_d.getAll()
  var variant = this.variant_d.get()
  var F = (content, key) => {
    var menuItem = mgr.newMenuItem(content, () => {
      this.variant_p = key
    })
    mgr.addChild(menuItem, true)
    menuItem.setEnabled(key !== variant)
  }
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('class', 'eyo-code-reserved'),
    eYo.Do.createSPAN(' name', 'eyo-code-placeholder')
  ), variants[0])
  F(goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
    eYo.Do.createSPAN('class', 'eyo-code-reserved'),
    eYo.Do.createSPAN(' name', 'eyo-code-placeholder'),
    goog.dom.createTextNode('(…)')
  ), variants[1])
  mgr.shouldSeparate()
  return eYo.Stmt.classdef_part.superClass_.populateContextMenuFirst_.call(this, mgr)
}

eYo.Brick.Proc.T3s = [
  eYo.T3.Expr.identifier,
  eYo.T3.Stmt.decorator_stmt,
  eYo.T3.Stmt.funcdef_part,
  eYo.T3.Stmt.classdef_part
]
