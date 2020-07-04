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
eYo.fcls.newDrvrC9r('Field', {
  methods: {
    /**
     * Set the location.
     * @param {eYo.field} field
     * @param {*} where
     */
    do_moveTo: eYo.doNothing,
    /**
     * The field text will change.
     * @param {eYo.field} field  the node the driver acts on
     */
    do_textRemove: eYo.doNothing,
    /**
     * Create field text.
     * @param {eYo.field} field  the node the driver acts on
     */
    do_textCreate: eYo.doNothing,
    /**
     * Set the visual effects of the field.
     * @param {*} field
     */
    do_setVisualAttribute: eYo.doNothing,
    /**
     * Resize the inline editor.
     * @param {*} field
     */
    do_inlineEditorResize: eYo.doNothing,
    /**
     * Whether the field is displayed.
     * @param {eYo.field} field  the field to query about
     */
    displayedGet: eYo.doNothing,
    /**
     * Display/hide the given field.
     * @param {eYo.field} field  the field the driver acts on
     * @param {boolean} yorn
     */
    displayedSet: eYo.doNothing,
    /**
     * Display/hide the given field, according to its `visible` status.
     * @param {eYo.field} field  the field the driver acts on
     * @param {boolean} yorn
     */
    displayedUpdate: eYo.doNothing,
    /**
     * Callback at view disposal.
     * Forwards to the driver.
     * @param {*} field
     */
    widgetDisposeCallback (field) { // eslint-disable-line
      return eYo.doNothing
    },
    /**
     * Make the given field reserved or not, to emphasize reserved keywords.
     * The default implementation does nothing.
     * @param {*} field
     * @param {boolean} yorn
     */
    do_makeReserved: eYo.doNothing,
    /**
     * Make the given field an error.
     * The default implementation does nothing.
     * @param {*} field
     * @param {boolean} yorn
     */
    do_makeError: eYo.doNothing,
    /**
     * Make the given field a placeholder.
     * The default implementation does nothing.
     * @param {*} field
     * @param {boolean} yorn
     */
    do_makePlaceholder: eYo.doNothing,
    /**
     * Make the given field a comment.
     * The default implementation does nothing.
     * @param {*} field
     * @param {boolean} yorn
     */
    do_makeComment: eYo.doNothing,
  },
})

    