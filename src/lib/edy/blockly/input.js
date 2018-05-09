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
edY.Input.setupEdY = function () {
  var beReady = function() {
    var c8n = this.owner.connection
    c8n && c8n.edy.beReady()
  }
  return function (input) {
    if (!input.edy) {
      input.edy = {
        owner: input,
        beReady: beReady,
      }
      var c8n = input.connection
      if (c8n) {
        c8n.edy.name_ = input.name // the connection remembers the name of the input such that checking is fine grained.
      }  
    }
  }
} ()

Blockly.Input.prototype.edy = undefined
