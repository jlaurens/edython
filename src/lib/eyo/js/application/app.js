/*
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview Top application class, eYo.app.Dflt is an instance.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('do')
eYo.require('decorate')

/**
 * @name{eYo.app}
 * @namespace
 */
eYo.o4t.makeNS(eYo, 'app')

eYo.forwardDeclare('css')

eYo.forwardDeclare('focus')
eYo.forwardDeclare('event.Motion')
eYo.forwardDeclare('view.Desk')
eYo.forwardDeclare('driver')
eYo.forwardDeclare('audio')

/**
 * @name {eYo.app.Options}
 * @constructor
 * Parse the user-specified options, using reasonable defaults where behaviour
 * is unspecified.
 * @param {Object} options Dictionary of options.  Specification:
 * collapse: boolean
 *  Allows blocks to be collapsed or expanded. Defaults to false.
 * css: boolean
 *  If false, don't inject CSS (providing CSS becomes the document's responsibility). Defaults to true.
 * disable:	boolean
 *  Allows blocks to be disabled.
 *  Defaults to false.
 * maxBricks:	number
 *  Maximum number of bricks that may be created.
 *  Useful for student exercises.
 *  Defaults to Infinity.
 * maxInstances:	object
 *  Map from brick types to maximum number of bricks of that type
 *  that may be created. Undeclared types default to Infinity.
 * media:	string
 *  Path from page (or frame) to the Edython media directory.
 * readOnly:	boolean
 *  If true, prevent the user from editing.
 *  Supresses the flyout and trash can.
 *  Defaults to false.
 * scrollbars:	boolean
 *  Sets whether the board is scrollable or not.
 *  Defaults to false.
 * sounds:	boolean
 *  If false, don't play sounds (e.g. click and delete).
 *  Defaults to true.
 * trash can:	boolean
 *  Displays or hides the trash can.
 * maxTrashcanContents:	number
 *  Maximum number of deleted items that will appear
 *  in the trash can flyout. '0' disables the feature. Defaults to '32'.
 * zoom: object
 *  Configures zooming behaviour.
 *  {controls: true,
 *           wheel: true,
 *           startScale: 1.0,
 *           maxScale: 10,
 *           minScale: 0.1,
 *           scaleSpeed: 1.2}
 */
eYo.app.makeC9r('Options', {
  init (options) {
    var readOnly = !!options.readOnly
    if (readOnly) {
      var hasTrashcan = false
      var hasCollapse = false
      var hasDisable = false
      var hasSounds = false
    } else {
      var hasTrashcan = eYo.asDef(options.trashCan, true)
      var hasCollapse = eYo.asDef(options.collapse, true)
      var hasDisable = eYo.asDef(options.disable, true)
      var hasSounds = eYo.asDef(options.sounds, true)
    }
    this.readOnly = readOnly
    this.hasTrashcan = hasTrashcan
    this.collapse = hasCollapse
    this.disable = hasDisable
    this.hasSounds = hasSounds
    this.hasScrollbars = eYo.asDef(options.scrollbars, true)
    this.maxBricks = options.maxBricks || Infinity
    this.hasCss = eYo.asDef(options.css, true)
    this.noLeftSeparator = eYo.asDef(options.noLeftSeparator, true)
    this.noDynamicList = eYo.asDef(options.noDynamicList, false)
    this.smartUnary = eYo.asDef(options.smartUnary, true)
    this.flyoutAnchor = eYo.asDef(options.flyoutAnchor, eYo.Flyout.AT_RIGHT)
    this.container = eYo.asDef(options.container, 'eyo-desk')
    this.backgroundClass = eYo.asDef(options.backgroundClass,'eyo-main-board-background')
    var pathToMedia = options.media || './static/media'
    // Strip off any trailing slash (either Unix or Windows).
    pathToMedia = pathToMedia.replace(/[\\\/]$/, '')
    this.pathToMedia = pathToMedia
    this.zoom = eYo.app.parseZoom_(options)
    this.faceless = false
    this.UI = eYo.asDef(options.UI, 'fcls')
  }
})

/**
 * Parse the user-specified zoom options, using reasonable defaults where
 * behaviour is unspecified.
 * @param {Object} options Dictionary of options.
 * @return {!Object} A dictionary of normalized options.
 * @private
 */
eYo.app.parseZoom_ = function(options) {
  var zoom = options.zoom || {}
  var options = {}
  if (zoom.controls === eYo.NA) {
    options.controls = false
  } else {
    options.controls = !!zoom.controls
  }
  if (zoom.wheel === eYo.NA) {
    options.wheel = false
  } else {
    options.wheel = !!zoom.wheel
  }
  if (zoom.startScale === eYo.NA) {
    options.startScale = 1
  } else {
    options.startScale = parseFloat(zoom.startScale);
  }
  if (zoom.maxScale === eYo.NA) {
    options.maxScale = 3
  } else {
    options.maxScale = parseFloat(zoom.maxScale)
  }
  if (zoom.minScale === eYo.NA) {
    options.minScale = 0.1
  } else {
    options.minScale = parseFloat(zoom.minScale);
  }
  if (zoom.scaleSpeed === eYo.NA) {
    options.scaleSpeed = 1.2
  } else {
    options.scaleSpeed = parseFloat(zoom.scaleSpeed)
  }
  return options
}

/**
 * Main application object.
 * @param {Object} options
 * @constructor
 * @readonly
 * The current options.
 * @property {eYo.Options} options
 * @readonly
 * The current motion in progress, if any.
 * @property {?eYo.event.Motion} motion
 * @readonly
 * The desk, if any.
 * @property {eYo.view.Desk} desk
 * @readonly
 * The ui drivers manager.
 * @property {eYo.driver.Mngr} ui_driver_mngr
 * @readonly
 * The main focus manager.
 * @property {eYo.focus.Main} focus_main
 *
 */
eYo.app.makeDflt({
  init (options) {
    this.options_ = new eYo.app.Options(options || {})
  },
  /**
   * Dispose of the audio and the motion.
   */
  dispose () {
    this.disposeUI()
  },
  properties: {
    options: eYo.NA,
    motion () {
      return new eYo.event.Motion(this)
    },
    desk () {
      return new eYo.view.Desk(this)
    },
    audio () {
      return new eYo.audio.Dflt(this)
    },
    focus_main () {
      return new eYo.focus.Main(this)
    },
    clipboard: {},
    ui_driver_mngr: {
      lazy () {
        let UI = this.options.UI || 'fcls'
        return new eYo[UI].Mngr(this)
      },
      willChange(before) {
        before && this.disposeUI()
      },
      didChange(after) {
        after && this.initUI()
      }
    },
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
      },
    },
  },
})

/**
 * Paste a brick from the local clipboard.
 * @private
 */
eYo.app.Dflt_p.paste = eYo.doNothing

/**
 * Delete this brick and the next ones if requested.
 * For edython.
 * @param {eYo.brick.Dflt} block The brick to delete.
 * @param {boolean} deep
 */
eYo.app.Dflt_p.deleteBrick = function (brick, deep) {
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
    eYo.event.groupWrap(() => {
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
 * @param {eYo.brick.Dflt} brick - Brick to be copied.
 * @private
 */
eYo.app.Dflt_p.copyBrick = function (brick, deep) {
  var xml = eYo.xml.brickToDom(brick, {noId: true, noNext: !deep})
  // Copy only the selected brick and internal bricks.
  // Encode start position in XML.
  var xy = brick.xy
  xml.setAttribute('x', xy.x)
  xml.setAttribute('y', xy.y)
  eYo.Clipboard.xml_ = xml
  eYo.Clipboard.source_ = brick.board
  this.didCopyBrick && (this.didCopyBrick(brick, xml))
}

/**
 * Copy the selected brick onto the local clipboard.
 * @param {Boolean} optNoNext Whether the next blocks may be copied too.
 * @private
 * @return {Boolean} true if copied, false otherwise
 */
eYo.app.Dflt_p.doCopy = function(optNoNext) {
  var brick = this.focus_main.brick
  if (brick) {
    this.copyBrick(brick, !optNoNext)
    return true
  }
};

/**
 * Send the selected brick to the front.
 * This is a job for the renderer.
 */
eYo.app.Dflt_p.doFront = function() {
  var b3k = this.focus_main.brick
  if (b3k) {
    b3k.sendToFront()
  }
}

/**
 * Send the selected brick to the back.
 */
eYo.app.Dflt_p.doBack = function() {
  var b3k = this.focus_main.brick
  if (b3k) {
    b3k.ui.sendToBack()
  }
}

/**
 * Scroll the board to show the selected brick.
 */
eYo.app.Dflt_p.doFocus = function() {
  var b3k = this.focus_main.brick
  if (b3k) {
    b3k.board.scrollBrickTopLeft(b3k.id)
  }
}

/**
 * Close tooltips, context menus, dropdown selections, etc.
 */
eYo.app.Dflt_p.hideChaff = eYo.doNothing

eYo.o3d.Dflt.eyo.propertiesMerge({
  /**
   * The root application
   * @type {eYo.app}
   */
  app: {
    lazy () {
      let o = this.owner
      return o && o.app
    },
    reset (resetter) {
      this.ownedForEach(x => {
        x.app_p && x.app_p.reset()
      })
      resetter()
    },
  },
})

eYo.o3d.Dflt.eyo.methodsMerge({
  ownerDidChange (overriden) {
    return function (before, after)
    /** @suppress {globalThis} */ {
      overriden(before, after)
      if (before) {
        this.app_p.reset()
      }
    }
  }
})

eYo.event.Backer.eyo.methodsMerge({
  /**
   * Clear the undo/redo stacks.
   * Forwards to the owner.
   */
  didClearUndo (overriden) {
    return function () {
      overriden()
      this.app.didClearUndo()
    }
  },
  /**
   * Message sent when an undo has been processed.
   * Forwards to the owner.
   * @param {boolean} redo False if undo, true if redo.
   */
  didProcessUndo (overriden) {
    return function (redo) {
      overriden(redo)
      this.app.didProcessUndo(redo)
    }
  },
  /**
   * Message sent when an undo has been pushed.
   * Forwards to the owner.
   */
  didPushUndo (overriden) {
    return function () {
      overriden()
      this.app.didPushUndo()
    }
  },
  /**
   * Message sent when an undo has been unshifted.
   * Forwards to the owner.
   */
  didUnshiftUndo (overriden) {
    return function () {
      overriden()
      this.app.didUnshiftUndo()
    }
  },
})
