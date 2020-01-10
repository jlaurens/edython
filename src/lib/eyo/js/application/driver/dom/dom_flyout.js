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

eYo.require('svg')

eYo.forwardDeclare('Flyout')

/**
 * @name {eYo.dom.Flyout}
 * @constructor
 * Dom driver for the flyout.
 */
eYo.dom.makeDriverC9r('Flyout', {
    /**
   * Initialize the flyout dom ressources.
   * @param {eYo.Flyout} flyout
   * @return {!Element} The desk's dom repository.
   */
  initUI (flyout) {
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
  },
  /**
   * Dispose of the given slot's rendering resources.
   * @param {eYo.Flyout} flyout
   */
  disposeUI (flyout) {
    var dom = flyout.dom
    goog.dom.removeNode(dom.toolbar_)
    goog.dom.removeNode(dom.board_)
  },
})

/**
 * Default CSS class of the flyout panel.
 * @type {string}
 */
eYo.dom.FLYOUT_CSS_CLASS = goog.getCssName('eyo-flyout')


/**
 * Returns the CSS class to be applied to the root element.
 * @param {eYo.Flyout} flyout
 * @return {string} Renderer-specific CSS class.
 * @override
 */
eYo.dom.Flyout.prototype.cssClass = function() {
  return eYo.dom.FLYOUT_CSS_CLASS
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.Flyout} flyout
 */
eYo.dom.Flyout.prototype.updateMetrics = function (flyout) {
  var r = flyout.viewRect
  var div = flyout.dom.toolbarDiv_
  div.style.width = `${r.width} px`
  div.style.height = `${eYo.Flyout.TOOLBAR_HEIGHT} px`
  flyout.dom.boardDiv_
  div.style.y = `${eYo.Flyout.TOOLBAR_HEIGHT} px`
  div.style.width = `${r.width} px`
  div.style.height = `${r.height - eYo.Flyout.TOOLBAR_HEIGHT} px`
}
