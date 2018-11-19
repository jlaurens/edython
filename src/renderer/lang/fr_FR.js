var reserved = function (value) {
  return '<span class="eyo-code-reserved">' + value + '</span>'
}

var placeholder = function (value) {
  return '<span class="eyo-code-placeholder">' + value + '</span>'
}

var comment = function (value) {
  return '<span class="eyo-code-comment">' + value + '</span>'
}

var nom = placeholder('nom')

export default {
  YES: 'Oui',
  NO: 'Non',
  hello: 'Bonjour monde',
  name_value: nom + ' = …',
  name_annotation_value: nom + ': … = …',
  target_value: '…, … = …, …',
  name: nom,
  raw_name: 'nom',
  name_definition: nom + '=…',
  name_alias: nom + ' ' + reserved('as') + ' ' + placeholder('alias'),
  star: reserved('*'),
  star_name: reserved('*') + nom,
  star_star_name: reserved('**') + nom,
  name_annotation: nom + ':…',
  star_name_annotation: reserved('*') + nom + ':...',
  name_annotation_definition: nom + ':…=…',
  code: 'code',
  code_comment: 'code # commentaire',
  expression: '…',
  expression_comment: '… ' + comment('# commentaire'),
  comment: comment('# commentaire'),
  name_expressions: nom + ' {operator} …',
  target_expressions: '… {operator} …',
  import: reserved('import') + ' ' + '{{slotholder}}',
  global: reserved('global') + ' {{slotholder}}',
  nonlocal: reserved('nonlocal') + ' {{slotholder}}',
  from_module_import: reserved('from') + ' ' + placeholder('module') + ' ' + reserved('import') + '{{slotholder}}',
  from_module_import_star: reserved('from') + ' ' + placeholder('module') + ' ' + reserved('import *'),
  expr: '…',
  parent_dot_name: placeholder('parent') + '.' + nom,
  parent_dot_expr: placeholder('parent') + '.…',
  block_dot_name: '….' + nom,
  block_dot_expr: '….…',
  two_stars: reserved('**'),
  dot: reserved('.'),
  two_dots: reserved('..'),
  none: '&nbsp;',
  module: placeholder('module'),
  parent: placeholder('parent'),
  root: '…',
  colon_annotation: ':…',
  equals_definition: '=…',
  as_alias: reserved('as') + ' …',
  call_expr: '(…)',
  slicing: '[…]',
  prefix_r_for_raw: 'préfixe r pour raw (ie brut)',
  prefix_f_for_format: 'préfixe f pour format',
  prefix_b_for_byte: 'préfixe b pour bytes (ie octets)',
  bytes: 'octets',
  use_single_quotes_in_long_literal: 'Utiliser des guillemets droits simples',
  use_double_quotes_in_long_literal: 'Utiliser des guillemets droits doubles',
  enter_any_valid_expression: 'Saisir une expression valide',
  one_line_of_text: 'Saisir du texte (une ligne)',
  should_save_title: 'Sauvegarder d\'abord ?',
  should_save_content: 'Des changements sont en cours, ils seront définitivement perdus s\'ils ne sont pas sauvegardés.',
  main_mode_title: 'Choisir une interface adaptée',
  main_mode_tutorial: 'Tutoriel',
  main_mode_tutorial_title: 'Interface simple pour débuter',
  main_mode_normal: 'Normal',
  main_mode_normal_title: 'Interface pour une utilisation normale',
  main_mode_teacher: 'Professeur',
  main_mode_teacher_title: 'Interface étendue à l\'usage des professeurs',
  hide_workspace: 'Cacher l\'espace des blocs',
  show_workspace: 'Montrer l\'espace des blocs',
  hide_console_panel: 'Cacher le panneau de console',
  show_console_panel: 'Montrer le panneau de console',
  send_selection_to_back: 'Sélection à l\'arrière plan',
  show_selection: 'Montrer la sélection',
  decorator_input: 'Nom du décorateur',
  except_expression: 'Un ou plusieurs objets exception',
  except_alias: 'Un nom de variable'
}
