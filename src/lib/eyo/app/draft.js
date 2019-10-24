/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Board model.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

goog.require('eYo.Board')

goog.provide('eYo.Board.Draft')

goog.forwardDeclare('goog.array');
goog.forwardDeclare('goog.math');

goog.forwardDeclare('eYo.Desktop')


/**
 * Class for a draft board.
 * @param {!eYo.Desk | eYo.Flyout | eYo.Board} owner Any board belongs to either a desk (the main board), a flyout (the flyout board) or another board (the brick dragger board). We allways have `this === owner.board`, which means that each kind of owner may have only one board.
 * @constructor
 */
eYo.Board.Draft = function(owner, options) {
  eYo.Board.Draft.superClass_.call(this, owner, options)
}
goog.inherits(eYo.Board.Draft, eYo.Board)