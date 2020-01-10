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

eYo.require('section')

/**
 * @name {eYo.Draft}
 * Class for a draft board.
 * @param {eYo.Desk | eYo.Flyout | eYo.board} owner Any board belongs to either a desk (the main board), a flyout (the flyout board) or another board (the brick dragger board). We allways have `this === owner.board`, which means that each kind of owner may have only one board.
 * @constructor
 */
eYo.section.makeClass(eYo, 'Draft')