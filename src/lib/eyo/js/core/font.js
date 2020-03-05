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

/**
 * @name{eYo.font}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'font')

/**
 * Point size of text.
 */
eYo.o4t.prepareProperties(eYo.font, {
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
