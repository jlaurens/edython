/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Draw controller.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Draw')

goog.require('eYo.DelegateSvg')
// goog.require('goog.dom')

/**
 * Draw controller.
 */

 /**
 * Whether the block is selected.
 * Subclassers will override this but won't call it.
 * @param {!Object} eyo
 * @private
 */
eYo.Draw.hasSelect = function (eyo) {
  return goog.dom.classlist.contains(eyo.svgGroup_, 'eyo-select')
}

/**
 * Add the hilight path_.
 * @param {!Object} eyo Block delegate.
 */
eYo.Draw.addBlockHilight_ = eyo => {
  if (!eyo.svgPathHilight_.parentNode) {
    eyo.svgGroup_.appendChild(eyo.svgPathHilight_)
  }
}

/**
 * Add the select path.
 * @param {!Object} eyo Block delegate.
 */
eYo.Draw.addBlockSelect_ = eyo => {
  if (!eyo.svgPathSelect_.parentNode) {
    if (eyo.svgPathHilight_.parentNode) {
      eyo.svgGroup_.insertBefore(eyo.svgPathSelect_, eyo.svgPathHilight_)
    } else if (eyo.svgPathConnection_.parentNode) {
      eyo.svgGroup_.insertBefore(eyo.svgPathSelect_, eyo.svgPathConnection_)
    } else {
      eyo.svgGroup_.appendChild(eyo.svgPathSelect_)
    }
  }
}

/**
 * Add the hilight path_.
 * @param {!Object} eyo Block delegate.
 */
eYo.Draw.addBlockConnection_ = eyo => {
  if (!eyo.svgPathConnection_.parentNode) {
    eyo.svgGroup_.appendChild(eyo.svgPathConnection_)
  }
}

/**
 * Remove the hilight path.
 * @param {!Object} eyo Block delegate.
 */
eYo.Draw.removeBlockHilight_ = eyo => {
  goog.dom.removeNode(eyo.svgPathHilight_)
}

/**
 * Remove the select path.
 * @param {!Object} eyo Block delegate.
 */
eYo.Draw.removeBlockSelect_ = eyo => {
  goog.dom.removeNode(eyo.svgPathSelect_)
}

/**
 * Remove the select path.
 * @param {!Object} eyo Block delegate.
 */
eYo.Draw.removeBlockConnection_ = eyo => {
  goog.dom.removeNode(eyo.svgPathConnection_)
}

/**
 * The svg group has an `eyo-top` class.
 * @param {!Object} eyo Block delegate.
 */
eYo.Draw.addStatusTop_ = function (eyo) {
  goog.dom.classlist.add(eyo.svgGroup_, 'eyo-top')
}

/**
 * The svg group has no `eyo-top` class.
 * @param {!Object} eyo Block delegate.
 */
eYo.Draw.removeStatusTop_ = function (eyo) {
  goog.dom.classlist.remove(eyo.svgGroup_, 'eyo-top')
}

/**
 * The svg group has an `eyo-select` class, the fields as well.
 * @param {!Object} eyo Block delegate.
 */
eYo.Draw.addStatusSelect_ = function (eyo) {
  var g = eyo.svgGroup_
  if (goog.dom.classlist.contains(g, 'eyo-select')) {
    return
  }
  goog.dom.classlist.add(g, 'eyo-select')
  if ((g = eyo.svgContourGroup_)) {
    // maybe that block has not been rendered yet
    goog.dom.classlist.add(g, 'eyo-select')
  }
  eyo.forEachInput((input) => {
    input.fieldRow.forEach((field) => {
      if (goog.isFunction(field.addSelect)) {
        field.addSelect()
      }
    })
  })
}

/**
 * Reverse `addStatusSelect_`
 * @param {!Object} eyo Block delegate.
 */
eYo.Draw.removeStatusSelect_ = function (eyo) {
  if (eyo.svgGroup_) {
    goog.dom.classlist.remove(eyo.svgGroup_, 'eyo-select')
  }
  if (eyo.svgContourGroup_) {
    goog.dom.classlist.remove(eyo.svgContourGroup_, 'eyo-select')
  }
  eyo.forEachInput(input => {
    input.fieldRow.forEach(field => {
      if (goog.isFunction(field.removeSelect)) {
        field.removeSelect()
      }
    })
  })
}

/**
 * Did connect some block's connection to another connection.
 * When connecting locked blocks, select the receiver.
 * @param {!Blockly.Connection} connection what has been connected in the block
 * @param {!Blockly.Connection} oldTargetC8n what was previously connected in the block
 * @param {!Blockly.Connection} targetOldC8n what was previously connected to the new targetConnection
 */
eYo.Draw.didConnect = function (connection, oldTargetC8n, targetOldC8n) {
  if (connection.eyo.isOutput) {
    if (this === eYo.Selected.eyo && this.locked_) {
      eYo.Selected.eyo = connection.eyo.t_eyo
    }
    eYo.Draw.removeStatusTop_(connection.eyo.b_eyo)
  }
}


/**
 * Did some block's connection.
 * When connecting locked blocks, select the receiver.
 * @param {!Blockly.Connection} connection what has been connected in the block
 * @param {!Blockly.Connection} oldTargetC8n what was previously connected in the block
 * @param {!Blockly.Connection} oldConnection what was previously connected to the new targetConnection
 */
eYo.Draw.didDisconnect = function (connection, oldTargetC8n) {
  if (connection.eyo.isOutput) {
    eYo.Draw.addStatusTop_(connection.eyo.b_eyo)
  }
}
