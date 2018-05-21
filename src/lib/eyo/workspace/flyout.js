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

goog.provide('eYo.FlyoutSlideButton');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');


/**
 * Class for a flyout.
 * @param {!Object} workspaceOptions Dictionary of options for the workspace.
 * @extends {Blockly.Flyout}
 * @constructor
 */
eYo.Flyout = function(workspace) {
  eYo.Flyout.superClass_.constructor.call(this, {parentWorkspace: workspace})
  this.closed = false
  this.toolboxPosition_ = Blockly.TOOLBOX_AT_LEFT
  workspace.flyout_ = this
}
goog.inherits(eYo.Flyout, Blockly.VerticalFlyout)

eYo.Flyout.prototype.BUTTON_RADIUS = 12
eYo.Flyout.prototype.BUTTON_MARGIN = 2
eYo.Flyout.prototype.CORNER_RADIUS = 0

eYo.Flyout.prototype.TOP_MARGIN = 2*(eYo.Flyout.prototype.BUTTON_RADIUS+eYo.Flyout.prototype.BUTTON_MARGIN)
eYo.Flyout.prototype.BOTTOM_MARGIN = 16


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
  <svg>
    <g class="eyo-flyout-background">
      <path class="blocklyFlyoutBackground"/>
    </g>
    <g class="eyo-workspace">...</g>
  </svg>
  <svg class="eyo-flyout">
    <g class="eyo-flyout-background">
      <path class="blocklyFlyoutBackground"/>
    </g>
    <g class="eyo-workspace">...</g>
  </svg>
  */
  this.svgGroup_ = Blockly.utils.createSvgElement(tagName,
      {'class': 'eyo-flyout', 'style': 'display: none'}, null);
  this.svgBackground_ = Blockly.utils.createSvgElement('path',
      {'class': 'eyo-flyout-background'}, this.svgGroup_);
  var g = this.workspace_.createDom()
  goog.dom.classlist.remove(g, 'blocklyWorkspace')
  goog.dom.classlist.add(g, 'eyo-workspace')
  this.svgGroup_.appendChild(g);
  // very simple toolbar : one drop down menu and one flat button
  this.toolbarGroup_ = Blockly.utils.createSvgElement('svg', {
    'class': 'eyo-flyout-toolbar',
  }, null);
  this.toolbarPath_ = Blockly.utils.createSvgElement('path', {
    class: 'eyo-flyout-toolbar-background'
  }, this.toolbarGroup_)
  this.buttonGroup_ = Blockly.utils.createSvgElement('g', {
    'class': 'eyo-flyout-toolbar-button',
  }, this.toolbarGroup_);
  this.onButtonDownWrapper_ = Blockly.bindEventWithChecks_(this.buttonGroup_, 'mousedown',
  this, this.onButtonDown_);
  this.onButtonEnterWrapper_ = Blockly.bindEventWithChecks_(this.buttonGroup_, 'mouseenter',
  this, this.onButtonEnter_);
  this.onButtonLeaveWrapper_ = Blockly.bindEventWithChecks_(this.buttonGroup_, 'mouseleave',
  this, this.onButtonLeave_);
  this.onButtonUpWrapper_ = Blockly.bindEventWithChecks_(this.buttonGroup_, 'mouseup',
  this, this.onButtonUp_);
  this.buttonBackground_ = Blockly.utils.createSvgElement('path', {
    class: 'eyo-flyout-toolbar-button-background'
  }, this.buttonGroup_)
  this.buttonImage_ = Blockly.utils.createSvgElement('path', {
    class: 'eyo-flyout-toolbar-button-image'
  }, this.buttonGroup_)
  return this.svgGroup_;
};

eYo.setup.register(function () {
  eYo.Style.insertCssRuleAt(
    '.eyo-flyout { position: absolute; z-index: 20; }')
  eYo.Style.insertCssRuleAt(
    '.eyo-flyout-background { fill: #ddd; fill-opacity: .8; }')
  eYo.Style.insertCssRuleAt(
    '.eyo-flyout-scrollbar { z-index: 30; }')
  eYo.Style.insertCssRuleAt(
    '.eyo-flyout-toolbar { display: block; position: absolute; z-index: 30; }')
  eYo.Style.insertCssRuleAt(
    '.eyo-flyout-toolbar-button { pointer-events: all; z-index: 40; display: block; position: absolute;}')
  eYo.Style.insertCssRuleAt(
    '.eyo-flyout-toolbar-background { fill: #ddd; fill-opacity: 0.8; }')
  eYo.Style.insertCssRuleAt(
    '.eyo-flyout-toolbar-button-background { fill: transparent; }')
  eYo.Style.insertCssRuleAt(
    '.eyo-flyout-toolbar-button-image { fill: white; }')
  eYo.Style.insertCssRuleAt(
    '.eyo-flyout-toolbar-button-image:hover { fill:black;  fill-opacity: 0.075;}')
  eYo.Style.insertCssRuleAt(
    '.eyo-flash .eyo-flyout-toolbar-button-image, .eyo-flash .eyo-flyout-toolbar-button-image:hover { fill:black;  fill-opacity: 0.2;}')
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
eYo.Flyout.prototype.onButtonEnter_ = function(e) {
  if (this.isDown) {
    goog.dom.classlist.add(this.buttonGroup_, 'eyo-flash')
  }
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
  window.removeEventListener('mouseup', this.notOnButtonUp_)
  if (this.isDown) {
    this.isDown = false
    this.slide(!this.closed)  
    this.onButtonLeave_(e)
    var gesture = this.targetWorkspace_.getGesture(e);
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
eYo.Flyout.prototype.notOnButtonUp_ = function(e) {
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
        self.setBackgroundPath_(self.width_, self.height_)
        self.positionAt_(self.width_, self.height_, x+direction*dx, y)
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
  this.toolbarGroup_.setAttribute('transform', 'translate(' + x + ', ' + y + ')')
}


/**
 * Return an object with all the metrics required to size scrollbars for the
 * flyout.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the contents,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .absoluteTop: Top-edge of view.
 * .viewLeft: Offset of the left edge of visible rectangle from parent,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate,
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of the flyout.
 * @private
 */
eYo.Flyout.prototype.getMetrics_ = function() {
  if (!this.isVisible()) {
    // Flyout is hidden.
    return null;
  }

  try {
    var optionBox = this.workspace_.getCanvas().getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    var optionBox = {height: 0, y: 0, width: 0, x: 0};
  }

  // Padding for the end of the scrollbar.
  var absoluteTop = this.SCROLLBAR_PADDING + this.TOP_MARGIN;
  var absoluteLeft = 0;

  var viewHeight = this.height_ - 2 * this.SCROLLBAR_PADDING - this.TOP_MARGIN - this.BOTTOM_MARGIN;
  if (viewHeight < 0) {
    viewHeight = 0
  }
  var viewWidth = this.width_;
  if (!this.RTL) {
    viewWidth -= this.SCROLLBAR_PADDING;
  }

  var metrics = {
    viewHeight: viewHeight,
    viewWidth: viewWidth,
    contentHeight: optionBox.height * this.workspace_.scale + 2 * this.MARGIN,
    contentWidth: optionBox.width * this.workspace_.scale + 2 * this.MARGIN,
    viewTop: -this.workspace_.scrollY + optionBox.y + this.TOP_MARGIN,
    viewLeft: -this.workspace_.scrollX,
    contentTop: optionBox.y + this.TOP_MARGIN,
    contentLeft: optionBox.x,
    absoluteTop: absoluteTop,
    absoluteLeft: absoluteLeft
  };
  return metrics;
};

/**
 * Create and set the path for the visible boundaries of the flyout.
 * @param {number} width The width of the flyout, not including the
 *     rounded corners.
 * @param {number} height The height of the flyout, not including
 *     rounded corners.
 * @private
 */
eYo.Flyout.prototype.setBackgroundPath_ = function(width, height) {

  var radius = this.BUTTON_RADIUS
  var margin = this.BUTTON_MARGIN
  var top_margin = this.TOP_MARGIN
  var bottom_margin = this.BOTTOM_MARGIN
  var big_radius = radius + margin
  var h = radius * 0.866

  var atRight = this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT;
  var totalWidth = width + this.CORNER_RADIUS;

  // Decide whether to start on the left or right.
  var path = ['M ' + (atRight ? totalWidth : 0) + ',' + top_margin + ''];
  // Top.
  path.push('h', atRight ? -width : width);
  // Rounded corner.
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      atRight ? 0 : 1,
      atRight ? -this.CORNER_RADIUS : this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  // Side closest to workspace.
  path.push('v', Math.max(0, height - top_margin));
  // Rounded corner.
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      atRight ? 0 : 1,
      atRight ? this.CORNER_RADIUS : -this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  // Bottom.
  path.push('h', atRight ? width : -width);
  path.push('z');
  this.svgBackground_.setAttribute('d', path.join(' '));

  goog.dom.insertSiblingAfter(this.toolbarGroup_, this.svgGroup_)

  this.toolbarGroup_.setAttribute('width', width+big_radius+margin);
  this.toolbarGroup_.setAttribute('height', 2*big_radius);  
  this.toolbarPath_.setAttribute('d', [
    'M 0,0',
    'l', width + margin, '0',
    'a', big_radius, big_radius, '0,0,1,0,', 2*big_radius,
    'l', -(width + margin), '0', ' z',
  ].join(' '))

  this.buttonBackground_.setAttribute('d', [
    'M ' + width + ',0',
    'l', margin, '0',
    'a', big_radius, big_radius, '0,0,1,0,', 2*big_radius,
    'l', -margin, '0',
    ' z',
  ].join(' '))
  if (this.closed) {
    this.buttonImage_.setAttribute('d', [
      'M', width + margin + h + this.CORNER_RADIUS, big_radius,
      'l', -h, - radius/2,
      'l 0', radius, 'z'
    ].join(' '))
  } else {
    this.buttonImage_.setAttribute('d', [
      'M', width + this.CORNER_RADIUS, big_radius,
      'l', h, - radius/2,
      'l 0', radius, 'z'
    ].join(' '))
  }
};
