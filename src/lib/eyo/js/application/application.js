/*
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview Top application class, eYo.Application is an instance.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('Do')
eYo.require('Decorate')

eYo.require('C9r')

eYo.forwardDeclare('Css')

eYo.forwardDeclare('Focus')
eYo.forwardDeclare('Motion')
eYo.forwardDeclare('Desk')
eYo.forwardDeclare('Driver')
eYo.forwardDeclare('Dom.Audio')

/**
 * Main application object.
 * @param {Object} options
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
 * @property {eYo.Driver.Mngr} ui_driver_mngr
 */
eYo.makeClass('Application', eYo.C9r.Dflt, {
  init (options) {
    this.options_ = new eYo.Options(options || {})
    let Mngr = this.options_.UIDriverMngr
    this.ui_driver_mngr_ = new (Mngr || eYo.Fcls.Mngr)(this) // depending on the options!!!
  },
  /**
   * Dispose of the audio and the motion.
   */
  dispose () {
    this.disposeUI()
  },
  owned: {
    motion () {
      return new eYo.Motion(this)
    },
    desk () {
      return new eYo.Desk(this)
    },
    options: {},
    audio: {},
    clipboard: {},
    ui_driver_mngr: {
      willChange(before, after) {
        before && this.disposeUI()
        return after ? function (before, after) {
          this.initUI()
        } : eYo.NA
      }
    },
  },
  computed: {
    /**
     * The application of the receiver (returns itself).
     * @readonly
     */
    app () {
      return this
    },
    /**
     * Is the user currently dragging a brick or scrolling a board?
     * @type {boolean} True if currently dragging or scrolling.
     */
    isDragging () {
      return this.motion__.isDragging
    },
  },
})

/**
 * Make the UI.
 */
eYo.Application_p.initUI = function() {
  this.initUI = eYo.Do.nothing
  delete this.disposeUI
  this.audio__ = new eYo.Dom.Audio(this, this.options.pathToMedia)
  var d = this.ui_driver_mngr__ = new eYo.Svg.Mngr(this)
  d.objectInitUI(this)
  this.desk.initUI()
}

/**
 * Dispose of the UI related resources.
 */
eYo.Application_p.disposeUI = function() {
  this.disposeUI = eYo.Do.nothing
  this.desk.disposeUI()
  this.ui_driver_mngr_ = null
  delete this.initUI
}

/**
 * Paste a brick from the local clipboard.
 * @private
 */
eYo.Application_p.paste = () => {
}

/**
 * Delete this brick and the next ones if requested.
 * For edython.
 * @param {eYo.Brick.Dflt} block The brick to delete.
 * @param {boolean} deep
 */
eYo.Application_p.deleteBrick = function (brick, deep) {
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
 * @param {eYo.Brick.Dflt} brick Brick to be copied.
 * @private
 */
eYo.Application_p.copyBrick = function (brick, deep) {
  var xml = eYo.Xml.brickToDom(brick, {noId: true, noNext: !deep})
  // Copy only the selected brick and internal bricks.
  // Encode start position in XML.
  var xy = brick.xy
  xml.setAttribute('x', xy.x)
  xml.setAttribute('y', xy.y)
  eYo.Clipboard.xml = xml
  eYo.Clipboard.source = brick.board
  this.didCopyBrick && (this.didCopyBrick(brick, xml))
}

/**
 * Copy the selected brick onto the local clipboard.
 * @param {Boolean} optNoNext Whether the next blocks may be copied too.
 * @private
 * @return {Boolean} true if copied, false otherwise
 */
eYo.Application_p.doCopy = function(optNoNext) {
  var brick = this.focusMngr.brick
  if (brick) {
    this.copyBrick(brick, !optNoNext)
    return true
  }
};

/**
 * Send the selected brick to the front.
 * This is a job for the renderer.
 */
eYo.Application_p.doFront = function() {
  var b3k = this.focusMngr.brick
  if (b3k) {
    b3k.ui.sendToFront()
  }
}

/**
 * Send the selected brick to the back.
 */
eYo.Application_p.doBack = function() {
  var b3k = this.focusMngr.brick
  if (b3k) {
    b3k.ui.sendToBack()
  }
}

/**
 * Scroll the board to show the selected brick.
 */
eYo.Application_p.doFocus = function() {
  var b3k = this.focusMngr.brick
  if (b3k) {
    b3k.board.scrollBrickTopLeft(b3k.id)
  }
}

/**
 * Close tooltips, context menus, dropdown selections, etc.
 */
eYo.Application_p.hideChaff = eYo.Do.nothing
