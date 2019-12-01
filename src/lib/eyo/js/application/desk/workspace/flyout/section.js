/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Section of the flyout. Actually we have a search section, a library section and a draft (bag) section.
 * Each section has a toolbar and a board or a board list.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Protocol')

goog.provide('eYo.Section')

/**
 * Class for a flyout's section.
 * @param {!eYo.Flyout} owner  The owning flyout.
 * @constructor
 */
eYo.Section = function(owner) {
  eYo.Section.superClass_.constructor.call(this, owner)
}

Object.defineProperties(eYo.Section.prototype, {
  /**
   * The owning flyout
   * @type {eYo.Flyout}
   * @readonly
   */
  flyout: { 
    get () {
      return this.owner_
    }
  },
  /**
   * The toolbar
   * @readonly
   */
  toolbar: {
    get () {
      return this.toolbar_
    }
  }
})

/**
 * Dispose of this section.
 * Sever all links.
 */
eYo.Section.prototype.dispose = function() {
  this.disposeUI()
  this.toolbar_ = null
  this.dispose = eYo.Do.nothing
  eYo.Section.superClass_.dispose.call(this)
}

/**
 * Make the UI
 */
eYo.Section.prototype.initUI = function () {
  this.toolbar_.initUI()
  delete this.disposeUI
  this.initUI = eYo.Do.nothing
}

/**
 * Make the UI
 */
eYo.Section.prototype.disposeUI = function () {
  this.toolbar_.disposeUI()
  delete this.initUI
  this.disposeUI = eYo.Do.nothing
}

/**
 * Class for a flyout's section with one board.
 * @param {!eYo.Flyout} owner  The owning flyout.
 * @constructor
 */
eYo.Section.Single = function(owner) {
  eYo.Section.Single.superClass_.constructor.call(this, owner)
  this.board_ = new eYo.Board(this)
}
goog.inherits(eYo.Section.Single, eYo.Section)

/**
 * Dispose of this section.
 * Sever all links.
 */
eYo.Section.Single.prototype.dispose = function() {
  this.board_.dispose()
  this.board_ = null
  eYo.Section.Single.superClass_.dispose.call()
  this.dispose = eYo.Do.nothing
}

/**
 * Make the UI
 */
eYo.Section.Single.prototype.initUI = function () {
  eYo.Section.Single.superClass_.initUI.call(this)
  this.board_.initUI()
  delete this.disposeUI
  this.initUI = eYo.Do.nothing
}

/**
 * Make the UI
 */
eYo.Section.Single.prototype.disposeUI = function () {
  eYo.Section.Single.superClass_.disposeUI.call(this)
  this.board_.disposeUI()
  delete this.initUI
  this.disposeUI = eYo.Do.nothing
}

eYo.Debug.test() // remove this line when finished
