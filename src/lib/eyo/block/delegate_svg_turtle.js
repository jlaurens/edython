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

goog.require('eYo.Msg')
goog.require('eYo.Tooltip')
goog.require('eYo.FlyoutCategory')

// /**
//  * Class for a DelegateSvg, import turtle block.
//  * A unique block for each module to ease forthcoming management.
//  * For edython.
//  */
// eYo.DelegateSvg.Stmt.makeSubclass('turtle__config_stmt', {
//   xml: {
//     tag: 'turtle__config',
//   },
//   data: {
//     key: {
//       all: [
//         'turtle_canvas_wrapper',
//         'canvwidth',
//         'canvheight'
//       ],
//       synchronize: true
//     },
//     value: {
//       synchronize: true
//     }
//   },
//   fields: {
//     module: {
//       order: 1,
//       value: 'turtle',
//     },
//     separator: {
//       order: 3,
//       value: '.',
//     },
//     start: {
//       order: 4,
//       value: 'setConfig',
//     }
//   },
//   slots: {
//     key: {
//       order: 1,
//       fields: {
//         prefix: {
//           value: '('
//         },
//         edit: {
//           placeholder: eYo.Msg.Placeholder.ARGUMENT,
//           endEditing: true,
//           variable: true
//         },    
//       }
//     },
//     value: {
//       order: 3,
//       fields: {
//         prefix: '=',
//         suffix: ')'
//       },
//       check: eYo.T3.Expr.Check.expression,
//       hole_value: eYo.Msg.Placeholder.VALUE
//     }
//   }
// })

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

var F_expr = function (name, title) {
  var key = 'turtle__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Expr.call_expr,
    data: {
      name: name,
      holder: 'turtle',
      dotted: 0
    },
    title: key
  }
}
var F_stmt = function (name, title) {
  var key = 'turtle__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Stmt.call_stmt,
    data: {
      name: name,
      holder: 'turtle',
      dotted: 0
    },
    title: key
  }
}
eYo.FlyoutCategory.basic_turtle__module = [
  {
    type: eYo.T3.Stmt.import_stmt,
    data: {
      variant: eYo.Key.FROM_MODULE_IMPORT_STAR,
      from: 'turtle'
    }
  },
  eYo.T3.Stmt.turtle__setup_stmt,
  F_stmt('done', 'Avancer de la distance donnée'),
  F_stmt('forward', 'Avancer de la distance donnée'),
  F_stmt('backward', 'Reculer de la distance donnée'),
  F_stmt('right', 'Tourner à droite d\'un angle de mesure donnée (en degrés par défaut)'),
  F_stmt('left', 'Tourner à gauche d\'un angle de mesure donnée (en degrés par défaut)'),
  F_stmt('speed', 'Régler la vitesse du tracé'),
  F_stmt('pendown', 'Abaisser le crayon'),
  F_expr('isdown', 'Le crayon est baissé ?'),// beware: NO BREAK SPACE before '?'
  F_stmt('penup', 'Lever le crayon'),
  F_stmt('pensize', 'Changer l\'épaisseur du trait.'),
  F_stmt('pencolor', 'Changer la couleur du trait.'),
  F_stmt('fillcolor', 'Changer la couleur de remplissage.'),
  F_expr('pensize', 'Obtenir l\'épaisseur du trait.'),
  F_expr('pencolor', 'Obtenir la couleur du trait.'),
  F_expr('fillcolor', 'Obtenir la couleur de remplissage.'),
  F_stmt('begin_fill', 'Commencer une opération de remplissage.'),
  F_stmt('end_fill', 'Terminer une opération de remplissage.'),
  F_stmt('filling', 'En opération de remplissage ?'),// beware: NO BREAK SPACE before '?'
  
  F_stmt('circle', 'Trace un cercle, un arc de cercle, un polygone régulier ou seulement une partie.'),
  F_stmt('dot', 'Dessine un point de taille et de couleur donnée.'),
  F_stmt('shape', 'Choisir la forme parmi "arrow", "turtle, "circle", "square", "triangle" et "classic".'),
  F_stmt('stamp', 'Tamponne l\'image de la tortue.'),
  F_expr('xcor', 'Obtenir l\'abscisse de la tortue.'),
  F_expr('ycor', 'Obtenir l\'ordonnée de la tortue.'),
  F_expr('position', 'Obtenir les coordonnées (x, y) de la tortue.'),
  F_expr('distance', 'Obtenir la distance au point de coordonnées (x, y).'),
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
    type: eYo.T3.Expr.call_expr,
    data: {
      name: name,
      holder: 'turtle',
      dotted: 1
    },
    title: key
  }
}
var F_stmt = function (name, title) {
  var key = 'turtle__'+name
  title && (eYo.Tooltip.Title[key] = title)
  return {
    type: eYo.T3.Stmt.call_stmt,
    data: {
      name: name,
      holder: 'turtle',
      dotted: 1
    },
    title: key
  }
}
eYo.FlyoutCategory.turtle__module = [
  {
    type: eYo.T3.Stmt.import_stmt,
    data: {
      variant: eYo.Key.IMPORT
    },
    slots: {
      import_module: {
        slots: {
          O: {
            type: eYo.T3.Expr.identifier,
            data: 'turtle'
          }
        }
      }
    }
  },
  eYo.T3.Stmt.turtle__setup_stmt,
  {
    type: eYo.T3.Stmt.assignment_stmt,
    slots: {
      assigned: {
        slots: {
          O: {
            type: eYo.T3.Expr.call_expr,
            data: {
              holder: 'turtle',
              name: 'Turtle',
              dotted: 1
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
  F_stmt('speed', 'Régler la vitesse du tracé'),
  F_stmt('degrees', 'Angles mesurés en degrés'),
  F_stmt('radians', 'Angles mesurés en radians'),
  F_expr('xcor', 'Obtenir l\'abscisse de la tortue.'),
  F_expr('ycor', 'Obtenir l\'ordonnée de la tortue.'),
  F_expr('position', 'Obtenir les coordonnées (x, y) de la tortue.'),
  F_expr('distance', 'Obtenir la distance au point de coordonnées (x, y).'),
  F_stmt('setx', 'Déplace la tortue à l\'endroit spécifié sans changer d\'ordonnée ni d\'orientation. Trace un segment horizontal si le stylo est baissé.'),
  F_stmt('sety', 'Déplace la tortue à l\'endroit spécifié sans changer d\'abscisse ni d\'orientation. Trace un segment vertical si le stylo est baissé.'),
  F_stmt('setposition', 'Déplace la tortue à l\'endroit spécifié sans changer d\'orientation. Trace un segment si le stylo est baissé.'),
  F_stmt('setheading', 'Oriente la tortue dans la direction donnée par l\'angle selon le repère choisi (mode standard et trigonométrique ou mode logo et géographique).'),
  F_expr('pensize', 'Obtenir l\'épaisseur du trait.'),
  F_expr('pencolor', 'Obtenir la couleur du trait.'),
  F_expr('fillcolor', 'Obtenir la couleur de remplissage.'),
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
            type: eYo.T3.Expr.call_expr,
            data: {
              name: 'stamp',
              holder: 'turtle',
              dotted: 1
            }
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
  eYo.T3.Stmt.turtle__setup_stmt
]
