/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name eYo
 * @namespace
 */

goog.provide('eYo.App')
goog.provide('eYo.Desktop')

goog.require('eYo.Do')

goog.forwardDeclare('eYo.Css')

goog.forwardDeclare('eYo.Selected')
goog.forwardDeclare('eYo.Gesture')

eYo.Desktop = function () {

}

Object.defineProperties(eYo.Desktop.prototype, {
  desk: {
    get () {
      return this.desk_
    },
    set(newValue) {
      this.desk_ && (this.desk_.owner_ = null)
      newValue.owner_ = this
      this.desk_ = newValue
    }
  },
  /**
   * Only one gesture at a time
   */
  gesture: {
    get () {
      return this.gesture__
    }
  },
  /**
   * Only one gesture at a time
   */
  gesture_: {
    get () {
      return this.gesture__
    },
    /**
     * The setter takes ownership into account.
     * @param{?Object} newValue
     */
    set (newValue) {
      if (newValue != this.gesture__) {
        this.gesture__ && (this.gesture__.owner_ = null)
        this.gesture__ = newValue
        newValue && (newValue.owner_ = this)
      }
    }
  },
  /**
   * Is the user currently dragging a brick or scrolling a board?
   * @return {boolean} True if currently dragging or scrolling.
   */
  isDragging: {
    get () {
      return this.gesture__ && this.gesture__.isDragging
    }
  },
})

/**
 * Dispose of the audio and the gesture.
 */
eYo.Desktop.prototype.dispose = function() {
  this.audio_ = this.gesture_ = null
}

eYo.App = new eYo.Desktop(null)

/**
 * Paste a brick onto the local clipboard.
 * @private
 */
eYo.Desktop.prototype.paste = () => {
}

/**
 * The current gesture in progress, if any.
 * @type {?eYo.Gesture}
 * @private
 */
eYo.App.gesture__ = null

/**
 * Look up the gesture that is tracking this touch stream. May create a new gesture.
 * @param {!Event} e Mouse event or touch event.
 * @return {eYo.Gesture} The gesture that is tracking this touch
 *     stream, or null if no valid gesture exists.
 */
eYo.Desktop.prototype.getGesture = function(e) {
  var isStart = (e.type == 'mousedown' || e.type == 'touchstart' ||
  e.type == 'pointerdown')
  var gesture = this.gesture_
  if (gesture) {
    if (isStart && gesture.started) {
      console.warn('tried to start the same gesture twice')
      // That's funny.  We must have missed a mouse up.
      // Cancel it, rather than try to retrieve all of the state we need.
      gesture.cancel()
      return null
    }
    return gesture
  }
  // No gesture existed on this board, but this looks like the start of a
  // new gesture.
  if (isStart) {
    return (this.gesture_ = new eYo.Gesture(e))
  }
  // No gesture existed and this event couldn't be the start of a new gesture.
  return null
}

/**
 * Clear the reference to the current gesture.
 */
eYo.App.clearGesture = function() {
  this.gesture_ = null
}

/**
 * Cancel the current gesture, if one exists.
 */
eYo.App.cancelGesture = function() {
  this.gesture_ && this.gesture_.cancel()
}

Object.defineProperties(eYo.App, {
  SNAP_RADIUS: { value: 20 },
  DELETE_AREA_NONE: { value: null },
  /**
   * ENUM representing that an event is in the delete area of the trash can.
   * @const
   */
  DELETE_AREA_TRASH: { value: 1 },
  /**
   * ENUM representing that an event is in the delete area of the flyout or
   * flyout.
   * @const
   */
  DELETE_AREA_TOOLBOX: { value: 2 },
})

/**
 * Delete this brick and the next ones if requested.
 * For edython.
 * @param {!eYo.Brick} block The brick to delete.
 * @param {!boolean} deep
 */
eYo.App.deleteBrick = (brick, deep) => {
  if (brick && brick.deletable && !brick.board.inFlyout) {
    if (brick.isSelected) {
      // prepare a connection or a block to be selected
      var m4t
      if ((m4t = brick.out_m)) {
        m4t = m4t.target
      } else if ((m4t = brick.foot_m)) {
        var t9k = m4t.targetBrick
      }
    }
    eYo.Events.groupWrap(() => {
      eYo.App.hideChaff()
      if (deep) {
        do {
          var low = brick.foot
          brick.dispose(false, true)
        } while ((brick = low))
      } else {
        brick.dispose(true, true)
      }
    })
    if (m4t && m4t.brick.board) {
      m4t.select()
    } else if (t9k) {
      t9k.select()
    }
  }
}

/**
 * Copy a brick onto the local clipboard.
 * @param {!eYo.Brick} brick Brick to be copied.
 * @private
 */
eYo.App.copyBrick = (brick, deep) => {
  var xml = eYo.Xml.brickToDom(brick, {noId: true, noNext: !deep})
  // Copy only the selected block and internal bricks.
  // Encode start position in XML.
  var xy = brick.xy
  xml.setAttribute('x', xy.x)
  xml.setAttribute('y', xy.y)
  eYo.Clipboard.xml = xml
  eYo.Clipboard.source = brick.board
  eYo.App.didCopyBrick && (eYo.App.didCopyBrick(brick, xml))
}

/**
 * Copy the selected brick onto the local clipboard.
 * @param {Boolean} optNoNext Whether the next blocks may be copied too.
 * @private
 * @return {Boolean} true if copied, false otherwise
 */
eYo.App.doCopy = function(optNoNext) {
  var brick = eYo.Selected.brick
  if (brick) {
    eYo.Desktop.copyBrick(brick, !optNoNext)
    return true
  }
};

/**
 * Send the selected brick to the front.
 * This is a job for the renderer.
 */
eYo.App.doFront = function() {
  var b3k = eYo.Selected.brick
  if (b3k) {
    b3k.ui.sendToFront()
  }
}

/**
 * Send the selected brick to the back.
 */
eYo.App.doBack = function() {
  var b3k = b3k.Selected.brick
  if (b3k) {
    b3k.ui.sendToBack()
  }
}

/**
 * Scroll the board to show the selected brick.
 */
eYo.App.doFocus = () => {
  var b3k = eYo.Selected.brick
  if (b3k) {
    b3k.board.scrollBrickTopLeft(b3k.id)
  }
}

/**
 * Make the desk.
 */
eYo.App.makeDesk = options => {
  eYo.setup()
  var desk = eYo.App.desk = new eYo.Desk(options)
  eYo.App.main = desk.main
  eYo.App.main.backer.clear()
  desk.makeUI()
}

/**
 * Close tooltips, context menus, dropdown selections, etc.
 */
eYo.App.hideChaff = eYo.Do.nothing
