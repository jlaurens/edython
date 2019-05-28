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
 * Initializes the flyout SVG ressources.
 * @param {!eYo.Flyout} flyout
 */
eYo.Svg.prototype.flyoutInit = function(flyout) {
  var dom = this.basicInit(flyout)
  this.flyoutBindScrollEvents(this)
  var svg = dom.svg
  if (svg) {
    return
  }
  svg = dom.svg = Object.create(null)
  /*
  <svg class="eyo-flyout">
    <g class="eyo-flyout-background">
      <path class="blocklyFlyoutBackground"/>
    </g>
    <g class="eyo-workspace">...</g>
  </svg>
  */
 var root = svg.root_ = eYo.Svg.createElement('svg', {
    xmlns:  eYo.Dom.SVG_NS,
    'xmlns:html': eYo.Dom.HTML_NS,
    'xmlns:xlink': eYo.Dom.XLINK_NS,
    version: '1.1',
    class: 'eyo-flyout',
    style: 'display: none'
  }, null)
  svg.background_ = eYo.Svg.newElement('path', {
    class: 'eyo-flyout-background'
  }, root)
// Bad design: code reuse: options
  this.addTooltip(svg.background_, eYo.Tooltip.getTitle('flyout'), {
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
      eYo.Tooltip.hideAll(dom.background_)
    }
  })

  g.appendChild(this.workspaceInit(this.workspace_))

  /*var g = flyout.workspace_.createDom()
  goog.dom.classlist.remove(g, 'eyo-workspace-surface')
  goog.dom.classlist.add(g, 'eyo-workspace-surface')*/

  goog.dom.insertSiblingAfter(g, targetSpace.dom.svg.root_)
  return g
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {!eYo.Flyout} flyout
 */
eYo.Svg.prototype.flyoutDispose = eYo.Dom.decorateDispose(function (flyout) {
  var dom = flyout.dom
  goog.dom.removeNode(dom.svg.group_)
  dom.svg.group_ = null
  dom.svg = null
  eYo.Svg.superClass_.flyoutDispose.call(this, flyout)
})

/**
 * Dispose of the given slot's rendering resources.
 * @param {!eYo.Flyout} flyout
 * @param {Boolean} show
 */
eYo.Svg.prototype.flyoutDisplaySet = function (flyout, show) {
  !show && eYo.Tooltip.hideAll(flyout.dom.svg.group_)
  flyout.dom.svg.group_.style.display = show ? 'block' : 'none'
}

/**
 * Default CSS class of the flyout panel.
 * @type {string}
 */
eYo.Svg.FLYOUT_CSS_CLASS = goog.getCssName('eyo-flyout')

/**
 * Returns the CSS class to be applied to the root element.
 * @param {!eYo.Flyout} flyout
 * @return {string} Renderer-specific CSS class.
 * @override
 */
eYo.Svg.prototype.flyoutCssClass = function() {
  return eYo.Svg.FLYOUT_CSS_CLASS
};

/**
 * Initializes the flyout toolbar SVG ressources.
 * @param {!eYo.FlyoutToolbar} flyoutToolbar
 */
eYo.Svg.prototype.flyoutToolbarInit = function(ftb) {
  var dom = this.basicInit(ftp)
  if (dom.svg) {
    return
  }
  dom.svg = Object.create(null)
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
  svg.root_ = eYo.Svg.newElement('svg', {
    id: 'eyo-flyout-control-image',
    class: goog.getCssName(cssClass, 'control-image')
  }, dom.control_)
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
  dom.div_ = flyout.switcher_
    ? goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'toolbar'),
      flyout.switcher_,
      dom.control_
    )
    : goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'toolbar'),
      div_general,
      div_module,
      dom.control_
    )
  if (flyout.switcher_) {
    flyout.switcher_.style.left = '0px'
    flyout.switcher_.style.top = '0px'
  }
  var bound = flyout.dom.bound
  bound.mousedown = this.bindEvent(
    dom.control_,
    'mousedown',
    flyout,
    flyout.on_mousedown
  )
  bound.mouseenter = this.bindEvent(
    dom.control_,
    'mouseenter',
    flyout,
    flyout.on_mouseenter
  )
  bound.mouseleave = this.bindEvent(
    dom.control_,
    'mouseleave',
    flyout,
    flyout.on_mouseleave
  )
  bound.mouseup = this.bindEvent(
    dom.control_,
    'mouseup',
    flyout,
    flyout.on_mouseup
  )

  goog.dom.insertSiblingBefore(dom.div_, ftb.flyout_.dom.svg.root_)
}

/**
 * Update the view based on coordinates calculated in position().
 * @param {!eYo.Flyout} flyout
 * @param {number} width The computed width of the flyout's SVG group
 * @param {number} height The computed height of the flyout's SVG group.
 * @param {number} x The computed x origin of the flyout's SVG group.
 * @param {number} y The computed y origin of the flyout's SVG group.
 * @private
 */
eYo.Svg.prototype.flyoutPlaceAt = function (flyout, width, height, x, y) {
  if (width < 0 || height < 0) {
    console.error(width, height, x, y)
    return
  }
  var g = flyout.dom.svg.root_
  // Always update the scrollbar (if one exists).
  g.setAttribute('width', width)
  g.setAttribute('height', height)
  var transform = `translate(${x}px,${y + flyout.TOP_OFFSET}px)`
  eYo.Dom.setCssTransform(g, transform)

  if (flyout.scrollbar_) {
    // Set the scrollbars origin to be the top left of the flyout.
    flyout.scrollbar_.setOrigin(x, y + flyout.TOP_OFFSET)
    flyout.scrollbar_.oldHostMetrics_ = null
    flyout.scrollbar_.resize()
  }
  flyout.positionInPixels = {
    x: x,
    y: y
  }
  if (flyout.toolbar_) {
    flyout.toolbar_.positionAt_(width, height, x, y)
  }
  flyout.workspace_.resizeContents()
  var workspace = flyout.targetWorkspace_
  if (workspace) {
    var scrollbar = workspace.scrollbar
    if (scrollbar) {
      scrollbar.oldHostMetrics_ = null
      if (scrollbar.hScroll) {
        scrollbar.hScroll.oldHostMetrics_ = null
      }
      if (scrollbar.vScroll) {
        scrollbar.vScroll.oldHostMetrics_ = null
      }
    }
    workspace.resizeContents()
    workspace.trashcan.place()
  }
}

/**
 * Return an object with all the metrics required to size scrollbars for the
 * flyout.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the contents,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .absoluteTop: Top-edge of view.
 * .viewLeft: Offset of the left edge of visible rectangle from parent,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate,
 * .absoluteLeft: Left-edge of view.
 * @param {!eYo.Flyout} flyout
 * @return {Object} Contains size and position metrics of the flyout.
 * @private
 */
eYo.Svg.prototype.flyoutGetMetrics_ = function(flyout) {
  if (!flyout.isVisible()) {
    // Flyout is hidden.
    return null;
  }
  var W = flyout.workspace_
  try {
    var optionBox = W.dom.svg.canvas_.getBBox()
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    var optionBox = {height: 0, y: 0, width: 0, x: 0};
  }

  // Padding for the end of the scrollbar.
  var absoluteTop = flyout.SCROLLBAR_PADDING;
  var absoluteLeft = 0;

  var viewHeight = flyout.height_ - 2 * flyout.SCROLLBAR_PADDING;
  var viewWidth = flyout.width_;
  if (!flyout.RTL) {
    viewWidth -= flyout.SCROLLBAR_PADDING;
  }

  var metrics = {
    viewHeight: viewHeight,
    viewWidth: viewWidth,
    contentHeight: optionBox.height * W.scale + 2 * flyout.MARGIN,
    contentWidth: optionBox.width * W.scale + 2 * flyout.MARGIN,
    viewTop: -W.scrollY + optionBox.y,
    viewLeft: -W.scrollX,
    contentTop: optionBox.y,
    contentLeft: optionBox.x,
    absoluteTop: absoluteTop,
    absoluteLeft: absoluteLeft
  };
  return metrics;
};

/**
 * Sets the translation of the flyout to match the scrollbars.
 * @param {!eYo.Flyout} flyout
 * @param {!Object} xyRatio Contains a y property which is a float
 *     between 0 and 1 specifying the degree of scrolling and a
 *     similar x property.
 * @private
 */
eYo.Svg.prototype.flyoutSetMetrics_ = function(flyout, xyRatio) {
  var metrics = flyout.getMetrics_()
  // This is a fix to an apparent race condition.
  if (!metrics) {
    return
  }
  var W = flyout.workspace_
  if (goog.isNumber(xyRatio.y)) {
    W.scrollY = -metrics.contentHeight * xyRatio.y
  }
  W.translate(
    W.scrollX + metrics.absoluteLeft,
    W.scrollY + metrics.absoluteTop
  )
}

/**
 * Return the deletion rectangle for this flyout in viewport coordinates.
 * Edython : add management of the 0 width rectange
 * @param {!eYo.Flyout} flyout
 * @return {goog.math.Rect} Rectangle in which to delete.
 */
eYo.Svg.prototype.flyoutClientRect = function(flyout) {
  var g = flyout.dom.root_
  if (!g) {
    return null;
  }
  var rect = g.getBoundingClientRect()
  var x = rect.left
  var width = rect.width
  if (!width) {
    var xy = flyout.positionInPixels
    if (xy) {
      x = xy.x
    }
  }
  // BIG_NUM is offscreen padding so that bricks dragged beyond the shown flyout
  // area are still deleted.  Must be larger than the largest screen size,
  // but be smaller than half Number.MAX_SAFE_INTEGER (not available on IE).
  var BIG_NUM = 1000000000
  if (flyout.position_ === eYo.Flyout.AT_LEFT) {
    return new goog.math.Rect(x - BIG_NUM, -BIG_NUM, BIG_NUM + width,
        BIG_NUM * 2);
  } else {  // Right
    return new goog.math.Rect(x, -BIG_NUM, BIG_NUM + width, BIG_NUM * 2);
  }
}


/**
 * Create and set the path for the visible boundaries of the flyout.
 * @param {!eYo.Flyout} flyout
 * @param {number} width The width of the flyout, not including the
 *     rounded corners, in pixels.
 * @param {number} height The height of the flyout, not including
 *     rounded corners, in pixels.
 * @private
 */
eYo.Svg.prototype.flyoutUpdate = function(flyout, width, height) {
  var top_margin = flyout.TOP_MARGIN
  var atRight = flyout.position_ == Blockly.TOOLBOX_AT_RIGHT
  // Decide whether to start on the left or right.
  var path = [`M ${atRight ? width : 0},${top_margin}`];
  // Top.
  path.push('h', atRight ? -width : width);
  // Side closest to workspace.
  path.push('v', Math.max(0, height - top_margin));
  // Bottom.
  path.push('h', atRight ? width : -width);
  path.push('z');
  flyout.dom.background_.setAttribute('d', path.join(' '))
}

/**
 * Add listeners to a block that has been added to the flyout.
 * Listeners work only when the flyout authorizes it.
 * The 'rect' listeners have been removed.
 * @param {!eYo.Flyout} flyout
 */
eYo.Svg.prototype.flyoutRemoveAllBrickListeners = function(flyout) {
  // Delete all the event listeners.
  flyout.listeners_.forEach(l => this.unbindEvent(l))
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
  var g = brick.ui.dom.svg.group_
  flyout.listeners_.push(this.bindEvent(
    g,
    'mousedown',
    null,
    e => {
      var gesture = flyout.targetWorkspace_.getGesture(e)
      if (gesture) {
        gesture.startBrick = brick
        gesture.handleFlyoutStart(e, flyout)
      }
    }
  ))
  flyout.listeners_.push(this.bindEvent(
    g,
    'mouseover',
    brick,
    brick.addSelect
  ))
  flyout.listeners_.push(this.bindEvent(
    g,
    'mouseleave',
    brick,
    brick.removeSelect
  ))
  flyout.listeners_.push(this.bindEvent(
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
    this.bindEvent(
    flyout.dom.svg.background_,
    'mouseover',
    null,
    () => {
      flyout.workspace_.getTopBricks(false).forEach(b3k => b3k.removeSelect)
    }
  ))
}

/**
 * Add a `wheel` and `mousdown` listener to scroll.
 * @param {!eYo.Flyout} flyout
 */
eYo.Svg.prototype.flyoutBindScrollEvents = function(flyout) {
  var bound = flyout.dom.bound
  if (bound.scroll_wheel) {
    return
  }
  var svg = flyout.dom.svg
  bound.scroll_wheel = this.bindEvent(
    svg.group_,
    'wheel',
    null,
    this.flyoutOn_wheel.bind(flyout)
  )
  // Dragging the flyout up and down.
  bound.scroll_mousedown = this.bindEvent(
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
eYo.Svg.prototype.prototype.flyoutOn_mousedown = function(e) {
  var gesture = this.targetSpace_.getGesture(e)
  if (gesture) {
    gesture.handleFlyoutStart(e, this)
  }
}

