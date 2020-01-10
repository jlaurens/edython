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

eYo.require('fcls')

eYo.provide('fcls.field')

eYo.forwardDeclare('field')

/**
 * Faceless driver for fields.
 */
eYo.fcls.makeDriverClass('Field')

/**
 * Set the location.
 * @param {eYo.Field} field
 * @param {*} where
 */
eYo.fcls.Field.Dflt_p.moveTo = eYo.do.nothing

/**
 * The field text will change.
 * @param {eYo.Field} field  the node the driver acts on
 */
eYo.fcls.Field.Dflt_p.textRemove = eYo.do.nothing

/**
 * Display the field text.
 * @param {eYo.Field} field  the node the driver acts on
 */
eYo.fcls.Field.Dflt_p.textCreate = eYo.do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.fcls.Field.Dflt_p.setVisualAttribute = eYo.do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.fcls.Field.Dflt_p.inlineEditorResize = eYo.do.nothing

/**
 * Whether the field is displayed.
 * @param {eYo.Field} field  the field to query about
 */
eYo.fcls.Field.Dflt_p.displayedGet = eYo.do.nothing

/**
 * Display/hide the given field.
 * @param {eYo.Field} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.fcls.Field.Dflt_p.displayedSet = eYo.do.nothing

/**
 * Display/hide the given field, according to its `visible` status.
 * @param {eYo.Field} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.fcls.Field.Dflt_p.displayedUpdate = eYo.do.nothing

/**
 * Callback at widget disposal.
 * Forwards to the driver.
 * @param {*} field
 */
eYo.fcls.Field.Dflt_p.widgetDisposeCallback = function (field) {
  return eYo.do.nothing
}

/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.fcls.Field.Dflt_p.makeReserved = eYo.do.nothing

/**
 * Make the given field an error.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.fcls.Field.Dflt_p.makeError = eYo.do.nothing

/**
 * Make the given field a placeholder.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.fcls.Field.Dflt_p.makePlaceholder = eYo.do.nothing

/**
 * Make the given field a comment.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.fcls.Field.Dflt_p.makeComment = eYo.do.nothing
