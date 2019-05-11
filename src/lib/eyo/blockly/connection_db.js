/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Extends connection data base.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.ConnectionDB')

goog.require('Blockly.ConnectionDB');

/**
 * Initialize a set of connection DBs for a specified workspace.
 * @param {!Blockly.Workspace} workspace The workspace this DB is for.
 */
Blockly.ConnectionDB.init = (() => {
  var init = Blockly.ConnectionDB.init
  return function(workspace) {
    init(workspace)
    // Create two extra databases, one for each connection type.
    var dbList = workspace.connectionDBList
    dbList[eYo.Const.LEFT_STATEMENT] = new Blockly.ConnectionDB()
    dbList[eYo.Magnet.RIGHT] = new Blockly.ConnectionDB()
  }
})()
