/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Desk rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * Dom driver for boards.
 */
eYo.dom.newDriverC9r('Desk', {
  /**
   * Initialize the desk dom ressources.
   * @param {eYo.view.Desk} desk
   * @param {Function} [f]
   * @return {!Element} The desk's dom repository.
   */
  initUI (desk) {
    var dom = desk.dom
    var options = desk.options
    var container = options.container
    // no UI if no valid container
    if (eYo.isStr(container)) {
      container = options.container = document.getElementById(container) ||
          document.querySelector(container)
    }
    if (!eYo.dom.contains(document, container)) {
      throw 'Error: container is not in current document.'
    }
    var div = dom.div_ || (dom.div_= container)
    eYo.dom.bindEvent(
      container,
      'contextmenu',
      e => eYo.dom.isTargetInput(e) || e.preventDefault()
    )
    // var d = dom.div_ = eYo.dom.createDom(
    //   eYo.dom.TagName.DIV,
    //   'eyo-desk'
    // )
    // var stl = d.style
    // stl.overflow = 'hidden'
    // stl.position = 'absolute'
    // stl.width = '100%'
    // stl.height = '100%'
    // div.appendChild(d)
  },
  /**
   * Dispose of the desk dom resources.
   * @param {eYo.view.Desk} desk
   */
  disposeUI (desk) {
    var dom = desk.dom
    eYo.dom.removeNode(dom.div_)
    dom.div_ = null
  },
})

/**
 * Place the desk div.
 * @param {eYo.view.Desk} desk
 */
eYo.dom.Desk_p.place = function(desk) {
}
