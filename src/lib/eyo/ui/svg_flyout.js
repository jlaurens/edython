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

goog.provide('eYo.Svg.Flyout')

goog.require('eYo.Svg')
goog.forwardDeclare('eYo.Flyout')

// Slot management


/**
 * Default CSS class of the flyout panel.
 * @type {string}
 */
eYo.Dom.FLYOUT_CSS_CLASS = goog.getCssName('eyo-flyout')


/**
 * Returns the CSS class to be applied to the root element.
 * @param {!eYo.Flyout} flyout
 * @return {string} Renderer-specific CSS class.
 * @override
 */
eYo.Dom.prototype.flyoutCssClass = function() {
  return eYo.Dom.FLYOUT_CSS_CLASS
}

/**
 * Initialize the flyout dom ressources.
 * @param {!eYo.Flyout} flyout
 * @return {!Element} The desk's dom repository.
 */
eYo.Dom.prototype.flyoutInit = eYo.Dom.decorateInit(function(flyout) {
  var dom = flyout.dom
  const div = flyout.targetBoard.dom.flyout_
  Object.defineProperty(dom, 'div_', { value: div })
  // flyout toolbar, on top of the flyout
  var cssClass = this.flyoutCssClass()
  var f = (type) => {
    var x = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, type)
    )
    div.appendChild(x)
    x.dataset && (x.dataset.type = `flyout ${type}`)
    return x
  }
  dom.toolbar_ = f('toolbar')
  dom.board_ = f('board')
  return dom
})

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.Flyout} flyout
 */
eYo.Dom.prototype.flyoutDispose = eYo.Dom.decorateDispose(function (flyout) {
  goog.dom.removeNode(flyout.dom.toolbarDiv_)
  goog.dom.removeNode(flyout.dom.boardDiv_)
})

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.Flyout} flyout
 */
eYo.Dom.prototype.flyoutUpdateMetrics = function (flyout) {
  var r = flyout.viewRect
  var div = flyout.dom.toolbarDiv_
  div.style.width = `${r.width} px`
  div.style.height = `${eYo.Flyout.TOOLBAR_HEIGHT} px`
  flyout.dom.boardDiv_
  div.style.y = `${eYo.Flyout.TOOLBAR_HEIGHT} px`
  div.style.width = `${r.width} px`
  div.style.height = `${r.height - eYo.Flyout.TOOLBAR_HEIGHT} px`
}

/**
 * Initializes the flyout SVG ressources.
 * @param {!eYo.Flyout} flyout
 */
eYo.Svg.prototype.flyoutInit = function(flyout) {
  if (flyout.dom) {
    return
  }
  var dom = eYo.Svg.superClass_.flyoutInit.call(this, flyout)
  var svg = dom.svg = Object.create(null)
  /*
  <svg class="eyo-flyout">
    <g class="eyo-flyout-canvas">
      <path class="eyo-flyout-background"/>
    </g>
    <g class="eyo-board">...</g>
  </svg>
  */
  var root = svg.root_ = eYo.Svg.newElementSvg(dom.boardDiv_, 'eyo-svg eyo-board')
  x.dataset && (x.dataset.type = 'flyout board')

  var background = svg.background_ = eYo.Svg.newElement('path', {
    class: 'eyo-flyout-background'
  }, root)
// Bad design: code reuse: options
  this.addTooltip(background, eYo.Tooltip.getTitle('flyout'), {
    position: 'right',
    theme: 'light bordered',
    flipDuration: 0,
    inertia: true,
    arrow: true,
    animation: 'perspective',
    duration: [600, 300],
    delay: [750, 0],
    popperOptions: {
      modifiers: {
        preventOverflow: {
          enabled: true
        }
      }
    },
    onShow: x => {
      eYo.Tooltip.hideAll(background)
    }
  })
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {!eYo.Flyout} flyout
 */
eYo.Svg.prototype.flyoutDispose = eYo.Dom.decorateDispose(function (flyout) {
  var dom = flyout.dom
  goog.dom.removeNode(dom.svg.root_)
  dom.svg.root_ = null
  dom.svg = null
  eYo.Svg.superClass_.flyoutDispose.call(this, flyout)
})

/**
 * Set the display attribute.
 * @param {!eYo.Flyout} flyout
 * @param {Boolean} show
 */
eYo.Svg.prototype.flyoutDisplaySet = function (flyout, show) {
  !show && eYo.Tooltip.hideAll(flyout.dom.svg.root_)
  flyout.dom.svg.root_.style.display = show ? 'block' : 'none'
}

/**
 * Get the display attribute.
 * @param {!eYo.Flyout} flyout
 */
eYo.Svg.prototype.flyoutDisplayGet = function (flyout) {
  return flyout.dom.svg.root_.style.display !== 'none'
}

/**
 * Initializes the flyout toolbar SVG ressources.
 * @param {!eYo.FlyoutToolbar} flyoutToolbar
 */
eYo.Svg.prototype.flyoutToolbarInit = function(ftb) {
  if (ftb.dom) {
    return
  }
  var flyout = ftb.flyout
  var dom = this.basicInit(ftb)
  var svg = dom.svg
  /*
  <div class="eyo-flyout-toolbar">
    <div class="eyo-flyout-toolbar-general">
      <div class="eyo-flyout-select-general">
        ...
      </div>
      <div class="eyo-flyout-control">
        ...
      </div>
    </div>
    <div class="eyo-flyout-toolbar-module">
      <div class="eyo-flyout-select-module">
        ...
      </div>
    </div>
  </div>
  */
  var cssClass = this.flyoutCssClass()
  dom.control_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'control')
  )
  svg.root_ = eYo.Svg.newElementSvg(dom.control_, goog.getCssName(cssClass, 'control-image'))
  svg.pathControl_ = eYo.Svg.newElement('path', {
    id: 'p-flyout-control'
  }, dom.svg)
  if (eYo.App && eYo.App.flyoutDropDown) {
    dom.select_general_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select'),
      eYo.App.flyoutDropDown
    )
  } else if (eYo.App && eYo.App.flyoutDropDownGeneral && eYo.App.flyoutDropDownModule) {
    dom.select_general_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-general'),
      eYo.App.flyoutDropDownGeneral
    )
    dom.select_module_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-module'),
      eYo.App.flyoutDropDownModule
    )
  } else {
    dom.select_general_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-general')
    )
    select = new goog.ui.Select(null, new eYo.Menu(), eYo.MenuButtonRenderer.getInstance())
    // select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'test'))
    // select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'basic'))
    select.addItem(new eYo.MenuItem(eYo.Msg.INTERMEDIATE, 'intermediate'))
    select.addItem(new eYo.MenuItem(eYo.Msg.ADVANCED, 'advanced'))
    select.addItem(new eYo.MenuItem(eYo.Msg.EXPERT, 'expert'))
    select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BRANCHING, 'branching'))
    select.addItem(new eYo.MenuItem(eYo.Msg.LOOPING, 'looping'))
    select.addItem(new eYo.MenuItem(eYo.Msg.FUNCTION, 'function'))
    select.setSelectedIndex(0)
    select.render(dom.select_general_)
    flyout.listenableKey = select.listen(
      goog.ui.Component.EventType.ACTION,
      flyout.doSelectGeneral,
      false,
      flyout
    )
    dom.select_module_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-module')
    )
    var select = new goog.ui.Select(null, new eYo.Menu(), eYo.MenuButtonRenderer.getInstance())
    // select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'test'))
    // select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'basic'))
    select.addItem(new eYo.MenuItem(eYo.Msg.INTERMEDIATE, 'intermediate'))
    select.addItem(new eYo.MenuItem(eYo.Msg.ADVANCED, 'advanced'))
    select.addItem(new eYo.MenuItem(eYo.Msg.EXPERT, 'expert'))
    select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BRANCHING, 'branching'))
    select.addItem(new eYo.MenuItem(eYo.Msg.LOOPING, 'looping'))
    select.addItem(new eYo.MenuItem(eYo.Msg.FUNCTION, 'function'))
    select.setSelectedIndex(0)
    select.render(dom.select_module_)
    flyout.listenableKey = select.listen(
      goog.ui.Component.EventType.ACTION,
      flyout.doSelectGeneral,
      false,
      flyout
    )
  }
  var div_general = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'toolbar-general'),
    dom.select_general_
  )
  var div_module = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'toolbar-module'),
    dom.select_module_
  )
  const div = this.flyout.desk.dom.div_.flyoutToolbar_
  Object.definePorperty(dom, 'div_', {
    get () { return div }
  })
  if (flyout.switcher_) {
    div.appendChild(flyout.switcher_)
    flyout.switcher_.style.left = '0px'
    flyout.switcher_.style.top = '0px'
  } else {
    div.appendChild(div_general)
    div.appendChild(div_module)
  }
  div.appendChild(dom.control_)
  var bound = dom.bound
  bound.mousedown = eYo.Dom.bindEvent(
    dom.control_,
    'mousedown',
    flyout,
    flyout.on_mousedown
  )
  bound.mouseenter = eYo.Dom.bindEvent(
    dom.control_,
    'mouseenter',
    flyout,
    flyout.on_mouseenter
  )
  bound.mouseleave = eYo.Dom.bindEvent(
    dom.control_,
    'mouseleave',
    flyout,
    flyout.on_mouseleave
  )
  bound.mouseup = eYo.Dom.bindEvent(
    dom.control_,
    'mouseup',
    flyout,
    flyout.on_mouseup
  )
}

/**
 * Initializes the flyout toolbar SVG ressources.
 * @param {!eYo.FlyoutToolbar} flyoutToolbar
 */
eYo.Svg.prototype.flyoutToolbarDispose = eYo.Dom.decorateDispose(function(ftb) {
  var dom = ftb.dom
  var div = dom.div_
  var fc
  while((fc = dom.div_.firstChild)) {
    myNode.removeChild(fc)
  }
  var svg = dom.svg
  goog.dom.removeNode(svg.group_)
  svg.group_ = null
})

/**
 * Update the view based on coordinates calculated in position().
 * @param {!eYo.Flyout} flyout
 */
eYo.Svg.prototype.flyoutPlace = function (flyout) {
  var rect = flyout.viewRect
  var div = flyout.dom.div_
  div.style.width = `${rect.width}px`
  div.style.height = `${rect.height}px`
  div.style.left = `${rect.x}px`
  div.style.top = `${rect.y}px`
  if (flyout.toolbar_) {
    flyout.toolbar_.place()
  }
  flyout.board_.resizePort()
  var board = flyout.targetBoard_
  if (board) {
    var scrollbar = board.scrollbar
    if (scrollbar) {
      if (scrollbar.hScroll) {
        scrollbar.hScroll.oldHostMetrics_ = null
      }
      if (scrollbar.vScroll) {
        scrollbar.vScroll.oldHostMetrics_ = null
      }
    }
    board.resizePort()
    board.trashcan.place()
  }
}

/**
 * Update the visible boundaries of the flyout.
 * @param {!eYo.Flyout} flyout
 * @private
 */
eYo.Svg.prototype.flyoutUpdate = function(flyout) {
  var width = flyout.width
  var height = flyout.height
  var top_margin = flyout.TOP_MARGIN
  var atRight = flyout.atRight
  // Decide whether to start on the left or right.
  var path = [`M ${atRight ? width : 0},${top_margin}`]
  // Top.
  path.push('h', atRight ? -width : width)
  // Side closest to board.
  path.push('v', Math.max(0, height - top_margin))
  // Bottom.
  path.push('h', atRight ? width : -width)
  path.push('z')
  flyout.dom.svg.background_.setAttribute('d', path.join(' '))
}

/**
 * Add listeners to a block that has been added to the flyout.
 * Listeners work only when the flyout authorizes it.
 * The 'rect' listeners have been removed.
 * @param {!eYo.Flyout} flyout
 */
eYo.Svg.prototype.flyoutRemoveAllBrickListeners = function(flyout) {
  // Delete all the event listeners.
  flyout.listeners_.forEach(l => eYo.Dom.unbindEvent(l))
  flyout.listeners_.length = 0
}

/**
 * Add listeners to a block that has been added to the flyout.
 * Listeners work only when the flyout authorizes it.
 * The 'rect' listeners have been removed.
 * @param {!eYo.Flyout} flyout
 * @param {!eYo.Brick} brick The block to add listeners for.
 */
eYo.Svg.prototype.flyoutAddListeners = function(flyout, brick) {
  var g = brick.dom.svg.group_
  flyout.listeners_.push(eYo.Dom.bindEvent(
    g,
    'mousedown',
    null,
    e => {
      var gesture = flyout.targetBoard_.getGesture(e)
      if (gesture) {
        gesture.startBrick = brick
        gesture.handleFlyoutStart(e, flyout)
      }
    }
  ))
  flyout.listeners_.push(eYo.Dom.bindEvent(
    g,
    'mouseover',
    brick,
    brick.addSelect
  ))
  flyout.listeners_.push(eYo.Dom.bindEvent(
    g,
    'mouseleave',
    brick,
    brick.removeSelect
  ))
  flyout.listeners_.push(eYo.Dom.bindEvent(
    g,
    'mouseout',
    brick,
    brick.removeSelect
  ))
}

/**
 * Add a `mouseover` listener to deselect all bricks.
 * @param {!eYo.Flyout} flyout
 */
eYo.Svg.prototype.flyoutListen_mouseover = function(flyout) {
  flyout.listeners_.push(
    eYo.Dom.bindEvent(
    flyout.dom.svg.background_,
    'mouseover',
    null,
    () => {
      flyout.board_.topBricks.forEach(b3k => b3k.removeSelect)
    }
  ))
}

/**
 * Add a `wheel` and `mousdown` listener to scroll.
 * @param {!eYo.Flyout} flyout
 */
eYo.Svg.prototype.flyoutBindScrollEvents = function(flyout) {
  var bound = flyout.dom.bound
  if (bound.drag_wheel) {
    return
  }
  var svg = flyout.dom.svg
  bound.drag_wheel = eYo.Dom.bindEvent(
    svg.group_,
    'wheel',
    null,
    this.flyoutOn_wheel.bind(flyout)
  )
  // Dragging the flyout up and down.
  bound.drag_mousedown = eYo.Dom.bindEvent(
    svg.background_,
    'mousedown',
    null,
    this.flyoutOn_mousedown.bind(flyout)
  )
}

/**
 * Mouse down on the flyout background.  Start a vertical scroll drag.
 * @param {!Event} e Mouse down event.
 * @private
 */
eYo.Svg.prototype.flyoutOn_mousedown = function(e) {
  var gesture = this.targetBoard_.getGesture(e)
  if (gesture) {
    gesture.handleFlyoutStart(e, this)
  }
}
