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

eYo.forward('board')

/**
 * The `content` rect is enclosing all the bricks.
 * Its coordinates define the board coordinates.
 * The `view` rectangle corresponds to the view port.
 * Its coordinates correspond to screen coordinates or at least
 * the enclosing graphical element's coordinates.
 * @param {eYo.board} [board] the owning board.
 * @constructor
 * @readonly
 * @property {eYo.geom.Rect}  port
 * The port rect is at least enclosing all the bricks.
 * In board coordinates.
 * 
 * The port is virtually unlimited and contains bricks of arbitrary size,
 * within memory capacities of course.
 * The port rect refers to a visual rectangle where
 * all the visible bricks lie.
 * 
 * 
 * At initialization time, the dimensions of the port are defined
 * by the `minPort` rectangle.
 * When there is no brick, view and port share the same origin and size.
 * When there are some bricks, the port may be bigger than the view
 * and scrolling may be possible.
 *
 * @readonly
 * @property {eYo.geom.Rect}  view
 * The view rect is the visible rectangle on screen.
 * For the main board it is the bounding rect of the enclosing
 * desk's div. For a flyout, it is generally smaller.
 * It is used for clipping the svg.
 *
 * @readonly 
 * @property {eYo.geom.Rect} box
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
eYo.o3d.makeC9r(eYo.geom, 'Metrics', {
  properties: {
    port: {
      value () {
        return new eYo.geom.Rect()
      },
      copy: true,
    },
    view: {
      value  () {
        return new eYo.geom.Rect()
      },
      copy: true,
    },
    box: {
      value  () {
        return new eYo.geom.Rect()
      },
      copy: true,
    },
    numbering: {
      after: 'board',
      set_ (builtin, after) {
        this.wrapUpdate(() => builtin(after))
      },
      value: false,
    },
    updateDepth: 0,
    scale: {
      value: 1,
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
    options: {
      get () {
        return this.board && this.board.options.zoom || {}
      },
    },
    /**
     * The port rect is at least enclosing all the bricks.
     * In view coordinates.
     * @type {eYo.geom.Rect} 
     * @readonly 
     */
    portInView: {
      get () {
        return this.toView(this.port)
      },
    },
    /**
     * The default scroll value.
     * 
     * @type {eYo.geom.Point} 
     * @readonly 
     */
    dragDefault: {
      get () {
        return eYo.geom.tPoint(0*1.5, 0*0.25)
      },
    },
    /**
     * Whether the actual drag value is within the acceptable limits.
     * 
     * @type {Boolean} 
     */
    dragPastLimits: {
      get () {
        var r = this.dragLimits
        return r && this.drag.out(r)
      },
    },
    /**
     * The opposite of `drag`.
     * 
     * @type {eYo.geom.Point}
     * @readonly
     */
    scroll: {
      get () {
        return this.drag.mirrored()
      },
    },
    /**
     * The minimum port rect in board coordinates,
     * when the scroll value is default.
     * 
     * @type {eYo.geom.Rect} 
     * @readonly 
     */
    minPort: {
      get () {
        var ans = this.view
        ans.origin_.set()
        ans.unscale(this.scale)
        ans.left = -(this.numbering ? 5 : 3) * eYo.geom.X
        ans.top = -eYo.geom.Y
        return ans
      },
    },
    /**
     * The drag limits in view coordinates.
     * Used for dragging, gives the limiting values of the `scroll` property.
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
        ans.mirrored()
        return ans
      },
    },
    /**
     * Clone the object.
     */
    copy: {
      get () {
        var ans = new eYo.geom.Metrics()
        ans.scale_ = this.scale_
        ans.view_ = this.view_
        ans.port_ = this.port_
        ans.drag_ = this.drag_
        ans.box_ = this.box_
        return ans
      },
    },
    toString: {
      get () {
        if (!this.drag) {
          console.error('BREAK HERE!')
        }
        return `drag: ${this.drag.description}, view: ${this.view.description}, port: ${this.port.description}`
      },
    },
    /**
     * When this point is (0,0) the view topleft corner
     * and the (0,0) point in the port are exactly
     * at the same location on screen.
     * The drag div is translated by `drag•(i,j)` with respect to the view.
     * 
     * @type {eYo.geom.Point} 
     */
    drag: {
      get_ (builtin) {
        var ans = (builtin() || this.dragDefault).copy
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
  aliases: {
    'board': 'owner',
  },
  methods: {
    /**
     * Update the board.
     */
    update () {
      this.board && this.board.metricsDidChange()
    },
    /**
     * Update the board.
     */
    wrapUpdate (do_it) {
      try {
        ++this.updateDepth__
        do_it()
      } finally {
        if(--this.updateDepth__) {
          return
        }
        this.update()
      }
    },
    /**
     * Convert the given argument from `board` coordinates to `view` coordinates.
     * @param{eYo.geom.Rect | eYo.geom.Point} WR
     */
    toView (WR) {
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
      return WR.scale(this.scale).forward(this.drag)
    },
    /**
     * Convert the given argument from `view` coordinates to `board` coordinates.
     * @param{eYo.geom.Rect | eYo.geom.Point} wr
     */
    fromView (wr) {
      return wr.backward(this.drag).unscale(this.scale)
    },
    /**
     * Test whether the receiver equals the given metrics object.
     * @param {eYo.geom.Metrics} rhs Another metrics.
     * @return {boolean} Whether the two sets of metrics are equivalent.
     * @private
     */
    equals (rhs) {
      return rhs && this.view.equals(rhs.view) &&
      this.scale === rhs.scale &&
      this.drag.equals(rhs.drag) &&
      this.port.equals(rhs.port)
    },
  },
})

/**
 * Get the dragging limits.
 * Reference is the brick board.
 * @param{?eYo.geom.Rect} rect
 */
console.error('MISSING IMPLEMENTATION')
eYo.geom.Metrics_p.getDraggingLimits = function (rect) {
  var view = this.minPort
  var limits = this.port
  if (rect) {

  }
}
