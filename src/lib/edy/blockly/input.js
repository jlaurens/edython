/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Input extension for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.Input')

goog.require('edY')
goog.require('Blockly.Input')

/**
 * Add an edy object to an input to store extra information.
 * All this extra information is gathered under a dedicated namespace
 * to avoid name collisions.
 * This is not a delegate because there are few informations or actions needed.
 * Subclassing would not fit here.
 * For edython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
edY.Input.setupEzpData = function (input, data) {
  if (!input.edy) {
    input.edy = {
      fields: {},
      // sealed_: false, // blocks are not sealed
      // s7r_: false,// consolidator, whether the input is a separator
    }
    if (data) {
      goog.mixin(input.edy, data)
    }
    var connection = input.connection
    if (connection) {
      connection.edy.name_ = input.name // the connection remembers the name of the input such that checking is fine grained.
    }  
  }
}

Blockly.Input.prototype.edy = undefined
