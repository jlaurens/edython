/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Workspace override.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Xml')

goog.require('ezP.Const')
goog.require('ezP.T3')

goog.require('Blockly.Xml')
goog.require('Blockly.Field')
goog.require('Blockly.FieldVariable')

ezP.T3.Xml.Stmt.statement = 'ezp:statement'
ezP.T3.Xml.Stmt.do = 'ezp:do'
ezP.T3.Xml.Expr.expression = 'ezp:expression'
ezP.T3.Xml.Expr.literal = 'ezp:literal'
ezP.T3.Xml.Expr.comparison = 'ezp:comparison'

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Text representation.
 */
Blockly.Xml.domToText = function(dom) {
  dom.setAttribute('xmlns:ezp', 'urn:ezpython:1.0')
  var oSerializer = new XMLSerializer();
  return oSerializer.serializeToString(dom);
};

/**
 * Decode an XML DOM and create blocks on the workspace.
 * @overriden to support other kind of blocks
 * This is a copy with a tiny formal modification.
 * @param {!Element} xml XML DOM.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {Array.<string>} An array containing new block IDs.
 */
Blockly.Xml.domToWorkspace = function(xml, workspace) {
  if (xml instanceof Blockly.Workspace) {
    var swap = xml;
    xml = workspace;
    workspace = swap;
    console.warn('Deprecated call to Blockly.Xml.domToWorkspace, ' +
                 'swap the arguments.');
  }
  var width;  // Not used in LTR.
  if (workspace.RTL) {
    width = workspace.getWidth();
  }
  var newBlockIds = [];  // A list of block IDs added by this call.
  Blockly.Field.startCache();
  // Safari 7.1.3 is known to provide node lists with extra references to
  // children beyond the lists' length.  Trust the length, do not use the
  // looping pattern of checking the index for an object.
  var childCount = xml.childNodes.length;
  var existingGroup = Blockly.Events.getGroup();
  if (!existingGroup) {
    Blockly.Events.setGroup(true);
  }

  // Disable workspace resizes as an optimization.
  if (workspace.setResizesEnabled) {
    workspace.setResizesEnabled(false);
  }
  var variablesFirst = true;
  try {
    for (var i = 0; i < childCount; i++) {
      var xmlChild = xml.childNodes[i]
      var name = xmlChild.nodeName.toLowerCase()
      if (name == 'block'||
        (name == 'shadow' && !Blockly.Events.recordUndo)) {
        // Allow top-level shadow blocks if recordUndo is disabled since
        // that means an undo is in progress.  Such a block is expected
        // to be moved to a nested destination in the next operation.
        var block = Blockly.Xml.domToBlock(xmlChild, workspace);
        newBlockIds.push(block.id);
        var blockX = parseInt(xmlChild.getAttribute('x'), 10);
        var blockY = parseInt(xmlChild.getAttribute('y'), 10);
        if (!isNaN(blockX) && !isNaN(blockY)) {
          block.moveBy(workspace.RTL ? width - blockX : blockX, blockY);
        }
        variablesFirst = false;
      } else if (name == 'shadow') {
        goog.asserts.fail('Shadow block cannot be a top-level block.');
        variablesFirst = false;
      } else if (name == 'variables') {
        if (variablesFirst) {
          Blockly.Xml.domToVariables(xmlChild, workspace);
        } else {
          throw Error('\'variables\' tag must exist once before block and ' +
            'shadow tag elements in the workspace XML, but it was found in ' +
            'another location.');
        }
        variablesFirst = false;
      } else {
        // This part is the custom part for ezPython
        var newBlock = function(xmlChild) {
          var block
          if (xmlChild && goog.isFunction(xmlChild.getAttribute)) {
            if ((block = Blockly.Xml.domToBlock(xmlChild, workspace))) {
              newBlockIds.push(block.id);
              var blockX = parseInt(xmlChild.getAttribute('x'), 10);
              var blockY = parseInt(xmlChild.getAttribute('y'), 10);
              if (!isNaN(blockX) && !isNaN(blockY)) {
                block.moveBy(blockX, blockY);
              }
            } else {
              // create children in a conservative idea
              for (var ii = 0, child;(child = xml.childNodes[ii]); ii++) {
                newBlock(child)
              }
            }
          }
          return block
        }
        newBlock(xmlChild)
      }
    }
  } finally {
    if (!existingGroup) {
      Blockly.Events.setGroup(false);
    }
    Blockly.Field.stopCache();
  }
  workspace.updateVariableStore(false);
  // Re-enable workspace resizing.
  if (workspace.setResizesEnabled) {
    workspace.setResizesEnabled(true);
  }
  return newBlockIds;
};

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
 * @param {element} dom element to encode in
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
ezP.Xml.toDom = function (block, element, optNoId) {
  var controller = block.ezp
  if ((controller &&
    goog.isFunction(controller.toDom)) ||
    ((controller = block.ezp.xml) &&
    goog.isFunction(controller.toDom)) ||
    ((controller = ezP.DelegateSvg.Manager.get(block.type)) && (controller = controller.xml) &&
    goog.isFunction(controller.toDom)) ||
    ((controller = ezP.DelegateSvg.Manager.get(block.type)) &&
    goog.isFunction(controller.toDom))) {
      return controller.toDom.call(controller, block, element, optNoId)
  }
}

/**
 * Encode a block subtree as XML.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
ezP.Xml.blockToDom = function (block, optNoId) {
  var controller = block.ezp
  if ((controller &&
    goog.isFunction(controller.blockToDom)) ||
    ((controller = block.ezp.xml) &&
    goog.isFunction(controller.blockToDom)) ||
    ((controller = ezP.DelegateSvg.Manager.get(block.type)) &&
    (controller = controller.xml) &&
    goog.isFunction(controller.blockToDom)) ||
    ((controller = ezP.DelegateSvg.Manager.get(block.type)) &&
    goog.isFunction(controller.blockToDom))) {
    return controller.blockToDom.call(controller, optNoId)
  }
  var element = goog.dom.createDom(block.ezp.xmlTagName(block))
  if (!optNoId) {
    element.setAttribute('id', block.id)
  }
  ezP.Xml.toDom(block, element, optNoId)
  return element
}

/**
 * Encode a block subtree as XML.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
ezP.Xml.savedBlockToDom = Blockly.Xml.blockToDom
Blockly.Xml.blockToDom = function (block, optNoId) {
  if (block.type.indexOf('ezp:')<0) {
    // leave the control to the original player
    return ezP.Xml.savedBlockToDom(block, optNoId)
  } else {
    return ezP.Xml.blockToDom(block, optNoId)
  }
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
 * Decode a block subtree from XML.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {element} dom element to encode in
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
ezP.Xml.fromDom = function (block, element) {
  var controller = block.ezp
  if ((controller &&
    goog.isFunction(controller.fromDom)) ||
    ((controller = block.ezp.xml) &&
    goog.isFunction(controller.fromDom)) ||
    ((controller = ezP.DelegateSvg.Manager.get(block.type)) &&
    (controller = controller.xml) &&
    goog.isFunction(controller.fromDom)) ||
    ((controller = ezP.DelegateSvg.Manager.get(block.type)) &&
    goog.isFunction(controller.fromDom))) {
    return controller.fromDom.call(controller, block, element)
  }
}

/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Element} xmlBlock XML block element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {!Blockly.Block} The root block created.
 */
ezP.Xml.savedDomToBlock = Blockly.Xml.domToBlock
Blockly.Xml.domToBlock = function(xmlBlock, workspace) {
  if (xmlBlock instanceof Blockly.Workspace) {
    var swap = xmlBlock;
    xmlBlock = workspace;
    workspace = swap;
    console.warn('Deprecated call to Blockly.Xml.domToBlock, ' +
                 'swap the arguments.');
  }
  var topBlock = ezP.Xml.savedDomToBlock(xmlBlock, workspace)
  // the block has been partially rendered but it was when
  // the connections were hidden
  if (topBlock) {
    setTimeout(function() {
      if (topBlock.workspace) {  // Check that the block hasn't been deleted.
        topBlock.render();
      }
    }, 1);
  }
  return topBlock;
}

/**
 * Decode an XML block tag and create a block (and possibly sub blocks)
 * on the workspace.
 * @param {!Element} xmlBlock XML block element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {!Blockly.Block} The root block created.
 */
ezP.Xml.domToBlockHeadless = function(xmlBlock, workspace) {
  var block = null
  if (!xmlBlock.nodeName) {
    return block
  }
  var prototypeName = xmlBlock.nodeName.toLowerCase()
  var id = xmlBlock.getAttribute('id')
  if (prototypeName === ezP.T3.Expr.literal) {
    var text = ''
    for (var i = 0, xmlChild; (xmlChild = xmlBlock.childNodes[i]); i++) {
      if (xmlChild.nodeType === 3) {
        text = xmlChild.nodeValue
        break
      }
    }
    prototypeName = ezP.Do.typeOfString(text) || ezP.T3.Expr.integer
    if ((block = ezP.DelegateSvg.newBlockComplete(workspace, prototypeName, id))) {
      block.ezp.setValue(block, text)
    }
    return block
  }
  if (prototypeName === ezP.T3.Xml.Expr.comparison) {
    var op = xmlBlock.getAttribute(ezP.Const.Field.OPERATOR)
    var type = ezP.T3.Expr.number_comparison, Ctor, model
    if ((Ctor = ezP.DelegateSvg.Manager.get(type)) && (model = Ctor.prototype.getModel().input) && model.operators && model.operators.indexOf(op)>=0) {
      block = ezP.DelegateSvg.newBlockComplete(workspace, type, id)
    } else if ((type = ezP.T3.Expr.number_comparison) && (Ctor = ezP.DelegateSvg.Manager.get(type)) && (model = Ctor.prototype.getModel().input) && model.operators && model.operators.indexOf(op)>=0) {
      block = ezP.DelegateSvg.newBlockComplete(workspace, type, id)
    } else {
      return block
    }
    ezP.Xml.fromDom(block, xmlBlock)    
    return block
  }

  var concrete = prototypeName + '_concrete'
  var controller = ezP.DelegateSvg.Manager.get(concrete)
  if (controller) {
    if (goog.isFunction(controller.domToBlock)) {
      return controller.domToBlock(xmlBlock, workspace)
    }
    block = ezP.DelegateSvg.newBlockComplete(workspace, concrete, id)
  } else if ((controller = ezP.DelegateSvg.Manager.get(prototypeName))) {
    if (goog.isFunction(controller.domToBlock)) {
      return controller.domToBlock(xmlBlock, workspace)
    }
    block = ezP.DelegateSvg.newBlockComplete(workspace, prototypeName, id)
  }
  console.log('Block created from dom:', xmlBlock, block.type, block.id)
  if (block) {
    ezP.Xml.fromDom(block, xmlBlock)
  }
  return block
}

/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Element} xmlBlock XML block element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {!Blockly.Block} The root block created.
 * @private
 */
ezP.Xml.savedDomToBlockHeadless_ = Blockly.Xml.domToBlockHeadless_
Blockly.Xml.domToBlockHeadless_ = function (xmlBlock, workspace) {
  var block = null
  if (!xmlBlock.nodeName) {
    return block
  }
  var prototypeName = xmlBlock.nodeName.toLowerCase();
  if (prototypeName.indexOf('ezp:')<0) {
    return ezP.Xml.savedDomToBlockHeadless_(xmlBlock, workspace)
  } else {
    return ezP.Xml.domToBlockHeadless(xmlBlock, workspace)
  }
//////////// CUT HERE
  if (goog.isFunction(block.ezp.domToBlock)) {
    block.ezp.domToBlock(block, xmlBlock)
    return block
  } else if (goog.isFunction(block.ezp.domChildToBlock)) {
    block.ezp.domChildToBlock(block, xmlBlock)
  } else {
    for (var i = 0, xmlChild; (xmlChild = xmlBlock.childNodes[i]); i++) {
      if (xmlChild.nodeType === 3) {
        // Ignore any text at the <block> level.  It's all whitespace anyway.
        continue
      }
      var child = Blockly.Xml.domToBlock(xmlChild, workspace)
      if (child) {
        var name = xmlChild.getAttribute('input')
        if (name) {
          var input = block.getInput(name)
          if (input) {
            var c8n = input.connection
            if (c8n) {
              var outputC8n = child.outputConnection
              if (outputC8n.checkType_(c8n)) {
                outputC8n.connect(c8n)// could we try not to render now ?
              }
            }
          }
        } else {
          var c8n = input.nextConnection
          var otherC8n = child.previousConnection
          if (outputC8n.checkType_(c8n)) {
            outputC8n.connect(c8n)// could we try not to render now ?
          }
        }
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



/**
 * Convert the block's input with the given name to a dom element.
 * Only value inputs are taken into account.
 * Dummy inputs are ignored.
 * If they contain editable fields, then
 * the persistent storage is made differently.
 * If the input list contains only one value input which is a wrapper,
 * then the method is forwarded to the target.
 * For ezPython.
 * @param {!Blockly.Input} input  the input to be saved.
 * @param {Element} element a dom element in which to save the input
 * @param {boolean} optNoId Is a function.
 * @return the added child, if any
 */
ezP.Xml.inputToDom = function(input, element, optNoId, optNoName) {
  var c8n = input.connection
  if (c8n) {
    var target = input.connection.targetBlock()
    if (target) {
      var child = Blockly.Xml.blockToDom(target, optNoId)
      if (!optNoName) {
        child.setAttribute('input', input.name)
      }
      goog.dom.appendChild(element, child)
      return child
    }
  }
}

/**
 * Convert the block's input with the given name to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {string} name The name of the input
 * @param {Element} element a dom element in which to save the input
 * @param {boolean} optNoId Is a function.
 * @return the added child, if any
 */
ezP.Xml.namedInputToDom = function(block, name, element, optNoId) {
  var input = block.getInput(name)
  return input? ezP.Xml.inputToDom(input, element, optNoId): undefined
}

/**
 * Convert the block's input to a dom element.
 * For ezPython.
 * @param {!Blockly.Input} block The block to be converted.
 * @param {Element} element a dom element in which to save the input
 * @return the added child, if any
 */
ezP.Xml.inputFromDom = function(input, element) {
  if (element) {
    var c8n, target
    if ((c8n = input.connection)) {
      if ((target = c8n.targetBlock())) {
        return ezP.Xml.fromDom(target, element)
      }
      if ((target = Blockly.Xml.domToBlock(element, input.sourceBlock_.workspace))) {
        var targetC8n = target.outputConnection
        if (targetC8n && targetC8n.checkType_(c8n)) {
          c8n.connect(targetC8n)
        }
        return target
      }
    }
  }
}

/**
 * Convert the block's input with the given name to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {string} name The name of the input
 * @param {Element} element a dom element in which to save the input
 * @return the added child, if any
 */
ezP.Xml.namedInputFromDom = function(block, name, element) {
  var input = block.getInput(name)
  if (input) {
    for (var i = 0, child; (child = element.childNodes[i++]);) {
      if (goog.isFunction(child.getAttribute) && child.getAttribute('input') === name) {
        return ezP.Xml.inputFromDom(input, child)
      }
    }
  }
}

/**
 * Convert the block's input list with the given name to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {boolean} optNoId Is a function.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.namedListInputToDom = function(block, name, element, optNoId) {
  var input = block.getInput(name)
  if (input) {
    var target = input.connection.targetBlock()
    if (target) {
      var child = goog.dom.createDom('ezp:list')
      if (ezP.Xml.toDom(target, child, optNoId)) {
        goog.dom.appendChild(element, child)
        child.setAttribute('input', input.name)
        return child
      }
    }
  }
  return undefined
}


/**
 * Convert the block's input list with the given name to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {boolean} optNoId Is a function.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.namedListInputFromDom = function(block, name, element) {
  var input = block.getInput(name)
  if (input) {
    var target = input.connection.targetBlock()
    if (target) {
      for (var i = 0, child;(child = element.childNodes[i++]);) {
        if (child.nodeName.toLowerCase() === 'ezp:list' && child.getAttribute('input') === name) {
          ezP.Xml.fromDom(target, child)
          return true
        }
      }
    }
  }
  return false
}

goog.require('ezP.DelegateSvg.Expr')
goog.provide('ezP.Xml.Value')

/**
 * Records the subtype as 'value' attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Value.toDom = function (block, element, optNoId) {
  element.setAttribute('value', block.ezp.getValue(block))
  return element
}

/**
 * Set the value from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Value.fromDom = function (block, element) {
  var value = element.getAttribute('value')
  block.ezp.setValue(block, value)
}

ezP.DelegateSvg.Expr.builtin_object.xml = ezP.DelegateSvg.Expr.any.xml = ezP.Xml.Value

goog.provide('ezP.Xml.InputList')

/**
 * Convert the block's input list from a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {boolean} optNoId Is a function.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.InputList.toDom = function(block, element, optNoId) {
  var out
  var e8r = block.ezp.inputEnumerator(block), input
  while ((input = e8r.next())) {
    if (input.name) {
      var c8n = input.connection
      if (c8n) {
        var target = c8n.targetBlock()
        if (target) {
          var child = Blockly.Xml.blockToDom(target, optNoId)
          if ((out = child)) {
            child.setAttribute('input', input.name)
            goog.dom.appendChild(element, child)
          }
        }
      }
    }
  }
  return out
}

/**
 * Convert the block's input list from a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {boolean} optNoId Is a function.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.InputList.fromDom = function(block, xml) {
  var bump
  for (var i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
    var name
    if (goog.isFunction(xmlChild.getAttribute)) {
      var name = xmlChild.getAttribute('input')
      if (name) {
        var input = block.getInput(name)
        if (input) {
          var c8n = input.connection
          if (c8n) {
            var child = Blockly.Xml.domToBlock(xmlChild, block.workspace)
            if (child) {
              var outputC8n = child.outputConnection
              if (outputC8n && outputC8n.checkType_(c8n)) {
                outputC8n.connect(c8n)// could we try not to render now ?
              } else {
                bump = true
              }
            }
          }
        }
      }
    }
  }
  if (bump) {
    block.bumpNeighbours_()
  }
}

ezP.DelegateSvg.Expr.proper_slice.xml = ezP.DelegateSvg.Expr.conditional_expression_concrete.xml = ezP.Xml.InputList


goog.provide('ezP.Xml.SingleInput')

/**
 * Convert the block's input list from a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {boolean} optNoId Is a function.
 * @return a dom element
 */
ezP.Xml.SingleInput.toDom = function(block, element, optNoId) {
  return block.inputList.length? ezP.Xml.inputToDom(block.inputList[0], element, optNoId, true): element
}

/**
 * Convert the block's input list from a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {boolean} optNoId Is a function.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.SingleInput.fromDom = function(block, xml) {
  return ezP.Xml.inputFromDom(block.inputList[0], xml.childNodes[0])
}

ezP.DelegateSvg.Expr.or_expr_star.xml = ezP.DelegateSvg.Expr.or_expr_star_star.xml = ezP.DelegateSvg.Expr.not_test_concrete.xml = ezP.Xml.SingleInput

// ezP.DelegateSvg.Expr.T3s = [
//   ezP.DelegateSvg.Expr.proper_slice,
//   ezP.DelegateSvg.Expr.conditional_expression_concrete,
//   ezP.DelegateSvg.Expr.or_expr_star,
//   ezP.DelegateSvg.Expr.or_expr_star_star,
//   ezP.DelegateSvg.Expr.not_test_concrete,
//   ezP.DelegateSvg.Expr.shortstringliteral,
//   ezP.DelegateSvg.Expr.shortbytesliteral,
//   ezP.DelegateSvg.Expr.longstringliteral,
//   ezP.DelegateSvg.Expr.longbytesliteral,
//   ezP.DelegateSvg.Expr.numberliteral,
//   ezP.DelegateSvg.Expr.integer,
//   ezP.DelegateSvg.Expr.floatnumber,
//   ezP.DelegateSvg.Expr.imagnumber,
//   ezP.DelegateSvg.Expr.builtin_object,
//   ezP.DelegateSvg.Expr.any,
// ]
/**
 * Convert dom element to the block's input list.
 * The wrapped blocks must be managed specially.
 * Except for list, wrapped bocks are really transparent.
 * It means that the xml data does not contain any information
 * that would make us think that there is a wrapped block.
 * For list blocks, things are different because of
 * the dynamically generated input names.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be edited.
 * @param {Element} xml Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.prototype.inputListFromDom = function(block, xml) {
  // try to fill each input
  var uniqueTarget = undefined
  var e8r = block.ezp.inputEnumerator(block, true), input
  while ((input = e8r.next())) {
    if (input.name) {
      console.log('Try to fill', block.type, input.name)
      var c8n = input.connection
      if (c8n) {
        if (c8n.type === Blockly.INPUT_VALUE) {
          var target = c8n.targetBlock()
          if (target) {
            console.log('Already target')
            var found = false
            for (var i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
              if (goog.isFunction(xmlChild.getAttribute) && xmlChild.getAttribute('input') === input.name) {
                // we have found some xml data with the same name
                console.log('feed target with xmlChild', target.type, xmlChild)
                target.ezp.fromDom(target, xmlChild)
                found = true
                break
              }
            }
            if (found) {
              uniqueTarget = null
            } else {
              if (uniqueTarget === undefined) {
                // this is the first value input
                if (target.ezp.wrapped_) {
                  uniqueTarget = target
                } else {
                  uniqueTarget = null
                }  
              } else {
                uniqueTarget = null
              }
            }
          } else {
            // We try to create a target block, only if the xml element
            // contains a child with the same name
            for (var i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
              if (goog.isFunction(xmlChild.getAttribute) && xmlChild.getAttribute('input') === input.name) {
                // Found
                console.log('Create new target with xmlChild', xmlChild)
                target = Blockly.Xml.domToBlock(xmlChild, block.workspace)
                var targetC8n = target.outputConnection
                if (targetC8n && c8n.checkType_(targetC8n)) {
                  console.log('Connection done')
                  c8n.connect(targetC8n)
                }
                // no need to look further
                break
              }
            }
          }
        }
      }
    }
  }
  if (false && uniqueTarget) {
    // there is only one value input target and it is a wrapped block
    uniqueTarget.ezp.fromDom(uniqueTarget, xml)
  }
}

goog.require('ezP.DelegateSvg.Expr.longliteral')

/**
 * Convert the block to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {boolean} optNoId Is a function.
 * @return a dom element
 */
ezP.Xml.valueToDom = function(block, element, optNoId) {
  var text = block.ezp.getValue(block)
  var child = goog.dom.createTextNode(text)
  goog.dom.appendChild(element, child)
  return element
}

/**
 * Convert the block from a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {boolean} optNoId Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Expr.valueFromDom = function(block, element) {
  var text = ''
  for (var i = 0, xmlChild; (xmlChild = element.childNodes[i]); i++) {
    if (xmlChild.nodeType === 3) {
      text = xmlChild.nodeValue
      break
    }
  }
  block.ezp.setValue(block, text)
}

goog.require('ezP.DelegateSvg.Expr.numberliteral')

/**
 * Convert the block to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} optNoId Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Literal.prototype.toDom = ezP.Xml.valueToDom

/**
 * Convert the block from a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} optNoId Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Literal.prototype.fromDom = ezP.DelegateSvg.Expr.valueFromDom

goog.require('ezP.DelegateSvg.Identifier')

/**
 * Convert dom element to the block.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Element} xml Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Expr.identifier.prototype.fromDom = ezP.DelegateSvg.Expr.valueFromDom

ezP.DelegateSvg.Expr.identifier.prototype.toDom = ezP.Xml.valueToDom




/**
 * Convert the block's input list to a dom element.
 * Only value inputs are taken into account.
 * Dummy inputs are ignored.
 * If they contain editable fields, then
 * the persistent storage is made differently.
 * If the input list contains only one value input which is a wrapper,
 * then the method is forwarded to the target.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {boolean} optNoId Is a function.
 * @return a dom element, void lists may return nothing
 */
ezP.DelegateSvg.prototype.inputListToDom = function(block, element, optNoId) {
  var unique = undefined
  var e8r = block.ezp.inputEnumerator(block), input
  while ((input = e8r.next())) {
    var c8n = input.connection
    if (c8n && c8n.type === Blockly.INPUT_VALUE) {
      var target = c8n.targetBlock()
      if (target) {
        var child
        if (target.ezp.wrapped_) {
          if (false && unique === undefined) {
            unique = {target: target, name: input.name}
          } else {
            if (unique && (child = Blockly.Xml.blockToDom(unique.target, optNoId))) {
              element.appendChild(child)
              child.setAttribute('input', unique.name)
            }
            unique = null
            if ((child = Blockly.Xml.blockToDom(target, optNoId))) {
              element.appendChild(child)
              child.setAttribute('input', input.name)
            }
          }
        } else if ((child = Blockly.Xml.blockToDom(target, optNoId))) {
          element.appendChild(child)
          child.setAttribute('input', input.name)
        }
      }
    }
  }
  return unique? unique.target.ezp.toDom(unique.target, element, optNoId): element
}

goog.require('ezP.DelegateSvg.List')

/**
 * Convert the block to a dom element.
 * Called at the end of blockToDom.
 * Default implementation does nothing.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {boolean} optNoId Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.List.prototype.toDom = function(block, element, optNoId) {
  var x = this.inputListToDom(block, element, optNoId)
  return block.getSurroundParent()? x: element
}


/**
 * Convert the block's input list to a dom element.
 * Void lists may not appear in the persistent storage.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {boolean} optNoId Is a function.
 * @return a dom element, void lists may return nothing
 */
ezP.DelegateSvg.List.prototype.inputListToDom = function(block, element, optNoId) {
  var returnElement
  var e8r = block.ezp.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection
    if (c8n && c8n.type === Blockly.INPUT_VALUE) {
      var target = c8n.targetBlock()
      if (target) {
        var child
        if ((child = Blockly.Xml.blockToDom(target, optNoId))) {
          element.appendChild(child)
          child.setAttribute('input', e8r.here.name)
          returnElement = element
        }
      }
    }
  }
  return returnElement
}

/**
 * Set the await prefix from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.awaitToDom = function (block, element, optNoId) {
  if (block.ezp.awaited_) {
    element.setAttribute('await', 'true')
  }
  return true
}

/**
 * Set the await prefix from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.awaitFromDom = function (block, element) {
  var field = block.ezp.uiModel.fieldAwait
  if (field) {
    var attribute = element.getAttribute('await')
    block.ezp.setAwaited(block, attribute && attribute.toLowerCase() === 'true')
    return true
  }
  return false
}

/**
 * Convert the block's input list to a dom element.
 * Void lists may not appear in the persistent storage.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element, void lists may return nothing
 */
ezP.DelegateSvg.List.prototype.fromDom = function(block, xml) {
  for (var i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
    var name
    if (goog.isFunction(xmlChild.getAttribute)) {
      var name = xmlChild.getAttribute('input')
      if (name) {
        var input = block.getInput(name)
        if (input) {
          var c8n = input.connection
          if (c8n) {
            var child = Blockly.Xml.domToBlock(xmlChild, block.workspace)
            if (child) {
              var outputC8n = child.outputConnection
              if (outputC8n && outputC8n.checkType_(c8n)) {
                outputC8n.connect(c8n)// could we try not to render now ?
              }
            }
          }
        }
      }
    }
  }
}

goog.provide('ezP.Xml.Operator')
goog.require('ezP.DelegateSvg.Operator')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns 'expr'
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.DelegateSvg.Operator.prototype.xmlTagName = function (block) {
  var m = XRegExp.exec(block.type, ezP.XRE.concrete)
  if (m) {
    return m.core
  }
  return block.type
}

/**
 * Records the operator as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Operator.toDom = function (block, element) {
  element.setAttribute(ezP.Const.Field.OPERATOR, block.ezp.getSubtype(block))
  ezP.Xml.InputList.toDom(block, element)
}

/**
 * Set the operator from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Operator.fromDom = function (block, element, optNoId) {
  var op = element.getAttribute(ezP.Const.Field.OPERATOR)
  block.ezp.setSubtype(block, op)
  ezP.Xml.InputList.fromDom(block, element, optNoId)
}

ezP.DelegateSvg.Operator.prototype.xml = ezP.Xml.Operator
ezP.DelegateSvg.Expr.power_concrete.prototype.xml = ezP.Xml.Operator

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns 'expr'
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.DelegateSvg.Expr.number_comparison.prototype.xmlTagName = ezP.DelegateSvg.Expr.object_comparison.prototype.xmlTagName = function (block) {
  return ezP.T3.Xml.Expr.comparison
}

// ezP.T3.Expr.number_comparison,
// ezP.T3.Expr.object_comparison,

goog.require('ezP.DelegateSvg.Argument')

ezP.DelegateSvg.Expr.keyword_item.xml = ezP.Xml.InputList
ezP.DelegateSvg.Expr.expression_star.xml = ezP.Xml.InputList
ezP.DelegateSvg.Expr.expression_star_star.xml = ezP.Xml.InputList

// ezP.T3.Expr.identifier,

// ezP.T3.Expr.argument_list,
// ezP.T3.Expr.identifier,
// ezP.T3.Expr.argument_list_comprehensive,

goog.provide('ezP.Xml.Comprehension')
goog.require('ezP.DelegateSvg.Comprehension')

ezP.DelegateSvg.Expr.comp_for.xml =
ezP.DelegateSvg.Expr.comp_if.xml =
ezP.DelegateSvg.Expr.comp_iter_list.xml =
ezP.DelegateSvg.Expr.key_datum_concrete.xml =
ezP.Xml.InputList

/**
 * toDom.
 * @param {!Blockly.Block} block to be translated.
 * @param {!Element} element dom element to be completed.
 * @param {boolean} optNoId true if no id is required.
 * For subclassers eventually
 */
ezP.Xml.Comprehension.toDom = function (block, element, optNoId) {
  // create a list element
  ezP.Xml.namedInputToDom(block, ezP.Key.EXPRESSION, element, optNoId)
  ezP.Xml.namedListInputToDom(block, ezP.Key.FOR, element, optNoId)
  ezP.Xml.namedInputToDom(block, ezP.Key.IN, element, optNoId)
  ezP.Xml.namedListInputToDom(block, ezP.Key.COMP_ITER, element, optNoId)
}

/**
 * fromDom.
 * @param {!Blockly.Block} block to be initialized.
 * @param {!Element} xml dom element.
 * For subclassers eventually
 */
ezP.Xml.Comprehension.fromDom = function (block, element) {
  ezP.Xml.namedInputFromDom(block, ezP.Key.EXPRESSION, element)
  ezP.Xml.namedListInputFromDom(block, ezP.Key.FOR, element)
  ezP.Xml.namedInputFromDom(block, ezP.Key.IN, element)
  ezP.Xml.namedListInputFromDom(block, ezP.Key.COMP_ITER, element)
}

ezP.DelegateSvg.Expr.comprehension.xml =
ezP.DelegateSvg.Expr.generator_expression.xml =
ezP.Xml.Comprehension

ezP.DelegateSvg.Expr.dict_comprehension.xml = {}

/**
 * toDom.
 * @param {!Blockly.Block} block to be translated.
 * @param {!Element} element dom element to be completed.
 * @param {boolean} optNoId true if no id is required.
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.dict_comprehension.xml.toDom = function (block, element, optNoId) {
  // create a list element
  ezP.Xml.namedInputToDom(block, ezP.Key.KEY, element, optNoId)
  ezP.Xml.namedInputToDom(block, ezP.Key.DATUM, element, optNoId)
  ezP.Xml.namedListInputToDom(block, ezP.Key.FOR, element, optNoId)
  ezP.Xml.namedInputToDom(block, ezP.Key.IN, element, optNoId)
  ezP.Xml.namedListInputToDom(block, ezP.Key.COMP_ITER, element, optNoId)
}

/**
 * fromDom.
 * @param {!Blockly.Block} block to be initialized.
 * @param {!Element} xml dom element.
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.dict_comprehension.xml.fromDom = function (block, xml) {
  ezP.Xml.namedInputFromDom(block, ezP.Key.KEY, xml)
  ezP.Xml.namedInputFromDom(block, ezP.Key.DATUM, xml)
  ezP.Xml.namedListInputFromDom(block, ezP.Key.FOR, xml)
  ezP.Xml.namedInputFromDom(block, ezP.Key.IN, xml)
  ezP.Xml.namedListInputFromDom(block, ezP.Key.COMP_ITER, xml)
}



























goog.require('ezP.DelegateSvg.Assignment')

/**
 * toDom.
 * @param {!Blockly.Block} block to be translated.
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.assignment_expression.prototype.toDom = function (block, element, optNoId) {
  // create a list element
  ezP.Xml.namedListInputToDom(block, ezP.Key.TARGET, element, optNoId)
  ezP.Xml.namedListInputToDom(block, ezP.Key.ASSIGNED, element, optNoId)
}

/**
 * fromDom.
 * @param {!Blockly.Block} block to be initialized.
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.assignment_expression.prototype.fromDom = function (block, xml) {
  ezP.Xml.namedListInputFromDom(block, ezP.Key.TARGET, xml)
  ezP.Xml.namedListInputFromDom(block, ezP.Key.ASSIGNED, xml)
}

/**
 * toDom.
 * @param {!Blockly.Block} block to be translated.
 * For subclassers eventually
 */
ezP.DelegateSvg.Stmt.assignment_stmt.prototype.toDom = ezP.DelegateSvg.Expr.assignment_expression.prototype.toDom

/**
 * fromDom.
 * @param {!Blockly.Block} block to be initialized.
 * For subclassers eventually
 */
ezP.DelegateSvg.Stmt.assignment_stmt.prototype.fromDom = ezP.DelegateSvg.Expr.assignment_expression.prototype.fromDom


/*

<ezp:expression xmlns="http://www.w3.org/1999/xhtml" type="comprehension" xmlns:ezp="urn:ezpython">
<ezp:expression type="target_list" name="for">
<ezp:expression type="identifier" name="O">x</ezp:expression>
</ezp:expression>
<ezp:expression type="comp_iter_list" name="comp_iter"></ezp:expression>
</ezp:expression>

IN PROGRESS
  module_identifier         /*   ::=                                                    (default) // : "ezp:module_identifier",
  attribute_identifier      /*   ::=                                                    (default) // : "ezp:attribute_identifier",
  non_void_expression_list  /*   ::=                                                    (default) // : "ezp:non_void_expression_list",
  parenth_form              /*   ::= "(" [starred_expression] ")"                       (default) // : "ezp:parenth_form",
  list_display              /*   ::= "[" starred_item_list_comprehensive "]"            (default) // : "ezp:list_display",
  set_display               /*   ::= "{" non_void_starred_item_list_comprehensive "}"   (default) // : "ezp:set_display",
  dict_display              /*   ::= "{" [key_datum_list | dict_comprehension] "}"      (default) // : "ezp:dict_display",
  dict_comprehension        /*   ::= expression ":" expression comp_for                 (default) // : "ezp:dict_comprehension",
  generator_expression      /*   ::= "(" expression comp_for ")"                        (default) // : "ezp:generator_expression",
  yield_atom                /*   ::= "(" yield_expression ")"                           (default) // : "ezp:yield_atom",
  attributeref              /*   ::= primary "." identifier                             (default) // : "ezp:attributeref",
  subscription              /*   ::= primary "[" expression_list "]"                    (default) // : "ezp:subscription",
  slicing                   /*   ::= primary display_slice_list                         (default) // : "ezp:slicing",
  proper_slice              /*   ::= [lower_bound] ":" [upper_bound] [ ":" [stride] ]   (default) // : "ezp:proper_slice",
  call_expr                 /*   ::= primary "(" [argument_list [","] | comprehension] ")" (default) // : "ezp:call_expr",
  argument_list             /*   ::= argument_any *                                     (default) // : "ezp:argument_list",
  keyword_item              /*   ::= identifier "=" expression                          (default) // : "ezp:keyword_item",
  await_expr                /*   ::= "await" primary                                    (default) // : "ezp:await_expr",
  conditional_expression_concrete /*   ::= or_test "if" or_test "else" expression             (default) // : "ezp:conditional_expression_concrete",
  lambda_expr               /*   ::= lambda_expression "dynamic with cond"              (default) // : "ezp:lambda_expr",
  lambda_expr_nocond        /*   ::= lambda_expression "dynamic without cond"           (default) // : "ezp:lambda_expr_nocond",
  builtin_object            /*   ::= 'None' | 'True' | 'False' | 'Ellipsis' | '...' |'NotImplemented' (default) // : "ezp:builtin_object",
  any                       /*   ::= any expression                                     (default) // : "ezp:any",
  starred_item_list         /*   ::= starred_item ? ( ',' starred_item ) * [',']        (default) // : "ezp:starred_item_list",
  star_expr                 /*   ::= "*" or_expr                                        (default) // : "ezp:star_expr",
  optional_expression_list  /*   ::= ( expression ',' )* [ expression ]                 (default) // : "ezp:optional_expression_list",
  key_datum_concrete        /*   ::= expression ":" expression                          (default) // : "ezp:key_datum_concrete",
  or_expr_star_star         /*   ::= "**" or_expr                                       (default) // : "ezp:or_expr_star_star",
  yield_expression_list     /*   ::= "yield" expression_list                            (default) // : "ezp:yield_expression_list",
  yield_from_expression     /*   ::= "yield" "from" expression                          (default) // : "ezp:yield_from_expression",
  display_slice_list        /*   ::= "[" slice_list "]"                                 (default) // : "ezp:display_slice_list",
  call_expr                 /*   ::= primary "(" argument_list_comprehensive ")"        (default) // : "ezp:call_expr",
  expression_star           /*   ::= "*" expression                                     (default) // : "ezp:expression_star",
  expression_star_star      /*   ::= "**" expression                                    (default) // : "ezp:expression_star_star",
  number_comparison         /*   ::= comparison comp_operator comparison                (default) // : "ezp:number_comparison",
  object_comparison         /*   ::= comparison comp_operator comparison                (default) // : "ezp:object_comparison",
  lambda_expression         /*   ::= "lambda" [parameter_list]: (expression | expression_no_cond) (default) // : "ezp:lambda_expression",
  augop                     /*   ::= "+=" | "-=" | "*=" | "@=" | "/=" | "//=" | "%=" | "**=" | ">>=" | "<<=" | "&=" | "^=" | "|=" (default) // : "ezp:augop",
  module_concrete           /*   ::= module_name '.' module                             (default) // : "ezp:module_concrete",
  assignment_expression     /*   ::= target_list "=" assigned_list                      (default) // : "ezp:assignment_expression",
  augassign_numeric         /*   ::= augtarget augop aug_assign_list                    (default) // : "ezp:augassign_numeric",
  augassign_bitwise         /*   ::= augtarget augop aug_assign_list                    (default) // : "ezp:augassign_bitwise",
  augassign_list_concrete   /*   ::=  ( expression ',' ) +                              (default) // : "ezp:augassign_list_concrete",
  parenth_target_list       /*   ::= "(" void_target_list ")"                           (default) // : "ezp:parenth_target_list",
  bracket_target_list       /*   ::= "[" void_target_list "]"                           (default) // : "ezp:bracket_target_list",
  void_target_list          /*   ::= [target_list]                                      (default) // : "ezp:void_target_list",
  target_star               /*   ::= "*" target                                         (default) // : "ezp:target_star",
  something_star            /*   ::= "*" something                                      (default) // : "ezp:something_star",
  import_module             /*   ::= "import" non_void_module_as_list                   (default) // : "ezp:import_module",
  module_as_concrete        /*   ::= module "as" module_alias                           (default) // : "ezp:module_as_concrete",
  alias                     /*   ::= some alias                                         (default) // : "ezp:alias",
  from_relative_module_import /*   ::= "from" relative_module "import" non_void_import_identifier_as_list (default) // : "ezp:from_relative_module_import",
  parent_module             /*   ::= '.' [relative_module]                              (default) // : "ezp:parent_module",
  import_identifier_as_concrete /*   ::= import_identifier "as" import_alias                (default) // : "ezp:import_identifier_as_concrete",
  identifier                /*   ::=                                                    (default) // : "ezp:identifier",
  from_module_import        /*   ::= "from" module "import" "*"                         (default) // : "ezp:from_module_import",
  docstring                 /*   ::= triple quoted string                               (default) // : "ezp:docstring",
  expression_from           /*   ::= expression "from" expression                       (default) // : "ezp:expression_from",
  with_item_concrete        /*   ::= expression "as" target                             (default) // : "ezp:with_item_concrete",
  parameter_list            /*   ::=                                                    (default) // : "ezp:parameter_list",
  parameter_list_starargs   /*   ::= "*" [parameter] ("," defparameter)* ["," ["**" parameter [","]]] | "**" parameter [","] (default) // : "ezp:parameter_list_starargs",
  parameter_concrete        /*   ::= identifier ":" expression                          (default) // : "ezp:parameter_concrete",
  defparameter_concrete     /*   ::= parameter "=" expression                           (default) // : "ezp:defparameter_concrete",
  inheritance               /*   ::= "(" [argument_list] ")"                            (default) // : "ezp:inheritance",
  expression_as_name        /*   ::= expression "as" identifier                         (default) // : "ezp:expression_as_name",
  funcdef_simple            /*   ::= "def" funcname "(" [parameter_list] ")"            (default) // : "ezp:funcdef_simple",
  funcdef_typed             /*   ::= funcdef_simple "->" expression                     (default) // : "ezp:funcdef_typed",
  decorator_expr            /*   ::= "@" dotted_funcname                                (default) // : "ezp:decorator_expr",
  decorator_call_expr       /*   ::= decorator_expr "(" argument_list ")"               (default) // : "ezp:decorator_call_expr",
  dotted_funcname_concrete  /*   ::= dotting_identifier '.' dotted_funcname             (default) // : "ezp:dotted_funcname_concrete",
  parameter_star            /*   ::= "*" [parameter]                                    (default) // : "ezp:parameter_star",
  parameter_star_star       /*   ::= "**" parameter                                     (default) // : "ezp:parameter_star_star",
  classdef_simple           /*   ::= "class" classname                                  (default) // : "ezp:classdef_simple",
  classdef_derived          /*   ::= classdef_simple '(' argument_list ')'              (default) // : "ezp:classdef_derived",
  print_builtin             /*   ::= "print(" argument_list ")"                         (default) // : "ezp:print_builtin",
  input_builtin             /*   ::= "input(" [any_argument] ")"                        (default) // : "ezp:input_builtin",
  sum_builtin               /*   ::= "sum(" argument_list ")"                           (default) // : "ezp:sum_builtin",
  list_builtin              /*   ::= "list(" argument_list ")"                          (default) // : "ezp:list_builtin",
  range_builtin             /*   ::= "range(" argument_list ")"                         (default) // : "ezp:range_builtin",
  len_builtin               /*   ::= "len(" argument_list ")"                           (default) // : "ezp:len_builtin",
// lists
  key_datum_list            /*   ::= key_datum ("," key_datum)* [","]                   (default) // : "ezp:key_datum_list",
  slice_list                /*   ::= slice_item ("," slice_item)* [","]                 (default) // : "ezp:slice_list",
  non_void_starred_item_list /*   ::= starred_item ( ',' starred_item ) * [',']          (default) // : "ezp:non_void_starred_item_list",
  comp_iter_list            /*   ::= (comp_iter) *                                      (default) // : "ezp:comp_iter_list",
  target_list               /*   ::= target ("," target)* [","]                         (default) // : "ezp:target_list",
  non_void_module_as_list   /*   ::= module_as ( "," module_as )*                       (default) // : "ezp:non_void_module_as_list",
  non_void_import_identifier_as_list /*   ::= import_identifier_as ( "," import_identifier_as )* (default) // : "ezp:non_void_import_identifier_as_list",
  non_void_identifier_list  /*   ::= identifier ("," identifier)*                       (default) // : "ezp:non_void_identifier_list",
  dotted_name               /*   ::= identifier ("." identifier)*                       (default) // : "ezp:dotted_name",
  with_item_list            /*   ::= with_item ("," with_item)*                         (default) // : "ezp:with_item_list",
// wrappers, like starred_item ::=  expression | star_expr
  atom                      /*   ::= identifier | literal | enclosure | builtin_object  (default) // : "ezp:atom",
  enclosure                 /*   ::= parenth_form | list_display | dict_display | set_display | generator_expression | yield_atom (default) // : "ezp:enclosure",
  literal                   /*   ::= shortstringliteral | numberliteral | imagnumber | docstring (default) // : "ezp:literal",
  comp_iter                 /*   ::= comp_for | comp_if                                 (default) // : "ezp:comp_iter",
  key_datum                 /*   ::= key_datum_concrete | or_expr_star_star             (default) // : "ezp:key_datum",
  yield_expression          /*   ::= yield_expression_list | yield_from_expression      (default) // : "ezp:yield_expression",
  primary                   /*   ::= atom | attributeref | subscription | slicing | call (default) // : "ezp:primary",
  slice_item                /*   ::= expression | proper_slice                          (default) // : "ezp:slice_item",
  power                     /*   ::= await_or_primary | power_concrete                  (default) // : "ezp:power",
  u_expr                    /*   ::= power | u_expr_concrete                            (default) // : "ezp:u_expr",
  m_expr                    /*   ::= u_expr | m_expr_concrete                           (default) // : "ezp:m_expr",
  a_expr                    /*   ::= m_expr | a_expr_concrete                           (default) // : "ezp:a_expr",
  shift_expr                /*   ::= a_expr | shift_expr_concrete                       (default) // : "ezp:shift_expr",
  and_expr                  /*   ::= shift_expr | and_expr_concrete                     (default) // : "ezp:and_expr",
  xor_expr                  /*   ::= and_expr | xor_expr_concrete                       (default) // : "ezp:xor_expr",
  or_expr                   /*   ::= xor_expr | or_expr_concrete                        (default) // : "ezp:or_expr",
  comparison                /*   ::= or_expr | number_comparison | object_comparison    (default) // : "ezp:comparison",
  or_test                   /*   ::= and_test | or_test_concrete                        (default) // : "ezp:or_test",
  and_test                  /*   ::= not_test | and_test_concrete                       (default) // : "ezp:and_test",
  not_test                  /*   ::= comparison | not_test_concrete                     (default) // : "ezp:not_test",
  conditional_expression    /*   ::= or_test | conditional_expression_concrete          (default) // : "ezp:conditional_expression",
  expression                /*   ::= conditional_expression | lambda_expr               (default) // : "ezp:expression",
  expression_nocond         /*   ::= or_test | lambda_expr_nocond                       (default) // : "ezp:expression_nocond",
  starred_item              /*   ::= expression | star_expr                             (default) // : "ezp:starred_item",
  not_a_variable            /*   ::= attribute_identifier | module | module_as | module_identifier | module_alias | import_identifier | import_alias | relative_module | import_identifier_as (default) // : "ezp:not_a_variable",
  numberliteral             /*   ::= bytesliteral | number | numberliteral_concrete     (default) // : "ezp:numberliteral",
  number                    /*   ::= integer | floatnumber                              (default) // : "ezp:number",
  starred_item_list_comprehensive /*   ::= starred_item | comprehension                       (default) // : "ezp:starred_item_list_comprehensive",
  non_void_starred_item_list_comprehensive /*   ::= starred_item | comprehension                       (default) // : "ezp:non_void_starred_item_list_comprehensive",
  key_datum_list_comprehensive /*   ::= key_datum | dict_comprehension                     (default) // : "ezp:key_datum_list_comprehensive",
  argument_any              /*   ::= expression | expression_star | expression_star_star | keyword_item (default) // : "ezp:argument_any",
  argument_list_comprehensive /*   ::= argument_list | comprehension                      (default) // : "ezp:argument_list_comprehensive",
  await_or_primary          /*   ::= await_expr | primary                               (default) // : "ezp:await_or_primary",
  algebra_choice            /*   ::= m_expr_concrete | a_expr_concrete                  (default) // : "ezp:algebra_choice",
  bitwise_choice            /*   ::= shift_expr_concrete | and_expr_concrete | xor_expr_concrete | or_expr_concrete (default) // : "ezp:bitwise_choice",
  boolean_choice            /*   ::= and_test_concrete | or_test_concrete               (default) // : "ezp:boolean_choice",
  unary_choice              /*   ::= u_expr_concrete | not_test_concrete                (default) // : "ezp:unary_choice",
  target                    /*   ::= target_unstar | target_star                        (default) // : "ezp:target",
  augtarget                 /*   ::= identifier | attributeref | subscription | slicing (default) // : "ezp:augtarget",
  module                    /*   ::= module_name | module_concrete                      (default) // : "ezp:module",
  relative_module           /*   ::= module | parent_module                             (default) // : "ezp:relative_module",
  assigned_list             /*   ::= starred_item | assigned_single                     (default) // : "ezp:assigned_list",
  assigned_single           /*   ::= yield_expression | assignment_expression           (default) // : "ezp:assigned_single",
  augassign_list            /*   ::= augassign_list_concrete | augassign_single        (default) // : "ezp:augassign_list",
  augassign_single         /*   ::= expression | yield_expression                      (default) // : "ezp:augassign_single",
  target_unstar             /*   ::= identifier | parenth_target_list | bracket_target_list | attributeref | subscription | slicing (default) // : "ezp:target_unstar",
  import_expr               /*   ::= import_module | from_relative_module_import | from_module_import (default) // : "ezp:import_expr",
  module_as                 /*   ::= module | module_as_concrete                        (default) // : "ezp:module_as",
  module_alias              /*   ::= identifier                                         (default) // : "ezp:module_alias",
  import_identifier_as      /*   ::= import_identifier | import_identifier_as_concrete  (default) // : "ezp:import_identifier_as",
  import_identifier         /*   ::= identifier                                         (default) // : "ezp:import_identifier",
  import_alias              /*   ::= identifier                                         (default) // : "ezp:import_alias",
  raise_expression          /*   ::= expression | expression_from                       (default) // : "ezp:raise_expression",
  with_item                 /*   ::= expression | with_item_concrete                    (default) // : "ezp:with_item",
  decorator                 /*   ::= decorator_expr | decorator_call_expr               (default) // : "ezp:decorator",
  parameter                 /*   ::= identifier | parameter_concrete                    (default) // : "ezp:parameter",
  defparameter              /*   ::= parameter | defparameter_concrete                  (default) // : "ezp:defparameter",
  expression_except         /*   ::= expression | expression_as_name                    (default) // : "ezp:expression_except",
  funcdef_expr              /*   ::= funcdef_simple | funcdef_typed                     (default) // : "ezp:funcdef_expr",
  dotted_funcname           /*   ::= funcname | dotted_funcname_concrete                (default) // : "ezp:dotted_funcname",
  parameter_any             /*   ::= parameter | defparameter | parameter_star | parameter_star_star (default) // : "ezp:parameter_any",
  classdef_expr             /*   ::= classdef_simple | classdef_derived  
*/