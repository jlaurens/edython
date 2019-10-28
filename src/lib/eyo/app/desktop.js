/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview Top desktop class, eYo.App is an instance.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.App')
goog.provide('eYo.Desktop')

goog.require('eYo.Do')

goog.forwardDeclare('eYo.Css')

goog.forwardDeclare('eYo.Focus')
goog.forwardDeclare('eYo.Motion')

eYo.Desktop = function () {
  /**
   * The current motion in progress, if any.
   * @type {?eYo.Motion}
   * @private
   */
  eYo.App.motion__ = null
}

Object.defineProperties(eYo.Desktop.prototype, {
  /**
   * The desk of the receiver
   */
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
   * The main object of the desk of the receiver
   */
  main: {
    get () {
      return this.desk.main
    }
  },
  /**
   * Only one motion at a time
   */
  motion: {
    get () {
      return this.motion__
    }
  },
  /**
   * Only one motion at a time
   */
  motion_: {
    get () {
      return this.motion__
    },
    /**
     * The setter takes ownership into account.
     * @param{?Object} newValue
     */
    set (newValue) {
      if (newValue != this.motion__) {
        this.motion__.desktop_ = null
        this.motion__ = newValue
        newValue && (newValue.desktop_ = this)
      }
    }
  },
  /**
   * Is the user currently dragging a brick or scrolling a board?
   * @return {boolean} True if currently dragging or scrolling.
   */
  isDragging: {
    get () {
      return this.motion__.isDragging
    }
  },
})

/**
 * Dispose of the audio and the motion.
 */
eYo.Desktop.prototype.dispose = function() {
  if (this.desk_) {
    this.desk_.dispose()
    this.desk_ = null
  }
  this.motion_.dispose()
  this.audio_ = this.motion_ = null
}

eYo.App = new eYo.Desktop(null)

/**
 * Paste a brick from the local clipboard.
 * @private
 */
eYo.Desktop.prototype.paste = () => {
}

/**
 * Look up the motion that is tracking this touch stream. May create a new motion.
 * @param {!Event} e Mouse event or touch event.
 * @return {eYo.Motion} The motion that is tracking this touch
 *     stream, or null if no valid motion exists.
 */
eYo.Desktop.prototype.getMotion = function(e) {
  var motion = this.motion_
  if (e.type == 'mousedown'
      || e.type == 'touchstart'
      || e.type == 'pointerdown') {
    if (motion.started) {
      // motion is not in an expected state.
      console.warn('tried to start the same motion twice')
      motion.cancel()
      return null
    }
  }
  return motion.reset(e)
}

/**
 * Clear the reference to the current Motion.
 */
eYo.App.clearMotion = function() {
  this.motion_ = null
}

/**
 * Cancel the current motion, if one exists.
 */
eYo.App.cancelMotion = function() {
  this.motion_ && this.motion_.cancel() && this.clearMotion()
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
    if (brick.hasFocus) {
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
      m4t.focus()
    } else if (t9k) {
      t9k.focus()
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
  var brick = eYo.Focus.brick
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
  var b3k = eYo.Focus.brick
  if (b3k) {
    b3k.ui.sendToFront()
  }
}

/**
 * Send the selected brick to the back.
 */
eYo.App.doBack = function() {
  var b3k = eYo.Focus.brick
  if (b3k) {
    b3k.ui.sendToBack()
  }
}

/**
 * Scroll the board to show the selected brick.
 */
eYo.App.doFocus = () => {
  var b3k = eYo.Focus.brick
  if (b3k) {
    b3k.board.scrollBrickTopLeft(b3k.id)
  }
}

/**
 * Make the desk.
 */
eYo.Desktop.prototype.makeDesk = function (options) {
  eYo.setup()
  var desk = this.desk_ = new eYo.Desk(options)
  eYo.App.main = desk.main
  eYo.App.main.backer.clear()
  desk.makeUI()
}

/**
 * Close tooltips, context menus, dropdown selections, etc.
 */
eYo.Desktop.prototype.hideChaff = eYo.Do.nothing
