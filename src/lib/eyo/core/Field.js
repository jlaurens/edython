/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Field namespace.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Field')

goog.require('eYo.Do')

/**
 * Wraps brick between `Blockly`'s `startCache` and `stopCache`. Will be deprecated because of fixed width font usage.
 * @param {*} try_f
 * @param {*} finally_f
 */
eYo.Field.cacheWrap = eYo.Do.makeWrapper(
  Blockly.Field.startCache,
  Blockly.Field.stopCache
)

/*
function (try_f, finally_f) {
  Blockly.Field.startCache()
  var ans
  try {
    ans = try_f.call(this)
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    Blockly.Field.stopCache()
    // enable first to allow finally_f to eventually fire events
    // or eventually modify `out`
    finally_f && (ans = finally_f.call(this, ans))
    return ans
  }
}
*/