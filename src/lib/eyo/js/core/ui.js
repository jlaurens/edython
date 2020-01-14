/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name{eYo.padding}
 * @namespace
 */
eYo.provide('padding', Object.create(null))

eYo.forwardDeclare('unit')
eYo.forwardDeclare('font-face')
eYo.forwardDeclare('c9r.Shape')
goog.forwardDeclare('goog.cssom')
goog.forwardDeclare('goog.color')

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

/**
 * @name{eYo.style}
 * @namespace
 */
eYo.provide('style', {
  weight: x => x / (1 + x), // 0↦0, 1↦1/2, 2↦2/3, 3↦3/4, ∞↦1
  SEP_SPACE_X: 0
})

;(() => {
  var g = {
    get () {
      return Math.round(8000 * eYo.style.weight(eYo.font.size / 10)) / 1000
    }
  }
  Object.defineProperties(
    eYo.padding,
    {
      l: g,
      r: g,
      h: g
    }
  )
  g = {
    get () {
      return Math.round(6000 * eYo.style.weight(eYo.font.size / 10) / 1000)
    }
  }
  Object.defineProperties(
    eYo.padding,
    {
      t: g,
      b: g,
      v: g
    }
  )
}) ()

/**
 * @name{eYo.font}
 * @namespace
 */
eYo.provide('font', {
  familyMono: 'DejaVuSansMono,monospace',
  familySans: 'DejaVuSans,sans-serif'
})

/**
 * Point size of text.
 */
Object.defineProperties(eYo.font, {
  size () {
    return this.ascent
  },
  ascent: {
    get () {
      return this.ascent_
    },
    /**
     * `after` is truncated to the `1/32th`
     * such that half value is still exact
     * when used in pixel dimension.
     * @param {Number} after 
     */
    set (after) {
      after = Math.round(32 * after) / 32
      if (after !== this.ascent_) {
        this.ascent_ = after
        after *= 32 / 1556 // = 16 / 778 = 8 / 389
        this.descent_ = Math.round(492 * after) / 32
        this.xHeight_ = Math.round(1120 * after) / 32
        this.space_ = Math.round(1233 * after) / 32
        this.totalAscent_ = Math.round(2048 * after) / 32
      }
    }
  },
  descent () {
    return this.descent_
  },
  xHeight () {
    return this.xHeight_
  },
  space () {
    return this.space_
  },
  totalAscent () {
    return this.totalAscent_
  },
  height () {
    return this.totalAscent + this.descent
  },
  lineHeight () {
    return this.height + eYo.padding.t + eYo.padding.B
  },
  style () {
    return `font-family:${this.familyMono}!important;font-size:${this.ascent}pt!important;`
  },
  menuStyle () {
    return `font-family:${this.familySans};font-size:${this.ascent}pt;`
  },
})

eYo.font.ascent = 13

/**
 * Offset of the text editor.
 */
eYo.editorOffset = {x: 0, y: 0}

/**
 * Setupt the offset of the text editor.
 */
eYo.Setup.register(() => {
  var ELECTRON = {x: 1, y: 2}
  var CHROME = {x: 1, y: 1}
  var GECKO = {x: 0, y: -1}
  var WEBKIT = {x: 1, y: -1}
  if (goog.userAgent.GECKO) {
    eYo.editorOffset = GECKO
  } else if (goog.userAgent.WEBKIT) {
    var userAgent = goog.userAgent.getNavigator().userAgent
    if (userAgent && userAgent.search('Electron/') >= 0) {
      eYo.editorOffset = ELECTRON
    } else if (userAgent && userAgent.search('Chrome') >= 0) {
      eYo.editorOffset = CHROME
    } else {
      eYo.editorOffset = WEBKIT
    }
  }
}, 'Editor offset')

eYo.style.path = {
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
  eYo.style.path,
  'r',
  {
    get () {
      return eYo.padding.v + eYo.font.descent / 2
    }
  }
)

eYo.style.menuItem = {
  'padding-h': eYo.padding.t,
  'padding-v': eYo.padding.t
}
eYo.style.checkBox = {
  'padding': 1.5// px
}

eYo.style.edit = {
  padding_h: 1,
  padding_v: 0,
  radius: 2,
  width: 0.5
}

eYo.style.menuIcon = {
  width: eYo.font.Space,
  color: 'black',
  path (g) {
    var E = eYo.svg.newElement('g',
      {class: 'eyo-menu-icon', opacity: 0.1}, g)
    E.style.fill = eYo.style.MenuIcon.Color
    var h = eYo.font.height
    var w = eYo.style.MenuIcon.width
    var r = h / 8
    eYo.svg.newElement('rect', {
      x: '0',
      y: '0',
      rx: r,
      ry: r,
      width: w,
      height: h,
      fill: goog.color.rgbArrayToHex(goog.color.hslToRgb(0, 0, 254 / 255))
    }, E)
    eYo.svg.newElement('circle',
      {cx: w / 2, cy: h / 2, r: r},
      E)
    eYo.svg.newElement('circle',
      {cx: w / 2, cy: h / 2 - h / 3, r: r},
      E)
    eYo.svg.newElement('circle',
      {cx: w / 2, cy: h / 2 + h / 3, r: r},
      E)
    return E
  }
}
