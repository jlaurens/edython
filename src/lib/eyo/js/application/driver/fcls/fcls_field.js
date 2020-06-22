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

eYo.forward('field')

/**
 * Faceless driver for fields.
 */
eYo.fcls.newDriverC9r('Field')

/**
 * Set the location.
 * @param {eYo.field} field
 * @param {*} where
 */
eYo.fcls.Field.BaseC9r_p.moveTo = eYo.doNothing

/**
 * The field text will change.
 * @param {eYo.field} field  the node the driver acts on
 */
eYo.fcls.Field.BaseC9r_p.textRemove = eYo.doNothing

/**
 * Display the field text.
 * @param {eYo.field} field  the node the driver acts on
 */
eYo.fcls.Field.BaseC9r_p.textCreate = eYo.doNothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.fcls.Field.BaseC9r_p.setVisualAttribute = eYo.doNothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.fcls.Field.BaseC9r_p.inlineEditorResize = eYo.doNothing

/**
 * Whether the field is displayed.
 * @param {eYo.field} field  the field to query about
 */
eYo.fcls.Field.BaseC9r_p.displayedGet = eYo.doNothing

/**
 * Display/hide the given field.
 * @param {eYo.field} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.fcls.Field.BaseC9r_p.displayedSet = eYo.doNothing

/**
 * Display/hide the given field, according to its `visible` status.
 * @param {eYo.field} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.fcls.Field.BaseC9r_p.displayedUpdate = eYo.doNothing

/**
 * Callback at view disposal.
 * Forwards to the driver.
 * @param {*} field
 */
eYo.fcls.Field.BaseC9r_p.widgetDisposeCallback = function (field) { // eslint-disable-line
  return eYo.doNothing
}

/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.fcls.Field.BaseC9r_p.makeReserved = eYo.doNothing

/**
 * Make the given field an error.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.fcls.Field.BaseC9r_p.makeError = eYo.doNothing

/**
 * Make the given field a placeholder.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.fcls.Field.BaseC9r_p.makePlaceholder = eYo.doNothing

/**
 * Make the given field a comment.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.fcls.Field.BaseC9r_p.makeComment = eYo.doNothing
