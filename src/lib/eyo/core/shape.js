/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview brick shape utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Shape')

goog.require('eYo.Font')
goog.require('eYo.Geometry')
goog.require('eYo.Padding')

/**
 * @constructor
 */
eYo.Shape = function () {
  this.size = new eYo.Size()
  this.cursor = new eYo.Where()
  // allways start from the top left
}

eYo.Shape.shared = new eYo.Shape()

eYo.Shape.Style = {
  Hilighted: {
    colour: '#fc3',
    width: 2.675, // px
  },
  Error: {
    colour: '#c33'
  },
  colour: {
    light: goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 90 / 100)),
    medium: goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 70 / 100)),
    dark: goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 50 / 100)),
  },
  inner_colour: {
    light: goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 97 / 100)),
    medium: goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 90 / 100)),
    dark: goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 75 / 100)),
  },
  width: {
    light: 0.5,
    medium: 0.75,
    dark: 1
  } // px
}

/**
 * parameters.
 *
 * Geometrical conditions for the caret dimensions
 * with respect to the brick ones are detailled below
 */
Object.defineProperties(
  eYo.Shape.prototype,
  {
    min_expr_radius: {
      get () {
        var w = eYo.Unit.x
        var h = eYo.Unit.y / 2
        return (w ** 2 + h ** 2) / 2 / w
      }
    },
    expr_radius: {
      get () {
        return this.min_expr_radius * 2
      }
    },
    caret_width: {
      get () {
        var r = this.expr_radius
        var h = eYo.Unit.y / 2
        return r - Math.sqrt(r**2 - h**2)
      }
    },
    max_caret_extra: {
      get () {
        return eYo.Unit.x - this.caret_width / 2
      }
    },
    caret_extra: { // half the H width
      get () {
        return 0.25 * this.max_caret_extra // coefficient in ]0 ; 1]
      }
    },
    caret_height: {
      get () {
        var r = this.expr_radius
        var w = this.caret_width
        return Math.sqrt(w * (4 * r - w))
      }
    },
    stmt_radius: {
      get () {
        return (eYo.Unit.y - this.caret_height) / 2
      }
    },
    hilighted_width: {
      get () {
        return eYo.Style.Path.Hilighted.width / 2
      }
    },
    definition: {
      get () {
        return this.steps.join(' ')
      }
    }
  }
)

/**
 * begin
 */
eYo.Shape.prototype.begin = function () {
  this.steps = []
  this.cursor.set()
  this.dc = this.dl = 0
}

/**
 * z
 */
eYo.Shape.prototype.z = eYo.Shape.prototype.Z = function () {
  this.steps.push('z')
}

/**
 * end
 * @return {!Object} The receiver.
 */
eYo.Shape.prototype.end = function (noClose = false) {
  if (!noClose && this.steps.length) {
    this.z()
  }
  return this
}

/**
 * formatter.
 * @param {Number} x
 */
eYo.Shape.prototype.format = function (x) {
  return Math.round(1000 * x) / 1000
}

/**
 * end
 */
eYo.Shape.prototype.push = function () {
  var i
  for(i = 0; i < arguments.length ; i++) {
    var arg = arguments[i]
    if (goog.isString(arg)) {
      this.steps.push(arg)
    } else if (goog.isArray(arg)) {
      var j = 0
      for(j = 0; j < arg.length ; j++) {
        this.push(arg[j])
      }
    } else {
      this.steps.push(this.format(arg))
    }
  }
}

/**
 * `m` for move with relative arguments.
 * @param {*?} is_block  In brick coordinates, when true and present
 * @param {*?} c
 * @param {*?} l
 */
eYo.Shape.prototype.m = function (is_block, c = 0, l = 0) {
  if (is_block === true) {
    if (goog.isDef(c.x) && goog.isDef(c.y)) {
      l = c.y
      c = c.x
    }
    this.push('m', `${this.format(c)},${this.format(l)}`)
    this.cursor.advance({x: c, y: l})
    return
  } else if (is_block !== false) {
    l = c
    c = is_block
  }
  if (goog.isDef(c.x) && goog.isDef(c.y)) {
    l = c.y
    c = c.x
  }
  this.push('m', `${c * eYo.Unit.x},${l * eYo.Unit.y}`)
  this.cursor.advance(c, l)
}

/**
 * `M` for move with absolute arguments.
 * @param {*?} is_block  In brick coordinates, when true and present
 * @param {*?} c
 * @param {*?} l
 */
eYo.Shape.prototype.M = function (is_block, c = 0, l = 0) {
  if (is_block === true) {
    if (goog.isDef(c.x) && goog.isDef(c.y)) {
      l = c.y
      c = c.x
    }
    this.cursor.set({x: c, y: l})
    this.push('M', `${this.format(c)},${this.format(l)}`)
    return
  } else if (is_block !== false) {
    l = c
    c = is_block
  }
  if (goog.isDef(c.x) && goog.isDef(c.y)) {
    l = c.y
    c = c.x
  }
  this.push('M', `${c * eYo.Unit.x},${l * eYo.Unit.y}`)
  this.cursor.set(c, l)
}

/**
 * `l` for line with relative arguments.
 * @param {*?} is_block  In brick coordinates, when true and present
 * @param {*?} c
 * @param {*?} l
 */
eYo.Shape.prototype.l = function (is_block, c = 0, l = 0) {
  if (is_block === true) {
    if (goog.isDef(c.x) && goog.isDef(c.y)) {
      l = c.y
      c = c.x
    }
    this.push('l', `${this.format(c)},${this.format(l)}`)
    this.cursor.advance({x: c, y: l})
    return
  } else if (is_block !== false) {
    l = c
    c = is_block
  }
  this.push('l', `${c * eYo.Unit.x},'${l * eYo.Unit.y}`)
  this.cursor.advance(c, l)
}

/**
 * `L` for line with absolute arguments.
 * @param {*?} is_block  In brick coordinates, when true and present
 * @param {*?} c
 * @param {*?} l
 */
eYo.Shape.prototype.L = function (is_block, c = 0, l = 0) {
  if (is_block === true) {
    if (goog.isDef(c.x) && goog.isDef(c.y)) {
      l = c.y
      c = c.x
    }
    this.cursor.set({x: c, y: l})
    this.push('L', c, ',', l)
    return
  } else if (is_block !== false) {
    l = c
    c = is_block
  }
  this.push('L', `${c * eYo.Unit.x},${l * eYo.Unit.y}`)
  this.cursor.set(c, l)
}

/**
 * `h` for horizontal line with relative coordinates.
 * @param {*} is_block
 * @param {*} c
 */
eYo.Shape.prototype.h = function (is_block = false, c = 0) {
  if (is_block === true) {
    if (c) {
      this.push('h', c)
      this.cursor.x += c
    }
    return
  } else if (is_block !== false) {
    c = is_block
  }
  if (c) {
    this.push('h', c * eYo.Unit.x)
    this.cursor.c += c
  }
}

/**
 * `H` for horizontal line with absolute coordinates.
 * @param {*} is_block
 * @param {*} c
 */
eYo.Shape.prototype.H = function (is_block = false, c = 0) {
  if (is_block === true) {
    if (this.cursor.x !== c) {
      this.push('H', c)
      this.cursor.x = c
    }
    return
  } else if (is_block !== false) {
    c = is_block
  }
  if (this.cursor.c !== c) {
    this.push('H', c * eYo.Unit.x)
    this.cursor.c = c
  }
}

/**
 * `v` for vertical line with relative coordinates.
 * @param {*} l
 */
eYo.Shape.prototype.v = function (is_block, l) {
  if (is_block === true) {
    if (l) {
      this.push('v', l)
      this.cursor.y += l
    }
    return
  } else if (is_block !== false) {
    l = is_block
  }
  if (l) {
    this.push('v', l * eYo.Unit.y)
    this.cursor.l += l
  }
}

/**
 * `V` for vertical line with absolute coordinates.
 * @param {Boolean} is_block, when 'true', units are given in brick coordinates
 * @param {*} l
 */
eYo.Shape.prototype.V = function (is_block, l) {
  if (is_block === true) {
    if (this.cursor.y !== l) {
      this.push('V', l)
      this.cursor.y = l
    }
    return
  } else if (is_block !== false) {
    l = is_block
  }
  if (this.cursor.l !== l) {
    this.push('V', l * eYo.Unit.y)
    this.cursor.l = l
  }
}

/**
 * 1/4 circle.
 * We start drawing from the right edge.
 * When counter clockwise,
 * part = 0 -> 0° ≤ angle ≤ 0° + 90°
 * part = 1 -> 90° ≤ angle ≤ 90° + 90°
 * part = 2 -> 180° ≤ angle ≤ 180° + 90°
 * part = 3 -> 270° ≤ angle ≤ 270° + 90°
 * When clockwise,
 * part = 0 -> 0° ≤ -angle ≤ 0° + 90°
 * part = 1 -> 90° ≤ -angle ≤ 90° + 90°
 * part = 2 -> 180° ≤ -angle ≤ 180° + 90°
 * part = 3 -> 270° ≤ -angle ≤ 270° + 90°
 *
 * @param {?Number} r  optional radius.
 * @param {?Boolean} clockwise  Drawing direction.
 * @param {?Number} part  part is in [[0, 3]].
 */
eYo.Shape.prototype.quarter_circle = function (r, clockwise, part) {
  if (r === true || r === false) {
    part = clockwise
    clockwise = r
    r = this.hilighted_width
  }
  this.push(`a ${this.format(r)},${this.format(r)} 0 0 ${clockwise ? 1 : 0}`)
  var dx = 0
  var dy = 0
  switch (part) {
    case 0: dx = -r; dy = r; break;
    case 1: dx = -r; dy = -r; break;
    case 2: dx = r; dy = -r; break;
    default: dx = r; dy = r; break;
  }
  if (!clockwise) {
    dy = -dy
  }
  this.push(`${this.format(dx)},${this.format(dy)}`)
  this.cursor.advance(dx, dy)
}

/**
 * 1/2 circle.
 * We start drawing from the right edge.
 * When counter clockwise,
 * part = 0 -> 0° ≤ angle ≤ 0° + 180°
 * part = 1 -> 90° ≤ angle ≤ 90° + 180°
 * part = 2 -> 180° ≤ angle ≤ 180° + 180°
 * part = 3 -> 270° ≤ angle ≤ 270° + 180°
 * When clockwise,
 * part = 0 -> 0° ≤ -angle ≤ 0° + 180°
 * part = 1 -> 90° ≤ -angle ≤ 90° + 180°
 * part = 2 -> 180° ≤ -angle ≤ 180° + 180°
 * part = 3 -> 270° ≤ -angle ≤ 270° + 180°
 *
 * @param {?Number} r  optional radius. At least 2 arguments are required.
 * @param {?Boolean} part  part is in [[0, 3]].
 * @param {?Boolean} clockwise  Drawing direction.
 */
eYo.Shape.prototype.half_circle = function (r, clockwise, part) {
  if (part === true || part === false) {
    part = clockwise
    clockwise = r
    r = this.hilighted_width
  }
  this.push(`a ${this.format(r)},${this.format(r)} 0 0 ${clockwise ? 1 : 0} `)
  var dx = 0
  var dy = 0
  switch (part) {
    case 0: dx = -2 * r; break
    case 1: dy = 2 * r; break
    case 2: dx = 2 * r; break
    default: dy = -2 * r; break
  }
  this.push(`${this.format(dx)},${this.format(dy)}`)
  this.cursor.advance(dx, dy)
}

/**
 * arc
 * @param {Number|Size} h
 * @param {Number} r  optional radius
 * @param {Boolean} left
 * @param {Boolean} down
 */
eYo.Shape.prototype.arc = function (h, r = true, left = true, down = true) {
  if (r === true || r === false) {
    down = left
    left = r
    r = this.expr_radius
  }
  var dx = goog.isDef(h.x) ? h.x : 0
  var dy = goog.isDef(h.y) ? h.y : h
  dy = down ? dy : -dy
  this.push('a', `${this.format(r)},${this.format(r)}`, '0 0', (left === down? 0 : 1), `${this.format(dx)},${this.format(dy)}`)
  this.cursor.advance(dx, dy)
}

/**
 * create a shape with the given brick delegate.
 * @param {eYo.Brick!} eyo  Block delegate
 */
eYo.Shape.newWithBrick = function(eyo) {
  return new eYo.Shape().initWithBrick(eyo)
}

/**
 * Create a path definition with the given brick delegate.
 * @param {eYo.Brick!} eyo  A brick delegate.
 * @param {Object} opt  options.
 * @return {String!} A path definition.
 */
eYo.Shape.definitionWithBrick = function(eyo, opt) {
  return eYo.Shape.shared.initWithBrick(eyo, opt).definition
}

/**
 * Inits a shape with the given brick delegate.
 * @param {eYo.Brick!} eyo  Block delegate
 */
eYo.Shape.prototype.initWithBrick = (() => {
/**
 * Inits a shape with the given brick delegate.
 * @param {eYo.Brick!} eyo  Block delegate
 * @return {!Object} The receiver.
 */
var initWithStatementBrick = function(eyo, opt) {
  // standard statement
  var width = eyo.width
  var r = this.stmt_radius
  if (eyo.right) {
    this.M(true, width - eYo.Unit.x / 2 + r)
    this.quarter_circle(r, false, 1)
    this.V(true, eYo.Unit.y - r)
    this.quarter_circle(r, false, 2)
  } else {
    this.M(true, width - eYo.Unit.x / 2)
    this.v(opt && opt.dido ? eyo.mainHeight + eyo.blackHeight + eyo.suiteHeight + eyo.belowHeight : eyo.mainHeight + eyo.blackHeight)
  }
  if (eyo.next) {
    this.H(1 / 2)
  } else {
    this.H(true, eYo.Unit.x / 2 + r)
    this.quarter_circle(r, true, 1)
  }
  if (eyo.head) {
    this.V(0)
  } else {
    this.V(true, r)
    this.quarter_circle(r, true, 2)
  }
  return this
}

/**
 * Inits a shape with the given brick delegate.
 * @param {eYo.Brick!} eyo  Block delegate
 * @return {!Object} The receiver.
 */
var initWithGroupBrick = function(eyo, opt) {
  // this is a group
  var w = eyo.span.width
  var r = this.stmt_radius
  if (eyo.right) {
    // simple statement with a right brick
    this.M(true, w - eYo.Unit.x / 2 + r, 0)
    this.quarter_circle(r, false, 1)
    this.V(true, eyo.mainHeight * eYo.Unit.y - r)
    this.quarter_circle(r, false, 2)
  } else if (eyo.left) {
    // simple statement with no right brick
    this.M(true, w - eYo.Unit.x / 2, 0)
    this.V(eyo.mainHeight)
  } else {
    this.M(true, w - eYo.Unit.x / 2, 0)
    if (opt && opt.dido) {
      this.v(eyo.mainHeight + eyo.blackHeight + eyo.suiteHeight + eyo.belowHeight)
    } else {
      this.v(eyo.mainHeight)
      this.H(true, eYo.Font.tabWidth + r + eYo.Unit.x / 2)
      this.quarter_circle(r, false, 1)
      this.v(true, (eyo.collapsed ? eYo.Unit.y : eyo.span.height - eYo.Unit.y) - 2 * r)
      this.quarter_circle(r, false, 2)
    }
  }
  if (eyo.next) {
    this.H(1/2)
  } else {
    this.H(true, eYo.Unit.x / 2 + r)
    this.quarter_circle(r, true, 1)
  }
  if (eyo.head) {
    this.V(0)
  } else {
    this.V(true, r)
    this.quarter_circle(r, true, 2)
  }
  return this
}

/**
 * Inits a shape with the given brick delegate.
 * @param {eYo.Brick!} eyo  Block delegate
 * @return {!Object} The receiver.
 */
var initWithExpressionBrick = function(brick, opt) {
  var width = Math.max(brick.width, eyo.span.width)
  if (opt && opt.bbox) {
    this.M(true, width)
    this.V(eyo.span.l)
    this.H(0)
    this.V(0)
    this.z()
    return this
  }
  var dd = this.caret_extra
  var h = eYo.Unit.y / 2
  var r = this.expr_radius
  var dx = Math.sqrt(r**2 - this.caret_height**2 / 4) -  Math.sqrt(r**2 - h**2)
  this.M(true, width - eYo.Unit.x / 2 - dx + dd / 2)
  eyo.span.l > 1 && this.V(eyo.span.l - 1)
  this.arc(eYo.Unit.y, false, true)
  var parent
  if (eyo.startOfStatement && (parent = eyo.parent)) {
    if ((parent = eyo.stmtParent)) {
      if (parent.next) {
        this.H(1/2)
      } else {
        this.H(true, eYo.Unit.x / 2 + this.stmt_radius)
        this.quarter_circle(this.stmt_radius, true, 2)
      }
      if (parent.head) {
        this.V(0)
      } else {
        this.V(true, this.stmt_radius)
        this.quarter_circle(this.stmt_radius, true, 3)
      }
    } else {
      this.H(true, dx + eYo.Unit.x / 2 - dd / 2)
      this.arc(eYo.Unit.y, true, false)
      this.V(0)
    }
  } else {
    this.H(true, dx + eYo.Unit.x / 2 - dd / 2)
    this.arc(eYo.Unit.y, true, false)
  }
  return this
}

var initWithControlBrick = function (eyo) {
  return initWithGroupBrick.call(this, eyo)
}

return function(eyo, opt) {
    this.begin()
    var f
    if (eyo.out_m) {
      f = initWithExpressionBrick
    } else if (opt && opt.dido) {
      f = initWithStatementBrick
    } else if (eyo.isControl) {
      f = initWithControlBrick
    } else if (eyo.suite_m) {
      f = initWithGroupBrick
    } else {
      f = initWithStatementBrick
    }
    f.call(this, eyo, opt)
    this.end(opt && opt.noClose)
    return this
  }
}) ()

/**
 * Create a shape with the given connection delegate.
 * @param {eYo.Magnet!} magnet  A connection delegate.
 */
eYo.Shape.newWithMagnet = function(magnet) {
  return new eYo.Shape().initWithMagnet(magnet)
}

/**
 * Create a path definition with the given connection delegate.
 * @param {eYo.Magnet!} m4t  A connection delegate.
 * @param {?Object} opt  Optional kv arguments
 * @return {String!} A path definition.
 */
eYo.Shape.definitionWithMagnet = function(m4t, opt) {
  return eYo.Shape.shared.initWithMagnet(m4t, opt).definition
}

/**
 * create a shape with the given connection delegate.
 * @param {?eYo.MagnetSvg} magnet  Magnet
 * @param {?Object} opt  Optional kv arguments
 * @return {!Object} The receiver.
 */
eYo.Shape.prototype.initWithMagnet = function(magnet, opt) {
  var dd = this.caret_extra
  if (magnet) {
    var brick = magnet.brick
    var m4t
    if (brick && brick.wrapped_ && opt && opt.absolute && (m4t = brick.out_m)) {
      var where = new eYo.Where(magnet)
      do {
        var t9k = m4t.targetBrick
        where.advance(t9k)
      } while(t9k && t9k.wrapped_ && (m4t = t9k.out_m))
    } else {
      where = magnet
    }
    var x = where.x
    var y = where.y
    this.width = magnet.w
    if (magnet.startOfStatement) {
      magnet.shape = eYo.Key.LEFT
    }
    var shape = magnet.shape || magnet.side || eYo.Key.NONE
  } else {
    x = 0
    y = 0
    this.width = 3
  }
  var r = this.hilighted_width
  this.begin()
  if (magnet && opt && opt.hilight) {
    if (magnet.isInput) {
      if (m4t.targetBrick) {
        this.push(magnet.targetBrick.ui.driver.pathValueDef_())
      } else if (!brick.disabled) {
        this.initWithMagnet(magnet, {absolute: true})
      }
    } else if (magnet.isOutput) {
      this.push(brick.ui.driver.pathValueDef_(magnet))
    } else { // statement connection
      var w = brick.span.width - eYo.Unit.x / 2
      if (magnet.isHead) {
        this.m(true, w - 4 * r, -r)
        this.half_circle(r, true, 3)
        this.h(true, -w + eYo.Unit.x - eYo.Padding.l + 8 * r)
        this.half_circle(r, true, 1)
      } else if (magnet.isFoot) {
        if (brick.span.l > 1) { // this is not clean design, really?
          this.m(true, eYo.Font.tabWidth, brick.span.height - r)
          this.half_circle(r, true, 3)
          this.h(true, -eYo.Font.tabWidth + 4 * r + eYo.Unit.x - eYo.Padding.l)
          this.half_circle(r, true, 1)
        } else {
          this.m(true, w - 4 * r, eYo.Unit.y - r)
          this.half_circle(r, true, 3)
          this.h(true, -w + eYo.Unit.x - eYo.Padding.l + 8 * r)
          this.half_circle(r, true, 1)
        }
      } else if (magnet.isSuite) {
        this.m(true, w - 4 * r, -r + eYo.Unit.y)
        this.half_circle(r, true, 3)
        this.h(true, eYo.Font.tabWidth - w + eYo.Unit.x / 2 + 8 * r)
        this.half_circle(r, true, 1)
      } else {
        this.M(true, (magnet.isLeft ? eYo.Unit.x / 2 : w) + r, eYo.Unit.y - 4 * r)
        this.half_circle(r, false, 0)
        this.v(true, - eYo.Unit.y + 8 * r)
        this.half_circle(r, false, 2)
      }
    }
  } else if (magnet && magnet.isLeft) {
    this.M(true, eYo.Unit.x / 2 + r, eYo.Unit.y - 4 * r)
    this.half_circle(r, true, 0)
    this.v(true, - eYo.Unit.y + 8 * r)
    this.half_circle(r, true, 2)
    this.z()
  } else if (magnet && magnet.isRight) {
    this.M(true, eYo.Unit.x / 2 + r, eYo.Unit.y - 4 * r)
    this.half_circle(r, true, 0)
    this.v(true, - eYo.Unit.y + 8 * r)
    this.half_circle(r, true, 2)
    this.z()
  } else if (magnet && magnet.bindField && !magnet.ignoreBindField) {
    this.width = 1 + (magnet.bindField.visible
      ? Math.max(this.width, 1)
      : 2)
    var w = this.width - 1
    this.M(true, x + (w + 1 / 2) * eYo.Unit.x - dd, y + (eYo.Unit.y - this.caret_height)/ 2)
    this.arc(this.caret_height, false, true)
    this.h(true, - w * eYo.Unit.x + 2 * dd)
    if (magnet && magnet.startOfStatement) {
      this.v(true, -this.caret_height)
    } else {
      this.arc(this.caret_height, true, false)
    }
  } else if (this.width > 1) {
    var dd = 2 * this.caret_extra
    var p_h = this.caret_height
    this.M(true, x + (this.width - 1 / 2) * eYo.Unit.x - dd / 2, y + (eYo.Unit.y - p_h)/ 2)
    this.arc(this.caret_height, false, true)
    this.h(true, (1 - this.width) * eYo.Unit.x + dd)
    if (magnet && magnet.startOfStatement) {
      this.v(true, -this.caret_height)
    } else {
      this.arc(this.caret_height, true, false)
    }
  } else if (shape === eYo.Key.LEFT) {
    this.M(true, x + eYo.Unit.x / 2, y + (eYo.Unit.y - this.caret_height)/ 2)
    this.h(true, dd / 2)
    this.arc(this.caret_height, false, true)
    this.h(true, -dd / 2)
  } else if (shape === eYo.Key.RIGHT) {
    // logically unreachable code
    this.M(true, x + eYo.Unit.x / 2, y + (eYo.Unit.y - this.caret_height)/ 2)
    this.h(true, -dd / 2)
    this.arc(this.caret_height, true, true)
    this.h(true, dd / 2)
  } else {
    this.M(true, x + (this.width - 1 / 2) * eYo.Unit.x + dd / 2, y + (eYo.Unit.y - this.caret_height)/ 2)
    this.arc(this.caret_height, false, true)
    this.h(true, (1 - this.width) * eYo.Unit.x - dd)
    this.arc(this.caret_height, !magnet || !magnet.isAfterRightEdge, false)
  }
  this.end()
  return this
}

/**
 * initForPlay
 * @param {*} cursor
 * @param {*} isContour
 * @return {!Object} The receiver.
 */
eYo.Shape.prototype.initForPlay = function (cursor, isContour) {
  this.begin()
  var lh = eYo.Unit.y / 2
  var ratio = 1.618
  var blh = lh * ratio
  var y = lh * Math.sqrt(1 - (ratio / 2) ** 2)
  var d = cursor.x + eYo.Unit.x + blh / 2 + eYo.Unit.x - eYo.Padding.l
  if (isContour) {
    var dr = eYo.Padding.t / 2
    var r = 2 * y / Math.sqrt(3) + dr
    this.M(true, d + 2 * y / Math.sqrt(3) + dr, lh)
    this.arc({x: -r, y: -r}, r, true)
    this.arc({x: -r, y: r}, r, true)
    this.arc({x: r, y: r}, r, true)
    this.arc({x: r, y: -r}, r, true)
  } else {
    this.M(true, d + 2 * y / Math.sqrt(3), lh)
    this.l(true, -Math.sqrt(3) * y, y)
    this.l(true, 0, -2 * y)
  }
  this.end()
  return this
}

/**
 * Create a path definition for the play icon.
 * @param {eYo.Magnet!} eyo  A connection delegate.
 * @return {String!} A path definition.
 */
eYo.Shape.definitionForPlayIcon = function(cursor) {
  eYo.Shape.shared.initForPlay(cursor, false)
  return eYo.Shape.shared.definition
}

/**
 * Create a path definition for the play icon.
 * @param {eYo.Magnet!} eyo  A connection delegate.
 * @return {String!} A path definition.
 */
eYo.Shape.definitionForPlayContour = function(cursor) {
  eYo.Shape.shared.initForPlay(cursor, true)
  return eYo.Shape.shared.definition
}
