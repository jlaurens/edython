/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Rendering delegate. Do nothing driver.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo.Do')

goog.provide('eYo.Driver')

goog.forwardDeclare('eYo.Driver.Brick')

/**
 * @name {eYo.Driver}
 * @namespace
 */
eYo.Driver = function() {}

/**
 * Faceless driver manager.
 * @param {eYo.Application} owner
 */
eYo.Driver.Mgr = function (owner) {
  eYo.Driver.Mgr.superClass_.constructor.call(this, owner)
  ;[].forEach(name => {
    this[name] = new eYo.Driver[name]()
  })
}
goog.inherits(eYo.Driver.Mgr, eYo.Owned)

/**
 * Set the location.
 * @param {*} field
 * @param {*} where
 */
eYo.Driver.fieldMoveTo = eYo.Do.nothing

/**
 * The field text will change.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Driver.fieldTextRemove = eYo.Do.nothing

/**
 * Display the field text.
 * @param {!Object} field  the node the driver acts on
 */
eYo.Driver.fieldTextCreate = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Driver.fieldSetVisualAttribute = eYo.Do.nothing

/**
 * Set the visual effects of the field.
 * @param {*} field
 */
eYo.Driver.fieldInlineEditorResize = eYo.Do.nothing

/**
 * Whether the field is displayed.
 * @param {!Object} field  the field to query about
 */
eYo.Driver.fieldDisplayedGet = eYo.Do.nothing

/**
 * Display/hide the given field.
 * @param {!Object} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.fieldDisplayedSet = eYo.Do.nothing

/**
 * Display/hide the given field, according to its `visible` status.
 * @param {!Object} field  the field the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.fieldDisplayedUpdate = eYo.Do.nothing

/**
 * Whether the slot is displayed.
 * @param {!Object} slot  the slot to query about
 */
eYo.Driver.slotDisplayedGet = eYo.Do.nothing

/**
 * Display/hide the given slot.
 * @param {!Object} slot  the slot the driver acts on
 * @param {boolean} yorn
 */
eYo.Driver.slotDisplayedSet = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!eYo.Brick} newParent to be connected.
 */
eYo.Driver.brickParentWillChange = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!eYo.Brick} oldParent replaced.
 */
eYo.Driver.brickParentDidChange = eYo.Do.nothing

/**
 * Prepare the given slot.
 * The default implementation does nothing.
 * @param {!eYo.Slot} slot  slot to be prepared.
 */
eYo.Driver.slotInit = eYo.Do.nothing

/**
 * Dispose of the given slot's rendering resources.
 * Default implementation does nothing.
 * @param {eYo.Slot} slot
 */
eYo.Driver.slotDispose = eYo.Do.nothing

/**
 * Prepare the given label field.
 * The default implementation does nothing.
 * @param {!eYo.Field} field  field to be prepared.
 */
eYo.Driver.fieldInit = eYo.Do.nothing

/**
 * Dispose of the given field's rendering resources.
 * Default implementation does nothing.
 * @param {!Object} field
 */
eYo.Driver.fieldDispose = eYo.Do.nothing

/**
 * Callback at widget disposal.
 * Forwards to the driver.
 * @param {*} field
 */
eYo.Driver.fieldWidgetDisposeCallback = function (field) {
  return eYo.Do.nothing
}

/**
 * Make the given field reserved or not, to emphasize reserved keywords.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.fieldMakeReserved = eYo.Do.nothing

/**
 * Make the given field an error.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.fieldMakeError = eYo.Do.nothing

/**
 * Make the given field a placeholder.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.fieldMakePlaceholder = eYo.Do.nothing

/**
 * Make the given field a comment.
 * The default implementation does nothing.
 * @param {*} field
 * @param {boolean} yorn
 */
eYo.Driver.fieldMakeComment = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickUpdateDisabled = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.blockConnectEffect = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {!Object} menu
 */
eYo.Driver.brickMenuShow = eYo.Do.nothing

/**
 * Hilight the given connection.
 * The default implementation does nothing.
 * @param {*} c_eyo
 */
eYo.Driver.magnetHilight = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickMakeWrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickMakeUnwrapped = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickSendToFront = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickSendToBack = eYo.Do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickAddBrickHilight_ = eYo.Do.nothing

/**
 * Remove the hilight path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickRemoveBrickHilight_ = eYo.Do.nothing

/**
 * Add the select path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickAddSelect_ = eYo.Do.nothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickRemoveSelect_ = eYo.Do.nothing

/**
 * Add the hilight path_.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickAddBlockConnection_ = eYo.Do.nothing

/**
 * Remove the select path.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickRemoveBlockConnection_ = eYo.Do.nothing

/**
 * The svg group has an `eyo-top` class.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickAddStatusTop_ = eYo.Do.nothing

/**
 * The default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickRemoveStatusTop_ = eYo.Do.nothing

/**
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickAddStatusFocus_ = eYo.Do.nothing

/**
 * Reverse `nodeAddStatusFocus_`.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickRemoveStatusFocus_ = eYo.Do.nothing

/**
 * Set the displayed status of the given node.
 * Default implementation does nothing.
 * @param {!Object} node  the node the driver acts on
 * @param {boolean} visible  the expected visibility status
 */
eYo.Driver.brickDisplayedSet = eYo.Do.nothing

/**
 * Make the given field disabled eventually.
 * @param {!Object} node  the node the driver acts on
 */
eYo.Driver.brickUpdateDisabled = eYo.Do.nothing

/**
 * Set the display mode for bricks.
 * @param {!String} mode  The display mode for bocks.
 */
eYo.Driver.setBlockDisplayMode = eYo.Do.nothing

/*******  Focus  *******/
/**
 * Init the main focus manager.
 * @param {!eYo.Focus.Main} mainMgr  The main focus manager
 */
eYo.Driver.focusMainInit = eYo.Do.nothing

/**
 * Init the main focus manager.
 * @param {!eYo.Focus.Main} mainMgr  The main focus manager
 */
eYo.Driver.focusMainDispose = eYo.Do.nothing


/**
 * Init a standard focus manager.
 * @param {!eYo.Focus.Mgr} mgr  The standard focus manager
 */
eYo.Driver.focusMgrInit = eYo.Do.nothing

/**
 * Init a standard focus manager.
 * @param {!eYo.Focus.Mgr} mgr  The standard focus manager
 */
eYo.Driver.focusMgrDispose = eYo.Do.nothing

/**
 * Focus on a board.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a board.
 */
eYo.Driver.focusOnBoard = eYo.Do.nothing

/**
 * Focus off a board.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus off a board.
 */
eYo.Driver.focusOffBoard = eYo.Do.nothing

/**
 * Focus on a board.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a brick.
 */
eYo.Driver.focusOnBrick = eYo.Do.nothing

/**
 * Focus off a brick.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus off a brick.
 */
eYo.Driver.focusOffBrick = eYo.Do.nothing

/**
 * Focus on a field.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a field.
 */
eYo.Driver.focusOnField = eYo.Do.nothing

/**
 * Focus off a field.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus off a field.
 */
eYo.Driver.focusOffField = eYo.Do.nothing

/**
 * Focus on a magnet.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus on a magnet.
 */
eYo.Driver.focusOnMagnet = eYo.Do.nothing

/**
 * Focus off a magnet.
 * @param {!eYo.Focus.Mgr} mgr  The focus manager that should put focus off a magnet.
 */
eYo.Driver.focusOffMagnet = eYo.Do.nothing

/*******  Application *******/

/**
 * Initiate the application UI.
 * @param {!eYo.Application} app  The application we must init the UI of.
 */
eYo.Driver.applicationInit = eYo.Do.nothing

/**
 * Dispose of the application UI.
 * @param {!eYo.DnD.Mgr} mgr  The application we must dispose of the UI of.
 */
eYo.Driver.applicationDispose = eYo.Do.nothing

/*******  DnD *******/

/**
 * Initiate the DnD manager UI.
 * @param {!eYo.DnD.Mgr} mgr  The DnD manager we must init the UI of.
 */
eYo.Driver.dndMgrInit = eYo.Do.nothing

/**
 * Dispose of the DnD manager UI.
 * @param {!eYo.DnD.Mgr} mgr  The DnD manager we must dispose of the UI of.
 */
eYo.Driver.dndMgrDispose = eYo.Do.nothing

/*******  Search *******/

/**
 * Initiate the search UI.
 * @param {!eYo.Search} search  The search controller we must init the UI of.
 */
eYo.Driver.searchInit = eYo.Do.nothing

/**
 * Dispose of the search UI.
 * @param {!eYo.Search} search  The search controller we must dispose of the UI of.
 */
eYo.Driver.searchDispose = eYo.Do.nothing

/**
 * Initiate the search UI.
 * @param {!eYo.Search} search  The search controller we must init the toolbar of.
 */
eYo.Driver.searchToolbarInit = eYo.Do.nothing

/**
 * Dispose of the search UI.
 * @param {!eYo.Search} search  The search controller we must dispose of the toolbar of.
 */
eYo.Driver.searchToolbarDispose = eYo.Do.nothing

/*****  TrashCan  *****/

/**
 * Initiate the trash can UI.
 * @param {!eYo.TrashCan} trashCan  The trash can we must initialize the UI.
 */
eYo.Driver.trashCanInit = eYo.Do.nothing

/**
 * Dispose of the trash can UI.
 * @param {!eYo.TrashCan} trashCan  The trash can we must dispose the UI of.
 */
eYo.Driver.trashCanDispose = eYo.Do.nothing

/**
 * Is the given trash can open.
 * @param {!eYo.TrashCan} trashCan  The trash can we must query.
 */
eYo.Driver.trashCanOpenGet = eYo.Do.nothing

/**
 * Set the given trash can open status.
 * @param {!eYo.TrashCan} trashCan  The trash can we must set.
 * @param {Boolean} torf  The expected value.
 */
eYo.Driver.trashCanOpenSet = eYo.Do.nothing

/**
 * Place the given trash can.
 * @param {!eYo.TrashCan} trashCan  The trash can we must place.
 */
eYo.Driver.trashCanPlace = eYo.Do.nothing

/**
 * Get the given trash can's client rect.
 * @param {!eYo.TrashCan} trashCan  The trash can we must query.
 */
eYo.Driver.trashCanClientRect = eYo.Do.nothing

/*****  Zoomer  *****/

/**
 * Initiate the zoomer UI.
 * @param {!eYo.Zoomer} trashCan  The zoomer we must initialize the UI.
 */
eYo.Driver.zoomerInit = eYo.Do.nothing

/**
 * Dispose of the zoomer UI.
 * @param {!eYo.Zoomer} zoomer  The zoomer we must dispose the UI of.
 */
eYo.Driver.zoomerDispose = eYo.Do.nothing

