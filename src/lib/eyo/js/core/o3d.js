/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview An object owns properties ans is owned by someone.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * Namespace for owned objects.
 * Quite all the objects are owned.
 * Only a very few of them are top level object.
 * @name {eYo.o3d}
 * @namespace
 */
eYo.o4t.makeNS(eYo, 'o3d')

/**
 * @name{eYo.o3d.Base}
 * @constructor
 */
eYo.o3d.makeBase({
  /** @param {eYo.app.Base|eYo.view.Desk|eYo.flyout.View|eYo.board|eYo.expr|eYo.stmt|eYo.slot.Base|eYo.magnet.Base} owner  the immediate owner of this object. When not a brick, it is directly owned by a brick.
   */
  init (owner, key = '') {
    owner || eYo.throw('Missing owner!')
    this.owner_ = owner
    this.key_ = key
  },
  dispose () {
    this.owner_ = this.key_ = eYo.NA
  },
  properties: {
    owner: {
      consolidate (after) {
        if (after.hasUI) {
          this.initUI()
        } else {
          this.disposeUI()
        }
      },
    },
    key: '',
  },
  methods: {
    /**
     * The default implementation does nothing.
     * For subclassers.
     * @param{*} before - the owner before the change
     * @param{*} after - the owner after the change
     */
    ownerWillChange: eYo.doNothing,
    /**
     * The default implementation does nothing.
     * For subclassers.
     * @param{*} before - the owner before the change
     * @param{*} after - the owner after the change
     */
    ownerDidChange: eYo.doNothing,
  }
})

/**
 * Create a new instance based on the model.
 * @param {Object} model
 */
eYo.o3d._p.singleton = function (owner, model) {
  return new (this.makeC9r(this.makeNS(), 'foo', model))(owner, 'foo')
}

/**
 * Create a new instance based on the model.
 * @param {Object} [NS] - Optional namespace, defaults to the receiver.
 * @param {Object} key - the result will be `NS[key]`
 * @param {Object} model
 */
eYo.o3d._p.makeSingleton = function(NS, key, model) {
  if (!eYo.isNS(NS)) {
    !model || eYo.throw(`Unexpected model: ${model}`)
    ;[NS, key, model] = [this, NS, key]
  }
  eYo.isStr(key) || eYo.throw(`Unexpected parameter ${key}`)
  let ans = new (this.makeC9r(NS, key, model))(NS, key)
  Object.defineProperty(NS, key, eYo.descriptorR(function() {
    return ans
  }))
}
