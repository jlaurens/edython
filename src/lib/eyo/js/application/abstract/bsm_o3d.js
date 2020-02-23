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
eYo.forwardDeclare('view.Workspace')
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
 * @name {eYo.bsm_o3d.Base}
 * @constructor
 * @param {eYo.brick|eYo.slot.Base|eYo.magnet.Base} owner  the immediate owner of this magnet. When not a brick, it is indirectly owned by a brick.
 * @readonly
 * @property {eYo.brick.UI} ui  The ui object used for rendering.
 * @readonly
 * @property {eYo.brick.Base} brick  The brick.
 * @readonly
 * @property {eYo.slot.Base} slot  The slot.
 * @readonly
 * @property {eYo.magnet.Base} magnet  The magnet.
 */

eYo.bsm_o3d.makeBase({
  properties: {
    ui: {
      get () {
        return this.brick.ui
      },
    },
    brick: eYo.NA,
    slot: eYo.NA,
    magnet: eYo.NA,
  },
})

!!eYo.bsm_o3d.Base && !!eYo.bsm_o3d.Base_p || eYo.assert('MISSED/FAILURE...')

eYo.bsm_o3d.Base_p.ownerDidChange = function (before, after) {
  let inherited = eYo.bsm_o3d.Dflt_s.ownerDidChange
  inherited && inherited.call(this, before, after)
  this.slot_ = this.brick_ = this.magnet_ = eYo.NA
  if (after instanceof eYo.slot.Base) {
    this.slot_ = after
    this.brick_ = after.brick
  } else if (after instanceof eYo.magnet.Base) {
    this.magnet_ = after
    this.brick_ = after.brick
  } else if (after instanceof eYo.brick.Base) {
    this.brick_ = after
  }
}
