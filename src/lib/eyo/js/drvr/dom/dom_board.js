/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Board rendering driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.forward('board')

/**
 * Dom driver for boards.
 */
eYo.dom.newDrvrC9r('Board', {
  /**
   * Initialize the board dom ressources.
   * @param {eYo.board} board
   * @return {!Element} The board's dom repository.
   */
  initUI (board) {
    const dom = board.dom
    Object.defineProperty(dom, 'div_', {
      get () {
        return board.owner.dom.board_
      }
    })
    var d1 = dom.drag_ = eYo.dom.createDom(
      eYo.dom.TagName.DIV,
      'eyo-board-drag'
    )
    var style = d1.style
    style.left = style.top = style.width = style.height = '0px'
    style.overflow = 'visible'
    style.position = 'absolute'
    dom.div_.appendChild(d1)
    var d2 = dom.scale_ = eYo.dom.createDom(
      eYo.dom.TagName.DIV,
      'eyo-board-scale'
    )
    var stl = d2.style
    stl.width = stl.height = '0px'
    stl.overflow = 'visible'
    stl.position = 'absolute'
    d1.appendChild(d2)
    var d3 = dom.content_ = eYo.dom.createDom(
      eYo.dom.TagName.DIV,
      'eyo-board-content'
    )
    stl = d3.style
    stl.overflow = 'visible'
    stl.position = 'absolute'
    d2.appendChild(d3)
    if (board.isMain) {
      const flyout = dom.flyout_ = eYo.dom.createDom(
        eYo.dom.TagName.DIV,
        'eyo-flyout'
      )
      stl = flyout.style
      stl.position = 'absolute'
      stl.display = 'none'
      dom.div_.appendChild(flyout)
      d1 = dom.board_ = eYo.dom.createDom(
        eYo.dom.TagName.DIV,
        'eyo-board-dragger'
      )
      dom.div_.appendChild(d1)
      stl = d1.style
      stl.display = 'none'
      stl.background = 'transparent'
    }
    return dom
  },
  /**
   * Dispose of the desk dom resources.
   * @param {eYo.board} board
   */
  disposeUI (board) {
    board.dom.div_ = null // do not remove this div from the dom
  }
})
