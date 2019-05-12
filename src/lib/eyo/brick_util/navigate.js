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
  var m4t
  var input
  var accept = input => {
    var m4t = input.magnet
    return m4t && !m4t.incog && !m4t.hidden_ && m4t.isInput
  }
  var doLeft = eyo => { // !eyo
    if ((m4t = eYo.Selected.magnet) && !m4t.incog) {
      input = m4t.input
    }
    if (!input) {
      if ((m4t = eyo.magnets.output)) {
        input = m4t.target.input
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
    var candidate = input.inputLeft
    while (candidate) {
      if (accept(candidate)) {
        eYo.Selected.magnet = candidate.eyo.magnet
        return
      }
      candidate = candidate.eyo.inputLeft
    }
    candidate = input
    while ((candidate = candidate.eyo.inputLeft)) {
      if (accept(candidate)) {
        eYo.Selected.magnet = candidate.eyo.magnet
        return
      }
    }
    candidate = input
    while ((candidate = candidate.eyo.inputRight)) {
      input = candidate
    }
    do {
      if (accept(input)) {
        eYo.Selected.magnet = input.magnet
        return
      }
    } while ((input = input.inputLeft))
  }
  var doRight = eyo => {
    if ((m4t = eYo.Selected.magnet) && !m4t.incog) {
      input = m4t.input
    }
    if (!input) {
      if ((m4t = eyo.magnets.output)) {
        input = m4t.target.input
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
    var candidate = input.inputRight
    while (candidate) {
      if (accept(candidate)) {
        eYo.Selected.magnet = candidate.eyo.magnet
        return
      }
      candidate = candidate.eyo.inputRight
    }
    candidate = input
    while ((candidate = candidate.eyo.inputRight)) {
      if (accept(candidate)) {
        eYo.Selected.magnet = candidate.eyo.magnet
        return
      }
    }
    candidate = input
    while ((candidate = candidate.eyo.inputLeft)) {
      input = candidate
    }
    do {
      if (accept(input)) {
        eYo.Selected.magnet = input.magnet
        return
      }
    } while ((input = input.inputRight))
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
 * @param {!Blockly.Workspace} workspace .
 * @param {function(point): number} weight is a function.
 * @return {?Blockly.Block}
 */
eYo.Brick.getBestDlgt = function (workspace, weight) {
  var smallest = Infinity
  var best
  workspace.topBlocks_.forEach(top => {
    var box = top.eyo.ui.boundingReact
    var w = weight(box.getCenter())
    if (w < smallest) {
      smallest = w
      best = top
    }
  })
  return best.eyo
}

/**
 * Get the closest box, according to the filter.
 * For edython.
 * @param {(point, point) -> number} distance is a function.
 * @return None
 */
eYo.Brick.prototype.getBestBlock = function (distance) {
  const box_a = this.ui.boundingBox
  var smallest = {}
  var best
  this.workspace.topBlocks_.forEach(top => {
    var t_eyo = top.eyo
    if (t_eyo !== this) {
      var box_p = t_eyo.ui.boundingBox
      var m4t
      while ((m4t = t_eyo.magnets.foot) && (t_eyo = m4t.t_eyo)) {
        box_p.expandToInclude(t_eyo.ui.boundingBox)
      }
      var d = distance(box_a, box_p)
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
 * Select the brick to the left of the selection.
 * For edython.
 * @return None
 */
eYo.Selected.chooseLeft = () => {
  const eyo = eYo.Selected.eyo
  if (!eyo) {
    return
  }
  var m4t = eYo.Selected.magnet
  if (m4t) {
    if (m4t.isInput || m4t.isOutput) {
      eYo.Selected.magnet = null
      eyo.wrapper.select().scrollToVisible()
      return
    } else if (m4t.isSuite) {
      eYo.Selected.magnet = null
      eYo.Selected.scrollToVisible()
      return
    } else {
      eYo.Selected.magnet = null
      (eyo.group || eyo.root).select().scrollToVisible()
      return
    }
  } else if (eyo.isStmt) {
    var ans = eyo.group || eyo.root
    if (eyo !== ans) {
      ans.select().scrollToVisible()
      return
    }
  } else if ((ans = eyo.stmtParent)) {
    ans.select().scrollToVisible()
    return
  }  // now try to select a top brick
  var root = eyo.root
  var target = root.getBestBlock((b, a) => {
    if (a.left >= b.left) {
      return {}
    }
    // b.left > a.left
    if (a.head - b.foot > b.left - a.left) {
      return {minor: b.left - a.left + a.head - b.foot}
    }
    if (b.head - a.foot > b.left - a.left) {
      return {minor: b.left - a.left + b.head - a.foot}
    }
    return {
      major: b.left - a.left + Math.abs(a.foot + a.head - b.foot - b.head) / 3,
      minor: b.foot - b.head
    }
  })
  eYo.Selected.magnet = null
  (target.eyo || root).select().scrollToVisible()
}
/**
 * Select the brick to the right of the selection.
 * The owner is either a selected brick or wrapped into a selected brick.
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
      eYo.Selected.magnet = null
      eYo.Selected.scrollToVisible()
      return
    } else if (m4t.isFoot) {
      if (eyo.isGroup) {
        m4t = eyo.magnets.suite
        var t_eyo
        var next
        while ((t_eyo = m4t.t_eyo) && (next = t_eyo.magnets.foot)) {
          m4t = next
        }
        m4t.select().scrollToVisible()
        return
      }
    } else if (m4t.isSuite) {
      // select a top brick
    } else {
      eYo.Selected.magnet = null
      eYo.Selected.scrollToVisible()
      return
    }
  } else if ((m4t = eyo.magnets.suite)) {
    m4t.select().scrollToVisible()
    return
  }
  // now try to select a top brick
  var root = eyo.root
  var target = root.getBestBlock((a, b) => {
    if (a.right >= b.right) {
      return {}
    }
    // b.right > a.right
    if (a.head - b.foot > b.right - a.right) {
      return {minor: b.right - a.right + a.head - b.foot}
    }
    if (b.head - a.foot > b.right - a.right) {
      return {minor: b.right - a.right + b.head - a.foot}
    }
    return {
      major: b.right - a.right + Math.abs(a.foot + a.head - b.foot - b.head) / 3,
      minor: b.foot - b.head
    }
  })
  eYo.Selected.magnet = null
  (target.eyo || root).select().scrollToVisible()
}

/**
 * Select the brick above the selected one.
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
    if (m4t.isHead) {
      var target = m4t.target
      if (target) {
        target.select().scrollToVisible()
        return
      }
    } else if (m4t.isFoot || m4t.isSuite) {
      var b_eyo = m4t.brick
      if (b_eyo) {
        b_eyo.select().scrollToVisible()
        return
      }
    }
  } else if ((m4t = eyo.magnets.head)) {
    m4t.select().scrollToVisible()
    return
  }
  if ((b_eyo = eyo.stmtParent) || (b_eyo = eyo.root)) {
    if (eyo !== b_eyo) {
      b_eyo.select().scrollToVisible()
      return
    }
  }
  var brick = eyo.root.getBestBlock((a, b) => {
    if (a.head <= b.head) {
      return {}
    }
    // b.head < a.head
    if (a.left - b.right > a.head - b.head) {
      return {minor: a.left - b.right + a.head - b.head}
    }
    if (b.left - a.right > a.head - b.head) {
      return {minor: b.left - a.right + a.head - b.head}
    }
    return {
      major: a.head - b.head + Math.abs(a.left + a.right - b.left - b.right) / 3,
      minor: b.right - b.left
    }
  })
  if (brick && (eyo = brick.eyo)) {
    if (m4t && m4t.isHead && eyo.magnets.foot) {
      eyo.magnets.foot.select().scrollToVisible()
    } else {
      eyo.select().scrollToVisible()
    }
  }
}

/**
 * Select the brick below the selected one.
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
    if (m4t.isFoot) {
      var target = m4t.target
      if (target) {
        target.select().scrollToVisible()
        return
      } else if ((t_eyo = eyo.group) && (m4t = t_eyo.magnets.foot)) {
        m4t.select().scrollToVisible()
        return
      }
    } else if (m4t.isSuite) {
      var target = m4t.target
      if (target) {
        target.select().scrollToVisible()
        return
      } else if ((t_eyo = eyo.group) && (t_eyo !== eyo) && (m4t = t_eyo.magnets.foot)) {
        m4t.select().scrollToVisible()
        return
      }
    } else if (m4t.isHead) {
      eYo.Selected.magnet = null
      eYo.Selected.scrollToVisible()
      return
    }
  } else if ((m4t = eyo.magnets.foot) || ((eyo = eyo.stmtParent) && (m4t = eyo.magnets.foot))) {
    m4t.select().scrollToVisible()
    return
  }
  eyo = eYo.Selected.eyo
  var brick = eyo.root.getBestBlock((a, b) => {
    if (a.foot >= b.foot) {
      return {}
    }
    // b.foot > a.foot
    if (a.left - b.right > b.foot - a.foot) {
      return {minor: a.left - b.right + b.foot - a.foot}
    }
    if (b.left - a.right > b.foot - a.foot) {
      return {minor: b.left - a.right + b.foot - a.foot}
    }
    return {
      major: b.foot - a.foot + Math.abs(a.left + a.right - b.left - b.right) / 3,
      minor: b.right - b.left
    }
  })
  if (brick && (eyo = brick.eyo)) {
    if (m4t && m4t.isFoot && eyo.magnets.head) {
      eyo.magnets.head.select().scrollToVisible()
    } else {
      eyo.select().scrollToVisible()
    }
  }
}

/**
 * Select the next brick.
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
