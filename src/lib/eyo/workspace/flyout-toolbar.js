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

/**
 * Creates the flyout toolbar's DOM.
 * @param {Object} dom helper.
 * @return {!Element} The flyout toolbar's div.
 */
eYo.FlyoutToolbar.prototype.doSelectGeneral = function(e) {
  var workspace = this.flyout_.targetWorkspace_
  if (workspace && this.selectControl_) {
    var category = this.selectControl_.getValue()
    var list = workspace.eyo.getFlyoutsForCategory(category)
    if (list.length) {
      this.flyout_.show(list)
    }
  }
}

/**
 * Creates the flyout toolbar's DOM.
 * @param {Object} dom helper.
 * @return {!Element} The flyout toolbar's div.
 */
eYo.FlyoutToolbar.prototype.createDom = function (dom) {
  if (this.div_) {
    return
  }
  /*
  <div class="eyo-flyout-toolbar">
    <div class="eyo-flyout-toolbar-general">
      <div class="eyo-flyout-select-general">
        ...
      </div>
      <div class="eyo-flyout-control">
        ...
      </div>
    </div>
    <div class="eyo-flyout-toolbar-module">
      <div class="eyo-flyout-select-module">
        ...
      </div>
    </div>
  </div>
  */
  var cssClass = this.flyout_.eyo.getCssClass()
  this.control_ = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'control'))
  var svg = Blockly.utils.createSvgElement('svg', {
    id: 'svg-control-image',
    class: goog.getCssName(cssClass, 'control-image')
  }, this.control_)
  this.controlPath_ = Blockly.utils.createSvgElement('path', {
    id: "p-flyout-control"
  }, svg)
  if (eYo.App && eYo.App.flyoutDropDown) {
    this.select_general_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select'),
      eYo.App.flyoutDropDown
    )  
  } else if (eYo.App && eYo.App.flyoutDropDownGeneral && eYo.App.flyoutDropDownModule) {
    this.select_general_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-general'),
      eYo.App.flyoutDropDownGeneral
    )  
    this.select_module_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-module'),
      eYo.App.flyoutDropDownModule
    )  
  } else {
    this.select_general_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-general')
    )
    var select = new goog.ui.Select(null, new eYo.Menu(), eYo.MenuButtonRenderer.getInstance())
    // select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'test'))
    // select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'basic'))
    select.addItem(new eYo.MenuItem(eYo.Msg.INTERMEDIATE, 'intermediate'))
    select.addItem(new eYo.MenuItem(eYo.Msg.ADVANCED, 'advanced'))
    select.addItem(new eYo.MenuItem(eYo.Msg.EXPERT, 'expert'))
    select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BRANCHING, 'branching'))
    select.addItem(new eYo.MenuItem(eYo.Msg.LOOPING, 'looping'))
    select.addItem(new eYo.MenuItem(eYo.Msg.FUNCTION, 'function'))
    select.setSelectedIndex(0)
    select.render(this.select_general_)
    this.listenableKey = select.listen(
      goog.ui.Component.EventType.ACTION,
      this.doSelectGeneral,
      false,
      this
    )  
    this.select_module_ = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName(cssClass, 'select-module')
    )
    var select = new goog.ui.Select(null, new eYo.Menu(), eYo.MenuButtonRenderer.getInstance())
    // select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'test'))
    // select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BASIC, 'basic'))
    select.addItem(new eYo.MenuItem(eYo.Msg.INTERMEDIATE, 'intermediate'))
    select.addItem(new eYo.MenuItem(eYo.Msg.ADVANCED, 'advanced'))
    select.addItem(new eYo.MenuItem(eYo.Msg.EXPERT, 'expert'))
    select.addItem(new eYo.Separator())
    select.addItem(new eYo.MenuItem(eYo.Msg.BRANCHING, 'branching'))
    select.addItem(new eYo.MenuItem(eYo.Msg.LOOPING, 'looping'))
    select.addItem(new eYo.MenuItem(eYo.Msg.FUNCTION, 'function'))
    select.setSelectedIndex(0)
    select.render(this.select_module_)
    this.listenableKey = select.listen(
      goog.ui.Component.EventType.ACTION,
      this.doSelectGeneral,
      false,
      this
    )
  }
  var div_general = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'toolbar-general'),
    this.select_general_
  )
  var div_module = goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'toolbar-module'),
    this.select_module_
  )
  this.div_ = eYo.App.flyoutToolbarSwitcher
  ? goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'toolbar'),
    eYo.App.flyoutToolbarSwitcher,
    this.control_
  )
  : goog.dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(cssClass, 'toolbar'),
    div_general,
    div_module,
    this.control_
  )
  this.onButtonDownWrapper_ = Blockly.bindEventWithChecks_(this.control_, 'mousedown', this, this.onButtonDown_)
  this.onButtonEnterWrapper_ = Blockly.bindEventWithChecks_(this.control_, 'mouseenter', this, this.onButtonEnter_)
  this.onButtonLeaveWrapper_ = Blockly.bindEventWithChecks_(this.control_, 'mouseleave', this, this.onButtonLeave_)
  this.onButtonUpWrapper_ = Blockly.bindEventWithChecks_(this.control_, 'mouseup', this, this.onButtonUp_)
  return this.div_
}

// toolbar height
var one_rem = eYo.Unit.rem

eYo.FlyoutToolbar.prototype.MARGIN = eYo.Padding.t
eYo.FlyoutToolbar.prototype.HEIGHT = 2 * (eYo.Font.lineHeight + 2 * eYo.FlyoutToolbar.prototype.MARGIN)

eYo.FlyoutToolbar.prototype.BUTTON_RADIUS = eYo.FlyoutToolbar.prototype.HEIGHT / 4
// left margin
eYo.FlyoutToolbar.prototype.BUTTON_MARGIN = eYo.FlyoutToolbar.prototype.BUTTON_RADIUS / 8

eYo.setup.register(() => {
  var height = eYo.FlyoutToolbar.prototype.HEIGHT
  var margin = eYo.FlyoutToolbar.prototype.MARGIN
  var radius = eYo.FlyoutToolbar.prototype.BUTTON_RADIUS
  var controlWidth = margin + radius
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar {
      position: absolute;
      z-index: 30;
      pointer-events: all;
      height: 4rem;
      padding: 0.25rem;
      margin: 0;
      background: rgba(221,221,221,0.8);
      z-index: 100;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar-general {
      position: absolute;
      pointer-events: all;
      height: 2rem;
      padding: 0.125rem;
      width: 100%;
      margin: 0;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar-module {
      position: absolute;
      pointer-events: all;
      height: 1.75rem;
      padding: 0.125rem;
      margin: 0;
      margin-top: 2.25rem;
      width: 100%;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-select-general,
    .eyo-flyout-select-module {
      height: 100%;
      width: 100%;
      padding-left: 0.25rem;
      padding-right:0.25rem;
      margin: 0
    }`
  )

  var radius = '1.125rem;'
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control {
      background: #ddd;
      opacity: 0.79;
      height: 50%;
      width: 1.25rem;
      position: absolute;
      top: 0px;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control left {
      border-top-right-radius:${radius};
      border-bottom-right-radius:${radius};
      -webkit-border-top-right-radius:${radius};
      -webkit-border-bottom-right-radius:${radius};
      -moz-border-radius-topright:${radius};
      -moz-border-radius-bottomright:${radius};
      border-top-right-radius:${radius};
      border-bottom-right-radius:${radius};
      right: -1.25rem;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control {
      border-top-left-radius:${radius};
      border-bottom-left-radius:${radius};
      -webkit-border-top-left-radius:${radius};
      -webkit-border-bottom-left-radius:${radius};
      -moz-border-radius-topleft:${radius};
      -moz-border-radius-bottomleft:${radius};
      border-top-left-radius:${radius};
      border-bottom-left-radius:${radius};
      left: -1.25rem;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control-image {
      width: 1.125rem;
      height: 2.25rem;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control-image path {
      fill: white;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-control-image path:hover {
      fill:black;
      fill-opacity: 0.075;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flash .eyo-flyout-control-image path,
    .eyo-flash .eyo-flyout-control-image path:hover {
      fill:black;
      fill-opacity:0.2;
    }`
  )
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
    var el = document.querySelector('#eyo-flyout-dropdown .dropdown.show')
    if (e) {
      goog.dom.classlist.remove('show')
    }
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
// Sometimes this error has poped up.
// console.error(`Uncaught TypeError: this.onButtonLeave_ is not a function
// at eYo.FlyoutToolbar.notOnButtonUp_`)
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
  // do nothing if there is no control path
  var height = this.HEIGHT
  var margin = this.MARGIN
  var big_radius = 1.25 * one_rem
  var radius = 1.125 * one_rem
  var h = radius * 0.75

  this.div_.style.width = width + 'px'
  // this.div_.style.height = height + 'px'

  var path = this.controlPath_
  if (this.flyout_.eyo.closed) {
    path.setAttribute('d', [
      'M', margin + h + this.flyout_.CORNER_RADIUS, radius,
      'l', -h, - radius/2,
      'l 0', radius, 'z'
    ].join(' '))
  } else {
    path.setAttribute('d', [
      'M', this.flyout_.CORNER_RADIUS, radius,
      'l', h, - radius/2,
      'l 0', radius, 'z'
    ].join(' '))
  }
};

/**
 * Update the view based on coordinates calculated in position().
 * @param {number} width The computed width of the flyout's SVG group
 * @param {number} height The computed height of the flyout's SVG group.
 * @param {number} x The computed x origin of the flyout's SVG group.
 * @param {number} y The computed y origin of the flyout's SVG group.
 * @private
 */
eYo.FlyoutToolbar.prototype.positionAt_ = function(width, height, x, y) {
  this.div_.style.left = x + 'px'
  this.div_.style.top = y + 'px'
};

eYo.setup.register(() => {
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar .eyo-menu-button {
      background: #952276;
      box-shadow: 0px 3px 8px #888;
      border:0;
    }`
  )
    eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar .eyo-menu-button:hover {
      box-shadow: 0px 2px 6px #444;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menu-button-outer-box {
      padding-left: 10px;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menu-button-inner-box {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
      padding-right: 30px;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-flyout-toolbar .eyo-menu-button-caption {
      color: white;
      vertical-align: middle;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menu-button-dropdown svg {
      position: absolute;
      top: 0px;
      width: 12px;
      height: 6px;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menu-button-dropdown-image {
      fill: white;
    }`
  )
})
