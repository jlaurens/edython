/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Workspace override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Desktop')

goog.require('eYo')

goog.forwardDeclare('eYo.Events')

goog.forwardDeclare('eYo.XRE')
goog.forwardDeclare('eYo.Helper')
goog.forwardDeclare('eYo.Brick')
goog.forwardDeclare('eYo.Navigate')
goog.forwardDeclare('eYo.App')
goog.forwardDeclare('eYo.Xml')
goog.forwardDeclare('eYo.Xml.Recover')
goog.forwardDeclare('eYo.Protocol.ChangeCount')

goog.forwardDeclare('goog.crypt')

goog.require('Blockly')

// Dependency ordering?

/**
 * Delete this brick and the next ones if requested.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {!boolean} shallow
 */
eYo.Desktop.deleteBrick = (brick, deep) => {
  if (brick && brick.isDeletable() && !brick.workspace.isFlyout) {
    if (brick.isSelected) {
      // prepare a connection or a block to be selected
      var m4t
      if ((m4t = brick.out_m)) {
        m4t = m4t.target
      } else if ((m4t = brick.foot_m)) {
        var t9k = m4t.targetBrick
      }
    }
    eYo.Events.groupWrap(() => {
      Blockly.hideChaff()
      if (deep) {
        do {
          var low = brick.foot
          brick.dispose(false, true)
        } while ((brick = low))
      } else {
        brick.dispose(true, true)
      }
    })
    if (m4t && m4t.brick.workspace) {
      m4t.select()
    } else if (t9k) {
      t9k.select()
    }
  }
}

/**
 * Copy a brick onto the local clipboard.
 * @param {!eYo.Brick} brick Brick to be copied.
 * @private
 */
eYo.Desktop.copyBrick = (brick, deep) => {
  var xml = eYo.Xml.brickToDom(brick, {noId: true, noNext: !deep})
  // Copy only the selected block and internal bricks.
  // Encode start position in XML.
  var xy = brick.ui.xyInWorkspace
  xml.setAttribute('x', xy.x)
  xml.setAttribute('y', xy.y)
  eYo.Clipboard.xml = xml
  eYo.Clipboard.source = brick.workspace
  eYo.App.didCopyBlock && (eYo.App.didCopyBlock(brick, xml))
}

/**
 * Paste a brick onto the local clipboard.
 * @param {!eYo.Brick} brick Brick to be copied.
 * @private
 */
eYo.Desktop.paste = () => {
}
