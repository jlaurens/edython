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

goog.provide('edY.ui')
goog.provide('edY.Style')

goog.require('edY')

/**
 * The richness of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
edY.HSV_SATURATION = 5 / 255

/**
 * The intensity of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
edY.HSV_VALUE = 1

/**
 * Convert a hue (HSV model) into an RGB hex triplet.
 * @param {number} hue Hue on a colour wheel (0-360).
 * @return {string} RGB code, e.g. '#5ba65b'.
 */
edY.hueToRgb = function (hue) {
  return goog.color.hsvToHex(hue, edY.HSV_SATURATION, edY.HSV_VALUE * 255)
}

edY.Style = {}

edY.Style.weight = function (x) {
  return x / (1 + x)// 0↦0, 1↦1/2, 2↦2/3, 3↦3/4, ∞↦1
}

edY.Padding = {}
edY.Padding.l = edY.Padding.r = edY.Padding.h =
  function () { return 8 * edY.Style.weight(edY.Font.size / 10) }
edY.Padding.t = edY.Padding.b = edY.Padding.v =
  function () { return 6 * edY.Style.weight(edY.Font.size / 10) }

edY.Margin = {T: 0, L: 0, B: 0, R: 0, H: 0, V: 0}

/**
 * Point size of text.
 */
edY.Font = function (ascent) {
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
    return edY.Font.height + edY.Padding.t() + edY.Padding.b()
  }
  return my.updateAscent(ascent)
}(10)

/**
 * Offset of the text editor.
 */
edY.EditorOffset = {x: 0, y: 0}

/**
 * Setupt the offset of the text editor.
 */
edY.setup.register(function () {
  var CHROME = {x: 1, y: -0.5}
  var GECKO = {x: 0, y: -1}
  var WEBKIT = {x: 1, y: -1}
  if (goog.userAgent.GECKO) {
    edY.EditorOffset = GECKO
  } else if (goog.userAgent.WEBKIT) {
    var userAgent = goog.userAgent.getNavigator().userAgent
    if (userAgent && userAgent.search('Chrome') >= 0) {
      edY.EditorOffset = CHROME
    } else {
      edY.EditorOffset = WEBKIT
    }
  }
})

edY.Style.Path = {
  Selected: {
    'colour': '#fc3',
    'width': 2.5
  },
  Error: {
    'colour': '#c33',
  },
  'colour': goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 9 / 10)),
  'width': 1.5, // px
  'radius': function () { return edY.Font.space * 0.75 }
}
edY.Style.MenuItem = {
  'padding-h': edY.Padding.t,
  'padding-v': edY.Padding.t
}
edY.Style.CheckBox = {
  'padding': 1.5// px
}

edY.Style.Edit = {
  padding_h: 1,
  padding_v: 0,
  radius: 2,
  width: 0.5,
}

edY.Style.insertCssRuleAt = (function () {
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
edY.setup.register(function () {
  edY.Style.insertCssRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono.woff')format('woff');font-weight: normal;font-style: normal;}")
  edY.Style.insertCssRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono-Bold.woff')format('woff');font-weight: bold;font-style: normal;}")
  edY.Style.insertCssRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono-Oblique.woff')format('woff');font-weight: normal;font-style: oblique;}")
  edY.Style.insertCssRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono-BoldOblique.woff')format('woff');font-weight: bold;font-style: oblique;}")
  edY.Style.insertCssRuleAt('.edy-block .blocklyText, .edy-var, .edy-label, .edy-code, .edy-code-reserved, .edy-code-builtin, .edy-code-comment, .edy-code-placeholder, .edy-sharp-group{\n' + edY.Font.style + ';\n}\n')
  edY.Style.insertCssRuleAt('.edy-error.edy-path-selected, .edy-error.edy-path-shape, .edy-error.edy-path-contour {stroke: ' + edY.Style.Path.Error.colour + ';}')
  edY.Style.insertCssRuleAt('.edy-path-selected{stroke: ' + edY.Style.Path.Selected.colour + ';stroke-width: ' + edY.Style.Path.Selected.width + 'px;fill: none;}')
  edY.Style.insertCssRuleAt('.edy-select .edy-path-contour{stroke: ' + edY.Style.Path.Selected.colour + ';}')
  edY.Style.insertCssRuleAt('.edy-select .edy-path-contour.edy-error{stroke: ' + edY.Style.Path.Error.colour + ';}')
  edY.Style.insertCssRuleAt('.blocklyHighlightedConnectionPath{stroke: ' + edY.Style.Path.Selected.colour + ';stroke-width: ' + edY.Style.Path.Selected.width + 'px;fill: none;}')
  edY.Style.insertCssRuleAt('.blocklyHighlightedConnectionPathH{fill: ' + edY.Style.Path.Selected.colour + ';stroke: none;}')
  edY.Style.insertCssRuleAt('.edy-checkbox-icon-rect{stroke: ' + edY.Style.Path.colour + ';stroke-width: ' + edY.Style.Path.width + 'px;fill: white;}')
  edY.Style.insertCssRuleAt('.edy-locked>.edy-path-contour, .edy-locked>.edy-path-shape{display: none}')
  edY.Style.insertCssRuleAt('.edy-path-shape{stroke: none;fill: white;fill-opacity:0.9}')
  edY.Style.insertCssRuleAt('.edy-path-contour, .edy-path-collapsed {stroke: ' + edY.Style.Path.colour + ';stroke-width: ' + edY.Style.Path.width + 'px;fill: none;}')
  edY.Style.insertCssRuleAt('.edy-none {stroke:none;fill:none;}')
  edY.Style.insertCssRuleAt('.edy-edit {stroke: ' + edY.Style.Path.colour + ';stroke-width: '+edY.Style.Edit.width+'px;fill: none;}')
  edY.Style.insertCssRuleAt('rect.edy-editing, .edy-locked  .edy-edit {stroke: none;}')
  edY.Style.insertCssRuleAt('.edy-path-dotted{stroke: ' + edY.Style.Path.colour + ';stroke-width: ' + (edY.Style.Path.width * 1.5) + 'px;stroke-linecap:round;stroke-dasharray:0 ' + edY.Font.space / 2 + ';}')
  edY.Style.insertCssRuleAt('.edy-no-path{display:none;}', 5)
  edY.Style.insertCssRuleAt('.edy-code-emph {font-weight: bold;}')
  edY.Style.insertCssRuleAt('.edy-code-reserved, .edy-code-builtin, .edy-sharp-group {font-weight:bold;color: rgba(0, 84, 147, 0.75);fill: rgba(0, 84, 147, 0.75);}')
  edY.Style.insertCssRuleAt('.edy-code-builtin {font-weight:bold;color: rgba(60, 0, 145, 0.75);fill: rgba(60, 0, 145, 0.75);}')
  edY.Style.insertCssRuleAt('.edy-menuitem-disabled .edy-code-reserved {color: rgba(60, 0, 145, 0.3);fill: rgba(0, 84, 147, 0.3);}')
  edY.Style.insertCssRuleAt('.edy-menuitem-disabled .edy-code-builtin {font-weight:bold;color: rgba(60, 0, 145, 0.3);fill: rgba(60, 0, 145, 0.3);}')
  edY.Style.insertCssRuleAt('.edy-code-placeholder, .edy-code-comment {font-style: oblique;}')
  edY.Style.insertCssRuleAt('.edy-code-placeholder {fill: rgba(0, 0, 0, 0.4);}')
  edY.Style.insertCssRuleAt('input.edy-code-error {color: red;}')
  edY.Style.insertCssRuleAt('text.edy-code-error {fill: red;}')
  edY.Style.insertCssRuleAt('text.edy-code-comment {fill: rgba(42, 132, 45, 0.8);}')
  edY.Style.insertCssRuleAt('.edy-code-disabled {color: #ccc;}')
})

edY.Style.MenuIcon = {
  width: edY.Font.space,
  color: 'black'
}

edY.Style.MenuIcon.path = function (g) {
  var E = Blockly.utils.createSvgElement('g',
    {'class': 'edy-menu-icon', 'opacity': 0.1}, g)
  E.style.fill = edY.Style.MenuIcon.color
  var h = edY.Font.height
  var w = edY.Style.MenuIcon.width
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
