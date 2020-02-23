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

eYo.forwardDeclare('brick')

/**
 * Dom driver for boards.
 */
eYo.dom.makeDriverC9r('Brick', {
  /**
   * Initialize the board dom ressources.
   * @param {eYo.board} board
   * @return {!Element} The board's dom repository.
   */
  initUI (brick) {
    const dom = Brick.dom
    Object.defineProperty(dom, 'div_', {
      get () {
        return brick.owner.dom.board_
      }
    })
    dom.drag_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      'eyo-brick'
    )
    return dom
  },
  /**
   * Dispose of the desk dom resources.
   * @param {eYo.brick.Base} brick
   */
  disposeUI (brick) {
    if (brick.dom && brick.dom.div_) {
      goog.dom.removeNode(brick.dom.div_)
      brick.dom.div_ = null // do not remove this div from the dom
    }
  },
})
