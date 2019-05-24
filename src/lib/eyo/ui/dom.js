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
eYo.Dom.prototype.bindEvent = function(node, name, thisObject, func, opt) {
  var handled = false;
  var wrapFunc = e => {
    var noCaptureIdentifier = opt && opt.noCaptureIdentifier
    // Handle each touch point separately.  If the event was a mouse event, this
    // will hand back an array with one element, which we're fine handling.
    this.forEachTouch(e, event => {
      if (noCaptureIdentifier || this.shouldHandleEvent(event)) {
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
eYo.Dom.prototype.unbindEvent = function(bindData) {
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
eYo.Dom.prototype.forEachTouch = function(e, f) {
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
 * @param {eYo.Block|eYo.Workspace|eYo.Flyout} bfw
 */
eYo.Dom.unbindBoundEvents = funtion (bfw) {
  var dom = bfw.ui.dom || bfw.dom
  var bound = dom = dom.bound
  bound && Object.values(bound).forEach(item => this.unbindEvent(item))
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
