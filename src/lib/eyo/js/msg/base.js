/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Various messages to be localized, if relevant.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.newNS('msgPack')

eYo.newNS('msg')

/** @export */ eYo.msg.RENAME = 'Renommer'

/** @export */ eYo.msg.IDENTIFIER_RENAME_TITLE = "Renommer la '%1' en :"

eYo.msg.CONNECT_MAIN_BLOCK_DLG_TOOLTIP = 'Exécuter les instructions de ce bloc en appuyant sur le bouton.'

/** @export */ eYo.msg.USE_PROPER_SLICING_STRIDE = 'pas personnalisé'
/** @export */ eYo.msg.UNUSE_PROPER_SLICING_STRIDE = 'pas de 1'

/** @export */ eYo.msg.ADD = 'Ajouter'
/** @export */ eYo.msg.ADD_BEFORE = 'Ajouter avant'
/** @export */ eYo.msg.ADD_AFTER = 'Ajouter après'
/** @export */ eYo.msg.REMOVE = 'Enlever'

/** @export */ eYo.msg.AT_THE_LEFT = 'à gauche'
/** @export */ eYo.msg.AT_THE_RIGHT = 'à droite'

/** @export */ eYo.msg.AROUND = 'autour'

/** @export */ eYo.msg.BEFORE = 'avant'
/** @export */ eYo.msg.AFTER = 'après'

/** @export */ eYo.msg.AND = 'et'

/** @export */ eYo.msg.RENAME_VARIABLE = 'Renommer'
/** @export */ eYo.msg.REPLACE_VARIABLE = 'Remplacer par'
/** @export */ eYo.msg.NEW_VARIABLE = 'Nouvelle variable'
/** @export */ eYo.msg.DELETE_UNUSED_VARIABLES = 'Nettoyer'

/** @export */ eYo.msg.RENAME_VARIABLE_TITLE = "Renommer la variable '%1' en :"

eYo.provide('msg.placeholder')

/** @export */ eYo.msg.placeholder.STRING = 'Du texte ici'

/** @export */ eYo.msg.placeholder.BYTES = 'Des octets ici'

/** @export */ eYo.msg.placeholder.COMMENT = 'Un commentaire ici'

/** @export */ eYo.msg.placeholder.NUMBER = '1'

/** @export */ eYo.msg.placeholder.CODE = 'Une instruction ici'

/** @export */ eYo.msg.placeholder.IDENTIFIER = 'nom'

/** @export */ eYo.msg.placeholder.UNSET = ' ' // no break space

/** @export */ eYo.msg.placeholder.ROOT = 'root'

/** @export */ eYo.msg.placeholder.PARENT = 'parent'

/** @export */ eYo.msg.placeholder.PRIMARY = 'primary'

/** @export */ eYo.msg.placeholder.ATTRIBUTE = 'attribut'

/** @export */ eYo.msg.placeholder.EXPRESSION = 'expression'

/** @export */ eYo.msg.placeholder.EXPR = 'expr'

/** @export */ eYo.msg.placeholder.CONDITION = 'condition'

/** @export */ eYo.msg.placeholder.TERM = 'nom'

/** @export */ eYo.msg.placeholder.ARGUMENT = 'argument'

/** @export */ eYo.msg.placeholder.KEY = 'clé'

/** @export */ eYo.msg.placeholder.VALUE = 'valeur'

/** @export */ eYo.msg.placeholder.ALIAS = 'alias'

/** @export */ eYo.msg.placeholder.MODULE = 'module'

/** @export */ eYo.msg.placeholder.BASE = 'base'

/** @export */ eYo.msg.placeholder.DECORATOR = 'decorateur'

/** @export */ eYo.msg.placeholder.ADD_COMMENT = 'Ajouter un commentaire'

/** @export */ eYo.msg.placeholder.REMOVE_COMMENT = 'Supprimer le commentaire'

/** @export */ eYo.msg.USE_SINGLE_QUOTE = "'...'"

/** @export */ eYo.msg.USE_DOUBLE_QUOTES = '"..."'

/** @export */ eYo.msg.HELP = 'Aide'
/** @export */ eYo.msg.UNDO = 'Annuler'
/** @export */ eYo.msg.REDO = 'Refaire'
/** @export */ eYo.msg.DUPLICATE_BLOCK = 'Dupliquer'
/** @export */ eYo.msg.DUPLICATE_X_BLOCKS = 'Dupliquer {0} blocs'
/** @export */ eYo.msg.ADD_COMMENT = 'Ajouter un commentaire'
/** @export */ eYo.msg.REMOVE_COMMENT = 'Supprimer le commentaire'
/** @export */ eYo.msg.EXPAND_BLOCK = 'Déplier'
/** @export */ eYo.msg.EXPAND_ALL = 'Tout déplier'
/** @export */ eYo.msg.COLLAPSE_BLOCK = 'Replier'
/** @export */ eYo.msg.COLLAPSE_ALL = 'Tout replier'
/** @export */ eYo.msg.ENABLE_BLOCK = 'Activer'
/** @export */ eYo.msg.DISABLE_BLOCK = 'Désactiver'
/** @export */ eYo.msg.DELETE_BLOCK = 'Supprimer'
/** @export */ eYo.msg.DELETE_X_BLOCKS = 'Supprimer {0} blocs'
/** @export */ eYo.msg.DELETE_ALL_BLOCKS = 'Supprimer tout'
/** @export */ eYo.msg.CHANGE_VALUE_TITLE = 'Changer la valeur'

/** @export */ eYo.msg.MISSING_KEY = 'Missing key'
/** @export */ eYo.msg.MISSING_VALUE = 'Missing value'
/** @export */ eYo.msg.MISSING_EXPRESSION = 'Missing expression'
/** @export */ eYo.msg.MISSING_ARGUMENT = 'Missing argument'
/** @export */ eYo.msg.MISSING_LHS = 'Missing LHS'
/** @export */ eYo.msg.MISSING_RHS = 'Missing RHS'
/** @export */ eYo.msg.LOCK_BLOCK = 'Verrouiller'
/** @export */ eYo.msg.UNLOCK_BLOCK = 'Modifier'

/** @export */ eYo.msg.BASIC = 'Basique'
/** @export */ eYo.msg.INTERMEDIATE = 'Intermédiaire'
/** @export */ eYo.msg.ADVANCED = 'Avancé'
/** @export */ eYo.msg.EXPERT = 'Expert'
/** @export */ eYo.msg.MATH = 'Math'
/** @export */ eYo.msg.TEXT = 'Texte'
/** @export */ eYo.msg.LIST = 'Liste et assimilé'
/** @export */ eYo.msg.BRANCHING = 'Branchement'
/** @export */ eYo.msg.LOOPING = 'Boucle'
/** @export */ eYo.msg.FUNCTION = 'Fonction et objet'

/**
 * Internationalization entry.
 * For edython.
 * @param {String} key  key is the string to be localized
 * @param {String} [pack] pack is the pack where the localization should be found
 * @return {!String}
 */
eYo.msg.i18n = function(key, pack) {
  return pack && eYo.msgPack[pack] && eYo.msgPack[pack][key] || eYo.msg[key] || key
}