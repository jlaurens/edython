/**
 * @license
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('EZP.DelegateSvg.Group');

goog.require('EZP.DelegateSvg.Statement');

/**
 * Class for a DelegateSvg, statement block.
 * Not normally called directly, EZP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
EZP.DelegateSvg.Group = function(prototypeName)  {
  EZP.DelegateSvg.Group.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(EZP.DelegateSvg.Group, EZP.DelegateSvg.Statement);
EZP.DelegateSvg.Manager.register(EZP.Constants.grp.ANY, EZP.DelegateSvg.Group);

/**
 * Whether the block has a previous bounded statement.
 * @param {!Block} block.
 * @private
 */
EZP.Delegate.prototype.hasPreviousBoundedStatement_ = function(block) {
  if (block.type == EZP.Constants.grp.ELIF || block.type == EZP.Constants.grp.ELSE) {
    var c10n = block.previousConnection;
    if (c10n) {
      var target = c10n.targetBlock();
      if (target) {
        return target.type == EZP.Constants.grp.IF
          || target.type == EZP.Constants.grp.ELIF
            || target.type == EZP.Constants.grp.WHILE
              || target.type == EZP.Constants.grp.FOR;
      }
    }
  }
  return false;
};

/**
 * Whether the block has a next bounded statement.
 * @param {!Block} block.
 * @private
 */
EZP.Delegate.prototype.hasNextBoundedStatement_ = function(block) {
  var c10n = block.nextConnection;
  if (c10n) {
    var target = c10n.targetBlock();
    if (target) {
      return target.type == EZP.Constants.grp.ELIF
        || target.type == EZP.Constants.grp.ELSE;
    }
  }
  return false;
};
/**
 * Block path.
 * @param {!Blockly.Block} block.
 * @private
 */
EZP.DelegateSvg.Group.prototype.groupShapePathDef_ = function(block) {
  /* eslint-disable indent */
  var w = block.width;
  var line = EZP.Font.lineHeight();
  var h = block.isCollapsed()? 2*line: block.height;
  var steps = ['m '+w+',0 v '+line];
  h -= line;
  var r = EZP.Style.Path.radius();
  var a = ' a '+r+', '+r+' 0 0 0 ';
  var t = EZP.Font.tabWidth;
  w -= t+r;
  steps.push('h '+(-w));
  steps.push(a+(-r)+','+r);
  h -= 2*r;// Assuming 2*r<line height...
  steps.push(' v '+h);
  steps.push(a+r+','+r);
  var c10n = block.nextConnection;
  var a = ' a '+r+', '+r+' 0 0 1 ';
  if (this.hasNextStatement_(block)) {
    steps.push('h '+(-t-r));
  } else {
    steps.push('h '+(-t) + a+(-r)+','+(-r));
    h -= r;
  }
  if (this.hasPreviousStatement_(block)) {
    steps.push('V 0 z');
  } else {
    steps.push('V '+r+ a+r+','+(-r)+' z');
  }
  return steps.join(' ');
}  /* eslint-enable indent */

/**
 * Block path.
 * @param {!Blockly.Block} block.
 * @private
 */
EZP.DelegateSvg.Group.prototype.groupContourPathDef_ = function(block) {
  /* eslint-disable indent */
  var w = block.width;
  var line = EZP.Font.lineHeight();
  var h = block.isCollapsed()? 2*line: block.height;
  var t = EZP.Font.tabWidth;
  var r = EZP.Style.Path.radius();
  var a = ' a '+r+', '+r+' 0 0 0 ';
  var previousBounded = this.hasPreviousBoundedStatement_(block);
  var nextBounded = this.hasNextBoundedStatement_(block);
  var previous = this.hasPreviousStatement_(block);
  var next = this.hasNextStatement_(block);
  if (previousBounded) {
    var steps = ['m '+t+', '+(-r)+a+r+', '+r+' h '+(w-t-r)];
  } else if (previous) {
    var steps = ['m 0,0 h '+w];
  } else {
    steps = ['m '+r+',0 h '+(w-r)];
  }
  steps.push('v '+line);
  h -= line;
  w -= t+r;
  steps.push('h '+(-w));
  steps.push(a+(-r)+','+r);
  h -= 2*r;// Assuming 2*r<line height...
  steps.push(' v '+h);
  steps.push(a+r+','+r);
  var a = ' a '+r+', '+r+' 0 0 1 ';
  if (nextBounded ) {
    steps.push('m '+(-t-r)+',0');
  } else if (next) {
    steps.push('h '+(-t-r));
  } else {
    steps.push('h '+(-t) + a+(-r)+','+(-r));
    h -= r;
  }
  if (previousBounded || previous) {
    steps.push('V 0');
  } else {
    steps.push('V '+r+a+r+','+(-r));
  }
  return steps.join(' ');
}  /* eslint-enable indent */


/**
 * Block path.
 * @param {!Blockly.Block} block.
 * @private
 */
EZP.DelegateSvg.Group.prototype.collapsedPathDef_ = function(block) {
  /* eslint-disable indent */
  if (block.isCollapsed()) {
    var line = EZP.Font.lineHeight();
    var t = EZP.Font.tabWidth;
    var r = EZP.Style.Path.radius();
    return 'm '+block.width+','+line+' v '+(line-r)/2
    +' m -'+r+','+r/2+' l '+2*r+','+(-r)
    +' M '+(t+r)+','+(2*line)+' H '+block.width+' v '+(r-line)/2
    +' m -'+r+','+r/2+' l '+2*r+','+(-r);
  }
  return EZP.DelegateSvg.Group.superClass_.collapsedPathDef_.call(this, block);
}  /* eslint-enable indent */

EZP.DelegateSvg.Group.prototype.shapePathDef_ =
  EZP.DelegateSvg.Group.prototype.contourPathDef_ =
    EZP.DelegateSvg.Group.prototype.highlightedPathDef_ =
      EZP.DelegateSvg.Group.prototype.groupShapePathDef_;

/**
 * Render an input of a group block.
 * @param io parameter.
 * @private
 */
EZP.DelegateSvg.Group.prototype.renderDrawNextStatementInput_ = function(io) {
  /* eslint-disable indent */
  if (!io.canStatement || io.input.type != Blockly.NEXT_STATEMENT) {
    return false;
  }
  io.cursorX = Math.max(2*EZP.Font.tabWidth, io.cursorX);
  io.canStatement = false;
  var c10n = io.input.connection;
      // this must be the last one
  if (c10n) {
    c10n.setOffsetInBlock(EZP.Font.tabWidth, EZP.Font.lineHeight());
    if (c10n.isConnected()) {
      var target = c10n.targetBlock();
      var root = target.getSvgRoot();
      if (root) {
        target.render();
      }
    }
    io.block.height = EZP.Font.lineHeight()*io.block.getStatementCount();
  }
  return true;
};  /* eslint-enable indent */

/**
 * Render one input of value block.
 * @param io.
 * @private
 */
EZP.DelegateSvg.Statement.prototype.renderDrawInput_ = function(io) {
  this.renderDrawDummyInput_(io)
    || this.renderDrawValueInput_(io)
      || this.renderDrawNextStatementInput_(io);
};

/**
 * @param {!Blockly.Connection} c10n The connection to highlight.
 */
EZP.DelegateSvg.Group.prototype.highlightConnection = function(c10n) {
  var steps;
  var block = c10n.sourceBlock_;
  if (c10n.type == Blockly.INPUT_VALUE) {
    if (c10n.isConnected()) {
      steps = this.valuePathDef_(c10n.targetBlock());
    } else {
      steps = this.placeHolderPathDefWidth_(0).d;
    }
  } else if (c10n.type == Blockly.OUTPUT_VALUE) {
    steps = 'm 0,0 ' + Blockly.BlockSvg.TAB_PATH_DOWN + ' v 5';
  } else if (c10n.type == Blockly.NEXT_STATEMENT) {
    var r = EZP.Style.Path.Selected.width/2;
    var a = ' a '+r+','+r+' 0 0 0 0,';
    if (c10n.offsetInBlock_.x > 0) {
      steps = 'm 0,'+(-r)+a+ (2*r) + ' h '+(block.width-EZP.Font.tabWidth)+a+(-2*r)+' z';
    } else {
      steps = 'm 0,'+(-r)+a+ (2*r) + ' h '+(EZP.Font.tabWidth+EZP.Style.Path.radius())+a+(-2*r)+' z';
    }
  } else if (c10n.type == Blockly.PREVIOUS_STATEMENT) {
    var r = EZP.Style.Path.Selected.width/2;
    var a = ' a '+r+','+r+' 0 0 0 0,';
    if (c10n.offsetInBlock_.x > 0) {
      steps = 'm 0,'+(-r)+a+ (2*r) + ' h '+(block.width-EZP.Font.tabWidth)+a+(-2*r)+' z';
    } else {
      steps = 'm 0,'+(-r)+a+ (2*r) + ' h '+(EZP.Font.tabWidth+EZP.Style.Path.radius())+a+(-2*r)+' z';
    }
  }
  var xy = block.getRelativeToSurfaceXY();
  var x = c10n.x_ - xy.x;
  var y = c10n.y_ - xy.y;
  Blockly.Connection.highlightedPath_
  = Blockly.utils.createSvgElement('path',
                                   {'class': 'blocklyHighlightedConnectionPath',
                                   'd': steps,
                                   transform: 'translate(' + x + ',' + y + ')'},
                                   c10n.sourceBlock_.getSvgRoot());
};

EZP.DelegateSvg.Group.Bounded = function(prototypeName)  {
  EZP.DelegateSvg.Group.Bounded.superClass_.constructor.call(this, prototypeName);
};
goog.inherits(EZP.DelegateSvg.Group.Bounded, EZP.DelegateSvg.Group);
EZP.DelegateSvg.Manager.register(EZP.Constants.grp.ELIF, EZP.DelegateSvg.Group.Bounded);
EZP.DelegateSvg.Manager.register(EZP.Constants.grp.ELSE, EZP.DelegateSvg.Group.Bounded);

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be intialized.
 * @extends {Blockly.Block}
 * @constructor
 */
EZP.DelegateSvg.Group.Bounded.prototype.init = function(block)  {
  EZP.DelegateSvg.Group.Bounded.superClass_.init.call(this,block);
  block.svgPathDotted_ = Blockly.utils.createSvgElement('path',
    {'d': 'M '+EZP.Padding.h()+',0 h '+(EZP.Font.tabWidth-EZP.Padding.h())}, block.svgGroup_);
  block.nextConnection.check_ = EZP.Check.stt.none;
};

/**
 * Draw the path of the block.
 * @param {!EZP.Block} block.
 * @private
 */
EZP.DelegateSvg.Group.Bounded.prototype.renderDraw_ = function(block) {
  EZP.DelegateSvg.Group.Bounded.superClass_.renderDraw_.call(this, block);
  if (this.hasPreviousBoundedStatement_(block)) {
    block.svgPathDotted_.setAttribute('class','ezp-path-dotted');
  } else {
    block.svgPathDotted_.setAttribute('class','ezp-no-path');
  }
};
