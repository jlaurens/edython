/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.ui')
goog.provide('eYo.Style')

goog.require('eYo')

/**
 * The richness of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
eYo.HSV_SATURATION = 5 / 255

/**
 * The intensity of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
eYo.HSV_VALUE = 1

/**
 * Convert a hue (HSV model) into an RGB hex triplet.
 * @param {number} hue Hue on a colour wheel (0-360).
 * @return {string} RGB code, e.g. '#5ba65b'.
 */
eYo.hueToRgb = function (hue) {
  return goog.color.hsvToHex(hue, eYo.HSV_SATURATION, eYo.HSV_VALUE * 255)
}

eYo.Style = {}

eYo.Style.weight = function (x) {
  return x / (1 + x)// 0↦0, 1↦1/2, 2↦2/3, 3↦3/4, ∞↦1
}

eYo.Padding = {}
eYo.Padding.l = eYo.Padding.r = eYo.Padding.h =
  function () { return 8 * eYo.Style.weight(eYo.Font.size / 10) }
eYo.Padding.t = eYo.Padding.b = eYo.Padding.v =
  function () { return 6 * eYo.Style.weight(eYo.Font.size / 10) }

eYo.Margin = {T: 0, L: 0, B: 0, R: 0, H: 0, V: 0}

/**
 * Point size of text.
 */
eYo.Font = function (ascent) {
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
    return eYo.Font.height + eYo.Padding.t() + eYo.Padding.b()
  }
  return my.updateAscent(ascent)
}(10)

/**
 * Offset of the text editor.
 */
eYo.EditorOffset = {x: 0, y: 0}

/**
 * Setupt the offset of the text editor.
 */
eYo.setup.register(function () {
  var CHROME = {x: 1, y: -0.5}
  var GECKO = {x: 0, y: -1}
  var WEBKIT = {x: 1, y: -1}
  if (goog.userAgent.GECKO) {
    eYo.EditorOffset = GECKO
  } else if (goog.userAgent.WEBKIT) {
    var userAgent = goog.userAgent.getNavigator().userAgent
    if (userAgent && userAgent.search('Chrome') >= 0) {
      eYo.EditorOffset = CHROME
    } else {
      eYo.EditorOffset = WEBKIT
    }
  }
})

eYo.Style.Path = {
  Selected: {
    'colour': '#fc3',
    'width': 2.5
  },
  Error: {
    'colour': '#c33',
  },
  'colour': goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 92 / 100)),
  'inner_colour': goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 97 / 100)),
  'width': 1.5, // px
  'radius': function () { return eYo.Font.space * 0.75 }
}
eYo.Style.MenuItem = {
  'padding-h': eYo.Padding.t,
  'padding-v': eYo.Padding.t
}
eYo.Style.CheckBox = {
  'padding': 1.5// px
}

eYo.Style.Edit = {
  padding_h: 1,
  padding_v: 0,
  radius: 2,
  width: 0.5,
}

eYo.Style.insertCssRuleAt = (function () {
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
eYo.setup.register(function () {
  eYo.Style.insertCssRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono.woff')format('woff');font-weight: normal;font-style: normal;}")
  eYo.Style.insertCssRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono-Bold.woff')format('woff');font-weight: bold;font-style: normal;}")
  eYo.Style.insertCssRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono-Oblique.woff')format('woff');font-weight: normal;font-style: oblique;}")
  eYo.Style.insertCssRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono-BoldOblique.woff')format('woff');font-weight: bold;font-style: oblique;}")
  eYo.Style.insertCssRuleAt('.eyo-block .blocklyText, .eyo-var, .eyo-label, .eyo-code, .eyo-code-reserved, .eyo-code-builtin, .eyo-code-comment, .eyo-code-placeholder, .eyo-sharp-group{\n' + eYo.Font.style + ';\n}\n')
  eYo.Style.insertCssRuleAt('.eyo-error.eyo-path-selected, .eyo-error.eyo-path-shape, .eyo-error.eyo-path-contour {stroke: ' + eYo.Style.Path.Error.colour + ';}')
  eYo.Style.insertCssRuleAt('.eyo-path-selected{stroke: ' + eYo.Style.Path.Selected.colour + ';stroke-width: ' + eYo.Style.Path.Selected.width + 'px;fill: none;}')
  eYo.Style.insertCssRuleAt('.eyo-select .eyo-path-contour{stroke: ' + eYo.Style.Path.Selected.colour + ';}')
  eYo.Style.insertCssRuleAt('.eyo-select .eyo-path-contour.eyo-error{stroke: ' + eYo.Style.Path.Error.colour + ';}')
  eYo.Style.insertCssRuleAt('.blocklyHighlightedConnectionPath{stroke: ' + eYo.Style.Path.Selected.colour + ';stroke-width: ' + eYo.Style.Path.Selected.width + 'px;fill: none;}')
  eYo.Style.insertCssRuleAt('.blocklyHighlightedConnectionPathH{fill: ' + eYo.Style.Path.Selected.colour + ';stroke: none;}')
  eYo.Style.insertCssRuleAt('.eyo-checkbox-icon-rect{stroke: ' + eYo.Style.Path.colour + ';stroke-width: ' + eYo.Style.Path.width + 'px;fill: white;}')
  eYo.Style.insertCssRuleAt('.eyo-locked>.eyo-path-contour, .eyo-locked>.eyo-path-shape{display: none}')
  eYo.Style.insertCssRuleAt('.eyo-path-shape{stroke: none;fill: white;fill-opacity:0.9}')
  eYo.Style.insertCssRuleAt('.eyo-path-contour, .eyo-path-collapsed {stroke: ' + eYo.Style.Path.colour + ';stroke-width: ' + eYo.Style.Path.width + 'px;fill: none;}')
  eYo.Style.insertCssRuleAt('.eyo-none {stroke:none;fill:none;}')
  eYo.Style.insertCssRuleAt('.eyo-edit {stroke: ' + eYo.Style.Path.colour + ';stroke-width: '+eYo.Style.Edit.width+'px;fill: none;}')
  eYo.Style.insertCssRuleAt('rect.eyo-editing, .eyo-locked  .eyo-edit {stroke: none;}')
  eYo.Style.insertCssRuleAt('.eyo-path-dotted{stroke: ' + eYo.Style.Path.colour + ';stroke-width: ' + (eYo.Style.Path.width * 1.5) + 'px;stroke-linecap:round;stroke-dasharray:0 ' + eYo.Font.space / 2 + ';}')
  eYo.Style.insertCssRuleAt('.eyo-no-path{display:none;}', 5)
  eYo.Style.insertCssRuleAt('.eyo-code-emph {font-weight: bold;}')
  eYo.Style.insertCssRuleAt('.eyo-code-reserved, .eyo-code-builtin, .eyo-sharp-group {font-weight:bold;color: rgba(0, 84, 147, 0.75);fill: rgba(0, 84, 147, 0.75);}')
  eYo.Style.insertCssRuleAt('.eyo-code-builtin {font-weight:bold;color: rgba(60, 0, 145, 0.75);fill: rgba(60, 0, 145, 0.75);}')
  eYo.Style.insertCssRuleAt('.eyo-menuitem-disabled .eyo-code-reserved {color: rgba(60, 0, 145, 0.3);fill: rgba(0, 84, 147, 0.3);}')
  eYo.Style.insertCssRuleAt('.eyo-menuitem-disabled .eyo-code-builtin {font-weight:bold;color: rgba(60, 0, 145, 0.3);fill: rgba(60, 0, 145, 0.3);}')
  eYo.Style.insertCssRuleAt('.eyo-code-placeholder, .eyo-code-comment {font-style: oblique;}')
  eYo.Style.insertCssRuleAt('.eyo-code-placeholder {fill: rgba(0, 0, 0, 0.4);}')
  eYo.Style.insertCssRuleAt('input.eyo-code-error {color: red;}')
  eYo.Style.insertCssRuleAt('text.eyo-code-error {fill: red;}')
  eYo.Style.insertCssRuleAt('text.eyo-code-comment {fill: rgba(42, 132, 45, 0.8);}')
  eYo.Style.insertCssRuleAt('.eyo-code-disabled {color: #ccc;}')
})

eYo.Style.MenuIcon = {
  width: eYo.Font.space,
  color: 'black'
}

eYo.Style.MenuIcon.path = function (g) {
  var E = Blockly.utils.createSvgElement('g',
    {'class': 'eyo-menu-icon', 'opacity': 0.1}, g)
  E.style.fill = eYo.Style.MenuIcon.color
  var h = eYo.Font.height
  var w = eYo.Style.MenuIcon.width
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
