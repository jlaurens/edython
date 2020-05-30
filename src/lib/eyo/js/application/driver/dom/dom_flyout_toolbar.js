/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Flyout toolbar rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.forward('flyout.Toolbar')

/**
 * @name {eYo.dom.flyout.Toolbar}
 * @constructor
 * Dom driver for the flyout.
 */
eYo.dom.flyout.makeDriverC9r('Toolbar', {
    /**
   * Initialize the flyout dom ressources.
   * @param {eYo.flyout.View} flyout
   * @return {!Element} The desk's dom repository.
   */
  initUI (flyout) {
    var dom = flyout.dom
    const div = flyout.owner_.dom.flyout_
    Object.defineProperty(dom, 'div_', { value: div, writable: true})
    // flyout toolbar, on top of the flyout
    var cssClass = this.cssClass()
    var f = (type) => {
      var x = eYo.dom.createDom(
        eYo.dom.TagName.DIV,
        eYo.dom.getCssClass(cssClass, type)
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
   * @param {eYo.flyout.View} flyout
   */
  disposeUI (toolbar) {
    ;['Down', 'Enter', 'Up', 'Leave'].forEach(k => {
      k = `onButton${k}Wrapper_`
      let wrapper = toolbar[k]
      if (wrapper) {
        eYo.dom.unbindEvent(wrapper)
        toolbar[k] = eYo.NA
      }
    })
    if (toolbar.selectControl_) {
      toolbar.selectControl_.unlisten(toolbar.listenableKey)
      toolbar.selectControl_ = eYo.NA
    }
  },
})

