/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Object with data, slots or fields.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * Ancestor of object owning data, slots and fields.
 * @name {eYo.dfs}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'dfs', {
  MODIFIER: 'modifier', // this MUST be in lower case
  PREFIX: 'prefix', // lowercase
  LABEL: 'label', // lowercase
  SEPARATOR: 'separator', // lowercase
  START: 'start', // lowercase
  OPERATOR: 'operator', // lowercase
  END: 'end', // lowercase
  SUFFIX: 'suffix', // lowercase
  COMMENT_MARK: 'comment_mark', // lowercase
  COMMENT: 'comment', // lowercase
})

/**
 * Class for a basic object indirectly owned by a brick.
 * 
 * @name {eYo.dfs.BaseC9r}
 * @constructor
 * @param {eYo.brick|eYo.slot.BaseC9r|eYo.magnet.BaseC9r} owner - the immediate owner of this magnet. When not a brick, it is indirectly owned by a brick.
 * @readonly
 * @property {eYo.brick.UI} ui - The ui object used for rendering.
 * @readonly
 * @property {eYo.brick.BaseC9r} brick - The brick.
 * @readonly
 * @property {eYo.slot.BaseC9r} slot - The slot.
 * @readonly
 * @property {eYo.magnet.BaseC9r} magnet - The magnet.
 */
eYo.dfs.makeBaseC9r({
  aliases: {
    'brick.ui': 'ui',
  },
  properties: {
    brick: eYo.NA,
    slot: eYo.NA,
    magnet: eYo.NA,
  },
})

eYo.dfs.BaseC9r_p.ownerDidChange = function (before, after) {
  let inherited = eYo.dfs.Base_s.ownerDidChange
  inherited && inherited.call(this, before, after)
  this.slot_ = this.brick_ = this.magnet_ = eYo.NA
  if (after.isSlot) {
    this.slot_ = after
    this.brick_ = after.brick
  } else if (after.isMagnet) {
    this.magnet_ = after
    this.brick_ = after.brick
  } else {
    this.brick_ = after
  }
}
