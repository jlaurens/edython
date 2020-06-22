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

eYo.forward('section.Search')

/**
 * Dom driver for the search view.
 */
eYo.dom.newDriverC9r('Search', {
  /**
   * Initialize the search dom ressources.
   * @param {eYo.section.Search} search
   * @return {!Element} The desk's dom repository.
   */
  initUI (search) {
    var dom = search.dom
    const div = search.owner_.dom.search_
    Object.defineProperty(dom, 'div_', { value: div, writable: true})
    // search toolbar, on top of the search
    var cssClass = this.cssClass()
    var f = (type) => {
      var x = eYo.dom.createDom(
        eYo.dom.TagName.DIV,
        eYo.dom.getCssClass(cssClass, type)
      )
      div.appendChild(x)
      x.dataset && (x.dataset.type = `search ${type}`)
      return x
    }
    dom.toolbar_ = f('toolbar')
    dom.board_ = f('board')
    return dom
  },
  /**
   * Dispose of the given slot's rendering resources.
   * @param {eYo.section.Search} search
   */
  disposeUI (search) {
    var dom = search.dom
    eYo.dom.removeNode(dom.toolbar_)
    eYo.dom.removeNode(dom.board_)
  },
})

/**
 * Default CSS class of the search panel.
 * @type {string}
 */
eYo.dom.SEARCH_CSS_CLASS = eYo.dom.getCssClass('eyo-search')


/**
 * Returns the CSS class to be applied to the root element.
 * @param {eYo.section.Search} search
 * @return {string} Renderer-specific CSS class.
 * @override
 */
eYo.dom.Search.prototype.cssClass = function() {
  return eYo.dom.SEARCH_CSS_CLASS
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.section.Search} search
 */
eYo.dom.Search.prototype.updateMetrics = function (search) {
  var r = search.viewRect
  var div = search.dom.toolbarDiv_
  div.style.width = `${r.width} px`
  div.style.height = `${eYo.dom.Search.TOOLBAR_HEIGHT} px`
  search.dom.boardDiv_
  div.style.y = `${eYo.dom.Search.TOOLBAR_HEIGHT} px`
  div.style.width = `${r.width} px`
  div.style.height = `${r.height - eYo.dom.Search.TOOLBAR_HEIGHT} px`
}
