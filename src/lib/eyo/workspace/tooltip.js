/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Tooltip management.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('eYo.Tooltip');

goog.require('eYo.DelegateSvg')

/**
 * Add a tooltip programatically to an element
 * Do nothing function, meant to be overriden.
 * @param {!Element} el Dom reference element target of the tooltip.
 * @param {!String} title tooltip string content.
 */
eYo.Tooltip.add = function (el, title, options) {
  if (goog.isString(title)) {
    el.setAttribute('title', title)
    tippy(el, options)
  } else if (goog.isDef(title)) {
    tippy(el, title)
  }
}

/**
 * Shared options for tippy.
 */
eYo.Tooltip.options = {
  theme: 'light bordered',
  flipDuration: 0,
  inertia: true,
  arrow: true,
  animation: 'perspective',
  duration: [600, 300],
  delay: [750, 0],
  popperOptions: {
    modifiers: {
      preventOverflow: {
        enabled: true
      }
    }
  }
}

/**
 * Add a tooltip programatically to an element
 * Do nothing function, meant to be overriden.
 * @param {!Element} el Dom reference element target of the tooltip.
 * @param {!String} title tooltip string content.
 */
eYo.Tooltip.getTitle = function (key) {
  return eYo.Tooltip.Title[key] || key
}

/**
 * Hide all tooltip in a given element
 * @param {!Element} el The element containing the objects of which
 we want to hide the tooltip.
 */
eYo.Tooltip.hideAll = function (el) {
  // hide tips
  var tips = Array.from(el.querySelectorAll('[data-tippy]'), el => el._tippy)
  var i = 0
  var tip
  while ((tip = tips[i++])) {
    tip.state.visible && tip.hide()
  }
}

/**
 * Add tooltip to a block
 * @param {!Blockly.Block} block Block target of the tooltip.
 */
eYo.DelegateSvg.prototype.addTooltip = function (block) {
  var model = this.constructor.eyo.getModel()
  var title = eYo.Tooltip.getTitle(model.tooltip || this.tooltipKey || block.type.substring(4))
  var options = eYo.Tooltip.options
  goog.mixin(options, {
    onShow(instance) {
      eYo.Tooltip.hideAll(block.svgGroup_.parentNode)
    }
  })
  if (title) {
    eYo.Tooltip.add(block.svgGroup_, title, options)
  }
}

eYo.Tooltip.Title = {
  flyout: 'Glisser des blocs vers l\'espace de travail et les connecter à d\'autres blocs',
  start_stmt: 'Bloc de contrôle, indique le point de départ d\'un programme',
  shortliteral: 'Texte court',
  numberliteral: 'Nombre entier, flottant ou complexe',
  assignment_stmt: 'Instruction d\'assignement',
  term: 'variable et argument',
  u_expr: 'Opération unaire : +, -, ~',
  m_expr: 'Opération multiplicative : *, /, //, %, @',
  a_expr: 'Opération additive : +, -',
  power: 'Puissance',
  any_stmt: 'Instruction, commentaire, les deux',
  parenth_form: 'Objet entre parenthèses',
  list_display: 'Liste',
  set_display: 'Ensemble, pour un ensemble vide utiliser la fonction `set()`',
  dict_display: 'Dictionaire',
  augmented_assignment_stmt: 'Assignation relative, +=, -=, *=, ...',
  import_stmt: 'Instruction pour importer un module',
  docstring_top_stmt: 'docstring de module',
  longliteral: 'Texte, chaîne de caractères',
  attributeref: 'Attribut d\'un objet',
  proper_slice: 'Extrait (slicing), pour extraire les éléments d\'une liste',
  slicing: 'Élements extraits d\'une liste',
  any: 'Instruction à saisir',
  expression_stmt: 'Instruction à partir d\'un bloc expression',
  shift_expr: 'Opération sur les nombres binaires',
  and_expr: 'Opération sur les nombres binaires',
  xor_expr: 'Opération sur les nombres binaires',
  or_expr: 'Opération sur les nombres binaires',
  starred_expression: 'Expression *',
  del_stmt: 'Supprimer une variable, un element',
  parenth_target_list: 'Liste d\'objets assignables entre parenthèses',
  bracket_target_list: 'Liste d\'objets assignables entre crochets',
  builtin_print_expr: 'Expression print (afficher), pour afficher du texte ou des variables sur la console, gestion des séparateurs de champ et des fins de ligne',
  builtin_print_stmt: 'Expression print (afficher),\npour afficher du texte ou des variables sur la console,\ngestion des séparateurs de champ et des fins de ligne',
  comprehension: 'Compréhension',
  comp_for: 'Compréhension: clause for',
  comp_if: 'Compréhension: clause if',
  dict_comprehension: 'Dictionnaire: définition en compréhension',
  key_datum: 'Dictionnaire: association \'clé: valeur\'',
  with_part: 'Clause with (avec)',
  try_part: 'Clause try (essai), exécute les instructions tant qu\'aucune exception est levée (par raise ou assert)',
  except_part: 'Clause except, suit une clause try ou une autre clause except, instructions à exécuter quand une exception est levée',
  finally_part: 'Clause finally, suit une clause try ou une clause except, instructions toujours exécutées, ceci après le traitement de la clause try et des clauses except',
  assert_stmt: 'Lève une exception si une assertion n\'est pas avérée',
  raise_stmt: 'Lève une exception, pour signaler une situation exceptionnelle',
  yield_expression: 'Expression yield, pour les itérateurs',
  yield_stmt: 'Instruction yield, pour les itérateurs',
  if_part: 'Clause if (si), exécute les instructions de la clause si la condition est réalisé, ignoré sinon',
  elif_part: 'Clause elif (sinon si), suit une clause if ou une autre clause elif, exécute les instructions de la clause si la condition est réalisé et si les clauses précédentes n\'ont pas été exécutées, ignoré sinon',
  else_part: 'Clause else (sinon), suit une clause if ou une clause elif, exécute les instructions de la clause si les clauses précédentes n\'ont pas été exécutées, ignoré sinon',
  conditional_expression: 'Expression conditionnelle',
  builtin_object: 'True (vrai), False (faux), None (rien), Ellipsis, ..., NotImplemented',
  not_test: 'Négation',
  number_comparison: 'Test de comparaison entre nombres',
  object_comparison: 'Test d\'égalité entre objets, d\'appartenance à une collection',
  or_test: 'Test logique or (ou): condition1 ou condition2, vrai si l\'une des conditions est vraie, faux si les deux ne le sont pas',
  and_test: 'Test logique and (et): condition1 et condition2, vrai si les deux conditions sont vraies, faux si l\'une ne l\'est pas',
  while_part: 'Boucle tant que, tant que la condition n\'est pas remplie, exécute les instructions de la boucle',
  builtin_range_expr: 'Étendue, liste finie de nombres régulièrement répartis (suite arithmétique finie)',
  for_part: 'Boucle pour itérer des instructions pour chaque élément d\'un objet (liste, ensemble, tuple, étendue...)',
  else_part: 'Clause sinon, après une ou plusieurs clauses qui contiennent un test (if, elif, while, for), est exécutée si aucune clause de test ne l\'est',
  break_stmt: 'Dans une boucle, passe directement à l\'instruction qui suit la boucle',
  continue_stmt: 'Dans une boucle, passe directement à l\'itération suivante',
  call_expr: 'Expression pour exécuter une fonction ou une méthode avec ses arguments éventuels (list, set, len, sum...)',
  call_stmt: 'Instruction pour exécuter une fonction ou une méthode avec ses arguments éventuels (list, set, len, sum...)',
  funcdef_part: 'Définition d\'une fonction ou d\'une méthode',
  return_stmt: 'Dans une fonction, termine le traitement des instructions et renvoie éventuellement une valeur à l\'appelant',
  pass_stmt: 'Instruction vide, en attendant les bonnes instructions',
  lambda: 'Expression lambda, fonction courte et anonyme',
  classdef_part: 'Définition d\'une classe',
  decorator: 'Décorateur : filtre pour modifier automagiquement la définition d\'une fonction ou d\'une classe',
  global_nonlocal_stmt: 'Variable : global ou nonlocal',
  docstring_def_stmt: 'docstring',
}
