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

goog.provide('edY.Msg')

goog.require('edY')

/** @export */ edY.Msg.RENAME = 'Renommer'

/** @export */ edY.Msg.IDENTIFIER_RENAME_TITLE = "Renommer la '%1' en :"

/** @export */ edY.Msg.CONNECT_MAIN_BLOCK_DLG_TITLE = 'Connecter ce bloc principal'
/** @export */ edY.Msg.CONNECT_MAIN_BLOCK_DLG_CONTENT = "Glisser des blocs d'instructions et les connecter sous ce bloc principal."
/** @export */ edY.Msg.CONNECT_MAIN_BLOCK_DLG_TOOLTIP = 'Exécuter les instructions suivant ce bloc en appuyant sur le bouton.'

/** @export */ edY.Msg.USE_PROPER_SLICING_STRIDE = 'pas personnalisé'
/** @export */ edY.Msg.UNUSE_PROPER_SLICING_STRIDE = 'pas de 1'

/** @export */ edY.Msg.ADD = 'Ajouter'
/** @export */ edY.Msg.ADD_BEFORE = 'Ajouter avant'
/** @export */ edY.Msg.ADD_AFTER = 'Ajouter après'
/** @export */ edY.Msg.REMOVE = 'Enlever'

/** @export */ edY.Msg.FILL_DEEP_HOLES = "Compléter"

/** @export */ edY.Msg.AT_THE_LEFT = 'à gauche'
/** @export */ edY.Msg.AT_THE_RIGHT = 'à droite'

/** @export */ edY.Msg.AROUND = 'autour'

/** @export */ edY.Msg.BEFORE = 'avant'
/** @export */ edY.Msg.AFTER = 'après'

/** @export */ edY.Msg.AND = 'et'

/** @export */ edY.Msg.RENAME_VARIABLE = 'Renommer'
/** @export */ edY.Msg.REPLACE_VARIABLE = 'Remplacer par'
/** @export */ edY.Msg.NEW_VARIABLE = 'Nouvelle variable'
/** @export */ edY.Msg.DELETE_UNUSED_VARIABLES = 'Nettoyer'

/** @export */ edY.Msg.RENAME_VARIABLE_TITLE = "Renommer la variable '%1' en :"

goog.provide('edY.Msg.Placeholder')

/** @export */ edY.Msg.Placeholder.STRING = "Du texte ici"

/** @export */ edY.Msg.Placeholder.BYTES = "Des octets ici"

/** @export */ edY.Msg.Placeholder.COMMENT = "Un commentaire ici"

/** @export */ edY.Msg.Placeholder.NUMBER = "0"

/** @export */ edY.Msg.Placeholder.CODE = "Une instruction ici"

/** @export */ edY.Msg.Placeholder.IDENTIFIER = "nom"

/** @export */ edY.Msg.Placeholder.ATTRIBUTE = "attribut"

/** @export */ edY.Msg.Placeholder.EXPRESSION = "expression"

/** @export */ edY.Msg.Placeholder.TERM = "nom"

/** @export */ edY.Msg.Placeholder.ALIAS = "alias"

/** @export */ edY.Msg.Placeholder.MODULE = "module"

/** @export */ edY.Msg.Placeholder.BASE = "base"

/** @export */ edY.Msg.Placeholder.DECORATOR = "decorateur"

/** @export */ edY.Msg.Placeholder.ADD_COMMENT = "Ajouter un commentaire"

/** @export */ edY.Msg.Placeholder.REMOVE_COMMENT = "Supprimer le commentaire"

/** @export */ edY.Msg.USE_SINGLE_QUOTE = "'...'"

/** @export */ edY.Msg.USE_DOUBLE_QUOTES = '"..."'

/** @export */ edY.Msg.MISSING_KEY = 'Missing key'
/** @export */ edY.Msg.MISSING_VALUE = 'Missing value'
/** @export */ edY.Msg.MISSING_EXPRESSION = 'Missing expression'
/** @export */ edY.Msg.MISSING_ARGUMENT = 'Missing argument'
/** @export */ edY.Msg.MISSING_LHS = 'Missing LHS'
/** @export */ edY.Msg.MISSING_RHS = 'Missing RHS'
/** @export */ edY.Msg.LOCK_BLOCK = 'Verrouiller'
/** @export */ edY.Msg.UNLOCK_BLOCK = 'Modifier'
