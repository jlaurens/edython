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

eYo.forwardDeclare('Flyout')
eYo.forwardDeclare('flyoutToolbar')

/**
 * Svg driver for the flyout
 */
eYo.svg.makeDriverC9r('Flyout', {
  /**
   * Initializes the flyout SVG ressources.
   * @param {eYo.view.Flyout} flyout
   */
  initUI (flyout) {
    var dom = flyout.dom
    var svg = dom.svg = Object.create(null)
    /*
    <svg class="eyo-flyout">
      <g class="eyo-flyout-canvas">
        <path class="eyo-flyout-background"/>
      </g>
      <g class="eyo-board">...</g>
    </svg>
    */
    var root = svg.root_ = eYo.svg.newElementSvg(dom.boardDiv_, 'eyo-svg eyo-board')
    x.dataset && (x.dataset.type = 'flyout board')

    var background = svg.background_ = eYo.svg.newElement('path', {
      class: 'eyo-flyout-background'
    }, root)
  // Bad design: code reuse: options
    this.addTooltip(background, eYo.tooltip.getTitle('Flyout'), {
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
        eYo.tooltip.hideAll(background)
      }
    })
  },
  /**
   * Dispose of the given slot's rendering resources.
   * @param {eYo.view.Flyout} flyout
   */
  disposeUI (flyout) {
    var dom = flyout.dom
    goog.dom.removeNode(dom.svg.root_)
    dom.svg.root_ = null
    dom.svg = null
  },
})

/**
 * Set the display attribute.
 * @param {eYo.view.Flyout} flyout
 * @param {Boolean} show
 */
eYo.svg.Flyout.prototype.displaySet = function (flyout, show) {
  !show && eYo.tooltip.hideAll(flyout.dom.svg.root_)
  flyout.dom.svg.root_.style.display = show ? 'block' : 'none'
}

/**
 * Get the display attribute.
 * @param {eYo.view.Flyout} flyout
 */
eYo.svg.Flyout.prototype.displayGet = function (flyout) {
  return flyout.dom.svg.root_.style.display !== 'none'
}

/**
 * Svg driver for the flyout toolbar.
 */
eYo.svg.makeDriverC9r('FlyoutToolbar', {
  /**
   * Initializes the flyout toolbar SVG ressources.
   * @param {eYo.view.FlyoutToolbar} flyoutToolbar
   */
  initUI (ftb) {
    if (ftb.dom) {
      return
    }
    var flyout = ftb.flyout
    var dom = this._initUI(ftb)
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
    var cssClass = this.cssClass()
    dom.control_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'control')
    )
    svg.root_ = eYo.svg.newElementSvg(dom.control_, goog.getCssName(cssClass, 'control-image'))
    svg.pathControl_ = eYo.svg.newElement('path', {
      id: 'p-flyout-control'
    }, dom.svg)
    if (eYo.app.Base && ftb.app.flyoutDropDown) {
      dom.select_general_ = goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName(cssClass, 'select'),
        ftb.app.flyoutDropDown
      )
    } else if (eYo.app.Base && ftb.app.flyoutDropDownGeneral && ftb.app.flyoutDropDownModule) {
      dom.select_general_ = goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName(cssClass, 'select-general'),
        ftb.app.flyoutDropDownGeneral
      )
      dom.select_module_ = goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName(cssClass, 'select-module'),
        ftb.app.flyoutDropDownModule
      )
    } else {
      dom.select_general_ = goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName(cssClass, 'select-general')
      )
      select = new goog.ui.Select(null, new eYo.Menu(), eYo.menuButtonRenderer.getInstance())
      // select.addItem(new eYo.MenuItem(eYo.msg.BASIC, 'test'))
      // select.addItem(new eYo.Separator())
      select.addItem(new eYo.MenuItem(eYo.msg.BASIC, 'basic'))
      select.addItem(new eYo.MenuItem(eYo.msg.INTERMEDIATE, 'intermediate'))
      select.addItem(new eYo.MenuItem(eYo.msg.ADVANCED, 'advanced'))
      select.addItem(new eYo.MenuItem(eYo.msg.EXPERT, 'expert'))
      select.addItem(new eYo.Separator())
      select.addItem(new eYo.MenuItem(eYo.msg.BRANCHING, 'branching'))
      select.addItem(new eYo.MenuItem(eYo.msg.LOOPING, 'looping'))
      select.addItem(new eYo.MenuItem(eYo.msg.FUNCTION, 'function'))
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
      var select = new goog.ui.Select(null, new eYo.Menu(), eYo.menuButtonRenderer.getInstance())
      // select.addItem(new eYo.MenuItem(eYo.msg.BASIC, 'test'))
      // select.addItem(new eYo.Separator())
      select.addItem(new eYo.MenuItem(eYo.msg.BASIC, 'basic'))
      select.addItem(new eYo.MenuItem(eYo.msg.INTERMEDIATE, 'intermediate'))
      select.addItem(new eYo.MenuItem(eYo.msg.ADVANCED, 'advanced'))
      select.addItem(new eYo.MenuItem(eYo.msg.EXPERT, 'expert'))
      select.addItem(new eYo.Separator())
      select.addItem(new eYo.MenuItem(eYo.msg.BRANCHING, 'branching'))
      select.addItem(new eYo.MenuItem(eYo.msg.LOOPING, 'looping'))
      select.addItem(new eYo.MenuItem(eYo.msg.FUNCTION, 'function'))
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
    bound.mousedown = eYo.dom.bindEvent(
      dom.control_,
      'mousedown',
      flyout,
      flyout.on_mousedown.bind(flyout)
    )
    bound.mouseenter = eYo.dom.bindEvent(
      dom.control_,
      'mouseenter',
      flyout,
      flyout.on_mouseenter.bind(flyout)
    )
    bound.mouseleave = eYo.dom.bindEvent(
      dom.control_,
      'mouseleave',
      flyout,
      flyout.on_mouseleave.bind(flyout)
    )
    bound.mouseup = eYo.dom.bindEvent(
      dom.control_,
      'mouseup',
      flyout,
      flyout.on_mouseup.bind(flyout)
    )
  },
  /**
   * Initializes the flyout toolbar SVG ressources.
   * @param {eYo.view.FlyoutToolbar} flyoutToolbar
   */
  disposeUI (ftb) {
    var dom = ftb.dom
    var div = dom.div_
    var fc
    while((fc = dom.div_.firstChild)) {
      myNode.removeChild(fc)
    }
    var svg = dom.svg
    goog.dom.removeNode(svg.group_)
    svg.group_ = null
  },
})

/**
 * Update the view based on coordinates calculated in position().
 * @param {eYo.view.Flyout} flyout
 */
eYo.svg.Flyout.prototype.place = function (flyout) {
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
  var board = flyout.desk.board
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
    board.trashCan.place()
  }
}

/**
 * Update the visible boundaries of the flyout.
 * @param {eYo.view.Flyout} flyout
 * @private
 */
eYo.svg.Flyout.prototype.update = function(flyout) {
  var width = flyout.width
  var height = flyout.height
  var top_margin = eYo.view.Flyout.TOP_MARGIN
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
 * @param {eYo.view.Flyout} flyout
 */
eYo.svg.Flyout.prototype.removeAllBrickListeners = function(flyout) {
  // Delete all the event listeners.
  flyout.listeners_.forEach(l => eYo.dom.unbindEvent(l))
  flyout.listeners_.length = 0
}

/**
 * Add listeners to a block that has been added to the flyout.
 * Listeners work only when the flyout authorizes it.
 * The 'rect' listeners have been removed.
 * @param {eYo.view.Flyout} flyout
 * @param {eYo.brick.Base} brick The block to add listeners for.
 */
eYo.svg.Flyout.prototype.addListeners = function(flyout, brick) {
  var g = brick.dom.svg.group_
  flyout.listeners_.push(eYo.dom.bindEvent(
    g,
    'mousedown',
    null,
    e => flyout.app.motion.handleFlyoutStart(e, flyout, brick)
  ))
  flyout.listeners_.push(eYo.dom.bindEvent(
    g,
    'mouseover',
    brick,
    brick.selectAdd
  ))
  flyout.listeners_.push(eYo.dom.bindEvent(
    g,
    'mouseleave',
    brick,
    brick.focusRemove
  ))
  flyout.listeners_.push(eYo.dom.bindEvent(
    g,
    'mouseout',
    brick,
    brick.focusRemove
  ))
}

/**
 * Add a `mouseover` listener to deselect all bricks.
 * @param {eYo.view.Flyout} flyout
 */
eYo.svg.Flyout.prototype.listen_mouseover = function(flyout) {
  flyout.listeners_.push(
    eYo.dom.bindEvent(
    flyout.dom.svg.background_,
    'mouseover',
    null,
    () => {
      flyout.board_.topBricks.forEach(b3k => b3k.focusRemove)
    }
  ))
}

/**
 * Add a `wheel` and `mousdown` listener to scroll.
 * @param {eYo.view.Flyout} flyout
 */
eYo.svg.Flyout.prototype.bindScrollEvents = function(flyout) {
  var bound = flyout.dom.bound
  if (bound.drag_wheel) {
    return
  }
  var svg = flyout.dom.svg
  bound.drag_wheel = eYo.dom.bindEvent(
    svg.group_,
    'wheel',
    null,
    this.on_wheel.bind(flyout)
  )
  // Dragging the flyout up and down.
  bound.drag_mousedown = eYo.dom.bindEvent(
    svg.background_,
    'mousedown',
    null,
    this.on_mousedown.bind(flyout)
  )
}

/**
 * Mouse down on the flyout background.  Start a vertical scroll drag.
 * @param {Event} e Mouse down event.
 * @private
 */
eYo.svg.Flyout.prototype.on_mousedown = function(e) {
  this.app.motion.handleFlyoutStart(e, this)
}
