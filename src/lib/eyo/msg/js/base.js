/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Workspace override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Msg')

goog.require('eYo')

/** @export */ eYo.Msg.RENAME = 'Renommer'

/** @export */ eYo.Msg.IDENTIFIER_RENAME_TITLE = "Renommer la '%1' en :"

/** @export */ eYo.Msg.CONNECT_MAIN_BLOCK_DLG_TITLE = 'Connecter ce bloc principal'
/** @export */ eYo.Msg.CONNECT_MAIN_BLOCK_DLG_CONTENT = "Glisser des blocs d'instructions et les connecter sous ce bloc principal."
/** @export */ eYo.Msg.CONNECT_MAIN_BLOCK_DLG_TOOLTIP = 'Exécuter les instructions suivant ce bloc en appuyant sur le bouton.'

/** @export */ eYo.Msg.USE_PROPER_SLICING_STRIDE = 'pas personnalisé'
/** @export */ eYo.Msg.UNUSE_PROPER_SLICING_STRIDE = 'pas de 1'

/** @export */ eYo.Msg.ADD = 'Ajouter'
/** @export */ eYo.Msg.ADD_BEFORE = 'Ajouter avant'
/** @export */ eYo.Msg.ADD_AFTER = 'Ajouter après'
/** @export */ eYo.Msg.REMOVE = 'Enlever'

/** @export */ eYo.Msg.FILL_DEEP_HOLES = "Compléter"

/** @export */ eYo.Msg.AT_THE_LEFT = 'à gauche'
/** @export */ eYo.Msg.AT_THE_RIGHT = 'à droite'

/** @export */ eYo.Msg.AROUND = 'autour'

/** @export */ eYo.Msg.BEFORE = 'avant'
/** @export */ eYo.Msg.AFTER = 'après'

/** @export */ eYo.Msg.AND = 'et'

/** @export */ eYo.Msg.RENAME_VARIABLE = 'Renommer'
/** @export */ eYo.Msg.REPLACE_VARIABLE = 'Remplacer par'
/** @export */ eYo.Msg.NEW_VARIABLE = 'Nouvelle variable'
/** @export */ eYo.Msg.DELETE_UNUSED_VARIABLES = 'Nettoyer'

/** @export */ eYo.Msg.RENAME_VARIABLE_TITLE = "Renommer la variable '%1' en :"

goog.provide('eYo.Msg.Placeholder')

/** @export */ eYo.Msg.Placeholder.STRING = "Du texte ici"

/** @export */ eYo.Msg.Placeholder.BYTES = "Des octets ici"

/** @export */ eYo.Msg.Placeholder.COMMENT = "Un commentaire ici"

/** @export */ eYo.Msg.Placeholder.NUMBER = "0"

/** @export */ eYo.Msg.Placeholder.CODE = "Une instruction ici"

/** @export */ eYo.Msg.Placeholder.IDENTIFIER = "nom"

/** @export */ eYo.Msg.Placeholder.ATTRIBUTE = "attribut"

/** @export */ eYo.Msg.Placeholder.EXPRESSION = "expression"

/** @export */ eYo.Msg.Placeholder.TERM = "nom"

/** @export */ eYo.Msg.Placeholder.ALIAS = "alias"

/** @export */ eYo.Msg.Placeholder.MODULE = "module"

/** @export */ eYo.Msg.Placeholder.BASE = "base"

/** @export */ eYo.Msg.Placeholder.DECORATOR = "decorateur"

/** @export */ eYo.Msg.Placeholder.ADD_COMMENT = "Ajouter un commentaire"

/** @export */ eYo.Msg.Placeholder.REMOVE_COMMENT = "Supprimer le commentaire"

/** @export */ eYo.Msg.USE_SINGLE_QUOTE = "'...'"

/** @export */ eYo.Msg.USE_DOUBLE_QUOTES = '"..."'

/** @export */ eYo.Msg.MISSING_KEY = 'Missing key'
/** @export */ eYo.Msg.MISSING_VALUE = 'Missing value'
/** @export */ eYo.Msg.MISSING_EXPRESSION = 'Missing expression'
/** @export */ eYo.Msg.MISSING_ARGUMENT = 'Missing argument'
/** @export */ eYo.Msg.MISSING_LHS = 'Missing LHS'
/** @export */ eYo.Msg.MISSING_RHS = 'Missing RHS'
/** @export */ eYo.Msg.LOCK_BLOCK = 'Verrouiller'
/** @export */ eYo.Msg.UNLOCK_BLOCK = 'Modifier'
