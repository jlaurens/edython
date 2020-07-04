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

eYo.forward('brick')

/**
 * Dom driver for boards.
 */
eYo.dom.newDrvrC9r('Brick', {
  /**
   * Initialize the board dom ressources.
   * @param {eYo.board} board
   * @return {!Element} The board's dom repository.
   */
  initUI (brick) {
    let dom = brick.dom
    Object.defineProperty(dom, 'div_', {
      get () {
        return brick.owner.dom.board_
      }
    })
    dom.drag_ = eYo.dom.createDom(
      eYo.dom.TagName.DIV,
      'eyo-brick'
    )
    return dom
  },
  /**
   * Dispose of the desk dom resources.
   * @param {eYo.brick.BaseC9r} brick
   */
  disposeUI (brick) {
    if (brick.dom && brick.dom.div_) {
      eYo.dom.removeNode(brick.dom.div_)
      brick.dom.div_ = null // do not remove this div from the dom
    }
  },
})
