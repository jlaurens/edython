/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name eYo
 * @namespace
 */

goog.provide('eYo.App')

goog.require('eYo.Xml')
goog.require('eYo.App')

eYo.App = Object.create(null)

/**
 * Copy a block onto the local clipboard.
 * @param {!Blockly.Block} block Block to be copied.
 * @private
 */
eYo.App.doCopy = function(optNoNext) {
  var block = Blockly.selected
  if (block) {
    var xmlBlock = eYo.Xml.blockToDom(block, false, optNoNext);
    // Encode start position in XML.
    var xy = block.getRelativeToSurfaceXY();
    xmlBlock.setAttribute('x', block.RTL ? -xy.x : xy.x);
    xmlBlock.setAttribute('y', xy.y);
    Blockly.clipboardXml_ = xmlBlock;
    Blockly.clipboardSource_ = block.workspace;
  }
};
