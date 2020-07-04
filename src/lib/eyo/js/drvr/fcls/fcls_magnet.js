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

eYo.forward('magnet')

/**
 * Faceless driver for magnets.
 */
eYo.fcls.newDrvrC9r('Magnet', {
  methods: {
    /**
     * Hilight the given connection.
     * The default implementation forwards to the driver.
     */
    do_focusOn: eYo.doNothing,
  }
})

eYo.fcls.makeForwarder(eYo.Magnet_p, 'focusOn')
