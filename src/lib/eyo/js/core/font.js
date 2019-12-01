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

goog.require('eYo')

goog.provide('eYo.font-face')

 /**
 * Setup the font style, amongst others.
 */
eYo.Temp.x = ((static_) => {
  eYo.setup.register(() => {
    eYo.Css.insertRuleAt(`@font-face {
  font-family: 'DejaVuSansMono';
  src: local('☺'),url(${static_}/font/DejaVuSansMono.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}`)
    eYo.Css.insertRuleAt(`@font-face {
  font-family: 'DejaVuSansMono';
  src: local('☺'), url('${static_}/font/DejaVuSansMono-Bold.woff')format('woff');
  font-weight: bold;
  font-style: normal;
}`)
    eYo.Css.insertRuleAt(`@font-face {
  font-family: 'DejaVuSansMono';
  src: local('☺'),url('${static_}/font/DejaVuSansMono-Oblique.woff')format('woff');
  font-weight: normal;
  font-style: oblique;
}`)
    eYo.Css.insertRuleAt(`@font-face {
  font-family: 'DejaVuSansMono';
  src: local('☺'),url('${static_}/font/DejaVuSansMono-BoldOblique.woff')format('woff');
  font-weight: bold;
  font-style: oblique;
}`)
  })
})(window.__static || 'static')

eYo.Debug.test() // remove this line when finished
