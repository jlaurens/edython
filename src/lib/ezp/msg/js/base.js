/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
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

/** @export */ ezP.Msg.RENAME_VARIABLE = 'Renommer'
/** @export */ ezP.Msg.REPLACE_VARIABLE = 'Remplacer par'
/** @export */ ezP.Msg.NEW_VARIABLE = 'Nouvelle variable'
/** @export */ ezP.Msg.DELETE_UNUSED_VARIABLES = 'Nettoyer'

/** @export */ ezP.Msg.RENAME_VARIABLE_TITLE = "Renommer la variable '%1' en :"

/** @export */ ezP.Msg.CONNECT_MAIN_BLOCK_DLG_TITLE = 'Connecter ce bloc principal'
/** @export */ ezP.Msg.CONNECT_MAIN_BLOCK_DLG_CONTENT = "Glisser des blocs d'instructions et les connecter sous ce bloc principal."
/** @export */ ezP.Msg.CONNECT_MAIN_BLOCK_DLG_TOOLTIP = 'Exécuter les instructions suivant ce bloc en appuyant sur le bouton.'

/** @export */ ezP.Msg.USE_PROPER_SLICING_STRIDE = 'pas personnalisé'
/** @export */ ezP.Msg.UNUSE_PROPER_SLICING_STRIDE = 'pas de 1'

/** @export */ ezP.Msg.ADD = 'Ajouter'
/** @export */ ezP.Msg.REMOVE = 'Enlever'

/** @export */ ezP.Msg.PRIMARY_ATTRIBUTE_ADD = 'Ajouter `.attribute`'
/** @export */ ezP.Msg.PRIMARY_SLICING_ADD = 'Ajouter `[...]`'
/** @export */ ezP.Msg.PRIMARY_CALL_ADD = 'Ajouter `(...)`'
/** @export */ ezP.Msg.PRIMARY_ATTRIBUTE_REMOVE = 'Enlever `.attribute`'
/** @export */ ezP.Msg.PRIMARY_SLICING_REMOVE = 'Enlever `[...]`'
/** @export */ ezP.Msg.PRIMARY_CALL_REMOVE = 'Enlever `(...)`'

/** @export */ ezP.Msg.MODULE_DOT_PREFIX_ADD = 'Ajouter . avant'
/** @export */ ezP.Msg.MODULE_DOT_PREFIX_REMOVE = 'Enlever . avant'
