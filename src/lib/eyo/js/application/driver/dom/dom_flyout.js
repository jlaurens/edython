/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Flyout rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Svg')

goog.provide('eYo.Dom.Flyout')

goog.forwardDeclare('eYo.Flyout')

/**
 * Dom driver for the flyout.
 */
eYo.Dom.makeDriverClass('Flyout')

/**
 * Default CSS class of the flyout panel.
 * @type {string}
 */
eYo.Dom.FLYOUT_CSS_CLASS = goog.getCssName('eyo-flyout')


/**
 * Returns the CSS class to be applied to the root element.
 * @param {!eYo.Flyout} flyout
 * @return {string} Renderer-specific CSS class.
 * @override
 */
eYo.Dom.Flyout.prototype.cssClass = function() {
  return eYo.Dom.FLYOUT_CSS_CLASS
}

/**
 * Initialize the flyout dom ressources.
 * @param {!eYo.Flyout} flyout
 * @return {!Element} The desk's dom repository.
 */
eYo.Dom.Flyout.prototype.initUI = eYo.Dom.Decorate.initUI(eYo.Dom.Flyout, function(flyout) {
  var dom = flyout.dom
  const div = flyout.owner_.dom.flyout_
  Object.defineProperty(dom, 'div_', { value: div, writable: true})
  // flyout toolbar, on top of the flyout
  var cssClass = this.cssClass()
  var f = (type) => {
    var x = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, type)
    )
    div.appendChild(x)
    x.dataset && (x.dataset.type = `flyout ${type}`)
    return x
  }
  dom.toolbar_ = f('toolbar')
  dom.board_ = f('board')
  return dom
})

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.Flyout} flyout
 */
eYo.Dom.Flyout.prototype.disposeUI = eYo.Dom.Decorate.disposeUI(function (flyout) {
  var dom = flyout.dom
  goog.dom.removeNode(dom.toolbar_)
  goog.dom.removeNode(dom.board_)
})

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.Flyout} flyout
 */
eYo.Dom.Flyout.prototype.updateMetrics = function (flyout) {
  var r = flyout.viewRect
  var div = flyout.dom.toolbarDiv_
  div.style.width = `${r.width} px`
  div.style.height = `${eYo.Flyout.TOOLBAR_HEIGHT} px`
  flyout.dom.boardDiv_
  div.style.y = `${eYo.Flyout.TOOLBAR_HEIGHT} px`
  div.style.width = `${r.width} px`
  div.style.height = `${r.height - eYo.Flyout.TOOLBAR_HEIGHT} px`
}
