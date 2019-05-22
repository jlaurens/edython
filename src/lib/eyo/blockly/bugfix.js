goog.provide('eYo.BugFix')

goog.require('eYo.BugFix')


/**
 * For some reason, the string given by `element.style.transform` seems localized
 * in the sense that floats may use commas instead of dots. See https://github.com/electron/electron/issues/6158
 */

var original_parseFloat = parseFloat
// eslint-disable-next-line no-global-assign
parseFloat = (x) => {
  return original_parseFloat(goog.isDefAndNotNull(x) && x.replace
    ? x.replace(',', '.')
    : x)
}

// eslint-disable-next-line no-useless-escape
goog.style.MATRIX_TRANSLATION_REGEX_ = /matrix\([0-9\.,-]+, [0-9\.,\-]+, [0-9\.,\-]+, [0-9\.,\-]+, ([0-9\.,\-]+)p?x?, ([0-9\.,\-]+)p?x?\)/
/**
 * Static regex to pull the x,y values out of an SVG translate() directive.
 * Note that Firefox and IE (9,10) return 'translate(12)' instead of
 * 'translate(12, 0)'.
 * Note that IE (9,10) returns 'translate(16 8)' instead of 'translate(16, 8)'.
 * Note that IE has been reported to return scientific notation (0.123456e-42).
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getRelativeXY.XY_REGEX_ =
/translate\(\s*([-+\d.,e]+)([ ,]\s*([-+\d.,e]+)\s*\))/

/**
 * Static regex to pull the scale values out of a transform style property.
 * Accounts for same exceptions as XY_REGEXP_.
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getScale_REGEXP_ = /scale\(\s*([-+\d.,e]+)\s*\)/

/**
 * Static regex to pull the x,y,z values out of a translate3d() style property.
 * Accounts for same exceptions as XY_REGEXP_.
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getRelativeXY.XY_3D_REGEX_ =
  /transform:\s*translate3d\(\s*([-+\d.,e]+)px([ ,]\s*([-+\d.,e]+)\s*)px([ ,]\s*([-+\d.,e]+)\s*)px\)?/

/**
 * Static regex to pull the x,y,z values out of a translate3d() style property.
 * Accounts for same exceptions as XY_REGEXP_.
 * @type {!RegExp}
 * @private
 */
Blockly.utils.getRelativeXY.XY_2D_REGEX_ =
  /transform:\s*translate\(\s*([-+\d.,e]+)px([ ,]\s*([-+\d.,e]+)\s*)px\)?/
