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

goog.require('ezP.DelegateSvg');
goog.require('ezP.BlockSvg');

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * @extends {Blockly.Block}
 * @constructor
 */
ezP.DelegateSvg.prototype.init = function(block)  {
  ezP.DelegateSvg.superClass_.init.call(this,block);
  goog.dom.removeNode(block.svgPath_);
  block.svgPath_ = undefined;
  goog.dom.removeNode(block.svgPathLight_);
  block.svgPathLight_ = undefined;
  goog.dom.removeNode(block.svgPathDark_);
  block.svgPathDark_ = undefined;
  this.svgPathShape_ = Blockly.utils.createSvgElement('path', {}, block.svgGroup_);
  this.svgPathContour_ = Blockly.utils.createSvgElement('path', {}, block.svgGroup_);
  this.svgPathCollapsed_ = Blockly.utils.createSvgElement('path', {}, block.svgGroup_);
  this.svgPathInline_ = Blockly.utils.createSvgElement('path',
    {'class': 'ezp-path-contour'}, block.svgGroup_);
  this.svgPathHighlight_ = Blockly.utils.createSvgElement('path',
    {'class': 'ezp-path-selected'},null);
  this.svgDottedLine_ = Blockly.utils.createSvgElement('line',
    {'class': 'ezp-path-dotted'},null);
  Blockly.utils.addClass(/** @type {!Element} */ (block.svgGroup_),
                         'ezp-block');
};

/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects...
 * @protected
 */
ezP.DelegateSvg.prototype.disposeInternal = function() {
  goog.dom.removeNode(this.svgPathShape_);
  this.svgPathShape_ = undefined;
  goog.dom.removeNode(this.svgPathContour_);
  this.svgPathContour_ = undefined;
  goog.dom.removeNode(this.svgPathCollapsed_);
  this.svgPathCollapsed_ = undefined;
  goog.dom.removeNode(this.svgPathInline_);
  this.svgPathInline_ = undefined;
  goog.dom.removeNode(this.svgPathHighlight_);
  this.svgPathHighlight_ = undefined;
  goog.dom.removeNode(this.svgDottedLine_);
  this.svgDottedLine_ = undefined;
  ezP.DelegateSvg.superClass_.disposeInternal.call(this);
};

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {!Block} block.
 * @param {boolean=} opt_bubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
ezP.DelegateSvg.prototype.render = function(block, opt_bubble) {
  if (this.isRendering) {
    return;
  }
  Blockly.Field.startCache();
  this.isRendering = true;
  this.minWidth = 0;
  block.rendered = true;
  this.willRender_(block);
  this.renderDraw_(block);
  this.layoutConnections_(block);
  block.renderMoveConnections_();

  if (opt_bubble !== false) {
    // Render all blocks above this one (propagate a reflow).
    var parentBlock = block.getParent();
    if (parentBlock) {
      parentBlock.render(true);
    } else {
      // Top-most block.  Fire an event to allow scrollbars to resize.
      block.workspace.resizeContents();
    }
  }
  this.didRender_(block);
  this.isRendering = false;
  Blockly.Field.stopCache();
  //block.workspace.logAllConnections('didRender');
};

/**
 * Will draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.willRender_ = function(block) {
  if (block.isShadow()) {
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgPathShape_),
                            'ezp-path-shadow-shape');
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgPathShape_),
                            'ezp-path-shape');
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgPathContour_),
                            'ezp-path-shadow-contour');
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgPathContour_),
                            'ezp-path-contour');
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgPathCollapsed_),
                            'ezp-path-shadow-collapsed');
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgPathCollapsed_),
                            'ezp-path-collapsed');
  } else {
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgPathShape_),
                            'ezp-path-shape');
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgPathShape_),
                            'ezp-path-shadow-shape');
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgPathContour_),
                            'ezp-path-contour');
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgPathContour_),
                            'ezp-path-shadow-contour');
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgPathCollapsed_),
                            'ezp-path-collapsed');
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgPathCollapsed_),
                            'ezp-path-shadow-collapsed');
  }
};
/**
 * Did draw the block. Default implementation does nothing.
 * The print statement needs some preparation before drawing.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.didRender_ = function(block) {
};

/**
 * Layout previous, next and output block connections.
 * @param {!Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.layoutConnections_ = function(block) {
  if (block.outputConnection) {
    block.outputConnection.setOffsetInBlock(0,0);
  } else {
    if (block.previousConnection) {
      block.previousConnection.setOffsetInBlock(0,0);
    }
    if (block.nextConnection) {
      if (block.isCollapsed()) {
        block.nextConnection.setOffsetInBlock(0,2*ezP.Font.lineHeight());
      } else {
        block.nextConnection.setOffsetInBlock(0,block.height);
      }
    }
  }
};

/**
 * Block shape. Default implementation throws.
 * Subclasses must override it. Used in renderDraw_.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.shapePathDef_ = function(block) {
  goog.asserts.assert(false, 'shapePathDef_ must be overriden by '+this);
}

/**
 * Block outline. Default implementation forwards to shapePathDef_.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.contourPathDef_ = ezP.DelegateSvg.prototype.shapePathDef_

/**
 * Highlighte block outline. Default implementation forwards to shapePathDef_.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.highlightedPathDef_ = ezP.DelegateSvg.prototype.shapePathDef_

/**
 * Extra disabled block outline. Default implementation return a void string.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.collapsedPathDef_ = function() {
  return '';
}

/**
 * Draw the path of the block.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.renderDraw_ = function(block) {
  block.height = ezP.Font.lineHeight();
  var d = this.renderDrawInputs_(block);
  this.svgPathInline_.setAttribute('d', d);
  var root = block.getRootBlock();
  if (root.ezp) {
    root.ezp.alignRightEdges_(root);
  }
  this.didChangeSize_(block);
};

/**
 * Align the right edges by changing the size of all the connected statement blocks.
 * The default implementation does nothing.
 * @param {!ezP.Block} block.
 * @protected
 */
ezP.DelegateSvg.prototype.alignRightEdges_ = function(block) {
  var right = 0;
  var ntor = ezP.StatementBlockEnumerator(block);
  var b;
  var t = ezP.Font.tabWidth;
  while ((b = ntor.next())) {
    if (b.ezp) {
      if (b.ezp.minWidth) {
        right = Math.max(right, b.ezp.minWidth+t*ntor.depth());
      } else {
        return;
      }
    }
  }
  var ntor = ezP.StatementBlockEnumerator(block);
  while ((b = ntor.next())) {
    if (b.ezp) {
      var width = right - t*ntor.depth();
      if (b.width != width) {
        b.width = width;
        b.ezp.didChangeSize_(b);
      }
    }
  }
};

/**
 * Compute the paths of the block depending on its size.
 * @param {!ezP.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.didChangeSize_ = function(block) {
  var d = this.shapePathDef_(block);
  this.svgPathShape_.setAttribute('d', d);
  var d = this.highlightedPathDef_(block);
  this.svgPathHighlight_.setAttribute('d', d);
  var d = this.contourPathDef_(block);
  this.svgPathContour_.setAttribute('d', d);
  var d = this.collapsedPathDef_(block);
  this.svgPathCollapsed_.setAttribute('d', d);
};

/**
 * Render the inputs of the block.
 * @param {!Blockly.Block} block.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawInputs_ = function(block) {
  /* eslint-disable indent */
  var io = {
    block: block,
    steps: [],
    canDummy: true,
    canValue: true,
    canStatement: true,
    canTuple: true
  }
  if (block.outputConnection) {
    io.cursorX = ezP.Font.space;
  } else {
    io.cursorX = ezP.Padding.l();
    this.renderDrawSharp_(io);
  }
  for (var _ = 0; io.input = block.inputList[_]; _++) {
    if (io.input.isVisible()) {
      this.renderDrawInput_(io);
    }
  }
  if (block.outputConnection) {
    io.cursorX += ezP.Font.space;
  } else {
    io.cursorX += ezP.Padding.r();
  }
  this.minWidth = block.width = io.cursorX;
  return io.steps.join(' ');
};

/**
 * Render the leading # character for collapsed statement blocks.
 * Statement subclasses must override it.
 * @param io.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawSharp_ = function(io) {
  goog.asserts.assert(false, 'renderDrawSharp_ must be overriden by '+this);
};

/**
 * Render one input. Default implementation throws.
 * Subclasses must override it.
 * @param io.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawInput_ = function(io) {
  goog.asserts.assert(false, 'renderDrawInput_ must be overriden by '+this);
};

/**
 * Render the fields of a block input.
 * @param io An input/output record.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawFields_ = function(io) {
  for (var _ = 0, field; field = io.input.fieldRow[_]; ++_) {
    var root = field.getSvgRoot();
    if (root) {
      root.setAttribute('transform', 'translate(' + io.cursorX
        + ', '+ezP.Padding.t()+')');
      io.cursorX += field.getSize().width;
    }
  }
}

/**
 * Render the fields of a dummy input, if relevant.
 * @param io An input/output record.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawDummyInput_ = function(io) {
  if (!io.canDummy || io.input.type != Blockly.DUMMY_INPUT) {
    return false;
  }
  this.renderDrawFields_(io);
  return true;
};

/**
 * Render the fields of a tuple input, if relevant.
 * @param {!Blockly.Block} The block.
 * @param {!Blockly.Input} Its input.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawTupleInput_ = function(io) {
  if (!io.canTuple) {
    return false;
  }
  var tuple = io.input.ezpTuple;
  if (!tuple) {
    return false;
  }
  var c10n = io.input.connection;
  c10n.setOffsetInBlock(io.cursorX, 0);
  if (c10n.isConnected()) {
    var target = c10n.targetBlock();
    var root = target.getSvgRoot();
    if (root) {
      var bBox = target.getHeightWidth();
      io.cursorX += bBox.width;
    }
  } else if (tuple.isSeparator) {
    var pw = this.carretPathDefWidth_(io.cursorX);
    var w = ezP.Font.space;
    if (!tuple.hidden) {
      var field = io.input.fieldRow[0];
      if (field) {
        var root = field.getSvgRoot();
        if (root) {
          root.setAttribute('transform', 'translate(' + (io.cursorX) +
            ', '+ezP.Padding.t()+')');
          var fieldSize = field.getSize();
          w = Math.max(fieldSize.width, w);
        }
      }
    }
    c10n.setOffsetInBlock(io.cursorX+w/2, 0);
    io.cursorX += w;
  } else {
    var pw = this.placeHolderPathDefWidth_(io.cursorX);
    io.steps.push(pw.d);
    io.cursorX += pw.width;
  }
  return true;
};

/**
 * Render the fields of a value input, if relevant.
 * @param io the input/output argument.
 * @private
 */
ezP.DelegateSvg.prototype.renderDrawValueInput_ = function(io) {
  if (!io.canValue || io.input.type != Blockly.INPUT_VALUE) {
    return false;
  }
  var c10n = io.input.connection;
  if (c10n) {
    this.renderDrawFields_(io);
    c10n.setOffsetInBlock(io.cursorX, 0);
    if (c10n.isConnected()) {
      var target = c10n.targetBlock();
      var root = target.getSvgRoot();
      if (root) {
        var bBox = target.getHeightWidth();
        root.setAttribute('transform', 'translate(' + io.cursorX + ', 0)');
        io.cursorX += bBox.width;
        target.render();
      }
    } else {
      var pw = this.placeHolderPathDefWidth_(io.cursorX);
      io.steps.push(pw.d);
      io.cursorX += pw.width;
    }
  }
  return true;
};

/**
 * Block path.
 * @param {goog.size} size.
 * @private
 */
ezP.DelegateSvg.prototype.valuePathDef_ = function(size) {
  /* eslint-disable indent */
  // Top edge.
  var p = ezP.Padding.h();
  var r = (p**2+size.height**2/4)/2/p;
  var dx = (ezP.Font.space - p)/2;
  var a = ' a '+r+', '+r+' 0 0 1 0,';
  var h = size.height+2*ezP.Margin.V;
  return 'm '+(size.width-ezP.Font.space+dx)+',-'+ezP.Margin.V+a
  +h +'H '+(dx+p)+a+(-h)+' z';
}  /* eslint-enable indent */

/**
 * Block path.
 * @param {Number} height.
 * @param {Number} x position.
 * @private
 */
ezP.DelegateSvg.prototype.carretPathDefWidth_ = function(cursorX) {
  /* eslint-disable indent */
  var h = ezP.Font.lineHeight();
  var r = ezP.Style.Path.Selected.width/2;
  var a = ' a '+r+','+r+' 0 0 0 ';
  var d = 'M '+(cursorX+r)+',0 '+a+ (-2*r) + ',0 v '+h+a+(2*r)+',0 z';
  return {width: 2*r, d: d};
}  /* eslint-enable indent */

/**
 * Block path.
 * @param {Number} height.
 * @param {Number} x position.
 * @private
 */
ezP.DelegateSvg.prototype.placeHolderPathDefWidth_ = function(cursorX) {
  /* eslint-disable indent */
  var size = {width: 3*ezP.Font.space, height: ezP.Font.lineHeight()};
  var p = ezP.Padding.h();
  var r = (p**2+size.height**2/4)/2/p;
  var dy = ezP.Padding.v()+ezP.Font.descent/2;
  var a = ' a '+r+', '+r+' 0 0 1 0,';
  var h = size.height+2*ezP.Margin.V;
  var d = 'm '+(cursorX+size.width-p)+
  ','+(ezP.Margin.V+dy)+a+(h-2*dy) +
  'h -'+(size.width-2*p)+a+(-h+2*dy)+' z';
  return {width: size.width, d: d};
}  /* eslint-enable indent */

/**
 * @param {!Blockly.Connection} c10n The connection to highlight.
 */
ezP.DelegateSvg.prototype.highlightConnection = function(c10n) {
  var steps;
  var block = c10n.sourceBlock_;
  if (c10n.type == Blockly.INPUT_VALUE) {
    if (c10n.isConnected()) {
      steps = this.valuePathDef_(c10n.targetBlock());
    } else if (c10n.isSeparatorEZP) {
      steps = this.carretPathDefWidth_(0).d;
    } else {
      steps = this.placeHolderPathDefWidth_(0).d;
    }
  } else if (c10n.type == Blockly.OUTPUT_VALUE) {
    steps = 'm 0,0 ' + Blockly.BlockSvg.TAB_PATH_DOWN + ' v 5';
  } else {
    var r = ezP.Style.Path.Selected.width/2;
    var a = ' a '+r+','+r+' 0 0 1 0,';
    steps = 'm '+block.width+','+(-r)+a+ (2*r) + ' h '+(-block.width)+a+(-2*r)+' z';
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

/**
 * Fetches the named input object.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
ezP.DelegateSvg.prototype.getInput = function(block, name) {
  return undefined;
};

/**
 * Fetches the named input object.
 * @param {!Block} block.
 * @param {string} comment.
 * @param {boolean} ignore not connected value input.
 * @private
 */
ezP.DelegateSvg.prototype.assertBlockInputTuple__ = function(block,comment,ignore) {
  var list = block.inputList;
  var i = 0;
  var input;
  while((input = list[i]) && input.type == Blockly.DUMMY_INPUT) {
    ++i;
  }
  var first = i;
  var end = i = list.length;
  while (i>first && (input = list[--i]) && input.type == Blockly.DUMMY_INPUT) {
    end = i;
  }
  var max = this.getInputTupleMax(block,0);
  try {
    goog.asserts.assert((end-first)%2==1, 'Bad number of inputs '+[first, end, list.length]);
    var n = Math.max(1,(end-first-1)/2);
    if (max) {
      goog.asserts.assert(n<=max, 'Limit overruled '+[n, max]);
      for (var i = first, input; (input = list[i]) && i<end; i+=2) {
        if (input.type == Blockly.DUMMY_INPUT) {
          break;
        }
        var c10n = input.connection;
        if (n<max) {
          goog.asserts.assert(input.activeConnectionEZP && c10n && c10n.isSeparatorEZP && !c10n.isConnected(), 'Bad separator at '+[i,list.length,input.activeConnectionEZP, c10n, c10n.isSeparatorEZP,!c10n.isConnected()]);
        } else {
          goog.asserts.assert(!c10n && !input.activeConnectionEZP, 'Bad separator at '+[i,list.length,c10n,!input.activeConnectionEZP]);
        }
      }
    } else {
      for (var i = first, input; (input = list[i]) && i<end; i+=2) {
        if (input.type == Blockly.DUMMY_INPUT) {
          break;
        }
        var c10n = input.connection;
        goog.asserts.assert(c10n.isSeparatorEZP && !c10n.isConnected(), 'Bad separator at '+[i,list.length,c10n.isSeparatorEZP,!c10n.isConnected()]);
      }
    }
    for (var i = first+1, input; input = list[i]; i+=2) {
      if (input.type == Blockly.DUMMY_INPUT) {
        while((input = list[++i])) {
          goog.asserts.assert(input.type == Blockly.DUMMY_INPUT, 'No DUMMY_INPUT at '+i+'<'+list.length);
        }
        break;
      }
      var c10n = input.connection;
      goog.asserts.assert(!c10n.isSeparatorEZP && (ignore ||c10n.isConnected()), 'Bad input value at '+[i,list.length,!c10n.isSeparatorEZP,c10n.isConnected()]);
    }
  }
  catch(e) {
    throw e;
  }
  console.log(comment);
}

/**
 * Class for a statement block enumerator.
 * Deep first traversal.
 * Starts with the given block.
 * The returned object has next and depth messages.
 * @param {!Blockly.Block} block The root of the enumeration.
 * @constructor
 */
ezP.StatementBlockEnumerator = function(block)  {
  var b, bs = [block];
  var i, is = [0];
  var input, next;
  var me = {};
  me.next = function() {
    me.next = me.next_;
    return block;
  };
  me.depth = function() {
    return bs.length;
  }
  me.next_ = function() {
    while((b = bs.shift())) {
      i = is.shift();
      while ((input = b.inputList[i++])) {
        if (input.type == Blockly.NEXT_STATEMENT) {
          if (input.connection && (next = input.connection.targetBlock())) {
            bs.unshift(b);
            is.unshift(i);
            bs.unshift(next);
            is.unshift(0);
            return next;
          }
        }
      }
      if ((b = b.getNextBlock())) {
        bs.unshift(b);
        is.unshift(0);
        return b;
      }
    }
    return undefined;
  };
  return me;
};
