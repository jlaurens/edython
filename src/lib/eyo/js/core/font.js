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

eYo.makeNS('font-face')

 /**
 * Setup the font style, amongst others.
 */
;(static_ => {
  eYo.setup.register(() => {
    eYo.css.insertRuleAt(`@font-face {
  font-family: 'DejaVuSansMono';
  src: local('☺'),url(${static_}/font/DejaVuSansMono.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}`)
  eYo.css.insertRuleAt(`@font-face {
  font-family: 'DejaVuSansMono';
  src: local('☺'), url('${static_}/font/DejaVuSansMono-Bold.woff')format('woff');
  font-weight: bold;
  font-style: normal;
}`)
    eYo.css.insertRuleAt(`@font-face {
  font-family: 'DejaVuSansMono';
  src: local('☺'),url('${static_}/font/DejaVuSansMono-Oblique.woff')format('woff');
  font-weight: normal;
  font-style: oblique;
}`)
    eYo.css.insertRuleAt(`@font-face {
  font-family: 'DejaVuSansMono';
  src: local('☺'),url('${static_}/font/DejaVuSansMono-BoldOblique.woff')format('woff');
  font-weight: bold;
  font-style: oblique;
}`)
  })
})(window.__static || 'static')
