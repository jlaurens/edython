/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Factory model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.provide('eYo.Options')


/**
 * Parse the user-specified options, using reasonable defaults where behaviour
 * is unspecified.
 * @param {!Object} options Dictionary of options.  Specification:
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
 *  Supresses the flyout and trashcan.
 *  Defaults to false.
 * scrollbars:	boolean
 *  Sets whether the desk is scrollable or not.
 *  Defaults to false.
 * sounds:	boolean
 *  If false, don't play sounds (e.g. click and delete).
 *  Defaults to true.
 * trashcan:	boolean
 *  Displays or hides the trashcan.
 * maxTrashcanContents:	number
 *  Maximum number of deleted items that will appear
 *  in the trashcan flyout. '0' disables the feature. Defaults to '32'.
 * zoom: object
 *  Configures zooming behaviour.
 *  {controls: true,
 *           wheel: true,
 *           startScale: 1.0,
 *           maxScale: 3,
 *           minScale: 0.3,
 *           scaleSpeed: 1.2}
 * @constructor
 */
eYo.Options = function(options) {
  var readOnly = !!options.readOnly
  if (readOnly) {
    var hasTrashcan = false
    var hasCollapse = false
    var hasDisable = false
    var hasSounds = false
  } else {
    var hasTrashcan = eYo.Do.ifDef(options.trashcan, true)
    var hasCollapse = eYo.Do.ifDef(options.collapse, true)
    var hasDisable = eYo.Do.ifDef(options.disable, true)
    var hasSounds = eYo.Do.ifDef(options.sounds, true)

  }
  this.readOnly = readOnly
  this.hasTrashcan = hasTrashcan
  this.collapse = hasCollapse
  this.disable = hasDisable
  this.hasSounds = hasSounds
  this.hasScrollbars = eYo.Do.ifDef(options.scrollbars, true)
  this.maxBricks = options.maxBricks || Infinity
  this.hasCss = eYo.Do.ifDef(options.css, true)
  this.noLeftSeparator = eYo.Do.ifDef(options.noLeftSeparator, true)
  this.noDynamicList = eYo.Do.ifDef(options.noDynamicList, false)
  this.smartUnary = eYo.Do.ifDef(options.smartUnary, true)
  this.flyoutAnchor = eYo.Do.ifDef(options.flyoutAnchor, eYo.Flyout.AT_RIGHT)
  this.container = eYo.Do.ifDef(options.container, 'eyo-factory')
  this.backgroundClass = eYo.Do.ifDef(options.backgroundClass,'eyo-main-desk-background')
  var pathToMedia = options.media || './static/media'
  // Strip off any trailing slash (either Unix or Windows).
  pathToMedia = pathToMedia.replace(/[\\\/]$/, '')
  this.pathToMedia = pathToMedia
  this.zoomOptions = eYo.Options.parseZoomOptions_(options)
}

/**
 * If set, sets the translation of the desk to match the scrollbars.
 */
eYo.Options.prototype.setMetrics = null

/**
 * Return an object with the metrics required to size the desk.
 * @return {Object} Contains size and position metrics, or null.
 */
eYo.Options.prototype.getMetrics = null

/**
 * Parse the user-specified zoom options, using reasonable defaults where
 * behaviour is unspecified.
 * @param {!Object} options Dictionary of options.
 * @return {!Object} A dictionary of normalized options.
 * @private
 */
eYo.Options.parseZoomOptions_ = function(options) {
  var zoom = options.zoom || {}
  var zoomOptions = {}
  if (zoom.controls === undefined) {
    zoomOptions.controls = false
  } else {
    zoomOptions.controls = !!zoom.controls
  }
  if (zoom.wheel === undefined) {
    zoomOptions.wheel = false
  } else {
    zoomOptions.wheel = !!zoom.wheel
  }
  if (zoom.startScale === undefined) {
    zoomOptions.startScale = 1
  } else {
    zoomOptions.startScale = parseFloat(zoom.startScale);
  }
  if (zoom.maxScale === undefined) {
    zoomOptions.maxScale = 3
  } else {
    zoomOptions.maxScale = parseFloat(zoom.maxScale)
  }
  if (zoom.minScale === undefined) {
    zoomOptions.minScale = 0.3
  } else {
    zoomOptions.minScale = parseFloat(zoom.minScale);
  }
  if (zoom.scaleSpeed === undefined) {
    zoomOptions.scaleSpeed = 1.2
  } else {
    zoomOptions.scaleSpeed = parseFloat(zoom.scaleSpeed)
  }
  return zoomOptions
}
