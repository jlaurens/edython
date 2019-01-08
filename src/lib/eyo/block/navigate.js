/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Navigation for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Navigate')

goog.require('eYo.Selected')

/**
 * Tab navigation.
 * @param {?Object} opt Optional key value arguments.
 */
eYo.DelegateSvg.prototype.doTab = (() => {
  var c8n
  var input
  var ff = x => {
    var c = x.connection
    if (c) {
      var c_eyo = c.eyo
      if(c_eyo.wrapped_ || !c.hidden_) {
        if (c_eyo && c_eyo.isInput && !c_eyo.isIncog()) {
          return (input = x.input || x)
        }
      }
    }
  }
  var doLeft = (eyo) => {
    if ((c8n = eYo.Selected.connection) && !c8n.eyo.isIncog()) {
      if ((input = c8n.eyo.input)) {
        input = input.eyo.inputLeft
      }
    }
    if (!input) {
      eyo.forEachSlot(ff) || eyo.forEachInput(ff)
    }
    while (input) {
      if ((c8n = input.connection) && !c8n.hidden_ && c8n.eyo.isInput) {
        eYo.Selected.connection = c8n
        break
      }
      input = input.eyo.inputLeft
    }
  }
  var doRight = (eyo) => {
    if ((c8n = eYo.Selected.connection) && !c8n.eyo.isIncog()) {
      if ((input = c8n.eyo.input)) {
        input = input.eyo.inputRight
      }
    }
    if (!input) {
      if ((c8n = eyo.outputConnection) && (c8n = c8n.targetConnection) && c8n.isInput) {
        input = c8n.eyo.input
      }
    }
    if (!input) {
      eyo.someSlot(ff) || eyo.someInput(ff)
    }
    while (input) {
      if ((c8n = input.connection) && !c8n.hidden_ && c8n.eyo.isInput) {
        eYo.Selected.connection = c8n
        break
      }
      input = input.eyo.inputRight
    }
  }
  return function(opt) {
    var f = opt && opt.left ? doLeft : doRight
    var n = opt && opt.fast ? 4 : 1
    input = undefined
    while (n--) {
      f(this)
    }
  }
})()

/**
 * Get the closest box, according to the filter.
 * For edython.
 * @param {!Blockly.Workspace} workspace The owner of the receiver.
 * @param {function(point): number} weight is a function.
 * @return None
 */
eYo.DelegateSvg.getBestBlock = function (workspace, weight) {
  var smallest = Infinity
  var best
  workspace.topBlocks_.forEach(top => {
    var box = top.eyo.getBoundingRect()
    var w = weight(box.getCenter())
    if (w < smallest) {
      smallest = w
      best = top
    }
  })
  return best
}

/**
 * Get the closest box, according to the filter.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {function(point, point): number} distance is a function.
 * @return None
 */
eYo.DelegateSvg.prototype.getBestBlock = function (distance) {
  var block = this.block_
  const a = this.getBoundingBox()
  var smallest = {}
  var best
  this.workspace.topBlocks_.forEach(top => {
    if (top !== block) {
      var b = top.eyo.getBoundingBox()
      var target = top
      var c8n
      while ((c8n = target.nextConnection) && (target = c8n.targetBlock())) {
        b.expandToInclude(target.eyo.getBoundingBox())
      }
      var d = distance(a, b)
      if (d.major && (!smallest.major || d.major < smallest.major)) {
        smallest = d
        best = top
      } else if (d.minor && (!smallest.major && (!smallest.minor || d.minor < smallest.minor))) {
        smallest = d
        best = top
      }
    }
  })
  return best
}

/**
 * Select the block to the left of the owner.
 * For edython.
 * @return None
 */
eYo.DelegateSvg.prototype.selectLeft = function () {
  var target = this.selectedConnectionSource_
  if (target && target !== this) {
    target.selectLeft()
    return
  }
  var block = this.block_
  var doLast = B => {
    var e8r = B.eyo.inputEnumerator()
    e8r.end()
    while (e8r.previous()) {
      var c8n = e8r.here.connection
      if (c8n && (!c8n.hidden_ || c8n.eyo.wrapped_) && (c8n.eyo.isOutput)) {
        var target = c8n.targetBlock()
        if (!target || (!target.eyo.wrapped_ && !target.eyo.locked_) || (c8n = doLast(target))) {
          return c8n
        }
      }
    }
    return null
  }
  var parent, c8n
  var selectTarget = c8n => {
    var target = c8n.targetBlock()
    if (!target) {
      return false
    }
    if (!target.eyo.wrapped_ && !target.eyo.locked_) {
      eYo.Selected.connection = null
      target.select()
      return true
    }
    if ((c8n = doLast(target))) {
      if ((target = c8n.targetBlock())) {
        eYo.Selected.connection = null
        target.select()
      } else {
        eYo.Selected.connection = c8n
      }
      return true
    }
    return false
  }
  var selectConnection = c8n => {
    if (selectTarget(c8n)) {
      return true
    }
    // do not select a connection
    // if there is no unwrapped surround parent
    var parent = c8n.eyo.b_eyo
    while (parent.wrapped_ || parent.locked_) {
      if (!(parent = parent.group)) {
        return false
      }
    }
    eYo.Selected.connection = c8n
    return true
  }
  if ((c8n = this.selectedConnection)) {
    var c_eyo = c8n.eyo
    if (c_eyo.isNextLike || c_eyo.isOutput) {
      eYo.Selected.connection = null
      block.select()
      return true
    } else if (c_eyo.isOutput) {
      // select the previous non statement input if any
      var e8r = block.eyo.inputEnumerator()
      while (e8r.next()) {
        if (e8r.here.connection && c8n === e8r.here.connection) {
          // found it, step down
          e8r.previous()
          while (e8r.previous()) {
            if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c_eyo.wrapped_) && (c_eyo.isOutput)) {
              if (selectConnection(c8n)) {
                return true
              }
            }
          }
          break
        }
      }
      e8r.start(block)
      while (e8r.next()) {
        if (e8r.here.connection && c8n === e8r.here.connection) {
          // found it, step down
          e8r.previous()
          while (e8r.previous()) {
            if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.eyo.wrapped_) && (c8n.eyo.isOutput)) {
              if (selectConnection(c8n)) {
                return true
              }
            }
          }
          break
        }
      }
    } else if (!block.eyo.wrapped_ && !block.eyo.locked_) {
      eYo.Selected.connection = null
      block.select()
      return true
    }
  }
  if ((parent = block.getSurroundParent())) {
    // select the previous non statement input if any
    e8r = parent.eyo.inputEnumerator()
    while (e8r.next()) {
      if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.eyo.wrapped_) && block === c8n.targetBlock()) {
        // found it, step down
        e8r.previous()
        while (e8r.previous()) {
          if ((c8n = e8r.here.connection) && (!c8n.hidden_ || c8n.eyo.wrapped_) && (c8n.eyo.isOutput)) {
            if (selectConnection(c8n)) {
              return true
            }
          }
        }
        break
      }
    }
    do {
      if (!parent.eyo.wrapped_ && !parent.eyo.locked_) {
        eYo.Selected.connection = null
        parent.select()
        return true
      }
    } while ((parent = parent.getSurroundParent()))
  }
  target = this.root.getBestBlock((a, b) => {
    if (a.left <= b.left) {
      return {}
    }
    // b.left < a.left
    if (a.top - b.bottom > a.left - b.left) {
      return {minor: a.left - b.left + a.top - b.bottom}
    }
    if (b.top - a.bottom > a.left - b.left) {
      return {minor: a.left - b.left + b.top - a.bottom}
    }
    return {
      major: a.left - b.left + Math.abs(a.bottom + a.top - b.bottom - b.top) / 3,
      minor: b.bottom - b.top
    }
  })
  if (target) {
    target.select()
    return true
  }
}
/**
 * Select the block to the right of the owner.
 * The owner is either a selected block or wrapped into a selected block.
 * For edython.
 * @return yorn
 */
eYo.DelegateSvg.prototype.selectRight = function () {
  var target = this.selectedConnectionSource_
  if (target && target !== this) {
    return target.selectRight()
  }
  var block = this.block_
  var parent, c8n
  var selectTarget = c8n => {
    if ((target = c8n.targetBlock())) {
      if (target.eyo.wrapped_ || target.eyo.locked_) {
        return target.eyo.selectRight()
      } else {
        eYo.Selected.connection = null
        target.select()
        return true
      }
    }
    return false
  }
  var selectConnection = (c8n) => {
    if (c8n.hidden_ && !c8n.eyo.wrapped_) {
      return false
    }
    if (!selectTarget(c8n)) {
      parent = block.eyo
      while (parent.wrapped_ || parent.locked_) {
        if (!(parent = parent.group)) {
          return false
        }
      }
      eYo.Selected.connection = c8n
    }
    return true
  }
  var selectSlot = (slot) => {
    if (!slot.isIncog()) {
      var c8n = slot.connection
      if (c8n) {
        return (c8n.eyo.isOutput) && selectConnection(c8n)
      }
    }
  }
  if ((c8n = this.selectedConnection)) {
    if (c8n === this.nextConnection) {
      // select the target block (if any) when the nextConnection is in horizontal mode
      if (c8n.eyo.isAtRight) {
        if (selectTarget(c8n)) {
          return true
        }
      } else if (this.suiteConnection) {
        if ((target = this.suiteConnection.targetBlock())) {
          var eyo = target.eyo
          var next
          while ((next = eyo.next)) {
            eyo = next
          }
          selectConnection(eyo.nextConnection)
        }
      }
    } else if (c8n.eyo.isNextLike) {
      if (selectTarget(c8n)) {
        return true
      }
    } else if (selectTarget(c8n)) {
      // the connection was selected, now it is its target
      return true
    } else {
      // select the connection following `this.selectedConnection`
      // which is not a NEXT_STATEMENT one, if any
      var rightC8n
      while ((rightC8n = c8n.eyo.rightConnection())) {
        if (selectConnection(rightC8n)) {
          return
        }
        c8n = rightC8n
      }
      if (this.someInputConnection(
        c8n => c8n.eyo.isNextLike && selectConnection(c8n))
      ) {
        return true
      }
    }
  } else {
    // select the first non statement connection
    if (block.eyo.someSlot(slot => selectSlot(slot))) {
      return true
    }
    if (this.someInputConnection(
      c8n => c8n.eyo.isOutput && selectConnection(c8n)
    )) {
      return true
    }
    // all the input connections are either dummy or statement connections
    // select the first statement connection (there is an only one for the moment)
    if (this.someInputConnection(
      c8n => c8n.eyo.isNextLike && selectConnection(c8n)
    )) {
      return true
    }
  }
  if (!(c8n = this.selectedConnection) || (c8n.eyo.isOutput)) {
    // try to select the next connection of a surrounding block
    // only when a value input is connected to the block
    target = block
    while (target && (c8n = target.outputConnection) && (c8n = c8n.targetConnection)) {
      rightC8n = c8n
      while ((rightC8n = rightC8n.eyo.rightConnection())) {
        if (selectConnection(rightC8n)) {
          return true
        }
      }
      block = target
      target = c8n.sourceBlock_
    }
    if (this.someInputConnection(c8n => {
      if ((c8n.eyo.isNextLike) && (target = c8n.targetBlock()) && (target !== block)) {
        eYo.Selected.connection = null
        target.select()
        return true
      }
    })) {
      return true
    }
  }
  // now try to select a top block
  target = this.root.getBestBlock((a, b) => {
    if (a.right >= b.right) {
      return {}
    }
    // b.right > a.right
    if (a.top - b.bottom > b.right - a.right) {
      return {minor: b.right - a.right + a.top - b.bottom}
    }
    if (b.top - a.bottom > b.right - a.right) {
      return {minor: b.right - a.right + b.top - a.bottom}
    }
    return {
      major: b.right - a.right + Math.abs(a.bottom + a.top - b.bottom - b.top) / 3,
      minor: b.bottom - b.top
    }
  })
  if (target) {
    eYo.Selected.connection = null
    target.select()
    return true
  }
  if (parent) {
    eYo.Selected.connection = null
    parent.select()
    return true
  }
}

/**
 * Select the block above the owner.
 * For edython.
 * @return None
 */
eYo.DelegateSvg.prototype.selectAbove = function () {
  var target = this.selectedConnectionSource_
  if (target && target !== this) {
    target.selectAbove()
    return
  }
  var block = this.block_
  var c8n
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.previousConnection) {
      if ((target = c8n.targetBlock())) {
        eYo.Selected.connection = null
        target.select()
        return
      }
    } else {
      eYo.Selected.connection = null
      block.select()
      return
    }
  } else if ((c8n = block.previousConnection)) {
    block.select()
    eYo.Selected.connection = block.previousConnection
    return
  }
  var parent
  target = this
  do {
    parent = target
    if ((c8n = parent.previousConnection) && (target = c8n.eyo.t_eyo)) {
      eYo.Selected.eyo = target
      return
    }
  } while ((target = parent.parent))
  target = parent.getBestBlock((a, b) => {
    if (a.top <= b.top) {
      return {}
    }
    // b.top < a.top
    if (a.left - b.right > a.top - b.top) {
      return {minor: a.left - b.right + a.top - b.top}
    }
    if (b.left - a.right > a.top - b.top) {
      return {minor: b.left - a.right + a.top - b.top}
    }
    return {
      major: a.top - b.top + Math.abs(a.left + a.right - b.left - b.right) / 3,
      minor: b.right - b.left
    }
  })
  if (target) {
    target.select()
  }
}

/**
 * Select the block below the owner.
 * For edython.
 * @return None
 */
eYo.DelegateSvg.prototype.selectBelow = function () {
  var target = this.selectedConnectionSource_
  if (target && target !== this) {
    target.selectBelow()
    return
  }
  var block = this.block_
  var parent, c8n
  if ((c8n = this.selectedConnection)) {
    if (c8n === block.previousConnection) {
      eYo.Selected.connection = null
      block.select()
      return
    } else if (c8n.eyo.isNextLike) {
      if ((target = c8n.targetBlock())) {
        eYo.Selected.connection = null
        target.select()
        return
      }
    } else if (this.nextConnection) {
      block.select()
      eYo.Selected.connection = this.nextConnection
      return
    }
  } else if (this.suiteConnection) {
    block.select()
    eYo.Selected.connection = this.suiteConnection
    return
  } else if (this.nextConnection) {
    block.select()
    eYo.Selected.connection = this.nextConnection
    return
  }
  target = this
  do {
    parent = target
    if ((c8n = parent.nextConnection) && (target = c8n.eyo.t_eyo)) {
      eYo.Selected.eyo = target
      return
    }
  } while ((target = parent.parent))
  target = parent.getBestBlock((a, b) => {
    if (a.bottom >= b.bottom) {
      return {}
    }
    // b.bottom > a.bottom
    if (a.left - b.right > b.bottom - a.bottom) {
      return {minor: a.left - b.right + b.bottom - a.bottom}
    }
    if (b.left - a.right > b.bottom - a.bottom) {
      return {minor: b.left - a.right + b.bottom - a.bottom}
    }
    return {
      major: b.bottom - a.bottom + Math.abs(a.left + a.right - b.left - b.right) / 3,
      minor: b.right - b.left
    }
  })
  if (target) {
    target.select()
  }
}
