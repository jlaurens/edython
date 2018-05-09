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

goog.provide('eYo.Input')

goog.require('eYo')
goog.require('Blockly.Input')

/**
 * Add an eyo object to an input to store extra information.
 * All this extra information is gathered under a dedicated namespace
 * to avoid name collisions.
 * This is not a delegate because there are few informations or actions needed.
 * Subclassing would not fit here.
 * For edython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
eYo.Input.setupEdY = function () {
  var beReady = function() {
    var c8n = this.owner.connection
    c8n && c8n.eyo.beReady()
  }
  return function (input) {
    if (!input.eyo) {
      input.eyo = {
        owner: input,
        beReady: beReady,
      }
      var c8n = input.connection
      if (c8n) {
        c8n.eyo.name_ = input.name // the connection remembers the name of the input such that checking is fine grained.
      }  
    }
  }
} ()

Blockly.Input.prototype.eyo = undefined
