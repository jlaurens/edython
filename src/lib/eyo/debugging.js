// Remove this file when done
// copy and override functions here.

/**
 * Set the scrollbar handle's position.
 * @param {number} value The distance from the top/left end of the bar, in CSS
 *     pixels.  It may be larger than the maximum allowable position of the
 *     scrollbar handle.
 */
Blockly.Scrollbar.prototype.set = function(value) {
  console.log('Scrollbar: set', value)
  this.setHandlePosition(this.constrainHandle_(value * this.ratio_));
  this.onScroll_();
};

/**
 * Set the scrollbar handle's position.
 * @param {number} value The distance from the top/left end of the bar, in CSS
 *     pixels.  It may be larger than the maximum allowable position of the
 *     scrollbar handle.
 */
Blockly.Scrollbar.prototype.getMetrics_ = function() {
  if (!this.oldHostMetrics_) {
    this.oldHostMetrics_ = this.workspace_.getMetrics()
  }
  return this.oldHostMetrics_
};

/**
 * Set the scrollbar handle's position.
 * @param {number} value The distance from the top/left end of the bar, in CSS
 *     pixels.  It may be larger than the maximum allowable position of the
 *     scrollbar handle.
 */
Blockly.Scrollbar.prototype.setRelative = function(delta) {
  console.log('Scrollbar: setRelative', delta)
  var userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf(' electron/') > -1) {
    // Electron-specific code see https://github.com/electron/electron/issues/2288#issuecomment-337858978
  } else if (goog.userAgent.GECKO) {
    // Firefox's deltas are a tenth that of Chrome/Safari.
    delta *= 10;
  }
  console.log('wheel_', delta)
  var metrics = this.getMetrics_();
  console.log(metrics.viewTop, metrics.contentTop)
  var old_pos = metrics.viewTop - metrics.contentTop
  var new_pos = old_pos + delta;
  this.setHandlePosition(this.constrainHandle_(new_pos * this.ratio_));
  this.onScroll_();
};

/**
 * Called when scrollbar is moved.
 * @private
 */
Blockly.Scrollbar.prototype.onScroll_ = function() {
  var ratio = this.handlePosition_ / this.scrollViewSize_;
  if (isNaN(ratio)) {
    ratio = 0;
  }
  var xyRatio = {};
  if (this.horizontal_) {
    xyRatio.x = ratio;
  } else {
    xyRatio.y = ratio;
  }
  this.workspace_.setMetrics(xyRatio);
};

/**
 * Scroll the flyout.
 * @param {!Event} e Mouse wheel scroll event.
 * @private
 */
Blockly.VerticalFlyout.prototype.wheel_ = function(e) {
  var delta = e.deltaY;
  if (delta) {
    this.scrollbar_.setRelative(delta);
    // When the flyout moves from a wheel event, hide WidgetDiv.
    Blockly.WidgetDiv.hide();
  }

  // Don't scroll the page.
  e.preventDefault();
  // Don't propagate mousewheel event (zooming).
  e.stopPropagation();
};

