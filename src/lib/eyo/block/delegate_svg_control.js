/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg.Control')

goog.require('goog.ui.Dialog')
goog.require('eYo.Msg')
goog.require('eYo.DelegateSvg.Group')
goog.require('goog.dom');

/**
 * Class for a DelegateSvg, control block.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.BaseGroup.makeSubclass('Control', {
  data: {
    flags: {
      init: Object.create(null),
      willLoad: /** @suppress{globalThis} */ function () {
        if (Object.keys(this.get()).length) {
          this.set(Object.create(null)) // reset the dictionary of flags
        }
      },
      xml: {
        save: /** @suppress{globalThis} */ function (element) {
          var flags = this.get()
          if (flags.hasNext) {
            element.setAttribute(eYo.Key.HAS_NEXT, eYo.Key.TRUE)
          }
        },
        load: /** @suppress{globalThis} */ function (element) {
          var flags = this.get()
          var attr = element.getAttribute(eYo.Key.HAS_NEXT)
          if (attr === eYo.Key.TRUE) {
            flags.hasNext = true
          }
        }
      }
    }
  }
}, eYo.DelegateSvg)

/**
 * True for controls only.
 */
eYo.DelegateSvg.Control.prototype.isControl = true

/**
 * Control block path.
 * @param {Number} cursorX
 * @private
 */
eYo.DelegateSvg.Control.prototype.playPathContourDef_ = function (cursorX) {
  return eYo.Shape.definitionForPlayContour({x: cursorX, y: 0})
} /* eslint-enable indent */

/**
 * Control block path.
 * @param {Number} cursorX
 * @private
 */
eYo.DelegateSvg.Control.prototype.playPathIconDef_ = function (cursorX) {
  return eYo.Shape.definitionForPlayIcon({x: cursorX, y: 0})
} /* eslint-enable indent */

/**
 * Control block path.
 * @param {!Blockly.Block} block
 * @private
 */
eYo.DelegateSvg.Control.prototype.controlPathDef_ = function () {
  return eYo.Shape.definitionWithBlock(this)
} /* eslint-enable indent */

eYo.DelegateSvg.Control.prototype.shapePathDef_ =
  eYo.DelegateSvg.Control.prototype.contourPathDef_ =
    eYo.DelegateSvg.Control.prototype.highlightPathDef_ =
      eYo.DelegateSvg.Control.prototype.controlPathDef_

eYo.DelegateSvg.Control.prototype.willRender_ = function (recorder) {
  eYo.DelegateSvg.Control.superClass_.willRender_.call(this, recorder)
  this.block_.width = Math.max(this.block_.width, 2 * eYo.Font.tabWidth)
}

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * @extends {Blockly.Block}
 * @constructor
 */
eYo.DelegateSvg.Control.prototype.postInitSvg = function () {
  if (this.svgSharpGroup_) {
    return
  }
  var block = this.block_
  eYo.DelegateSvg.Control.superClass_.postInitSvg.call(this)

  this.svgPlay_ = Blockly.utils.createSvgElement('g',
    {'class': 'eyo-play'}, block.svgGroup_)
  this.svgPathPlayContour_ = Blockly.utils.createSvgElement('path',
  {'class': 'eyo-path-play-contour'}, this.svgPlay_)
  this.svgPathPlayIcon_ = Blockly.utils.createSvgElement('path',
  {'class': 'eyo-path-play-icon'}, this.svgPlay_)
  this.svgPathPlayContour_.setAttribute('d', this.playPathContourDef_(0))
  this.svgPathPlayIcon_.setAttribute('d', this.playPathIconDef_(0))
  this.mouseDownWrapper_ =
    Blockly.bindEventWithChecks_(this.svgPathPlayIcon_, 'mousedown', this,
      function (event) {
        if (!this.suiteConnection.isConnected()) {
          var dialogModal = new goog.ui.Dialog('eyo-modal-dialog', true)
          dialogModal.setTextContent(eYo.Msg.CONNECT_MAIN_BLOCK_DLG_CONTENT)
          dialogModal.setTitle(eYo.Msg.CONNECT_MAIN_BLOCK_DLG_TITLE)
          dialogModal.setButtonSet(goog.ui.Dialog.ButtonSet.createOk())
          goog.events.listen(dialogModal, goog.ui.Dialog.EventType.SELECT, function (e) {})
          dialogModal.setVisible(true)
        }
        console.log('Start executing ' + this.block_.id)
        this.runScript && this.runScript()
      })
  goog.dom.classlist.add(this.svgPathShape_, 'eyo-start-path')
  goog.dom.insertSiblingAfter(this.svgPlay_, this.svgPathContour_)
  goog.dom.classlist.add(block.svgGroup_, 'eyo-start')
}


/**
 * Run the script exported from the block.
 * @private
 */
eYo.DelegateSvg.prototype.runScript = function () {
  console.log('Someone should everride this method to really run some script')
}

/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects...
 * @protected
 */
eYo.DelegateSvg.Control.prototype.disposeInternal = function () {
  goog.dom.removeNode(this.svgPlay_)
  this.svgPlay_ = undefined
  this.svgPathPlayIcon_ = undefined
  this.svgPathPlayContour_ = undefined
  if (this.mouseDownWrapper_) {
    Blockly.unbindEvent_(this.mouseDownWrapper_)
    this.mouseDownWrapper_ = null
  }
  eYo.DelegateSvg.superClass_.disposeInternal.call(this)
}

/**
 * Not very clean, used as hook before rendering the comment fields.
 * @param io
 * @private
 */
eYo.DelegateSvg.Control.prototype.renderDrawSharp_ = function (io) {
  io.cursor.c += 4
}

/**
 * Class for a DelegateSvg, start_stmt.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.DelegateSvg.Control.makeSubclass('start_stmt', {
  xml: {
    attr: 'start'
  },
  statement: {
    previous: {
      check: eYo.T3.Stmt.start_stmt
    },
    next: {
      check: eYo.T3.Stmt.start_stmt
    }
  }
})

eYo.DelegateSvg.Control.T3s = [
  eYo.T3.Stmt.start_stmt
]
