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

goog.provide('eYo.font-face')

goog.require('eYo')

/**
* Setup the font style, amongst others.
*/
eYo.setup.register(() => {
 eYo.Css.insertRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono.woff')format('woff');font-weight: normal;font-style: normal;}", 0)
 eYo.Css.insertRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono-Bold.woff')format('woff');font-weight: bold;font-style: normal;}", 0)
 eYo.Css.insertRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono-Oblique.woff')format('woff');font-weight: normal;font-style: oblique;}", 0)
 eYo.Css.insertRuleAt("@font-face{font-family:'DejaVuSansMono';src:local('☺'),url('DejaVuSansMono-BoldOblique.woff')format('woff');font-weight: bold;font-style: oblique;}", 0)
}, 'Loading fonts')
