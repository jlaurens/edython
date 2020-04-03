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
eYo.forward('app')
// Possible owned
eYo.forward('view.Workspace')
eYo.forward('board')
eYo.forward('brick')
eYo.forward('slot')
eYo.forward('magnet')

/**
 * Namespace for objects owned by bricks, slots or magnets.
 * @name {eYo.bsm_o3d}
 * @namespace
 */
eYo.dfs.makeNS(eYo, 'bsm_o3d')

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
  let inherited = eYo.bsm_o3d.Base_s.ownerDidChange
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
