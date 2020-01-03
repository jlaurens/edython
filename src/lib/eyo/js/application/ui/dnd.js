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

eYo.require('C9r')

/**
 * @name{eYo.DnD}
 * @namespace
 */
eYo.provide('DnD')

/**
 * @name{eYo.DnD.Dragger}
 * @namespace
 */
eYo.provide('DnD.Dragger')

/**
 * @name{eYo.DnD.Dropper}
 * @namespace
 */
eYo.provide('DnD.Dropper')

eYo.forwardDeclare('Motion')
eYo.forwardDeclare('Driver')

/**
 * @name{eYo.DnD.Mngr}
 * @constructor
 * Main drag and drop manager.
 * It maintains a list of draggers and droppers.
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param{eYo.Motion} [motion] -  the owning motion
 */
eYo.DnD.makeClass('Mngr', eYo.C9r.Owned, {
  init (owner, motion) {
    this.motion_ = motion
    /** the dragger_ that started a drag, not owned */
    this.dragger_ = eYo.NA
    /** The list of draggers_, owned */
    this.draggers_ = [
      new eYo.DnD.Dragger.Board(this),
      new eYo.DnD.Dragger.DraftBoard(this),
      new eYo.DnD.Dragger.LibraryBoard(this),
      new eYo.DnD.Dragger.Brick(this),
      new eYo.DnD.Dragger.DraftBrick(this),
      new eYo.DnD.Dragger.LibraryBrick(this),
    ]
    /** the dropper_ that started a possible drop, not owned */
    this.dropper_ = eYo.NA
    /** The list of droppers, owned */
    this.droppers_ = [
      new eYo.DnD.Dropper.Board(this),
      new eYo.DnD.Dropper.Brick(this),
    ]
  },
  /**
   * Main drag and drop manager.
   * It maintains a list of draggers and droppers
   * * @param{eYo.Application} [desktop] -  the owning desktop
   */
  dispose (dispose) {
    this.cancel()
    dispose()
    this.draggers_.length = 0
    this.draggers_ = eYo.NA
    this.droppers_.length = 0
    this.droppers_ = eYo.NA
  },
  owned: 'motion',
  valued: 'dragger',
  computed: {
    ui_driver_mngr () {
      if (!this.motion) {
        console.error('BREAK HERE!')
      }
      return this.motion.ui_driver_mngr
    },
    active_ () {
      return !!this.dragger_
    },
  }
})

eYo.DnD.Mngr_p.ownedForEach = function (f) {
  eYo.DnD.Mngr_s.ownedForEach(f)
  if (!this.draggers_) {
    console.error('BREAK HERE!!!')
  }
  this.draggers_.foreach(d => d.dispose())
  this.droppers_.foreach(d => d.dispose())
}
/**
 * Ask one of its draggers to initate a dragging operation.
 * @return {Boolean} Whether a drag operation did start.
 */
eYo.DnD.Mngr_p.start = function () {
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
eYo.DnD.Mngr_p.update = function () {
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
eYo.DnD.Mngr_p.cancel = function () {
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
eYo.DnD.Mngr_p.reset = function () {
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
eYo.DnD.Mngr_p.complete = function () {
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
 * @param {eYo.DnD.Dragger} dragger
 */
eYo.DnD.Mngr_p.addDragger = function (dragger) {
  this.draggers_.push(dragger)
}

/**
 * Add a dropper.
 */
eYo.DnD.Mngr_p.addDropper = function (dropper) {
  this.droppers_.push(dropper)
}

/*******/

/**
 * @name {eYo.DnD.Dragger.Dflt}
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mngr} manager -  the owning drag and drop manager.
 */
eYo.DnD.Dragger.makeClass('Dflt', eYo.C9r.Owned, {
  /**
   * Sever all the links.
   */
  dispose () {
    this.cancel()
  },
  computed: {
    manager () {
      return this.owner__
    },
    motion () {
      return this.manager.motion_
    },
    /**
     * Whether started
     */
    started: false,
  },
})

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.DnD.Dragger.Dflt_p.start = function () {
  return (this.started_ = true)
}

/**
 * Update a drag operation.
 * @return {Boolean} true if a drag operation did update
 */
eYo.DnD.Dragger.Dflt_p.update = function () {
  return this.started_
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.DnD.Dragger.Dflt_p.cancel = eYo.DnD.Dragger.Dflt_p.update

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.DnD.Dragger.Dflt_p.reset = function () {
  if (this.started_) {
    this.started_ = false
    return true
  }
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.DnD.Dragger.Dflt_p.complete = eYo.DnD.Dragger.Dflt_p.reset

/********/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mngr} manager -  the owning drag and drop manager.
 */
eYo.DnD.Dragger.makeClass('Board')

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.DnD.Dragger.Board_p.start = function () {
  return eYo.DnD.Dragger.Board_s.start.call(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.DnD.Dragger.Board_p.update = function () {
  return eYo.DnD.Dragger.Board_s.update.call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.DnD.Dragger.Board_p.cancel = function () {
  return eYo.DnD.Dragger.Board_s.update.cancel(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.DnD.Dragger.Board_p.reset = function () {
  return eYo.DnD.Dragger.Board_s.update.reset(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.DnD.Dragger.Board_p.complete = function () {
  return eYo.DnD.Dragger.Board_s.update.complete(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mngr} manager -  the owning drag and drop manager.
 */
eYo.DnD.Dragger.makeClass('DraftBoard')

/**
 * Sever all the links.
 */
eYo.DnD.Dragger.DraftBoard.prototype.dispose = function () {
  eYo.DnD.Dragger.DraftBoard.superProto_.dispose.call(this)
}

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.DnD.Dragger.DraftBoard.prototype.start = function () {
  return eYo.DnD.Dragger.DraftBoard.superProto_.start.complete(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.DnD.Dragger.DraftBoard.prototype.update = function () {
  return eYo.DnD.Dragger.DraftBoard.superProto_.update.call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.DnD.Dragger.DraftBoard.prototype.cancel = function () {
  return eYo.DnD.Dragger.DraftBoard.superProto_.cancel.call(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.DnD.Dragger.DraftBoard.prototype.reset = function () {
  return eYo.DnD.Dragger.DraftBoard.superProto_.reset.call(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.DnD.Dragger.DraftBoard.prototype.complete = function () {
  return eYo.DnD.Dragger.DraftBoard.superProto_.complete.call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mngr} manager -  the owning drag and drop manager.
 */
eYo.DnD.Dragger.makeClass('LibraryBoard')

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.DnD.Dragger.LibraryBoard.prototype.start = function () {
  return eYo.DnD.Dragger.LibraryBoard.superProto_.start.complete(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.DnD.Dragger.LibraryBoard.prototype.update = function () {
  return eYo.DnD.Dragger.LibraryBoard.superProto_.update.call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.DnD.Dragger.LibraryBoard.prototype.cancel = function () {
  return eYo.DnD.Dragger.LibraryBoard.superProto_.cancel.call(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.DnD.Dragger.LibraryBoard.prototype.reset = function () {
  return eYo.DnD.Dragger.LibraryBoard.superProto_.reset.call(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.DnD.Dragger.LibraryBoard.prototype.complete = function () {
  return eYo.DnD.Dragger.LibraryBoard.superProto_.complete.call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mngr} manager -  the owning drag and drop manager.
 */
eYo.DnD.Dragger.makeClass('Brick')

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.DnD.Dragger.Brick_p.start = function () {
  return eYo.DnD.Dragger.Brick.superProto_.start.call(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.DnD.Dragger.Brick_p.update = function () {
  return eYo.DnD.Dragger.Brick.superProto_.update.call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.DnD.Dragger.Brick_p.cancel = function () {
  return eYo.DnD.Dragger.Brick.superProto_.cancel.call(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.DnD.Dragger.Brick_p.reset = function () {
  return eYo.DnD.Dragger.Brick.superProto_.reset.call(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.DnD.Dragger.Brick_p.complete = function () {
  return eYo.DnD.Dragger.Brick.superProto_.complete.call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mngr} manager -  the owning drag and drop manager.
 */
eYo.DnD.Dragger.makeClass('LibraryBrick')

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.DnD.Dragger.LibraryBrick_p.start = function () {
  return eYo.DnD.Dragger.LibraryBrick.superProto_.start.call(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.DnD.Dragger.LibraryBrick_p.update = function () {
  return eYo.DnD.Dragger.LibraryBrick.superProto_.update.call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.DnD.Dragger.LibraryBrick_p.cancel = function () {
  return eYo.DnD.Dragger.LibraryBrick.superProto_.cancel.call(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.DnD.Dragger.LibraryBrick_p.reset = function () {
  return eYo.DnD.Dragger.LibraryBrick.superProto_.reset.call(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.DnD.Dragger.LibraryBrick_p.complete = function () {
  return eYo.DnD.Dragger.LibraryBrick.superProto_.complete.call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mngr} manager -  the owning drag and drop manager.
 */
eYo.DnD.Dragger.makeClass('DraftBrick')

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.DnD.Dragger.DraftBrick_p.start = function () {
  return eYo.DnD.Dragger.DraftBrick.superProto_.start.call(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.DnD.Dragger.DraftBrick_p.update = function () {
  return eYo.DnD.Dragger.DraftBrick.superProto_.update.call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.DnD.Dragger.DraftBrick_p.cancel = function () {
  return eYo.DnD.Dragger.DraftBrick.superProto_.cancel.call(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.DnD.Dragger.DraftBrick_p.reset = function () {
  return eYo.DnD.Dragger.DraftBrick.superProto_.reset.call(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.DnD.Dragger.DraftBrick_p.complete = function () {
  return eYo.DnD.Dragger.DraftBrick.superProto_.complete.call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mngr} manager -  the owning drag and drop manager.
 */
eYo.DnD.Dropper.makeClass('Dflt', eYo.C9r.Owned, {
  /**
   * Sever all the links.
   */
  dispose () {
    this.cancel()
  },
  computed: {
    motion () {
      return this.manager.motion_
    },
    /**
     * Whether started
     */
    started: {
      value: false
    }
  },
})

/**
 * Start a drop operation.
 * @return {Boolean} true is a drop operation did start
 */
eYo.DnD.Dropper.Dflt_p.start = function () {
  return (this.started_ = true)
}

/**
 * Update a drop operation.
 * @return {Boolean} true is a drop operation did update
 */
eYo.DnD.Dropper.Dflt_p.update = function () {
  return this.started_
}

/**
 * Cancel a drop operation.
 * @return {Boolean} true is a drop operation did cancel
 */
eYo.DnD.Dropper.Dflt_p.cancel = eYo.DnD.Dropper.Dflt_p.update

/**
 * Reset a drop operation.
 * @return {Boolean} true is a drop operation did reset
 */
eYo.DnD.Dropper.Dflt_p.reset = function () {
  if (this.started_) {
    this.started_ = false
    return true
  }
}

/**
 * Complete a drop operation.
 * @return {Boolean} true is a drop operation did complete
 */
eYo.DnD.Dropper.Dflt_p.complete = eYo.DnD.Dropper.Dflt_p.reset

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mngr} manager -  the owning drag and drop manager.
 */
eYo.DnD.Dropper.makeClass('Board')

/**
 * Start a drop operation.
 * @return {Boolean} true is a drop operation did start
 */
eYo.DnD.Dropper.Board_p.start = function () {
  return eYo.DnD.Dropper.Board_s.start.call(this)
}

/**
 * Update a drop operation.
 * @return {Boolean} true is a drop operation did update
 */
eYo.DnD.Dropper.Board_p.update = function () {
  return eYo.DnD.Dropper.Board_s.update.call(this)
}

/**
 * Cancel a drop operation.
 * @return {Boolean} true is a drop operation did cancel
 */
eYo.DnD.Dropper.Board_p.cancel = function () {
  return eYo.DnD.Dropper.Board_s.cancel.call(this)
}

/**
 * Reset a drop operation.
 * @return {Boolean} true is a drop operation did reset
 */
eYo.DnD.Dropper.Board_p.reset = function () {
  return eYo.DnD.Dropper.Board_s.reset.call(this)
}

/**
 * Complete a drop operation.
 * @return {Boolean} true is a drop operation did complete
 */
eYo.DnD.Dropper.Board_p.complete = function () {
  return eYo.DnD.Dropper.Board_s.complete.call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.DnD.Mngr} manager -  the owning drag and drop manager.
 */
eYo.DnD.Dropper.makeClass('Brick')

/**
 * Start a drop operation.
 * @return {Boolean} true is a drop operation did start
 */
eYo.DnD.Dropper.Brick_p.start = function () {
  return eYo.DnD.Dropper.Brick_s.start.call(this)
}

/**
 * Update a drop operation.
 * @return {Boolean} true is a drop operation did update
 */
eYo.DnD.Dropper.Brick_p.update = function () {
  return eYo.DnD.Dropper.Brick_s.update.call(this)
}

/**
 * Cancel a drop operation.
 * @return {Boolean} true is a drop operation did cancel
 */
eYo.DnD.Dropper.Brick_p.cancel = function () {
  return eYo.DnD.Dropper.Brick_s.cancel.call(this)
}

/**
 * Reset a drop operation.
 * @return {Boolean} true is a drop operation did reset
 */
eYo.DnD.Dropper.Brick_p.reset = function () {
  return eYo.DnD.Dropper.Brick_s.reset.call(this)
}

/**
 * Complete a drop operation.
 * @return {Boolean} true is a drop operation did complete
 */
eYo.DnD.Dropper.Brick_p.complete = function () {
  return eYo.DnD.Dropper.Brick_s.complete.call(this)
}

/*******/