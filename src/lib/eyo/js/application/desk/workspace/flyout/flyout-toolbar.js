/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Flyout toolbar extension, in progress.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * Class for a flyout toolbar.
 * @constructor
 */
eYo.flyout.newC9r('Toolbar', {
  init (flyout, switcher) {
    this.flyout_ = flyout
    this.switcher_ = switcher || this.app.flyoutToolbarSwitcher
    if (this.switcher_) {
      eYo.dom.removeNode(this.switcher_)
    }
  },
})

/**
 * Creates the flyout toolbar's DOM.
 * @param {Object} dom helper.
 * @return {!Element} The flyout toolbar's div.
 */
eYo.flyout.Toolbar_p.doSelectGeneral = function (e) {
  var board = this.flyout_.desk.board
  if (board && this.selectControl_) {
    var category = this.selectControl_.getValue()
    var list = eYo.library.DATA[category]
    if (list.length) {
      this.flyout_.show(list)
    }
  }
}

// toolbar height
eYo.flyout.TOOLBAR_MARGIN = eYo.padding.t
eYo.flyout.TOOLBAR_HEIGHT = 2 * (eYo.font.lineHeight + 2 * eYo.flyout.TOOLBAR_MARGIN)

eYo.flyout.TOOLBAR_BUTTON_RADIUS = eYo.flyout.TOOLBAR_HEIGHT / 4
// left margin
eYo.flyout.TOOLBAR_BUTTON_MARGIN = eYo.flyout.TOOLBAR_BUTTON_RADIUS / 8

/**
 * Slide out.
 * @param {Event} e Mouse up event.
 * @private
 */
eYo.flyout.Toolbar_p.onButtonDown_ = function(e) {
  this.isDown = true
  window.addEventListener('mouseup', this.notOnButtonUp_)
  this.onButtonEnter_(e)
  eYo.dom.gobbleEvent(e)
}

/**
 * That is catched when the flyout has the focus.
 * @param {Event} e Mouse up event.
 * @private
 */
eYo.flyout.Toolbar_p.onButtonEnter_ = function(e) {
  if (this.isDown) {
    eYo.dom.classlist.add(this.control_, 'eyo-flash')
  }
}

/**
 * Unhilight.
 * @param {Event} e Mouse up event.
 * @private
 */
eYo.flyout.Toolbar_p.onButtonLeave_ = function(e) {
  eYo.dom.classlist.remove(this.control_, 'eyo-flash')
}

/**
 * Slide out.
 * @param {Event} e Mouse up event.
 * @private
 */
eYo.flyout.Toolbar_p.onButtonUp_ = function(e) {
  window.removeEventListener('mouseup', this.notOnButtonUp_)
  if (this.isDown) {
    this.isDown = false
    var el = document.querySelector('#eyo-flyout-dropdown .dropdown.show')
    if (el) {
      eYo.dom.classlist.remove('show')
    }
    this.flyout_.slide()
    this.onButtonLeave_(e)
    this.app.cancelMotion()
    eYo.dom.gobbleEvent(e)
  }
};
// Sometimes this error has poped up.
// console.error(`Uncaught TypeError: this.onButtonLeave_ is not a function
// at eYo.flyout.Toolbar.notOnButtonUp_`)

/**
 * Mouse up catcher.
 * @param {Event} e Mouse up event.
 * @private
 */
eYo.flyout.Toolbar_p.notOnButtonUp_ = function(e) {
  window.removeEventListener('mouseup', this.notOnButtonUp_)
  this.onButtonLeave_(e)
  this.app.cancelMotion()
  eYo.dom.gobbleEvent(e)
}

/**
 * Resize.
 * @param {Float | eYo.geom.Size} width.
 * @param {Float} [height.]
 * @private
 */
eYo.flyout.Toolbar_p.layout = function(width, height) {
  if (eYo.isDef(width.width)) {
    height = width.height || 0
    width = width.width
  }
  var height = eYo.flyout.TOOLBAR_HEIGHT
  var margin = eYo.flyout.TOOLBAR_MARGIN
  var big_radius = 1.25 * eYo.geom.REM
  var radius = 1.125 * eYo.geom.REM
  var h = radius * 0.75

  this.div_.style.width = width + 'px'
  // this.div_.style.height = height + 'px'

  var path = this.pathControl_
  if (this.flyout_.closed) {
    path.setAttribute('d',
      `M ${margin + h + this.flyout_.CORNER_RADIUS},${radius} l${-h},${-radius/2} l 0,${radius} z`
    )
  } else {
    path.setAttribute('d',
      `M ${this.flyout_.CORNER_RADIUS},${radius} l${h},${-radius/2} l 0,${radius} z`
    )
  }
}

/**
 * Update the view based on coordinates calculated in position().
 * @param {number} width The computed width of the flyout's SVG group
 * @param {number} height The computed height of the flyout's SVG group.
 * @param {number} x The computed x origin of the flyout's SVG group.
 * @param {number} y The computed y origin of the flyout's SVG group.
 * @private
 */
eYo.flyout.Toolbar_p.positionAt_ = function(width, height, x, y) {
  this.ui_driver.positionAt(this, width, height, x, y)
  this.div_.style.left = x + 'px'
  this.div_.style.top = y + 'px'
}
