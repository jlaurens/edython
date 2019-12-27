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

eYo.require('Fcls')

eYo.provide('Fcls.Field')

eYo.forwardDeclare('Field')

/**
 * Faceless driver for fields.
 */
eYo.Fcls.makeDriverClass('Field')

/**
 * Set the location.
 * @param {eYo.Field} field
 * @param {*} where
 */
eYo.Fcls.Field.Dflt_p.moveTo = eYo.Do.nothing

/**
 * The field text will change.
 * @param {eYo.Field} field  the node the driver acts on
 */
eYo.Fcls.Field.Dflt_p.textRemove = eYo.Do.nothing

/**
 * Display the field text.
 * @param {eYo.Field} field  the node the driver acts on
 */
eYo.Fcls.Field.Dflt_p.textCreate = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Fcls.Field.Dflt_p.setVisualAttribute = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Fcls.Field.Dflt_p.inlineEditorResize = eYo.Do.nothing

/**
 * Whether the field is displayed.
 * @param {eYo.Field} field  the field to query about
 */
eYo.Fcls.Field.Dflt_p.displayedGet = eYo.Do.nothing

/**
 * Display/hide the given field.
 * @param {eYo.Field} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Fcls.Field.Dflt_p.displayedSet = eYo.Do.nothing

/**
 * Display/hide the given field, according to its `visible` status.
 * @param {eYo.Field} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Fcls.Field.Dflt_p.displayedUpdate = eYo.Do.nothing

/**
 * Callback at widget disposal.
 * Forwards to the driver.
 * @param {*} field
 */
eYo.Fcls.Field.Dflt_p.widgetDisposeCallback = function (field) {
  return eYo.Do.nothing
}

/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Fcls.Field.Dflt_p.makeReserved = eYo.Do.nothing

/**
 * Make the given field an error.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Fcls.Field.Dflt_p.makeError = eYo.Do.nothing

/**
 * Make the given field a placeholder.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Fcls.Field.Dflt_p.makePlaceholder = eYo.Do.nothing

/**
 * Make the given field a comment.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Fcls.Field.Dflt_p.makeComment = eYo.Do.nothing
