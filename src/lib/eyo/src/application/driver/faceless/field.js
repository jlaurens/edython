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

goog.require('eYo.Driver')

goog.provide('eYo.Driver.Field')

/**
 * Faceless driver for fields.
 */
eYo.Driver.makeSubclass('Field')

/**
 * Set the location.
 * @param {!eYo.Field} field
 * @param {*} where
 */
eYo.Driver.Field.prototype.moveTo = eYo.Do.nothing

/**
 * The field text will change.
 * @param {!eYo.Field} field  the node the driver acts on
 */
eYo.Driver.Field.prototype.textRemove = eYo.Do.nothing

/**
 * Display the field text.
 * @param {!eYo.Field} field  the node the driver acts on
 */
eYo.Driver.Field.prototype.textCreate = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Driver.Field.prototype.setVisualAttribute = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Driver.Field.prototype.inlineEditorResize = eYo.Do.nothing

/**
 * Whether the field is displayed.
 * @param {!eYo.Field} field  the field to query about
 */
eYo.Driver.Field.prototype.displayedGet = eYo.Do.nothing

/**
 * Display/hide the given field.
 * @param {!eYo.Field} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.Field.prototype.displayedSet = eYo.Do.nothing

/**
 * Display/hide the given field, according to its `visible` status.
 * @param {!eYo.Field} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.Field.prototype.displayedUpdate = eYo.Do.nothing

/**
 * Callback at widget disposal.
 * Forwards to the driver.
 * @param {*} field
 */
eYo.Driver.Field.prototype.widgetDisposeCallback = function (field) {
  return eYo.Do.nothing
}

/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.Field.prototype.makeReserved = eYo.Do.nothing

/**
 * Make the given field an error.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.Field.prototype.makeError = eYo.Do.nothing

/**
 * Make the given field a placeholder.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.Field.prototype.makePlaceholder = eYo.Do.nothing

/**
 * Make the given field a comment.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.Field.prototype.makeComment = eYo.Do.nothing
