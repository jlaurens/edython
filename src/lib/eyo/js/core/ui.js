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

eYo.forwardDeclare('geom')
eYo.forwardDeclare('font')

//g@@g.forwardDeclare('g@@g.cssom')
goog.require('goog.color')
eYo.makeNS('color')
eYo.color.rgbArrayToHex = goog.color.rgbArrayToHex
eYo.color.hslToRgb = goog.color.hslToRgb

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
  if (eYo.userAgent.GECKO) {
    eYo.editorOffset = GECKO
  } else if (eYo.userAgent.WEBKIT) {
    var userAgent = eYo.userAgent.getNavigator().userAgent
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
  bbox_colour: eYo.color.rgbArrayToHex(eYo.color.hslToRgb(120, 100 / 100, 50 / 100))
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
      fill: eYo.color.rgbArrayToHex(eYo.color.hslToRgb(0, 0, 254 / 255))
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
