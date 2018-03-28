/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Workspace override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Xml')

goog.require('Blockly.Xml')
goog.require('Blockly.Field')
goog.require('Blockly.FieldVariable')

Blockly.Field.prototype.getSerializedXml = function () {
  var container = goog.dom.createDom('field', null, this.getValue())
  container.setAttribute('name', this.name)
  return container
}

Blockly.FieldVariable.prototype.getSerializedXml = function () {
  var container = Blockly.FieldVariable.superClass_.getSerializedXml.call(this)
  var variable = this.sourceBlock_.workspace.getVariable(this.getValue())
  if (variable) {
    container.setAttribute('id', variable.getId())
    container.setAttribute('variableType', variable.type)
  }
  return container
}

/**
 * Encode a block subtree as XML.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements.
 */
Blockly.Xml.blockToDom = function (block, optNoId) {
  var element
  if (block.ezp.toDomX && (element = block.ezp.toDomX(block, optNoId))) {
    return element
  }
  var element = goog.dom.createDom(block.isShadow() ? 'shadow' : 'block')
  element.setAttribute('type', block.type)
  if (!optNoId) {
    element.setAttribute('id', block.id)
  }
  if (block.mutationToDom) {
    // Custom data for an advanced block.
    var mutation = block.mutationToDom()
    if (mutation && (mutation.hasChildNodes() || mutation.hasAttributes())) {
      element.appendChild(mutation)
    }
  }
  for (var i = 0, input; (input = block.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field.name && field.EDITABLE) {
        element.appendChild(field.getSerializedXml())
      }
    }
  }

  var commentText = block.getCommentText()
  if (commentText) {
    var commentElement = goog.dom.createDom('comment', null, commentText)
    if (typeof block.comment === 'object') {
      commentElement.setAttribute('pinned', block.comment.isVisible())
      var hw = block.comment.getBubbleSize()
      commentElement.setAttribute('h', hw.height)
      commentElement.setAttribute('w', hw.width)
    }
    element.appendChild(commentElement)
  }

  if (block.data) {
    var dataElement = goog.dom.createDom('data', null, block.data)
    element.appendChild(dataElement)
  }

  for (i = 0; (input = block.inputList[i]); i++) {
    var container
    var empty = true
    if (input.type === Blockly.DUMMY_INPUT) {
      continue
    } else if (input.connection) {
      var childBlock = input.connection.targetBlock()
      if (input.type === Blockly.INPUT_VALUE) {
        container = goog.dom.createDom('value')
      } else if (input.type === Blockly.NEXT_STATEMENT) {
        container = goog.dom.createDom('statement')
      }
      var shadow = input.connection.getShadowDom()
      if (shadow && (!childBlock || !childBlock.isShadow())) {
        container.appendChild(Blockly.Xml.cloneShadow_(shadow))
      }
      if (childBlock) {
        container.appendChild(Blockly.Xml.blockToDom(childBlock, optNoId))
        empty = false
      }
    }
    container.setAttribute('name', input.name)
    if (!empty) {
      element.appendChild(container)
    }
  }
  if (block.inputsInlineDefault !== block.inputsInline) {
    element.setAttribute('inline', block.inputsInline)
  }
  if (block.isCollapsed()) {
    element.setAttribute('collapsed', true)
  }
  if (block.disabled) {
    element.setAttribute('disabled', true)
  }
  if (!block.isDeletable() && !block.isShadow()) {
    element.setAttribute('deletable', false)
  }
  if (!block.isMovable() && !block.isShadow()) {
    element.setAttribute('movable', false)
  }
  if (!block.isEditable()) {
    element.setAttribute('editable', false)
  }

  var nextBlock = block.getNextBlock()
  if (nextBlock) {
    container = goog.dom.createDom('next', null,
      Blockly.Xml.blockToDom(nextBlock, optNoId))
    element.appendChild(container)
  }
  shadow = block.nextConnection && block.nextConnection.getShadowDom()
  if (shadow && (!nextBlock || !nextBlock.isShadow())) {
    container.appendChild(Blockly.Xml.cloneShadow_(shadow))
  }
  if (block.ezp) {
    block.ezp.toDom(block, element)
  }
  return element
}

Blockly.Field.prototype.deserializeXml = function (xml) {
  this.setValue(xml.textContent)
}

Blockly.FieldVariable.prototype.deserializeXml = function (xml) {
  // TODO (marisaleung): When we change setValue and getValue to
  // interact with id's instead of names, update this so that we get
  // the variable based on id instead of textContent.
  var type = xml.getAttribute('variableType') || ''
  var workspace = this.sourceBlock_.workspace
  var text = xml.textContent
  var variable = workspace.getVariable(text)
  if (!variable) {
    variable = workspace.createVariable(text, type,
      xml.getAttribute('id'))
  }
  if (typeof (type) !== 'undefined' && type !== null) {
    if (type !== variable.type) {
      throw Error('Serialized variable type with id \'' +
        variable.getId() + '\' had type ' + variable.type + ', and ' +
        'does not match variable field that references it: ' +
        Blockly.Xml.domToText(xml) + '.')
    }
  }
  this.setValue(text)
}

/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Element} xmlBlock XML block element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {!Blockly.Block} The root block created.
 * @private
 */
Blockly.Xml.domToBlockHeadless_ = function (xmlBlock, workspace) {
  var block = null
  var prototypeName = xmlBlock.getAttribute('type')
  goog.asserts.assert(prototypeName, 'Block type unspecified: %s',
    xmlBlock.outerHTML)
  var id = xmlBlock.getAttribute('id')
  block = workspace.newBlock(prototypeName, id)

  if (block.ezp.domToChildren) {

  } else {
    var blockChild = null
    for (var i = 0, xmlChild; (xmlChild = xmlBlock.childNodes[i]); i++) {
      if (xmlChild.nodeType === 3) {
        // Ignore any text at the <block> level.  It's all whitespace anyway.
        continue
      }
      var input
  
      // Find any enclosed blocks or shadows in this tag.
      var childBlockNode = null
      var childShadowNode = null
      for (var j = 0, grandchildNode; (grandchildNode = xmlChild.childNodes[j]); j++) {
        if (grandchildNode.nodeType === 1) {
          if (grandchildNode.nodeName.toLowerCase() === 'block') {
            childBlockNode = grandchildNode
          } else if (grandchildNode.nodeName.toLowerCase() === 'shadow') {
            childShadowNode = grandchildNode
          }
        }
      }
      // Use the shadow block if there is no child block.
      if (!childBlockNode && childShadowNode) {
        childBlockNode = childShadowNode
      }
  
      var name = xmlChild.getAttribute('name')
      switch (xmlChild.nodeName.toLowerCase()) {
      case 'mutation':
        // Custom data for an advanced block.
        if (block.domToMutation) {
          block.domToMutation(xmlChild)
          if (block.initSvg) {
            // Mutation may have added some elements that need initializing.
            block.initSvg()
          }
        }
        break
      case 'comment':
        block.setCommentText(xmlChild.textContent)
        var visible = xmlChild.getAttribute('pinned')
        if (visible && !block.isInFlyout) {
          // Give the renderer a millisecond to render and position the block
          // before positioning the comment bubble.
          setTimeout(function () {
            if (block.comment && block.comment.setVisible) {
              block.comment.setVisible(visible === 'true')
            }
          }, 1)
        }
        var bubbleW = parseInt(xmlChild.getAttribute('w'), 10)
        var bubbleH = parseInt(xmlChild.getAttribute('h'), 10)
        if (!isNaN(bubbleW) && !isNaN(bubbleH) &&
              block.comment && block.comment.setVisible) {
          block.comment.setBubbleSize(bubbleW, bubbleH)
        }
        break
      case 'data':
        block.data = xmlChild.textContent
        break
      case 'title':
        // Titles were renamed to field in December 2013.
        // Fall through.
      case 'field':
        var field = block.getField(name)
        if (!field) {
          console.warn('Ignoring non-existent field ' + name + ' in block ' +
                         prototypeName)
          break
        }
        field.deserializeXml(xmlChild)
        break
      case 'value':
      case 'statement':
        input = block.getInput(name)
        if (!input) {
          console.warn('Ignoring non-existent input ' + name + ' in block ' +
                         prototypeName)
          break
        }
        if (childShadowNode) {
          input.connection.setShadowDom(childShadowNode)
        }
        if (childBlockNode) {
          blockChild = Blockly.Xml.domToBlockHeadless_(childBlockNode,
            workspace)
          if (blockChild.outputConnection) {
            input.connection.connect(blockChild.outputConnection)
          } else if (blockChild.previousConnection) {
            input.connection.connect(blockChild.previousConnection)
          } else {
            goog.asserts.fail(
              'Child block does not have output or previous statement.')
          }
        }
        break
      case 'next':
        if (childShadowNode && block.nextConnection) {
          block.nextConnection.setShadowDom(childShadowNode)
        }
        if (childBlockNode) {
          goog.asserts.assert(block.nextConnection,
            'Next statement does not exist.')
          // If there is more than one XML 'next' tag.
          goog.asserts.assert(!block.nextConnection.isConnected(),
            'Next statement is already connected.')
          blockChild = Blockly.Xml.domToBlockHeadless_(childBlockNode,
            workspace)
          goog.asserts.assert(blockChild.previousConnection,
            'Next block does not have previous statement.')
          block.nextConnection.connect(blockChild.previousConnection)
        }
        break
      default:
        // Unknown tag; ignore.  Same principle as HTML parsers.
        console.warn('Ignoring unknown tag: ' + xmlChild.nodeName)
      }
    }
  }
  var inline = xmlBlock.getAttribute('inline')
  if (inline) {
    block.setInputsInline(inline === 'true')
  }
  var disabled = xmlBlock.getAttribute('disabled')
  if (disabled) {
    block.setDisabled(disabled === 'true')
  }
  var deletable = xmlBlock.getAttribute('deletable')
  if (deletable) {
    block.setDeletable(deletable === 'true')
  }
  var movable = xmlBlock.getAttribute('movable')
  if (movable) {
    block.setMovable(movable === 'true')
  }
  var editable = xmlBlock.getAttribute('editable')
  if (editable) {
    block.setEditable(editable === 'true')
  }
  var collapsed = xmlBlock.getAttribute('collapsed')
  if (collapsed) {
    block.setCollapsed(collapsed === 'true')
  }
  if (xmlBlock.nodeName.toLowerCase() === 'shadow') {
    // Ensure all children are also shadows.
    var children = block.getChildren()
    var child
    for (i = 0; (child = children[i]); i++) {
      goog.asserts.assert(child.isShadow(),
        'Shadow block not allowed non-shadow child.')
    }
    // Ensure this block doesn't have any variable inputs.
    goog.asserts.assert(block.getVars().length === 0,
      'Shadow blocks cannot have variable fields.')
    block.setShadow(true)
  }
  if (block.ezp) {
    block.ezp.fromDom(block, xmlBlock)
  }
  return block
}
