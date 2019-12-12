/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('eYo.Svg')
eYo.require('eYo.Brick')

// eYo.forwardDeclare('eYo.Effect')

/**
 * Svg driver for brick effects
 */
eYo.Svg.makeDriverClass('Effect')

/**
 * Play some UI effects (sound, animation) when disposing of a brick.
 */
eYo.Svg.Effect.prototype.brickDispose = (() => {
  /*
  * Animate a cloned brick and eventually dispose of it.
  * @param {Element} clone SVG element to animate and dispose of.
  * @param {boolean} rtl True if RTL, false if LTR.
  * @param {Date} start Date of animation's start.
  * @param {number} boardScale Scale of board.
  * @private
  */
  var step = (clone, start, scale) => {
    var ms = new Date - start
    var percent = ms / 150
    if (percent > 1) {
      goog.dom.removeNode(clone)
      return
    }
    var x = clone.translateX_ +
      clone.bBox_.width * scale / 2 * percent
    var y = clone.translateY_ +
      clone.bBox_.height * scale * percent
    clone.setAttribute('transform',
      `translate(${x},${y}) scale(${(1 - percent) * scale})`)
    setTimeout(step, 10, clone, start, scale)
  }
  return function(brick) {
    var g = brick.dom.svg.group_
    var w = brick.board
    var xy = w.ui_driver_mngr.boardElementWhere(/** @type {!Element} */ g)
    // Deeply clone the current brick.
    var clone = g.cloneNode(true)
    clone.translateX_ = xy.x
    clone.translateY_ = xy.y
    clone.setAttribute('transform',
      `translate(${clone.translateX_},${clone.translateY_})`)
    w.dom.svg.root_.appendChild(clone)
    clone.bBox_ = clone.getBBox()
    // Start the animation.
    step(clone, new Date, ws.scale)
  }
})()


/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * @param {eYo.Brick.Dflt} brick  the brick the driver acts on
 */
eYo.Svg.Effect.prototype.brickConnect = (() => {
  /*
   * Expand a ripple around a connection.
   * @param {Element} ripple Element to animate.
   * @param {Date} start Date of animation's start.
   * @param {number} scale Scale of board.
   * @private
   */
  var step = (ripple, start, scale) => {
    var ms = new Date() - start
    var percent = ms / 200
    if (percent > 1) {
      goog.dom.removeNode(ripple)
    } else {
      ripple.style.opacity = 8 * Math.pow(percent, 2) * Math.pow(1 - percent, 2)
      pid_ = setTimeout(step, 10, ripple, start, scale)
    }
  }
  return function (brick) {
    var g = brick.dom.svg.group_
    var w = brick.board
    var xy = w.ui_driver_mngr.boardElementWhere(/** @type {!Element} */ g)
    if (brick.isExpr) {
      var h = brick.span.height * w.scale / 2
      var ripple = eYo.Svg.newElement(
        'circle',
        {
          class: 'bricklyHighlightedConnectionPathH',
          cx: xy.x,
          cy: xy.y + h,
          r: 2 * h / 3
        },
        w.dom.svg.root_
      )
    } else {
    // Determine the absolute coordinates of the inferior brick.
      var steps = eYo.Svg.magnetHighlightedPath_.attributes['d'].value
      ripple = eYo.Svg.newElement(
        'path',
        {
          class: 'bricklyHighlightedConnectionPath',
          d: steps,
          transform: `translate(${xy.x},${xy.y})`
        },
        w.dom.svg.root_
      )
    }
    // Start the animation.
    step(ripple, new Date(), w.scale)
  }
})()

/**
 * Play some UI effects (sound, animation) when disconnecting a brick.
 */
eYo.Svg.Effect.prototype.brickDisconnect = (() => {
  /*
   * Animate a brief wiggle of a disconnected brick.
   * @param {Element} group SVG element to animate.
   * @param {number} magnitude Maximum degrees skew (reversed for RTL).
   * @param {Date} start Date of animation's start.
   * @private
   */
  var step = function (magnitude, start) {
    var svg = this.svg_
    var g = this.group_

    var DURATION = 200  // Milliseconds.
    var WIGGLES = 3  // Half oscillations.

    var ms = new Date - start
    var percent = ms / DURATION

    if (percent > 1) {
      svg.skew = ''
    } else {
      var skew = Math.round(
          Math.sin(percent * Math.PI * WIGGLES) * (1 - percent) * magnitude);
          svg.skew = `skewX(${skew})`
      this.pid_ = setTimeout(step, 10, magnitude, start)
    }
    g.setAttribute('transform', svg.translate + svg.skew)
  }
  return function(brick) {
    var w = brick.board
    brick.audio.play('disconnect')
    if (w.scale < 1) {
      return  // Too small to care about visual effects.
    }
    // Horizontal distance for bottom of brick to wiggle.
    var DISPLACEMENT = 10
    // Scale magnitude of skew to eight of brick.
    var height = brick.size.height
    var magnitude = - Math.atan(DISPLACEMENT / height) / Math.PI * 180
    // Start the animation.
    this.svg_ = brick.dom.svg
    this.group_ = this.svg_.group_
    step.call(this, magnitude, new Date)
  }
})()

/**
 * Stop the disconnect UI animation immediately.
 * @private
 */
eYo.Svg.Effect.prototype.brickStop = function() {
  var svg = this.svg_
  if (svg) {
    var g = this.group_
    clearTimeout(this.pid_)
    this.pid_ = 0
    svg.skew = ''
    g.setAttribute('transform', svg.translate)
    this.svg_ = this.group_ = null
  }
}

