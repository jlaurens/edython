/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Basic object owned by either a brick or a slot.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('eYo.UI')

/**
 * Class for a basic object indirectly owned by a brick.
 * 
 * @name {eYo.UI.Owned2}
 * @constructor
 * @param {!eYo.Brick|eYo.Slot|eYo.Magnet} owner  the immediate owner of this magnet. When not a brick, it is indirectly owned by a brick.
 * @readonly
 * @property {eYo.Brick.UI} ui  The ui object used for rendering.
 * @readonly
 * @property {eYo.Brick} slot  The brick.
 * @readonly
 * @property {eYo.Slot} slot  The slot.
 * @readonly
 * @property {eYo.Magnet} slot  The magnet.
 */

eYo.UI.Dflt.makeSubclass('Owned2', {
  props: {
    link: ['slot', 'brick', 'magnet'],
    computed: {
      ui () {
        return this.brick.ui
      }
    }
  }
})

eYo.forwardDeclare('eYo.Brick')
eYo.forwardDeclare('eYo.Brick.UI')
eYo.forwardDeclare('eYo.Slot')
eYo.forwardDeclare('eYo.Magnet')

