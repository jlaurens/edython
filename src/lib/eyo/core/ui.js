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

goog.provide('eYo.Style')
goog.provide('eYo.Font')
goog.provide('eYo.Padding')

goog.require('eYo')
goog.require('goog.cssom');

goog.forwardDeclare('eYo.font-face')
goog.forwardDeclare('eYo.Shape')

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
Object.defineProperties(
  eYo.Padding,
  {
    l: g,
    r: g,
    h: g
  }
)
g = {
  get () {
    return 6 * eYo.Style.weight(eYo.Font.size / 10)
  }
}
Object.defineProperties(
  eYo.Padding,
  {
    t: g,
    b: g,
    v: g
  }
)
/**
 * Point size of text.
 */
eYo.Font = {
  ascent: 13,
  familyMono: 'DejaVuSansMono,monospace',
  familySans: 'DejaVuSans,sans-serif',
  tabW: 4
}

Object.defineProperties(
  eYo.Font,
  {
    size: {
      get () {
        return this.ascent
      }
    },
    descent: {
      get () {
        return this.ascent * 492 / 1556
      }
    },
    xHeight: {
      get () {
        return this.ascent * 1120 / 1556
      }
    },
    space: {
      get () {
        return this.ascent * 1233 / 1556
      }
    },
    totalAscent: {
      get () {
        return this.ascent * 2048 / 1556
      }
    },
    height: {
      get () {
        return this.totalAscent + this.descent
      }
    },
    lineHeight: {
      get () {
        return this.height + eYo.Padding.t + eYo.Padding.b
      }
    },
    style: {
      get () {
        return `font-family:${this.familyMono}!important;font-size:${this.ascent}pt!important;`
      }
    },
    menuStyle: {
      get () {
        return `font-family:${this.familySans};font-size:${this.ascent}pt;`
      }
    },
    tabWidth: {
      get () {
        return this.tabW * this.space
      }
    }
  }
)

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
    if (userAgent && userAgent.search('Electron/') >= 0) {
      eYo.EditorOffset = ELECTRON
    } else if (userAgent && userAgent.search('Chrome') >= 0) {
      eYo.EditorOffset = CHROME
    } else {
      eYo.EditorOffset = WEBKIT
    }
  }
}, 'Editor offset')

eYo.Style.Path = {
  Hilighted: {
    colour: '#f9951b', // #fc3
    width: 2.675, // px
  },
  Error: {
    colour: '#c33', // #fc3
    width: 2, // px
  },
  bbox_colour: goog.color.rgbArrayToHex(goog.color.hslToRgb(120, 100 / 100, 50 / 100))
}
Object.defineProperty(
  eYo.Style.Path,
  'r',
  {
    get () {
      return eYo.Padding.v + eYo.Font.descent / 2
    }
  }
)

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

eYo.Style.insertCssRuleAt = (() => {
  var style, sheet
  var getSheet = () => {
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
})()

eYo.setup.register(-1, function () {
  eYo.Style.insertCssRuleAt('body {background: orange;}')
  eYo.Style.insertCssRuleAt(null)
})

eYo.setup.register(function () {
  eYo.Style.insertCssRuleAt(
    `.blocklyMainBackground {
      stroke-width: 5;
      stroke: none;
    }
  `)
}, 'OVERRIDE')

eYo.setup.register(() => {
  eYo.Style.insertCssRuleAt(
    `.eyo-block .blocklyText,
    .eyo-var,
    .eyo-label,
    .eyo-code,
    .eyo-code-reserved,
    .eyo-code-builtin,
    .eyo-code-comment,
    .eyo-code-placeholder,
    .eyo-sharp-group{
      ${eYo.Font.style};
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-error.eyo-path-selected,
    .eyo-error.eyo-path-hilighted,
    .eyo-error.eyo-path-shape,
    .eyo-error.eyo-path-contour,
    .eyo-error.eyo-path-inner {
      stroke:${eYo.Style.Path.Error.colour};
      stroke-width: ${eYo.Style.Path.Error.width}px;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-path-selected,
    .eyo-path-hilighted {
      stroke: ${eYo.Style.Path.Hilighted.colour};
      fill: none;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-path-hilighted {
      stroke-width: ${eYo.Style.Path.Hilighted.width}px;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-select .eyo-path-contour.eyo-error,
    .eyo-select .eyo-path-inner.eyo-error {
      stroke: ${eYo.Style.Path.Error.colour};
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-checkbox-icon-rect {
      stroke: ${eYo.Shape.Style.colour.light};
      stroke-width: ${eYo.Shape.Style.width.light}px;
      fill: white;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-checkbox-icon-rect {
      stroke: ${eYo.Shape.Style.colour.light};
      stroke-width: ${eYo.Shape.Style.width.light}px;
      fill: white;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-medium .eyo-checkbox-icon-rect {
      stroke: ${eYo.Shape.Style.colour.medium};
      stroke-width: ${eYo.Shape.Style.width.medium}px;
      fill: white;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-dark .eyo-checkbox-icon-rect {
      stroke: ${eYo.Shape.Style.colour.dark};
      stroke-width: ${eYo.Shape.Style.width.dark}px;
      fill: white;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-locked.eyo-path-contour,
    .eyo-locked.eyo-path-inner,
    .eyo-locked.eyo-path-shape,
    .eyo-locked.eyo-edit,
    .eyo-locked.eyo-edit{
      display: none
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-path-shape {
      stroke: none;
      fill: white;
      fill-opacity:0.92
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-path-bbox {
      stroke: ${eYo.Style.Path.bbox_colour};
      stroke-width: ${eYo.Shape.Style.width.light}px;
      fill: none;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-inner .eyo-path-shape {
      stroke: none;
      fill-opacity:0
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-stmt.eyo-inner .eyo-path-shape {
      stroke: none;
      fill-opacity:0.92;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-path-contour,
    .eyo-path-inner,
    .eyo-path-collapsed,
    .eyo-path-play-contour {
      stroke: ${eYo.Shape.Style.colour.light};
      stroke-width: ${eYo.Shape.Style.width.light}px;
      fill: none;
      pointer-events: all;
      stroke-linejoin="round";
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-medium .eyo-path-contour,
    .eyo-medium .eyo-path-inner,
    .eyo-medium .eyo-path-collapsed,
    .eyo-medium .eyo-path-play-contour {
      stroke: ${eYo.Shape.Style.colour.medium};
      stroke-width: ${eYo.Shape.Style.width.medium}px;
      fill: none;
      pointer-events: all;
      stroke-linejoin="round";
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-dark .eyo-path-contour,
    .eyo-dark .eyo-path-inner,
    .eyo-dark .eyo-path-collapsed,
    .eyo-dark .eyo-path-play-contour {
      stroke: ${eYo.Shape.Style.colour.dark};
      stroke-width: ${eYo.Shape.Style.width.dark}px;
      fill: none;
      pointer-events: all;
      stroke-linejoin="round";
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-path-selected {
      pointer-events: none;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-inner.eyo-expr .eyo-path-contour,
    .eyo-inner.eyo-expr .eyo-path-collapsed {
      stroke: ${eYo.Shape.Style.inner_colour.light};
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-medium .eyo-inner.eyo-expr .eyo-path-contour,
    .eyo-medium .eyo-inner.eyo-expr .eyo-path-collapsed {
      stroke: ${eYo.Shape.Style.inner_colour.medium};
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-dark .eyo-inner.eyo-expr .eyo-path-contour,
    .eyo-dark .eyo-inner.eyo-expr .eyo-path-collapsed {
      stroke: ${eYo.Shape.Style.inner_colour.dark};
    }`
  )
   // When the selected block is a statement
  // only the following and suite statements are highlighted
  // the expression statements are selected only when the parent
  // is a selected statement, or the parent is an highlighted expression
  // eyo-expr selector for expressions
  // eyo-stmt selector for statements
  // eyo-inner when there is a parent or not
  // Find the proper selectors
  // When an expression is selected
  eYo.Style.insertCssRuleAt(
    `.eyo-select.eyo-expr .eyo-path-contour,
    .eyo-select.eyo-stmt .eyo-path-contour,
    .eyo-select.eyo-expr .eyo-path-inner {
      stroke: ${eYo.Style.Path.Hilighted.colour};
    }`
  )
  // When a statement is selected, select only statements
  eYo.Style.insertCssRuleAt(
    `.eyo-select.eyo-stmt>.eyo-path-contour,
    .eyo-select.eyo-stmt>.eyo-path-inner {
      stroke: ${eYo.Style.Path.Hilighted.colour};
    }`
  )
  //, .eyo-select.eyo-stmt *:not(.eyo-expr)>.eyo-path-contour,
  // .eyo-select.eyo-stmt *:not(.eyo-expr)>.eyo-path-inner
  
  // When a statement is selected, select only expressions of that statement
  eYo.Style.insertCssRuleAt(
    `.eyo-select.eyo-stmt>.eyo-expr .eyo-path-contour,
    .eyo-select.eyo-stmt>.eyo-expr .eyo-path-inner {
      stroke: ${eYo.Style.Path.Hilighted.colour};
    }`
  ) 
  eYo.Style.insertCssRuleAt(
    `.eyo-start-path {
      fill: rgba(240, 240, 240, 0.97);
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-path-play-contour {
      fill: rgba(255, 255, 255, 0.8);
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-none {
      stroke: none;
      fill: none;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-edit {
      stroke: none;
      stroke-width:${eYo.Style.Edit.width}px;
      fill: none;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-select>g>g>.eyo-edit,
    .eyo-select>g>.eyo-edit {
      stroke: ${eYo.Shape.Style.colour.light};
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-medium .eyo-select>g>g>.eyo-edit,
    .eyo-select>g>.eyo-edit {
      stroke: ${eYo.Shape.Style.colour.medium};
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-dark .eyo-select>g>g>.eyo-edit,
    .eyo-select>g>.eyo-edit {
      stroke: ${eYo.Shape.Style.colour.dark};
    }`
  )
  eYo.Style.insertCssRuleAt(
    `rect.eyo-editing,
    .eyo-locked .eyo-edit,
    .eyo-select>g.eyo-locked>g>.eyo-edit,
    .eyo-select>g.eyo-locked>.eyo-edit {
      stroke: none;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-path-dotted {
      stroke: ${eYo.Shape.Style.colour.light};
      stroke-width: ${(eYo.Shape.Style.width.light * 1.5)}px;
      stroke-linecap: round;
      stroke-dasharray: 0 ${eYo.Font.space / 2};
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-no-path {
      display: none;
    }`,
    5
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-code-emph {
      font-weight: bold;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-code-reserved,
    .eyo-code-builtin,
    .eyo-sharp-group {
      font-weight: bold!important;
      color: rgba(0, 84, 147, 0.75)!important;
      fill: rgba(0, 84, 147, 0.75)!important;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-code-builtin {
      font-weight: bold;
      color: rgba(60, 0, 145, 0.75);
      fill: rgba(60, 0, 145, 0.75);
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menuitem-disabled .eyo-code-reserved {
      color: rgba(60, 0, 145, 0.3);
      fill: rgba(0, 84, 147, 0.3);
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-menuitem-disabled .eyo-code-builtin {
      font-weight: bold;
      color: rgba(60, 0, 145, 0.3);
      fill: rgba(60, 0, 145, 0.3);
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-code-placeholder,
    .eyo-code-comment {
      font-style: oblique;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-start>g>.eyo-code-comment {
      font-style: normal;
      font-weight: bold;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-start>text.eyo-code-reserved.eyo-label {
      opacity:0;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-code-placeholder {
      fill: rgba(0, 0, 0, 0.4);
    }`
  )
  eYo.Style.insertCssRuleAt(
    `input.eyo-code-error {
      color: red;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `text.eyo-code-error {
      fill: red;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `text.eyo-code-comment {
      fill: rgba(42, 132, 45, 0.8);
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.eyo-code-disabled {
      color: #ccc;
    }`
  )
  eYo.Style.insertCssRuleAt(
    `.blocklyHighlightedConnectionPath{
      stroke: ${eYo.Style.Path.Hilighted.colour};
      stroke-width: ${eYo.Style.Path.Hilighted.width}px;
      fill: none;
    }`
  )
  eYo.Style.insertCssRuleAt(
      `.blocklyHighlightedConnectionPathH{
        fill: ${eYo.Style.Path.Hilighted.colour};
        stroke: none;
    }`
  )
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
