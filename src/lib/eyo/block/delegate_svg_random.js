/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Random')

goog.require('eYo.DelegateSvg.Stmt')
goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Range')
goog.require('eYo.DelegateSvg.Primary')

goog.require('eYo.FlyoutCategory')

/**
 * Class for a DelegateSvg, import random block.
 * A unique block for each module to ease forthcoming management.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('random__import_stmt', {
  xml: {
    tag: 'random+import',
  },
  fields: {
    label: {
      value: 'import',
      css: 'builtin'
    },
    random: {
      value: 'random'
    }
  }
})


/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.module_call_expr.makeSubclass('random__call_expr', {
  data: {
    name: {
      init: /** @suppress {globalThis} */ function () {
        this.set('randint')
        this.isFinite = true
      },
      synchronize: true,
      validate: false,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        this.data.nameFinite.set(newValue)
        this.data.nameInfinite.set(newValue)
        var d = this.data.ary
        switch (newValue) {
          case 'choice':
          case 'getrandbits':
          d.set(d.model.UNARY)
          break
          case 'randint':
          case 'sample':
          d.set(d.model.BINARY)
          break
          case 'choices':
          d.set(d.model.N_ARY)
          break
          case 'random':
          case 'getstate':
          d.set(d.model.NO_ARY)
          break
          case 'expovariate':
          case 'paretovariate':
          d.set(d.model.UNARY)
          break
          case 'uniform':
          case 'betavariate':
          case 'gammavariate':
          case 'gauss':
          case 'lognormvariate':
          case 'normalvariate':
          case 'vonmisesvariate':
          case 'weibullvariate':
          d.set(d.model.BINARY)
          break
          case 'triangular':
          d.set(d.model.TERNARY)
          break
          default:
          d.set(d.model.N_ARY)
          break
        }
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      }
    },
    nameFinite : {
      all: ['randint', 'choice', 'choices', 'sample', 'getrandbits'],
      init: 'randint',
      noUndo: true,
      xml: false,
      validate: true,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        if (oldValue && (newValue !== oldValue)) {
          this.data.name.set(newValue)
          this.data.name.isFinite = true
        }
      }
    },
    nameInfinite : {
      all: ['random', 'uniform', 'triangular', 'betavariate', 'expovariate', 'gammavariate', 'gauss', 'lognormvariate', 'normalvariate', 'vonmisesvariate', 'paretovariate', 'weibullvariate'],
      init: 'random',
      noUndo: true,
      xml: false,
      validate: true,
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        if (oldValue && (newValue !== oldValue)) {
          this.data.name.set(newValue)
          this.data.name.isFinite = false
        }
      }
    }
  },
  fields: {
    module: {
      value: 'random',
      validate: false,
      endEditing: false
    }
  },
  output: {
    check: [eYo.T3.Expr.random__call_expr, eYo.T3.Expr.call_expr]
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.random__call_expr.populateMenu = function (block, mgr) {
  var eyo = block.eyo
  var current_name = eyo.data.name.get()
  var isFinite = !!eyo.data.name.isFinite
  var data = isFinite ? eyo.data.nameFinite : eyo.data.nameInfinite
  var otherData = isFinite ? eyo.data.nameInfinite : eyo.data.nameFinite
  var names = data.getAll()
  var F = function (i) {
    var name = names[i]
    if (name !== current_name) {
      var content =
      goog.dom.createDom(goog.dom.TagName.SPAN, 'eyo-code',
        'random.' + name + '(...)'
      )
      var menuItem = new eYo.MenuItem(content, function () {
        console.log('Change', isFinite ? 'finite' : 'infinite', 'name to', name)
        eyo.data.name.set(name)
      })
      mgr.addChild(menuItem, true)
    }
  }
  for (var i = 0; i < names.length; i++) {
    F(i)
  }
  mgr.shouldSeparate()
  var content =
  eYo.Do.createSPAN(isFinite ? 'random, uniform, gauss...' : 'randint, choice, sample...', 'eyo-code')
  var menuItem = new eYo.MenuItem(content, function () {
    eyo.data.name.set(otherData.get())
  })
  mgr.addChild(menuItem, true)
  var content =
  eYo.Do.createSPAN('getstate()', 'eyo-code')
  var menuItem = new eYo.MenuItem(content, function () {
    eyo.data.name.set('getstate')
    eyo.data.name.isFinite = isFinite
  })
  mgr.addChild(menuItem, true)
  mgr.shouldSeparate()
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.random__call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.random__call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Expr.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('random__call_stmt', {
  link: eYo.T3.Expr.random__call_expr
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.random__call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.random__call_expr.populateMenu.call(this, block, mgr)
  return eYo.DelegateSvg.Stmt.random__call_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

//random__seed_stmt ::= "random.seed" (a=None, version=2)

/**
 * Class for a DelegateSvg, seed block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('random__seed_stmt', {
  fields: {
    label: {
      value: 'random.seed'
    }
  },
  slots: {
    arguments: {
      order: 1,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list_2
    }
  }
})

/**
 * Class for a DelegateSvg, setstate block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('random__setstate_stmt', {
  fields: {
    label: {
      value: 'random.setstate'
    }
  },
  slots: {
    state: {
      order: 1,
      fields: {
        start: '(',
        end: ')'
      },
      check: eYo.T3.Expr.Check.argument_any,
      optional: false
    }
  }
})

/**
 * Class for a DelegateSvg, shuffle block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('random__shuffle_stmt', {
  fields: {
    label: {
      value: 'random.shuffle'
    }
  },
  slots: {
    state: {
      order: 1,
      fields: {
        start: '(',
        end: ')'
      },
      wrap: eYo.T3.Expr.argument_list_2
    }
  }
})

/**
 * Class for a DelegateSvg, random range block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.builtin__range.makeSubclass('random__randrange', {
  fields: {
    label: {
      value: 'random.randrange',
      css: '' // super has 'builtin'
    }
  },
  output: {
    check: [eYo.T3.Expr.random__randrange, eYo.T3.Expr.call_expr]
  }
})

eYo.FlyoutCategory.random__module = [
  eYo.T3.Stmt.random__import_stmt,
  {
    type: eYo.T3.Expr.random__call_expr,
    data: 'randint',
    slots: {
      binary: { // implement 'main' instead of 'binary'
        slots: {
          fstart: 1,
          rend: 6
        }
      }
    }
  },
  {
    type: eYo.T3.Expr.random__call_expr,
    data: 'choice'
  },
  eYo.T3.Stmt.random__shuffle_stmt,
  {
    type: eYo.T3.Expr.random__call_expr,
    data: 'random'
  },
  {
    type: eYo.T3.Expr.random__call_expr,
    data: 'getrandbits'
  },
  {
    type: eYo.T3.Expr.random__randrange,
    slots: {
      arguments: {
        slots: {
          O: 10
        }
      }
    }
  },
  eYo.T3.Stmt.random__seed_stmt,
  // '<x eyo="identifier" name="a"><x eyo="builtin__object" value="None" slot="definition"></x></x>',
  {
    type: eYo.T3.Expr.random__call_expr,
    data: 'getstate'
  },
  eYo.T3.Stmt.random__setstate_stmt
]

eYo.DelegateSvg.Random.T3s = [
  eYo.T3.Stmt.random__import_stmt,
  eYo.T3.Stmt.random__call_expr,
  eYo.T3.Stmt.random__call_stmt,
  eYo.T3.Expr.random__randrange,
  eYo.T3.Stmt.random__seed_stmt,
  eYo.T3.Stmt.random__setstate_stmt,
  eYo.T3.Stmt.random__shuffle_stmt
]
