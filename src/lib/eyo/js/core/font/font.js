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

eYo.require('shared')
eYo.forward('padding')
 
/**
 * @name{eYo.font}
 */
eYo.o4t.newSingleton(eYo, 'font', {
  //<<< mochai: Basic
  //... chai.expect(eYo).property('font')
  //>>>
  properties: {
    //<<< mochai: properties
    ascent: {
      //<<< mochai: eYo.o4t.font.ascent
      //... chai.expect(eYo.font).property('ascent_p')
      /**
       * `after` is truncated to the `1/32th`
       * such that half value is still exact
       * when used in pixel dimension.
       * @param {Number} after 
       */
      validate (after) {
        return Math.round(32 * after) / 32
        //... chai.expect(eYo.font.ascent_p.validate(0, 421/32)).equal(421/32)
        //... chai.expect(eYo.font.ascent_p.validate(0, 421/32+1/128)).equal(421/32)
      },
      set (builtin, after) {
        after = builtin(after).after
        this.descent_p.reset_(after)
        this.xHeight_p.reset_(after)
        this.space_p.reset_(after)
        this.totalAscent_p.reset_(after)
      }
      //>>>
    },
    descent: {
      reset_ (builtin, ascent) {
        return builtin(Math.round(ascent * 492 * 8 / 389) / 32)
      },
      set: false,
      //... chai.expect(eYo.font.ascent).eyo_Num
      //... chai.expect(eYo.font).property('descent_p')
      //... chai.expect(eYo.font.descent).eyo_Num
      //... chai.expect(() => {
      //...   eYo.font.descent_ = 234
      //... }).xthrow()
    },
    xHeight: {
      reset_ (builtin, ascent) {
        return builtin(Math.round(ascent * 1120 * 8 / 389) / 32)
      },
      set: false,
      //... chai.expect(eYo.font).property('xHeight_p')
      //... chai.expect(eYo.font.xHeight).eyo_Num
      //... chai.expect(() => {
      //...   eYo.font.xHeight_ = 234
      //... }).xthrow()
    },
    space: {
      reset_ (builtin, ascent) {
        return builtin(Math.round(ascent * 1233 * 8 / 389) / 32)
      },
      set: false,
      //... chai.expect(eYo.font).property('space_p')
      //... chai.expect(eYo.font.space).eyo_Num
      //... chai.expect(() => {
      //...   eYo.font.space_ = 234
      //... }).xthrow()
    },
    totalAscent: {
      reset_ (builtin, ascent) {
        return builtin(Math.round(ascent * 2048 * 8 / 389) / 32)
      },
      set: false,
      //... chai.expect(eYo.font).property('totalAscent_p')
      //... chai.expect(eYo.font.totalAscent).eyo_Num
      //... chai.expect(() => {
      //...   eYo.font.totalAscent_ = 234
      //... }).xthrow()
    },
    size: {
      get () {
        return this.ascent
      }
      //... chai.expect(eYo.font).property('size_p')
      //... chai.expect(eYo.font.size).eyo_Num
      //... chai.expect(() => {
      //...   eYo.font.size_ = 234
      //... }).xthrow()
    },
    height: {
      get () {
        return this.totalAscent + this.descent
      },
      //... chai.expect(eYo.font).property('height_p')
      //... chai.expect(eYo.font.height).eyo_Num
      //... chai.expect(() => {
      //...   eYo.font.height_ = 234
      //... }).xthrow()
    },
    lineHeight: {
      get () {
        return this.height + eYo.padding.t + eYo.padding.b
      },
      //... chai.expect(eYo.font).property('lineHeight_p')
      //... chai.expect(eYo.font.lineHeight).eyo_Num
      //... chai.expect(() => {
      //...   eYo.font.lineHeight_ = 234
      //... }).xthrow()
    },
    familyMono: {
      get () {
        return 'DejaVuSansMono,monospace'
      }
      //... chai.expect(eYo.font).property('familyMono')
    },
    familySans: {
      get () {
        return 'DejaVuSans,sans-serif'
      }
      //... chai.expect(eYo.font).property('familySans')
    },
    style: {
      after: ['familyMono', 'familySans', 'ascent'],
      get () {
        return `font-family:${this.familyMono}!important;font-size:${this.ascent}pt!important;`
      }
      //... chai.expect(eYo.font).property('style_p')
      //... chai.expect(eYo.font).property('style')
      //... chai.expect(() => {
      //...   eYo.font.style_ = 234
      //... }).xthrow()
    },
    menuStyle: {
      after: ['familySans', 'ascent'],
      get () {
        return `font-family:${this.familySans};font-size:${this.ascent}pt;`
      }
      //... chai.expect(eYo.font).property('menuStyle_p')
      //... chai.expect(eYo.font).property('menuStyle')
      //... chai.expect(() => {
      //...   eYo.font.menuStyle_ = 234
      //... }).xthrow()
    },
    //>>>
  },
})

// Initialization of font dimensions
/**
 * Point size of text.
 */
eYo.font.ascent_ = 13
//<<< mochai: init
//... chai.expect(eYo.font.ascent).equal(13)
//>>>