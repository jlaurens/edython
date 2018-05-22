/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Flyout overriden.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('eYo.FlyoutToolbar');

goog.require('eYo.MenuRenderer');
goog.require('eYo.MenuButtonRenderer');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.ui.Select');

/**
 * Class for a flyout toolbar.
 * @constructor
 */
eYo.FlyoutToolbar = function(flyout) {
  this.flyout_ = flyout
}

eYo.FlyoutToolbar.prototype.MARGIN = eYo.Padding.t()
eYo.FlyoutToolbar.prototype.HEIGHT = eYo.Font.lineHeight() + 2 * eYo.FlyoutToolbar.prototype.MARGIN

/**
 * Creates the flyout toolbar's DOM.
 * @param {Object} dom helper.
 * @return {!Element} The flyout toolbar's div.
 */
eYo.FlyoutToolbar.prototype.createDom = function(dom) {
  if (this.div_) {
    return
  }
  /*
  <div class="eyo-flyout-toolbar">
    <div id="eyo-flyout-select">
      ....
    </div>
    <div class="eyo-flyout-control">
      <svg class="eyo-flyout-control-image">
        <path d="...">
      </svg>
    </div>
  </div>
  */
  var cssClass = this.flyout_.eyo.getCssClass()
  this.control_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'control'))
  var svg = Blockly.utils.createSvgElement('svg', {
    'class': goog.getCssName(cssClass, 'control-image')
  }, this.control_)
  this.controlPath_ = Blockly.utils.createSvgElement('path', null , svg)
  this.select_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'select')
  )
  var select = new goog.ui.Select(null, new eYo.Menu(),  eYo.MenuButtonRenderer.getInstance())
  select.addItem(new eYo.MenuItem('Blade Runner', 'BR'))
  select.addItem(new eYo.MenuItem('Godfather Part II', 'GPII'))
  select.addItem(new eYo.MenuItem('Citizen Kane', 'CK'))
  select.addItem(new eYo.MenuItem('A very long title that exceeds the available room', 'VLT'))
  select.setSelectedIndex(0)
  select.render(this.select_)
  this.listenableKey = select.listen(
    goog.ui.Component.EventType.ACTION,
    function(e) {
      console.log(select.getValue())
    },
    false,
    this
  )
  this.selectControl_ = select
  this.div_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'toolbar'),
    this.select_,
    this.control_,
  )
  this.onButtonDownWrapper_ = Blockly.bindEventWithChecks_(this.control_, 'mousedown',
  this, this.onButtonDown_);
  this.onButtonEnterWrapper_ = Blockly.bindEventWithChecks_(this.control_, 'mouseenter',
  this, this.onButtonEnter_);
  this.onButtonLeaveWrapper_ = Blockly.bindEventWithChecks_(this.control_, 'mouseleave',
  this, this.onButtonLeave_);
  this.onButtonUpWrapper_ = Blockly.bindEventWithChecks_(this.control_, 'mouseup',
  this, this.onButtonUp_);
  return this.div_;
};

eYo.setup.register(function () {
  var height = eYo.FlyoutToolbar.prototype.HEIGHT
  var margin = eYo.FlyoutToolbar.prototype.MARGIN
  var controlWidth = (margin + height/2)
  eYo.Style.insertCssRuleAt(
    '.eyo-flyout-toolbar {',
    'position: absolute; z-index: 30; pointer-events: all;',
    'height:' + height + 'px;',
    // 'box-sizing: border-box;',
    // '-moz-box-sizing: border-box;',
    // '-webkit-box-sizing: border-box;',
  '}')
  eYo.Style.insertCssRuleAt('.eyo-flyout-select {',
    'background: #ddd; opacity: 0.8;',
    'height: 100%;',
    'width: 100%;',
    'box-sizing: border-box;',
    '-moz-box-sizing: border-box;',
    '-webkit-box-sizing: border-box;',
    'padding-left:' + Blockly.BlockSvg.TAB_WIDTH + 'px;',
    'padding-right:' + Blockly.BlockSvg.TAB_WIDTH + 'px;',
    'padding-top:' + eYo.Padding.t() +'px;',
    'padding-bottom:' + eYo.Padding.b() +'px;',
  '}')
  var radius = height / 2 + 'px;'
  eYo.Style.insertCssRuleAt('.eyo-flyout-control {',
    'background: #ddd; opacity: 0.8;',
    'border-top-right-radius:', radius,
    'border-bottom-right-radius:', radius,
    '-webkit-border-top-right-radius:', radius,
    '-webkit-border-bottom-right-radius:', radius,
    '-moz-border-radius-topright:', radius,
    '-moz-border-radius-bottomright:', radius,
    'border-top-right-radius:', radius,
    'border-bottom-right-radius:', radius,
    'height: 100%;',
    'width: ' + controlWidth + 'px;',
    'position: absolute;',
    'top: 0px;',   
    'right: -' + controlWidth + 'px;',   
  '}')
  eYo.Style.insertCssRuleAt('.eyo-flyout-control-image {',
    'width: ' + (eYo.FlyoutToolbar.prototype.MARGIN + eYo.FlyoutToolbar.prototype.HEIGHT/2) + 'px;',
    'height: ' + height + 'px;',
  '}')
  eYo.Style.insertCssRuleAt('.eyo-flyout-control-image path {',
    'fill: white;',
  '}')
  eYo.Style.insertCssRuleAt(
    '.eyo-flyout-control-image path:hover { fill:black;  fill-opacity: 0.075;}')
  eYo.Style.insertCssRuleAt(
  '.eyo-flash .eyo-flyout-control-image path, .eyo-flash .eyo-flyout-control-image path:hover { fill:black;  fill-opacity: 0.2;}')
})

/**
 * Dispose of this flyout toolbar.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.FlyoutToolbar.prototype.dispose = function() {
  if (this.onButtonDownWrapper_) {
    Blockly.unbindEvent_(this.onButtonDownWrapper_);
    this.onButtonDownWrapper_ = undefined
  }
  if (this.onButtonEnterWrapper_) {
    Blockly.unbindEvent_(this.onButtonEnterWrapper_);
    this.onButtonEnterWrapper_ = undefined
  }
  if (this.onButtonLeaveWrapper_) {
    Blockly.unbindEvent_(this.onButtonLeaveWrapper_);
    this.onButtonLeaveWrapper_ = undefined
  }
  if (this.onButtonUpWrapper_) {
    Blockly.unbindEvent_(this.onButtonUpWrapper_);
    this.onButtonUpWrapper_ = undefined
  }
  if (this.selectControl_) {
    this.selectControl_.unlisten(this.listenableKey)
    this.selectControl_ = undefined
  }
};

/**
 * Slide out.
 * @param {!Event} e Mouse up event.
 * @private
 */
eYo.FlyoutToolbar.prototype.onButtonDown_ = function(e) {
  this.isDown = true
  window.addEventListener('mouseup', this.notOnButtonUp_)
  this.onButtonEnter_(e)
  e.stopPropagation()
  e.preventDefault()
};

/**
 * That is catched when the flyout has the focus.
 * @param {!Event} e Mouse up event.
 * @private
 */
eYo.FlyoutToolbar.prototype.onButtonEnter_ = function(e) {
  if (this.isDown) {
    goog.dom.classlist.add(this.control_, 'eyo-flash')
  }
};

/**
 * Unhilight.
 * @param {!Event} e Mouse up event.
 * @private
 */
eYo.FlyoutToolbar.prototype.onButtonLeave_ = function(e) {
  goog.dom.classlist.remove(this.control_, 'eyo-flash')
};

/**
 * Slide out.
 * @param {!Event} e Mouse up event.
 * @private
 */
eYo.FlyoutToolbar.prototype.onButtonUp_ = function(e) {
  window.removeEventListener('mouseup', this.notOnButtonUp_)
  if (this.isDown) {
    this.isDown = false
    this.selectControl_.setOpen(false)
    this.flyout_.eyo.slide()  
    this.onButtonLeave_(e)
    var gesture = this.flyout_.targetWorkspace_.getGesture(e);
    if (gesture) {
      gesture.cancel();// comes from flyout button
    }
    e.stopPropagation()
    e.preventDefault()
  }
};

/**
 * Mouse up catcher.
 * @param {!Event} e Mouse up event.
 * @private
 */
eYo.FlyoutToolbar.prototype.notOnButtonUp_ = function(e) {
  window.removeEventListener('mouseup', this.notOnButtonUp_)
  this.onButtonLeave_(e)
  var gesture = this.targetWorkspace_.getGesture(e);
  if (gesture) {
    gesture.cancel();// comes from flyout button
  }
  e.stopPropagation()
  e.preventDefault()  
};

/**
 * Resize.
 * @param {!Event} e Mouse up event.
 * @private
 */
eYo.FlyoutToolbar.prototype.resize = function(width, height) {

  var height = this.HEIGHT
  var margin = this.MARGIN
  var big_radius = height / 2
  var radius = big_radius - margin
  var h = radius * 0.866

  this.div_.style.width = width + 'px'
  this.div_.style.height = height + 'px'

  var path = this.controlPath_
  if (this.flyout_.eyo.closed) {
    path.setAttribute('d', [
      'M', margin + h + this.flyout_.CORNER_RADIUS, big_radius,
      'l', -h, - radius/2,
      'l 0', radius, 'z'
    ].join(' '))
  } else {
    path.setAttribute('d', [
      'M', this.flyout_.CORNER_RADIUS, big_radius,
      'l', h, - radius/2,
      'l 0', radius, 'z'
    ].join(' '))
  }
};
