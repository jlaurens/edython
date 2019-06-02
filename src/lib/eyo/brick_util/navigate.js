/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Navigation for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Navigate')

goog.require('eYo')

goog.require('eYo.Selected')

/**
 * Tab navigation.
 * @param {?eYo.Brick} brick  Brick.
 * @param {?Object} opt Optional key value arguments.
 */
eYo.Navigate.doTab = (() => {
  var magnet
  var accept = m4t => {
    return m4t && !m4t.incog && !m4t.hidden && m4t.isInput && m4t
  }
  var doLeft = b3k => {
    if (!(magnet = eYo.Selected.magnet) || magnet.incog || !(magnet = b3k.out_m || b3k.ui.lastRenderedMagnet || (b3k.stmtParent || b3k.root).ui.lastRenderedMagnet)) {
      return
    }
    var m4t = magnet
    while ((m4t = m4t.renderedLeft)) {
      if ((eYo.Selected.magnet = accept(m4t))) {
        return
      }
    }
    m4t = magnet
    while ((magnet = magnet.renderedRight)) {
      m4t = magnet
    }
    do {
      if ((eYo.Selected.magnet = accept(m4t))) {
        return
      }
    } while ((m4t = m4t.renderedLeft))
  }
  var doRight = b3k => {
    if (!(magnet = eYo.Selected.magnet) || magnet.incog || !(magnet = b3k.out_m || b3k.ui.firstRenderedMagnet || (b3k.stmtParent || b3k.root).ui.firstRenderedMagnet)) {
      return
    }
    var m4t = magnet
    while ((m4t = m4t.renderedRight)) {
      if ((eYo.Selected.magnet = accept(m4t))) {
        return
      }
    }
    m4t = magnet
    while ((magnet = magnet.renderedLeft)) {
      m4t = magnet
    }
    do {
      if ((eYo.Selected.magnet = accept(m4t))) {
        return
      }
    } while ((m4t = m4t.renderedRight))
  }
  return (brick, opt) => {
    if (brick) {
      var f = opt && opt.left ? doLeft : doRight
      var n = opt && opt.fast ? 4 : 1
      input = undefined
      while (n--) {
        f(brick)
      }
      return true
    }
  }
})()

/**
 * Get the closest box, according to the filter.
 * For edython.
 * @param {!Blockly.Board} board .
 * @param {function(point): number} weight is a function.
 * @return {?eYo.Brick}
 */
eYo.Brick.getBestBrick = function (board, weight) {
  var smallest = Infinity
  var best
  board.topBricks_.forEach(top => {
    var box = top.ui.boundingRect
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
 * @param {(point, point) -> number} distance is a function.
 * @return None
 */
eYo.Brick.prototype.getBestBrick = function (distance) {
  const box_a = this.ui.boundingBox
  var smallest = {}
  var best
  this.board.topBricks_.forEach(brick => {
    if (brick !== this) {
      var box_p = brick.ui.boundingBox
      var m4t
      while ((m4t = brick.foot_m) && (brick = m4t.targetBrick)) {
        box_p.expandToInclude(brick.ui.boundingBox)
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
  const b3k = eYo.Selected.brick
  if (!b3k) {
    return
  }
  var m4t = eYo.Selected.magnet
  if (m4t) {
    if (m4t.isInput || m4t.isOutput) {
      eYo.Selected.magnet = null
      b3k.wrapper.select().scrollToVisible()
      return
    } else if (m4t.isSuite) {
      eYo.Selected.magnet = null
      eYo.Selected.scrollToVisible()
      return
    } else {
      eYo.Selected.magnet = null
      ;(b3k.group || b3k.root).select().scrollToVisible()
      return
    }
  } else if (b3k.isStmt) {
    var ans = b3k.group || b3k.root
    if (b3k !== ans) {
      ans.select().scrollToVisible()
      return
    }
  } else if ((ans = b3k.stmtParent)) {
    ans.select().scrollToVisible()
    return
  }  // now try to select a top brick
  var root = b3k.root
  var target = root.getBestBrick((b, a) => {
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
  ;(target || root).select().scrollToVisible()
}
/**
 * Select the brick to the right of the selection.
 * The owner is either a selected brick or wrapped into a selected brick.
 * For edython.
 * @return yorn
 */
eYo.Selected.chooseRight = function () {
  const eyo = eYo.Selected.brick
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
        m4t = eyo.suite_m
        var t9k
        var next
        while ((t9k = m4t.targetBrick) && (next = t9k.foot_m)) {
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
  } else if ((m4t = eyo.suite_m)) {
    m4t.select().scrollToVisible()
    return
  }
  // now try to select a top brick
  var root = eyo.root
  var target = root.getBestBrick((a, b) => {
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
  ;(target || root).select().scrollToVisible()
}

/**
 * Select the brick above the selected one.
 * For edython.
 * @return None
 */
eYo.Selected.chooseAbove = function () {
  var eyo = eYo.Selected.brick
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
      var brick = m4t.brick
      if (brick) {
        brick.select().scrollToVisible()
        return
      }
    }
  } else if ((m4t = eyo.head_m)) {
    m4t.select().scrollToVisible()
    return
  }
  if ((brick = eyo.stmtParent) || (brick = eyo.root)) {
    if (eyo !== brick) {
      brick.select().scrollToVisible()
      return
    }
  }
  var brick = eyo.root.getBestBrick((a, b) => {
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
  if (brick) {
    if (m4t && m4t.isHead && eyo.foot_m) {
      brick.foot_m.select().scrollToVisible()
    } else {
      brick.select().scrollToVisible()
    }
  }
}

/**
 * Select the brick below the selected one.
 * For edython.
 * @return None
 */
eYo.Selected.chooseBelow = () => {
  var brick = eYo.Selected.brick
  if (!brick) {
    return
  }
  var m4t = eYo.Selected.magnet
  var b3k
  if (m4t) {
    if (m4t.isFoot) {
      var target = m4t.target
      if (target) {
        target.select().scrollToVisible()
        return
      } else if ((b3k = brick.group) && (m4t = b3k.foot_m)) {
        m4t.select().scrollToVisible()
        return
      }
    } else if (m4t.isSuite) {
      var target = m4t.target
      if (target) {
        target.select().scrollToVisible()
        return
      } else if ((b3k = brick.group) && (b3k !== brick) && (m4t = b3k.foot_m)) {
        m4t.select().scrollToVisible()
        return
      }
    } else if (m4t.isHead) {
      eYo.Selected.magnet = null
      eYo.Selected.scrollToVisible()
      return
    }
  } else if ((m4t = brick.foot_m) || ((brick = brick.stmtParent) && (m4t = brick.foot_m))) {
    m4t.select().scrollToVisible()
    return
  }
  b3k = eYo.Selected.brick.root.getBestBrick((a, b) => {
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
  if (b3k) {
    if (m4t && m4t.isFoot && b3k.head_m) {
      b3k.head_m.select().scrollToVisible()
    } else {
      b3k.select().scrollToVisible()
    }
  }
}

/**
 * Select the next brick.
 * For edython.
 * @return None
 */
eYo.Selected.chooseNext = () => {
  var eyo = eYo.Selected.brick
  if (!eyo) {
    return
  }
  if ((eyo = eyo.next)) {
    eyo.select()
    eYo.Selected.scrollToVisible()
  }
}
