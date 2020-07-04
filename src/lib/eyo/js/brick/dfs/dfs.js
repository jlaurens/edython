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

eYo.forward('changer')

/**
 * Ancestor of object owning data, fields and slots.
 * @name {eYo.dfs}
 * @namespace
 */
eYo.o4t.newNS(eYo, 'dfs', {
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

//<<< mochai: Basics
//... chai.assert(eYo.dfs)
//... chai.assert(eYo.dfs.BaseC9r)
//... chai.assert(eYo.Dfs)
//... chai.assert(eYo.dfs.Dlgt_p)
//... chai.assert(eYo.Dfs$)
//>>>

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
  init (key, owner) {
    this.resetBSM(owner)
  },
  aliases: {
    'brick.ui': 'ui',
    'brick.driver': 'driver',
  },
  properties: {
    brick: eYo.NA,
    slot: eYo.NA,
    magnet: eYo.NA,
  },
  methods: {
    //<<< mochai: methods
    /**
     * Reset the brick/slot/magnet properties.
     * @param {*} owner 
     */
    resetBSM (owner) {
      //<<< mochai: resetBSM
      //... let ns = eYo.dfs.newNS()
      //... ns.makeBaseC9r()
      //... var f = ns.new({}, 'f', onr)
      //... chai.expect(f.brick).equal(onr)
      //... chai.expect(f.slot).undefined
      //... chai.expect(f.magnet).undefined
      this.slot_ = this.brick_ = this.magnet_ = eYo.NA
      if (owner) {
        if (owner.isSlot) {
          //... setup({
          //...   properties: {
          //...     brick: 1
          //...   },
          //... })
          //... onr.isSlot = true
          //... f = ns.new({}, 'f', onr)
          this.brick_ = owner.brick
          this.slot_ = owner
          //... chai.expect(f.brick).equal(1)
          //... chai.expect(f.slot).equal(onr)
          //... chai.expect(f.magnet).undefined
        } else if (owner.isMagnet) {
          //... setup({
          //...   properties: {
          //...     brick: 1
          //...   },
          //... })
          //... onr.isMagnet = true
          //... f = ns.new({}, 'f', onr)
          this.magnet_ = owner
          this.brick_ = owner.brick
          //... chai.expect(f.brick).equal(1)
          //... chai.expect(f.slot).undefined
          //... chai.expect(f.magnet).equal(onr)
        } else {
          this.brick_ = owner
          //... setup()
          //... f = ns.new({}, 'f', onr)
          //... chai.expect(f.brick).equal(onr)
          //... chai.expect(f.slot).undefined
          //... chai.expect(f.magnet).undefined
        }  
      }
      //>>>
    },
    /**
     * Hook for owner change
     * @param {Object} before 
     * @param {Object} after 
     */
    ownerDidChange (before, after) {
      //<<< mochai: ownerDidChange
      //... let ns = eYo.dfs.newNS()
      //... ns.makeBaseC9r()
      //... eYo.test.extend(ns.BaseC9r_p, 'ownerDidChange', function (before, after) {
      //...   flag.push(421)
      //... })
      //... var f = ns.new({}, 'f', onr)
      //... setup()
      //... f.owner_ = onr
      //... flag.expect(421)
      let inherited = eYo.dfs.BaseC9r[eYo.$SuperC9r_p].ownerDidChange
      inherited && inherited.call(this, before, after)
      this.resetBSM()
      //>>>
    },
    //>>>
  },
})

