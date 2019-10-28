/*
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview Dragger for bricks, boards and other object. A motion has a dragger in order to drag bricks and text around.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.require('eYo')
goog.provide('eYo.DnD')

goog.forwardDeclare('eYo.Motion')

eYo.DnD = Object.create(null)

/**
 * Main drag and drop manager.
 * It maintains a list of droppers.
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param{!eYo.Motion} motion,  the owning motion
 */
eYo.DnD.Mgr = function (motion) {
  this.motion_ = motion
  /** the dragger_ that started a drag, not owned */
  this.dragger_ = null
  /** The list of draggers_, owned */
  this.draggers_ = [
    new eYo.DnD.Dragger.Board(this),
    new eYo.DnD.Dragger.FlyoutBoard(this),
    new eYo.DnD.Dragger.Brick(this),
    new eYo.DnD.Dragger.FlyoutBrick(this),
  ]
  /** the dropper_ that started a possible drop, not owned */
  this.dropper_ = null
  /** The list of droppers, owned */
  this.droppers_ = [
    new eYo.DnD.Dropper.Board(this),
    new eYo.DnD.Dropper.Brick(this),
  ]
}

Object.defineProperties(eYo.DnD.Mgr.prototype, {
  active_: {
    get () {
      return !!this.dragger_
    }
  }
})

/**
 * Main drag and drop manager.
 * It maintains a list of draggers and droppers
 * * @param{!eYo.Desktop} desktop,  the owning desktop
 */
eYo.DnD.Mgr.prototype.dispose = function () {
  this.cancel()
  this.draggers_.foreach(d => d.dispose())
  this.draggers_ = null
  this.droppers_.foreach(d => d.dispose())
  this.droppers_ = null
  this.motion_ = null
}

/**
 * Ask one of its draggers to initate a dragging operation.
 * @return {Boolean} Whether a drag operation did start.
 */
eYo.DnD.Mgr.prototype.start = function () {
  this.cancel()
  if ((this.dragger_ = this.draggers_.some(d => d.start()))) {
    return this.update()
  }
}

/**
 * Update a dragging operation.
 * Forwards to the current dragger, then to all its droppers.
 * @return {Boolean} Whether a drag operation did update.
 */
eYo.DnD.Mgr.prototype.update = function () {
  if (this.dragger_) {
    this.dragger_.update()
    this.droppers_.forEach(d => d.update())
    this.dropper_ = this.droppers_.some(d => d.start())
    return true
  }
}

/**
 * Cancel a dragging operation.
 * Forwards to the current dragger.
 * @return {Boolean} Whether a drag operation did cancel.
 */
eYo.DnD.Mgr.prototype.cancel = function () {
  if (this.dragger_) {
    this.dragger_.cancel()
    this.droppers_.foreach(d => d.cancel())
    this.dragger_ = this.dropper_ = null
    return true
  }
}

/**
 * Reset a dragging operation.
 * Forwards to the current dragger.
 * @return {Boolean} Whether a drag operation did reset.
 */
eYo.DnD.Mgr.prototype.reset = function () {
  if (this.dragger_) {
    this.dragger_.reset()
    this.droppers_.foreach(d => d.reset())
    this.dragger_ = this.dropper_ = null
    return true
  }
}

/**
 * Conclude a dragging operation.
 * Forwards to the current dragger, then to all its droppers.
 * @return {Boolean} Whether a drag operation did complete.
 */
eYo.DnD.Mgr.prototype.complete = function () {
  if (this.dragger_) {
    this.droppers_.foreach(d => d.update())
    this.dropper_.complete()
    this.dragger_.complete()
    this.reset()
    return true
  }
}

/**
 * Add a dragger.
 * @param {!eYo.DnD.Dragger} dragger
 */
eYo.DnD.Mgr.prototype.addDragger = function (dragger) {
  this.draggers_.push(dragger)
}

/**
 * Add a dropper.
 */
eYo.DnD.Mgr.prototype.addDropper = function (dropper) {
  this.droppers_.push(dropper)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Dragger} manager,  the owning drag and drop manager.
 */
eYo.DnD.Dragger = function (manager) {
  this.manager_ = manager
}

/**
 * Sever all the links.
 */
eYo.DnD.Dragger.prototype.dispose = function () {
  this.cancel()
  this.manager_ = null
}

Object.defineProperties(eYo.DnD.Dragger.prototype, {
  motion_: {
    get () {
      return this.manager_.motion_
    }
  },
  /**
   * Whether started
   */
  started_: {
    value: false
  }
})

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.DnD.Dragger.prototype.start = function () {
  return (this.started_ = true)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.DnD.Dragger.prototype.update = function () {
  return this.started_
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.DnD.Dragger.prototype.cancel = eYo.DnD.Dragger.prototype.update

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.DnD.Dragger.prototype.reset = function () {
  if (this.started_) {
    this.started_ = false
    return true
  }
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.DnD.Dragger.prototype.complete = eYo.DnD.Dragger.prototype.reset

/********/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mgr} manager,  the owning drag and drop manager.
 */
eYo.DnD.Dragger.Board = function (manager) {
  eYo.DnD.Dragger.Board.superClass_.constructor.call(this, manager)
}
goog.inherits(eYo.DnD.Dragger.Board, eYo.DnD.Dragger)
/**
 * Sever all the links.
 */
eYo.DnD.Dragger.Board.prototype.dispose = function () {
  eYo.DnD.Dragger.Board.superClass_.dispose.call(this)
}

Object.defineProperties(eYo.DnD.Dragger.Board.prototype, {
})

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.DnD.Dragger.Board.prototype.start = function () {
  return eYo.DnD.Dragger.Board.superClass_.start.call(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.DnD.Dragger.Board.prototype.update = function () {
  return eYo.DnD.Dragger.Board.superClass_.update.call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.DnD.Dragger.Board.prototype.cancel = function () {
  return eYo.DnD.Dragger.Board.superClass_.update.cancel(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.DnD.Dragger.Board.prototype.reset = function () {
  return eYo.DnD.Dragger.Board.superClass_.update.reset(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.DnD.Dragger.Board.prototype.complete = function () {
  return eYo.DnD.Dragger.Board.superClass_.update.complete(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mgr} manager,  the owning drag and drop manager.
 */
eYo.DnD.Dragger.FlyoutBoard = function (manager) {
  eYo.DnD.Dragger.FlyoutBoard.superClass_.constructor.call(this, manager)
}
goog.inherits(eYo.DnD.Dragger.FlyoutBoard, eYo.DnD.Dragger)

/**
 * Sever all the links.
 */
eYo.DnD.Dragger.FlyoutBoard.prototype.dispose = function () {
  eYo.DnD.Dragger.FlyoutBoard.superClass_.dispose.call(this)
}

Object.defineProperties(eYo.DnD.Dragger.FlyoutBoard.prototype, {
})

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.DnD.Dragger.FlyoutBoard.prototype.start = function () {
  return eYo.DnD.Dragger.FlyoutBoard.superClass_.start.complete(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.DnD.Dragger.FlyoutBoard.prototype.update = function () {
  return eYo.DnD.Dragger.FlyoutBoard.superClass_.update.call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.DnD.Dragger.FlyoutBoard.prototype.cancel = function () {
  return eYo.DnD.Dragger.FlyoutBoard.superClass_.cancel.call(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.DnD.Dragger.FlyoutBoard.prototype.reset = function () {
  return eYo.DnD.Dragger.FlyoutBoard.superClass_.reset.call(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.DnD.Dragger.FlyoutBoard.prototype.complete = function () {
  return eYo.DnD.Dragger.FlyoutBoard.superClass_.complete.call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mgr} manager,  the owning drag and drop manager.
 */
eYo.DnD.Dragger.Brick = function (manager) {
  eYo.DnD.Dragger.Brick.superClass_.constructor.call(this, manager)
}
goog.inherits(eYo.DnD.Dragger.Brick, eYo.DnD.Dragger)

/**
 * Sever all the links.
 */
eYo.DnD.Dragger.Brick.prototype.dispose = function () {
  eYo.DnD.Dragger.Board.superClass_.dispose.call(this)
}

Object.defineProperties(eYo.DnD.Dragger.Brick.prototype, {
})

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.DnD.Dragger.Brick.prototype.start = function () {
  return eYo.DnD.Dragger.Brick.superClass_.start.call(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.DnD.Dragger.Brick.prototype.update = function () {
  return eYo.DnD.Dragger.Brick.superClass_.update.call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.DnD.Dragger.Brick.prototype.cancel = function () {
  return eYo.DnD.Dragger.Brick.superClass_.cancel.call(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.DnD.Dragger.Brick.prototype.reset = function () {
  return eYo.DnD.Dragger.Brick.superClass_.reset.call(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.DnD.Dragger.Brick.prototype.complete = function () {
  return eYo.DnD.Dragger.Brick.superClass_.complete.call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mgr} manager,  the owning drag and drop manager.
 */
eYo.DnD.Dragger.FlyoutBrick = function (manager) {
  eYo.DnD.Dragger.FlyoutBrick.superClass_.constructor.call(this, manager)
}
goog.inherits(eYo.DnD.Dragger.Board, eYo.DnD.Dragger)

/**
 * Sever all the links.
 */
eYo.DnD.Dragger.FlyoutBrick.prototype.dispose = function () {
  eYo.DnD.Dragger.FlyoutBrick.superClass_.dispose.call(this)
}

Object.defineProperties(eYo.DnD.Dragger.FlyoutBrick.prototype, {
})

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.DnD.Dragger.FlyoutBrick.prototype.start = function () {
  return eYo.DnD.Dragger.FlyoutBrick.superClass_.start.call(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.DnD.Dragger.FlyoutBrick.prototype.update = function () {
  return eYo.DnD.Dragger.FlyoutBrick.superClass_.update.call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.DnD.Dragger.FlyoutBrick.prototype.cancel = function () {
  return eYo.DnD.Dragger.FlyoutBrick.superClass_.cancel.call(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.DnD.Dragger.FlyoutBrick.prototype.reset = function () {
  return eYo.DnD.Dragger.FlyoutBrick.superClass_.reset.call(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.DnD.Dragger.FlyoutBrick.prototype.complete = function () {
  return eYo.DnD.Dragger.FlyoutBrick.superClass_.complete.call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Dropper} manager,  the owning drag and drop manager.
 */
eYo.DnD.Dropper = function (manager) {
  this.manager_ = manager
}

/**
 * Sever all the links.
 */
eYo.DnD.Dropper.prototype.dispose = function () {
  this.manager_ = null
}

Object.defineProperties(eYo.DnD.Dropper.prototype, {
  motion_: {
    get () {
      return this.manager_.motion_
    }
  },
  started_: {
    value: false
  },
})

/**
 * Start a drop operation.
 * @return {Boolean} true is a drop operation did start
 */
eYo.DnD.Dropper.prototype.start = function () {
  return (this.started_ = true)
}

/**
 * Update a drop operation.
 * @return {Boolean} true is a drop operation did update
 */
eYo.DnD.Dropper.prototype.update = function () {
  return this.started_
}

/**
 * Cancel a drop operation.
 * @return {Boolean} true is a drop operation did cancel
 */
eYo.DnD.Dropper.prototype.cancel = eYo.DnD.Dropper.prototype.update

/**
 * Reset a drop operation.
 * @return {Boolean} true is a drop operation did reset
 */
eYo.DnD.Dropper.prototype.reset = function () {
  if (this.started_) {
    this.started_ = false
    return true
  }
}

/**
 * Complete a drop operation.
 * @return {Boolean} true is a drop operation did complete
 */
eYo.DnD.Dropper.prototype.complete = eYo.DnD.Dropper.prototype.reset

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Dropper} manager,  the owning drag and drop manager.
 */
eYo.DnD.Dropper.Board = function (manager) {
  eYo.DnD.Dropper.Board.superClass_.constructor.call(this, manager)
}
goog.inherits(eYo.DnD.Dropper.Board, eYo.DnD.Dropper)

/**
 * Sever all the links.
 */
eYo.DnD.Dropper.Board.prototype.dispose = function () {
  this.cancel()
  eYo.DnD.Dropper.Board.superClass_.dispose.call(this, manager)
}

Object.defineProperties(eYo.DnD.Dropper.Board.prototype, {
})

/**
 * Start a drop operation.
 * @return {Boolean} true is a drop operation did start
 */
eYo.DnD.Dropper.Board.prototype.start = function () {
  return eYo.DnD.Dropper.Board.superClass_.start.call(this)
}

/**
 * Update a drop operation.
 * @return {Boolean} true is a drop operation did update
 */
eYo.DnD.Dropper.Board.prototype.update = function () {
  return eYo.DnD.Dropper.Board.superClass_.update.call(this)
}

/**
 * Cancel a drop operation.
 * @return {Boolean} true is a drop operation did cancel
 */
eYo.DnD.Dropper.Board.prototype.cancel = function () {
  return eYo.DnD.Dropper.Board.superClass_.cancel.call(this)
}

/**
 * Reset a drop operation.
 * @return {Boolean} true is a drop operation did reset
 */
eYo.DnD.Dropper.Board.prototype.reset = function () {
  return eYo.DnD.Dropper.Board.superClass_.reset.call(this)
}

/**
 * Complete a drop operation.
 * @return {Boolean} true is a drop operation did complete
 */
eYo.DnD.Dropper.Board.prototype.complete = function () {
  return eYo.DnD.Dropper.Board.superClass_.complete.call(this)
}

/*******/