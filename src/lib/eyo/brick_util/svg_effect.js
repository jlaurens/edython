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

goog.provide('eYo.Svg.Effect')

goog.require('eYo.Svg')
goog.require('eYo.Brick')

/**
 * Play some UI effects (sound, animation) when disposing of a brick.
 */
eYo.Svg.prototype.brickDisposeEffect = (() => {
  /*
  * Animate a cloned brick and eventually dispose of it.
  * @param {!Element} clone SVG element to animate and dispose of.
  * @param {boolean} rtl True if RTL, false if LTR.
  * @param {!Date} start Date of animation's start.
  * @param {number} workspaceScale Scale of workspace.
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
    var svg = brick.ui.svg
    var w = brick.workspace
    var xy = w.getSvgXY(/** @type {!Element} */ (svg.group_))
    // Deeply clone the current brick.
    var clone = svg.group_.cloneNode(true)
    clone.translateX_ = xy.x
    clone.translateY_ = xy.y
    clone.setAttribute('transform',
      `translate(${clone.translateX_},${clone.translateY_})`)
    w.getParentSvg().appendChild(clone)
    clone.bBox_ = clone.getBBox()
    // Start the animation.
    step(clone, new Date, ws.scale)
  }
})()


/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * @param {!eYo.Brick} brick  the brick the driver acts on
 */
eYo.Svg.prototype.brickConnectEffect = (() => {
  var pid, g // shared private variables
  /*
   * Expand a ripple around a connection.
   * @param {!Element} ripple Element to animate.
   * @param {!Date} start Date of animation's start.
   * @param {number} scale Scale of workspace.
   * @private
   */
  var connectStep = (ripple, start, scale) => {
    var ms = new Date() - start
    var percent = ms / 200
    if (percent > 1) {
      goog.dom.removeNode(ripple)
    } else {
      ripple.style.opacity = 8 * Math.pow(percent, 2) * Math.pow(1 - percent, 2)
      pid = setTimeout(connectStep, 10, ripple, start, scale)
    }
  }
  /*
   * Animate a brief wiggle of a disconnected brick.
   * @param {!Element} group SVG element to animate.
   * @param {number} magnitude Maximum degrees skew (reversed for RTL).
   * @param {!Date} start Date of animation's start.
   * @private
   */
  disconnectStep = (magnitude, start) => {
    var DURATION = 200;  // Milliseconds.
    var WIGGLES = 3;  // Half oscillations.

    var ms = new Date - start
    var percent = ms / DURATION

    if (percent > 1) {
      g.skew_ = ''
    } else {
      var skew = Math.round(
          Math.sin(percent * Math.PI * WIGGLES) * (1 - percent) * magnitude);
      g.skew_ = 'skewX(' + skew + ')'
      pid = setTimeout(disconnectStep, 10, magnitude, start)
    }
    g.setAttribute('transform', g.translate_ + g.skew_)
  }

  /**
   * Play some UI effects (sound, animation) when disconnecting a brick.
   */
  eYo.Svg.prototype.brickDisconnectEffect = function(brick) {
    var w = brick.workspace
    w.audioManager.play('disconnect')
    if (w.scale < 1) {
      return  // Too small to care about visual effects.
    }
    // Horizontal distance for bottom of brick to wiggle.
    var DISPLACEMENT = 10
    // Scale magnitude of skew to eight of brick.
    var height = this.brick_.size.height
    var magnitude = - Math.atan(DISPLACEMENT / height) / Math.PI * 180
    // Start the animation.
    g = brick.ui.svg.group_
    disconnectStep(magnitude, new Date)
  }

  /**
   * Stop the disconnect UI animation immediately.
   * @private
   */
  eYo.Svg.prototype.disconnectStop = function() {
    if (g) {
      clearTimeout(pid)
      pid = 0
      g.skew_ = ''
      g.setAttribute('transform', g.translate_)
      g = null
    }
  }

  return function (brick) {
    var svg = brick.ui.svg
    var w = brick.workspace
    var xy = w.getSvgXY(/** @type {!Element} */ (svg.group_))
    if (brick.out_m) {
      var h = svg.height * w.scale / 2
      var ripple = eYo.Svg.newElement('circle',
        {class: 'bricklyHighlightedConnectionPathH', 'cx': xy.x, 'cy': xy.y + h, 'r': 2 * h / 3},
        w.getParentSvg())
    } else {
    // Determine the absolute coordinates of the inferior brick.
      var steps = eYo.Svg.magnetHighlightedPath_.attributes['d'].value
      ripple = eYo.Svg.newElement('path',
        {class: 'bricklyHighlightedConnectionPath',
          d: steps,
          transform: `translate(${xy.x},${xy.y})`},
        w.getParentSvg())
    }
    // Start the animation.
    connectStep(ripple, new Date(), w.scale)
  }
})()
