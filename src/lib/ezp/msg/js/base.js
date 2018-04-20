/**
 * ezPython
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

goog.provide('ezP.Msg')

goog.require('ezP')

/** @export */ ezP.Msg.RENAME = 'Renommer'

/** @export */ ezP.Msg.IDENTIFIER_RENAME_TITLE = "Renommer la '%1' en :"

/** @export */ ezP.Msg.CONNECT_MAIN_BLOCK_DLG_TITLE = 'Connecter ce bloc principal'
/** @export */ ezP.Msg.CONNECT_MAIN_BLOCK_DLG_CONTENT = "Glisser des blocs d'instructions et les connecter sous ce bloc principal."
/** @export */ ezP.Msg.CONNECT_MAIN_BLOCK_DLG_TOOLTIP = 'Exécuter les instructions suivant ce bloc en appuyant sur le bouton.'

/** @export */ ezP.Msg.USE_PROPER_SLICING_STRIDE = 'pas personnalisé'
/** @export */ ezP.Msg.UNUSE_PROPER_SLICING_STRIDE = 'pas de 1'

/** @export */ ezP.Msg.ADD = 'Ajouter'
/** @export */ ezP.Msg.ADD_BEFORE = 'Ajouter avant'
/** @export */ ezP.Msg.ADD_AFTER = 'Ajouter après'
/** @export */ ezP.Msg.REMOVE = 'Enlever'

/** @export */ ezP.Msg.FILL_DEEP_HOLES = "Compléter"

/** @export */ ezP.Msg.AT_THE_LEFT = 'à gauche'
/** @export */ ezP.Msg.AT_THE_RIGHT = 'à droite'

/** @export */ ezP.Msg.AROUND = 'autour'

/** @export */ ezP.Msg.BEFORE = 'avant'
/** @export */ ezP.Msg.AFTER = 'après'

/** @export */ ezP.Msg.AND = 'et'

/** @export */ ezP.Msg.RENAME_VARIABLE = 'Renommer'
/** @export */ ezP.Msg.REPLACE_VARIABLE = 'Remplacer par'
/** @export */ ezP.Msg.NEW_VARIABLE = 'Nouvelle variable'
/** @export */ ezP.Msg.DELETE_UNUSED_VARIABLES = 'Nettoyer'

/** @export */ ezP.Msg.RENAME_VARIABLE_TITLE = "Renommer la variable '%1' en :"

goog.provide('ezP.Msg.Placeholder')

/** @export */ ezP.Msg.Placeholder.STRING = "Du texte ici"

/** @export */ ezP.Msg.Placeholder.BYTES = "Des octets ici"

/** @export */ ezP.Msg.Placeholder.COMMENT = "Un commentaire ici"

/** @export */ ezP.Msg.Placeholder.NUMBER = "0"

/** @export */ ezP.Msg.Placeholder.CODE = "Une instruction ici"

/** @export */ ezP.Msg.Placeholder.IDENTIFIER = "nom"

/** @export */ ezP.Msg.Placeholder.TERM = "nom"

/** @export */ ezP.Msg.USE_SINGLE_QUOTE = "'...'"

/** @export */ ezP.Msg.USE_DOUBLE_QUOTES = '"..."'

/** @export */ ezP.Msg.MISSING_KEY = 'Missing key'
/** @export */ ezP.Msg.MISSING_VALUE = 'Missing value'
/** @export */ ezP.Msg.MISSING_EXPRESSION = 'Missing expression'
/** @export */ ezP.Msg.MISSING_ARGUMENT = 'Missing argument'
/** @export */ ezP.Msg.MISSING_LHS = 'Missing LHS'
/** @export */ ezP.Msg.MISSING_RHS = 'Missing RHS'
/** @export */ ezP.Msg.LOCK_BLOCK = 'Verrouiller'
/** @export */ ezP.Msg.UNLOCK_BLOCK = 'Modifier'
