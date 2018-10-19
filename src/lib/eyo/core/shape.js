/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview block shape utilities for edython.
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
  Selected: {
    colour: '#fc3',
    width: 2.675, // px
  },
  Error: {
    colour: '#c33'
  },
  colour: goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 90 / 100)),
  inner_colour: goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 97 / 100)),
  width: 1.5 // px
}

/**
 * parameters.
 * 
 * Geometrical conditions for the caret dimensions
 * with respect to the block ones are detailled below
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
        return this.min_expr_radius * 2.5
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
 * end
 */
eYo.Shape.prototype.end = function (noClose = false) {
  if (!noClose && this.steps.length) {
    this.steps.push('z')
  }
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
 * @param {*?} is_block  In block coordinates, when true and present
 * @param {*?} c 
 * @param {*?} l 
 */
eYo.Shape.prototype.m = function (is_block, c = 0, l = 0) {
  if (is_block === true) {
    if (goog.isDef(c.x) && goog.isDef(c.y)) {
      l = c.y
      c = c.x
    }
    this.push('m', c, ',', l)
    this.cursor.advance({x: c, y: l})
    return
  } else if (is_block !== false) {
    l = c
    c = is_block
  }
  this.push('m', c * eYo.Unit.x, ',', l * eYo.Unit.y)
  this.cursor.advance(c, l)
}

/**
 * `M` for move with absolute arguments.
 * @param {*?} is_block  In block coordinates, when true and present
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
    this.push('M', c, ',', l)
    return
  } else if (is_block !== false) {
    l = c
    c = is_block
  }
  this.push('M', c * eYo.Unit.x, ',', l * eYo.Unit.y)
  this.cursor.set(c, l)
}

/**
 * `l` for line with relative arguments.
 * @param {*?} is_block  In block coordinates, when true and present
 * @param {*?} c 
 * @param {*?} l 
 */
eYo.Shape.prototype.l = function (is_block, c = 0, l = 0) {
  if (is_block === true) {
    if (goog.isDef(c.x) && goog.isDef(c.y)) {
      l = c.y
      c = c.x
    }
    this.push('l', c, ',', l)
    this.cursor.advance({x: c, y: l})
    return
  } else if (is_block !== false) {
    l = c
    c = is_block
  }
  this.push('l', c * eYo.Unit.x, ',', l * eYo.Unit.y)
  this.cursor.advance(c, l)
}

/**
 * `L` for line with absolute arguments.
 * @param {*?} is_block  In block coordinates, when true and present
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
  this.push('L', c * eYo.Unit.x, ',', l * eYo.Unit.y)
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
    this.push('H', c)
    this.cursor.x = c
    return
  } else if (is_block !== false) {
    c = is_block
  }
  this.push('H', c * eYo.Unit.x)
  this.cursor.c = c
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
    this.push('v', l * eYo.Unit.x)
    this.cursor.l += l
  }
}

/**
 * `V` for vertical line with absolute coordinates.
 * @param {*} l 
 */
eYo.Shape.prototype.V = function (is_block, l) {
  if (is_block === true) {
    this.push('V', l)
    this.cursor.y = l
    return
  } else if (is_block !== false) {
    l = is_block
  }
  this.push('V', l * eYo.Unit.x)
  this.cursor.l = l
}

/**
 * 1/4 circle
 * 
 * @param {*} left 
 * @param {*} down 
 */
eYo.Shape.prototype.quarter_circle = function (left = true, down = true) {
  var r = this.stmt_radius
  var dx = left ? -r : r
  var dy = down ? r : -r
  var r = this.stmt_radius
  var a = 'a ' + this.format(r) + ', ' + this.format(r) + ' 0 0 ' + (down ? 0 : 1) + ' '
  this.push(a, dx, ',', dy)
  this.cursor.advance(dx, dy)
}

/**
 * arc
 * @param {*} h 
 * @param {*} left 
 * @param {*} down 
 */
eYo.Shape.prototype.arc = function (h, left = true, down = true) {
  var r = this.expr_radius
  var dx = 0
  var dy = goog.isDef(h.y) ? h.y : h
  dy = down ? dy : -dy
  this.push('a ', r, ',', r, '0 0', (left === down? 0 : 1), dx, ',', dy)
  this.cursor.advance(dx, dy)
}

/**
 * create a shape with the given block delegate.
 * @param {eYo.DelegateSvg!} eyo  Block delegate
 */
eYo.Shape.newWithBlock = function(eyo) {
  var ans = new eYo.Shape()
  ans.initWithBlock(eyo)
  return ans
}

/**
 * Create a path definition with the given block delegate.
 * @param {eYo.DelegateSvg!} eyo  A block delegate.
 * @return {String!} A path definition.
 */
eYo.Shape.definitionWithBlock = function(eyo) {
  eYo.Shape.shared.initWithBlock(eyo)
  return eYo.Shape.shared.definition
}

/**
 * Inits a shape with the given block delegate.
 * @param {eYo.DelegateSvg!} eyo  Block delegate
 */
eYo.Shape.prototype.initWithBlock = (function () {
/**
 * Inits a shape with the given block delegate.
 * @param {eYo.DelegateSvg!} eyo  Block delegate
 */
var initWithStatementBlock = function(eyo) {
  // standard statement
  var width = eyo.block_.width
  this.M(true, width - eYo.Unit.x / 2)
  this.v(true, eYo.Unit.y)
  var r = this.stmt_radius
  if (eyo.hasNextStatement_()) {
    this.H(1 / 2)     
  } else {
    this.H(true, eYo.Unit.x / 2 + r)
    this.quarter_circle(true, false)
  }
  if (eyo.hasPreviousStatement_()) {
    this.V(0)
  } else {
    this.V(true, r)
    this.quarter_circle(false, false)
  }
}

/**
 * Inits a shape with the given block delegate.
 * @param {eYo.DelegateSvg!} eyo  Block delegate
 */
var initWithGroupBlock = function(eyo) {
  // this is a group
  var r = this.stmt_radius
  var previous = this.hasPreviousStatement_()
  if (previous) {
    this.M(1 / 2)
  } else {
    this.M(true, eYo.Unit.x / 2 + r)
  }
  this.H(true, width - eYo.Unit.x / 2)
  this.v(1)
  this.H(true, eYo.Font.tabWidth + r)
  this.quarter_circle(true, true)
  this.v(true, (block.isCollapsed ? eYo.Unit.y : eyo.size.height) - 2 * r)
  this.quarter_circle(true, false)
  var next = this.hasNextStatement_()
  if (next) {
    this.H(0)
  } else {
    this.H(true, r)
    this.quarter_circle(false, true)
  }
  if (previous) {
    this.V(0)
  } else {
    this.V(true, r)
    this.quarter_circle(false, false)
  }
}

/**
 * Inits a shape with the given block delegate.
 * @param {eYo.DelegateSvg!} eyo  Block delegate
 */
var initWithExpressionBlock = function(eyo) {
  var block = eyo.block_
  var width = Math.max(block.width, eyo.size.x)
  var dd = this.caret_extra
  var h = eYo.Unit.y / 2
  var r = this.expr_radius
  var dx = Math.sqrt(r**2 - this.caret_height**2 / 4) -  Math.sqrt(r**2 - h**2)
  this.M(true, width - eYo.Unit.x / 2 - dx + dd / 2)
  this.arc(eYo.Unit.y, false, true)
  var parent
  if (eyo.tileHead && !eyo.tileHead.eyo.tilePrevious && (parent = block.getParent())) {
    while (parent && parent.outputConnection) {
      parent = parent.getParent()
    }
    if (parent) {
      if (parent.eyo.hasNextStatement_()) {
        this.H(1/2)
        if (parent.eyo.hasPreviousStatement_()) {
          this.V(0)
        } else {
          this.V(true, this.stmt_r)
          this.quarter_circle(false, false)
        }
      } else {
        this.H(true, eYo.Unit.x / 2 + this.stmt_r)
        this.quarter_circle(false, true)
        if (parent.eyo.hasPreviousStatement_()) {
          this.V(0)
        } else {
          this.V(true, this.stmt_r)
          this.quarter_circle(false, false)
        }
      }
    } else {
      this.H(true, dx + eYo.Unit.x / 2 - dd / 2)
      this.arc(eYo.Unit.y, true, false)
    }
  } else {
    this.H(true, dx + eYo.Unit.x / 2 - dd / 2)
    this.arc(eYo.Unit.y, true, false)
  }
}

var initWithControlBlock = function (eyo) {
  var block = eyo.block_
  /* eslint-disable indent */
  var w = block.width - eYo.Unit.x
  var h = block.height
  var r = this.stmt_radius
  var d = eYo.Unit.x
  var lh = eYo.Unit.y / 2
  var blh = lh * 1.5
  this.M(1.5, 0)
  this.push('a', lh, ',', lh, '0 0 1',  blh, ',0')
  this.push('a', lh, ',', lh, '0 1 1', -blh, ',0')
  this.m(true, blh)
  this.h(true, w - blh - d)
  this.v(true, h)
  if (eyo.hasNextStatement_()) {
    this.H(true, d / 2)
  } else {
    this.H(true, d / 2 + r)
    this.quarter_circle(true, false)
  }
  this.V(true, r)
  this.quarter_circle(false, false)
  this.h(true, d - r)
  return true
} /* eslint-enable indent */

return function(eyo) {
    this.begin()
    var block = eyo.block_
    var ans
    if (block.outputConnection) {
      ans = initWithExpressionBlock.call(this, eyo)
    } else if (eyo.inputSuite) {
      ans = initWithGroupBlock.call(this, eyo)
    } else if (eyo.runScript) {
      ans = initWithControlBlock.call(this, eyo)
    } else {
      ans = initWithStatementBlock.call(this, eyo)
    }
    this.end(ans)
  }
}) ()

/**
 * Create a shape with the given connection delegate.
 * @param {eYo.ConnectionDelegate!} eyo  A connection delegate.
 */
eYo.Shape.newWithConnection = function(eyo) {
  var ans = new eYo.Shape()
  ans.initWithConnection(eyo)
  return ans
}

/**
 * Create a path definition with the given connection delegate.
 * @param {eYo.ConnectionDelegate!} eyo  A connection delegate.
 * @return {String!} A path definition.
 */
eYo.Shape.definitionWithConnection = function(eyo) {
  eYo.Shape.shared.initWithConnection(eyo)
  return eYo.Shape.shared.definition
}

/**
 * create a shape with the given connection delegate.
 * @param {?eYo.ConnectionDelegateSvg} eyo  Connection delegate
 */
eYo.Shape.prototype.initWithConnection = function(eyo) {
  this.begin()
  var dd = this.caret_extra
  if (eyo) {
    var shape = eyo.shape || eyo.side || eYo.Key.NONE
    var x = eyo.x
    var y = eyo.y
    this.width = eyo.w
  } else {
    x = 0
    y = 0
    this.width = 3
  }
  if (eyo && eyo.bindField) {
    this.M(true, x + (this.width + 1 / 2) * eYo.Unit.x - dd, y + (eYo.Unit.y - this.caret_height)/ 2)
    this.arc(this.caret_height, false, true)
    this.h(true, - this.width * eYo.Unit.x + 2 * dd)
    if (eyo && eyo.startOfStatement) {
      this.v(true, -this.caret_height)
    } else {
      this.arc(this.caret_height, true, false)
    }
  } else if (this.width > 1) {
    var dd = 2 * this.caret_extra
    var h = eYo.Unit.y / 2
    var r = this.expr_radius
    var dx = Math.sqrt(r**2 - this.caret_height**2 / 4) -  Math.sqrt(r**2 - h**2)
    var p_h = this.caret_height
    this.M(true, x + (this.width - 1 / 2) * eYo.Unit.x - dd / 2, y + (eYo.Unit.y - p_h)/ 2)
    this.arc(this.caret_height, false, true)
    this.h(true, (1 - this.width) * eYo.Unit.x + dd)
    if (eyo && eyo.startOfStatement) {
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
    this.M(true, x + eYo.Unit.x / 2, y + (eYo.Unit.y - this.caret_height)/ 2)
    this.h(true, -dd / 2)
    this.arc(this.caret_height, true, true)
    this.h(true, dd / 2)
  } else {
    this.M(true, x + (this.width - 1 / 2) * eYo.Unit.x + dd / 2, y + (eYo.Unit.y - this.caret_height)/ 2)
    this.arc(this.caret_height, false, true)
    this.h(true, (1 - this.width) * eYo.Unit.x - dd)
    this.arc(this.caret_height, !eyo || !eyo.isAfterRightEdge, false)
  }
  this.end()
}

/**
 * initPlay
 * @param {*} cursor 
 */
eYo.Shape.prototype.initForPlay = function (cursor) {
  this.begin()
  var lh = eYo.Unit.y / 2
  var ratio = 1.5
  var blh = lh * ratio
  var y = lh * Math.sqrt(1 - (ratio / 2) ** 2)
  var d = cursor.x + eYo.Unit.x + blh / 2 + eYo.Unit.x - eYo.Padding.l
  this.m(true, d + 2 * y / Math.sqrt(3), y)
  this.l(true, -Math.sqrt(3) * y, y)
  this.l(true, 0, -2 * y)
  this.end()
}

/**
 * Create a path definition for the play icon.
 * @param {eYo.ConnectionDelegate!} eyo  A connection delegate.
 * @return {String!} A path definition.
 */
eYo.Shape.definitionForPlay = function(cursor) {
  eYo.Shape.shared.initForPlay(cursor)
  return eYo.Shape.shared.definition
}
