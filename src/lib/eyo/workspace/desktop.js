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

goog.require('Blockly')
goog.require('eYo.XRE')
goog.require('eYo.Helper')
goog.require('eYo.Brick')
goog.require('eYo.Navigate')
goog.require('eYo.App')
goog.require('eYo.Xml')
goog.require('eYo.Xml.Recover')
goog.require('eYo.Protocol.ChangeCount')
goog.require('goog.crypt')

// Dependency ordering?



/**
 * Handle a key-down on SVG drawing surface.
 * The delete block code is modified
 * @param {!Event} e Key down event.
 * @private
 */
Blockly.onKeyDown_ = function(e) {
  if (Blockly.mainWorkspace.options.readOnly || Blockly.utils.isTargetInput(e)) {
    // No key actions on readonly workspaces.
    // When focused on an HTML text input widget, don't trap any keys.
    return;
  }
  // var deleteBrick = false;
  if (e.keyCode == 9) {
    if (eYo.Navigate.doTab(eYo.Selected.brick, {
        left: e.shiftKey,
        fast: e.altKey || e.ctrlKey || e.metaKey
      })) {
      eYo.Dom.gobbleEvent(e)
    }
  } else if (e.keyCode == 27) {
    // Pressing esc closes the context menu.
    Blockly.hideChaff();
  } else if (e.keyCode == 8 || e.keyCode == 46) {
    // Delete or backspace.
    // Stop the browser from going back to the previous page.
    // Do this first to prevent an error in the delete code from resulting in
    // data loss.
    e.preventDefault();
    // Don't delete while dragging.  Jeez.
    if (Blockly.mainWorkspace.isDragging()) {
      return;
    }
    if (eYo.Selected.brick && eYo.Selected.brick.isDeletable()) {
      eYo.deleteBrick(eYo.Selected.brick, e.altKey || e.ctrlKey || e.metaKey);
    }
  } else if (e.altKey || e.ctrlKey || e.metaKey) {
    // Don't use meta keys during drags.
    if (Blockly.mainWorkspace.isDragging()) {
      return;
    }
    if (eYo.Selected.brick &&
        eYo.Selected.brick.isDeletable() && eYo.Selected.brick.isMovable()) {
      // Eyo: 1 meta key for shallow copy, more for deep copy
      var deep = (e.altKey ? 1 : 0) + (e.ctrlKey ? 1 : 0) + (e.metaKey ? 1 : 0) > 1
      // Don't allow copying immovable or undeletable bricks. The next step
      // would be to paste, which would create additional undeletable/immovable
      // bricks on the workspace.
      if (e.keyCode == 67) {
        // 'c' for copy.
        Blockly.hideChaff();
        eYo.copyBrick(eYo.Selected.brick, deep);
      } else if (e.keyCode == 88 && !eYo.Selected.brick.workspace.isFlyout) {
        // 'x' for cut, but not in a flyout.
        // Don't even copy the selected item in the flyout.
        eYo.copyBrick(eYo.Selected.brick, deep);
        eYo.deleteBrick(eYo.Selected.brick, deep);
      }
    }
    if (e.keyCode == 86) {
      // 'v' for paste.
      if (Blockly.clipboardXml_) {
        Blockly.Events.setGroup(true);
        // Pasting always pastes to the main workspace, even if the copy started
        // in a flyout workspace.
        var workspace = Blockly.clipboardSource_;
        if (workspace.isFlyout) {
          workspace = workspace.targetSpace;
        }
        workspace.paste(Blockly.clipboardXml_);
        Blockly.Events.setGroup(false);
      }
    } else if (e.keyCode == 90) {
      // 'z' for undo 'Z' is for redo.
      Blockly.hideChaff();
      eYo.App.workspace.undo(e.shiftKey);
    }
  }
  // Common code for delete and cut.
  // Don't delete in the flyout.
  // if (deleteBrick && !eYo.Selected.brick.workspace.isFlyout) {
  //   Blockly.Events.setGroup(true);
  //   Blockly.hideChaff();
  //   eYo.Selected.brick.dispose(/* heal */ true, true);
  //   Blockly.Events.setGroup(false);
  // }
};

/**
 * Delete this block and the next ones if requested.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {!boolean} shallow
 */
eYo.deleteBrick = function (brick, deep) {
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
eYo.copyBrick = function(brick, deep) {
  var xml = eYo.Xml.brickToDom(brick, {noId: true, noNext: !deep});
  // Copy only the selected block and internal bricks.
  // Encode start position in XML.
  var xy = brick.ui.xyInWorkspace;
  xml.setAttribute('x', brick.RTL ? -xy.x : xy.x);
  xml.setAttribute('y', xy.y);
  Blockly.clipboardXml_ = xml;
  Blockly.clipboardSource_ = brick.workspace;
  eYo.App.didCopyBlock && (eYo.App.didCopyBlock(brick, xml))
}
