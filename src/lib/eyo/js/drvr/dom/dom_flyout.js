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

eYo.forward('flyout.View')

eYo.dom.newNS('flyout', {
  /**
   * Default CSS class of the flyout panel.
   * @type {string}
   */
  CSS_CLASS: eYo.dom.getCssClass('flyout'),
})

/**
 * @name {eYo.dom.flyout.View}
 * @constructor
 * Dom driver for the flyout.
 */
eYo.dom.flyout.newDrvrC3s('View', {
  /**
   * Initialize the flyout dom ressources.
   * @param {eYo.flyout.View} flyout
   * @return {!Element} The desk's dom repository.
   */
  initUI (flyout) {
    let dom = flyout.dom
    let div = flyout.owner_.dom.flyout_
    Object.defineProperty(dom, 'div_', { value: div, writable: true})
    // flyout toolbar, on top of the flyout
    div.appendChild(dom.toolbar_ = this.ns.createDIV('toolbar', flyout.eyo$.name))
    div.appendChild(dom.board_ = this.ns.createDIV('board', flyout.eyo$.name))
    return dom
  },
  /**
   * Dispose of the given slot's rendering resources.
   * @param {eYo.flyout.View} flyout
   */
  disposeUI (flyout) {
    var dom = flyout.dom
    dom.board_ = eYo.dom.removeNode(dom.board_)
    dom.toolbar_ = eYo.dom.removeNode(dom.toolbar_)
  },
})

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.flyout.View} flyout
 */
eYo.dom.flyout.View_p.updateMetrics = function (flyout) {
  var r = flyout.viewRect
  var div = flyout.dom.toolbar_
  div.style.width = `${r.width} px`
  div.style.height = `${eYo.flyout.TOOLBAR_HEIGHT} px`
  div = flyout.dom.board_
  div.style.y = `${eYo.flyout.TOOLBAR_HEIGHT} px`
  div.style.width = `${r.width} px`
  div.style.height = `${r.height - eYo.flyout.TOOLBAR_HEIGHT} px`
}
