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
 * @param {?Object} eyo Block delegate.
 * @param {?Object} opt Optional key value arguments.
 */
eYo.Navigate.doTab = (() => {
  var c8n
  var input
  var accept = input => {
    var c8n = input.connection
    return c8n && !c8n.eyo.isIncog() && !c8n.hidden_ && c8n.eyo.isInput
  }
  var doLeft = eyo => { // !eyo
    if ((c8n = eYo.Selected.connection) && !c8n.eyo.isIncog()) {
      input = c8n.eyo.input
    }
    if (!input) {
      if ((c8n = eyo.outputConnection)) {
        input = c8n.eyo.target.input
      }
      if (!input) {
        input = eyo.lastRenderedInput
      }
      if (!input) {
        input = (eyo.stmtParent || eyo.root).lastRenderedInput
      }
      if (!input) {
        return
      }
    }
    var candidate = input.eyo.inputLeft
    while (candidate) {
      if (accept(candidate)) {
        eYo.Selected.connection = candidate.connection
        return
      }
      candidate = candidate.eyo.inputLeft
    }
    candidate = input
    while ((candidate = candidate.eyo.inputLeft)) {
      if (accept(candidate)) {
        eYo.Selected.connection = candidate.connection
        return
      }
    }
    candidate = input
    while ((candidate = candidate.eyo.inputRight)) {
      input = candidate
    }
    do {
      if (accept(input)) {
        eYo.Selected.connection = input.connection
        return
      }
    } while ((input = input.eyo.inputLeft))
  }
  var doRight = eyo => {
    if ((c8n = eYo.Selected.connection) && !c8n.eyo.isIncog()) {
      input = c8n.eyo.input
    }
    if (!input) {
      if ((c8n = eyo.outputConnection)) {
        input = c8n.eyo.target.input
      }
      if (!input) {
        input = eyo.firstRenderedInput
      }
      if (!input) {
        input = (eyo.stmtParent || eyo.root).firstRenderedInput
      }
      if (!input) {
        return
      }
    }
    var candidate = input.eyo.inputRight
    while (candidate) {
      if (accept(candidate)) {
        eYo.Selected.connection = candidate.connection
        return
      }
      candidate = candidate.eyo.inputRight
    }
    candidate = input
    while ((candidate = candidate.eyo.inputRight)) {
      if (accept(candidate)) {
        eYo.Selected.connection = candidate.connection
        return
      }
    }
    candidate = input
    while ((candidate = candidate.eyo.inputLeft)) {
      input = candidate
    }
    do {
      if (accept(input)) {
        eYo.Selected.connection = input.connection
        return
      }
    } while ((input = input.eyo.inputRight))
  }
  return (eyo, opt) => {
    if (eyo) {
      var f = opt && opt.left ? doLeft : doRight
      var n = opt && opt.fast ? 4 : 1
      input = undefined
      while (n--) {
        f(eyo)
      }
      return true
    }
  }
})()

/**
 * Get the closest box, according to the filter.
 * For edython.
 * @param {!Blockly.Workspace} workspace The owner of the receiver.
 * @param {function(point): number} weight is a function.
 * @return {?Blockly.Block}
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
 * Select the block to the left of the selection.
 * For edython.
 * @return None
 */
eYo.Selected.chooseLeft = () => {
  const eyo = eYo.Selected.eyo
  if (!eyo) {
    return
  }
  var c8n = eYo.Selected.connection
  if (c8n) {
    var c_eyo = c8n.eyo
    if (c_eyo.isInput || c_eyo.isOutput) {
      eYo.Selected.eyo = eyo.wrapper
      eYo.Selected.connection = null
      eYo.Selected.scrollToVisible()
      return
    } else if (c_eyo.isSuite) {
      eYo.Selected.connection = null
      eYo.Selected.scrollToVisible()
      return
    } else {
      eYo.Selected.eyo = eyo.group || eyo.root
      eYo.Selected.connection = null
      eYo.Selected.scrollToVisible()
      return
    }
  } else if (eyo.isStmt) {
    var ans = eyo.group || eyo.root
    if (eyo !== ans) {
      eYo.Selected.eyo = ans
      eYo.Selected.scrollToVisible()
      return
    }
  } else if ((ans = eyo.stmtParent)) {
    eYo.Selected.eyo = ans
    eYo.Selected.scrollToVisible()
    return
  }  // now try to select a top block
  var root = eyo.root
  var target = root.getBestBlock((b, a) => {
    if (a.left >= b.left) {
      return {}
    }
    // b.left > a.left
    if (a.top - b.bottom > b.left - a.left) {
      return {minor: b.left - a.left + a.top - b.bottom}
    }
    if (b.top - a.bottom > b.left - a.left) {
      return {minor: b.left - a.left + b.top - a.bottom}
    }
    return {
      major: b.left - a.left + Math.abs(a.bottom + a.top - b.bottom - b.top) / 3,
      minor: b.bottom - b.top
    }
  })
  eYo.Selected.connection = null
  eYo.Selected.block = target || root.block_
  eYo.Selected.scrollToVisible()
}
/**
 * Select the block to the right of the selection.
 * The owner is either a selected block or wrapped into a selected block.
 * For edython.
 * @return yorn
 */
eYo.Selected.chooseRight = function () {
  const eyo = eYo.Selected.eyo
  if (!eyo) {
    return
  }
  var m4t = eYo.Selected.magnet
  if (m4t) {
    if (m4t.isInput || m4t.isOutput) {
      eYo.Selected.connection = null
      eYo.Selected.scrollToVisible()
      return
    } else if (m4t.isNext) {
      if (eyo.isGroup) {
        m4t = eyo.magnets.suite
        var t_eyo
        var next
        while ((t_eyo = m4t.t_eyo) && (next = t_eyo.magnets.bottom)) {
          c8n = next
        }
        eYo.Selected.magnet = m4t
        eYo.Selected.scrollToVisible()
        return
      }
    } else if (m4t.isSuite) {
      // select a top block
    } else {
      eYo.Selected.connection = null
      eYo.Selected.scrollToVisible()
      return
    }
  } else if ((m4t = eyo.magnets.suite)) {
    eYo.Selected.magnet = m4t
    eYo.Selected.scrollToVisible()
    return
  }
  // now try to select a top block
  var root = eyo.root
  var target = root.getBestBlock((a, b) => {
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
  eYo.Selected.connection = null
  eYo.Selected.block = target || root.block_
  eYo.Selected.scrollToVisible()
}

/**
 * Select the block above the selected one.
 * For edython.
 * @return None
 */
eYo.Selected.chooseAbove = function () {
  var eyo = eYo.Selected.eyo
  if (!eyo) {
    return
  }
  var m4t = eYo.Selected.magnet
  if (m4t) {
    if (m4t.isTop) {
      var target = m4t.target
      if (target) {
        eYo.Selected.magnet = target
        eYo.Selected.scrollToVisible()
        return
      }
    } else if (m4t.isBottom || m4t.isSuite) {
      var b_eyo = m4t.b_eyo
      if (b_eyo) {
        eYo.Selected.eyo = b_eyo
        eYo.Selected.scrollToVisible()
        return
      }
    }
  } else if ((m4t = eyo.magnets.top)) {
    eYo.Selected.magnet = m4t
    eYo.Selected.scrollToVisible()
    return
  }
  if ((b_eyo = eyo.stmtParent) || (b_eyo = eyo.root)) {
    if (eyo !== b_eyo) {
      eYo.Selected.eyo = b_eyo
      eYo.Selected.scrollToVisible()
      return
    }
  }
  var block = eyo.root.getBestBlock((a, b) => {
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
  if (block && (eyo = block.eyo)) {
    if (m4t && m4t.isTop && eyo.magnets.bottom) {
      eYo.Selected.magnet = eyo.magnets.bottom
    } else {
      eYo.Selected.eyo = eyo
    }
    eYo.Selected.scrollToVisible()
  }
}

/**
 * Select the block below the selected one.
 * For edython.
 * @return None
 */
eYo.Selected.chooseBelow = () => {
  var eyo = eYo.Selected.eyo
  if (!eyo) {
    return
  }
  var m4t = eYo.Selected.magnet
  var t_eyo
  if (m4t) {
    if (m4t.isBottom) {
      var target = m4t.target
      if (target) {
        eYo.Selected.magnet = target
        eYo.Selected.scrollToVisible()
        return
      } else if ((t_eyo = eyo.group) && (m4t = t_eyo.magnets.bottom)) {
        eYo.Selected.magnet = m4t
        eYo.Selected.scrollToVisible()
        return
      }
    } else if (m4t.isSuite) {
      var target = m4t.target
      if (target) {
        eYo.Selected.magnet = target
        eYo.Selected.scrollToVisible()
        return
      } else if ((t_eyo = eyo.group) && (t_eyo !== eyo) && (m4t = t_eyo.magnets.bottom)) {
        eYo.Selected.magnet = m4t
        eYo.Selected.scrollToVisible()
        return
      }
    } else if (m4t.isTop) {
      eYo.Selected.connection = null
      eYo.Selected.scrollToVisible()
      return
    }
  } else if ((m4t = eyo.magnets.bottom) || ((eyo = eyo.stmtParent) && (m4t = eyo.magnets.bottom))) {
    eYo.Selected.magnet = m4t
    eYo.Selected.scrollToVisible()
    return
  }
  eyo = eYo.Selected.eyo
  var block = eyo.root.getBestBlock((a, b) => {
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
  if (block && (eyo = block.eyo)) {
    if (m4t && m4t.isBottom && eyo.magnets.top) {
      eYo.Selected.magnet = eyo.magnets.top
    } else {
      eYo.Selected.eyo = eyo
    }
    eYo.Selected.scrollToVisible()
  }
}

/**
 * Select the next block.
 * For edython.
 * @return None
 */
eYo.Selected.chooseNext = () => {
  var eyo = eYo.Selected.eyo
  if (!eyo) {
    return
  }
  if ((eyo = eyo.next)) {
    eYo.Selected.eyo = eyo
    eYo.Selected.scrollToVisible()
  }
}
