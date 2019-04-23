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
    input.connection && (input.connection.eyo.input = input)
  }
}

/**
 * @param {!Blockly.Input} input  An input instance.
 * @constructor
 */
eYo.InputDelegate = function (input) {
  this.owner = input
  var c8n = input.connection
  if (c8n) {
    c8n.eyo.name_ = input.name // the connection remembers the name of the input such that checking is fine grained.
  }
  input.eyo = this
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
  connection: {
    get () {
      return this.owner.connection
    }
  },
  target: {
    get () {
      return this.connection && this.connection.targetBlock()
    }
  },
  t_eyo: {
    get () {
      var b = this.target
      return b && b.eyo
    }
  },
  bindField: {
    get () {
      var block = this.owner.sourceBlock_
      if (block.eyo.wrapped_) {
        return block.outputConnection.targetConnection.eyo.bindField
      }
      var s = this.slot
      return s && s.bindField
    }
  }
})

/**
 * be ready the delegate.
 */
eYo.InputDelegate.prototype.beReady = function () {
  this.beReady = eYo.Do.nothing // one shot function
  var block = this.getBlock()
  this.fields && Object.values(this.fields).forEach(field => {
    if (!field.sourceBlock_) {
      field.setSourceBlock(block)
      field.init()
    }
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
 * @param{!Object} something  Something is either an object with an output connection, the delegate of such an object, a connection
 */
eYo.InputDelegate.prototype.connect = function (something) {
  var c8n = this.owner.connection
  if(c8n && something) {
    var other = something.outputConnection || (something.block_ && something.block_.outputConnection) || something
    if (c8n.checkType_(other)) {
      c8n.eyo.connect(other)
      return true
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
      if (this.visible_ == visible) {
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
        var t_eyo = this.connection.c_eyo.t_eyo
        if (t_eyo) {
          t_eyo.ui.setVisible(visible)
          if (!visible) {
            t_eyo.block_.rendered = false
          }
        }
      }
      return renderList
    }
    return setVisible.call(this, visible)
  }
})()

/**
 * Prepare this slot for rendering.
 * No data change.
 */
eYo.InputDelegate.prototype.renderBeReady = function () {
  this.renderBeReady = eYo.Do.nothing // one shot function
  this.connection.eyo.renderBeReady()
}
