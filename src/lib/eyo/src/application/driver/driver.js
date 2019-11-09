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

goog.require('eYo')

goog.provide('eYo.Driver')

/**
 * @name {eYo.Driver}
 * @namespace
 */
eYo.Driver = Object.create(null)

/**
 * Faceless driver manager.
 * @param {eYo.Application} owner
 */
eYo.Driver.Mgr = (() => {
  var drivers = set()
  var me = function (owner) {
    eYo.Driver.Mgr.superClass_.constructor.call(this, owner)
    drivers.forEach(name => {
      this[name[0].toUpperCase() + name.substr(1)] = new eYo.Driver[name]()
    })
  }
  /**
   * Convenient automatic subclasser.
   * @param {String} name
   */
  eYo.Driver.makeSubclass = (name) => {
    drivers.add(name)
    eYo.Driver[name] = function () {
      eYo.Driver[name].superClass_.constructor.call(this)
    }
    goog.inherits(eYo.Driver[name], eYo.Driver.Default)
  }
  return me
})()
goog.inherits(eYo.Driver.Mgr, eYo.Owned)

/**
 * Faceless driver.
 */
eYo.Driver.Default = function () {}

/**
 * Init the UI.
 * @param {*} object
 */
eYo.Driver.Default.prototype.initUI = function () {
  return true
}

/**
 * Init the UI.
 * @param {*} object
 */
eYo.Driver.Default.prototype.disposeUI = function () {
  return true
}

/**
 * @name{eYo.Driver.Decorate}
 * @namespace
 */
eYo.Driver.Decorate = Object.create(null)

eYo.Driver.Decorate.initUI = (constructor, f) => {
  return function () {
    return constructor.superClass_.initUI.apply(this, arguments) && f.apply(this, arguments)
  }
}

eYo.Driver.Decorate.disposeUI = (constructor, f) => {
  return function () {
    return constructor.superClass_.disposeUI.apply(this, arguments) && f.apply(this, arguments)
  }
}





/*******  Application *******/

/*******  DnD *******/

/**
 * Initiate the DnD manager UI.
 * @param {!eYo.DnD.Mgr} mgr  The DnD manager we must init the UI of.
 */
eYo.Driver.Dnd.prototype.mgrInitUI = eYo.Do.nothing

/**
 * Dispose of the DnD manager UI.
 * @param {!eYo.DnD.Mgr} mgr  The DnD manager we must dispose of the UI of.
 */
eYo.Driver.Dnd.prototype.mgrDisposeUI = eYo.Do.nothing

