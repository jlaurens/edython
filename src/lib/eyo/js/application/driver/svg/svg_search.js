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

eYo.require('eYo.Dom.Search')

eYo.provide('eYo.Svg.Search')
eYo.provide('eYo.Svg.SearchToolbar')

eYo.forwardDeclare('eYo.Search')
// eYo.forwardDeclare('eYo.SearchToolbar')

/**
 * Svg driver for the search pane.
 */
eYo.Svg.makeDriverClass('Search', {
    /**
   * Initializes the search SVG ressources.
   * @param {!eYo.Search} search
   */
  initUI (search) {
    if (search.dom) {
      return
    }
    var dom = eYo.Svg.superClass_.searchInit.call(this, search)
    var svg = dom.svg = Object.create(null)
    /*
    <svg class="eyo-search">
      <g class="eyo-search-canvas">
        <path class="eyo-search-background"/>
      </g>
      <g class="eyo-board">...</g>
    </svg>
    */
    var root = svg.root_ = eYo.Svg.newElementSvg(dom.boardDiv_, 'eyo-svg eyo-board')
    x.dataset && (x.dataset.type = 'search board')

    var background = svg.background_ = eYo.Svg.newElement('path', {
      class: 'eyo-search-background'
    }, root)
  // Bad design: code reuse: options
    this.addTooltip(background, eYo.Tooltip.getTitle('search'), {
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
  },
  /**
   * Dispose of the given slot's rendering resources.
   * @param {!eYo.Search} search
   */
  disposeUI (search) {
    var dom = search.dom
    goog.dom.removeNode(dom.svg.root_)
    dom.svg.root_ = null
    dom.svg = null
    eYo.Svg.superClass_.searchDispose.call(this, search)
  }
})

/**
 * Set the display attribute.
 * @param {!eYo.Search} search
 * @param {Boolean} show
 */
eYo.Svg.Search.prototype.displaySet = function (search, show) {
  !show && eYo.Tooltip.hideAll(search.dom.svg.root_)
  search.dom.svg.root_.style.display = show ? 'block' : 'none'
}

/**
 * Get the display attribute.
 * @param {!eYo.Search} search
 */
eYo.Svg.Search.prototype.displayGet = function (search) {
  return search.dom.svg.root_.style.display !== 'none'
}

/**
 * Update the view based on coordinates calculated in position().
 * @param {!eYo.Search} search
 */
eYo.Svg.Search.prototype.place = function (search) {
  var rect = search.viewRect
  var div = search.dom.div_
  div.style.width = `${rect.width}px`
  div.style.height = `${rect.height}px`
  div.style.left = `${rect.x}px`
  div.style.top = `${rect.y}px`
  if (search.toolbar_) {
    search.toolbar_.place()
  }
  search.board_.resizePort()
  var board = search.desk.board
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
 * Update the visible boundaries of the search.
 * @param {!eYo.Search} search
 * @private
 */
eYo.Svg.Search.prototype.update = function(search) {
  var width = search.width
  var height = search.height
  var top_margin = eYo.Search.TOP_MARGIN
  var atRight = search.atRight
  // Decide whether to start on the left or right.
  var path = [`M ${atRight ? width : 0},${top_margin}`]
  // Top.
  path.push('h', atRight ? -width : width)
  // Side closest to board.
  path.push('v', Math.max(0, height - top_margin))
  // Bottom.
  path.push('h', atRight ? width : -width)
  path.push('z')
  search.dom.svg.background_.setAttribute('d', path.join(' '))
}

/**
 * Add listeners to a block that has been added to the search.
 * Listeners work only when the search authorizes it.
 * The 'rect' listeners have been removed.
 * @param {!eYo.Search} search
 */
eYo.Svg.Search.prototype.removeAllBrickListeners = function(search) {
  // Delete all the event listeners.
  search.listeners_.forEach(l => eYo.Dom.unbindEvent(l))
  search.listeners_.length = 0
}

/**
 * Add listeners to a block that has been added to the search.
 * Listeners work only when the search authorizes it.
 * The 'rect' listeners have been removed.
 * @param {!eYo.Search} search
 * @param {!eYo.Brick.Dflt} brick The block to add listeners for.
 */
eYo.Svg.Search.prototype.addListeners = function(search, brick) {
  var g = brick.dom.svg.group_
  search.listeners_.push(eYo.Dom.bindEvent(
    g,
    'mousedown',
    null,
    e => eYo.app.motion.handleFlyoutStart(e, search, brick)
  ))
  search.listeners_.push(eYo.Dom.bindEvent(
    g,
    'mouseover',
    brick,
    brick.addSelect
  ))
  search.listeners_.push(eYo.Dom.bindEvent(
    g,
    'mouseleave',
    brick,
    brick.removeFocus
  ))
  search.listeners_.push(eYo.Dom.bindEvent(
    g,
    'mouseout',
    brick,
    brick.removeFocus
  ))
}

/**
 * Add a `mouseover` listener to deselect all bricks.
 * @param {!eYo.Search} search
 */
eYo.Svg.Search.prototype.listen_mouseover = function(search) {
  search.listeners_.push(
    eYo.Dom.bindEvent(
    search.dom.svg.background_,
    'mouseover',
    null,
    () => {
      search.board_.topBricks.forEach(b3k => b3k.removeFocus)
    }
  ))
}

/**
 * Add a `wheel` and `mousdown` listener to scroll.
 * @param {!eYo.Search} search
 */
eYo.Svg.Search.prototype.bindScrollEvents = function(search) {
  var bound = search.dom.bound
  if (bound.drag_wheel) {
    return
  }
  var svg = search.dom.svg
  bound.drag_wheel = eYo.Dom.bindEvent(
    svg.group_,
    'wheel',
    null,
    this.searchOn_wheel.bind(search)
  )
  // Dragging the search up and down.
  bound.drag_mousedown = eYo.Dom.bindEvent(
    svg.background_,
    'mousedown',
    null,
    this.searchOn_mousedown.bind(search)
  )
}

/**
 * Mouse down on the search background.  Start a vertical scroll drag.
 * @param {!Event} e Mouse down event.
 * @private
 */
eYo.Svg.Search.prototype.on_mousedown = function(e) {
  eYo.app.motion.handleFlyoutStart(e, this)
  
}

/**
 * Svg driver for the search tool bar.
 */
eYo.Svg.makeDriverClass('SearchToolbar', {
  /**
   * Initializes the search toolbar SVG ressources.
   * @param {!eYo.SearchToolbar} searchToolbar
   */
  initUI (ftb) {
    if (ftb.dom) {
      return
    }
    var search = ftb.search
    var dom = this._initUI(ftb)
    var svg = dom.svg
    /*
    <div class="eyo-search-toolbar">
      <div class="eyo-search-toolbar-general">
        <div class="eyo-search-select-general">
          ...
        </div>
        <div class="eyo-search-control">
          ...
        </div>
      </div>
      <div class="eyo-search-toolbar-module">
        <div class="eyo-search-select-module">
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
    svg.root_ = eYo.Svg.newElementSvg(dom.control_, goog.getCssName(cssClass, 'control-image'))
    svg.pathControl_ = eYo.Svg.newElement('path', {
      id: 'p-search-control'
    }, dom.svg)
    if (eYo.Application && eYo.app.searchDropDown) {
      dom.select_general_ = goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName(cssClass, 'select'),
        eYo.app.searchDropDown
      )
    } else if (eYo.Application && eYo.app.searchDropDownGeneral && eYo.app.searchDropDownModule) {
      dom.select_general_ = goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName(cssClass, 'select-general'),
        eYo.app.searchDropDownGeneral
      )
      dom.select_module_ = goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName(cssClass, 'select-module'),
        eYo.app.searchDropDownModule
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
      search.listenableKey = select.listen(
        goog.ui.Component.EventType.ACTION,
        search.doSelectGeneral,
        false,
        search
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
      search.listenableKey = select.listen(
        goog.ui.Component.EventType.ACTION,
        search.doSelectGeneral,
        false,
        search
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
    const div = this.search.desk.dom.div_.searchToolbar_
    Object.definePorperty(dom, 'div_', {
      get () { return div }
    })
    if (search.switcher_) {
      div.appendChild(search.switcher_)
      search.switcher_.style.left = '0px'
      search.switcher_.style.top = '0px'
    } else {
      div.appendChild(div_general)
      div.appendChild(div_module)
    }
    div.appendChild(dom.control_)
    var bound = dom.bound
    bound.mousedown = eYo.Dom.bindEvent(
      dom.control_,
      'mousedown',
      search,
      search.on_mousedown
    )
    bound.mouseenter = eYo.Dom.bindEvent(
      dom.control_,
      'mouseenter',
      search,
      search.on_mouseenter
    )
    bound.mouseleave = eYo.Dom.bindEvent(
      dom.control_,
      'mouseleave',
      search,
      search.on_mouseleave
    )
    bound.mouseup = eYo.Dom.bindEvent(
      dom.control_,
      'mouseup',
      search,
      search.on_mouseup
    )
  },
  /**
   * Initializes the search toolbar SVG ressources.
   * @param {!eYo.SearchToolbar} searchToolbar
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
