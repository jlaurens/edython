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

goog.require('eYo.Svg')

goog.provide('eYo.Svg.Board')

goog.forwardDeclare('eYo.Board')

/**
 * Svg driver for boards.
 */
eYo.Svg.makeSubclass('Board')

/**
 * Initialize the board dom ressources.
 * @param {!eYo.Board} board
 * @return {!Element} The board's dom repository.
 */
eYo.Dom.Board.prototype.initUI = eYo.Dom.Decorate.initUI(function(board) {
  const dom = board.dom
  Object.defineProperty(dom, 'div_', {
    get () {
      return board.owner.dom.board_
    }
  })
  var d1 = dom.drag_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    'eyo-board-drag'
  )
  var style = d1.style
  style.left = style.top = style.width = style.height = '0px'
  style.overflow = 'visible'
  style.position = 'absolute'
  dom.div_.appendChild(d1)
  var d2 = dom.scale_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    'eyo-board-scale'
  )
  var stl = d2.style
  stl.width = stl.height = '0px'
  stl.overflow = 'visible'
  stl.position = 'absolute'
  d1.appendChild(d2)
  var d3 = dom.content_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    'eyo-board-content'
  )
  stl = d3.style
  stl.overflow = 'visible'
  stl.position = 'absolute'
  d2.appendChild(d3)
  if (board.isMain) {
    const flyout = dom.flyout_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      'eyo-flyout'
    )
    stl = flyout.style
    stl.position = 'absolute'
    stl.display = 'none'
    dom.div_.appendChild(flyout)
    d1 = dom.board_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      'eyo-board-dragger'
    )
    dom.div_.appendChild(d1)
    stl = d1.style
    stl.display = 'none'
    stl.background = 'transparent'
  }
  return dom
})

/**
 * Dispose of the desk dom resources.
 * @param {!eYo.Board} board
 */
eYo.Dom.Board.prototype.disposeUI = eYo.Dom.Decorate.disposeUI(function(board) {
  board.dom.div_ = null // do not remove this div from the dom
})
