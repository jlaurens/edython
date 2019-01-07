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
                var unwrapped = block = c8n.getSourceBlock()
                do {
                  if (!unwrapped.eyo.wrapped_) {
                    unwrapped.select()
                    unwrapped.bringToFront()
                    break
                  }
                } while ((unwrapped = unwrapped.getSurroundParent()))
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
                  oldBlock.addSelect()
                } else if ((B = block_)) {
                  B.eyo.selectedConnectionSource_ = null
                  B.removeSelect()
                  B.addSelect()
                }
              }
              c8n_ = null
            }
            if (c8n) {
              if ((block = c8n.getSourceBlock())) {
                unwrapped = block
                while (unwrapped.eyo.wrapped_) {
                  if (!(unwrapped = unwrapped.getSurroundParent())) {
                    return
                  }
                }
                block.eyo.selectedConnection = c8n_ = c8n
                unwrapped.eyo.selectedConnectionSource_ = block
                unwrapped.select()
                block.removeSelect()
                block.eyo.updateAllPaths_()
                block.addSelect()
              }
            }
          }
        }
      }
    }
  ),
  return me
})()

/**
 * Convenient property
 */
Object.defineProperties(
  eYo,
  {
    selected: {
      get () {
        return Blockly.selected && Blockly.selected.eyo
      },
      set (newValue) {
        Blockly.selected = newValue && newValue.block_
      }
    }
  }
)

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

