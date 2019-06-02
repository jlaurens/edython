/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Input extension for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Input')

goog.require('eYo')

goog.require('eYo.Magnet')
goog.forwardDeclare('eYo.Brick')

/**
 * Class for an input with an optional field.
 * @param {number} type The type of the input.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.
 * @param {!eYo.Brick} brick The owner brick of this input.
 * @param {?eYo.Magnet} magnet Optional magnet for this input.
 * @constructor
 */
eYo.Input = function(brick, name, model) {
  this.brick_ = brick
  this.name_ = name
  this.magnet_ = new eYo.Magnet(this, eYo.Magnet.IN, model)
  this.fieldRow_ = []
}

// private properties with default values
Object.defineProperties(eYo.Input.prototype, {
  visible_: { value: true, writable: true },
})

// computed properties
Object.defineProperties(eYo.Input.prototype, {
  /**
   * @readonly
   * @type {!eYo.Brick}
   */
  brick: {
    get () {
      return this.brick_
    }
  },
  /** 
   * @readonly
   * @type {string}
   */
  name: {
    get () {
      return this.name_
    }
  },
  /**
   * @readonly
   * @type {!Array.<!Blockly.Field>}
   */
  fieldRow: {
    get () {
      return this.fieldRow_
    }
  },
  visible: {
    get () {
      return this.visible_
    },
    set (newValue) {
      if (this.visible_ === newValue) {
        return
      }
      this.visible_ = newValue
      this.fieldRow.forEach(f => f.visible = newValue)
      this.magnet && (this.magnet.visible = newValue)
    }
  },
  /**
   * @readonly
   * @property {eYo.Magnet}
   */
  magnet: {
    get () {
      return this.magnet_
    }
  },
  check: {
    set (newValue) {
      var m4t = this.magnet_
      if (m4t) {
        m4t.check = newValue
      } else {
        console.error("NO CHECKABLE MAGNET, BREAK HERE")
      }
    }
  },
  targetBrick: {
    get () {
      var m4t = this.magnet
      return m4t && m4t.targetBrick
    }
  },
  slot: {
    get () {
      return this.slot_
    }
  },
  bindField: {
    get () {
      var brick = this.brick
      if (brick.wrapped_) {
        return brick.out_m.targetBrick.bindField
      }
      var s = this.slot
      return s && s.bindField
    }
  },
  hasUI: {
    get () {
      return this.makeUI === eYo.Do.nothing
    }
  }
})

// Obsolete/forbidden properties
Object.defineProperties(eYo.Input.prototype, {
  eyo: {
    get () {
      throw "BAD DESIGN, BREAK HERE"
    }
  },
  target: {
    get () {
      throw "BAD DESIGN, BREAK HERE"
    }
  },
  connection: {
    get () {
      throw "BAD DESIGN, BREAK HERE"
    }
  },
  /**
   * @readonly
   * @type {number}
   */
  type: {
    get () {
      throw "NO WAY, BREAK HERE"
    }
  },
})

/**
 * Dispose of the receiver and the targets.
 */
eYo.Input.prototype.dispose = function() {
  if (!this.brick_) {
    return
  }
  this.fieldRow_.forEach(f => f.dispose())
  this.fieldRow_ = eYo.VOID
  var m4t = this.magnet_
  m4t.wrapped_ = null
  var t9k = m4t.targetBrick
  t9k && (t9k.dispose())
  m4t.dispose()
  this.magnet_ = eYo.VOID
  this.brick_ = eYo.VOID
}

/**
 * be ready the delegate.
 */
eYo.Input.prototype.makeUI = function () {
  this.makeUI = eYo.Do.nothing // one shot function
  this.fieldRow.forEach(f => f.init())
  var m4t = this.magnet
  m4t && (m4t.makeUI())
}

/**
 * consolidate the delegate.
 */
eYo.Input.prototype.consolidate = function () {
  var m4t = this.magnet
  m4t && (m4t.consolidate.apply(m4t, arguments))
}

/**
 * Connect the owner to something.
 * @param{!eYo.Brick | eYo.Magnet} dm  dm is either a delegate or a magnet.
 */
eYo.Input.prototype.connect = function (dm) {
  var m4t = this.magnet
  if(m4t && dm) {
    var other = (dm.magnets && dm.out_m) || dm
    if (m4t.checkType_(other)) {
      return m4t.connect(other)
    }
  }
}
