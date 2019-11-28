/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Flyout overriden.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Protocol')
goog.require('eYo.UI.Dflt')
goog.require('eYo.Unit')
goog.require('eYo.Events')

goog.provide('eYo.Flyout')

goog.forwardDeclare('eYo.Library');
goog.forwardDeclare('eYo.Style');
goog.forwardDeclare('eYo.Brick');
goog.forwardDeclare('eYo.FlyoutToolbar');
goog.forwardDeclare('eYo.Tooltip');
goog.forwardDeclare('eYo.MenuRenderer');
goog.forwardDeclare('eYo.MenuButtonRenderer');

/**
 * Class for a flyout.
 * @param {!eYo.Workspace} owner  The owning desk, which must be a desk...
 * @constructor
 * @readonly
 * @property {eYo.Workspace} workspace, The workspace
 * 
 * @private
 * @property {eYo.Search} search Search section.
 * 
 * @private
 * @property {eYo.Library} library Library section.
 * 
 * @private
 * @property {eYo.Draft} draft Draft section.
 *
 * @readonly
 * @property {boolean} closed Whether the flyout is closed.
 * 
 * @property {boolean}autoClose Does the flyout automatically close when a brick is created?
 * 
 * @readonly
 * @property {boolean} visible Whether the flyout is visible.
 * 
 * @readonly
 * @property {boolean} closed Whether the flyout is closed.
 *
 * @readonly
 * @property {boolean} containerVisible Whether the board containing this flyout is visible.
 * 
 * @readonly
 * @property {number} dragAngleLimit
 * Range of a drag angle from a flyout considered "dragging toward board".
 * Drags that are within the bounds of this many degrees from the orthogonal
 * line to the flyout edge are considered to be "drags toward the board".
 * Example:
 * Flyout Edge   Board
 * [brick] /  <-within this angle, drags "toward board" |
 * [brick] ---- orthogonal to flyout boundary ----          |
 * [brick] \                                                |
 * The angle is given in degrees from the orthogonal.
 *
 * This is used to know when to create a new brick and when to scroll the
 * flyout. Setting it to 360 means that all drags create a new brick.
 *
 * @private
 * @property {Number} width_  Width of flyout.
 *
 * @property {number} height_ Height of flyout.
 * @private
 */
eYo.UI.makeClass('Flyout', {
  props: {
    owned: {
      search () {
        return new eYo.Search(this)
      },
      library () {
        return new eYo.Library(this)
      },
      draft () {
        return new eYo.Draft(this)
      }
    },
    computed: {
      workspace () {
        return this.owner
      },
      toolbar () {
        return this.toolbar_
      },
      /**
       * This size and anchor of the receiver and wrapped
       * in an object with eponym keys.
       */
      size: {
        get () {
          var ans = new eYo.Size(this.viewRect_.size_)
          ans.anchor = this.anchor_
          return ans
        },
        set (newValue) {
          if (!newValue.equals(this.viewRect_.size)) {
            this.viewRect_.size = newValue
            this.sizeChanged()
          }
        }
      },
      /**
       * Return the deletion rectangle for this flyout in viewport coordinates.
       * Edython : add management of the 0 width rectange
       * @return {eYo.Rect} Rectangle in which to delete.
       */
      deleteRect () {
        var rect = this.viewRect
        var width = rect.width
        if (!width) {
          return null
        }
        // BIG_NUM is offscreen padding so that bricks dragged beyond the shown flyout
        // area are still deleted.  Must be larger than the largest screen size,
        // but be smaller than half Number.MAX_SAFE_INTEGER (not available on IE).
        var BIG_NUM = 1000000000
        if (this.atRight) {
          rect.right += BIG_NUM
        } else {
          rect.left -= BIG_NUM
        }
        rect.top = BIG_NUM
        rect.bottom = BIG_NUM
        return rect
      },
      position: {
        get () {
          return this.viewRect_.origin
        },
        set (newValue) {
          this.viewRect_.origin = newValue
        }
      },
      /**
       * @readonly
       * @type {number} The width of the flyout.
       */
      width: {
        get () {
          return this.viewRect_.size_.width
        },
        get_ () {
          return this.viewRect_.size_.width
        },
        set_ (newValue) {
          if (this.viewRect_.size_.width !== newValue) {
            this.viewRect_.size_.width = newValue
            this.desk.board.layout()
          }
        }
      },
      /**
       * @readonly
       * @type {number} The height of the flyout.
       */
      height: {
        get () {
          return this.viewRect_.size_.height
        },
        get_ () {
          return this.viewRect_.size_.height
        },
        set_ (newValue) {
          if (this.viewRect_.size_.height !== newValue) {
            this.viewRect_.size_.height = newValue
            this.desk.board.layout()
          }
        }
      },
      /**
       * @type {eYo.Scrollbar}.
       */
      scrollbar () {
        return this.board.scrollbar
      },
      /**
       * @type {boolean} True if this flyout may be scrolled with a scrollbar or by
       *     dragging.
       */
      scrollable () {
        return this.board.scrollable
      },
      /**
       * @type {Boolean} Is it anchored at right ?
       * @readonly
       */
      atRight () {
        return this.anchor_ === eYo.Flyout.AT_RIGHT
      },
    },
    link: {
      closed: {value: false},
      autoClose: {value: false},
      /**
       * Is the flyout visible?
       * @type {boolean} True if visible.
       */
      visible: {
        value: true,
        didChange (previous, next) {
          this.updateDisplay_()
        }
      },
      /**
       * Whether this flyout's container is visible.
       * @type {boolean}
       */
      containerVisible: {
        value: true,
        didChange (previous, next) {
          this.updateDisplay_()
        }
       },
      dragAngleLimit: {value: 70},
      /**
       * @type {Number} where the flyout is anchored.
       */
      anchor: {},
    }
  },
  init (owner) {
    // First
    if (!this.autoClose) {
      this.filterWrapper_ = this.filterForCapacity_.bind(this)
      owner.board.addChangeListener(this.filterWrapper_)
    }
    var flyoutOptions = this.options
    /**
     * Position of the flyout relative to the board.
     * @type {number}
     * @private
     */
    this.anchor_ = flyoutOptions.anchor || eYo.Flyout.AT_RIGHT
    /**
     * Position and dimensions of the flyout in the workspace.
     * @type {number}
     * @private
     */
    this.viewRect__ = new eYo.Rect().tie(board.metrics_.view, {
      l: (newValue) => newValue + eYo.Flyout.TOOLBAR_HEIGHT,
      h: (newValue) => newValue - eYo.Flyout.TOOLBAR_HEIGHT,
    }, {
      l: (newValue) => newValue - eYo.Flyout.TOOLBAR_HEIGHT,
      h: (newValue) => newValue + eYo.Flyout.TOOLBAR_HEIGHT,
    })
    /**
     * Opaque data that can be passed to unbindEvent.
     * @type {!Array.<!Array>}
     * @private
     */
    this.eventWrappers_ = []
    /**
     * List of event listeners.
     * Array of opaque data that can be passed to unbindEvent.
     * @type {!Array.<!Array>}
     * @private
     */
    this.listeners_ = []
    /**
     * List of bricks that should always be disabled.
     * @type {!Array.<!eYo.Brick>}
     * @private
     */
    this.permanentlyDisabled_ = []
    if (flyoutOptions.autoClose) {
      this.autoClose = true
    }
  },
  /**
   * Dispose of this flyout.
   */
  dispose () {
    if (!this.filterWrapper_) {
      this.owner.removeChangeListener(this.filterWrapper_)
    }
  },
  ui: {
    /**
     * Make the UI
     */
    init () {
      var switcher = this.flyoutOptions.switcher
      if (switcher) {
        var tb = this.toolbar_ = new eYo.FlyoutToolbar(this, switcher)
        d.toolbarInitUI(tb)
        tb.doSelectGeneral(null) // is it necessary ?
      }
    },
    /**
     * Dispose of this flyout UI resources.
     * Unlink from all DOM elements to prevent memory leaks.
     */
    dispose () {
      this.hide()
      var d = this.ui_driver_mgr
      this.toolbar_ && d.toolbarDisposeUI(this.toolbar_)
      d.disposeUI(this)
      eYo.Flyout.eyo.disposeOwned(this, 'scrollbar_')
    }
  }
})

/**
 * When the size of the receiver did change.
 */
eYo.Flyout.prototype.sizeChanged = function() {
  this.desk.board.layout()
  this.search_.layout()
  this.library_.layout()
  this.draft_.layout()
}

Object.defineProperties(eYo.Flyout, {
  AT_RIGHT: {value: 1},
  AT_LEFT: {value: 2},
  /**
   * Top/bottom padding between scrollbar and edge of flyout background.
   * @type {number}
   * @const
   */
  SCROLLBAR_PADDING: {value: 2},
  TOP_MARGIN: {value: 0}, // 4 * eYo.Unit.rem
  BOTTOM_MARGIN: {value: 16}, // scroll bar width
  TOOLBAR_HEIGHT : {value: Math.round(2 * eYo.Unit.y)},
  /**
   * Margin around the edges of the bricks.
   * @type {number}
   * @const
   */
  MARGIN : {value: eYo.Unit.rem / 4},
  /**
   * This size and anchor of the receiver and wrapped
   * in an object with eponym keys.
   */
})

/**
 * Update the display property of the flyout based whether it thinks it should
 * be visible and whether its containing board is visible.
 * @private
 */
eYo.Flyout.prototype.updateDisplay_ = function() {
  var show = this.containerVisible_ && this.visible_
  this.ui_driver_mgr.displaySet(show)
  // Update the scrollbar's visiblity too since it should mimic the
  // flyout's visibility.
  this.scrollbar.containerVisible = show
}

/**
 * Hide and empty the flyout.
 */
eYo.Flyout.prototype.hide = function() {
  if (!this.visible) {
    return
  }
  this.visible = false
  this.ui_driver_mgr.flyoutRemoveListeners(this)
  if (this.reflowWrapper_) {
    this.board_.removeChangeListener(this.reflowWrapper_)
    this.reflowWrapper_ = null
  }
  // Do NOT delete the bricks here.  Wait until Flyout.show.
  // https://neil.fraser.name/news/2014/08/09/
}

/**
 * Show and populate the flyout.
 * More tagnames accepted.
 * @param {!Array|string} model List of bricks to show.
 */
eYo.Flyout.prototype.show = function(model) {
  this.board_.setResizesEnabled(false)
  this.hide()
  eYo.Events.disableWrap(() => {
    // Delete any bricks from a previous showing.
    this.board_.topBricks.forEach(brick => brick.dispose())
    // Create the bricks to be shown in this flyout.
    var contents = []
    this.permanentlyDisabled_.length = 0
    model.forEach(xml => {
      if (xml.tagName) {
        var tagName = xml.tagName.toUpperCase()
        if (tagName.startsWith('EYO:')) {
          var curBrick = eYo.Xml.domToBrick(xml, this.board_)
          if (curBrick.disabled) {
            // Record bricks that were initially disabled.
            // Do not enable these bricks as a result of capacity filtering.
            this.permanentlyDisabled_.push(curBrick)
          }
          contents.push(curBrick)
        }
      } else {
        var createOneBrick = xml => {
          try {
            var brick = this.board_.newBrick(xml)
            contents.push(brick)
            brick.ui.addTooltip(xml.title || (xml.data && xml.data.main) || xml.data)
          } catch (err) {
            console.error(xml, err)
            // throw err: catch the error here definitely
          }
        }
        // this is the part specific to edython
        if (goog.isFunction(xml)) {
          // xml is either a function that returns an array of objects
          // or a function that creates brick.
          var ra = xml(createOneBrick)
          if (ra && ra.forEach) {
            ra.forEach(createOneBrick)
          }
        } else {
          createOneBrick(xml)
        }
      }
    })

    this.visible = true
    this.layout_(contents)

    // IE 11 is an incompetent browser that fails to fire mouseout events.
    // When the mouse is over the background, deselect all bricks.
    this.ui_driver_mgr.listen_mouseover(this)

    this.board_.setResizesEnabled(true)
    this.reflow()

    this.filterForCapacity_()

    // Correctly position the flyout's scrollbar when it opens.
    this.place()

    this.reflowWrapper_ = this.reflow.bind(this)
    this.board_.addChangeListener(this.reflowWrapper_)
  })
}

/**
 * Scroll the flyout.
 * @param {!Event} e Mouse wheel scroll event.
 * @private
 */
eYo.Flyout.prototype.on_wheel = function(e) {
  var delta = e.deltaY
  if (delta) {
    if (goog.userAgent.GECKO) {
      // Firefox's deltas are a tenth that of Chrome/Safari.
      delta *= 10
    }
    var metrics = this.board.metrics
    metrics.drag = metrics.drag.forward({x: 0, y: delta})
  }
  eYo.Dom.gobbleEvent(e)
}

/**
 * Create a copy of this brick on the board.
 * @param {!eYo.Brick.Dflt} originalBrick The brick to copy from the flyout.
 * @return {eYo.Brick} The newly created brick, or null if something
 *     went wrong with deserialization.
 */
eYo.Flyout.prototype.createBrick = function(originalBrick) {
  this.desk.board.setResizesEnabled(false)
  var newBrick
  eYo.Events.disableWrap(() => {
    newBrick = this.placeNewBrick_(originalBrick)
    // Close the flyout.
    eYo.app.hideChaff()
  })
  eYo.Events.fireBrickCreate(newBrick, true)
  if (this.autoClose) {
    this.hide()
  } else {
    this.filterForCapacity_()
  }
  return newBrick
}

/**
 * Lay out the bricks in the flyout.
 * @param {!Array.<!Object>} contents The bricks and buttons to lay out.
 * @param {!Array.<number>} gaps The visible gaps between bricks.
 * @private
 */
eYo.Flyout.prototype.layout_ = function(contents) {
  this.board_.scale = this.desk.board.scale
  var where = eYo.Where.xy(this.MARGIN, this.MARGIN)
  contents.forEach(brick => {
    // Mark bricks as being inside a flyout.  This is used to detect and
    // prevent the closure of the flyout if the user right-clicks on such a
    // brick.
    brick.descendants.forEach(child => child.isInFlyout = true)
    brick.render()
    brick.moveTo(where)
    this.ui_driver_mgr.addListeners(this, brick)
    where.y += brick.size.height + eYo.Unit.y / 4
  })
}

/**
 * Scroll the flyout to the top.
 */
eYo.Flyout.prototype.scrollToStart = function() {
  var board = this.board
  var metrics = board.metrics_
  metrics.drag.set()
  board.move()
}

/**
 * Determine if a drag delta is toward the board, based on the position
 * and orientation of the flyout. This is used in determineDragIntention_ to
 * determine if a new brick should be created or if the flyout should scroll.
 * @param {!eYo.Motion} Motion.
 * @return {boolean} true if the drag is toward the board.
 */
eYo.Flyout.prototype.isDragTowardBoard = function(Motion) {
  if(!this.scrollable) {
    return true
  }
  var delta = Motion.deltaWhere
  var dx = delta.x
  var dy = delta.y
  // Direction goes from -180 to 180, with 0 toward the board.
  var direction = Math.atan2(dy,
    this.atRight ? -dx : dx
  ) / Math.PI * 180
  var limit = this.dragAngleLimit_
  return -limit < direction && direction < limit
}

/**
 * Filter the bricks on the flyout to disable the ones that are above the
 * capacity limit.  For instance, if the user may only place two more bricks on
 * the board, an "a + b" brick that has two required placeholders would be disabled.
 * @private
 */
eYo.Flyout.prototype.filterForCapacity_ = function() {
  var remainingCapacity = this.desk.board.remainingCapacity
  this.board_.topBricks.forEach(brick => {
    if (this.permanentlyDisabled_.indexOf(brick) < 0) {
      brick.disabled = brick.descendants.length > remainingCapacity
    }
  })
}

/**
 * Reflow bricks and their mats.
 */
eYo.Flyout.prototype.reflow = function() {
  if (this.reflowWrapper_) {
    this.board_.removeChangeListener(this.reflowWrapper_)
  }
  this.board_.scale = this.desk.board.scale
  var size = this.size
  var rect = this.board_.metrics.port
  size.width = rect.width + this.MARGIN * 1.5 + eYo.Scrollbar.thickness
  this.size = size
  if (this.reflowWrapper_) {
    this.board_.addChangeListener(this.reflowWrapper_)
  }
}

/**
 * Move the flyout to the edge of the board.
 */
eYo.Flyout.prototype.place = function () {
  if (!this.visible_) {
    return
  }
  var view = this.desk.board.metrics.view
  if (view.height <= 0) {
    // Hidden components will return null.
    return
  }
  var rect = this.viewRect_
  rect.top = view.top // change the height
  rect.bottom = view.bottom
  if (this.atRight) {
    if (this.closed) {
      rect.x_min = view.x_max
    } else {
      rect.x_max = view.x_max
    }
  } else {
    if (this.closed) {
      rect.x_max = view.x_min
    } else {
      rect.x_min = view.x_min
    }
  }
  this.toolbar_.layout()
  this.ui_driver_mgr.update(this)
  this.ui_driver_mgr.place(this)
}
console.error('IN PROGRESS')
/**
 * Copy a brick from the flyout to the board and position it correctly.
 * Edython adds a full rendering process.
 * No rendering is made while bricks are dragging.
 * @param {!eYo.Brick.Dflt} srcBrick The flyout brick to copy.
 * @return {!eYo.Brick} The new brick in the main board.
 * @private
 */
eYo.Flyout.prototype.placeNewBrick_ = function(srcBrick) {
  // Create the new brick by cloning the brick in the flyout (via XML).
  var xml = eYo.Xml.brickToDom(srcBrick)
  // The target board would normally resize during domToBrick, which will
  // lead to weird (AKA buggy) jumps.  Save it for terminateDrag.
  var targetBoard = this.desk.board
  targetBoard.setResizesEnabled(false)
  // Using domToBrick instead of domToBoard means that the new brick will be
  // placed at position (0, 0) in main board units.
  var brick = eYo.Xml.domToBrick(xml, targetBoard)
  var xy = this.board_.originInApplication
  .forward(
    srcBrick.whereInBoard.scale(this.board_.scale)
  ).backward(targetBoard.originInApplication)
  .unscale(this.desk.scale)
  brick.moveTo(xy)
  brick.render()
  return brick
}

/**
 * Does the job of sliding the flyout in or out.
 * @param {?Boolean} close  close corresponds to the final state.
 * When not given, toggle the closed state.
 */
eYo.Flyout.prototype.doSlide = function(close) {
  // nothing to do if in the process of reaching the expected state
  if (this.slide_locked) {
    return
  }
  if (!goog.isDef(close)) {
    close = !this.closed
  }
  // nothing to do either if already in the expected state
  if (!close === !this.closed) {
    return
  }
  this.slide_locked = true
  this.visible = true
  eYo.Tooltip.hideAll(this.dom.svg.group_)
  var rect = this.viewRect_
  var x_min = rect.x_min
  var x_max = rect.x_max
  var n_steps = 50
  var n = 0
  var steps = []
  var positions = []
  if (this.atRight) {
    var x_start = close ? x_min : x_max
    var x_end = close ? x_max : x_min
  } else {
    x_start = close ? x_min : x_min - rect.width
    x_end = close ? x_min - rect.width : x_min
  }
  steps[0] = close ? 0: 1
  positions[0] = x_start
  for (n = 1; n < n_steps; n++) {
    var step = Math.sin(n*Math.PI/n_steps/2)**2
    steps[n] = close ? step : 1 - step
    positions[n] = x_start + step * (x_end - x_start)
  }
  steps[n] = close ? 1 : 0
  positions[n] = x_end

  n = 0
  var f = () => {
    if (n >= n_steps) {
      rect.x = x_end
      clearInterval(id)
      if ((this.closed_ = close)) {
        this.visible = false
      }
      this.ui_driver_mgr.update(this)
      delete this.slide_locked
      this.desk_.recordDeleteAreas()
      this.slideOneStep(steps[n_steps])
      this.didSlide(close)
      this.abortSlide = eYo.Do.nothing
    } else {
      rect.x = positions[n]
      this.ui_driver_mgr.place(this)
      // the scrollbar won't layout because the metrics of the board did not change
      this.slideOneStep(steps[n])
      ++n
    }
  }
  var id = setInterval(f, 20)
  this.abortSlide = function () {
    n = n_steps
    f()
  }
}

/**
 * Slide the flyout in or out.
 * This 2 levels design allows overwriting.
 * Actually, the ui button calls the slide method.
 * @param {?Boolean} close  close corresponds to the final state.
 * When not given, toggle the closed state.
 */
eYo.Flyout.prototype.slide = function(close) {
  this.doSlide(close)
}

/**
 * Subclassers will add there stuff here.
 * @param {number} step betwwen 0 and 1.
 */
eYo.Flyout.prototype.slideOneStep = function(step) {
}

/**
 * Subclassers will add there stuff here.
 * @param {Boolean} closed
 */
eYo.Flyout.prototype.didSlide = function(closed) {
}

/**
 * List of node models by category.
 * Used by the front end.
 * @param {!String} category The name of the category to retrieve.
 */
eYo.Flyout.prototype.getList = function (category) {
  return eYo.Library[category] || []
}

/**
 * Update metrics, nothing more nothing less.
 * The size and location of the view may change due to user interaction,
 * for example a window resize, a pane resize.
 * The driver updates the internal state accordingly.
 * This must be called at initialization time, when building the UI,
 * and each time some change occurs that modifies the geometry.
 */
eYo.Flyout.prototype.updateMetrics = function() {
  // if the flyout is moving, either opening or closing,
  // stop moving
  this.abortSlide() // ideally, sliding would follow the new metrics
  var view = this.desk.board.metrics.view
  var r = this.viewRect_
  r.size_.height = view.height
  r.size_.width = Math.min(view.width / 3, Math.max(this.board.metrics.port.width, eYo.Unit.x * 10))
  var where = this.atRight ? view.right : view.left
  if (!this.closed === !this.atRight) {
    r.origin_.x_min = where
  } else {
    r.origin_.x_max = view.right
  }
  this.ui_driver_mgr.updateMetrics(this)
  this.toolbar.updateMetrics()
  this.board.updateMetrics()
}

