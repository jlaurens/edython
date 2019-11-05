/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview Top application class, eYo.Application is an instance.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Application')

goog.require('eYo.Do')
goog.require('eYo.Decorate')
goog.require('eYo.Property')

goog.forwardDeclare('eYo.Css')

goog.forwardDeclare('eYo.Focus')
goog.forwardDeclare('eYo.Motion')

/**
 * Main application object.
 * @param {!Object} options
 */
eYo.Application = function (options) {
  this.disposeUI = eYo.Do.nothing
  /**
   * The options.
   * @type {eYo.Options}
   * @private
   */
  this.options_ = options = new eYo.Options(options || {})
  /**
   * The current motion in progress, if any.
   * @type {?eYo.Motion}
   * @private
   */
  this.motion_ = new eYo.Motion(this)
  /**
   * Desk.
   * @type {?eYo.Desk}
   * @private
   */
  this.desk_ = new eYo.Desk(this)
}

/**
 * UI driver
 * @type {eYo.Driver}
 * @readonly
 */
eYo.Property.addMany(
  eYo.Application.prototype,
  {
    /**
     * Driver
     * @type {eYo.Driver}
     * @readonly
     */
    ui_driver: {
      willChange(before, after) {
        if (before) {
          this.desk && this.desk.disposeUI()
          before.applicationDispose(this)
        }
        return eYo.Do.nothing
      }
    },
    /**
     * Desk
     * @type {eYo.Desk}
     * @readonly
     */
    desk: {},
    /**
     * Motion
     * @type {eYo.Motion}
     * @readonly
     */
    motion: {},
    /**
     * Audio
     * @readonly
     */
    audio: {},
    /**
     * Clipboard
     * @readonly
     */
    clipboard: {},
  }
)

Object.defineProperties(eYo.Application.prototype, {
  /**
   * The application of the receiver (returns itself).
   * @readonly
   */
  app: {
    get () {
      return this
    },
  },
  /**
   * Is the user currently dragging a brick or scrolling a board?
   * @type {boolean} True if currently dragging or scrolling.
   */
  isDragging: {
    get () {
      return this.motion__.isDragging
    }
  },
  /**
   * Whether the receiver is faceless.
   * @type {Boolean}
   */
  hasUI: {
    get () {
      return !this.makeUI || this.makeUI === eYo.Do.nothing
    }
  },
})

/**
 * Make the UI.
 */
eYo.Application.prototype.makeUI = function() {
  this.makeUI = eYo.Do.nothing
  delete this.disposeUI
  this.audio__ = new eYo.Audio(this, this.options.pathToMedia)
  var d = this.ui_driver__ = new eYo.Svg(this)
  d.applicationInit(this)
  this.desk.makeUI()
}

/**
 * Dispose of the UI related resources.
 */
eYo.Application.prototype.disposeUI = function() {
  this.disposeUI = eYo.Do.nothing
  this.desk.disposeUI()
  this.ui_driver_ = null
  delete this.makeUI
}

/**
 * Dispose of the audio and the motion.
 */
eYo.Application.prototype.dispose = function() {
  this.dispose = eYo.Do.nothing
  this.disposeUI()
  eYo.Property.disposeMany(['desk', 'motion', 'audio', 'clipboard'])
}

/**
 * Paste a brick from the local clipboard.
 * @private
 */
eYo.Application.prototype.paste = () => {
}

/**
 * Delete this brick and the next ones if requested.
 * For edython.
 * @param {!eYo.Brick} block The brick to delete.
 * @param {!boolean} deep
 */
eYo.Application.prototype.deleteBrick = (brick, deep) => {
  if (brick && brick.deletable && !brick.board.readOnly) {
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
      this.hideChaff()
      if (deep) {
        do {
          var low = brick.foot
          brick.dispose(false, true)
        } while ((brick = low))
      } else {
        brick.dispose(true, true)
      }
    })
    if (m4t && m4t.board) {
      m4t.focusOn()
    } else if (t9k) {
      t9k.focusOn()
    }
  }
}

/**
 * Copy a brick onto the local clipboard.
 * @param {!eYo.Brick} brick Brick to be copied.
 * @private
 */
eYo.Application.prototype.copyBrick = (brick, deep) => {
  var xml = eYo.Xml.brickToDom(brick, {noId: true, noNext: !deep})
  // Copy only the selected brick and internal bricks.
  // Encode start position in XML.
  var xy = brick.xy
  xml.setAttribute('x', xy.x)
  xml.setAttribute('y', xy.y)
  eYo.Clipboard.xml = xml
  eYo.Clipboard.source = brick.board
  eYo.app.didCopyBrick && (eYo.app.didCopyBrick(brick, xml))
}

/**
 * Copy the selected brick onto the local clipboard.
 * @param {Boolean} optNoNext Whether the next blocks may be copied too.
 * @private
 * @return {Boolean} true if copied, false otherwise
 */
eYo.Application.prototype.doCopy = function(optNoNext) {
  var brick = this.focusMgr.brick
  if (brick) {
    this.copyBrick(brick, !optNoNext)
    return true
  }
};

/**
 * Send the selected brick to the front.
 * This is a job for the renderer.
 */
eYo.Application.prototype.doFront = function() {
  var b3k = this.focusMgr.brick
  if (b3k) {
    b3k.ui.sendToFront()
  }
}

/**
 * Send the selected brick to the back.
 */
eYo.Application.prototype.doBack = function() {
  var b3k = this.focusMgr.brick
  if (b3k) {
    b3k.ui.sendToBack()
  }
}

/**
 * Scroll the board to show the selected brick.
 */
eYo.Application.prototype.doFocus = function() {
  var b3k = this.focusMgr.brick
  if (b3k) {
    b3k.board.scrollBrickTopLeft(b3k.id)
  }
}

/**
 * Close tooltips, context menus, dropdown selections, etc.
 */
eYo.Application.prototype.hideChaff = eYo.Do.nothing
