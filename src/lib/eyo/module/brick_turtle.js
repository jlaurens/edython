/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Turtle module bricks for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Brick.Turtle')

goog.require('eYo.Model.turtle__module')

goog.require('eYo.Brick.Stmt')

goog.require('eYo.Brick.List')
goog.require('eYo.Brick.Primary')

goog.require('eYo.Msg')
goog.require('eYo.Tooltip')
goog.require('eYo.FlyoutCategory')

eYo.T3.Stmt.turtle__setup_stmt = 'eyo:turtle__setup_stmt'

/**
 * Class for a Delegate, turtle setup statement brick.
 * Not normally called directly, eYo.Brick.create(...) is preferred.
 * For edython.
 */
eYo.Brick.Stmt.makeSubclass('turtle__setup_stmt', {
  fields: {
    label: 'edython.turtleSetup()'
  }
}, true)

var doit = (() => {
  var F_expr = (name, title) => {
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
  var F_stmt = (name, title) => {
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
      variant_p: eYo.Key.FROM_MODULE_IMPORT_STAR,
      from_p: 'turtle'
    },
    eYo.T3.Stmt.turtle__setup_stmt,
    F_stmt('done', 'Terminer'),
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
    // F_stmt('colormode', 'Changer le mode de couleur.'),
    F_expr('pensize', 'Obtenir l\'épaisseur du trait.'),
    F_expr('pencolor', 'Obtenir la couleur du trait.'),
    F_expr('fillcolor', 'Obtenir la couleur de remplissage.'),
    // F_expr('colormode', 'Obtenir le mode de couleur.'),
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
    F_expr('heading', 'Obtenir la direction de la tortue.'),
    F_expr('distance', 'Obtenir la distance au point de coordonnées (x, y).'),
    F_stmt('setx', 'Déplace la tortue à l\'endroit spécifié sans changer d\'ordonnée ni d\'orientation. Trace un segment horizontal si le stylo est baissé.'),
    F_stmt('sety', 'Déplace la tortue à l\'endroit spécifié sans changer d\'abscisse ni d\'orientation. Trace un segment vertical si le stylo est baissé.'),
    F_stmt('setposition', 'Déplace la tortue à l\'endroit spécifié sans changer d\'orientation. Trace un segment si le stylo est baissé.'),
    F_stmt('home', 'Déplace la tortue à l\'origine. Trace un segment si le stylo est baissé.'),
    F_stmt('degrees', 'Angles mesurés en degrés'),
    F_stmt('radians', 'Angles mesurés en radians'),
    F_stmt('setheading', 'Oriente la tortue dans la direction donnée par l\'angle selon le repère choisi (mode standard et trigonométrique ou mode logo et géographique).')
  ]

  var F_expr = (name, title) => {
    var key = 'turtle__'+name
    title && (eYo.Tooltip.Title[key] = title)
    return {
      type: eYo.T3.Expr.call_expr,
      name_p: name,
      holder_placeholder: 'T',
      dotted_p: 1,
      title: key
    }
  }
  var F_stmt = (name, title) => {
    var key = 'turtle__'+name
    title && (eYo.Tooltip.Title[key] = title)
    return {
      type: eYo.T3.Stmt.call_stmt,
      name_p: name,
      holder_placeholder: 'T',
      dotted_p: 1,
      title: key
    }
  }
  eYo.FlyoutCategory.turtle__module = [
    {
      type: eYo.T3.Stmt.import_stmt,
      variant_p: eYo.Key.IMPORT,
      import_module_s: {
        slots: {
          O: {
            type: eYo.T3.Expr.identifier_as,
            name_p: 'turtle',
            alias_placeholder: 'T'
          }
        }
      }
    },
    eYo.T3.Stmt.turtle__setup_stmt,
    {
      type: eYo.T3.Stmt.assignment_stmt,
      value_s: {
        slots: {
          O: {
            type: eYo.T3.Expr.call_expr,
            name_p: 'Turtle',
            holder_p: 'turtle',
            dotted_p: 1
          },
        },
      },
    },
    {
      type: eYo.T3.Stmt.call_stmt,
      name_p: 'done',
      holder_p: 'turtle',
      dotted_p: 1,
      title: 'Terminer'
    },
    F_stmt('forward', 'Avancer de la distance donnée'),
    F_stmt('back', 'Reculer de la distance donnée'),
    F_stmt('right', 'Tourner à droite d\'un angle de mesure donnée (en degrés par défaut)'),
    F_stmt('left', 'Tourner à gauche d\'un angle de mesure donnée (en degrés par défaut)'),
    F_stmt('speed', 'Régler la vitesse du tracé'),
    F_stmt('degrees', 'Angles mesurés en degrés'),
    F_stmt('radians', 'Angles mesurés en radians'),
    F_stmt('pendown', 'Abaisser le crayon'),
    F_expr('isdown', 'Le crayon est baissé ?'),// beware: NO BREAK SPACE before '?'
    F_stmt('penup', 'Lever le crayon'),
    F_expr('xcor', 'Obtenir l\'abscisse de la tortue.'),
    F_expr('ycor', 'Obtenir l\'ordonnée de la tortue.'),
    F_expr('position', 'Obtenir les coordonnées (x, y) de la tortue.'),
    F_expr('distance', 'Obtenir la distance au point de coordonnées (x, y).'),
    F_stmt('setx', 'Déplace la tortue à l\'endroit spécifié sans changer d\'ordonnée ni d\'orientation. Trace un segment horizontal si le stylo est baissé.'),
    F_stmt('sety', 'Déplace la tortue à l\'endroit spécifié sans changer d\'abscisse ni d\'orientation. Trace un segment vertical si le stylo est baissé.'),
    F_stmt('setposition', 'Déplace la tortue à l\'endroit spécifié sans changer d\'orientation. Trace un segment si le stylo est baissé.'),
    F_stmt('setheading', 'Oriente la tortue dans la direction donnée par l\'angle selon le repère choisi (mode standard et trigonométrique ou mode logo et géographique).'),
    F_expr('towards', 'Obtenir l\'angle vers le point de coordonnées (x, y) ou la position.'),
    F_stmt('pensize', 'Changer l\'épaisseur du trait.'),
    F_stmt('pencolor', 'Changer la couleur du trait.'),
    F_stmt('fillcolor', 'Changer la couleur de remplissage.'),
    // F_stmt('colormode', 'Obtenir le mode de couleur.'),
    F_expr('pensize', 'Obtenir l\'épaisseur du trait.'),
    F_expr('pencolor', 'Obtenir la couleur du trait.'),
    F_expr('fillcolor', 'Obtenir la couleur de remplissage.'),
    // F_expr('colormode', 'Obtenir le mode de couleur.'),
    F_stmt('begin_fill', 'Commencer une opération de remplissage.'),
    F_stmt('end_fill', 'Terminer une opération de remplissage.'),
    F_stmt('filling', 'En opération de remplissage ?'),// beware: NO BREAK SPACE before '?'
    F_stmt('home', 'Déplace la tortue à l\'origine. Trace un segment si le stylo est baissé.'),
    F_stmt('circle', 'Trace un cercle, un arc de cercle, un polygone régulier ou seulement une partie.'),
    F_stmt('dot', 'Dessine un point de taille et de couleur donnée.'),
    F_stmt('stamp', 'Reproduit l\'image de la tortue.'),
    {
      type: eYo.T3.Stmt.assignment_stmt,
      value_s: {
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
    F_stmt('clearstamp', 'Supprime la reproduction de l\'image de la tortue.'),
    F_stmt('clearstamps', 'Supprime toutes les reproduction d\'image de tortues.')
  ]
})

/* <s eyo="assignment" xmlns="urn:edython:0.2" xmlns:eyo="urn:edython:0.2">
<x eyo="list" slot="assigned"><x eyo="turtle__call_expr" name="stamp" ary="0" slot="O"></x>
</x>
</s> */
goog.mixin(eYo.Tooltip.Title, {
  turtle__import_stmt: 'Importer le module turtle',
  turtle__setup_stmt: 'Réglages du module turtle propres à edython',
})

eYo.Brick.Turtle.T3s = [
  eYo.T3.Stmt.turtle__setup_stmt
]
