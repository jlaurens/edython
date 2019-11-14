/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo')
goog.provide('eYo.Font')
goog.provide('eYo.Padding')

goog.provide('eYo.Style')

goog.forwardDeclare('eYo.Unit')
goog.forwardDeclare('eYo.font-face')
goog.forwardDeclare('eYo.Shape')
goog.forwardDeclare('goog.cssom');

/**
 * The richness of brick colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
eYo.HSV_SATURATION = 5 / 255

/**
 * The intensity of brick colours, regardless of the hue.
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

eYo.Style = {
  weight: x => x / (1 + x), // 0↦0, 1↦1/2, 2↦2/3, 3↦3/4, ∞↦1
  SEP_SPACE_X: 0
}

;(function () {
  var g = {
    get () {
      return Math.round(8000 * eYo.Style.weight(eYo.Font.size / 10)) / 1000
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
      return Math.round(6000 * eYo.Style.weight(eYo.Font.size / 10) / 1000)
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
})()
/**
 * Point size of text.
 */
eYo.Font = {
  familyMono: 'DejaVuSansMono,monospace',
  familySans: 'DejaVuSans,sans-serif'
}

Object.defineProperties(eYo.Font, {
  size: {
    get () {
      return this.ascent
    }
  },
  ascent: {
    get () {
      return this.ascent_
    },
    /**
     * `newValue` is truncated to the `1/32th`
     * such that half value is still exact
     * when used in pixel dimension.
     * @param {Number} newValue 
     */
    set (newValue) {
      newValue = Math.round(32 * newValue) / 32
      if (newValue !== this.ascent_) {
        this.ascent_ = newValue
        newValue *= 32 / 1556 // = 16 / 778 = 8 / 389
        this.descent_ = Math.round(492 * newValue) / 32
        this.xHeight_ = Math.round(1120 * newValue) / 32
        this.space_ = Math.round(1233 * newValue) / 32
        this.totalAscent_ = Math.round(2048 * newValue) / 32
      }
    }
  },
  descent: {
    get () {
      return this.descent_
    }
  },
  xHeight: {
    get () {
      return this.xHeight_
    }
  },
  space: {
    get () {
      return this.space_
    }
  },
  totalAscent: {
    get () {
      return this.totalAscent_
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
  }
})

eYo.Font.ascent = 13

/**
 * Offset of the text editor.
 */
eYo.EditorOffset = {x: 0, y: 0}

/**
 * Setupt the offset of the text editor.
 */
eYo.setup.register(() => {
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

eYo.Style.MenuIcon = {
  width: eYo.Font.space,
  color: 'black'
}

eYo.Style.MenuIcon.path = function (g) {
  var E = eYo.Svg.newElement('g',
    {class: 'eyo-menu-icon', opacity: 0.1}, g)
  E.style.fill = eYo.Style.MenuIcon.color
  var h = eYo.Font.height
  var w = eYo.Style.MenuIcon.width
  var r = h / 8
  eYo.Svg.newElement('rect', {
    x: '0',
    y: '0',
    rx: r,
    ry: r,
    width: w,
    height: h,
    fill: goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 254 / 255))
  }, E)
  eYo.Svg.newElement('circle',
    {cx: w / 2, cy: h / 2, r: r},
    E)
  eYo.Svg.newElement('circle',
    {cx: w / 2, cy: h / 2 - h / 3, r: r},
    E)
  eYo.Svg.newElement('circle',
    {cx: w / 2, cy: h / 2 + h / 3, r: r},
    E)
  return E
}
