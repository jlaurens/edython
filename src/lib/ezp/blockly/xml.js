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

/**
 * Decode an XML DOM and create blocks on the workspace.
 * @overriden to support other kind of blocks
 * This is a copy with a tiny formal modification.
 * @param {!Element} xml XML DOM.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {Array.<string>} An array containing new block IDs.
 */
ezP.Xml.domToChildBlock = function(xmlChild, workspace) {
  var newBlockIds = []
  var name = xmlChild.nodeName.toLowerCase()
  if (name == 'literal' || name == 'expr' || name == 'stmt') {
    var block = Blockly.Xml.domToBlock(xmlChild, workspace);
    newBlockIds.push(block.id);
    var blockX = parseInt(xmlChild.getAttribute('x'), 10);
    var blockY = parseInt(xmlChild.getAttribute('y'), 10);
    if (!isNaN(blockX) && !isNaN(blockY)) {
      block.moveBy(blockX, blockY);
    }
  }
  return newBlockIds
}
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
      var xmlChild = xml.childNodes[i];
      var name = xmlChild.nodeName.toLowerCase();
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
        newBlockIds = newBlockIds.concat(ezP.Xml.domToChildBlock(xmlChild, workspace))
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
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements.
 */
ezP.Xml.blockToDom = Blockly.Xml.blockToDom
Blockly.Xml.blockToDom = function (block, optNoId) {
  if (block.type.indexOf('ezp_')<0) {
    return ezP.Xml.blockToDom(block, optNoId)
  }
  var element
  if (block.ezp.blockToDom && (element = block.ezp.blockToDom(block, optNoId))) {
    return element
  }
  var element = goog.dom.createDom(block.ezp.xmlTagName(block))
  var type = block.ezp.xmlType(block)
  if (type) {
    element.setAttribute('type', type)
  }
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
ezP.Xml.domToBlockHeadless_ = Blockly.Xml.domToBlockHeadless_
Blockly.Xml.domToBlockHeadless_ = function (xmlBlock, workspace) {
  var block = null
  var prototypeName = xmlBlock.getAttribute('type')
  var id = xmlBlock.getAttribute('id')
  if (!prototypeName) {
    var text = ''
    for (var i = 0, xmlChild; (xmlChild = xmlBlock.childNodes[i]); i++) {
      if (xmlChild.nodeType === 3) {
        text = xmlChild.nodeValue
        break
      }
    }
    prototypeName = ezP.Do.typeOfString(text) || ezP.T3.Expr.numberliteral
    if ((block = ezP.DelegateSvg.newBlockComplete(workspace, prototypeName, id))) {
      block.ezp.setValue(block, text)
    }
    return block
  }
  if (prototypeName.indexOf('ezp_')<0) {
    return ezP.Xml.domToBlockHeadless_(xmlBlock, workspace)
  }
  var concrete = prototypeName + '_concrete'
  block = ezP.DelegateSvg.Manager.get(concrete)? workspace.newBlock(concrete, id): workspace.newBlock(prototypeName, id)

  if (goog.isFunction(block.ezp.domToBlock)) {
    block.ezp.domToBlock(block, xmlBlock)
    return block
  } else if (goog.isFunction(block.ezp.domChildToBlock)) {
    block.ezp.domChildToBlock(block, xmlBlock)
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

goog.require('ezP.DelegateSvg.Expr')

/**
 * Convert the block to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {boolean} optNoId Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Expr.blockToDom = function(block, optNoId) {
  var text = block.ezp.getValue(block)
  var element = goog.dom.createDom(block.ezp.xmlTagName(block),
    null,
    goog.dom.createTextNode(text)
  )
  var t = block.ezp.xmlType(block)
  if (t) {
    element.setAttribute('type', block.ezp.xmlType_)
  }
  if (!optNoId) {
    element.setAttribute('id', block.id)
  }
  return element
}

/**
 * Convert dom element to the block.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be edited.
 * @param {Element} xml Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Expr.domToBlock = function(block, xml) {
  var text = ''
  for (var i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
    if (xmlChild.nodeType === 3) {
      text = xmlChild.nodeValue
      break
    }
  }
  block.ezp.setValue(block, text)
}

goog.require('ezP.DelegateSvg.Expr.longstringliteral')

/**
 * Convert the block to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} optNoId Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Expr.longstringliteral.prototype.blockToDom = ezP.DelegateSvg.Expr.blockToDom

/**
 * Convert dom element to the block.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Element} xml Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Expr.longstringliteral.prototype.domToBlock = ezP.DelegateSvg.Expr.domToBlock

goog.require('ezP.DelegateSvg.Expr.numberliteral')

/**
 * Convert the block to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} optNoId Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.blockToDom = ezP.DelegateSvg.Expr.blockToDom

/**
 * Convert dom element to the block.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Element} xml Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.domToBlock = ezP.DelegateSvg.Expr.domToBlock

goog.require('ezP.DelegateSvg.Expr.shortliteral')

ezP.DelegateSvg.Expr.shortliteral.prototype.blockToDom = ezP.DelegateSvg.Expr.blockToDom

ezP.DelegateSvg.Expr.shortliteral.prototype.domToBlock = ezP.DelegateSvg.Expr.domToBlock

goog.require('ezP.DelegateSvg.Expr.numberliteral')

/**
 * Convert the block to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} optNoId Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.blockToDom = ezP.DelegateSvg.Expr.blockToDom

/**
 * Convert dom element to the block.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Element} xml Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Expr.numberliteral.prototype.domToBlock = ezP.DelegateSvg.Expr.domToBlock

goog.require('ezP.DelegateSvg.Operator')

/**
 * Convert the block to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {boolean} optNoId Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Operator.blockToDomUnary = function(block, optNoId) {
  var element = goog.dom.createDom('block')
  element.setAttribute('type', block.ezp.xmlType_)
  if (!optNoId) {
    element.setAttribute('id', block.id)
  }
  element.setAttribute('operator', block.ezp.getValue(block))
  return element
}

/**
 * Convert dom element to the block.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be edited.
 * @param {Element} xml Is a function.
 * @return a dom element
 */
ezP.DelegateSvg.Operator.domToBlockUnary = function(block, xml) {
  var operator = xml.getAttribute('operator')
  block.ezp.setValue(block, operator)
}

/*
IN PROGRESS
  power_concrete            /*   ::= await_or_primary "**" u_expr                       (default) // : "ezp_power_concrete",
  u_expr_concrete           /*   ::= "-" u_expr | "+" u_expr | "~" u_expr               (default) // : "ezp_u_expr_concrete",
  m_expr_concrete           /*   ::= m_expr "*" u_expr | m_expr "@" m_expr | m_expr "//" u_expr| m_expr "/" u_expr | m_expr "%" u_expr (default) // : "ezp_m_expr_concrete",
  a_expr_concrete           /*   ::= a_expr "+" m_expr | a_expr "-" m_expr              (default) // : "ezp_a_expr_concrete",
  shift_expr_concrete       /*   ::= shift_expr ( "<<" | ">>" ) a_expr                  (default) // : "ezp_shift_expr_concrete",
  and_expr_concrete         /*   ::= and_expr "&" shift_expr                            (default) // : "ezp_and_expr_concrete",
  xor_expr_concrete         /*   ::= xor_expr "^" and_expr                              (default) // : "ezp_xor_expr_concrete",
  or_expr_concrete          /*   ::= or_expr "|" xor_expr                               (default) // : "ezp_or_expr_concrete",
  or_test_concrete          /*   ::= or_test "or" and_test                              (default) // : "ezp_or_test_concrete",
  and_test_concrete         /*   ::= and_test "and" not_test                            (default) // : "ezp_and_test_concrete",
  not_test_concrete         /*   ::= "not" not_test                                     (default) // : "ezp_not_test_concrete",
  module_identifier         /*   ::=                                                    (default) // : "ezp_module_identifier",
  attribute_identifier      /*   ::=                                                    (default) // : "ezp_attribute_identifier",
  non_void_expression_list  /*   ::=                                                    (default) // : "ezp_non_void_expression_list",
  parenth_form              /*   ::= "(" [starred_expression] ")"                       (default) // : "ezp_parenth_form",
  comprehension             /*   ::= expression comp_for                                (default) // : "ezp_comprehension",
  comp_for                  /*   ::= [ASYNC] "for" target_list "in" or_test [comp_iter] (default) // : "ezp_comp_for",
  comp_if                   /*   ::= "if" expression_nocond [comp_iter]                 (default) // : "ezp_comp_if",
  list_display              /*   ::= "[" starred_item_list_comprehensive "]"            (default) // : "ezp_list_display",
  set_display               /*   ::= "{" non_void_starred_item_list_comprehensive "}"   (default) // : "ezp_set_display",
  dict_display              /*   ::= "{" [key_datum_list | dict_comprehension] "}"      (default) // : "ezp_dict_display",
  dict_comprehension        /*   ::= expression ":" expression comp_for                 (default) // : "ezp_dict_comprehension",
  generator_expression      /*   ::= "(" expression comp_for ")"                        (default) // : "ezp_generator_expression",
  yield_atom                /*   ::= "(" yield_expression ")"                           (default) // : "ezp_yield_atom",
  attributeref              /*   ::= primary "." identifier                             (default) // : "ezp_attributeref",
  subscription              /*   ::= primary "[" expression_list "]"                    (default) // : "ezp_subscription",
  slicing                   /*   ::= primary display_slice_list                         (default) // : "ezp_slicing",
  proper_slice              /*   ::= [lower_bound] ":" [upper_bound] [ ":" [stride] ]   (default) // : "ezp_proper_slice",
  call_expr                 /*   ::= primary "(" [argument_list [","] | comprehension] ")" (default) // : "ezp_call_expr",
  argument_list             /*   ::= argument_any *                                     (default) // : "ezp_argument_list",
  keyword_item              /*   ::= identifier "=" expression                          (default) // : "ezp_keyword_item",
  await_expr                /*   ::= "await" primary                                    (default) // : "ezp_await_expr",
  conditional_expression_concrete /*   ::= or_test "if" or_test "else" expression             (default) // : "ezp_conditional_expression_concrete",
  lambda_expr               /*   ::= lambda_expression "dynamic with cond"              (default) // : "ezp_lambda_expr",
  lambda_expr_nocond        /*   ::= lambda_expression "dynamic without cond"           (default) // : "ezp_lambda_expr_nocond",
  builtin_object            /*   ::= 'None' | 'True' | 'False' | 'Ellipsis' | '...' |'NotImplemented' (default) // : "ezp_builtin_object",
  any                       /*   ::= any expression                                     (default) // : "ezp_any",
  starred_item_list         /*   ::= starred_item ? ( ',' starred_item ) * [',']        (default) // : "ezp_starred_item_list",
  star_expr                 /*   ::= "*" or_expr                                        (default) // : "ezp_star_expr",
  optional_expression_list  /*   ::= ( expression ',' )* [ expression ]                 (default) // : "ezp_optional_expression_list",
  key_datum_concrete        /*   ::= expression ":" expression                          (default) // : "ezp_key_datum_concrete",
  or_expr_star_star         /*   ::= "**" or_expr                                       (default) // : "ezp_or_expr_star_star",
  yield_expression_list     /*   ::= "yield" expression_list                            (default) // : "ezp_yield_expression_list",
  yield_from_expression     /*   ::= "yield" "from" expression                          (default) // : "ezp_yield_from_expression",
  display_slice_list        /*   ::= "[" slice_list "]"                                 (default) // : "ezp_display_slice_list",
  call_expr                 /*   ::= primary "(" argument_list_comprehensive ")"        (default) // : "ezp_call_expr",
  expression_star           /*   ::= "*" expression                                     (default) // : "ezp_expression_star",
  expression_star_star      /*   ::= "**" expression                                    (default) // : "ezp_expression_star_star",
  number_comparison         /*   ::= comparison comp_operator comparison                (default) // : "ezp_number_comparison",
  object_comparison         /*   ::= comparison comp_operator comparison                (default) // : "ezp_object_comparison",
  lambda_expression         /*   ::= "lambda" [parameter_list]: (expression | expression_no_cond) (default) // : "ezp_lambda_expression",
  augop                     /*   ::= "+=" | "-=" | "*=" | "@=" | "/=" | "//=" | "%=" | "**=" | ">>=" | "<<=" | "&=" | "^=" | "|=" (default) // : "ezp_augop",
  module_concrete           /*   ::= module_name '.' module                             (default) // : "ezp_module_concrete",
  assignment_expression     /*   ::= target_list "=" assigned_list                      (default) // : "ezp_assignment_expression",
  augassign_numeric         /*   ::= augtarget augop aug_assign_list                    (default) // : "ezp_augassign_numeric",
  augassign_bitwise         /*   ::= augtarget augop aug_assign_list                    (default) // : "ezp_augassign_bitwise",
  augassign_list_concrete   /*   ::=  ( expression ',' ) +                              (default) // : "ezp_augassign_list_concrete",
  parenth_target_list       /*   ::= "(" void_target_list ")"                           (default) // : "ezp_parenth_target_list",
  bracket_target_list       /*   ::= "[" void_target_list "]"                           (default) // : "ezp_bracket_target_list",
  void_target_list          /*   ::= [target_list]                                      (default) // : "ezp_void_target_list",
  target_star               /*   ::= "*" target                                         (default) // : "ezp_target_star",
  something_star            /*   ::= "*" something                                      (default) // : "ezp_something_star",
  import_module             /*   ::= "import" non_void_module_as_list                   (default) // : "ezp_import_module",
  module_as_concrete        /*   ::= module "as" module_alias                           (default) // : "ezp_module_as_concrete",
  alias                     /*   ::= some alias                                         (default) // : "ezp_alias",
  from_relative_module_import /*   ::= "from" relative_module "import" non_void_import_identifier_as_list (default) // : "ezp_from_relative_module_import",
  parent_module             /*   ::= '.' [relative_module]                              (default) // : "ezp_parent_module",
  import_identifier_as_concrete /*   ::= import_identifier "as" import_alias                (default) // : "ezp_import_identifier_as_concrete",
  identifier                /*   ::=                                                    (default) // : "ezp_identifier",
  from_module_import        /*   ::= "from" module "import" "*"                         (default) // : "ezp_from_module_import",
  docstring                 /*   ::= triple quoted string                               (default) // : "ezp_docstring",
  expression_from           /*   ::= expression "from" expression                       (default) // : "ezp_expression_from",
  with_item_concrete        /*   ::= expression "as" target                             (default) // : "ezp_with_item_concrete",
  parameter_list            /*   ::=                                                    (default) // : "ezp_parameter_list",
  parameter_list_starargs   /*   ::= "*" [parameter] ("," defparameter)* ["," ["**" parameter [","]]] | "**" parameter [","] (default) // : "ezp_parameter_list_starargs",
  parameter_concrete        /*   ::= identifier ":" expression                          (default) // : "ezp_parameter_concrete",
  defparameter_concrete     /*   ::= parameter "=" expression                           (default) // : "ezp_defparameter_concrete",
  inheritance               /*   ::= "(" [argument_list] ")"                            (default) // : "ezp_inheritance",
  expression_as_name        /*   ::= expression "as" identifier                         (default) // : "ezp_expression_as_name",
  funcdef_simple            /*   ::= "def" funcname "(" [parameter_list] ")"            (default) // : "ezp_funcdef_simple",
  funcdef_typed             /*   ::= funcdef_simple "->" expression                     (default) // : "ezp_funcdef_typed",
  decorator_expr            /*   ::= "@" dotted_funcname                                (default) // : "ezp_decorator_expr",
  decorator_call_expr       /*   ::= decorator_expr "(" argument_list ")"               (default) // : "ezp_decorator_call_expr",
  dotted_funcname_concrete  /*   ::= dotting_identifier '.' dotted_funcname             (default) // : "ezp_dotted_funcname_concrete",
  parameter_star            /*   ::= "*" [parameter]                                    (default) // : "ezp_parameter_star",
  parameter_star_star       /*   ::= "**" parameter                                     (default) // : "ezp_parameter_star_star",
  classdef_simple           /*   ::= "class" classname                                  (default) // : "ezp_classdef_simple",
  classdef_derived          /*   ::= classdef_simple '(' argument_list ')'              (default) // : "ezp_classdef_derived",
  print_builtin             /*   ::= "print(" argument_list ")"                         (default) // : "ezp_print_builtin",
  input_builtin             /*   ::= "input(" [any_argument] ")"                        (default) // : "ezp_input_builtin",
  sum_builtin               /*   ::= "sum(" argument_list ")"                           (default) // : "ezp_sum_builtin",
  list_builtin              /*   ::= "list(" argument_list ")"                          (default) // : "ezp_list_builtin",
  range_builtin             /*   ::= "range(" argument_list ")"                         (default) // : "ezp_range_builtin",
  len_builtin               /*   ::= "len(" argument_list ")"                           (default) // : "ezp_len_builtin",
// lists
  key_datum_list            /*   ::= key_datum ("," key_datum)* [","]                   (default) // : "ezp_key_datum_list",
  slice_list                /*   ::= slice_item ("," slice_item)* [","]                 (default) // : "ezp_slice_list",
  non_void_starred_item_list /*   ::= starred_item ( ',' starred_item ) * [',']          (default) // : "ezp_non_void_starred_item_list",
  comp_iter_list            /*   ::= (comp_iter) *                                      (default) // : "ezp_comp_iter_list",
  target_list               /*   ::= target ("," target)* [","]                         (default) // : "ezp_target_list",
  non_void_module_as_list   /*   ::= module_as ( "," module_as )*                       (default) // : "ezp_non_void_module_as_list",
  non_void_import_identifier_as_list /*   ::= import_identifier_as ( "," import_identifier_as )* (default) // : "ezp_non_void_import_identifier_as_list",
  non_void_identifier_list  /*   ::= identifier ("," identifier)*                       (default) // : "ezp_non_void_identifier_list",
  dotted_name               /*   ::= identifier ("." identifier)*                       (default) // : "ezp_dotted_name",
  with_item_list            /*   ::= with_item ("," with_item)*                         (default) // : "ezp_with_item_list",
// wrappers, like starred_item ::=  expression | star_expr
  atom                      /*   ::= identifier | literal | enclosure | builtin_object  (default) // : "ezp_atom",
  enclosure                 /*   ::= parenth_form | list_display | dict_display | set_display | generator_expression | yield_atom (default) // : "ezp_enclosure",
  literal                   /*   ::= shortstringliteral | numberliteral | imagnumber | docstring (default) // : "ezp_literal",
  comp_iter                 /*   ::= comp_for | comp_if                                 (default) // : "ezp_comp_iter",
  key_datum                 /*   ::= key_datum_concrete | or_expr_star_star             (default) // : "ezp_key_datum",
  yield_expression          /*   ::= yield_expression_list | yield_from_expression      (default) // : "ezp_yield_expression",
  primary                   /*   ::= atom | attributeref | subscription | slicing | call (default) // : "ezp_primary",
  slice_item                /*   ::= expression | proper_slice                          (default) // : "ezp_slice_item",
  power                     /*   ::= await_or_primary | power_concrete                  (default) // : "ezp_power",
  u_expr                    /*   ::= power | u_expr_concrete                            (default) // : "ezp_u_expr",
  m_expr                    /*   ::= u_expr | m_expr_concrete                           (default) // : "ezp_m_expr",
  a_expr                    /*   ::= m_expr | a_expr_concrete                           (default) // : "ezp_a_expr",
  shift_expr                /*   ::= a_expr | shift_expr_concrete                       (default) // : "ezp_shift_expr",
  and_expr                  /*   ::= shift_expr | and_expr_concrete                     (default) // : "ezp_and_expr",
  xor_expr                  /*   ::= and_expr | xor_expr_concrete                       (default) // : "ezp_xor_expr",
  or_expr                   /*   ::= xor_expr | or_expr_concrete                        (default) // : "ezp_or_expr",
  comparison                /*   ::= or_expr | number_comparison | object_comparison    (default) // : "ezp_comparison",
  or_test                   /*   ::= and_test | or_test_concrete                        (default) // : "ezp_or_test",
  and_test                  /*   ::= not_test | and_test_concrete                       (default) // : "ezp_and_test",
  not_test                  /*   ::= comparison | not_test_concrete                     (default) // : "ezp_not_test",
  conditional_expression    /*   ::= or_test | conditional_expression_concrete          (default) // : "ezp_conditional_expression",
  expression                /*   ::= conditional_expression | lambda_expr               (default) // : "ezp_expression",
  expression_nocond         /*   ::= or_test | lambda_expr_nocond                       (default) // : "ezp_expression_nocond",
  starred_item              /*   ::= expression | star_expr                             (default) // : "ezp_starred_item",
  not_a_variable            /*   ::= attribute_identifier | module | module_as | module_identifier | module_alias | import_identifier | import_alias | relative_module | import_identifier_as (default) // : "ezp_not_a_variable",
  numberliteral             /*   ::= bytesliteral | number | numberliteral_concrete     (default) // : "ezp_numberliteral",
  number                    /*   ::= integer | floatnumber                              (default) // : "ezp_number",
  starred_item_list_comprehensive /*   ::= starred_item | comprehension                       (default) // : "ezp_starred_item_list_comprehensive",
  non_void_starred_item_list_comprehensive /*   ::= starred_item | comprehension                       (default) // : "ezp_non_void_starred_item_list_comprehensive",
  key_datum_list_comprehensive /*   ::= key_datum | dict_comprehension                     (default) // : "ezp_key_datum_list_comprehensive",
  argument_any              /*   ::= expression | expression_star | expression_star_star | keyword_item (default) // : "ezp_argument_any",
  argument_list_comprehensive /*   ::= argument_list | comprehension                      (default) // : "ezp_argument_list_comprehensive",
  await_or_primary          /*   ::= await_expr | primary                               (default) // : "ezp_await_or_primary",
  algebra_choice            /*   ::= m_expr_concrete | a_expr_concrete                  (default) // : "ezp_algebra_choice",
  bitwise_choice            /*   ::= shift_expr_concrete | and_expr_concrete | xor_expr_concrete | or_expr_concrete (default) // : "ezp_bitwise_choice",
  boolean_choice            /*   ::= and_test_concrete | or_test_concrete               (default) // : "ezp_boolean_choice",
  unary_choice              /*   ::= u_expr_concrete | not_test_concrete                (default) // : "ezp_unary_choice",
  target                    /*   ::= target_unstar | target_star                        (default) // : "ezp_target",
  augtarget                 /*   ::= identifier | attributeref | subscription | slicing (default) // : "ezp_augtarget",
  module                    /*   ::= module_name | module_concrete                      (default) // : "ezp_module",
  relative_module           /*   ::= module | parent_module                             (default) // : "ezp_relative_module",
  assigned_list             /*   ::= starred_item | assigned_single                     (default) // : "ezp_assigned_list",
  assigned_single           /*   ::= yield_expression | assignment_expression           (default) // : "ezp_assigned_single",
  augassign_list            /*   ::= augassign_list_concrete | augassign_content        (default) // : "ezp_augassign_list",
  augassign_content         /*   ::= expression | yield_expression                      (default) // : "ezp_augassign_content",
  target_unstar             /*   ::= identifier | parenth_target_list | bracket_target_list | attributeref | subscription | slicing (default) // : "ezp_target_unstar",
  import_expr               /*   ::= import_module | from_relative_module_import | from_module_import (default) // : "ezp_import_expr",
  module_as                 /*   ::= module | module_as_concrete                        (default) // : "ezp_module_as",
  module_alias              /*   ::= identifier                                         (default) // : "ezp_module_alias",
  import_identifier_as      /*   ::= import_identifier | import_identifier_as_concrete  (default) // : "ezp_import_identifier_as",
  import_identifier         /*   ::= identifier                                         (default) // : "ezp_import_identifier",
  import_alias              /*   ::= identifier                                         (default) // : "ezp_import_alias",
  raise_expression          /*   ::= expression | expression_from                       (default) // : "ezp_raise_expression",
  with_item                 /*   ::= expression | with_item_concrete                    (default) // : "ezp_with_item",
  decorator                 /*   ::= decorator_expr | decorator_call_expr               (default) // : "ezp_decorator",
  parameter                 /*   ::= identifier | parameter_concrete                    (default) // : "ezp_parameter",
  defparameter              /*   ::= parameter | defparameter_concrete                  (default) // : "ezp_defparameter",
  expression_except         /*   ::= expression | expression_as_name                    (default) // : "ezp_expression_except",
  funcdef_expr              /*   ::= funcdef_simple | funcdef_typed                     (default) // : "ezp_funcdef_expr",
  dotted_funcname           /*   ::= funcname | dotted_funcname_concrete                (default) // : "ezp_dotted_funcname",
  parameter_any             /*   ::= parameter | defparameter | parameter_star | parameter_star_star (default) // : "ezp_parameter_any",
  classdef_expr             /*   ::= classdef_simple | classdef_derived  
*/