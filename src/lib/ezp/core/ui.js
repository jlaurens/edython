/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview utilities for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.ui')
goog.provide('ezP.Style')

goog.require('ezP')

/**
 * The richness of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
ezP.HSV_SATURATION = 5 / 255

/**
 * The intensity of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
ezP.HSV_VALUE = 1

/**
 * Convert a hue (HSV model) into an RGB hex triplet.
 * @param {number} hue Hue on a colour wheel (0-360).
 * @return {string} RGB code, e.g. '#5ba65b'.
 */
ezP.hueToRgb = function (hue) {
  return goog.color.hsvToHex(hue, ezP.HSV_SATURATION, ezP.HSV_VALUE * 255)
}

ezP.Style = {}

ezP.Style.weight = function (x) {
  return x / (1 + x)// 0↦0, 1↦1/2, 2↦2/3, 3↦3/4, ∞↦1
}

ezP.Padding = {}
ezP.Padding.l = ezP.Padding.r = ezP.Padding.h =
  function () { return 8 * ezP.Style.weight(ezP.Font.size / 10) }
ezP.Padding.t = ezP.Padding.b = ezP.Padding.v =
  function () { return 6 * ezP.Style.weight(ezP.Font.size / 10) }

ezP.Margin = {T: 0, L: 0, B: 0, R: 0, H: 0, V: 0}

/**
 * Point size of text.
 */
ezP.Font = function (ascent) {
  var my = {}
  my.updateAscent = function (ascent) {
    my.ascent = my.size = ascent
    my.descent = ascent * 492 / 1556
    my.xHeight = ascent * 1120 / 1556
    my.space = ascent * 1233 / 1556
    my.totalAscent = ascent * 2048 / 1556
    my.height = my.totalAscent + my.descent
    my.style = 'font-family:DejaVuSansMono,monospace;font-size:' + ascent + 'pt;'
    my.tabWidth = 4 * my.space
    return my
  }
  my.lineHeight = function () {
    return ezP.Font.height + ezP.Padding.t() + ezP.Padding.b()
  }
  return my.updateAscent(ascent)
}(10)

/**
 * Offset of the text editor.
 */
ezP.EditorOffset = {x: 0, y: 0}

/**
 * Setupt the offset of the text editor.
 */
ezP.setup.register(function () {
  var CHROME = {x: 1, y: -0.5}
  var GECKO = {x: 0, y: -1}
  var WEBKIT = {x: 1, y: -1}
  if (goog.userAgent.GECKO) {
    ezP.EditorOffset = GECKO
  } else if (goog.userAgent.WEBKIT) {
    var userAgent = goog.userAgent.getNavigator().userAgent
    if (userAgent && userAgent.search('Chrome') >= 0) {
      ezP.EditorOffset = CHROME
    } else {
      ezP.EditorOffset = WEBKIT
    }
  }
})

ezP.Style.Path = {
  Selected: {
    'colour': '#fc3',
    'width': 2.5
  },
  Error: {
    'colour': '#c33',
  },
  'colour': goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 9 / 10)),
  'width': 1.5, // px
  'radius': function () { return ezP.Font.space * 0.75 }
}
ezP.Style.MenuItem = {
  'padding-h': ezP.Padding.t,
  'padding-v': ezP.Padding.t
}
ezP.Style.CheckBox = {
  'padding': 1.5// px
}

ezP.Style.Edit = {
  padding_h: 1,
  padding_v: 0,
  radius: 2,
  width: 0.5,
}

ezP.Style.insertCssRuleAt = (function () {
  var style = document.createElement('style')
  document.head.appendChild(style)
  var sheet = style.sheet
  return function (rule, at) {
    if (rule.length) {
      sheet.insertRule(rule, at === undefined ? sheet.cssRules.length : at)
    }
  }
}())
/**
 * Setup the font style, amongst others.
 */
ezP.setup.register(function () {
  ezP.Style.insertCssRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono.woff')format('woff');font-weight: normal;font-style: normal;}")
  ezP.Style.insertCssRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono-Bold.woff')format('woff');font-weight: bold;font-style: normal;}")
  ezP.Style.insertCssRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono-Oblique.woff')format('woff');font-weight: normal;font-style: oblique;}")
  ezP.Style.insertCssRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono-BoldOblique.woff')format('woff');font-weight: bold;font-style: oblique;}")
  ezP.Style.insertCssRuleAt('.ezp-block .blocklyText, .ezp-var, .ezp-label, .ezp-code, .ezp-code-reserved, .ezp-code-builtin, .ezp-code-comment, .ezp-code-placeholder, .ezp-sharp-group{\n' + ezP.Font.style + ';\n}\n')
  ezP.Style.insertCssRuleAt('.ezp-error.ezp-path-selected, .ezp-error.ezp-path-shape, .ezp-error.ezp-path-contour {stroke: ' + ezP.Style.Path.Error.colour + ';}')
  ezP.Style.insertCssRuleAt('.ezp-path-selected{stroke: ' + ezP.Style.Path.Selected.colour + ';stroke-width: ' + ezP.Style.Path.Selected.width + 'px;fill: none;}')
  ezP.Style.insertCssRuleAt('.ezp-select .ezp-path-contour{stroke: ' + ezP.Style.Path.Selected.colour + ';}')
  ezP.Style.insertCssRuleAt('.ezp-select .ezp-path-contour.ezp-error{stroke: ' + ezP.Style.Path.Error.colour + ';}')
  ezP.Style.insertCssRuleAt('.blocklyHighlightedConnectionPath{stroke: ' + ezP.Style.Path.Selected.colour + ';stroke-width: ' + ezP.Style.Path.Selected.width + 'px;fill: none;}')
  ezP.Style.insertCssRuleAt('.blocklyHighlightedConnectionPathH{fill: ' + ezP.Style.Path.Selected.colour + ';stroke: none;}')
  ezP.Style.insertCssRuleAt('.ezp-checkbox-icon-rect{stroke: ' + ezP.Style.Path.colour + ';stroke-width: ' + ezP.Style.Path.width + 'px;fill: white;}')
  ezP.Style.insertCssRuleAt('.ezp-locked>.ezp-path-contour, .ezp-locked>.ezp-path-shape{display: none}')
  ezP.Style.insertCssRuleAt('.ezp-path-shape{stroke: none;fill: white;fill-opacity:0.9}')
  ezP.Style.insertCssRuleAt('.ezp-path-contour, .ezp-path-collapsed {stroke: ' + ezP.Style.Path.colour + ';stroke-width: ' + ezP.Style.Path.width + 'px;fill: none;}')
  ezP.Style.insertCssRuleAt('.ezp-none {stroke:none;fill:none;}')
  ezP.Style.insertCssRuleAt('.ezp-edit {stroke: ' + ezP.Style.Path.colour + ';stroke-width: '+ezP.Style.Edit.width+'px;fill: none;}')
  ezP.Style.insertCssRuleAt('rect.ezp-editing, .ezp-locked  .ezp-edit {stroke: none;}')
  ezP.Style.insertCssRuleAt('.ezp-path-dotted{stroke: ' + ezP.Style.Path.colour + ';stroke-width: ' + (ezP.Style.Path.width * 1.5) + 'px;stroke-linecap:round;stroke-dasharray:0 ' + ezP.Font.space / 2 + ';}')
  ezP.Style.insertCssRuleAt('.ezp-no-path{display:none;}', 5)
  ezP.Style.insertCssRuleAt('.ezp-code-emph {font-weight: bold;}')
  ezP.Style.insertCssRuleAt('.ezp-code-reserved, .ezp-code-builtin, .ezp-sharp-group {font-weight:bold;color: rgba(0, 84, 147, 0.75);fill: rgba(0, 84, 147, 0.75);}')
  ezP.Style.insertCssRuleAt('.ezp-code-builtin {font-weight:bold;color: rgba(60, 0, 145, 0.75);fill: rgba(60, 0, 145, 0.75);}')
  ezP.Style.insertCssRuleAt('.ezp-menuitem-disabled .ezp-code-reserved {color: rgba(60, 0, 145, 0.3);fill: rgba(0, 84, 147, 0.3);}')
  ezP.Style.insertCssRuleAt('.ezp-menuitem-disabled .ezp-code-builtin {font-weight:bold;color: rgba(60, 0, 145, 0.3);fill: rgba(60, 0, 145, 0.3);}')
  ezP.Style.insertCssRuleAt('.ezp-code-placeholder, .ezp-code-comment {font-style: oblique;}')
  ezP.Style.insertCssRuleAt('text.ezp-code-comment, .ezp-code-placeholder {fill: rgba(0, 0, 0, 0.4);}')
  ezP.Style.insertCssRuleAt('.ezp-code-error , input.ezp-code-error {color: red;}')
  ezP.Style.insertCssRuleAt('.ezp-code-disabled {color: #ccc;}')
})


ezP.Style.MenuIcon = {
  width: ezP.Font.space,
  color: 'black'
}

ezP.Style.MenuIcon.path = function (g) {
  var E = Blockly.utils.createSvgElement('g',
    {'class': 'ezp-menu-icon', 'opacity': 0.1}, g)
  E.style.fill = ezP.Style.MenuIcon.color
  var h = ezP.Font.height
  var w = ezP.Style.MenuIcon.width
  var r = h / 8
  Blockly.utils.createSvgElement('rect',
    {'x': '0',
      'y': '0',
      'rx': r,
      'ry': r,
      'width': w,
      'height': h,
      'fill': goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 254 / 255))},
    E)
  Blockly.utils.createSvgElement('circle',
    {'cx': w / 2, 'cy': h / 2, 'r': r},
    E)
  Blockly.utils.createSvgElement('circle',
    {'cx': w / 2, 'cy': h / 2 - h / 3, 'r': r},
    E)
  Blockly.utils.createSvgElement('circle',
    {'cx': w / 2, 'cy': h / 2 + h / 3, 'r': r},
    E)
  return E
}
