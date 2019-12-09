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

eYo.require('eYo.ns.UI')

/**
 * Class for a basic object indirectly owned by a brick.
 * 
 * @name {eYo.ns.UI.Owned2}
 * @constructor
 * @param {eYo.ns.Brick|eYo.Slot|eYo.Magnet} owner  the immediate owner of this magnet. When not a brick, it is indirectly owned by a brick.
 * @readonly
 * @property {eYo.ns.Brick.UI} ui  The ui object used for rendering.
 * @readonly
 * @property {eYo.ns.Brick} slot  The brick.
 * @readonly
 * @property {eYo.Slot} slot  The slot.
 * @readonly
 * @property {eYo.Magnet} slot  The magnet.
 */

eYo.ns.UI.Dflt.makeSubclass('Owned2', {
  linked: ['slot', 'brick', 'magnet'],
  computed: {
    ui () {
      return this.brick.ui
    }
  }
})

eYo.Assert(!!eYo.ns.UI.Owned2, 'MISSED/FAILURE...')
eYo.forwardDeclare('eYo.ns.Brick')
eYo.forwardDeclare('eYo.ns.Brick.UI')
eYo.forwardDeclare('eYo.Slot')
eYo.forwardDeclare('eYo.Magnet')

