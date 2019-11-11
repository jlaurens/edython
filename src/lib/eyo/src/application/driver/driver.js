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

goog.require('eYo.Owned')

goog.provide('eYo.Driver')

/**
 * @name {eYo.Driver}
 * @namespace
 */
eYo.Driver = Object.create(null)

eYo.Driver.makeManagerClass = (object) => {
  if (object === eYo.Driver) {
    return
  }
  var drivers = new Set()
  object['Mgr'] = function (owner) {
    eYo.Driver.Mgr.superClass_.constructor.call(this, owner)
    drivers.forEach(name => {
      this[name[0].toUpperCase() + name.substr(1)] = new eYo.Driver[name]()
    })
  }
  goog.inherits(object['Mgr'], eYo.Owned)
  /**
   * Convenient automatic subclasser.
   * @param {String} name
   */
  object.makeDriverClass = (name) => {
    drivers.add(name)
    object[name] = function () {
      object[name].superClass_.constructor.call(this)
    }
    goog.inherits(object[name], object.Default)
  }
  // make the default driver
  object.Default = eYo.Driver.Default
}

/**
 * Default convenient driver, to be subclassed.
 */
eYo.Driver.Default = function () {}
/**
 * Init the UI.
 * @param {*} object
 */
object.Default.prototype.initUI = function () {
  return true
}
/**
 * Dispose of the UI.
 * @param {*} object
 */
object.Default.prototype.disposeUI = function () {
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
