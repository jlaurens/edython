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

eYo.require('stmt')

eYo.require('msg')

eYo.require('expr.List')
//g@@g.require('g@@g.dom');
eYo.provide('brick.import')

/// //////////////     module_as      ///////////////////
/*
import_module ::= "import" non_void_module_as_list
non_void_module_as_list ::= module_as ( "," module_as )*
# module_as is not just an identifier, to simplify the UI management
# module might represent here an object from a python module
module_as ::= module ["as" identifier]
module ::= module_name ['.' module]
#name  ::=  identifier
name ::= IGNORE
module_name ::= identifier
*/

/**
 * Class for a Delegate, non_void_module_as_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.List.makeInheritedC9r('non_void_module_as_list', {
  list: {
    check: eYo.t3.expr.check.non_void_module_as_list,
    mandatory: 1,
    presep: ','
  }
})

/**
 * Class for a Delegate, non_void_import_identifier_as_list brick.
 * This brick may be wrapped.
 * Not normally called directly, eYo.brick.Create(...) is preferred.
 * For edython.
 */
eYo.expr.List.makeInheritedC9r('non_void_import_identifier_as_list', {
  list: {
    check: eYo.t3.expr.check.non_void_import_identifier_as_list,
    mandatory: 1,
    presep: ',',
    placeholder: eYo.msg.placeholder.IDENTIFIER
  }
})

/// //////////////     import_stmt      ///////////////////

/**
 * Class for a Delegate, import_stmt.
 * The value property is used to store the module.
 * For edython.
 */
eYo.stmt.makeC9r('import_stmt', true, {
  data: {
    variant: {
      all: [
        eYo.key.IMPORT,
        eYo.key.FROM_MODULE_IMPORT,
        eYo.key.FROM_MODULE_IMPORT_STAR
      ],
      init: eYo.key.IMPORT,
      synchronize (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        var b3k = this.brick
        b3k.import_module_d.requiredIncog = after === eYo.key.IMPORT
        b3k.from_d.requiredIncog = after !== eYo.key.IMPORT
        b3k.import_d.requiredIncog = after === eYo.key.FROM_MODULE_IMPORT
        b3k.import_star_s.requiredIncog = after === eYo.key.FROM_MODULE_IMPORT_STAR
      }
    },
    import_module: {
      init: '',
      placeholder: eYo.msg.placeholder.TERM,
      validate (after) /** @suppress {globalThis} */ {
        var p5e = eYo.t3.profile.get(after)
        return p5e === eYo.t3.profile.void
        || p5e.raw === eYo.t3.expr.builtin__name
        || p5e.expr === eYo.t3.expr.identifier
        || p5e.expr === eYo.t3.expr.parent_module
        || p5e.expr === eYo.t3.expr.dotted_name
        || after === '...'
        ? after : eYo.INVALID
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        if (after) {
          this.brick.variant_ = eYo.key.IMPORT
        }
      },
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          if (!this.brick.import_module_s.unwrappedTarget) {
            this.save(element, opt)
          }
        }
      }
    },
    from: {
      init:'',
      placeholder: eYo.msg.placeholder.MODULE,
      validate (after) /** @suppress {globalThis} */ {
        var p5e = eYo.t3.profile.get(after, null)
        var variant = this.brick.Variant_p
        return p5e === eYo.t3.profile.void
        || p5e.expr === eYo.t3.expr.identifier
        || p5e.expr === eYo.t3.expr.dotted_name
        || ((variant !== eYo.key.FROM_MODULE_IMPORT_STAR)
          && (p5e.expr === eYo.t3.expr.parent_module || after === '...'))
            ? after: eYo.INVALID
      },
      synchronize: true,
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        if (after) {
          var b3k = this.brick
          if (b3k.variant === eYo.key.IMPORT) {
            // STAR of not ?
            b3k.variant_ = b3k.import_s.unwrappedTarget
            ? eYo.key.FROM_MODULE_IMPORT
            : eYo.key.FROM_MODULE_IMPORT_STAR
          }
        }
      }
    },
    import: {
      init: '',
      placeholder: eYo.msg.placeholder.TERM,
      validate (after) /** @suppress {globalThis} */ {
        var p5e = eYo.t3.profile.get(after)
        return p5e === eYo.t3.profile.void
        || p5e.expr === eYo.t3.expr.identifier
        ? after: eYo.INVALID
      },
      didChange (builtin, after) /** @suppress {globalThis} */ {
        builtin()
        if (after) {
          this.brick.variant_ = eYo.key.FROM_MODULE_IMPORT
        }
      },
      synchronize: true,
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          if (!this.brick.import_s.unwrappedTarget) {
            this.save(element, opt)
          }
        }
      }
    }
  },
  slots: {
    import_module: {
      order: 1,
      fields: {
        label: 'import',
        bind: {
          endEditing: true
        }
      },
      promise: eYo.t3.expr.non_void_module_as_list,
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ {
        var parent = this.brick.parent
        parent && (parent.variant_ = eYo.key.IMPORT)
      }
    },
    from: {
      order: 2,
      fields: {
        label: 'from',
        bind: {
          endEditing: true,
          variable: true // change this to/with a `module` data
        }
      },
      check (type) /** @suppress {globalThis} */ {
        var v = this.brick.Variant_p
        return v === eYo.key.FROM_MODULE_IMPORT_STAR
        ? [
          eYo.t3.expr.unset,
          eYo.t3.expr.identifier,
          eYo.t3.expr.dotted_name
        ] : [
          eYo.t3.expr.unset,
          eYo.t3.expr.identifier,
          eYo.t3.expr.dotted_name,
          eYo.t3.expr.parent_module
        ]
      },
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          var b3k = this.brick
          if (b3k.variant === eYo.key.IMPORT) {
            // STAR of not ?
            b3k.variant_ = b3k.import_s.unwrappedTarget
            ? eYo.key.FROM_MODULE_IMPORT
            : eYo.key.FROM_MODULE_IMPORT_STAR
          }
        }
      },
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ {
        var O = this.brick
        if (b3k.variant === eYo.key.IMPORT) {
          // STAR of not ?
          b3k.variant_ = b3k.import_s.unwrappedTarget
          ? eYo.key.FROM_MODULE_IMPORT
          : eYo.key.FROM_MODULE_IMPORT_STAR
        }
      }
    },
    import: {
      order: 3,
      fields: {
        label: 'import',
        bind: {
          endEditing: true
        }
      },
      promise: eYo.t3.expr.non_void_import_identifier_as_list,
      didLoad () /** @suppress {globalThis} */ {
        if (this.requiredFromSaved) {
          this.brick.variant_ = eYo.key.FROM_MODULE_IMPORT
        }
      },
      didConnect (oldTargetM4t, targetOldM4t) /** @suppress {globalThis} */ {
        var parent = this.brick.parent
        parent && (parent.variant_ = eYo.key.FROM_MODULE_IMPORT)
      }
    },
    import_star: {
      order: 4,
      fields: {
        label: {
          reserved: 'import *'
        }
      },
      xml: {
        save (element, opt) /** @suppress {globalThis} */ {
          if (this.brick.variant === eYo.key.FROM_MODULE_IMPORT_STAR) {
            element.setAttribute('star', 'true')
          }
        },
        load (element) /** @suppress {globalThis} */ {
          if (element.getAttribute('star') === 'true') {
            this.brick.variant_ = eYo.key.FROM_MODULE_IMPORT_STAR
          }
        }
      }
    }
  },
  init () /** @suppress {globalThis} */ {
    eYo.stmt.importRegister(this)
  },
  deinit () /** @suppress {globalThis} */ {
    eYo.stmt.importUnregister(this)
  }
})

eYo.do.register.add(eYo.stmt, 'import', function (b3k) {
  return !b3k.isInFlyout
})

Object.defineProperties(eYo.stmt.import_stmt.prototype, {
  star_p: {
    get () {
      return this.variant === eYo.key.FROM_MODULE_IMPORT_STAR
    },
    set(after) {
      if (after) {
        this.variant_ = eYo.key.FROM_MODULE_IMPORT_STAR
      } else if (this.variant === eYo.key.FROM_MODULE_IMPORT_STAR) {
        this.variant_ = eYo.key.FROM_MODULE_IMPORT
      }
    }
  }
})
/**
 * Returns a dictionary of modules imported by this brick, when not disabled.
 */
eYo.stmt.import_stmt.prototype.importedModules = function () {
  if (this.disabled) {
    return
  }
  var modules = {}
  var v = this.Variant_p
  if (v === eYo.key.IMPORT) {
    // non_void_import_identifier_as_list
    this.import_b.slotForEach(slot => {
      var t9k = slot.targetBrick
      if (t9k.type === eYo.t3.expr.identifier) {
        modules[t9k.Target_p] = t9k.Target_p
      } else if (t9k.type === eYo.t3.expr.identifier_as) {
        modules[t9k.Target_p] = t9k.Alias_p
      } else { // when connected to an 'any' brick
        var any = t9k.Expression_p
        any && (any.split(/\s*,\s*/)).forEach(c => {
          var ased = c.split(/\s*as\s*/)
          var name = ased[0]
          name && (modules[name] = ased[1] || name)
        })
      }
    })
  } else /* if (v === eYo.key.FROM_MODULE_IMPORT[_STAR]) */ {
    modules[p] = this.From_p
  }
  return modules
}

/**
 * When the brick is just a wrapper, returns the wrapped target.
 */
eYo.stmt.import_stmt.prototype.getMenuTarget = function () {
  return this
}

/// //////// future
// This is expected to disappear soon
/**
 * Class for a Delegate, future_statement.
 * For edython.
 */
eYo.stmt.makeC9r('future_statement', true, {
  slots: {
    list: {
      order: 1,
      fields: {
        label: {
          reserved: 'from __future__ import'
        }
      },
      wrap: eYo.t3.expr.non_void_import_identifier_as_list
    }
  }
})
