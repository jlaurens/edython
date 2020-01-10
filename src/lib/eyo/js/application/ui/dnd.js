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

eYo.require('c9r')

/**
 * @name{eYo.dnd}
 * @namespace
 */
eYo.provide('dnd')

/**
 * @name{eYo.dnd.Dragger}
 * @namespace
 */
eYo.provide('dnd.dragger')

/**
 * @name{eYo.dnd.Dropper}
 * @namespace
 */
eYo.provide('dnd.dropper')

eYo.forwardDeclare('motion')
eYo.forwardDeclare('driver')

/**
 * @name{eYo.dnd.Mngr}
 * @constructor
 * Main drag and drop manager.
 * It maintains a list of draggers and droppers.
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param{eYo.Motion} [motion] -  the owning motion
 */
eYo.dnd.makeClass('Mngr', eYo.c9r.Owned, {
  init (owner, motion) {
    this.motion_ = motion
    /** the dragger_ that started a drag, not owned */
    this.dragger_ = eYo.NA
    /** The list of draggers_, owned */
    this.draggers_ = [
      new eYo.dnd.Dragger.Board(this),
      new eYo.dnd.Dragger.DraftBoard(this),
      new eYo.dnd.Dragger.LibraryBoard(this),
      new eYo.dnd.Dragger.Brick(this),
      new eYo.dnd.Dragger.DraftBrick(this),
      new eYo.dnd.Dragger.LibraryBrick(this),
    ]
    /** the dropper_ that started a possible drop, not owned */
    this.dropper_ = eYo.NA
    /** The list of droppers, owned */
    this.droppers_ = [
      new eYo.dnd.Dropper.Board(this),
      new eYo.dnd.Dropper.Brick(this),
    ]
  },
  /**
   * Main drag and drop manager.
   * It maintains a list of draggers and droppers
   * * @param{eYo.app.Dflt} [desktop] -  the owning desktop
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

eYo.dnd.Mngr_p.ownedForEach = function (f) {
  eYo.dnd.Mngr_s.OwnedForEach(f)
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
eYo.dnd.Mngr_p.start = function () {
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
eYo.dnd.Mngr_p.update = function () {
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
eYo.dnd.Mngr_p.cancel = function () {
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
eYo.dnd.Mngr_p.reset = function () {
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
eYo.dnd.Mngr_p.complete = function () {
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
 * @param {eYo.dnd.Dragger} dragger
 */
eYo.dnd.Mngr_p.addDragger = function (dragger) {
  this.draggers_.push(dragger)
}

/**
 * Add a dropper.
 */
eYo.dnd.Mngr_p.addDropper = function (dropper) {
  this.droppers_.push(dropper)
}

/*******/

/**
 * @name {eYo.dnd.Dragger.Dflt}
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.dnd.Mngr} manager -  the owning drag and drop manager.
 */
eYo.dnd.Dragger.makeClass('Dflt', eYo.c9r.Owned, {
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
eYo.dnd.Dragger.Dflt_p.start = function () {
  return (this.started_ = true)
}

/**
 * Update a drag operation.
 * @return {Boolean} true if a drag operation did update
 */
eYo.dnd.Dragger.Dflt_p.update = function () {
  return this.started_
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.dnd.Dragger.Dflt_p.cancel = eYo.dnd.Dragger.Dflt_p.update

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.dnd.Dragger.Dflt_p.reset = function () {
  if (this.started_) {
    this.started_ = false
    return true
  }
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.dnd.Dragger.Dflt_p.complete = eYo.dnd.Dragger.Dflt_p.reset

/********/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.dnd.Mngr} manager -  the owning drag and drop manager.
 */
eYo.dnd.Dragger.makeClass('Board')

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.dnd.Dragger.Board_p.start = function () {
  return eYo.dnd.Dragger.Board_s.Start.Call(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.dnd.Dragger.Board_p.update = function () {
  return eYo.dnd.Dragger.Board_s.update.Call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.dnd.Dragger.Board_p.cancel = function () {
  return eYo.dnd.Dragger.Board_s.update.Cancel(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.dnd.Dragger.Board_p.reset = function () {
  return eYo.dnd.Dragger.Board_s.update.reset(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.dnd.Dragger.Board_p.complete = function () {
  return eYo.dnd.Dragger.Board_s.update.Complete(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.dnd.Mngr} manager -  the owning drag and drop manager.
 */
eYo.dnd.Dragger.makeClass('DraftBoard')

/**
 * Sever all the links.
 */
eYo.dnd.Dragger.DraftBoard.prototype.dispose = function () {
  eYo.dnd.Dragger.DraftBoard.SuperProto_.dispose.Call(this)
}

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.dnd.Dragger.DraftBoard.prototype.Start = function () {
  return eYo.dnd.Dragger.DraftBoard.superProto_.Start.Complete(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.dnd.Dragger.DraftBoard.prototype.update = function () {
  return eYo.dnd.Dragger.DraftBoard.SuperProto_.update.Call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.dnd.Dragger.DraftBoard.prototype.Cancel = function () {
  return eYo.dnd.Dragger.DraftBoard.SuperProto_.cancel.Call(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.dnd.Dragger.DraftBoard.prototype.reset = function () {
  return eYo.dnd.Dragger.DraftBoard.SuperProto_.reset.Call(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.dnd.Dragger.DraftBoard.prototype.Complete = function () {
  return eYo.dnd.Dragger.DraftBoard.SuperProto_.complete.Call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.dnd.Mngr} manager -  the owning drag and drop manager.
 */
eYo.dnd.Dragger.makeClass('LibraryBoard')

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.dnd.Dragger.LibraryBoard.prototype.Start = function () {
  return eYo.dnd.Dragger.LibraryBoard.superProto_.Start.Complete(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.dnd.Dragger.LibraryBoard.prototype.update = function () {
  return eYo.dnd.Dragger.LibraryBoard.SuperProto_.update.Call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.dnd.Dragger.LibraryBoard.prototype.Cancel = function () {
  return eYo.dnd.Dragger.LibraryBoard.SuperProto_.cancel.Call(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.dnd.Dragger.LibraryBoard.prototype.reset = function () {
  return eYo.dnd.Dragger.LibraryBoard.SuperProto_.reset.Call(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.dnd.Dragger.LibraryBoard.prototype.Complete = function () {
  return eYo.dnd.Dragger.LibraryBoard.SuperProto_.complete.Call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.dnd.Mngr} manager -  the owning drag and drop manager.
 */
eYo.dnd.Dragger.makeClass('Brick')

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.dnd.Dragger.Brick_p.start = function () {
  return eYo.dnd.Dragger.Brick.superProto_.Start.Call(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.dnd.Dragger.Brick_p.update = function () {
  return eYo.dnd.Dragger.Brick.SuperProto_.update.Call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.dnd.Dragger.Brick_p.cancel = function () {
  return eYo.dnd.Dragger.Brick.SuperProto_.cancel.Call(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.dnd.Dragger.Brick_p.reset = function () {
  return eYo.dnd.Dragger.Brick.SuperProto_.reset.Call(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.dnd.Dragger.Brick_p.complete = function () {
  return eYo.dnd.Dragger.Brick.SuperProto_.complete.Call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.dnd.Mngr} manager -  the owning drag and drop manager.
 */
eYo.dnd.Dragger.makeClass('LibraryBrick')

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.dnd.Dragger.LibraryBrick_p.start = function () {
  return eYo.dnd.Dragger.LibraryBrick.superProto_.Start.Call(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.dnd.Dragger.LibraryBrick_p.update = function () {
  return eYo.dnd.Dragger.LibraryBrick.SuperProto_.update.Call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.dnd.Dragger.LibraryBrick_p.cancel = function () {
  return eYo.dnd.Dragger.LibraryBrick.SuperProto_.cancel.Call(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.dnd.Dragger.LibraryBrick_p.reset = function () {
  return eYo.dnd.Dragger.LibraryBrick.SuperProto_.reset.Call(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.dnd.Dragger.LibraryBrick_p.complete = function () {
  return eYo.dnd.Dragger.LibraryBrick.SuperProto_.complete.Call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.dnd.Mngr} manager -  the owning drag and drop manager.
 */
eYo.dnd.Dragger.makeClass('DraftBrick')

/**
 * Start a drag operation.
 * @return {Boolean} true is a drag operation did start
 */
eYo.dnd.Dragger.DraftBrick_p.start = function () {
  return eYo.dnd.Dragger.DraftBrick.superProto_.Start.Call(this)
}

/**
 * Update a drag operation.
 * @return {Boolean} true is a drag operation did update
 */
eYo.dnd.Dragger.DraftBrick_p.update = function () {
  return eYo.dnd.Dragger.DraftBrick.SuperProto_.update.Call(this)
}

/**
 * Cancel a drag operation.
 * @return {Boolean} true is a drag operation did cancel
 */
eYo.dnd.Dragger.DraftBrick_p.cancel = function () {
  return eYo.dnd.Dragger.DraftBrick.SuperProto_.cancel.Call(this)
}

/**
 * Reset a drag operation.
 * @return {Boolean} true is a drag operation did reset
 */
eYo.dnd.Dragger.DraftBrick_p.reset = function () {
  return eYo.dnd.Dragger.DraftBrick.SuperProto_.reset.Call(this)
}

/**
 * Complete a drag operation.
 * @return {Boolean} true is a drag operation did complete
 */
eYo.dnd.Dragger.DraftBrick_p.complete = function () {
  return eYo.dnd.Dragger.DraftBrick.SuperProto_.complete.Call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.dnd.Mngr} manager -  the owning drag and drop manager.
 */
eYo.dnd.Dropper.makeClass('Dflt', eYo.c9r.Owned, {
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
eYo.dnd.Dropper.Dflt_p.start = function () {
  return (this.started_ = true)
}

/**
 * Update a drop operation.
 * @return {Boolean} true is a drop operation did update
 */
eYo.dnd.Dropper.Dflt_p.update = function () {
  return this.started_
}

/**
 * Cancel a drop operation.
 * @return {Boolean} true is a drop operation did cancel
 */
eYo.dnd.Dropper.Dflt_p.cancel = eYo.dnd.Dropper.Dflt_p.update

/**
 * Reset a drop operation.
 * @return {Boolean} true is a drop operation did reset
 */
eYo.dnd.Dropper.Dflt_p.reset = function () {
  if (this.started_) {
    this.started_ = false
    return true
  }
}

/**
 * Complete a drop operation.
 * @return {Boolean} true is a drop operation did complete
 */
eYo.dnd.Dropper.Dflt_p.complete = eYo.dnd.Dropper.Dflt_p.reset

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.dnd.Mngr} manager -  the owning drag and drop manager.
 */
eYo.dnd.Dropper.makeClass('Board')

/**
 * Start a drop operation.
 * @return {Boolean} true is a drop operation did start
 */
eYo.dnd.Dropper.Board_p.start = function () {
  return eYo.dnd.Dropper.Board_s.Start.Call(this)
}

/**
 * Update a drop operation.
 * @return {Boolean} true is a drop operation did update
 */
eYo.dnd.Dropper.Board_p.update = function () {
  return eYo.dnd.Dropper.Board_s.update.Call(this)
}

/**
 * Cancel a drop operation.
 * @return {Boolean} true is a drop operation did cancel
 */
eYo.dnd.Dropper.Board_p.cancel = function () {
  return eYo.dnd.Dropper.Board_s.cancel.Call(this)
}

/**
 * Reset a drop operation.
 * @return {Boolean} true is a drop operation did reset
 */
eYo.dnd.Dropper.Board_p.reset = function () {
  return eYo.dnd.Dropper.Board_s.reset.Call(this)
}

/**
 * Complete a drop operation.
 * @return {Boolean} true is a drop operation did complete
 */
eYo.dnd.Dropper.Board_p.complete = function () {
  return eYo.dnd.Dropper.Board_s.complete.Call(this)
}

/*******/

/**
 * Main methods, `start`, `update`, `cancel`, `complete` and `reset`.
 * @param {eYo.dnd.Mngr} manager -  the owning drag and drop manager.
 */
eYo.dnd.Dropper.makeClass('Brick')

/**
 * Start a drop operation.
 * @return {Boolean} true is a drop operation did start
 */
eYo.dnd.Dropper.Brick_p.start = function () {
  return eYo.dnd.Dropper.Brick_s.Start.Call(this)
}

/**
 * Update a drop operation.
 * @return {Boolean} true is a drop operation did update
 */
eYo.dnd.Dropper.Brick_p.update = function () {
  return eYo.dnd.Dropper.Brick_s.update.Call(this)
}

/**
 * Cancel a drop operation.
 * @return {Boolean} true is a drop operation did cancel
 */
eYo.dnd.Dropper.Brick_p.cancel = function () {
  return eYo.dnd.Dropper.Brick_s.cancel.Call(this)
}

/**
 * Reset a drop operation.
 * @return {Boolean} true is a drop operation did reset
 */
eYo.dnd.Dropper.Brick_p.reset = function () {
  return eYo.dnd.Dropper.Brick_s.reset.Call(this)
}

/**
 * Complete a drop operation.
 * @return {Boolean} true is a drop operation did complete
 */
eYo.dnd.Dropper.Brick_p.complete = function () {
  return eYo.dnd.Dropper.Brick_s.complete.Call(this)
}

/*******/