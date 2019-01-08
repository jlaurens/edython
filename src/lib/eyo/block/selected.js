/*
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */

/**
 * @fileoverview utilities for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name eYo.Selected
 * @namespace
 */

goog.provide('eYo.Selected')

goog.require('eYo.DelegateSvg')

eYo.Selected = (() => {
  var me = {}
  var eyo_
  var block_
  var c8n_
  Object.defineProperties(
    me,
    {
      block: {
        get () {
          return block_
        },
        set (newValue) {
          this.eyo = newValue && newValue.eyo
        }
      },
      eyo: {
        get () {
          return eyo_
        },
        set (newValue) {
          if (eyo_ !== newValue) {
            eyo_ = newValue
            block_ = eyo_ && eyo_.block_
            this.connection = null
            if (eyo_) {
              block_.select()
              block_.bringToFront()
            }
          }
        }
      },
      connection: {
        get () {
          return c8n_
        },
        set (c8n) {
          var B
          if (c8n) {
            if (c8n.hidden_) {
              console.error('Do not select a hidden connection')
            }
            var block = c8n.getSourceBlock()
            if (block) {
              if (block.eyo.locked_) {
                return
              }
              if (c8n === block.previousConnection && c8n.targetConnection) {
                c8n = c8n.targetConnection
                var wrapper = c8n.getSourceBlock().eyo.wrapper
                if (!wrapper.wrapped_) {
                  wrapper.block_.select()
                  wrapper.block_.bringToFront()
                }
              }
            }
          }
          if (c8n !== c8n_) {
            if (c8n_) {
              var oldBlock = c8n_.getSourceBlock()
              if (oldBlock) {
                oldBlock.eyo.selectedConnection = null
                oldBlock.eyo.selectedConnectionSource_ = null
                oldBlock.removeSelect()
                if (oldBlock === block_) {
                  oldBlock.eyo.updateAllPaths_()
                  oldBlock.removeSelect()
                } else if (eyo_) {
                  eyo_.selectedConnectionSource_ = null
                  block_.removeSelect()
                }
              }
              c8n_ = null
            }
            if (c8n) {
              var target = c8n.targetBlock()
              if (target) {
                eYo.Selected.block =  target
                return
              }
              var eyo = c8n.eyo.b_eyo
              if (eyo) {
                wrapper = eyo.wrapper
                wrapper.selectedConnection = c8n_ = c8n
                wrapper.selectedConnectionSource_ = block
                wrapper.block_.select()
                wrapper.block_.removeSelect()
                wrapper.updateAllPaths_()
                wrapper.block_.addSelect()
              }
            }
          }
        }
      }
    }
  )
  return me
})()

/**
 * Convenient property
 */
Object.defineProperties(
  Blockly,
  {
    selected: {
      get () {
        return eYo.Selected.block
      },
      set (newValue) {
        eYo.Selected.block = newValue
      }
    }
  }
)

/**
 * Whether the block is selected.
 * Subclassers will override this but won't call it.
 * @param {!Block} block
 * @private
 */
eYo.DelegateSvg.prototype.hasSelect = function () {
  return goog.dom.classlist.contains(this.block_.svgGroup_, 'eyo-select')
}

/**
 * Select this block.  Highlight it visually.
 * Wrapped blocks are not selectable.
 */
eYo.BlockSvg.prototype.select = function () {
  this.eyo.select()
}

/**
 * Select this block.  Highlight it visually.
 * Wrapped blocks are not selectable.
 */
eYo.DelegateSvg.prototype.select = function () {
  if (!this.workspace) {
    return
  }
  if (this.wrapped_) {
    var parent = this.wrapper
    // Wrapped blocks should not be selected.
    if(parent) {
      parent.select()
      return
    }
  }
  if (!this.selectedConnection) {
    if ((parent = this.group)) {
      if (parent.isShort
          && parent !== eYo.Selected.eyo
          && this !== eYo.Selected.eyo) {
        parent.select()
        return
      }
    }
  }
  var more = this.selectedConnection || (this.selectedConnectionSource_ && this.selectedConnectionSource_.eyo.selectedConnection)
  eYo.BlockSvg.superClass_.select.call(this.block_)
  if (more) {
    if (this.svgPathSelect_ && this.svgPathSelect_.parentNode) {
      goog.dom.removeNode(this.svgPathSelect_)
      goog.dom.removeNode(this.svgPathHilight_)
    }
  } else if (this.svgPathSelect_ && !this.svgPathSelect_.parentNode) {
    this.svgGroup_.appendChild(this.svgPathSelect_)
    this.svgGroup_.appendChild(this.svgPathHilight_)
  }
  if (!this.canEdit_) {
    setTimeout(() => {
      this.canEdit_ = true
    }, 10)
  }
}

/**
 * Unselect this block.
 * If there is a selected connection, it is removed.
 * Unselect is used from click handling methods.
 */
eYo.BlockSvg.prototype.unselect = function () {
  eYo.BlockSvg.superClass_.unselect.call(this)
  this.eyo.unselect()
}

/**
 * Unselect this block.
 * If there is a selected connection, it is removed.
 * Unselect is used from click handling methods.
 */
eYo.DelegateSvg.prototype.unselect = function () {
  this.canEdit_ = false
  var B = this.selectedConnectionSource_
  if (B) {
    B.removeSelect()
    B.eyo.selectedConnection = null
    this.selectedConnectionSource_ = null
  }
  this.block_.removeSelect()
  if (this.wrapped_) {
    var parent = this.wrapper
    parent && parent.eyo.unselect()
  }
}

/**
 * Select this block.  Highlight it visually.
 * If there is a selected connection, this connection will be highlighted.
 * If the block is wrapped, the first parent which is not wrapped will be
 * selected.
 * The Blockly method has been completely replaced.
 */
eYo.BlockSvg.prototype.addSelect = function () {
  this.eyo.addSelect()
}

/**
 * Select this block.  Highlight it visually.
 * If there is a selected connection, this connection will be highlighted.
 * The Blockly method has been completely replaced.
 */
eYo.DelegateSvg.prototype.addSelect = function () {
  var g = this.svgGroup_
  if (this.selectedConnection) {
    // guard or rentrant
    if (!this.svgPathConnection_ || this.svgPathConnection_.parentNode) {
      return
    }
    g.appendChild(this.svgPathConnection_)
  } else if (!this.wrapped_ && this.svgPathSelect_) {
    var hasSelectedConnection = this.selectedConnectionSource_ && this.selectedConnectionSource_.eyo.selectedConnection
    if (this.svgPathSelect_.parentNode && hasSelectedConnection) {
      goog.dom.removeNode(this.svgPathSelect_)
      goog.dom.removeNode(this.svgPathHilight_)
    } else if (!this.svgPathSelect_.parentNode && !hasSelectedConnection) {
      g.appendChild(this.svgPathSelect_)
      g.appendChild(this.svgPathHilight_)
    }
  }
  if (goog.dom.classlist.contains(g, 'eyo-select')) {
    return
  }
  goog.dom.classlist.add(g, 'eyo-select')
  if ((g = this.svgContourGroup_)) {
    // maybe that block has not been rendered yet
    goog.dom.classlist.add(g, 'eyo-select')
  }
  // ensure that the svgGroup is the last in the list
  this.block_.bringToFront()
  this.forEachInput((input) => {
    input.fieldRow.forEach((field) => {
      if (goog.isFunction(field.addSelect)) {
        field.addSelect()
      }
    })
  })
  eYo.App.didAddSelect && eYo.App.didAddSelect(this.block_)
}

/**
 * Unselect this block.  Remove its highlighting.
 */
eYo.BlockSvg.prototype.removeSelect = function () {
  this.eyo.removeSelect()
}

/**
 * Unselect this block.  Remove its highlighting.
 */
eYo.BlockSvg.prototype.removeSelect = function () {
  if (this.wrapped_) {
    if (!this.svgPathConnection_ || !this.svgPathConnection_.parentNode) {
      return
    }
  } else {
    if ((!this.svgPathSelect_ || !this.svgPathSelect_.parentNode) &&
      (!this.svgPathConnection_ || !this.svgPathConnection_.parentNode)) {
      if (this.svgGroup_) { // how come that we must test that?
        goog.dom.classlist.remove(this.svgGroup_, 'eyo-select')
      }
      if (this.svgContourGroup_) { // how come that we must test that? because some beReady message was not sent to the correct target
        goog.dom.classlist.remove(this.svgContourGroup_, 'eyo-select')
      }
      return
    }
  }
  if (this.svgGroup_) {
    goog.dom.classlist.remove(this.svgGroup_, 'eyo-select')
  }
  if (this.svgContourGroup_) {
    goog.dom.classlist.remove(this.svgContourGroup_, 'eyo-select')
  }
  if (this.svgPathSelect_ && this.svgPathSelect_.parentNode) {
    goog.dom.removeNode(this.svgPathHilight_)
    goog.dom.removeNode(this.svgPathSelect_)
  }
  if (this.svgPathConnection_ && this.svgPathConnection_.parentNode) {
    goog.dom.removeNode(this.svgPathConnection_)
  }
  var eyo
  if (!this.selectedConnection || ((eyo = eYo.Selected.eyo) && eyo.selectedConnectionSource_ !== this)) {
    goog.dom.removeNode(this.svgPathConnection_)
  }
  this.forEachInput(input => {
    input.fieldRow.forEach(field => {
      if (goog.isFunction(field.removeSelect)) {
        field.removeSelect()
      }
    })
  })
  eYo.App.didRemoveSelect && eYo.App.didRemoveSelect(this.block_)
}
