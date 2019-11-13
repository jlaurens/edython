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

goog.require('eYo.Dom')

goog.provide('eYo.Dom.Search')

goog.forwardDeclare('eYo.Search')

/**
 * Dom driver for the search pane.
 */
eYo.Dom.makeDriverClass('Search')

/**
 * Default CSS class of the search panel.
 * @type {string}
 */
eYo.Dom.SEARCH_CSS_CLASS = goog.getCssName('eyo-search')


/**
 * Returns the CSS class to be applied to the root element.
 * @param {!eYo.Search} search
 * @return {string} Renderer-specific CSS class.
 * @override
 */
eYo.Dom.Search.prototype.cssClass = function() {
  return eYo.Dom.SEARCH_CSS_CLASS
}

/**
 * Initialize the search dom ressources.
 * @param {!eYo.Search} search
 * @return {!Element} The desk's dom repository.
 */
eYo.Dom.Search.prototype.initUI = eYo.Dom.Decorate.initUI(eYo.Dom.Search, function(search) {
  var dom = search.dom
  const div = search.owner_.dom.search_
  Object.defineProperty(dom, 'div_', { value: div, writable: true})
  // search toolbar, on top of the search
  var cssClass = this.cssClass()
  var f = (type) => {
    var x = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, type)
    )
    div.appendChild(x)
    x.dataset && (x.dataset.type = `search ${type}`)
    return x
  }
  dom.toolbar_ = f('toolbar')
  dom.board_ = f('board')
  return dom
})

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.Search} search
 */
eYo.Dom.Search.prototype.disposeUI = eYo.Dom.Decorate.disposeUI(function (search) {
  var dom = search.dom
  goog.dom.removeNode(dom.toolbar_)
  goog.dom.removeNode(dom.board_)
})

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.Search} search
 */
eYo.Dom.Search.prototype.updateMetrics = function (search) {
  var r = search.viewRect
  var div = search.dom.toolbarDiv_
  div.style.width = `${r.width} px`
  div.style.height = `${eYo.Search.TOOLBAR_HEIGHT} px`
  search.dom.boardDiv_
  div.style.y = `${eYo.Search.TOOLBAR_HEIGHT} px`
  div.style.width = `${r.width} px`
  div.style.height = `${r.height - eYo.Search.TOOLBAR_HEIGHT} px`
}
