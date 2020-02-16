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
eYo.forwardDeclare('Audio')

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
      var hasTrashcan = eYo.AsDef(options.trashCan, true)
      var hasCollapse = eYo.AsDef(options.collapse, true)
      var hasDisable = eYo.AsDef(options.disable, true)
      var hasSounds = eYo.AsDef(options.sounds, true)
    }
    this.readOnly = readOnly
    this.hasTrashcan = hasTrashcan
    this.collapse = hasCollapse
    this.disable = hasDisable
    this.hasSounds = hasSounds
    this.hasScrollbars = eYo.AsDef(options.scrollbars, true)
    this.maxBricks = options.maxBricks || Infinity
    this.hasCss = eYo.AsDef(options.css, true)
    this.noLeftSeparator = eYo.AsDef(options.noLeftSeparator, true)
    this.noDynamicList = eYo.AsDef(options.noDynamicList, false)
    this.smartUnary = eYo.AsDef(options.smartUnary, true)
    this.flyoutAnchor = eYo.AsDef(options.flyoutAnchor, eYo.Flyout.AT_RIGHT)
    this.container = eYo.AsDef(options.container, 'eyo-desk')
    this.backgroundClass = eYo.AsDef(options.backgroundClass,'eyo-main-board-background')
    var pathToMedia = options.media || './static/media'
    // Strip off any trailing slash (either Unix or Windows).
    pathToMedia = pathToMedia.replace(/[\\\/]$/, '')
    this.pathToMedia = pathToMedia
    this.zoom = eYo.app.parseZoom_(options)
    this.faceless = false
    this.UI = eYo.AsDef(options.UI, 'fcls')
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
      return new eYo.Audio(this)
    },
    focus_main () {
      return new eYo.focus.Main(this)
    },
    clipboard: {},
    ui_driver_mngr: {
      value () {
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
eYo.app.Dflt_p.paste = eYo.do.nothing

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
  eYo.Clipboard.xml = xml
  eYo.Clipboard.Source = brick.board
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
eYo.app.Dflt_p.hideChaff = eYo.do.nothing
