/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Dom utils.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Dom')

goog.require('eYo.Driver')

goog.forwardDeclare('goog.dom');

/**
 * Model for dom utilities
 */
eYo.Dom = function () {
  eYo.Dom.superClass_.constructor.call(this)
}
goog.inherits(eYo.Dom, eYo.Driver)

/**
 * Inject a Blockly editor into the specified container element (usually a div).
 * @param {!Element|string} container Containing element, or its ID,
 *     or a CSS selector.
 * @param {Object=} opt_options Optional dictionary of options.
 * @return {!Blockly.Workspace} Newly created main workspace.
 */
eYo.Dom.inject = function(container, opt_options) {
  if (goog.isString(container)) {
    container = document.getElementById(container) ||
        document.querySelector(container)
  }
  // Verify that the container is in document.
  if (!goog.dom.contains(document, container)) {
    throw 'Error: container is not in current document.';
  }
  var subContainer = goog.dom.createDom(goog.dom.TagName.DIV, 'injectionDiv');
  container.appendChild(subContainer)

  var options = new Blockly.Options(opt_options || {})

    // Sadly browsers (Chrome vs Firefox) are currently inconsistent in laying
  // out content in RTL mode.  Therefore Blockly forces the use of LTR,
  // then manually positions content in RTL as needed.
  container.setAttribute('dir', 'LTR')

  // Load CSS.
  Blockly.Css.inject(options.hasCss, options.pathToMedia);

  // Build the SVG DOM.
  /*
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.1"
    class="blocklySvg">
    ...
  </svg>
  */
  // Suppress the browser's context menu.
  eYo.Dom.bindEvent(
    container,
    'contextmenu',
    null,
    e => eYo.Dom.isTargetInput(e) || e.preventDefault()
  )

  var svg = eYo.Svg.createElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'eyo-svg'
  }, container)
  
  return (Blockly.mainWorkspace = eYo.App.workspace = eYo.Dom.createMainWorkspace_(svg, options))
}

/**
 * Create a main workspace and add it to the SVG.
 * @param {!Element} svg SVG element with pattern defined.
 * @param {!Blockly.Options} options Dictionary of options.
 * @return {!eYo.Workspace} Newly created main workspace.
 * @private
 */
eYo.Dom.createMainWorkspace_ = function(svg, options) {
  options.parentWorkspace = null;

  // Create surfaces for dragging things. These are optimizations
  // so that the broowser does not repaint during the drag.
  options.brickDragSurface = new Blockly.BlockDragSurfaceSvg(subContainer);
  options.workspaceDragSurface = new Blockly.WorkspaceDragSurfaceSvg(subContainer);

  var mainWorkspace = new eYo.Workspace(options)
  mainWorkspace.scale = options.zoomOptions.startScale;
  svg.appendChild(mainWorkspace.createDom('eyo-main-background'));

  // A null translation will also apply the correct initial scale.
  mainWorkspace.translate(0, 0)

  if (!options.readOnly && !options.hasScrollbars) {
    var workspaceChanged = function() {
      if (!mainWorkspace.isDragging()) {
        var metrics = mainWorkspace.getMetrics()
        var edgeLeft = metrics.viewLeft + metrics.absoluteLeft;
        var edgeTop = metrics.viewTop + metrics.absoluteTop;
        if (metrics.contentTop < edgeTop ||
            metrics.contentTop + metrics.contentHeight >
            metrics.viewHeight + edgeTop ||
            metrics.contentLeft <
                (options.RTL ? metrics.viewLeft : edgeLeft) ||
            metrics.contentLeft + metrics.contentWidth > (options.RTL ?
                metrics.viewWidth : metrics.viewWidth + edgeLeft)) {
          // One or more blocks may be out of bounds.  Bump them back in.
          var MARGIN = 25;
          mainWorkspace.getTopBricks(false).forEach(brick => {
            var xy = brick.xyInWorkspace
            var size = brick.size
            // Bump any brick that's above the top back inside.
            var overflowTop = edgeTop + MARGIN - size.height - xy.y;
            if (overflowTop > 0) {
              brick.xyMoveBy(0, overflowTop)
            }
            // Bump any brick that's below the bottom back inside.
            var overflowBottom =
                edgeTop + metrics.viewHeight - MARGIN - xy.y;
            if (overflowBottom < 0) {
              brick.xyMoveBy(0, overflowBottom)
            }
            // Bump any brick that's off the left back inside.
            var overflowLeft = MARGIN + edgeLeft -
                xy.x - size.width;
            if (overflowLeft > 0) {
              brick.xyMoveBy(overflowLeft, 0);
            }
            // Bump any brick that's off the right back inside.
            var overflowRight = edgeLeft + metrics.viewWidth - MARGIN -
                xy.x;
            if (overflowRight < 0) {
              brick.xyMoveBy(overflowRight, 0);
            }
          })
        }
      }
    }
    mainWorkspace.addChangeListener(workspaceChanged)
  }
  // The SVG is now fully assembled.
  Blockly.svgResize(mainWorkspace)

  mainWorkspace.ui_driver.workspaceBind_resize(mainWorkspace)
  eYo.Dom.bindDocumentEvents_()

  if (options.hasScrollbars) {
    mainWorkspace.scrollbar = new Blockly.ScrollbarPair(mainWorkspace);
    mainWorkspace.scrollbar.resize();
  }

  // Load the sounds.
  if (options.hasSounds) {
    eYo.Dom.loadSounds_(options.pathToMedia, mainWorkspace)
  }

  return mainWorkspace;
}

/**
 * The TOUCH_MAP lookup dictionary specifies additional touch events to fire,
 * in conjunction with mouse events.
 * @type {Object}
 */
eYo.Dom.TOUCH_MAP = {}
if (window && window.PointerEvent) {
  Object.defineProperties(eYo.Dom.TOUCH_MAP, {
    'mousedown': { value: ['pointerdown'] },
    'mouseenter': { value: ['pointerenter'] },
    'mouseleave': { value: ['pointerleave'] },
    'mousemove': { value: ['pointermove'] },
    'mouseout': { value: ['pointerout'] },
    'mouseover': { value: ['pointerover'] },
    'mouseup': { value: ['pointerup', 'pointercancel'] },
    'touchend': { value: ['pointerup'] },
    'touchcancel': { value: ['pointercancel'] }
  })
} else if (goog.events.BrowserFeature.TOUCH_ENABLED) {
  Object.defineProperties(eYo.Dom.TOUCH_MAP, {
    'mousedown': { value: ['touchstart'] },
    'mousemove': { value: ['touchmove'] },
    'mouseup': { value: ['touchend', 'touchcancel'] },
  })
}

/**
 * Bind an event to a function call.  When calling the function, verifies that
 * it belongs to the touch stream that is currently being processed, and splits
 * multitouch events into multiple events as needed.
 * @param {!EventTarget} node Node upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @param {boolean=} opt.noCaptureIdentifier True if triggering on this event
 *     should not block execution of other event handlers on this touch or other
 *     simultaneous touches.
 * @param {boolean=} opt.noPreventDefault True if triggering on this event
 *     should prevent the default handler.  False by default.
 * @return {!Array.<!Array>} Opaque data that can be passed to unbindEvent.
 */
eYo.Dom.bindEvent = eYo.Dom.prototype.bindEvent = (node, name, thisObject, func, opt) => {
  var handled = false
  var wrapFunc = e => {
    var noCaptureIdentifier = opt && opt.noCaptureIdentifier
    // Handle each touch point separately.  If the event was a mouse event, this
    // will hand back an array with one element, which we're fine handling.
    eYo.Dom.forEachTouch(e, event => {
      if (noCaptureIdentifier || eYo.Dom.shouldHandleEvent(event)) {
        if (/^touch/i.test(event.type)) {
          // Map the touch event's properties to the event.
          var p = event.changedTouches[0]
          event.clientX = p.clientX
          event.clientY = p.clientY
        }
        ; thisObject
        ? func.call(thisObject, event)
        : func(event)
        handled = true
      }
    })
  }
  var bindData = []
  if (window && window.PointerEvent && (name in eYo.Dom.TOUCH_MAP)) {
    eYo.Dom.TOUCH_MAP[name].forEach(type => {
      node.addEventListener(type, wrapFunc, false)
      bindData.push([node, type, wrapFunc])
    })
  } else {
    node.addEventListener(name, wrapFunc, false)
    bindData.push([node, name, wrapFunc])
    // Add equivalent touch event.
    if (name in eYo.Dom.TOUCH_MAP) {
      var touchWrapFunc = e => {
        wrapFunc(e)
        // Calling preventDefault stops the browser from scrolling/zooming the
        // page.
        var preventDef = !opt ||!opt.noPreventDefault
        if (handled && preventDef) {
          e.preventDefault()
        }
      }
      eYo.Dom.TOUCH_MAP[name].forEach(type => {
        node.addEventListener(type, touchWrapFunc, false)
        bindData.push([node, type, touchWrapFunc])
      })
    }
  }
  return bindData
}

/**
 * Unbind one or more events event from a function call.
 * @param {!Array.<!Array>} bindData Opaque data from bindEvent_.
 *     This list is emptied during the course of calling this function.
 * @return {!Function} The function call.
 */
eYo.Dom.unbindEvent = eYo.Dom.prototype.unbindEvent = bindData => {
  while (bindData.length) {
    var d = bindData.pop()
    var func = datum[2]
    d[0].removeEventListener(d[1], func, false)
  }
  return func
}

/**
 * Bind mouse events.
 * @param {!Object} listener A mouse down or touch start event listener.
 * @param {!Element} element A mouse down or touch start event.
 * @param {?Object} opt  Option data: suffix, option flags: willUnbind, and bindEventWithChecks_'s options
 * @package
 */
eYo.Dom.prototype.bindMouseEvents = function(listener, element, opt) {
  ;[
    'mousedown',
    'mousemove',
    'mouseup'
  ].forEach(k => {
    var f = listener['on_' + k + ((opt && opt.suffix) || '')]
    if (f) {
      var ans = this.bindEvent(element, k, listener, f, opt)
      if (opt && opt.willUnbind) {
        var ra = listener.bind_data_ || (listener.bind_data_ = [])
        ra.push(ans)
      }
    }
  })
}

/**
 * Bind mouse events.
 * @param {!Event} e A mouse down or touch start event.
 * @package
 */
eYo.Dom.prototype.unbindMouseEvents = function(listener) {
  listener.bind_data_ && listener.bind_data_.forEach(data => this.unbindEvent(data))
}


/**
 * Split an event into an array of events, one per changed touch or mouse
 * point.
 * @param {!Event} e A mouse event or a touch event with one or more changed
 * touches.
 * @param {!Function} f A function to be executed for each event, signature (<!Event>e) -> undefined.
 * @return {!Array.<!Event>} An array of mouse or touch events.  Each touch
 *     event will have exactly one changed touch.
 */
eYo.Dom.forEachTouch = eYo.Dom.prototype.forEachTouch = (e, f) => {
  if (e.changedTouches) {
    e.changedTouches.forEach(t => {
      var newEvent = {
        type: e.type,
        changedTouches: [t],
        target: e.target,
        stopPropagation: function() {  e.stopPropagation() },
        preventDefault: function() { e.preventDefault() }
      }
      f(newEvent)
    })
  } else {
    f(e)
  }
}

/**
 * @param {eYo.Block|eYo.Workspace|eYo.Flyout}
 */
eYo.Dom.unbindBoundEvents = (bfw) => {
  var dom = bfw.ui.dom || bfw.dom
  var bound = dom = dom.bound
  bound && Object.values(bound).forEach(item => eYo.Dom.unbindEvent(item))
}

/**
 * Decide whether we should handle or ignore this event.
 * Mouse and touch events require special checks because we only want to deal
 * with one touch stream at a time.  All other events should always be handled.
 * @param {!Event} e The event to check.
 * @return {boolean} True if this event should be passed through to the
 *     registered handler; false if it should be blocked.
 */
eYo.Dom.prototype.shouldHandleEvent = function(e) {
  return !this.isMouseOrTouchEvent(e) || this.checkTouchIdentifier(e)
}

/**
 * Check whether a given event is a touch event or a pointer event.
 * @param {!Event} e An event.
 * @return {boolean} true if it is a touch event; false otherwise.
 */
eYo.Dom.prototype.isTouchEvent = function(e) {
  return /^touch|^pointer/i.test(e.type)
}

/**
 * Check whether a given event is a touch event or a pointer event.
 * @param {!Event} e An event.
 * @return {boolean} true if it is a touch event; false otherwise.
 */
eYo.Dom.prototype.isMouseOrTouchEvent = function(e) {
  return /^mouse|^touch|^pointer/i.test(e.type)
}

/**
 * Check whether the touch identifier on the event matches the current saved
 * identifier.  If there is no identifier, that means it's a mouse event and
 * we'll use the identifier "mouse".  This means we won't deal well with
 * multiple mice being used at the same time.  That seems okay.
 * If the current identifier was unset, save the identifier from the
 * event.  This starts a drag/gesture, during which touch events with other
 * identifiers will be silently ignored.
 * @param {!Event} e Mouse event or touch event.
 * @return {boolean} Whether the identifier on the event matches the current
 *     saved identifier.
 */
eYo.Dom.prototype.checkTouchIdentifier = function(e) {
  var identifier = this.touchIdentifierFromEvent(e)

  // if (Blockly.touchIdentifier_ )is insufficient because Android touch
  // identifiers may be zero.
  if (this.touchIdentifier_ != undefined && this.touchIdentifier_ != null) {
    // We're already tracking some touch/mouse event.  Is this from the same
    // source?
    return this.touchIdentifier_ == identifier
  }
  if (e.type == 'mousedown' || e.type == 'touchstart' || e.type == 'pointerdown') {
    // No identifier set yet, and this is the start of a drag.  Set it and
    // return.
    this.touchIdentifier_ = identifier;
    return true;
  }
  // There was no identifier yet, but this wasn't a start event so we're going
  // to ignore it.  This probably means that another drag finished while this
  // pointer was down.
  return false
}


/**
 * Clear the touch identifier that tracks which touch stream to pay attention
 * to.  This ends the current drag/gesture and allows other pointers to be
 * captured.
 */
eYo.Dom.prototype.clearTouchIdentifier = function() {
  this.touchIdentifier_ = null;
}

/**
 * Get the touch identifier from the given event.  If it was a mouse event, the
 * identifier is the string 'mouse'.
 * @param {!Event} e Mouse event or touch event.
 * @return {string} The touch identifier from the first changed touch, if
 *     defined.  Otherwise 'mouse'.
 */
eYo.Dom.prototype.touchIdentifierFromEvent = function(e) {
  var x
  return e.pointerId != undefined
  ? e.pointerId
  : ((x = e.changedTouches) && (x = x[0]) && (x = x.identifier) != undefined && x != null)
    ? x
    : 'mouse'
}

/**
 * Get the cumulated affine transform of an element.
 * @param {*} element
 */
eYo.Do.getAffineTransform = (() => {
  var getAffineTransform = (str) => {
    var values = str.split(/\s*,\s*|\)\s*|.*\(/)
    if (values.length > 8) {
      values = str.split(/\s*,\s+|\)\s*|.*\(/)
    }
    if (values.length > 6) {
      values.pop()
      values.shift()
      return new goog.math.AffineTransform(...values.map(m => parseFloat(m)))
    }
  }
  return (element) => {
    var A
    var parent
    while ((parent = element.parentNode)) {
      var style = window.getComputedStyle(element, null)
      var transform = style.getPropertyValue("transform") ||
        style.getPropertyValue("-webkit-transform") ||
        style.getPropertyValue("-moz-transform") ||
        style.getPropertyValue("-ms-transform") ||
        style.getPropertyValue("-o-transform")
      var B = getAffineTransform(transform)
      if (B) {
        A = A ? B.concatenate(A) : B
      }
      element = parent
    }
    return A
  }
})()

/**
 * Get the cumulated affine transform of an element.
 * @param {*} element
 */
eYo.Do.getTransformCorrection = (element) => {
  var A = eYo.Do.getAffineTransform(element)
  if (A) {
    var B = A.createInverse()
    if (B) {
      return (xy) => {
        return {
          x: B.m00_ * xy.x + B.m01_ * xy.y + B.m02_,
          y: B.m10_ * xy.x + B.m11_ * xy.y + B.m12_
        }
      }
    }
  }
}

/**
 * Dispose of the given slot's rendering resources.
 * @param {eYo.Flyout} flyout
 */
eYo.Dom.prototype.flyoutDispose = function (flyout) {
  if (flyout.dom && flyout.dom.toolbarDiv_) {
    goog.dom.removeNode(flyout.dom.toolbarDiv_)
    this.dom = undefined
  }
}

/**
 * Prevents default behavior and stop propagation.
 * @param {Event} e
 */
eYo.Dom.gobbleEvent = eYo.Dom.prototype.gobbleEvent = function (e) {
  e.preventDefault()
  e.stopPropagation()
}

/**
 * Is this event targeting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text input.
 */
eYo.Dom.isTargetInput = function(e) {
  return e.target.type == 'textarea' || e.target.type == 'text' ||
         e.target.type == 'number' || e.target.type == 'email' ||
         e.target.type == 'password' || e.target.type == 'search' ||
         e.target.type == 'tel' || e.target.type == 'url' ||
         e.target.isContentEditable
}


Object.defineProperties(eYo.Dom, {
  /**
   * Length in ms for a touch to become a long press.
   */
  LONG_PRESS: { value: 750 },
})

/**
 * Context menus on touch devices are activated using a long-press.
 * Unfortunately the contextmenu touch event is currently (2015) only supported
 * by Chrome.  This function is fired on any touchstart event, queues a task,
 * which after about a second opens the context menu.  The tasks is killed
 * if the touch event terminates early.
 * @param {!Event} e Touch start event.
 * @param {eYo.Gesture} gesture The gesture that triggered this longStart.
 * @private
 */
eYo.Dom.longStart_ = (() => {
  var pid = 0
  /**
   * Nope, that's not a long-press.  Either touchend or touchcancel was fired,
   * or a drag hath begun.  Kill the queued long-press task.
   * @private
   */
  eYo.Dom.longStop_ = () => {
    if (pid) {
      clearTimeout(pid)
      pid = 0
    }
  }
  return (e, gesture) => {
    eYo.Dom.longStop_()
    // Punt on multitouch events.
    if (e.changedTouches && e.changedTouches.length != 1) {
      return;
    }
    pid = setTimeout(() => {
      // Additional check to distinguish between touch events and pointer events
      if (e.changedTouches) {
        // TouchEvent
        e.button = 2  // Simulate a right button click.
        // e was a touch event.  It needs to pretend to be a mouse event.
        e.clientX = e.changedTouches[0].clientX
        e.clientY = e.changedTouches[0].clientY
      }
      // Let the gesture route the right-click correctly.
      if (gesture) {
        gesture.handleRightClick(e)
      }
    }, eYo.Dom.LONG_PRESS)
  }
})()


/**
 * Bind document events, but only once.  Destroying and reinjecting Blockly
 * should not bind again.
 * Bind events for scrolling the workspace.
 * Most of these events should be bound to the SVG's surface.
 * However, 'mouseup' has to be on the whole document so that a block dragged
 * out of bounds and released will know that it has been released.
 * Also, 'keydown' has to be on the whole document since the browser doesn't
 * understand a concept of focus on the SVG image.
 * @private
 */
eYo.Dom.bindDocumentEvents = (() => {
  var already
  return () => {
    if (!already) {
      eYo.Dom.bindEvent(document, 'keydown', null, eYo.Dom.on_keydown)
      // longStop needs to run to stop the context menu from showing up.  It
      // should run regardless of what other touch event handlers have run.
      Blockly.bindEvent_(document, 'touchend', null, Blockly.longStop_);
      Blockly.bindEvent_(document, 'touchcancel', null, Blockly.longStop_);
      // Some iPad versions don't fire resize after portrait to landscape change.
      if (goog.userAgent.IPAD) {
        Blockly.bindEventWithChecks_(window, 'orientationchange', document,
            function() {
              // TODO(#397): Fix for multiple blockly workspaces.
              Blockly.svgResize(Blockly.getMainWorkspace());
            });
      }
    }
    already = true
  }
})()

/**
 * Handle a key-down on SVG drawing surface.
 * The delete block code is.unbindMouseEvents modified
 * @param {!Event} e Key down event.
 * @private
 */
eYo.Dom.on_keydown = e => {
  if (eYo.App.workspace.options.readOnly || eYo.Dom.isTargetInput(e)) {
    // No key actions on readonly workspaces.
    // When focused on an HTML text input widget, don't trap any keys.
    return
  }
  // var deleteBrick = false;
  if (e.keyCode == 9) {
    if (eYo.Navigate.doTab(eYo.Selected.brick, {
        left: e.shiftKey,
        fast: e.altKey || e.ctrlKey || e.metaKey
      })) {
      eYo.Dom.gobbleEvent(e)
    }
  } else if (e.keyCode == 27) {
    // Pressing esc closes the context menu.
    Blockly.hideChaff()
  } else if (e.keyCode == 8 || e.keyCode == 46) {
    // Delete or backspace.
    // Stop the browser from going back to the previous page.
    // Do this first to prevent an error in the delete code from resulting in
    // data loss.
    e.preventDefault()
    // Don't delete while dragging.  Jeez.
    if (eYo.App.workspace.isDragging()) {
      return;
    }
    if (eYo.Selected.brick && eYo.Selected.brick.isDeletable()) {
      eYo.Desktop.deleteBrick(eYo.Selected.brick, e.altKey || e.ctrlKey || e.metaKey);
    }
  } else if (e.altKey || e.ctrlKey || e.metaKey) {
    // Don't use meta keys during drags.
    if (eYo.App.workspace.isDragging()) {
      return;
    }
    if (eYo.Selected.brick &&
        eYo.Selected.brick.isDeletable() && eYo.Selected.brick.isMovable()) {
      // Eyo: 1 meta key for shallow copy, more for deep copy
      var deep = (e.altKey ? 1 : 0) + (e.ctrlKey ? 1 : 0) + (e.metaKey ? 1 : 0) > 1
      // Don't allow copying immovable or undeletable bricks. The next step
      // would be to paste, which would create additional undeletable/immovable
      // bricks on the workspace.
      if (e.keyCode == 67) {
        // 'c' for copy.
        Blockly.hideChaff();
        eYo.Desktop.copyBrick(eYo.Selected.brick, deep);
      } else if (e.keyCode == 88 && !eYo.Selected.brick.workspace.isFlyout) {
        // 'x' for cut, but not in a flyout.
        // Don't even copy the selected item in the flyout.
        eYo.Desktop.copyBrick(eYo.Selected.brick, deep);
        eYo.deleteBrick(eYo.Selected.brick, deep);
      }
    }
    if (e.keyCode == 86) {
      // 'v' for paste.
      if (Blockly.clipboardXml_) {
        Blockly.Events.setGroup(true);
        // Pasting always pastes to the main workspace, even if the copy started
        // in a flyout workspace.
        var workspace = Blockly.clipboardSource_;
        if (workspace.isFlyout) {
          workspace = workspace.targetSpace;
        }
        workspace.paste(Blockly.clipboardXml_);
        Blockly.Events.setGroup(false);
      }
    } else if (e.keyCode == 90) {
      // 'z' for undo 'Z' is for redo.
      Blockly.hideChaff()
      eYo.App.workspace.undo(e.shiftKey)
    }
  }
  // Common code for delete and cut.
  // Don't delete in the flyout.
  // if (deleteBrick && !eYo.Selected.brick.workspace.isFlyout) {
  //   Blockly.Events.setGroup(true);
  //   Blockly.hideChaff();
  //   eYo.Selected.brick.dispose(/* heal */ true, true);
  //   Blockly.Events.setGroup(false);
  // }
};

/**
 * Load sounds for the given workspace.
 * @param {string} pathToMedia The path to the media directory.
 * @param {!eYo.Workspace} workspace The workspace to load sounds for.
 * @private
 */
eYo.Dom.loadSounds_ = function(pathToMedia, workspace) {
  var audioMgr = workspace.getAudioManager()
  audioMgr.load(
      [
        pathToMedia + 'click.mp3',
        pathToMedia + 'click.wav',
        pathToMedia + 'click.ogg'
      ], 'click');
  audioMgr.load(
      [
        pathToMedia + 'disconnect.wav',
        pathToMedia + 'disconnect.mp3',
        pathToMedia + 'disconnect.ogg'
      ], 'disconnect');
  audioMgr.load(
      [
        pathToMedia + 'delete.mp3',
        pathToMedia + 'delete.ogg',
        pathToMedia + 'delete.wav'
      ], 'delete');

  // Bind temporary hooks that preload the sounds.
  var soundBinds = [];
  var unbindSounds = () => {
    while (soundBinds.length) {
      eYo.Dom.unbindEvent_(soundBinds.pop())
    }
    audioMgr.preload()
  }

  // These are bound on mouse/touch events with eYo.Dom.bindEvent, so
  // they restrict the touch identifier that will be recognized.  But this is
  // really something that happens on a click, not a drag, so that's not
  // necessary.

  // Android ignores any sound not loaded as a result of a user action.
  soundBinds.push(eYo.Dom.bindEvent(
    document,
    'mousemove',
    null,
    unbindSounds,
    {noCaptureIdentifier: true}
  ))
  soundBinds.push(eYo.Dom.bindEvent(
    document,
    'touchstart',
    null,
    unbindSounds,
    {noCaptureIdentifier: true}
  ))
};

