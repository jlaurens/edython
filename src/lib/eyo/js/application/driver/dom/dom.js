/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Dom utils. Some code specific to flyout and desk.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.require('fcfl')

/**
 * @name {eYo.dom}
 * @namespace
 */

eYo.fcfl.makeNS(eYo, 'dom')

goog.forwardDeclare('goog.dom')
goog.forwardDeclare('goog.events')

/**
 * @name{eYo.dom.Dlgt}
 * The Dom default class.
 * @constructor
 */
/**
 * @name{eYo.dom.Dflt}
 * The Dom delegate default class.
 * @constructor
 */
eYo.dom.makeDflt()

/**
 * @type {eYo.dom.Mngr}
 * The manager of all the dom drivers.
 * The dom drivers are uncomplete drivers.
 */
eYo.dom.makeMngr({
  ui: {
    initMake (f) {
      return function () {
        if (object.dom) {
          return
        }
        var dom = object.dom = Object.create(null)
        dom.bound = Object.create(null)
        f && f.apply(object, rest)
        return dom
      }
    },
    disposeMake (f) {
      return function (object, ...rest) {
        var dom = object.dom
        if (dom) {
          eYo.dom.ClearBoundEvents(object)
          f && f.apply(object, rest)
          object.dom = dom.bound = null
        }
      }
    },
  },
})

/**
 * The document scroll.
 * @return {eYo.o4t.Where}
 */
eYo.dom.getDocumentScroll = () => {
  return eYo.o4t.Where.xy(goog.dom.getDocumentScroll())
}

/**
 * The TOUCH_MAP lookup dictionary specifies additional touch events to fire,
 * in conjunction with mouse events.
 * @type {Object}
 */
eYo.dom.TOUCH_MAP = Object.create(null)
if (window && window.PointerEvent) {
  Object.defineProperties(eYo.dom.TOUCH_MAP, {
    mousedown: { value: ['pointerdown'] },
    mouseenter: { value: ['pointerenter'] },
    mouseleave: { value: ['pointerleave'] },
    mousemove: { value: ['pointermove'] },
    mouseout: { value: ['pointerout'] },
    mouseover: { value: ['pointerover'] },
    mouseup: { value: ['pointerup', 'pointercancel'] },
    touchend: { value: ['pointerup'] },
    touchcancel: { value: ['pointercancel'] }
  })
} else if (goog.events.BrowserFeature.TOUCH_ENABLED) {
  Object.defineProperties(eYo.dom.TOUCH_MAP, {
    mousedown: { value: ['touchstart'] },
    mousemove: { value: ['touchmove'] },
    mouseup: { value: ['touchend', 'touchcancel'] },
  })
}

/**
 * Sets the CSS transform property on an element. This function sets the
 * non-vendor-prefixed and vendor-prefixed versions for backwards compatibility
 * with older browsers. See http://caniuse.com/#feat=transforms2d
 * @param {Element} node The node which the CSS transform should be applied.
 * @param {string} transform The value of the CSS `transform` property.
 */
eYo.dom.SetCssTransform = function(node, transform) {
  node.style['transform'] = transform
  node.style['-webkit-transform'] = transform // 2014
}

/**
 * Insert a node after a reference node.
 * Contrast with node.insertBefore function.
 * @param {Element} after New element to insert.
 * @param {Element} before Existing element to precede new node.
 * @private
 */
eYo.dom.insertAfter = function(node, before) {
  var parent = before.parentNode
  if (!parent) {
    throw 'Reference node has no parent.'
  }
  var after = before.nextSibling
  if (after) {
    parent.insertBefore(node, after)
  } else {
    parent.appendChild(node)
  }
}

/**
 * Is this event a right-click?
 * @param {Event} e Mouse event.
 * @return {boolean} True if right-click.
 */
eYo.dom.isRightButton = e => {
  if (e.ctrlKey && goog.userAgent.MAC) {
    // Control-clicking on Mac OS X is treated as a right-click.
    // WebKit on Mac OS X fails to change button to 2 (but Gecko does).
    return true
  }
  return e.button === 2
}

/**
 * Bind an event to a function call. When calling the function, verifies that
 * it belongs to the touch stream that is currently being processed, and splits
 * multitouch events into multiple events as needed.
 * @param {EventTarget} node Node upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {Object} [thisObject] The value of 'this' in the function.
 * @param {Function} callback Function to call when event is triggered.
 * @param {boolean=} opt.noCaptureIdentifier True if triggering on this event
 *     should not block execution of other event handlers on this touch or other
 *     simultaneous touches.
 * @param {boolean=} opt.noPreventDefault True if triggering on this event
 *     should prevent the default handler.  False by default.
 * @return {!Array<!Array>} Opaque data that can be passed to unbindEvent.
 */
eYo.dom.BindEvent = (node, name, thisObject, callback, opt) => {
  if (eYo.isF(thisObject)) {
    opt = callback
    callback = thisObject
    thisObject = null
  }
  eYo.assert(eYo.isF(callback))
  var handled = false
  var wrapFunc = e => {
    var noCaptureIdentifier = opt && opt.noCaptureIdentifier
    // Handle each touch point separately.  If the event was a mouse event, this
    // will hand back an array with one element, which we're fine handling.
    eYo.dom.forEachTouch(e, event => {
      if (noCaptureIdentifier || eYo.dom.ShouldHandleEvent(event)) {
        if (/^touch/i.test(event.type)) {
          // Map the touch event's properties to the event.
          var p = event.changedTouches[0]
          event.clientX = p.clientX
          event.clientY = p.clientY
        }
        thisObject
        ? callback.call(thisObject, event)
        : callback(event)
        handled = true
      }
    })
  }
  var bindData = []
  if (window && window.PointerEvent && (name in eYo.dom.TOUCH_MAP)) {
    eYo.dom.TOUCH_MAP[name].forEach(type => {
      node.addEventListener(type, wrapFunc, false)
      bindData.push([node, type, wrapFunc])
    })
  } else {
    node.addEventListener(name, wrapFunc, false)
    bindData.push([node, name, wrapFunc])
    // Add equivalent touch event.
    if (name in eYo.dom.TOUCH_MAP) {
      var touchWrapFunc = e => {
        wrapFunc(e)
        // Calling preventDefault stops the browser from scrolling/zooming the
        // page.
        var preventDef = !opt ||!opt.noPreventDefault
        if (handled && preventDef) {
          e.preventDefault()
        }
      }
      eYo.dom.TOUCH_MAP[name].forEach(type => {
        node.addEventListener(type, touchWrapFunc, false)
        bindData.push([node, type, touchWrapFunc])
      })
    }
  }
  return bindData
}

/**
 * Unbind one or more events event from a function call.
 * @param {Array<!Array>} bindData Opaque data from bindEvent.
 *     This list is emptied during the course of calling this function.
 * @return {!Function} The function call.
 */
eYo.dom.unbindEvent = bindData => {
  while (bindData.length) {
    var d = bindData.pop()
    var func = d[2]
    d[0].removeEventListener(d[1], func, false)
  }
  return func
}

/**
 * Bind mouse events.
 * @param {Object} listener A mouse down or touch start event listener.
 * @param {Element} element A mouse down or touch start event.
 * @param {Object} [opt]  Option data: suffix, option flags: willUnbind, and bindEventWithChecks_'s options
 */
eYo.dom.BindMouseEvents = (listener, element, opt) => {
  [
    'mousedown',
    'mousemove',
    'mouseup'
  ].forEach(k => {
    var f = listener['on_' + k + ((opt && opt.suffix) || '')]
    if (eYo.isF(f)) {
      var ans = eYo.dom.BindEvent(element, k, listener, f, opt)
      if (opt && opt.willUnbind) {
        var ra = listener.bind_data_ || (listener.bind_data_ = [])
        ra.push(ans)
      }
    }
  })
}

/**
 * Bind mouse events.
 * @param {Event} e A mouse down or touch start event.
 */
eYo.dom.unbindMouseEvents = function(listener) {
  listener.bind_data_ && listener.bind_data_.forEach(data => eYo.dom.unbindEvent(data))
}


/**
 * Split an event into an array of events, one per changed touch or mouse
 * point.
 * @param {Event} e A mouse event or a touch event with one or more changed
 * touches.
 * @param {Function} f A function to be executed for each event, signature (<!Event>e) -> eYo.NA.
 * @return {!Array<!Event>} An array of mouse or touch events.  Each touch
 *     event will have exactly one changed touch.
 */
eYo.dom.forEachTouch = (e, f) => {
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
 * @param {eYo.brick|eYo.board|eYo.Flyout}
 */
eYo.dom.ClearBoundEvents = (bbf) => {
  var dom = bbf.dom || bbf.dom
  var bound = dom = dom.bound
  bound && Object.values(bound).forEach(item => eYo.dom.unbindEvent(item))
}

/**
 * Decide whether we should handle or ignore this event.
 * Mouse and touch events require special checks because we only want to deal
 * with one touch stream at a time.  All other events should always be handled.
 * @param {Event} e The event to check.
 * @return {boolean} True if this event should be passed through to the
 *     registered handler; false if it should be blocked.
 */
eYo.dom.ShouldHandleEvent = e => {
  return !eYo.dom.isMouseOrTouchEvent(e) || eYo.dom.CheckTouchIdentifier(e)
}

/**
 * Check whether a given event is a touch event or a pointer event.
 * @param {Event} e An event.
 * @return {boolean} true if it is a touch event; false otherwise.
 */
eYo.dom.isTouchEvent = e => {
  return /^touch|^pointer/i.test(e.type)
}

/**
 * Check whether a given event is a touch event or a pointer event.
 * @param {Event} e An event.
 * @return {boolean} true if it is a touch event; false otherwise.
 */
eYo.dom.isMouseOrTouchEvent = e => {
  return /^mouse|^touch|^pointer/i.test(e.type)
}

/**
 * Check whether the touch identifier on the event matches the current saved
 * identifier.  If there is no identifier, that means it's a mouse event and
 * we'll use the identifier "mouse".  This means we won't deal well with
 * multiple mice being used at the same time.  That seems okay.
 * If the current identifier was unset, save the identifier from the
 * event.  This starts a drag/motion, during which touch events with other
 * identifiers will be silently ignored.
 * @param {Event} e Mouse event or touch event.
 * @return {boolean} Whether the identifier on the event matches the current
 *     saved identifier.
 */
eYo.dom.CheckTouchIdentifier = (() => {
  var touchIdentifier = null
  /**
   * Clear the touch identifier that tracks which touch stream to pay attention
   * to.  This ends the current drag/motion and allows other pointers to be
   * captured.
   */
  eYo.dom.ClearTouchIdentifier = function() {
    touchIdentifier = null
  }
  return e => {
    var identifier = eYo.dom.touchIdentifierFromEvent(e)

    // if (Blockly.touchIdentifier_ )is insufficient because Android touch
    // identifiers may be zero.
    if (touchIdentifier != eYo.NA && touchIdentifier != null) {
      // We're already tracking some touch/mouse event.  Is this from the same
      // source?
      return touchIdentifier == identifier
    }
    if (e.type == 'mousedown' || e.type == 'touchstart' || e.type == 'pointerdown') {
      // No identifier set yet, and this is the start of a drag.  Set it and
      // return.
      touchIdentifier = identifier
      return true
    }
    // There was no identifier yet, but this wasn't a start event so we're going
    // to ignore it.  This probably means that another drag finished while this
    // pointer was down.
    return false
  }
})()

/**
 * Get the touch identifier from the given event.  If it was a mouse event, the
 * identifier is the string 'mouse'.
 * @param {Event} e Mouse event or touch event.
 * @return {string} The touch identifier from the first changed touch, if
 *     defined.  Otherwise 'mouse'.
 */
eYo.dom.touchIdentifierFromEvent = e => {
  var x
  return e.pointerId != eYo.NA
  ? e.pointerId
  : ((x = e.changedTouches) && (x = x[0]) && (x = x.identifier) != eYo.NA && x != null)
    ? x
    : 'mouse'
}

/**
 * Prevents default behavior and stop propagation.
 * @param {Event} e
 */
eYo.dom.gobbleEvent = e => {
  e.preventDefault()
  e.stopPropagation()
}

/**
 * Is this event targeting a text input widget?
 * @param {Event} e An event.
 * @return {boolean} True if text input.
 */
eYo.dom.isTargetInput = e => {
  return e.target.type == 'textarea' || e.target.type == 'text' ||
         e.target.type == 'number' || e.target.type == 'email' ||
         e.target.type == 'password' || e.target.type == 'Search' ||
         e.target.type == 'tel' || e.target.type == 'url' ||
         e.target.isContentEditable
}

Object.defineProperties(eYo.dom, {
  /**
   * Length in ms for a touch to become a long press.
   */
  LONG_PRESS: { value: 750 },
  /**
   * Required name space for HTML elements.
   * @const
   */
  HTML_NS: { value: 'http://www.w3.org/1999/xhtml' },
  SVG_NS: { value: 'http://www.w3.org/2000/svg' },
  XLINK_NS: { value: 'http://www.w3.org/1999/xlink' },
  /**
   * Check if 3D transforms are supported by adding an element
   * and attempting to set the property.
   * @return {boolean} true if 3D transforms are supported.
   */
  is3dSupported: {
    get: (() => {
      var is3dSupported
      return function() {
        if (is3dSupported !== eYo.NA) {
          return is3dSupported
        }
        // CC-BY-SA Lorenzo Polidori
        // stackoverflow.com/questions/5661671/detecting-transform-translate3d-support
        if (!goog.global.getComputedStyle) {
          return false;
        }

        var el = document.createElement('p');
        var has3d = 'none';
        var transforms = {
          'webkitTransform': '-webkit-transform',
          'OTransform': '-o-transform',
          'msTransform': '-ms-transform',
          'MozTransform': '-moz-transform',
          'transform': 'transform'
        };

        // Add it to the body to get the computed style.
        document.body.insertBefore(el, null);

        for (var t in transforms) {
          if (el.style[t] !== eYo.NA) {
            el.style[t] = 'translate3d(1px,1px,1px)'
            var computedStyle = goog.global.getComputedStyle(el)
            if (!computedStyle) {
              // getComputedStyle in Firefox returns null when blockly is loaded
              // inside an iframe with display: none.  Returning false and not
              // caching is3dSupported means we try again later.  This is most likely
              // when users are interacting with blocks which should mean blockly is
              // visible again.
              // See https://bugzilla.mozilla.org/show_bug.cgi?id=548397
              document.body.removeChild(el)
              return false
            }
            has3d = computedStyle.getPropertyValue(transforms[t])
          }
        }
        document.body.removeChild(el)
        return (is3dSupported = has3d !== 'none')
      }
    }) ()
  }
})

/**
 * Bind document events, but only once.  Destroying and reinjecting Blockly
 * should not bind again.
 * Bind events for scrolling the board.
 * Most of these events should be bound to the SVG's surface.
 * However, 'mouseup' has to be on the whole document so that a block dragged
 * out of bounds and released will know that it has been released.
 * Also, 'keydown' has to be on the whole document since the browser doesn't
 * understand a concept of focus on the SVG image.
 * @private
 */
eYo.dom.BindDocumentEvents = (() => {
  var already
  return () => {
    if (!already) {
      eYo.dom.BindEvent(
        document,
        'keydown',
        eYo.dom.on_keydown
      )
      // longStop needs to run to stop the context menu from showing up.  It
      // should run regardless of what other touch event handlers have run.
      eYo.dom.BindEvent(
        document,
        'touchend',
        eYo.dom.longStop_
      )
      eYo.dom.BindEvent(
        document,
        'touchcancel',
        eYo.dom.longStop_
      )
      // Some iPad versions don't fire resize after portrait to landscape change.
      if (goog.userAgent.IPAD) {
        eYo.dom.BindEvent(
          window,
          'orientationchange',
          e => eYo.app.Desk.layout() // TODO(#397): Fix for multiple boards.
        )
      }
    }
    already = true
  }
})()

/**
 * Handle a key-down on SVG drawing surface.
 * The delete block code is.unbindMouseEvents modified
 * @param {Event} e Key down event.
 * @private
 */
eYo.dom.on_keydown = e => {
  if (eYo.app.Board.Options.readOnly || eYo.dom.isTargetInput(e)) {
    // No key actions on readonly boards.
    // When focused on an HTML text input widget, don't trap any keys.
    return
  }
  // var deleteBrick = false;
  if (e.keyCode == 9) {
    if (eYo.navigate.doTab(eYo.app.Focus_mngr.Brick, {
        left: e.shiftKey,
        fast: e.altKey || e.ctrlKey || e.metaKey
      })) {
      eYo.dom.gobbleEvent(e)
    }
  } else if (e.keyCode == 27) {
    // Pressing esc closes the context menu.
    eYo.app.hideChaff()
  } else if (e.keyCode == 8 || e.keyCode == 46) {
    // Delete or backspace.
    // Stop the browser from going back to the previous page.
    // Do this first to prevent an error in the delete code from resulting in
    // data loss.
    e.preventDefault()
    // Don't delete while dragging.  Jeez.
    if (eYo.app.Desktop.isDragging) {
      return;
    }
    if (eYo.app.Focus_mngr.Brick && eYo.app.focus_mngr.Brick.deletable) {
      eYo.app.deleteBrick(eYo.app.Focus_mngr.Brick, e.altKey || e.ctrlKey || e.metaKey);
    }
  } else if (e.altKey || e.ctrlKey || e.metaKey) {
    // Don't use meta keys during drags.
    if (eYo.app.Desktop.isDragging) {
      return;
    }
    if (eYo.app.Focus_mngr.Brick &&
        eYo.app.Focus_mngr.Brick.deletable && eYo.app.focus_mngr.Brick.movable) {
      // Eyo: 1 meta key for shallow copy, more for deep copy
      var deep = (e.altKey ? 1 : 0) + (e.ctrlKey ? 1 : 0) + (e.metaKey ? 1 : 0) > 1
      // Don't allow copying immovable or undeletable bricks. The next step
      // would be to paste, which would create additional undeletable/immovable
      // bricks on the board.
      if (e.keyCode == 67) {
        // 'c' for copy.
        eYo.app.hideChaff()
        eYo.app.Dflt.CopyBrick(eYo.app.Focus_mngr.Brick, deep)
      } else if (e.keyCode == 88 && !eYo.app.Focus_mngr.Brick.Board.readOnly) {
        // 'x' for cut, but not in a flyout.
        // Don't even copy the selected item in the flyout.
        eYo.app.Dflt.CopyBrick(eYo.app.Focus_mngr.Brick, deep)
        eYo.app.deleteBrick(eYo.app.Focus_mngr.Brick, deep)
      }
    }
    if (e.keyCode == 86) {
      // 'v' for paste.
      eYo.app.Board.paste()
    } else if (e.keyCode == 90) {
      // 'z' for undo 'Z' is for redo.
      eYo.app.hideChaff()
      eYo.app.Desk.undo(e.shiftKey)
    }
  }
  // Common code for delete and cut.
  // Don't delete in the flyout.
  // if (deleteBrick && !eYo.app.Focus_mngr.Brick.Board.readOnly) {
  //   eYo.events.group = true
  //   eYo.app.hideChaff();
  //   eYo.app.Focus_mngr.Brick.dispose(/* heal */ true, true);
  //   eYo.events.group = false
  // }
};

