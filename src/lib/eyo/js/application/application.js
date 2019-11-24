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

goog.require('eYo.Do')
goog.require('eYo.Decorate')
goog.require('eYo.Constructor')

goog.provide('eYo.Application')

goog.forwardDeclare('eYo.Css')

goog.forwardDeclare('eYo.Focus')
goog.forwardDeclare('eYo.Motion')
goog.forwardDeclare('eYo.Desk')
goog.forwardDeclare('eYo.Driver')
goog.forwardDeclare('eYo.Audio')

/**
 * Main application object.
 * @param {!Object} options
 * @constructor
 * @readonly
 * The current options.
 * @property {eYo.Options} options
 * @readonly
 * The current motion in progress, if any.
 * @property {?eYo.Motion} motion
 * @readonly
 * The desk, if any.
 * @property {eYo.Desk} desk
 * @readonly
 * The ui drivers manager.
 * @property {eYo.Driver.Mgr} ui_driver_mgr
 */
eYo.Constructor.make('Application', {
  owner: eYo,
  super: null,
  init : {
    begin () {
      this.disposeUI = eYo.Do.nothing
    },
    end (options) {
      this.options_ = new eYo.Options(options || {})
    }
  },
  props: {
    owned: {
      motion: {
        init () {
          return new eYo.Motion(this)
        }
      },
      desk: {
        init () {
          return new eYo.Desk(this)
        }
      },
      options: {},
      audio: {},
      clipboard: {},
      ui_driver_mgr: {
        willChange(before, after) {
          if (before) {
            this.disposeUI()
          }
          return function (before, after) {
            this.initUI()
          }
        }
      },
    },
  },
})

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
      return !this.initUI || this.initUI === eYo.Do.nothing
    }
  },
})

/**
 * Make the UI.
 */
eYo.Application.prototype.initUI = function() {
  this.initUI = eYo.Do.nothing
  delete this.disposeUI
  this.audio__ = new eYo.Audio(this, this.options.pathToMedia)
  var d = this.ui_driver_mgr__ = new eYo.Svg.Mgr(this)
  d.initUI(this)
  this.desk.initUI()
}

/**
 * Dispose of the UI related resources.
 */
eYo.Application.prototype.disposeUI = function() {
  this.disposeUI = eYo.Do.nothing
  this.desk.disposeUI()
  this.ui_driver_mgr_ = null
  delete this.initUI
}

/**
 * Dispose of the audio and the motion.
 */
eYo.Application.prototype.dispose = function() {
  this.dispose = eYo.Do.nothing
  this.disposeUI()
  eYo.Property.dispose(this, 'desk', 'motion', 'audio', 'clipboard')
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
