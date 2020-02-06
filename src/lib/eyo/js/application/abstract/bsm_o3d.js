/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Basic object owned by either an application...
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('decorate')

// Possible owner
eYo.forwardDeclare('app')
// Possible owned
eYo.forwardDeclare('Desk')
eYo.forwardDeclare('pane.Workspace')
eYo.forwardDeclare('Flyout')
eYo.forwardDeclare('board')
eYo.forwardDeclare('brick')
eYo.forwardDeclare('slot')
eYo.forwardDeclare('magnet')

/**
 * Namespace for objects owned by bricks, slots or magnets.
 * @name {eYo.bsm_o3d}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'bsm_o3d')

/**
 * Class for a basic object indirectly owned by a brick.
 * 
 * @name {eYo.bsm_o3d.Dflt}
 * @constructor
 * @param {eYo.brick|eYo.slot.Dflt|eYo.magnet.Dflt} owner  the immediate owner of this magnet. When not a brick, it is indirectly owned by a brick.
 * @readonly
 * @property {eYo.brick.UI} ui  The ui object used for rendering.
 * @readonly
 * @property {eYo.brick.Dflt} brick  The brick.
 * @readonly
 * @property {eYo.slot.Dflt} slot  The slot.
 * @readonly
 * @property {eYo.magnet.Dflt} magnet  The magnet.
 */

eYo.bsm_o3d.makeDflt({
  valued: ['slot', 'brick', 'magnet'],
  computed: {
    ui () {
      return this.brick.ui
    }
  }
})

eYo.assert(!!eYo.bsm_o3d.Dflt && !!eYo.bsm_o3d.Dflt_p, 'MISSED/FAILURE...')

eYo.forwardDeclare('brick')
eYo.forwardDeclare('slot')
eYo.forwardDeclare('magnet')

eYo.bsm_o3d.Dflt_p.ownerDidChange = function (before, after) {
  this.slot_ = this.brick_ = this.magnet_ = eYo.NA
  if (after instanceof eYo.slot.Dflt) {
    this.slot_ = after
    this.brick_ = after.brick
  } else if (after instanceof eYo.magnet.Dflt) {
    this.magnet_ = after
    this.brick_ = after.brick
  } else if (after instanceof eYo.brick.Dflt) {
    this.brick_ = after
  }
}
