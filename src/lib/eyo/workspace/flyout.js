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

goog.provide('eYo.Flyout');

goog.require('eYo.Flyout');
goog.require('eYo.Style');
goog.require('Blockly.VerticalFlyout');
goog.require('eYo.DelegateSvg');
goog.require('eYo.DelegateSvg');
goog.require('goog.dom');

goog.provide('eYo.FlyoutSlideButton');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');


/**
 * Class for a flyout.
 * @param {!Object} workspaceOptions Dictionary of options for the workspace.
 * @extends {Blockly.Flyout}
 * @constructor
 */
eYo.Flyout = function(workspaceOptions) {
  eYo.Flyout.superClass_.constructor.call(this, workspaceOptions)
  this.closed = false
  this.toolboxPosition_ = Blockly.TOOLBOX_AT_LEFT
}
goog.inherits(eYo.Flyout, Blockly.VerticalFlyout)

eYo.Flyout.prototype.BUTTON_RADIUS = 12
eYo.Flyout.prototype.BUTTON_MARGIN = 2
eYo.Flyout.prototype.CORNER_RADIUS = 0

/**
 * Creates the flyout's DOM.  Only needs to be called once.  The flyout can
 * either exist as its own svg element or be a g element nested inside a
 * separate svg element.
 * @param {string} tagName The type of tag to put the flyout in. This
 *     should be <svg> or <g>.
 * @return {!Element} The flyout's SVG group.
 */
eYo.Flyout.prototype.positionControlAt_ = function(width, height, x, y) {
  var radius = this.BUTTON_RADIUS
  var margin = this.BUTTON_MARGIN
  var big_radius = radius + margin
  var h = radius * 0.866
  if (!this.buttonGroup_) {
    this.buttonGroup_ = Blockly.utils.createSvgElement('svg', {
      'class': 'eyo-flyout-button',
    }, null);
    this.onButtonDownWrapper_ = Blockly.bindEventWithChecks_(this.buttonGroup_, 'mousedown',
    this, this.onButtonDown_);
    this.onButtonEnterWrapper_ = Blockly.bindEventWithChecks_(this.buttonGroup_, 'mouseenter',
    this, this.onButtonEnter_);
    this.onButtonLeaveWrapper_ = Blockly.bindEventWithChecks_(this.buttonGroup_, 'mouseleave',
    this, this.onButtonLeave_);
    this.onButtonUpWrapper_ = Blockly.bindEventWithChecks_(this.buttonGroup_, 'mouseup',
    this, this.onButtonUp_);
    this.buttonGroup_.setAttribute('width', this.BUTTON_RADIUS+big_radius);
    this.buttonGroup_.setAttribute('height', 2*big_radius);  
    var path = Blockly.utils.createSvgElement('path', {
      class: 'eyo-button-background'
    }, this.buttonGroup_)
    path.setAttribute('d', [
      'M 0,0',
      'l',this.CORNER_RADIUS, '0',
      'a', big_radius, big_radius, '0,0,1,0,', 2*big_radius,
      'l', -this.CORNER_RADIUS, '0', ' z',
    ].join(' '))
    this.buttonPath_ = Blockly.utils.createSvgElement('path', {
      class: 'eyo-button-image'
    }, this.buttonGroup_)
    goog.dom.insertSiblingBefore(this.buttonGroup_, this.svgGroup_)
  }
  if (this.closed) {
    this.buttonPath_.setAttribute('d', [
      'M', h + this.CORNER_RADIUS, big_radius,
      'l', -h, - radius/2,
      'l 0', radius, 'z'
    ].join(' '))
  } else {
    this.buttonPath_.setAttribute('d', [
      'M', this.CORNER_RADIUS, big_radius,
      'l', h, - radius/2,
      'l 0', radius, 'z'
    ].join(' '))
  }
  this.buttonGroup_.setAttribute('transform', 'translate(' + (x + this.width_ - this.CORNER_RADIUS) + ', ' + y + ')')
}

/**
 * Creates the flyout's DOM.  Only needs to be called once.  The flyout can
 * either exist as its own svg element or be a g element nested inside a
 * separate svg element.
 * @param {string} tagName The type of tag to put the flyout in. This
 *     should be <svg> or <g>.
 * @return {!Element} The flyout's SVG group.
 */
eYo.Flyout.prototype.createDom = function(tagName) {
  /*
  <svg | g>
    <g class="eyo-flyout-background">
      <path class="blocklyFlyoutBackground"/>
    </g>
    <g class="eyo-workspace">...</g>
  </ svg | g>
  */
  // Setting style to display:none to start. The toolbox and flyout
  // hide/show code will set up proper visibility and size later.
  this.svgGroup_ = Blockly.utils.createSvgElement(tagName,
      {'class': 'eyo-flyout', 'style': 'display: none'}, null);
  this.svgBackground_ = Blockly.utils.createSvgElement('path',
      {'class': 'eyo-flyout-background'}, this.svgGroup_);
  var g = this.workspace_.createDom()
  goog.dom.classlist.remove(g, 'blocklyWorkspace')
  goog.dom.classlist.add(g, 'eyo-workspace')
  this.svgGroup_.appendChild(g);
  return this.svgGroup_;
};
eYo.setup.register(function () {
  eYo.Style.insertCssRuleAt('.eyo-flyout { position: absolute; z-index: 20; }')
  eYo.Style.insertCssRuleAt('.eyo-flyout-background { fill: #ddd; fill-opacity: .8; }')
  eYo.Style.insertCssRuleAt('.eyo-flyout-scrollbar { z-index: 30; }')
  eYo.Style.insertCssRuleAt('.eyo-flyout-button { pointer-events: all; z-index: 40; display: block; position: absolute;}')
  eYo.Style.insertCssRuleAt('.eyo-flyout-button .eyo-button-background { fill:rgb(221,221,221);  fill-opacity: 0.8;}')
  eYo.Style.insertCssRuleAt('.eyo-flyout-button .eyo-button-image { fill: white; }',
  eYo.Style.insertCssRuleAt('.eyo-flyout-button.eyo-flash .eyo-button-image { fill:rgb(167,167,167);  fill-opacity: 0.8;}')
)
})

/**
 * Dispose of this flyout.
 * Unlink from all DOM elements to prevent memory leaks.
 */
eYo.Flyout.prototype.dispose = function() {
  eYo.Flyout.superClass_.dispose.call(this)
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
  if (this.buttonGroup_) {
    goog.dom.removeNode(this.buttonGroup_)
    this.buttonGroup_ = undefined
  }
};

/**
 * Slide out.
 * @param {!Event} e Mouse up event.
 * @private
 */
eYo.Flyout.prototype.onButtonDown_ = function(e) {
  this.isDown = true
  this.onButtonEnter_(e)
  e.stopPropagation()
  e.preventDefault()
};

/**
 * Hum, that is not always catched.
 * @param {!Event} e Mouse up event.
 * @private
 */
eYo.Flyout.prototype.onButtonEnter_ = function(e) {
  goog.dom.classlist.add(this.buttonGroup_, 'eyo-flash')
};

/**
 * Slide out.
 * @param {!Event} e Mouse up event.
 * @private
 */
eYo.Flyout.prototype.onButtonLeave_ = function(e) {
  goog.dom.classlist.remove(this.buttonGroup_, 'eyo-flash')
};

/**
 * Slide out.
 * @param {!Event} e Mouse up event.
 * @private
 */
eYo.Flyout.prototype.onButtonUp_ = function(e) {
  this.isDown = false
  this.onButtonLeave_(e)
  var gesture = this.targetWorkspace_.getGesture(e);
  if (gesture) {
    gesture.cancel();// comes from flyout button
  }
  e.stopPropagation()
  e.preventDefault()
  this.slide(!this.closed)
};

/**
 * Show and populate the flyout.
 * More tagnames accepted.
 * @param {!Array|string} xmlList List of blocks to show.
 *     Variables and procedures have a custom set of blocks.
 */
eYo.Flyout.prototype.show = function(xmlList) {
  this.workspace_.setResizesEnabled(false);
  this.hide();
  this.clearOldBlocks_();

  // Handle dynamic categories, represented by a name instead of a list of XML.
  // Look up the correct category generation function and call that to get a
  // valid XML list.
  if (typeof xmlList == 'string') {
    var fnToApply = this.workspace_.targetWorkspace.getToolboxCategoryCallback(
        xmlList);
    goog.asserts.assert(goog.isFunction(fnToApply),
        'Couldn\'t find a callback function when opening a toolbox category.');
    xmlList = fnToApply(this.workspace_.targetWorkspace);
    goog.asserts.assert(goog.isArray(xmlList),
        'The result of a toolbox category callback must be an array.');
  }

  this.setVisible(true);
  // Create the blocks to be shown in this flyout.
  var contents = [];
  var gaps = [];
  var default_gap = eYo.Font.lineHeight()/2;
 
  this.permanentlyDisabled_.length = 0;
  for (var i = 0, xml; xml = xmlList[i]; i++) {
    if (xml.tagName) {
      var tagName = xml.tagName.toUpperCase();
      if (tagName == 'BLOCK') {
        var curBlock = Blockly.Xml.domToBlock(xml, this.workspace_);
        if (curBlock.disabled) {
          // Record blocks that were initially disabled.
          // Do not enable these blocks as a result of capacity filtering.
          this.permanentlyDisabled_.push(curBlock);
        }
        contents.push({type: 'block', block: curBlock});
        var gap = parseInt(xml.getAttribute('gap'), 10);
        gaps.push(isNaN(gap) ? default_gap : gap);
      } else if (tagName == 'SEP') {
        // Change the gap between two blocks.
        // <sep gap="36"></sep>
        // The default gap is 24, can be set larger or smaller.
        // This overwrites the gap attribute on the previous block.
        // Note that a deprecated method is to add a gap to a block.
        // <block type="math_arithmetic" gap="8"></block>
        var newGap = parseInt(xml.getAttribute('gap'), 10);
        // Ignore gaps before the first block.
        if (!isNaN(newGap) && gaps.length > 0) {
          gaps[gaps.length - 1] = newGap;
        } else {
          gaps.push(default_gap);
        }
      } else if (tagName == 'BUTTON' || tagName == 'LABEL') {
        // Labels behave the same as buttons, but are styled differently.
        var isLabel = tagName == 'LABEL';
        var curButton = new Blockly.FlyoutButton(this.workspace_,
            this.targetWorkspace_, xml, isLabel);
        contents.push({type: 'button', button: curButton});
        gaps.push(default_gap);
      } else if (tagName.startsWith('EYO:')) {
        var curBlock = Blockly.Xml.domToBlock(xml, this.workspace_);
        if (curBlock.disabled) {
          // Record blocks that were initially disabled.
          // Do not enable these blocks as a result of capacity filtering.
          this.permanentlyDisabled_.push(curBlock);
        }
        contents.push({type: 'block', block: curBlock});
        var gap = parseInt(xml.getAttribute('gap'), 10);
        gaps.push(isNaN(gap) ? default_gap : gap);
      }
    } else {
      try {
        var block = eYo.DelegateSvg.newBlockReady(this.workspace_, xml)
        contents.push({type: 'block', block: block})
        gaps.push(default_gap)
      } finally {

      }
    }
  }

  this.layout_(contents, gaps);

  // IE 11 is an incompetent browser that fails to fire mouseout events.
  // When the mouse is over the background, deselect all blocks.
  var deselectAll = function() {
    var topBlocks = this.workspace_.getTopBlocks(false);
    for (var i = 0, block; block = topBlocks[i]; i++) {
      block.removeSelect();
    }
  };

  this.listeners_.push(Blockly.bindEventWithChecks_(this.svgBackground_,
      'mouseover', this, deselectAll));

  if (this.horizontalLayout_) {
    this.height_ = 0;
  } else {
    this.width_ = 0;
  }
  this.workspace_.setResizesEnabled(true);
  this.reflow();

  this.filterForCapacity_();

  // Correctly position the flyout's scrollbar when it opens.
  this.position();
  this.reflowWrapper_ = this.reflow.bind(this);
  this.workspace_.addChangeListener(this.reflowWrapper_);
}

/**
 * Add listeners to a block that has been added to the flyout.
 * Listeners work only when the flyout authorizes it.
 * The 'rect' listeners have been removed.
 * @param {!Element} root The root node of the SVG group the block is in.
 * @param {!Blockly.Block} block The block to add listeners for.
 * @param {!Element} rect The invisible rectangle under the block that acts as
 *     a mat for that block.
 * @private
 */
eYo.Flyout.prototype.addBlockListeners_ = function(root, block, rect) {
  this.listeners_.push(Blockly.bindEventWithChecks_(root, 'mousedown', null,
  this.blockMouseDown_(block)
  ));
  var catched = this
  this.listeners_.push(Blockly.bindEvent_(root, 'mouseover', block,
  function(e) {
    if (!catched.isDown) {
      this.addSelect(e)
    }
  }));
  this.listeners_.push(Blockly.bindEvent_(root, 'mouseleave', block,
  block.removeSelect
  ));
};

/**
 * Show.
 */
eYo.Flyout.prototype.slide = function(closed) {
  if (!closed === !this.closed || this.slide_locked) {
    return
  }
  this.slide_locked = true
  this.setVisible(true);
  var targetWorkspaceMetrics = this.targetWorkspace_.getMetrics();
  if (!targetWorkspaceMetrics) {
    // Hidden components will return null.
    return;
  }
  var id = setInterval(frame, 5);
  var x = targetWorkspaceMetrics.absoluteLeft;
  var dx = 0;
  var max_dx = this.width_
  var step = max_dx / 25
  var y = targetWorkspaceMetrics.absoluteTop;
  var direction = closed? -1: +1
  if (!closed) {
    x -= max_dx
  }
  var self = this
  function frame() {
    if (dx >= max_dx) {
        clearInterval(id);
        if ((self.closed = closed)) {
          self.setVisible(false)
        }
        self.positionControlAt_(self.width_, self.height_, x+direction*dx, y)
        delete self.slide_locked
        self.targetWorkspace_.recordDeleteAreas()
      } else {
      dx += step
      if (dx > max_dx) {
        dx = max_dx
      }
      self.positionAt_(self.width_, self.height_, x+direction*dx, y)
      // the scrollbar won't resize because the metrics of the workspace did not change
      var hostMetrics = self.workspace_.getMetrics()
      if (hostMetrics) {
        self.scrollbar_.resizeVertical_(hostMetrics)
      }
    }
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
eYo.Flyout.prototype.positionAt_ = function(width, height, x, y) {
  eYo.Flyout.superClass_.positionAt_.call(this, width, height, x, y)
  this.positionControlAt_(width, height, x, y)
}

