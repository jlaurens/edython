/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.UI')
goog.provide('eYo.Style')
goog.provide('eYo.Font')
goog.provide('eYo.Padding')
goog.provide('eYo.Margin')

goog.require('eYo')
goog.require('goog.cssom');

goog.forwardDeclare('eYo.font-face')

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

var g = {
  get () {
    return 8 * eYo.Style.weight(eYo.Font.size / 10)
  }
}
Object.defineProperty(eYo.Padding, 'l', g)
Object.defineProperty(eYo.Padding, 'r', g)
Object.defineProperty(eYo.Padding, 'h', g)
g = {
  get () {
    return 6 * eYo.Style.weight(eYo.Font.size / 10)
  }
}
Object.defineProperty(eYo.Padding, 't', g)
Object.defineProperty(eYo.Padding, 'b', g)
Object.defineProperty(eYo.Padding, 'v', g)

eYo.Margin = {T: 0, L: 0, B: 0, R: 0, H: 0, V: 0}

/**
 * Point size of text.
 */
eYo.Font = (function (ascent) {
  var my = {}
  my.updateAscent = function (ascent) {
    my.ascent = my.size = ascent
    my.descent = ascent * 492 / 1556
    my.xHeight = ascent * 1120 / 1556
    my.space = ascent * 1233 / 1556
    my.totalAscent = ascent * 2048 / 1556
    my.height = my.totalAscent + my.descent
    my.familyMono = 'DejaVuSansMono,monospace'
    my.familySans = 'DejaVuSans,sans-serif'
    my.style = 'font-family:'+my.familyMono+';font-size:' + ascent + 'pt;'
    my.menuStyle = 'font-family:'+my.familySans+';font-size:' + ascent + 'pt;'
    my.tabWidth = 4 * my.space
    return my
  }
  my.lineHeight = function () {
    return eYo.Font.height + eYo.Padding.t + eYo.Padding.b
  }
  return my.updateAscent(ascent)
}(13))

/**
 * Offset of the text editor.
 */
eYo.EditorOffset = {x: 0, y: 0}

/**
 * Setupt the offset of the text editor.
 */
eYo.setup.register(function () {
  var ELECTRON = {x: 1, y: 2}
  var CHROME = {x: 1, y: 1}
  var GECKO = {x: 0, y: -1}
  var WEBKIT = {x: 1, y: -1}
  if (goog.userAgent.GECKO) {
    eYo.EditorOffset = GECKO
  } else if (goog.userAgent.WEBKIT) {
    var userAgent = goog.userAgent.getNavigator().userAgent
    if (userAgent && userAgent.search('Electron') >= 0) {
      eYo.EditorOffset = ELECTRON
    } else if (userAgent && userAgent.search('Chrome') >= 0) {
      eYo.EditorOffset = CHROME
    } else {
      eYo.EditorOffset = WEBKIT
    }
  }
}, 'Editor offset')

eYo.Style.Path = {
  Selected: {
    colour: '#fc3',
    width: 2.675, // px
  },
  Error: {
    colour: '#c33'
  },
  colour: goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 90 / 100)),
  inner_colour: goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 97 / 100)),
  width: 1.5, // px
  radius: function () {
    return eYo.Margin.V + eYo.Padding.v + eYo.Font.descent / 2
  }
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
  width: 0.5
}

eYo.Style.insertCssRuleAt = (function () {
  var style, sheet
  var getSheet = function() {
    if (!sheet) {
      // style = document.createElement('style')
      // //document.head.appendChild(style)// only once
      // document.head.insertBefore(style, document.head.firstChild)
      // sheet = style.sheet

      style = document.createElement('style')
      document.head.insertBefore(style, document.head.firstChild)
      sheet = style.sheet
    }
    return sheet
  }
  return function () {
    var sheet = getSheet()
    if (arguments.length === 0) {
      return
    }
    var rule = []
    var i = 0
    while (goog.isString(arguments[i])) {
      rule.push(arguments[i])
      ++i
    }
    if (goog.isNumber(arguments[i])) {
      var at = arguments[i]
    }
    if (rule.length) {
      goog.cssom.addCssRule(sheet, rule.join(''), at)
    }
  }
}())

eYo.setup.register(-1, function () {
  eYo.Style.insertCssRuleAt('body {background: orange;}')
  eYo.Style.insertCssRuleAt(null)
})

eYo.setup.register(function () {
  eYo.Style.insertCssRuleAt('.blocklyMainBackground { stroke-width: 5;stroke: none; }')
}, 'OVERRIDE')

eYo.setup.register(function () {
  eYo.Style.insertCssRuleAt('.eyo-block .blocklyText, .eyo-var, .eyo-label, .eyo-code, .eyo-code-reserved, .eyo-code-builtin, .eyo-code-comment, .eyo-code-placeholder, .eyo-sharp-group{ ' + eYo.Font.style + ';}')
  eYo.Style.insertCssRuleAt('.eyo-error.eyo-path-selected, .eyo-error.eyo-path-shape, .eyo-error.eyo-path-contour, .eyo-error.eyo-path-inner {stroke: ' + eYo.Style.Path.Error.colour + ';}')
  var w = eYo.Style.Path.Selected.width
  console.warn('PATH WIDTH:', w, ';stroke-width: ' + w + 'px;fill: none;}')
  eYo.Style.insertCssRuleAt('.eyo-path-selected{stroke: ' + eYo.Style.Path.Selected.colour + ';stroke-width: ' + eYo.Style.Path.Selected.width + 'px;fill: none;}')
  eYo.Style.insertCssRuleAt('.eyo-select .eyo-path-contour, .eyo-select .eyo-path-inner, .eyo-select.eyo-inner.eyo-expr .eyo-path-contour,  .eyo-select .eyo-inner.eyo-expr .eyo-path-contour, .eyo-select .eyo-inner.eyo-expr .eyo-path-inner {stroke: ' + eYo.Style.Path.Selected.colour + ';}')
  eYo.Style.insertCssRuleAt('.eyo-select .eyo-path-contour.eyo-error, .eyo-select .eyo-path-inner.eyo-error{stroke: ' + eYo.Style.Path.Error.colour + ';}')
  eYo.Style.insertCssRuleAt('.eyo-checkbox-icon-rect{stroke: ' + eYo.Style.Path.colour + ';stroke-width: ' + eYo.Style.Path.width + 'px;fill: white;}')
  eYo.Style.insertCssRuleAt('.eyo-locked.eyo-path-contour, .eyo-locked.eyo-path-inner, .eyo-locked.eyo-path-shape, .eyo-locked.eyo-edit, .eyo-locked.eyo-edit{display: none}')
  eYo.Style.insertCssRuleAt('.eyo-path-shape{stroke: none;fill: white;fill-opacity:0.85}')
  eYo.Style.insertCssRuleAt('.eyo-inner .eyo-path-shape{stroke: none;fill-opacity:0}')
  eYo.Style.insertCssRuleAt('.eyo-stmt.eyo-inner .eyo-path-shape{stroke: none;fill-opacity:0.85}')
  eYo.Style.insertCssRuleAt('.eyo-path-contour, .eyo-path-inner, .eyo-path-collapsed {stroke: ' + eYo.Style.Path.colour + ';stroke-width: ' + eYo.Style.Path.width + 'px;fill: none;pointer-events: all;stroke-linejoin="round"; }')
  eYo.Style.insertCssRuleAt('.eyo-path-selected {pointer-events: none; }')
  eYo.Style.insertCssRuleAt('.eyo-inner.eyo-expr .eyo-path-contour, .eyo-inner.eyo-expr .eyo-path-collapsed {stroke: ' + eYo.Style.Path.inner_colour + ';}')
  eYo.Style.insertCssRuleAt('.eyo-none {stroke:none;fill:none;}')
  eYo.Style.insertCssRuleAt('.eyo-edit {stroke: none;stroke-width: ' + eYo.Style.Edit.width + 'px;fill: none;}')
  eYo.Style.insertCssRuleAt('.eyo-select>g>g>.eyo-edit, .eyo-select>g>.eyo-edit {stroke: ' + eYo.Style.Path.colour + ';}')
  eYo.Style.insertCssRuleAt('rect.eyo-editing, .eyo-locked .eyo-edit ,.eyo-select>g.eyo-locked>g>.eyo-edit, .eyo-select>g.eyo-locked>.eyo-edit {stroke: none;}')
  eYo.Style.insertCssRuleAt('.eyo-path-dotted{stroke: ' + eYo.Style.Path.colour + ';stroke-width: ' + (eYo.Style.Path.width * 1.5) + 'px;stroke-linecap:round;stroke-dasharray:0 ' + eYo.Font.space / 2 + ';}')
  eYo.Style.insertCssRuleAt('.eyo-no-path{display:none;}', 5)
  eYo.Style.insertCssRuleAt('.eyo-code-emph {font-weight: bold;}')
  eYo.Style.insertCssRuleAt('.eyo-code-reserved, .eyo-code-builtin, .eyo-sharp-group {font-weight:bold;color: rgba(0, 84, 147, 0.75);fill: rgba(0, 84, 147, 0.75);}')
  eYo.Style.insertCssRuleAt('.eyo-code-builtin {font-weight:bold;color: rgba(60, 0, 145, 0.75);fill: rgba(60, 0, 145, 0.75);}')
  eYo.Style.insertCssRuleAt('.eyo-menuitem-disabled .eyo-code-reserved {color: rgba(60, 0, 145, 0.3);fill: rgba(0, 84, 147, 0.3);}')
  eYo.Style.insertCssRuleAt('.eyo-menuitem-disabled .eyo-code-builtin {font-weight:bold;color: rgba(60, 0, 145, 0.3);fill: rgba(60, 0, 145, 0.3);}')
  eYo.Style.insertCssRuleAt('.eyo-code-placeholder, .eyo-code-comment {font-style: oblique;}')
  eYo.Style.insertCssRuleAt('.eyo-start>g>.eyo-code-comment {font-style: normal;font-weight: bold;}')
  eYo.Style.insertCssRuleAt('.eyo-start>text.eyo-code-reserved.eyo-label {opacity:0;}')
  eYo.Style.insertCssRuleAt('.eyo-code-placeholder {fill: rgba(0, 0, 0, 0.4);}')
  eYo.Style.insertCssRuleAt('input.eyo-code-error {color: red;}')
  eYo.Style.insertCssRuleAt('text.eyo-code-error {fill: red;}')
  eYo.Style.insertCssRuleAt('text.eyo-code-comment {fill: rgba(42, 132, 45, 0.8);}')
  eYo.Style.insertCssRuleAt('.eyo-code-disabled {color: #ccc;}')
  eYo.Style.insertCssRuleAt('.blocklyHighlightedConnectionPath{stroke: ' + eYo.Style.Path.Selected.colour + ';stroke-width: ' + eYo.Style.Path.Selected.width + 'px;fill: none;}')
  eYo.Style.insertCssRuleAt('.blocklyHighlightedConnectionPathH{fill: ' + eYo.Style.Path.Selected.colour + ';stroke: none;}')
}, 'Style')

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
