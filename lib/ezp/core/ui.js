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
 * @fileoverview utilities for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict';

goog.provide('EZP.ui');
goog.provide('EZP.Style');

goog.require('EZP');

/**
 * The richness of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
EZP.HSV_SATURATION = 5/255;

/**
 * The intensity of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
EZP.HSV_VALUE = 1;

/**
 * Convert a hue (HSV model) into an RGB hex triplet.
 * @param {number} hue Hue on a colour wheel (0-360).
 * @return {string} RGB code, e.g. '#5ba65b'.
 */
EZP.hueToRgb = function(hue) {
  return goog.color.hsvToHex(hue,EZP.HSV_SATURATION,EZP.HSV_VALUE*255);
};

EZP.Style = {};

EZP.Style.weight = function(x) {
  return x/(1+x);// 0↦0, 1↦1/2, 2↦2/3, 3↦3/4, ∞↦1
}

EZP.Padding = {};
EZP.Padding.t = EZP.Padding.l = EZP.Padding.b = EZP.Padding.r = EZP.Padding.h =
EZP.Padding.v = function() { return 6*EZP.Style.weight(EZP.Font.size/10);};

EZP.Margin = {T:0,L:0,B:0,R:0,H:0,V:0}


/**
 * Point size of text.
 */
EZP.Font = function(ascent) {
  var my = {};
  my.updateAscent = function(ascent) {
    my.ascent = my.size = ascent;
    my.descent = ascent * 492 / 1556;
    my.xHeight = ascent * 1120 / 1556;
    my.space = ascent * 1233 / 1556;
    my.totalAscent = ascent * 2048 / 1556;
    my.height = my.totalAscent+my.descent;
    return my;
  };
  my.lineHeight = function() {
    return EZP.Font.height+EZP.Padding.t()+EZP.Padding.b();
  };
  my.tabWidth = function() {
    return 4*my.space;
  };
  return my.updateAscent(ascent);
}(10);

/**
 * Offset of the text editor.
 */
EZP.EditorOffset = {x: 0, y: 0};

/**
 * Setupt the offset of the text editor.
 */
EZP.setup.register(function() {
  var CHROME = {x: 1, y: -0.5};
  var GECKO = {x:0, y:-1};
  var WEBKIT = {x:1, y:-1};
  if (goog.userAgent.GECKO) {
    EZP.EditorOffset = GECKO;
  } else if (goog.userAgent.WEBKIT) {
    var userAgent = goog.userAgent.getNavigator().userAgent;
    if (userAgent && userAgent.search('Chrome')>=0) {
      EZP.EditorOffset = CHROME;
    } else {
      EZP.EditorOffset = WEBKIT;
    }
  }
});

EZP.Style.Path = {
  Selected: {
    'colour': '#fc3',
    'width': 3
  },
  'colour': goog.color.rgbArrayToHex(goog.color.hslToRgb(0,0,9/10)),
  'width': 1.5,//px
  'radius': function() { return EZP.Padding.h()*1.5}
};
EZP.Style.Arrow = {
  'colour': 'black',
};
EZP.Style.MenuItem = {
  'padding-h': EZP.Padding.t,
  'padding-v': EZP.Padding.t
};
EZP.Style.CheckBox = {
  'padding': 1.5//px
};


EZP.Style.insertCssRuleAt = function() {
  var style = document.createElement("style");
  document.head.appendChild(style);
  var sheet = style.sheet;
  return function(rule, at) {
    sheet.insertRule(rule,at);
  }
}();
/**
 * Setup the font style, amongst others.
 */
EZP.setup.register(function() {
  EZP.Style.insertCssRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono.woff')format('woff');font-weight: normal;font-style: normal;}",0);
  EZP.Style.insertCssRuleAt('.ezp-block .blocklyText, .blocklyWidgetDiv .ezp-menuitem-content{font-family:DejaVuSansMono,monospace;font-size:'+EZP.Font.size+'pt;fill:black;}', 0);
  EZP.Style.insertCssRuleAt('.blocklyPath.blocklySelected{stroke: '+EZP.Style.Path.Selected.colour+';stroke-width: '+EZP.Style.Path.Selected.width+'px;fill: none;}',1);
  EZP.Style.insertCssRuleAt('.blocklyHighlightedConnectionPath{stroke: '+EZP.Style.Path.Selected.colour+';stroke-width: '+EZP.Style.Path.Selected.width+'px;fill: none;}', 2);
  EZP.Style.insertCssRuleAt('.blocklyHighlightedConnectionPathH{fill: '+EZP.Style.Path.Selected.colour+';stroke: none;}', 3);
  EZP.Style.insertCssRuleAt('.ezp-path, .ezp-checkbox-icon-rect{stroke: '+EZP.Style.Path.colour+';stroke-width: '+EZP.Style.Path.width+'px;fill: white;}', 4);
});

EZP.Style.menuIcon = function(g,w) {
  var E = Blockly.utils.createSvgElement('g',
    {'class': 'ezp-menu-icon', 'opacity': 0.25}, g);
  E.style.fill = EZP.Style.Arrow.colour;
  var h = EZP.Font.height;
  var r = h/8;
  Blockly.utils.createSvgElement('rect',
    {'x': '0', 'y': '0', 'rx': r, 'ry': r,
     'width': w, 'height': h,
     'fill': goog.color.rgbArrayToHex(goog.color.hslToRgb(0,0,254/255))},
    E);
  Blockly.utils.createSvgElement('circle',
    {'cx': EZP.Font.space/2, 'cy': h/2, 'r': r},
    E);
  Blockly.utils.createSvgElement('circle',
    {'cx': EZP.Font.space/2, 'cy': h/2-h/3, 'r': r},
    E);
  Blockly.utils.createSvgElement('circle',
    {'cx': EZP.Font.space/2, 'cy': h/2+h/3, 'r': r},
    E);
  return E;
};
