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
EZP.DelegateSvg.Manager.register('ezp_grp', EZP.DelegateSvg.Group);

/**
 * Block path.
 * @param {Number} width.
 * @param {Number} height.
 * @private
 */
EZP.DelegateSvg.Group.prototype.groupPathDef_ = function(block) {
  /* eslint-disable indent */
  var w = block.width;
  var h = block.height;
  var line = EZP.Font.lineHeight();
  var steps = ['m '+w+',0 v '+line];
  h -= line;
  var r = EZP.Style.Path.radius();
  var a = ' a '+r+', '+r+' 0 0 0 ';
  var t = EZP.Font.tabWidth();
  w -= t+r;
  steps.push('h '+(-w));
  steps.push(a+(-r)+','+r);
  h -= 2*r;// Assuming 2*r<line height...
  steps.push(' v '+h);
  steps.push(a+r+','+r);
  var c10n = block.nextConnection;
  var a = ' a '+r+', '+r+' 0 0 1 ';
  if (c10n && c10n.isConnected()) {
    steps.push('h '+(-t-r));
  } else {
    steps.push('h '+(-t) + a+(-r)+','+(-r));
    h -= r;
  }
  c10n = block.previousConnection;
  if (c10n && c10n.isConnected() && c10n.targetBlock.nextConnection == c10n ) {
    steps.push('V 0 z');
  } else {
    steps.push('V '+r+ a+r+','+(-r)+' z');
  }
  return steps.join(' ');
}  /* eslint-enable indent */

EZP.DelegateSvg.Group.prototype.pathDef_ =
  EZP.DelegateSvg.Group.prototype.groupPathDef_;

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
  var c10n = io.input.connection;
      // this must be the last one
  if (c10n) {
    c10n.setOffsetInBlock(EZP.Font.tabWidth(), EZP.Font.lineHeight());
    if (c10n.isConnected()) {
      var target = c10n.targetBlock();
      var root = target.getSvgRoot();
      if (root) {
        target.render();
      }

    }
    io.block.height = EZP.Font.lineHeight()*io.block.getStatementCount();
    io.blockWidthMin = 2*EZP.Font.tabWidth();
    io.canStatement = false;
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
      steps = 'm 0,'+(-r)+a+ (2*r) + ' h '+(block.width-EZP.Font.tabWidth())+a+(-2*r)+' z';
    } else {
      steps = 'm 0,'+(-r)+a+ (2*r) + ' h '+(EZP.Font.tabWidth()+EZP.Style.Path.radius())+a+(-2*r)+' z';
    }
  } else if (c10n.type == Blockly.PREVIOUS_STATEMENT) {
    var r = EZP.Style.Path.Selected.width/2;
    var a = ' a '+r+','+r+' 0 0 0 0,';
    if (c10n.offsetInBlock_.x > 0) {
      steps = 'm 0,'+(-r)+a+ (2*r) + ' h '+(block.width-EZP.Font.tabWidth())+a+(-2*r)+' z';
    } else {
      steps = 'm 0,'+(-r)+a+ (2*r) + ' h '+(EZP.Font.tabWidth()+EZP.Style.Path.radius())+a+(-2*r)+' z';
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
