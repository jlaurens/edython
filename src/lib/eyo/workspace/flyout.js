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
  eYo.Flyout.superClass_.constructor.call(this, workspaceOptions);
};
goog.inherits(eYo.Flyout, Blockly.VerticalFlyout);

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
  this.buttonGroup_ = Blockly.utils.createSvgElement('g', {
    'class': 'eyo-flyout-button',
  }, this.svgGroup_);
  var side = 16 // the side
  var radius = side / 1.732
  var circle = Blockly.utils.createSvgElement('circle', {
    'r': radius+3,
    cx: radius+3,
    cy: radius+3,
  }, this.buttonGroup_)
  this.buttonGroup_.setAttribute('transform', 'translate(8,8)')
  var path = Blockly.utils.createSvgElement('path', {}, this.buttonGroup_)
  var d = 'm'+(3)+','+(radius+3)+' l'+(side*0.866)+','+(side/2)+' l0,-'+side+' z'
  path.setAttribute('d', d)
  this.onButtonDownWrapper_ = Blockly.bindEventWithChecks_(this.buttonGroup_, 'mousedown',
  this, this.onButtonDown_);
  this.onButtonEnterWrapper_ = Blockly.bindEventWithChecks_(this.buttonGroup_, 'mouseenter',
  this, this.onButtonEnter_);
  this.onButtonLeaveWrapper_ = Blockly.bindEventWithChecks_(this.buttonGroup_, 'mouseleave',
  this, this.onButtonLeave_);
  this.onButtonUpWrapper_ = Blockly.bindEventWithChecks_(this.buttonGroup_, 'mouseup',
  this, this.onButtonUp_);
  return this.svgGroup_;
};
eYo.setup.register(function () {
  eYo.Style.insertCssRuleAt('.eyo-flyout { position: absolute; z-index: 20; }')
  eYo.Style.insertCssRuleAt('.eyo-flyout-background { fill: #ddd; fill-opacity: .8; }')
  eYo.Style.insertCssRuleAt('.eyo-flyout-scrollbar { z-index: 30; }')
  eYo.Style.insertCssRuleAt('.eyo-flyout-button { pointer-events: all; z-index: 30;}')
  eYo.Style.insertCssRuleAt('.eyo-flyout-button path { fill:rgb(221,221,221); }')
  eYo.Style.insertCssRuleAt('.eyo-flyout-button.eyo-flash path { fill:rgb(167,167,167); }')
  eYo.Style.insertCssRuleAt('.eyo-flyout-button circle { fill:white; }')
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
  this.buttonGroup_ = undefined
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
  console.log('ENTERED')
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
  this.slide(true)
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
eYo.Flyout.prototype.slide = function(out) {
  if (!out === !this.slideOut_locked) {
    return
  }
  this.slideOut_locked = out
  var targetWorkspaceMetrics = this.targetWorkspace_.getMetrics();
  if (!targetWorkspaceMetrics) {
    // Hidden components will return null.
    return;
  }
  var id = setInterval(frame, 5);
  var x = targetWorkspaceMetrics.absoluteLeft;
  var dx = 0;
  var max_dx = this.width_
  var step = max_dx / 50
  var y = targetWorkspaceMetrics.absoluteTop;
  var direction = out? -1: +1
  if (!out) {
    x -= max_dx
  }
  var self = this
  function frame() {
      if (dx >= max_dx) {
          clearInterval(id);
          self.hide()
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
 * Lay out the blocks in the flyout.
 * @param {!Array.<!Object>} contents The blocks and buttons to lay out.
 * @param {!Array.<number>} gaps The visible gaps between blocks.
 * @private
 */
eYo.Flyout.prototype.layout_ = function(contents, gaps) {
  this.workspace_.scale = this.targetWorkspace_.scale;
  var margin = this.MARGIN;
  var cursorX = this.RTL ? margin : margin + Blockly.BlockSvg.TAB_WIDTH;
  var cursorY = margin + 32;

  for (var i = 0, item; item = contents[i]; i++) {
    if (item.type == 'block') {
      var block = item.block;
      var allBlocks = block.getDescendants();
      for (var j = 0, child; child = allBlocks[j]; j++) {
        // Mark blocks as being inside a flyout.  This is used to detect and
        // prevent the closure of the flyout if the user right-clicks on such a
        // block.
        child.isInFlyout = true;
      }
      block.render();
      var root = block.getSvgRoot();
      var blockHW = block.getHeightWidth();
      block.moveBy(cursorX, cursorY);

      var rect = this.createRect_(block,
          this.RTL ? cursorX - blockHW.width : cursorX, cursorY, blockHW, i);

      this.addBlockListeners_(root, block, rect);

      cursorY += blockHW.height + gaps[i];
    } else if (item.type == 'button') {
      this.initFlyoutButton_(item.button, cursorX, cursorY);
      cursorY += item.button.height + gaps[i];
    }
  }
};
