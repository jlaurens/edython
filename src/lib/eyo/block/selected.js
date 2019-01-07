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
  var c8n_
  Object.defineProperties(
    me,
    {
      block: {
        get () {
          return eyo_ && eyo_.block_
        },
        set (newValue) {
          eyo_ = newValue && newValue.eyo
        }
      },
      eyo: {
        get () {
          return eyo_
        },
        set (newValue) {
          eyo_ = newValue
        }
      },
      connection: {
        get () {
          return c8n_
        },
        set (connection) {
          var B
          if (connection) {
            if (connection.hidden_) {
              console.error('Do not select a hidden connection')
            }
            var block = connection.getSourceBlock()
            if (block) {
              if (block.eyo.locked_) {
                return
              }
              if (connection === block.previousConnection && connection.targetConnection) {
                connection = connection.targetConnection
                var unwrapped = block = connection.getSourceBlock()
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
          if (connection !== c8n_) {
            if (c8n_) {
              var oldBlock = c8n_.getSourceBlock()
              if (oldBlock) {
                oldBlock.eyo.selectedConnection = null
                oldBlock.eyo.selectedConnectionSource_ = null
                oldBlock.removeSelect()
                if (oldBlock === Blockly.selected) {
                  oldBlock.eyo.updateAllPaths_()
                  oldBlock.addSelect()
                } else if ((B = Blockly.selected)) {
                  B.eyo.selectedConnectionSource_ = null
                  B.removeSelect()
                  B.addSelect()
                }
              }
              c8n_ = null
            }
            if (connection) {
              if ((block = connection.getSourceBlock())) {
                unwrapped = block
                while (unwrapped.eyo.wrapped_) {
                  if (!(unwrapped = unwrapped.getSurroundParent())) {
                    return
                  }
                }
                block.eyo.selectedConnection = c8n_ = connection
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
  // usage: eYo.Selected.isEyo(block)
  me.isEyo = eyo => eyo_ === eyo
  // usage: eYo.Selected.isBlock(block)
  me.isBlock = block => block && (block.eyo === eyo_)
  // usage: eYo.Selected.isConnection(block)
  me.isConnection = c8n => c8n === c8n_
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
