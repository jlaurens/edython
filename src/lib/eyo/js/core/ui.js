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

eYo.forwardDeclare('unit')
eYo.forwardDeclare('font-face')
goog.forwardDeclare('goog.cssom')
goog.forwardDeclare('goog.color')

/**
 * @name{eYo.font}
 * @namespace
 */
eYo.o4t.makeNS(eYo, 'font')

/**
 * Point size of text.
 */
eYo.o4t.initProperties(eYo.font, {
  familyMono: {
    get () {
      return 'DejaVuSansMono,monospace'
    }
  },
  familySans: {
    get () {
      return 'DejaVuSans,sans-serif'
    }
  },
  ascent: {
    /**
     * `after` is truncated to the `1/32th`
     * such that half value is still exact
     * when used in pixel dimension.
     * @param {Number} after 
     */
    validate (after) {
      return Math.round(32 * after) / 32
    },
    set_ (builtin, after) {
      builtin(after)
      this.descent_p.reset()
      this.xHeight_p.reset()
      this.space_p.reset()
      this.totalAscent_p.reset()
    }
  },
  descent: {
    reset () {
      return Math.round(this.ascent * 492 * 8 / 389) / 32
    },
    set: false,
  },
  xHeight: {
    reset () {
      return Math.round(this.ascent * 1120 * 8 / 389) / 32
    },
    set: false,
  },
  space: {
    reset () {
      return Math.round(this.ascent * 1233 * 8 / 389) / 32
    },
    set: false,
  },
  totalAscent: {
    reset () {
      return Math.round(this.ascent * 2048 * 8 / 389) / 32
    },
    set: false,
  },
  size: {
    get () {
      return this.ascent
    }
  },
  height: {
    get () {
      return this.totalAscent + this.descent
    },
  },
  lineHeight: {
    get () {
      return this.height + eYo.padding.t + eYo.padding.b
    },
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
})

// Initialization of font dimensions
eYo.font.ascent_ = 13

/**
 * @name{eYo.style}
 * @namespace
 */
eYo.makeNS('style')

eYo.style._p.weight = x => x / (1 + x), // 0↦0, 1↦1/2, 2↦2/3, 3↦3/4, ∞↦1
eYo.style._p.SEP_SPACE_X = 0

/**
 * @name{eYo.padding}
 * @namespace
 */
eYo.makeNS('padding')

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
      return Math.round(6000 * eYo.style.weight(eYo.font.size / 10)) / 1000
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
 * Offset of the text editor.
 */
eYo.editorOffset = {x: 0, y: 0}

/**
 * Setupt the offset of the text editor.
 */
eYo.setup.register(() => {
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
