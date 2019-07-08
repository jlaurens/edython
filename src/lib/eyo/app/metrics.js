/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Board metrics model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Metrics')

goog.forwardDeclare(eYo.Board)
goog.forwardDeclare(eYo.Geometry)

/**
 * The `content` rect is enclosing all the bricks.
 * Its coordinates define the board coordinates.
 * The `view` rectangle corresponds to the view port.
 * Its coordinates correspond to screen coordinates or at least
 * the enclosing graphical element's coordinates.
 * @param {?eYo.Board} board the owner board.
 * @constructor
 */
eYo.Metrics = function (board) {
  this.board_ = board
  this.port_ = new eYo.Rect()
  this.view_ = new eYo.Rect()
  this.box_ = new eYo.Rect()
  this.drag__ = this.dragDefault.clone
  this.scale_ = 1
  this.updateDepth_ = 0
}

Object.defineProperties(eYo.Metrics.prototype, {
  board: {
    get () {
      return this.board_
    }
  },
  options: {
    get () {
      return this.board_ && this.board_.options.zoom || {}
    }
  },
  /**
   * Bricks visible dimensions are propotional to this value.
   * Doubling the scale will double the size of the bricks on screen.
   * Each time the scale changes, a `didScale` message is sent to the board.
   * The same holds for other properties.
   * Scaling will change the scroll bars and the view rect.
   * When the scaling corresponds to a zoom out, scrolling
   * might be disabled if the zoom factor is too small.
   * @type {Number} Positive scale factor.
   */
  scale: {
    get () {
      return this.scale_
    },
    set (newValue) {
      if (newValue <= 0) {
        newValue = 1
      }
      if (this.scale_ !== newValue) {
        var options = this.options
        if (options && options.maxScale &&
          newValue > options.maxScale) {
            newValue = options.maxScale
        } else if (options && options.minScale &&
          newValue < options.minScale) {
            newValue = options.minScale
        }
        this.scale_ = newValue
        this.board_ && this.board_.didScale()
      }
    }
  },
  /**
   * The view rect is the visible rectangle on screen.
   * For the main board it is the bounding rect of the enclosing
   * desk's div. For a flyout, it is generally smaller.
   * It is used for clipping the svg.
   * @type {eYo.Rect} 
   */
  view: {
    get () {
      return this.view_.clone
    },
    set (newValue) {
      if (!this.view_.equals(newValue)) {
        this.wrapUpdate(() => this.view_.set(newValue))
      }
    }
  },
  /**
   * The port rect is at least enclosing all the bricks.
   * In board coordinates.
   * 
   * The port is virtually unlimited and contains bricks of arbitrary size,
   * within memory capacities of course.
   * The port rect refers to a visual rectangle where
   * all the visible bricks lie.
   * 
   * The main pane is the half plane of the port with equation `c≥0`.
   * The draft pane is the half plane of the port with equation `c≤1`.
   * There is a 1 character width margin to separate both regions.
   * 
   * At initialization time, the dimensions of the port are defined
   * by the `minPort` rectangle.
   * When there is no brick, view and port share the same origin and size.
   * When there are some bricks, the port may be bigger than the view
   * and scrolling may be possible.
   * 
   * The 
   * @type {eYo.Rect} 
   * @readonly 
   */
  port: {
    get () {
      return this.port_.clone
    },
    set (newValue) {
      if (!this.port_.equals(newValue)) {
        this.wrapUpdate(() => {
          this.port_.set(newValue)
        })
      }
    }
  },
  /**
   * The port rect is at least enclosing all the bricks.
   * In view coordinates.
   * @type {eYo.Rect} 
   * @readonly 
   */
  portInView: {
    get () {
      return this.toView(this.port)
    }
  },
  /**
   * Whether line numbering is available or not.
   * When true, an extra margin at the right of the draft board is added
   * to display line numbers.
   * @type {Boolean} 
   * @readonly 
   */
  numbering: {
    get () {
      return this.numbering_
    },
    set (newValue) {
      if (this.numbering_ !== newValue) {
        this.wrapUpdate(() => this.numbering_ = newValue)
      }
    }
  },
  /**
   * The default scroll value.
   * 
   * @type {eYo.Where} 
   * @readonly 
   */
  dragDefault: {
    get () {
      return eYo.Where.cl(0*1.5, 0*0.25)
    }
  },
  /**
   * When this point is (0,0) the view topleft corner
   * and the (0,0) point in the port are exactly
   * at the same location on screen.
   * The drag div is translated by `drag•(i,j)` with respect to the view.
   * 
   * @type {eYo.Where} 
   */
  drag: {
    /**
     * This is the private `drag_` property projected
     * on the admissible set of values.
     * @return {eYo.Where}
     */
    get () {
      var ans = this.drag_
      var r = this.dragLimits
      if (r) {
        if (ans.x < r.x) {
          // console.error(`${ans.x} < ${r.x}`)
          ans.x = r.x
        }
        if (ans.x > r.x_max) {
          // console.error(`${ans.x} > ${r.x_max}`)
          ans.x = r.x_max
        }
        if (ans.y < r.y) {
          // console.error(`${ans.y} < ${r.y}`)
          ans.y = r.y
        }
        if (ans.y > r.y_max) {
          // console.error(`${ans.y} > ${r.y_max}`)
          ans.y = r.y_max
        }
      }
      return ans
    },
    /**
     * 
     * @param {eYo.Where} newValue 
     */
    set (newValue) {
      this.drag_ = newValue
    }
  },
  drag_: {
    get () {
      return this.drag__.clone
    },
    set (newValue) {
      if (!this.drag__.equals(newValue)) {
        this.wrapUpdate(() => this.drag__.set(newValue))
      }
    }
  },
  /**
   * The opposite of `drag`.
   * 
   * @type {eYo.Where}
   * @readonly
   */
  scroll: {
    get () {
      return this.drag.mirror
    },
  },
  /**
   * The minimum port rect in board coordinates,
   * when the scroll value is default.
   * 
   * @type {eYo.Rect} 
   * @readonly 
   */
  minPort: {
    get () {
      var ans = this.view
      ans.origin.set()
      ans.unscale(this.scale)
      ans.left = -(this.numbering ? 5 : 3) * eYo.Unit.x
      ans.top = -eYo.Unit.y
      return ans
    }
  },
  /**
   * The scroll limits in view coordinates.
   * Used for scrolling, gives the limiting values of the `scroll` property.
   */
  dragLimits: {
    get () {
      var v = this.view
      v.origin_.set()
      var ans = this.port.scale(this.scale)
      var d = ans.right - v.right
      ans.right = d >= 0 ? d : 0
      d = ans.left - v.left
      ans.left = d <= 0 ? d : 0
      d = ans.bottom - v.bottom
      ans.bottom = d >= 0 ? d : 0
      d = ans.top - v.top
      ans.top = d <= 0 ? d : 0
      ans.mirror()
      return ans
    }
  },
  /**
   * The box rect is bigger than the content rect.
   * It is reset each time the content rect changes.
   * @type {eYo.Rect} 
   * @readonly 
   */
  box: {
    get () {
      return this.box_.clone
    },
    set (newValue) {
      if (!this.box_.equals(newValue)) {
        this.wrapUpdate(() => this.box_.set(newValue))
      }
    }
  },
  /**
   * Clone the object.
   */
  clone: {
    get () {
      var ans = new eYo.Metrics()
      ans.scale_ = this.scale_
      ans.view = this.view_
      ans.port = this.port_
      ans.drag_ = this.drag_
      ans.box = this.box_
      ans.board_ = this.board_ // at the end only
      return ans
    }
  },
  toString: {
    get () {
      return `drag: ${this.drag.toString}, view: ${this.view.toString}, port: ${this.port.toString}`
    }
  }
})

/**
 * Sever the links and dispose of the resources.
 */
eYo.Metrics.prototype.dispose = function () {
  this.board_ = null
  this.box_.dispose()
  this.drag__.dispose()
  this.view_.dispose()
  this.port_.dispose()
  this.box_ = this.drag_ = this.view_ = this.port_ = null
}

/**
 * Update the board.
 */
eYo.Metrics.prototype.update = function () {
  this.board_ && this.board_.metricsDidChange()
}

/**
 * Update the board.
 */
eYo.Metrics.prototype.wrapUpdate = function (do_it) {
  try {
    ++this.updateDepth_
    do_it()
  } finally {
    if(--this.updateDepth_) {
      return
    }
    this.update()
  }
}

/**
 * Convert the given argument from `board` coordinates to `view` coordinates.
 * @param{eYo.Rect | eYo.Where} WR
 */
eYo.Metrics.prototype.toView = function (WR) {
  // Referential(view) = (origin: o, basis: {i, j})
  // o is the top left corner of the visible area.
  // Referential(port) = (origin: O, basis: {I, J})
  // I = i * scale, J = j * scale
  // o + drag = O, drag is a vector in view coordinates
  // P = o + (x, y) •{i, j}
  //   = O + (X, Y) • {I, J}
  //   = o + drag • {i, j} + (X, Y) * scale • {i, j} 
  //  (x, y) = drag + (X, Y) * scale
  //  (X, Y) = ((x, y) - drag) / scale
  return WR.scale(this.scale).forward(this.drag_)
}

/**
 * Convert the given argument from `view` coordinates to `board` coordinates.
 * @param{eYo.Rect | eYo.Where} wr
 */
eYo.Metrics.prototype.fromView = function (wr) {
  return wr.backward(this.drag_).unscale(this.scale)
}

/**
 * Get the dragging limits.
 * Reference is the brick board.
 * @param{?eYo.Rect} rect
 */
eYo.Metrics.prototype.getDraggingLimits = function (rect) {
  var view = this.minPort
  var limits = this.port
  if (rect) {

  }
}

/**
 * Test whether the receiver equals the given metrics object.
 * @param {!eYo.Metrics} rhs Another metrics.
 * @return {boolean} Whether the two sets of metrics are equivalent.
 * @private
 */
eYo.Metrics.prototype.equals = function(rhs) {
  return rhs && this.view.equals(rhs.view) &&
  this.scale === rhs.scale &&
  this.drag.equals(rhs.drag) &&
  this.port.equals(rhs.port)
}
