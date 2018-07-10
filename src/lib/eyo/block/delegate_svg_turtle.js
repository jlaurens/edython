/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Math module blocks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Turtle')

goog.require('eYo.Model.turtle__module')

goog.require('eYo.DelegateSvg.Stmt')

goog.require('eYo.DelegateSvg.List')
goog.require('eYo.DelegateSvg.Primary')

goog.require('eYo.Tooltip')
goog.require('eYo.FlyoutCategory')

/**
 * Class for a DelegateSvg, import turtle block.
 * A unique block for each module to ease forthcoming management.
 * For edython.
 */
eYo.DelegateSvg.Stmt.import_stmt.makeSubclass('turtle__import_stmt', {
  data: {
    from: {
      init: 'turtle',
      validate: /** @suppress {globalThis} */ function (newValue) {
        return newValue === 'turtle' ? {validated: newValue} : null
      }
    }
  },
  slots: {
    import_module: {
      order: 1,
      fields: {
        label: 'import',
        suffix: 'turtle'
      },
      wrap: null,
      check: null
    },
    from: {
      order: 2,
      fields: {
        label: 'from',
        edit: 'turtle'
      }
    }
  }
})

/**
 * Class for a DelegateSvg, import turtle block.
 * A unique block for each module to ease forthcoming management.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('turtle__config_stmt', {
  xml: {
    tag: 'turtle__config',
  },
  data: {
    key: {
      all: [
        'turtle_canvas_wrapper',
        'canvwidth',
        'canvheight'
      ],
      synchronize: true
    },
    value: {
      synchronize: true
    }
  },
  fields: {
    module: {
      order: 1,
      value: 'turtle',
    },
    separator: {
      order: 3,
      value: '.',
    },
    start: {
      order: 4,
      value: 'setConfig',
    }
  },
  slots: {
    key: {
      order: 1,
      fields: {
        prefix: {
          value: '('
        },
        edit: {
          placeholder: eYo.Msg.Placeholder.ARGUMENT,
          endEditing: true,
          variable: true
        },    
      }
    },
    value: {
      order: 3,
      fields: {
        prefix: '=',
        suffix: ')'
      },
      check: eYo.T3.Expr.Check.expression,
      hole_value: eYo.Msg.Placeholder.VALUE
    }
  }
})

/**
 * Class for a DelegateSvg, call block.
 * As call is already a reserved message in javascript,
 * we use turtle__call_expr instead.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Expr.module__call_expr.makeSubclass('turtle__call_expr', {
  data: {
    variant: {
      order: 100,
      NAME: eYo.Key.NAME, // no 'turtle.'
      IDENTIFIER: eYo.Key.IDENTIFIER, // 
      EXPRESSION: eYo.Key.EXPRESSION,
      all: [
        eYo.Key.NAME,
        eYo.Key.IDENTIFIER,
        eYo.Key.EXPRESSION
      ],
      init: eYo.Key.NAME,
      synchronize: /** @suppress {globalThis} */ function (newValue) {
        this.synchronize(newValue)
        var slot = this.owner.slots.expression
        slot.required = newValue === this.EXPRESSION
        slot.setIncog()
        var data = this.data.identifier
        data.required = newValue === this.IDENTIFIER
        data.setIncog()
        this.owner.slots.dot.setIncog(newValue === this.NAME)
        // force sync, usefull when switching to and from EXPRESSION variant
        this.data.identifier.synchronize()
        this.data.name.synchronize()
      }
    },
    ary: {
      validate: /** @suppress {globalThis} */ function (newValue) {
        var current = this.data.name.get()
        var item = eYo.Model.turtle__module.getItem(current)
        if (item) {
          var ary = this.getAll()[item.ary]
          return newValue === ary ? {validated: newValue}: null
        } else {
          return newValue === this.N_ARY ? {validated: newValue}: null
        }
      },
    },
    identifier: {
      init: '',
      validate: /** @suppress {globalThis} */ function (newValue) {
        var type = eYo.Do.typeOfString(newValue).expr
        if (type === eYo.T3.Expr.identifier) {
          return {validated: newValue}
        }
        return null
      },
      synchronize: true,
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromDom()) {
            var variant = this.owner.data.variant
            var current = variant.get()
            if (current !== variant.IDENTIFIER) {
              variant.set(variant.IDENTIFIER)
            }
          }
        }
      }
    },
    name: {
      init: eYo.Model.turtle__module.getItem(0).names[0],
      main: true,
      validate: /** @suppress {globalThis} */ function (newValue) {
        var item = eYo.Model.turtle__module.getItem(newValue)
        return item ? {validated: newValue} : null
      },
      didChange: /** @suppress {globalThis} */ function (oldValue, newValue) {
        var item = eYo.Model.turtle__module.getItem(newValue)
        if (item) {
          var ary = item.ary
          this.data.ary.setTrusted(goog.isDef(ary) ? ary: this.data.ary.N_ARY)
          this.data.isOptionalUnary.setTrusted(!item.mandatory)
        } else {
          this.data.ary.setTrusted(this.data.ary.N_ARY)
          this.data.isOptionalUnary.setTrusted(true)
        }
      },
      consolidate: /** @suppress {globalThis} */ function () {
        this.didChange(undefined, this.get())
      }
    }
  },
  slots: {
    module: {
      fields: {
        edit: {
          placeholder: eYo.Msg.Placeholder.IDENTIFIER
        }
      }
    },
    identifier: {
      order: 1,
      fields: {
        edit: {
          placeholder: eYo.Msg.Placeholder.IDENTIFIER,
          endEditing: true,
          variable: true
        }
      }
    },
    expression: {
      order: 10,
      check: eYo.T3.Expr.Check.primary,
      plugged: eYo.T3.Expr.primary,
      hole_value: 'primary',
      xml: {
        didLoad: /** @suppress {globalThis} */ function () {
          if (this.isRequiredFromDom()) {
            var variant = this.owner.data.variant
            var current = variant.get()
            if (current !== variant.EXPRESSION && current !== variant.EXPRESSION_ATTRIBUTE) {
              var name = this.owner.data.variant.get()
              variant.set(name.length ? variant.EXPRESSION_ATTRIBUTE : variant.EXPRESSION)
            }
          }
        }
      }
    },
    dot: {
      order: 20,
      fields: {
        separator: '.'
      }
    }
  },
  output: {
    check: [eYo.T3.Expr.call_expr, eYo.T3.Expr.turtle__call_expr]
  }
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.turtle__call_expr.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.module__call_expr.populateMenuModel.call(this, block, mgr, eYo.Model.turtle__module)
  eYo.DelegateSvg.Expr.module__call_expr.populateMenu.call(this, block, mgr, '(…)')
  return eYo.DelegateSvg.Expr.base_call_expr.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Class for a DelegateSvg, call statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('turtle__call_stmt', {
  link: eYo.T3.Expr.turtle__call_expr
})

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Stmt.turtle__call_stmt.prototype.populateContextMenuFirst_ = function (block, mgr) {
  eYo.DelegateSvg.Expr.module__call_expr.populateMenuModel.call(this, block, mgr, eYo.Model.turtle__module)
  eYo.DelegateSvg.Expr.module__call_expr.populateMenu.call(this, block, mgr, '(…)')
  return eYo.DelegateSvg.Stmt.turtle__call_stmt.superClass_.populateContextMenuFirst_.call(this, block, mgr)
}

/**
 * Template for contextual menu content.
 * @param {!Blockly.Block} block The block.
 */
eYo.DelegateSvg.Stmt.turtle__call_stmt.prototype.contentTemplate = eYo.DelegateSvg.Stmt.module__call_stmt.prototype.contentTemplate

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!eYo.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
eYo.DelegateSvg.Expr.turtle__call_expr.prototype.contentForCategory = eYo.DelegateSvg.Stmt.turtle__call_stmt.prototype.contentForCategory = function (block, category) {
  var contents = {
    "bookkeeping-functions" : 'getstate, getrandbits',
    "functions-for-integers" : 'randrange, randint',
    "functions-for-sequences" : 'choice, choices, sample',
    "real-valued-distributions" : 'random, uniform, ...',
    "alternative-generator" : ''
  }
  return contents[category] || category
}

/**
 * Get the module.
 * @param {!Blockly.Block} block The block.
 */
eYo.DelegateSvg.Expr.turtle__call_expr.prototype.getModule = eYo.DelegateSvg.Stmt.turtle__call_stmt.prototype.getModule = function (block) {
  return 'turtle'
}

/**
 * Class for a DelegateSvg, turtle setup statement block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Stmt.makeSubclass('turtle__setup_stmt', {
  fields: {
    label: 'edython.turtleSetup()'
  }
})

var F_stmt = function (name, title) {
  var key = 'turtle__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Stmt.turtle__call_stmt,
    data: {
      name: name,
      fromFlag: true
    },
    title: key
  }
}
eYo.FlyoutCategory.basic_turtle__module = [
  {
    type: eYo.T3.Stmt.turtle__import_stmt,
    data: {
      variant: eYo.Key.FROM_MODULE_IMPORT_STAR
    }
  },
  eYo.T3.Stmt.turtle__setup_stmt,
  F_stmt('done', 'Avancer de la distance donnée'),
  F_stmt('forward', 'Avancer de la distance donnée'),
  F_stmt('backward', 'Reculer de la distance donnée'),
  F_stmt('right', 'Tourner à droite d\'un angle de mesure donnée (en degrés par défaut)'),
  F_stmt('left', 'Tourner à gauche d\'un angle de mesure donnée (en degrés par défaut)'),
  F_stmt('pendown', 'Abaisser le crayon'),
  F_stmt('isdown', 'Le crayon est baissé ?'),// beware: NO BREAK SPACE before '?'
  F_stmt('penup', 'Lever le crayon'),
  F_stmt('pensize', 'Changer ou obtenir l\'épaisseur du trait.'),
  F_stmt('pencolor', 'Changer ou obtenir la couleur du trait.'),
  F_stmt('fillcolor', 'Changer ou obtenir la couleur de remplissage.'),
  F_stmt('begin_fill', 'Commencer une opération de remplissage.'),
  F_stmt('end_fill', 'Terminer une opération de remplissage.'),
  F_stmt('filling', 'En opération de remplissage ?'),// beware: NO BREAK SPACE before '?'
  
  F_stmt('circle', 'Trace un cercle, un arc de cercle, un polygone régulier ou seulement une partie.'),
  F_stmt('dot', 'Dessine un point de taille et de couleur donnée.'),
  F_stmt('shape', 'Choisir la forme parmi "arrow", "turtle, "circle", "square", "triangle" et "classic".'),
  F_stmt('stamp', 'Tamponne l\'image de la tortue.'),
  F_stmt('xcor', 'Obtenir l\'abscisse de la tortue.'),
  F_stmt('ycor', 'Obtenir l\'ordonnée de la tortue.'),
  F_stmt('position', 'Obtenir les coordonnées (x, y) de la tortue.'),
  F_stmt('distance', 'Obtenir la distance au point de coordonnées (x, y).'),
  F_stmt('setx', 'Déplace la tortue à l\'endroit spécifié sans changer d\'ordonnée ni d\'orientation. Trace un segment horizontal si le stylo est baissé.'),
  F_stmt('sety', 'Déplace la tortue à l\'endroit spécifié sans changer d\'abscisse ni d\'orientation. Trace un segment vertical si le stylo est baissé.'),
  F_stmt('setposition', 'Déplace la tortue à l\'endroit spécifié sans changer d\'orientation. Trace un segment si le stylo est baissé.'),
  F_stmt('home', 'Déplace la tortue à l\'origine. Trace un segment si le stylo est baissé.'),
  F_stmt('degrees', 'Angles mesurés en degrés'),
  F_stmt('radians', 'Angles mesurés en radians'),
  F_stmt('setheading', 'Oriente la tortue dans la direction donnée par l\'angle selon le repère choisi (mode standard et trigonométrique ou mode logo et géographique).')
]

var F_expr = function (name, title) {
  var key = 'turtle__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.turtle__call_expr,
    data: name,
    title: key
  }
}
var F_stmt = function (name, title) {
  var key = 'turtle__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Stmt.turtle__call_stmt,
    data: name,
    title: key
  }
}
eYo.FlyoutCategory.turtle__module = [
  {
    type: eYo.T3.Stmt.turtle__import_stmt,
    data: {
      variant: eYo.Key.IMPORT
    }
  },
  eYo.T3.Stmt.turtle__setup_stmt,
  {
    type: eYo.T3.Stmt.assignment_stmt,
    slots: {
      assigned: {
        slots: {
          O: {
            type: eYo.T3.Expr.module__call_expr,
            data: {
              module: 'turtle',
              name: 'Turtle'
            }
          },
        },
      },
    },
  },
  F_stmt('forward', 'Avancer de la distance donnée'),
  F_stmt('back', 'Reculer de la distance donnée'),
  F_stmt('right', 'Tourner à droite d\'un angle de mesure donnée (en degrés par défaut)'),
  F_stmt('left', 'Tourner à gauche d\'un angle de mesure donnée (en degrés par défaut)'),
  F_stmt('degrees', 'Angles mesurés en degrés'),
  F_stmt('radians', 'Angles mesurés en radians'),
  F_stmt('setposition', 'Déplace la tortue à l\'endroit spécifié sans changer d\'orientation. Trace un segment si le stylo est baissé.'),
  F_stmt('setx', 'Déplace la tortue à l\'endroit spécifié sans changer d\'ordonnée ni d\'orientation. Trace un segment horizontal si le stylo est baissé.'),
  F_stmt('sety', 'Déplace la tortue à l\'endroit spécifié sans changer d\'abscisse ni d\'orientation. Trace un segment vertical si le stylo est baissé.'),
  F_stmt('setheading', 'Oriente la tortue dans la direction donnée par l\'angle selon le repère choisi (mode standard et trigonométrique ou mode logo et géographique).'),
  F_stmt('home', 'Déplace la tortue à l\'origine. Trace un segment si le stylo est baissé.'),
  F_stmt('circle', 'Trace un cercle, un arc de cercle, un polygone régulier ou seulement une partie.'),
  F_stmt('dot', 'Dessine un point de taille et de couleur donnée.'),
  F_stmt('stamp', 'Reproduit l\'image de la tortue.'),
  {
    type: eYo.T3.Stmt.assignment_stmt,
    slots: {
      assigned: {
        slots: {
          O: {
            type: eYo.T3.Expr.turtle__call_expr,
            data: 'stamp',
          },
        },
      },
    },
  },
  F_stmt('clearstamp', 'Supprime la reproduction de l\'image de la tortue.'),
  F_stmt('clearstamps', 'Supprime toutes les reproduction d\'image de tortues.')
]
/* <s eyo="assignment" xmlns="urn:edython:1.0" xmlns:eyo="urn:edython:1.0">
<x eyo="list" slot="assigned"><x eyo="turtle__call_expr" name="stamp" ary="0" slot="O"></x>
</x>
</s> */
goog.mixin(eYo.Tooltip.Title, {
  turtle__import_stmt: 'Importer le module turtle',
  turtle__setup_stmt: 'Réglages du module turtle propres à edython',
})

eYo.DelegateSvg.Turtle.T3s = [
  eYo.T3.Stmt.turtle__import_stmt,
  eYo.T3.Stmt.turtle__setup_stmt,
  eYo.T3.Expr.turtle__call_expr,
  eYo.T3.Stmt.turtle__call_stmt
]
