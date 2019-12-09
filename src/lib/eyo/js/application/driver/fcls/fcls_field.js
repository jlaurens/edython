/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate. Do nothing driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('eYo.NS_Fcls')

eYo.provide('eYo.NS_Fcls.Field')

eYo.forwardDeclare('eYo.Field')

/**
 * Faceless driver for fields.
 */
eYo.NS_Fcls.makeDriverClass('Field')

/**
 * Set the location.
 * @param {eYo.Field} field
 * @param {*} where
 */
eYo.NS_Fcls.Field.prototype.moveTo = eYo.Do.nothing

/**
 * The field text will change.
 * @param {eYo.Field} field  the node the driver acts on
 */
eYo.NS_Fcls.Field.prototype.textRemove = eYo.Do.nothing

/**
 * Display the field text.
 * @param {eYo.Field} field  the node the driver acts on
 */
eYo.NS_Fcls.Field.prototype.textCreate = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.NS_Fcls.Field.prototype.setVisualAttribute = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.NS_Fcls.Field.prototype.inlineEditorResize = eYo.Do.nothing

/**
 * Whether the field is displayed.
 * @param {eYo.Field} field  the field to query about
 */
eYo.NS_Fcls.Field.prototype.displayedGet = eYo.Do.nothing

/**
 * Display/hide the given field.
 * @param {eYo.Field} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.NS_Fcls.Field.prototype.displayedSet = eYo.Do.nothing

/**
 * Display/hide the given field, according to its `visible` status.
 * @param {eYo.Field} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.NS_Fcls.Field.prototype.displayedUpdate = eYo.Do.nothing

/**
 * Callback at widget disposal.
 * Forwards to the driver.
 * @param {*} field
 */
eYo.NS_Fcls.Field.prototype.widgetDisposeCallback = function (field) {
  return eYo.Do.nothing
}

/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.NS_Fcls.Field.prototype.makeReserved = eYo.Do.nothing

/**
 * Make the given field an error.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.NS_Fcls.Field.prototype.makeError = eYo.Do.nothing

/**
 * Make the given field a placeholder.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.NS_Fcls.Field.prototype.makePlaceholder = eYo.Do.nothing

/**
 * Make the given field a comment.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.NS_Fcls.Field.prototype.makeComment = eYo.Do.nothing
