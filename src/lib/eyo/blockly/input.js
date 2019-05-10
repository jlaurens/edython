/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Input extension for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Input')

goog.require('eYo')
goog.require('Blockly.Input')

Blockly.Input.prototype.eyo = undefined

/**
 * Sets whether this input is visible or not.
 * Used to collapse/uncollapse a block.
 * Overriden to remve the `style.display` use.
 * Only the display attribute.
 * @param {boolean} visible True if visible.
 * @return {!Array.<!Blockly.Block>} List of blocks to render.
 * @suppress {accessControls}
 */
Blockly.Input.prototype.setVisible = function (visible) {
  var renderList = []
  if (this.visible_ === visible) {
    return renderList
  }
  this.visible_ = visible
  this.fieldRow.forEach(f => f.setVisible(visible))

  if (this.connection) {
    // Has a connection.
    if (visible) {
      renderList = this.connection.unhideAll()
    } else {
      this.connection.hideAll()
    }
    var t_eyo = this.eyo.t_eyo
    t_eyo && t_eyo.ui.setVisible(visible)
  }
  return renderList
}

/**
 * Add an eyo object to an input to store extra information.
 * All this extra information is gathered under a dedicated namespace
 * to avoid name collisions.
 * This is not a delegate because there are few informations or actions needed.
 * Subclassing would not fit here.
 * For edython.
 * @param {!Blockly.Input} input  The delegate's owner.
 */
eYo.Input.setupEyO = function (input) {
  if (!input.eyo) {
    input.eyo = new eYo.InputDelegate(input)
  }
}

/**
 * @param {!Blockly.Input} input  An input instance.
 * @constructor
 */
eYo.InputDelegate = function (input) {
  this.owner = input
  input.eyo = this
  var m4t = this.magnet
  if (m4t) {
    m4t.input = input
  }
}

Object.defineProperties(eYo.InputDelegate.prototype, {
  tile: {
    get () {
      if (!this.tile_) {
        this.updateTile()
      }
      return this.tile_
    }
  },
  magnet: {
    get () {
      var c8n = this.owner.connection
      return c8n && c8n.eyo
    }
  },
  check: {
    set () {
      var m4t = this.magnet
      if (m4t) {
        m4t.check = check
      } else {
        console.error("NO CHECKABLE MAGNET, BREAK HERE")
      }
    }
  },
  name_: { // the name of the input such that checking is fine grained.
    get () {
      return this.owner.name
    }
  },
  b_eyo: {
    get () {
      return this.owner.sourceBlock_.eyo
    }
  },
  t_eyo: {
    get () {
      var m4t = this.magnet
      return m4t && m4t.t_eyo
    }
  },
  bindField: {
    get () {
      var b_eyo = this.b_eyo
      if (b_eyo.wrapped_) {
        return b_eyo.magnets.output.t_eyo.bindField
      }
      var s = this.slot
      return s && s.bindField
    }
  },
  connection: {
    get () {
      return this.owner.connection
    }
  },
  target: { // to be REMOVED?
    get () {
      return this.connection && this.connection.targetBlock()
    }
  }
 })

/**
 * be ready the delegate.
 */
eYo.InputDelegate.prototype.beReady = function () {
  this.beReady = eYo.Do.nothing // one shot function
  this.fields && Object.values(this.fields).forEach(field => {
    field.init()
  })
  var c8n = this.owner.connection
  c8n && c8n.eyo.beReady()
}

/**
 * consolidate the delegate.
 */
eYo.InputDelegate.prototype.getBlock = function () {
  return this.owner.sourceBlock_
}

/**
 * consolidate the delegate.
 */
eYo.InputDelegate.prototype.consolidate = function () {
  var c8n = this.owner.connection
  c8n && c8n.eyo.consolidate(arguments)
}

/**
 * Connect the owner to something.
 * @param{!eYo.Delegate | eYo.Magnet} dm  dm is either a delegate or a magnet.
 */
eYo.InputDelegate.prototype.connect = function (dm) {
  var m4t = this.magnet
  if(m4t && dm) {
    var other = (dm.magnets && dm.magnets.output) || dm
    if (m4t.checkType_(other)) {
      return m4t.connect(other)
    }
  }
}

/**
 * Sets whether this input is visible or not.
 * Used to collapse/uncollapse a block.
 * @param {boolean} visible True if visible.
 * @return {!Array.<!Blockly.Block>} List of blocks to render.
 */
Blockly.Input.prototype.setVisible = (() => {
  var setVisible = Blockly.Input.prototype.setVisible
  return function(visible) {
    if (this.eyo) {
      if (this.visible_ === visible) {
        return []
      }
      this.visible_ = visible
      this.fieldRow.forEach(f => f.setVisible(visible))
      if (this.connection) {
        // Has a connection.
        if (visible) {
          var renderList = this.connection.unhideAll()
        } else {
          this.connection.hideAll()
        }
        var t_eyo = this.connection.eyo.t_eyo
        t_eyo && t_eyo.ui.setVisible(visible)
      }
      return renderList
    }
    return setVisible.call(this, visible)
  }
})()

/**
 * Sever all links to this input.
 * The wrapped_ blocks may not yet be disposed.
 */
Blockly.Input.prototype.dispose = function() {
  this.fieldRow.forEach(f => f.dispose())
  var c8n = this.connection
  if (c8n) {
    c8n.eyo.wrapped_ = null
    var t_eyo = c8n.eyo.t_eyo
    t_eyo && t_eyo.block_.dispose()
    c8n.dispose()
  }
  this.sourceBlock_ = null
}
