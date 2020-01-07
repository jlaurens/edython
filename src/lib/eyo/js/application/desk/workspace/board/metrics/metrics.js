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

eYo.require('C9r.Owned')

eYo.forwardDeclare('Board')
eYo.forwardDeclare('Geometry')

/**
 * The `content` rect is enclosing all the bricks.
 * Its coordinates define the board coordinates.
 * The `view` rectangle corresponds to the view port.
 * Its coordinates correspond to screen coordinates or at least
 * the enclosing graphical element's coordinates.
 * @param {eYo.Board} [board] the owning board.
 * @constructor
 * @readonly
 * @property {eYo.Rect}  port
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
 * @readonly
 * @property {eYo.Rect}  view
 * The view rect is the visible rectangle on screen.
 * For the main board it is the bounding rect of the enclosing
 * desk's div. For a flyout, it is generally smaller.
 * It is used for clipping the svg.
 *
 * @readonly 
 * @property {eYo.Rect} box
 * The box rect is bigger than the content rect.
 * It is reset each time the content rect changes.
 *
 * @readonly
 * @property {Number} scale
 * Positive scale factor.
 * Bricks visible dimensions are proportional to this value.
 * Doubling the scale will double the size of the bricks on screen.
 * Each time the scale changes, a `didScale` message is sent to the board.
 * The same holds for other properties.
 * Scaling will change the scroll bars and the view rect.
 * When the scaling corresponds to a zoom out, scrolling
 * might be disabled if the zoom factor is too small.
 * 
 * @readonly 
 * @property {Boolean} numbering
 * Whether line numbering is available or not.
 * When true, an extra margin at the right of the draft board is added
 * to display line numbers.
 */
eYo.makeClass('Metrics', {
  cloned: {
    port () {
      return new eYo.Rect()
    },
    view () {
      return new eYo.Rect()
    },
    box () {
      return new eYo.Rect()
    },
  },
  valued: {
    numbering: {
      set__ (after) {
        this.wrapUpdate(() => this.numbering__ = after)
      },
      init () {
        return false
      }
    },
    updateDepth: 0,
    scale: {
      init () {
        return new eYo.Where()
      },
      validate (after) /** @suppress {globalThis} */ {
        if (after <= 0) {
          after = 1
        }
        if (this.scale !== after) {
          var options = this.options
          if (options && options.maxScale &&
            after > options.maxScale) {
              after = options.maxScale
          } else if (options && options.minScale &&
            after < options.minScale) {
              after = options.minScale
          }
        }
        return after
      },
      didChange () /** @suppress {globalThis} */ {
        this.board && this.board.didScale()
      }
    },
  },
  computed: {
    board () {
      return this.owner
    },
    options () {
      return this.board && this.board.options.zoom || {}
    },
    /**
     * The port rect is at least enclosing all the bricks.
     * In view coordinates.
     * @type {eYo.Rect} 
     * @readonly 
     */
    portInView () {
      return this.toView(this.port)
    },
    /**
     * The default scroll value.
     * 
     * @type {eYo.Where} 
     * @readonly 
     */
    dragDefault () {
      return eYo.Where.cl(0*1.5, 0*0.25)
    },
    /**
     * Whether the actual drag value is within the acceptable limits.
     * 
     * @type {Boolean} 
     */
    dragPastLimits () {
      var r = this.dragLimits
      return r && this.drag_.out(r)
    },
    /**
     * The opposite of `drag`.
     * 
     * @type {eYo.Where}
     * @readonly
     */
    scroll () {
      return this.drag.mirror
    },
    /**
     * The minimum port rect in board coordinates,
     * when the scroll value is default.
     * 
     * @type {eYo.Rect} 
     * @readonly 
     */
    minPort () {
      var ans = this.view
      ans.origin.set()
      ans.unscale(this.scale)
      ans.left = -(this.numbering ? 5 : 3) * eYo.Unit.x
      ans.top = -eYo.Unit.y
      return ans
    },
    /**
     * The scroll limits in view coordinates.
     * Used for scrolling, gives the limiting values of the `scroll` property.
     */
    dragLimits () {
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
    },
    /**
     * Clone the object.
     */
    clone () {
      var ans = new eYo.Metrics()
      ans.scale_ = this.scale_
      ans.view_ = this.view_
      ans.port_ = this.port_
      ans.drag_ = this.drag_
      ans.box_ = this.box_
      return ans
    },
    toString () {
      return `drag: ${this.drag.toString}, view: ${this.view.toString}, port: ${this.port.toString}`
    },
  },
  owned: {
    /**
     * When this point is (0,0) the view topleft corner
     * and the (0,0) point in the port are exactly
     * at the same location on screen.
     * The drag div is translated by `drag•(i,j)` with respect to the view.
     * 
     * @type {eYo.Where} 
     */
    drag: {
      get () {
        var ans = (this.drag__ || this.dragDefault).clone
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
    },
  },
})

/**
 * Update the board.
 */
eYo.Metrics.prototype.update = function () {
  this.board && this.board.metricsDidChange()
}

/**
 * Update the board.
 */
eYo.Metrics.prototype.wrapUpdate = function (do_it) {
  try {
    ++this.updateDepth__
    do_it()
  } finally {
    if(--this.updateDepth__) {
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
  return WR.scale(this.scale).forward(this.drag___)
}

/**
 * Convert the given argument from `view` coordinates to `board` coordinates.
 * @param{eYo.Rect | eYo.Where} wr
 */
eYo.Metrics.prototype.fromView = function (wr) {
  return wr.backward(this.drag___).unscale(this.scale)
}

/**
 * Get the dragging limits.
 * Reference is the brick board.
 * @param{?eYo.Rect} rect
 */
console.error('MISSING IMPLEMENTATION')
eYo.Metrics.prototype.getDraggingLimits = function (rect) {
  var view = this.minPort
  var limits = this.port
  if (rect) {

  }
}

/**
 * Test whether the receiver equals the given metrics object.
 * @param {eYo.Metrics} rhs Another metrics.
 * @return {boolean} Whether the two sets of metrics are equivalent.
 * @private
 */
eYo.Metrics.prototype.equals = function(rhs) {
  return rhs && this.view.equals(rhs.view) &&
  this.scale === rhs.scale &&
  this.drag.equals(rhs.drag) &&
  this.port.equals(rhs.port)
}
