/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Various messages to be localized, if relevant.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Msg')
goog.provide('eYo.MsgPack')

goog.require('eYo')

/** @export */ eYo.Msg.RENAME = 'Renommer'

/** @export */ eYo.Msg.IDENTIFIER_RENAME_TITLE = "Renommer la '%1' en :"

eYo.Msg.CONNECT_MAIN_BLOCK_DLG_TOOLTIP = 'Exécuter les instructions de ce bloc en appuyant sur le bouton.'

/** @export */ eYo.Msg.USE_PROPER_SLICING_STRIDE = 'pas personnalisé'
/** @export */ eYo.Msg.UNUSE_PROPER_SLICING_STRIDE = 'pas de 1'

/** @export */ eYo.Msg.ADD = 'Ajouter'
/** @export */ eYo.Msg.ADD_BEFORE = 'Ajouter avant'
/** @export */ eYo.Msg.ADD_AFTER = 'Ajouter après'
/** @export */ eYo.Msg.REMOVE = 'Enlever'

/** @export */ eYo.Msg.FILL_DEEP_HOLES = 'Compléter'

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

/** @export */ eYo.Msg.Placeholder.STRING = 'Du texte ici'

/** @export */ eYo.Msg.Placeholder.BYTES = 'Des octets ici'

/** @export */ eYo.Msg.Placeholder.COMMENT = 'Un commentaire ici'

/** @export */ eYo.Msg.Placeholder.NUMBER = '1'

/** @export */ eYo.Msg.Placeholder.CODE = 'Une instruction ici'

/** @export */ eYo.Msg.Placeholder.IDENTIFIER = 'nom'

/** @export */ eYo.Msg.Placeholder.UNSET = ' ' // no break space

/** @export */ eYo.Msg.Placeholder.ROOT = 'root'

/** @export */ eYo.Msg.Placeholder.PARENT = 'parent'

/** @export */ eYo.Msg.Placeholder.PRIMARY = 'primary'

/** @export */ eYo.Msg.Placeholder.ATTRIBUTE = 'attribut'

/** @export */ eYo.Msg.Placeholder.EXPRESSION = 'expression'

/** @export */ eYo.Msg.Placeholder.EXPR = 'expr'

/** @export */ eYo.Msg.Placeholder.CONDITION = 'condition'

/** @export */ eYo.Msg.Placeholder.TERM = 'nom'

/** @export */ eYo.Msg.Placeholder.ARGUMENT = 'argument'

/** @export */ eYo.Msg.Placeholder.KEY = 'clé'

/** @export */ eYo.Msg.Placeholder.VALUE = 'valeur'

/** @export */ eYo.Msg.Placeholder.ALIAS = 'alias'

/** @export */ eYo.Msg.Placeholder.MODULE = 'module'

/** @export */ eYo.Msg.Placeholder.BASE = 'base'

/** @export */ eYo.Msg.Placeholder.DECORATOR = 'decorateur'

/** @export */ eYo.Msg.Placeholder.ADD_COMMENT = 'Ajouter un commentaire'

/** @export */ eYo.Msg.Placeholder.REMOVE_COMMENT = 'Supprimer le commentaire'

/** @export */ eYo.Msg.USE_SINGLE_QUOTE = "'...'"

/** @export */ eYo.Msg.USE_DOUBLE_QUOTES = '"..."'

/** @export */ eYo.Msg.HELP = 'Aide'
/** @export */ eYo.Msg.UNDO = 'Annuler'
/** @export */ eYo.Msg.REDO = 'Refaire'
/** @export */ eYo.Msg.CLEAN_UP = 'Ranger'
/** @export */ eYo.Msg.DUPLICATE_BLOCK = 'Dupliquer'
/** @export */ eYo.Msg.DUPLICATE_X_BLOCKS = 'Dupliquer {0} blocs'
/** @export */ eYo.Msg.ADD_COMMENT = 'Ajouter un commentaire'
/** @export */ eYo.Msg.REMOVE_COMMENT = 'Supprimer le commentaire'
/** @export */ eYo.Msg.EXPAND_BLOCK = 'Déplier'
/** @export */ eYo.Msg.EXPAND_ALL = 'Tout déplier'
/** @export */ eYo.Msg.COLLAPSE_BLOCK = 'Replier'
/** @export */ eYo.Msg.COLLAPSE_ALL = 'Tout replier'
/** @export */ eYo.Msg.ENABLE_BLOCK = 'Activer'
/** @export */ eYo.Msg.DISABLE_BLOCK = 'Désactiver'
/** @export */ eYo.Msg.DELETE_BLOCK = 'Supprimer'
/** @export */ eYo.Msg.DELETE_X_BLOCKS = 'Supprimer {0} blocs'
/** @export */ eYo.Msg.DELETE_ALL_BLOCKS = 'Supprimer tout'
/** @export */ eYo.Msg.CHANGE_VALUE_TITLE = 'Changer la valeur'

/** @export */ eYo.Msg.MISSING_KEY = 'Missing key'
/** @export */ eYo.Msg.MISSING_VALUE = 'Missing value'
/** @export */ eYo.Msg.MISSING_EXPRESSION = 'Missing expression'
/** @export */ eYo.Msg.MISSING_ARGUMENT = 'Missing argument'
/** @export */ eYo.Msg.MISSING_LHS = 'Missing LHS'
/** @export */ eYo.Msg.MISSING_RHS = 'Missing RHS'
/** @export */ eYo.Msg.LOCK_BLOCK = 'Verrouiller'
/** @export */ eYo.Msg.UNLOCK_BLOCK = 'Modifier'

/** @export */ eYo.Msg.BASIC = 'Basique'
/** @export */ eYo.Msg.INTERMEDIATE = 'Intermédiaire'
/** @export */ eYo.Msg.ADVANCED = 'Avancé'
/** @export */ eYo.Msg.EXPERT = 'Expert'
/** @export */ eYo.Msg.MATH = 'Math'
/** @export */ eYo.Msg.TEXT = 'Texte'
/** @export */ eYo.Msg.LIST = 'Liste et assimilé'
/** @export */ eYo.Msg.BRANCHING = 'Branchement'
/** @export */ eYo.Msg.LOOPING = 'Boucle'
/** @export */ eYo.Msg.FUNCTION = 'Fonction et objet'

/**
 * Internationalization entry.
 * For edython.
 * @param {!String} key  key is the string to be localized
 * @param {?String} pack pack is the pack where the localization should be found
 * @return {!String}
 */
eYo.Msg.i18n = function(key, pack) {
  return pack && eYo.MsgPack[pack] && eYo.MsgPack[pack][key] || eYo.Msg[key] || key
}