/*
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview Top application class.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('do')
eYo.require('decorate')

/**
 * @name{eYo.app}
 * @namespace
 */
eYo.o4t.newNS(eYo, 'app')

eYo.forward('css')

eYo.forward('focus')
eYo.forward('event.Motion')
eYo.forward('view.Desk')
eYo.forward('drvr')
eYo.forward('audio')

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
 *           scaleStart: 1.0,
 *           scaleMax: 10,
 *           scaleMin: 0.1,
 *           scaleSpeed: 1.2}
 */
eYo.app.newC3s('Options', {
  init (options) {
    if ((this.readOnly = !!options.readOnly)) {
      var hasTrashcan = false
      var hasCollapse = false
      var hasDisable = false
      var hasSounds = false
    } else {
      hasTrashcan = eYo.asDef(options.trashCan, true)
      hasCollapse = eYo.asDef(options.collapse, true)
      hasDisable = eYo.asDef(options.disable, true)
      hasSounds = eYo.asDef(options.sounds, true)
    }
    this.hasTrashcan = hasTrashcan
    this.collapse = hasCollapse
    this.disable = hasDisable
    this.hasSounds = hasSounds
    this.hasScrollbars = eYo.asDef(options.scrollbars, true)
    this.maxBricks = options.maxBricks ?? Infinity
    this.hasCss = eYo.asDef(options.css, true)
    this.noLeftSeparator = eYo.asDef(options.noLeftSeparator, true)
    this.noDynamicList = eYo.asDef(options.noDynamicList, false)
    this.smartUnary = eYo.asDef(options.smartUnary, true)
    this.flyoutAnchor = eYo.asDef(options.flyoutAnchor, eYo.flyout.AT_RIGHT)
    this.container = eYo.asDef(options.container, 'eyo-desk')
    this.backgroundClass = eYo.asDef(options.backgroundClass,'eyo-main-board-background')
    var pathToMedia = options.media ?? './static/media'
    // Strip off any trailing slash (either Unix or Windows).
    pathToMedia = pathToMedia.replace(/[\\/]$/, '')
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
eYo.app._p.parseZoom_ = function (options = {}) {
  var zoom = options.zoom ?? {}
  options.controls = !!zoom.controls
  options.wheel = !!zoom.wheel
  let f = (s, d) => {
    let p = parseFloat(s)
    return isNaN(p) ? d : p
  }
  options.scaleStart = f(zoom.scaleStart, 1)
  options.scaleMax = f(zoom.scaleMax, 3)
  options.scaleMin = f(zoom.scaleMin, 0.1)
  options.scaleSpeed = f(zoom.scaleSpeed, 1.2)
  return options
}

/**
 * Main application object.
 * @param {Object} options
 * @constructor
 * @readonly
 * The current options.
 * @property {eYo.app.Options} options
 * @readonly
 * The current motion in progress, if any.
 * @property {?eYo.event.Motion} motion
 * @readonly
 * The desk, if any.
 * @property {eYo.view.Desk} desk
 * @readonly
 * The ui drivers manager.
 * @property {eYo.drvr.Mngr} driver_mngr
 * @readonly
 * The main focus manager.
 * @property {eYo.focus.Main} focus_main
 *
 */
eYo.app.makeC3sBase({
  init (options) {
    this.options_ = new eYo.app.Options(options ?? {})
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
      return eYo.audio.new(this)
    },
    focus_main () {
      return new eYo.focus.Main(this)
    },
    clipboard () {
      return new eYo.app.Clipboard(this)
    },
    driver_mngr: {
      lazy () {
        let UI = this.options.UI ?? 'fcls'
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
  },
  aliases: {
    'motion.isDragging': 'isDragging',
  },
  methods: {
    /**
     * Copy the selected brick onto the local clipboard.
     * @param {Boolean} optNoNext Whether the next blocks may be copied too.
     * @private
     * @return {Boolean} true if copied, false otherwise
     */
    doCopy (optNoNext) {
      var b3k = this.focus_main.brick
      if (b3k) {
        this.copyBrick(b3k, !optNoNext)
        return true
      }
    },
    /**
     * Send the selected brick to the front.
     * This is a job for the renderer.
     */
    doFront () {
      var b3k = this.focus_main.brick
      if (b3k) {
        b3k.sendToFront()
      }
    },
    /**
    * Send the selected brick to the back.
    */
    doBack () {
      var b3k = this.focus_main.brick
      if (b3k) {
        b3k.sendToBack()
      }
    },
    /**
    * Scroll the board to show the selected brick.
    */
    doFocus () {
      var b3k = this.focus_main.brick
      if (b3k) {
        b3k.board.scrollBrickTopLeft(b3k.id)
      }
    },
    /**
     * Paste a brick from the local clipboard.
     * @private
     */
    doPaste: eYo.doNothing,
    /**
     * Delete this brick and the next ones if requested.
     * For edython.
     * @param {eYo.Brick} b3k - The brick to delete.
     * @param {boolean} deep - whether to delete the next bricks too.
     */
    deleteBrick (b3k, deep) {
      let brd = b3k.clipboard
      if (b3k && b3k.deletable && !brd.readOnly) {
        if (b3k.hasFocus) {
          // prepare a connection or a block to be selected
          var m4t
          if ((m4t = b3k.out_m)) {
            m4t = m4t.target
          } else if ((m4t = b3k.foot_m)) {
            var t9k = m4t.targetBrick
          }
        }
        brd.eventMngr.groupWrap(() => {
          this.hideChaff()
          if (deep) {
            do {
              var low = b3k.foot
              b3k.dispose(false, true)
            } while ((b3k = low))
          } else {
            b3k.dispose(true, true)
          }
        })
        if (m4t && m4t.board) {
          m4t.focusOn()
        } else if (t9k) {
          t9k.focusOn()
        }
      }
    },
    /**
     * Copy a brick onto the local clipboard.
     * @param {eYo.brick.C3sBase} b3k - Brick to be copied.
     * @private
     */
    copyBrick (b3k, deep) {
      let xml = eYo.xml.brickToDom(b3k, {noId: true, noNext: !deep})
      // Copy only the selected brick and internal bricks.
      // Encode start position in XML.
      let xy = b3k.xy
      xml.setAttribute('x', xy.x)
      xml.setAttribute('y', xy.y)
      this.clipboard.xml_ = xml
      this.clipboard.source_ = b3k.board
      this.didCopyBrick && this.didCopyBrick(b3k, xml)
    },
    /**
     * Close tooltips, context menus, dropdown selections, etc.
     */
    hideChaff: eYo.doNothing,
  },
})

eYo.o4t.C3sBase[eYo.$][eYo.o4t.C3sBase[eYo.$].p6y$.merge]({
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
    /**
     * The app's audio manager
     * @readonly
     * @type {eYo.dom.Audio}
     */
    audio: {
      get () {
        let a = this.app ; return a && a.audio
      },
    },
    /**
     * The app's desk
     * @readonly
     * @type {eYo.view.Desk}
     */
    desk: {
      get () {
        let a = this.app ; return a && a.desk
      },
    },
    /**
     * The desk's flyout...
     * @readonly
     * @type {eYo.flyout.View}
     */
    flyout: {
      get () {
        let d = this.desk ; return d && d.flyout
      },
    },
    /**
     * The desk's board
     * @readonly
     * @type {eYo.board}
     */
    board: {
      get () {
        let d = this.desk ; return d && d.board
      },
    },
    /**
     * The desk's workspace...
     * @readonly
     * @type {eYo.view.Workspace}
     */
    workspace: {
      get () {
        let d = this.desk ; return d && d.workspace
      },
    },
  },
})

{
  let eyo = eYo.o4t.C3sBase[eYo.$]
  eyo[eyo.p6y$.merge]({
    /**
     * The root application
     * @type {eYo.app}
     */
    app: {
      lazy () {
        //<<< mochai: app
        let o = this.owner
        return o && o.app
        //... let o = eYo.o4t.new(onr, 'o')
        //... onr.app = 421
        //... chai.expect(o.app).equal(421)
        //... let oo = eYo.o4t.new(o, 'oo')
        //... chai.expect(oo.app).equal(421)
        //>>>
      },
      reset (resetter) {
        this.ownedForEach(x => {
          x.app_p && x.app_p.reset()
        })
        resetter()
      },
      /**
       * The app's audio manager
       * @readonly
       * @type {eYo.dom.Audio}
       */
      audio: {
        get () {
          let a = this.app ; return a && a.audio
        },
      },
      /**
       * The app's desk
       * @readonly
       * @type {eYo.view.Desk}
       */
      desk: {
        get () {
          let a = this.app ; return a && a.desk
        },
      },
      /**
       * The desk's flyout...
       * @readonly
       * @type {eYo.flyout.View}
       */
      flyout: {
        get () {
          let d = this.desk ; return d && d.flyout
        },
      },
      /**
       * The desk's board
       * @readonly
       * @type {eYo.board}
       */
      board: {
        get () {
          let d = this.desk ; return d && d.board
        },
      },
      /**
       * The desk's workspace...
       * @readonly
       * @type {eYo.view.Workspace}
       */
      workspace: {
        get () {
          let d = this.desk ; return d && d.workspace
        },
      },
    },
  })
}

eYo.o3d.C3sBase[eYo.$].modelMerge({
  aliases: {
    /**
     * Options
     */
    'owner.options': 'options',
  },
  methods: {
    ownerDidChange (overriden) {
      return function (before, after)
      /** @suppress {globalThis} */ {
        overriden(before, after)
        if (before) {
          this.app_p.reset()
        }
      }
    }
  },
})

eYo.event.Mngr[eYo.$].methodsMerge({
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

/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Clipboard manager, in progress.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

console.error('In progress')

/**
 * 
 */
eYo.o3d.newC3s(eYo.app, 'Clipboard', {
  aliases: {
    'desk.board': 'board',
    'source.desk': 'desk',
  },
  properties: {
    dom: eYo.isNA,
    xml: eYo.NA,
    source: eYo.isNA,
  },
})
