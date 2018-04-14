/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Xml override.
 * The default block to and from Xml translation is rewritten.
 * There are mainly 4 entries:
 * 1) blockToDom, to convert a given block into an xml tree.
 * 2) domToBlock, to create a block from an xml tree.
 * 3) toDom, to convert the block content, into an existing xml element
 * 4) fromDom, to convert the content of an existing element into a block.
 * The Blockly original methods are overriden to manage the ezPython blocks.
 * The xml nodes concerning ezPython all pertain to the `ezp` namespace.
 * There are separate xml nodes for statements and expressions,
 * the latter are characterized by an input attribute, which may be
 * a void string. This is useful for call expression that can appear as
 * statements too.
 * The domToWorkspace has been overriden to manage more blocks.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Xml')

goog.require('ezP.Const')
goog.require('ezP.T3')

goog.require('Blockly.Xml')

ezP.Xml = {
  INPUT: 'input', // attribute name
  FLOW: 'flow', // attribute name
  NEXT: 'next', // attribute name

  LIST: 'ezp:list',
  LITERAL: 'ezp:literal',
  COMPARISON: 'ezp:comparison',
  AUGMENTED_ASSIGNMENT: 'ezp:augmented_assignment',
  LAMBDA: 'ezp:lambda',
  CALL: 'ezp:call',
  BUILTIN: 'ezp:builtin',
  BUILTIN_CALL: 'ezp:builtin_call',
  GLOBAL: 'ezp:global',
  NONLOCAL: 'ezp:nonlocal',
}

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 * Overriden to add the `ezp` namespace.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Value representation.
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
        // for ezPython
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

/**
 * Encode a block subtree as XML.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {Element} xml the persistent element.
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
    return ezP.Xml.domToBlock(xmlBlock, workspace)
  }
}


/**
 * Encode a block subtree as XML.
 * There are various hooks at different levels.
 * Control is tranferred to the first object in the following list
 * which implements a blockToDom function, if any.
 * 1) block.ezp
 * 2) block.ezp.xml
 * 3) block.ezp.constructor.xml
 * 4) block.ezp.constructor
 * Otherwise an xml element with the block's tag name is created.
 * Then it is populated with the toDom method.
 * There are 5 particular situations: literal, augmented assignments and comparisons, wrapped blocks, list blocks and finally concrete blocks.
 * 1) Literal blocks include various numbers and strings.
 * They all share the same tag name: ezp:literal.
 * The concrete block type is guessed from
 * the nature of the block content.
 * It's easy to encode such blocks, but decoding is based on the use
 * of a regular expression.
 * 2) Augmented assignments and comparisons.
 * The number of operators involved in augmented assignment is very big.
 * We separate in 2 categories:
 * number assignment and bitwise assignment.
 * This allows a simpler user interface.
 * Encoding the blocks is straightforward, decoding is not.
 * The operator is stored as an attribute and used to distinguish between
 * bitwise and number augmented assignments.
 * Augmented assignment exist in both statement and expression version
 * despite python only knows about augmented assignment statement.
 * This may change in the future to stick to python definitions.
 * The same holds for comparison blocks, mutatis mutandis.
 * 3) List blocks are meant to be wrapped. They should never appear
 * as top blocks. When wrapped, the tag name is always ezp:list.
 * The concrete type is encoded in the input attribute,
 * it also depends on the enclosing block.
 * 4) Wrapped blocks other than lists will not add an xml child level.
 * As a consequence, this method just returns nothing for such blocks.
 * 5) concrete blocks are named after their type which ezp:foo_concrete.
 * These block types correspond to an alternate in the python grammar.
 * The persistence storage may remember these blocks as ezp:foo instead of ezp:foo_concrete.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
ezP.Xml.blockToDom = function (block, optNoId) {
  var ezp = block.ezp
  if (ezp.wrapped_  && !(ezp instanceof ezP.DelegateSvg.List)) {
    // a wrapped block does not create a new element on its own
    // it only can populate an already existing xml node.
    // Except for list nodes.
    return
  }
  var controller = ezp
  if ((controller &&
    goog.isFunction(controller.blockToDom)) ||
    ((controller = ezp.xml) &&
    goog.isFunction(controller.blockToDom)) ||
    ((controller = ezp.constructor) &&
    (controller = controller.xml) &&
    goog.isFunction(controller.blockToDom)) ||
    ((controller = ezp.constructor) &&
    goog.isFunction(controller.blockToDom))) {
    return controller.blockToDom.call(controller, block, optNoId)
  }
  var element = goog.dom.createDom(block.ezp.xmlTagName(block))
  if (!optNoId) {
    element.setAttribute('id', block.id)
  }
  ezP.Xml.toDom(block, element, optNoId)
  return element
}

goog.require('ezP.DelegateSvg.Expr')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns the block type.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.Delegate.prototype.xmlTagName = function (block) {
  var tag = (this instanceof ezP.DelegateSvg.Expr? ezP.T3.Xml.toDom.Expr: ezP.T3.Xml.toDom.Stmt)[this.constructor.ezp.key]
  return tag && 'ezp:'+tag || block.type
}

goog.provide('ezP.Xml.Text')

/**
 * Convert the block's value to a text dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element
 */
ezP.Xml.Text.toDom = function(block, element, optNoId) {
  var text = block.ezp.getValue(block)
  var child = goog.dom.createTextNode(text)
  goog.dom.appendChild(element, child)
  return element
}

/**
 * Convert the block from a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element
 */
ezP.Xml.Text.fromDom = function(block, element) {
  var text = ''
  for (var i = 0, xmlChild; (xmlChild = element.childNodes[i]); i++) {
    if (xmlChild.nodeType === 3) {
      text = xmlChild.nodeValue
      break
    }
  }
  block.ezp.setValue(block, text)
}

goog.require('ezP.DelegateSvg.Literal')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns 'ezp:literal'
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.DelegateSvg.Literal.prototype.xmlTagName = function (block) {
  return ezP.Xml.LITERAL
}

goog.provide('ezP.Xml.Literal')
/**
 * Try to create a comparison block from the given element.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Literal.domToBlock = function (element, workspace) {
  var prototypeName = element.nodeName.toLowerCase()
  if (prototypeName.substring(4) !== ezP.T3.Xml.toDom.Expr.shortstringliteral) {
    return
  }
  var id = element.getAttribute('id')
  for (var i = 0, xmlChild; (xmlChild = element.childNodes[i]); i++) {
    if (xmlChild.nodeType === 3) {
      var text = xmlChild.nodeValue
      var type = ezP.Do.typeOfString(text)
      if (ezP.DelegateSvg.Manager.get(type)) {
        var block = ezP.DelegateSvg.newBlockComplete(workspace, type, id)
        if (block) {
          block.ezp.setValue(block, text)
          return block
        }
      }
    }
  }
}

/**
 * Encode a block subtree as XML.
 * The xml element was created to hold what the block contains.
 * Some information is stored as an attribute, whereas other
 * needs another xml node.
 * When possible, the control is transferred to the first controller
 * in the following list which implements a toDom method.
 * 1) block.ezp
 * 2) block.ezp.xml
 * 3) block.ezp.constructor.xml (no inheritance)
 * 4) block.ezp.constructor (no inheritance here too)
 * The default implementation does nothing if there's no controller
 * to take control.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {element} dom element to encode in
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
ezP.Xml.toDom = function (block, element, optNoId) {
  var ezp = block.ezp
  var controller = ezp
  if ((controller && goog.isFunction(controller.toDom)) ||
    ((controller = ezp.xml) && goog.isFunction(controller.toDom)) ||
    ((controller = ezp.constructor.xml) && goog.isFunction(controller.toDom)) ||
    ((controller = ezp.constructor) && goog.isFunction(controller.toDom))) {
      return controller.toDom.call(controller, block, element, optNoId)
  }
}

/**
 * Decode an XML block tag and create a block (and possibly sub blocks)
 * on the workspace.
 * Try to decode a literal or an augmented assignment.
 * If that does not work, try to deconde ans ezPython block,
 * if that still does not work, fall down to the original
 * Blockly's method.
 * We have 2 hooks levels.
 * If a controller implements a domToBlock method,
 * control is tranferred to it.
 * A controller is either the xml instance of a constructor,
 * of the constructor itself.
 * Is it really headless ?
 * 
 * @param {!Element} xmlBlock XML block element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {!Blockly.Block} The root block created.
 */
ezP.Xml.domToBlock = function(xmlBlock, workspace) {
  var block = null
  if (!xmlBlock.nodeName) {
    return block
  }
  var name = xmlBlock.nodeName.toLowerCase()
  var prototypeName
  // is there a simple correspondance with a known type
  if ((prototypeName = ezP.T3.Xml.fromDom[name.substring(4)])) {
    // nothing more to do here
  }
  // is it a literal or an augmented assignment ?
  else if ((block = ezP.Xml.Literal.domToBlock(xmlBlock, workspace))
  || (block = ezP.Xml.Comparison.domToBlock(xmlBlock, workspace))
  || (block = ezP.Xml.Group.domToBlock(xmlBlock, workspace))
  || (block = ezP.Xml.AugAssign.domToBlock(xmlBlock, workspace))
  || (block = ezP.Xml.Global.domToBlock(xmlBlock, workspace))) {
    return block
  } else {
    prototypeName = name
  }
  // Now create the block, either concrete or not
  var id = xmlBlock.getAttribute('id')

  var concrete = prototypeName + '_concrete'
  var controller = ezP.DelegateSvg.Manager.get(concrete)
  if (controller) {
    if (controller.ezp && goog.isFunction(controller.ezp.domToBlock)) {
      return controller.ezp.domToBlock(xmlBlock, workspace, id)
    } else if (goog.isFunction(controller.domToBlock)) {
      return controller.domToBlock(xmlBlock, workspace, id)
    }
    block = ezP.DelegateSvg.newBlockComplete(workspace, concrete, id)
  } else if ((controller = ezP.DelegateSvg.Manager.get(prototypeName))) {
    if (controller.ezp && goog.isFunction(controller.ezp.domToBlock)) {
      return controller.ezp.domToBlock(xmlBlock, workspace, id)
    } else if (goog.isFunction(controller.domToBlock)) {
      return controller.domToBlock(xmlBlock, workspace, id)
    }
    block = ezP.DelegateSvg.newBlockComplete(workspace, prototypeName, id)
  }
  if (block) {
    console.log('Block created from dom:', xmlBlock, block.type, block.id)
    // then fill it based on the xml data
    ezP.Xml.fromDom(block, xmlBlock)
  }
  return block
}

/**
 * Decode a block subtree from XML.
 * When possible, the control is transferred to the first controller
 * in the following list which implements a fromDom method.
 * 1) block.ezp
 * 2) block.ezp.xml
 * 3) block.ezp.constructor.xml (no inheritance)
 * 4) block.ezp.constructor (no inheritance here too)
 * The default implementation does nothing if there's no controller
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

//////////////  basic methods

ezP.Xml.Input = {
  Named: {}
}

/**
 * Convert the block's input to a dom element.
 * Only value inputs are taken into account.
 * Dummy inputs are ignored.
 * If they contain editable fields, then
 * the persistent storage is managed independently.
 * If the input list contains only one value input which is a wrapper,
 * then the method is forwarded as is to the target.
 * If the target is a list, then a list element is created
 * and populated by the target.
 * For ezPython.
 * @param {!Blockly.Input} input  the input to be saved.
 * @param {Element} element a dom element in which to save the input
 * @param {boolean} optNoId.
 * @return the added child, if any
 */
ezP.Xml.Input.toDom = function(input, element, optNoId, optNoName) {
  var c8n = input.connection
  if (c8n) {
    var target = c8n.targetBlock()
    if (target) { // otherwise, there is nothing to remember
      if (target.ezp.wrapped_ && !(target.ezp instanceof ezP.DelegateSvg.List)) {
        // let the target populate the given element
        return ezP.Xml.toDom(target, element, optNoId)
      } else {
        var child = ezP.Xml.blockToDom(target, optNoId)
        if (child.childNodes.length>0 || child.hasAttributes() || !(target.ezp instanceof ezP.DelegateSvg.List)) {
          if (!optNoName) {
            if (input.type === Blockly.INPUT_VALUE) {
              child.setAttribute(ezP.Xml.INPUT, input.name)
            } else if (input.type === Blockly.NEXT_STATEMENT) {
              child.setAttribute(ezP.Xml.FLOW, input.name)
            }
          }
          goog.dom.appendChild(element, child)
          return child      
        }
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
 * @param {boolean} optNoId.
 * @return the added child, if any
 */
ezP.Xml.Input.Named.toDom = function(block, name, element, optNoId) {
  var input = block.getInput(name)
  return input? ezP.Xml.Input.toDom(input, element, optNoId): undefined
}

/**
 * Convert the block's input from a dom element.
 * Given an input and an element, initialize the input target
 * block with data from the given element.
 * The given element was created by the input's source block
 * in a blockToDom method. If it contains a child element
 * which input attribute is exactly the input's name,
 * then we ask the input target block to fromDom.
 * Target blocks are managed here too.
 * No consistency test is made however.
 * For ezPython.
 * @param {!Blockly.Input} block The block to be converted.
 * @param {Element} element a dom element in which to save the input
 * @return the added child, if any
 */
ezP.Xml.Input.fromDom = function(input, element) {
  if (input) {
    var c8n = input.connection
    if (c8n) {
      var target = c8n.targetBlock()
      if (target && target.ezp.wrapped_ && !(target.ezp instanceof ezP.DelegateSvg.List)) {
        return ezP.Xml.fromDom(target, element)
      }
      // find an xml child with the proper input attribute
      for (var i = 0, child; (child = element.childNodes[i++]);) {
        if (goog.isFunction(child.getAttribute)) {
          if (input.type === Blockly.INPUT_VALUE) {
            var attribute = child.getAttribute(ezP.Xml.INPUT)
          } else if (input.type === Blockly.NEXT_STATEMENT) {
            var attribute = child.getAttribute(ezP.Xml.FLOW)
          }
        }
        if (attribute && attribute === input.name) {
          if (target) {
            return ezP.Xml.fromDom(target, child)
          } else if ((target = Blockly.Xml.domToBlock(child, input.sourceBlock_.workspace))) {
            // we could create a block form that child element
            // then connect it to 
            if (target.outputConnection && c8n.checkType_(target.outputConnection)) {
              c8n.connect(target.outputConnection)
            } else if (target.previousConnection && c8n.checkType_(target.previousConnection)) {
              c8n.connect(target.previousConnection)
            }
            return target
          }
        }
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
ezP.Xml.Input.Named.fromDom = function(block, name, element) {
  var input = block.getInput(name)
  if (input) {
    return ezP.Xml.Input.fromDom(input, element)
  }
}

goog.provide('ezP.Xml.InputList')

/**
 * Convert the block's input list from a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @param {boolean} optNoId.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.InputList.toDom = function(block, element, optNoId) {
  var out
  var e8r = block.ezp.inputEnumerator(block), input
  while ((input = e8r.next())) {
    if (input.name) {
      out = ezP.Xml.Input.toDom(input, element, optNoId)
    }
  }
  return out
}

/**
 * Convert the block's input list from a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.InputList.fromDom = function(block, element) {
  var e8r = block.ezp.inputEnumerator(block), input
  while ((input = e8r.next())) {
    if (input.name) {
      ezP.Xml.Input.fromDom(input, element)
    }
  }
  block.bumpNeighbours_()
}

goog.provide('ezP.Xml.Flow')

/**
 * Convert the block's input list and next blocks to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @param {boolean} optNoId.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.Flow.toDom = function(block, element, optNoId) {
  var c8n = block.nextConnection
  if (c8n) {
    var target = c8n.targetBlock()
    if(target) {
      var child = Blockly.Xml.blockToDom(target, optNoId)
      if (child) {
        child.setAttribute(ezP.Xml.FLOW, ezP.Xml.NEXT)
        goog.dom.appendChild(element, child)
      }
    }
  }
}

/**
 * Convert the block's input list and next statement from a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.Flow.fromDom = function(block, element) {
  var c8n = block.nextConnection
  if (c8n) {
    for (var i = 0, child; (child = element.childNodes[i++]);) {
      if (goog.isFunction(child.getAttribute) && (child.getAttribute(ezP.Xml.FLOW) === ezP.Xml.NEXT)) {
        var target = Blockly.Xml.domToBlock(child, block.workspace)
        if (target) {
          // we could create a block form that child element
          // then connect it to 
          if (target.previousConnection && c8n.checkType_(target.previousConnection)) {
            c8n.connect(target.previousConnection)
          }
          return target
        }
      }
    }
  }
}

goog.provide('ezP.Xml.Stmt')

/**
 * Convert the block's input list and next blocks to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @param {boolean} optNoId.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.Stmt.toDom = function(block, element, optNoId) {
  ezP.Xml.InputList.toDom(block, element, optNoId)
  ezP.Xml.Flow.toDom(block, element, optNoId)  
}

/**
 * Convert the block's input list and next statement from a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.Stmt.fromDom = function(block, element) {
  ezP.Xml.InputList.fromDom(block, element)
  ezP.Xml.Flow.fromDom(block, element)  
}

// import_stmt

goog.require('ezP.DelegateSvg.Import')

ezP.DelegateSvg.Stmt.import_stmt.prototype.xml = 
ezP.DelegateSvg.Expr.from_relative_module_import.prototype.xml = ezP.DelegateSvg.Expr.from_module_import.prototype.xml = ezP.Xml.InputList

/**
 * Convert the block to a dom element.
 * Transfer control to the first input that is not disabled.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @param {boolean} optNoId.
 * @return a dom element
 */
ezP.DelegateSvg.Stmt.import_stmt.prototype.toDom = function(block, element, optNoId) {
  var e8r = block.ezp.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection
    if (c8n) {
      var target = c8n.targetBlock()
      if (target) {
        return ezP.Xml.toDom(target, element, optNoId)
      }
    }
  }
}

/**
 * Convert the block's input list to a dom element.
 * Void lists may not appear in the persistent storage.
 * As list are dynamic objects, the input list is not
 * known until the end.
 * List blocks are expected to contain only expressions,
 * no statements.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element, void lists may return nothing
 */
ezP.DelegateSvg.Stmt.import_stmt.prototype.fromDom = function(block, xml) {
  var fromChild, importChild
  for (var i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
    if (goog.isFunction(xmlChild.getAttribute)) {
      switch(xmlChild.getAttribute(ezP.Xml.INPUT)) {
        case ezP.Key.FROM: fromChild = xmlChild; break
        case ezP.Key.IMPORT: importChild = xmlChild; break
      }
    }
  }
  if (fromChild) {
    if (importChild) {
      block.ezp.setSubtype(block, ezP.T3.Expr.from_relative_module_import)
    } else {
      block.ezp.setSubtype(block, ezP.T3.Expr.from_module_import)
    }
  } else if (importChild) {
    block.ezp.setSubtype(block, ezP.T3.Expr.import_module)    
  }
  return ezP.Xml.InputList.fromDom(block, xml)
}

goog.require('ezP.DelegateSvg.Primary')
goog.provide('ezP.Xml.Call')

ezP.DelegateSvg.Expr.attributeref.prototype.xml =
ezP.DelegateSvg.Expr.slicing.prototype.xml =

// call blocks have ezp:call and tag ezp:builtin_call names
// if there is an ezp:input attribute, even a ''
// then it is an expression block otherwise it is a statement block.
console.warn('convert print statement to print expression and conversely, top blocks only')
ezP.Xml.Call.domToBlock = function(element, workspace) {
  var prototypeName = element.nodeName.toLowerCase()
  var call
  if ((call = (prototypeName === ezP.Xml.CALL))
  || prototypeName === ezP.Xml.BUILTIN_CALL) {
    var input = element.getAttribute(ezP.Xml.INPUT)
    var type
    if (call) {
      if (input != null) {
        type = ezP.T3.Expr.call_expr
      } else {
        type = ezP.T3.Stmt.call_stmt
      }
    } else if (input != null) {
      type = ezP.T3.Expr.builtin_call_expr
    } else {
      type = ezP.T3.Stmt.builtin_call_stmt
    }
    var id = element.getAttribute('id')
    var block = ezP.DelegateSvg.newBlockComplete(workspace, type, id)
    if (block) {
      ezP.Xml.fromDom(block, element)
      ezP.Xml.Property.fromDom(block, ezP.Key.BUILTIN, element)
      return block
    }
  }
}


/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns 'ezp:list' when this block is embedded
 * and the inherited value otherwise.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.DelegateSvg.Expr.call_expr.prototype.xmlTagName = ezP.DelegateSvg.Stmt.call_stmt.prototype.xmlTagName = function (block) {
  return ezP.Xml.CALL
}

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns 'ezp:list' when this block is embedded
 * and the inherited value otherwise.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.DelegateSvg.Expr.builtin_call_expr.prototype.xmlTagName = ezP.DelegateSvg.Stmt.builtin_call_stmt.prototype.xmlTagName = function (block) {
  return ezP.Xml.BUILTIN_CALL
}

/**
 * Convert the block's input list to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.Call.toDom = function(block, element, optNoId) {
  ezP.Xml.InputList.toDom(block, element, optNoId)
  if (block.ezp instanceof ezP.DelegateSvg.Expr) {
    element.setAttribute(ezP.Xml.INPUT, '')
  }
  ezP.Xml.Property.toDom(block, ezP.Key.BUILTIN, element, optNoId)
}

ezP.Xml.Call.fromDom = ezP.Xml.InputList.fromDom

ezP.DelegateSvg.Expr.call_expr.prototype.xml =
ezP.DelegateSvg.Expr.builtin_call_expr.prototype.xml =
ezP.DelegateSvg.Stmt.call_stmt.prototype.xml =
ezP.DelegateSvg.Stmt.builtin_call_stmt.prototype.xml = ezP.Xml.Call

goog.require('ezP.DelegateSvg.Print')

ezP.DelegateSvg.Expr.builtin_input_expr.prototype.xml =
ezP.DelegateSvg.Expr.builtin_print_expr.prototype.xml =
ezP.Xml.InputList

goog.require('ezP.DelegateSvg.Proc')

ezP.DelegateSvg.Expr.dotted_funcname_concrete.prototype.xml = ezP.Xml.InputList

goog.provide('ezP.Xml.Decorator')

ezP.DelegateSvg.Stmt.decorator_stmt.prototype.xml = ezP.Xml.Decorator

/**
 * Records the operator as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Decorator.toDom = function (block, element, optNoId) {
  var builtin = block.ezp.getProperty(block, ezP.Key.BUILTIN)
  if (builtin) {
    element.setAttribute(ezP.Xml.BUILTIN, builtin)
  } else {
    ezP.Xml.Input.Named.toDom(block, ezP.Key.NAME, element, optNoId)
  }
  var subtype = block.ezp.getProperty(block, ezP.Key.SUBTYPE)
  if (subtype) {
    ezP.Xml.Input.Named.toDom(block, ezP.Key.ARGUMENTS, element, optNoId)
  }
}

/**
 * Set the value from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Decorator.fromDom = function (block, element) {
  var builtin = element.getAttribute(ezP.Xml.BUILTIN)
  if (!builtin || !block.ezp.setProperty(block, ezP.Key.BUILTIN, builtin) ) {
    ezP.Xml.Input.Named.fromDom(block, ezP.Key.NAME, element)
  }
  if (ezP.Xml.Input.Named.fromDom(block, ezP.Key.ARGUMENTS, element)) {
    block.ezp.setProperty(block, ezP.Key.SUBTYPE, ezP.Key.ARGUMENTS)
  }
}

goog.provide('ezP.Xml.Funcdef')

ezP.DelegateSvg.Stmt.funcdef_part.prototype.xml = ezP.Xml.Funcdef

/**
 * Records the operator as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Funcdef.toDom = function (block, element, optNoId) {
  ezP.Xml.Input.Named.toDom(block, ezP.Key.NAME, element, optNoId)
  ezP.Xml.Input.Named.toDom(block, ezP.Key.PARAMETERS, element, optNoId)
  var subtype = block.ezp.getProperty(block, ezP.Key.TYPE)
  if (subtype) {
    ezP.Xml.Input.Named.toDom(block, ezP.Key.TYPE, element, optNoId)
  }
  ezP.Xml.Input.Named.toDom(block, ezP.Key.SUITE, element, optNoId)
  ezP.Xml.Flow.toDom(block, element, optNoId)
}

/**
 * Set the value from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Funcdef.fromDom = function (block, element) {
  ezP.Xml.Input.Named.fromDom(block, ezP.Key.NAME, element)
  ezP.Xml.Input.Named.fromDom(block, ezP.Key.PARAMETERS, element)
  if (ezP.Xml.Input.Named.fromDom(block, ezP.Key.TYPE, element)) {
    block.ezp.setProperty(block, ezP.Key.TYPE, ezP.Key.TYPE)
  }
  ezP.Xml.Input.Named.fromDom(block, ezP.Key.SUITE, element)
  ezP.Xml.Flow.fromDom(block, element)
}

goog.provide('ezP.Xml.Classdef')

ezP.DelegateSvg.Stmt.classdef_part.prototype.xml = ezP.Xml.Classdef

/**
 * Records the operator as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Classdef.toDom = function (block, element, optNoId) {
  ezP.Xml.Input.Named.toDom(block, ezP.Key.NAME, element, optNoId)
  var subtype = block.ezp.getProperty(block, ezP.Key.SUBTYPE)
  if (subtype) {
    ezP.Xml.Input.Named.toDom(block, ezP.Key.ARGUMENTS, element, optNoId)
  }
  ezP.Xml.Input.Named.toDom(block, ezP.Key.SUITE, element, optNoId)
  ezP.Xml.Flow.toDom(block, element, optNoId)
}

/**
 * Set the value from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Classdef.fromDom = function (block, element) {
  ezP.Xml.Input.Named.fromDom(block, ezP.Key.NAME, element)
  if (ezP.Xml.Input.Named.fromDom(block, ezP.Key.ARGUMENTS, element)) {
    block.ezp.setProperty(block, ezP.Key.SUBTYPE, ezP.Key.ARGUMENTS)
  }
  ezP.Xml.Input.Named.fromDom(block, ezP.Key.SUITE, element)
  ezP.Xml.Flow.fromDom(block, element)
}

goog.provide('ezP.Xml.Annotated')

ezP.DelegateSvg.Stmt.annotated_assignment_stmt.prototype.xml = ezP.Xml.Annotated

/**
 * Records the operator as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Annotated.toDom = function (block, element, optNoId) {
  ezP.Xml.Input.Named.toDom(block, ezP.Key.TARGET, element, optNoId)
  ezP.Xml.Input.Named.toDom(block, ezP.Key.ANNOTATED, element, optNoId)
  var subtype = block.ezp.getProperty(block, ezP.Key.ASSIGNED)
  if (subtype) {
    ezP.Xml.Input.Named.toDom(block, ezP.Key.ASSIGNED, element, optNoId)
  }
  ezP.Xml.Flow.toDom(block, element, optNoId)
}

/**
 * Set the value from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Annotated.fromDom = function (block, element) {
  ezP.Xml.Input.Named.fromDom(block, ezP.Key.TARGET, element)
  ezP.Xml.Input.Named.fromDom(block, ezP.Key.ANNOTATED, element)
  if (ezP.Xml.Input.Named.fromDom(block, ezP.Key.ASSIGNED, element)) {
    block.ezp.setProperty(block, ezP.Key.ASSIGNED, ezP.Key.ASSIGNED)
  }
  ezP.Xml.Flow.fromDom(block, element)
}

goog.provide('ezP.Xml.Global')

ezP.DelegateSvg.Stmt.global_nonlocal_stmt.prototype.xml = ezP.Xml.Global

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns 'ezp:list' when this block is embedded
 * and the inherited value otherwise.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.DelegateSvg.Stmt.global_nonlocal_stmt.prototype.xmlTagName = function (block) {
  var current = block.ezp.getProperty(block, ezP.Key.IDENTIFIERS)
  var subtypes = block.ezp.getModel().inputs.subtypes
  return current === subtypes[0]? ezP.Xml.GLOBAL: ezP.Xml.NONLOCAL
}

/**
 * Records the operator as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Global.toDom = function (block, element, optNoId) {
  ezP.Xml.Input.Named.toDom(block, ezP.Key.IDENTIFIERS, element, optNoId)
}

/**
 * Set the value from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Global.domToBlock = function (xmlBlock, workspace) {
  var prototypeName = xmlBlock.nodeName.toLowerCase()
  var global
  if ((global = (prototypeName === ezP.Xml.GLOBAL))
  || (prototypeName === ezP.Xml.NONLOCAL)) {
    var id = xmlBlock.getAttribute('id')
    var block = ezP.DelegateSvg.newBlockComplete(workspace, ezP.T3.Stmt.global_nonlocal_stmt, id)
    if (block) {
      var subtypes = block.ezp.getModel().inputs.subtypes
      block.ezp.setProperty(block, ezP.Key.IDENTIFIERS, subtypes[global? 0: 1])
      ezP.Xml.Input.Named.fromDom(block, ezP.Key.IDENTIFIERS, xmlBlock)
      return block
    }
  }
}

ezP.DelegateSvg.Stmt.comment_stmt.prototype.xml = ezP.Xml.Text

goog.require('ezP.DelegateSvg.Try')

/**
 * Set the value from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.DelegateSvg.Stmt.raise_stmt.prototype.fromDom = function (block, element) {
  var max = -1
  var k = null
  var subtypes = this.getModel().inputs.subtypes
  for (var i = 0, child; (child = element.childNodes[i++]);) {
    if (child.getAttribute) {
      var attribute = child.getAttribute(ezP.Xml.INPUT)
      var j = subtypes.indexOf(attribute)
      if (j>max) {
        max = j
        k = attribute
      }
    }
  }
  this.setSubtype(block, k)
  ezP.Xml.InputList.fromDom(block, element)
}

goog.require('ezP.DelegateSvg.Yield')
goog.provide('ezP.Xml.Yield')

/**
 * Set the value from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Yield.toDom = function (block, element) {
  ezP.Xml.InputList.toDom(block, element)
  if (block.ezp instanceof ezP.DelegateSvg.Expr) {
    element.setAttribute(ezP.Key.INPUT, '')
  }
}

/**
 * Set the value from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Yield.fromDom = function (block, element) {
  var max = -1
  var k = null
  var subtypes = block.ezp.getModel().inputs.subtypes
  for (var i = 0, child; (child = element.childNodes[i++]);) {
    if (child.getAttribute) {
      var attribute = child.getAttribute(ezP.Xml.INPUT)
      var j = subtypes.indexOf(attribute)
      if (j>max) {
        max = j
        k = attribute
      }
    }
  }
  block.ezp.setSubtype(block, k)
  ezP.Xml.InputList.fromDom(block, element)
}

ezP.DelegateSvg.Expr.yield_expression.prototype.xml = ezP.DelegateSvg.Stmt.yield_stmt.prototype.xml = ezP.Xml.Yield









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
 * Convert the block's input list with the given name to a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @param {boolean} optNoId.
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
        child.setAttribute(ezP.Xml.INPUT, input.name)
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
 * @param {string} name.
 * @param {Element} xml the persistent element.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.namedListInputFromDom = function(block, name, element) {
  var input = block.getInput(name)
  if (input) {
    if (!input.connection) {
      console.warn('Missing connection')
    }
    var target = input.connection.targetBlock()
    if (target) {
      for (var i = 0, child;(child = element.childNodes[i++]);) {
        if (child.nodeName.toLowerCase() === 'ezp:list' && child.getAttribute(ezP.Xml.INPUT) === name) {
          ezP.Xml.fromDom(target, child)
          return true
        }
      }
    }
  }
  return false
}

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

goog.require('ezP.DelegateSvg.Expr')

ezP.DelegateSvg.Expr.builtin_object.prototype.xml = ezP.Xml.Value

ezP.DelegateSvg.Expr.any.prototype.xml = ezP.Xml.Text


ezP.DelegateSvg.Expr.proper_slice.prototype.xml = ezP.DelegateSvg.Expr.conditional_expression_concrete.prototype.xml = ezP.Xml.InputList


goog.provide('ezP.Xml.SingleInput')

/**
 * Convert the block's input list from a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @param {boolean} optNoId.
 * @return a dom element
 */
ezP.Xml.SingleInput.toDom = function(block, element, optNoId) {
  return block.inputList.length? ezP.Xml.Input.toDom(block.inputList[0], element, optNoId, true): element
}

/**
 * Convert the block's input list from a dom element.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element, void lists may return nothing
 */
ezP.Xml.SingleInput.fromDom = function(block, xml) {
  return xml.childNodes.length && ezP.Xml.Input.fromDom(block.inputList[0], xml.childNodes[0])
}

ezP.DelegateSvg.Expr.or_expr_star.prototype.xml = ezP.DelegateSvg.Expr.or_expr_star_star.prototype.xml = ezP.DelegateSvg.Expr.not_test_concrete.prototype.xml = ezP.Xml.SingleInput

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

goog.require('ezP.DelegateSvg.Expr.longliteral')


goog.provide('ezP.Xml.Property')

/**
 * Set the named property from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Property.toDom = function (block, key, element, optNoId) {
  if (block.ezp.hasProperty(block, key)) {
    var property = block.ezp.getProperty(block, key)
    if (!!property) {
      element.setAttribute(key, property)
    }
  }
  return true
}

/**
 * Set the named property from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Property.fromDom = function (block, key, element) {
  if (block.ezp.hasProperty(block, key)) {
    var attribute = element.getAttribute(key)
    return block.ezp.setProperty(block, key, attribute)
  }
  return false
}


goog.require('ezP.DelegateSvg.Literal')

/**
 * Convert the block to a dom element and vice versa.
 * For ezPython.
 */
ezP.DelegateSvg.Literal.prototype.xml = ezP.Xml.Text

goog.require('ezP.DelegateSvg.Identifier')

/**
 * Convert dom element to the block.
 * For ezPython.
 */
ezP.DelegateSvg.Expr.identifier.prototype.xml = ezP.Xml.Text

goog.require('ezP.DelegateSvg.List')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns 'ezp:list' when this block is embedded
 * and the inherited value otherwise.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.DelegateSvg.List.prototype.xmlTagName = function (block) {
  return block.getSurroundParent()? ezP.Xml.LIST: ezP.DelegateSvg.List.superClass_.xmlTagName.call(this, block)
}

/**
 * Convert the block to a dom element.
 * Called at the end of blockToDom.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @param {boolean} optNoId.
 * @return a dom element
 */
ezP.DelegateSvg.List.prototype.toDom = function(block, element, optNoId) {
  var x = ezP.Xml.InputList.toDom(block, element, optNoId)
  return block.getSurroundParent()? x: element
}

/**
 * Convert the block's input list to a dom element.
 * Void lists may not appear in the persistent storage.
 * As list are dynamic objects, the input list is not
 * known until the end.
 * List blocks are expected to contain only expressions,
 * no statements.
 * For ezPython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element, void lists may return nothing
 */
ezP.DelegateSvg.List.prototype.fromDom = function(block, xml) {
  var out
  for (var i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
    if (goog.isFunction(xmlChild.getAttribute)) {
      var name = xmlChild.getAttribute(ezP.Xml.INPUT)
      if (name) {
        var input = block.getInput(name)
        if (input) {
          var c8n = input.connection
          if (c8n) {
            var target = c8n.targetBlock()
            if (target) {
              out = out || ezP.Xml.fromDom(target, (target.ezp.wrapped_ && !(target.ezp instanceof ezP.DelegateSvg.List))?
                xml: xmlChild)
              continue
            } else if ((target = Blockly.Xml.domToBlock(xmlChild, input.sourceBlock_.workspace))) {
              out = target
              // we could create a block form that child element
              // then connect it to 
              if (target.outputConnection && c8n.checkType_(target.outputConnection)) {
                c8n.connect(target.outputConnection)
              } else if (target.previousConnection && c8n.checkType_(target.previousConnection)) {
                c8n.connect(target.previousConnection)
              }
            }
          }
        }
      }
    }
  }
  return out
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
ezP.Xml.Operator.toDom = function (block, element, optNoId) {
  ezP.Xml.Property.toDom(block, ezP.Key.OPERATOR, element, optNoId)
  ezP.Xml.InputList.toDom(block, element, optNoId)
}

/**
 * Set the operator from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Operator.fromDom = function (block, element) {
  ezP.Xml.Property.fromDom(block, ezP.Key.OPERATOR, element)
  ezP.Xml.InputList.fromDom(block, element)
}

ezP.DelegateSvg.Operator.prototype.xml = ezP.Xml.Operator
ezP.DelegateSvg.Expr.power_concrete.prototype.xml = ezP.Xml.Operator


goog.provide('ezP.Xml.Comparison')
goog.require('ezP.DelegateSvg.Operator')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns 'ezp:comparison'
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.DelegateSvg.Expr.number_comparison.prototype.xmlTagName = ezP.DelegateSvg.Expr.object_comparison.prototype.xmlTagName = function (block) {
  return ezP.Xml.COMPARISON
}

/**
 * Try to create a comparison block from the given element.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Comparison.domToBlock = function (element, workspace) {
  var block
  var prototypeName = element.nodeName.toLowerCase()
  var id = element.getAttribute('id')
  if (prototypeName === ezP.Xml.COMPARISON) {
    var op = element.getAttribute(ezP.Key.OPERATOR)
    var Ctor, model, type = ezP.T3.Expr.number_comparison
    if ((Ctor = ezP.DelegateSvg.Manager.get(type))
    && (model = Ctor.prototype.getModel().inputs)
    && model.operators
    && model.operators.indexOf(op)>=0) {
      block = ezP.DelegateSvg.newBlockComplete(workspace, type, id)
    } else if ((type = ezP.T3.Expr.object_comparison) && (Ctor = ezP.DelegateSvg.Manager.get(type)) && (model = Ctor.prototype.getModel().inputs) && model.operators && model.operators.indexOf(op)>=0) {
      block = ezP.DelegateSvg.newBlockComplete(workspace, type, id)
    } else {
      return block
    }
    ezP.Xml.fromDom(block, element)    
    return block
  }
}

goog.provide('ezP.Xml.AugAssign')
goog.require('ezP.DelegateSvg.AugAssign')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns 'expr'
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.DelegateSvg.Stmt.augassign_numeric_stmt.prototype.xmlTagName = ezP.DelegateSvg.Stmt.augassign_bitwise_stmt.prototype.xmlTagName = function (block) {
  return ezP.Xml.AUGMENTED_ASSIGNMENT
}

/**
 * Set the operator from the element's tagName.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.AugAssign.domToBlock = function (element, workspace) {
  var name = element.tagName
  if (name && name.toLowerCase() === ezP.DelegateSvg.Stmt.augassign_bitwise_stmt.prototype.xmlTagName()) {
    var op = element.getAttribute(ezP.Key.OPERATOR)
    var type = ezP.T3.Stmt.augassign_numeric_stmt
    var model = ezP.DelegateSvg.Expr.augassign_numeric.prototype.getModel()
    if (model.inputs.operators.indexOf(op) < 0) {
      type = ezP.T3.Stmt.augassign_bitwise_stmt
    }
    var id = element.getAttribute('id')
    var block = ezP.DelegateSvg.newBlockComplete(workspace, type, id)
    ezP.Xml.fromDom(block, element)
    return block
  }
}

/**
 * Records the operator as attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.AugAssign.toDom = function (block, element, optNoId) {
  element.setAttribute(ezP.Key.OPERATOR, block.ezp.getSubtype(block))
  var name = ezP.DelegateSvg.AugAssign.prototype.getModel().inputs.m_1.key
  ezP.Xml.Input.Named.toDom(block, name, element, optNoId)
  var name = ezP.DelegateSvg.AugAssign.prototype.getModel().inputs.m_3.key
  ezP.Xml.namedListInputToDom(block, name, element, optNoId)
}

/**
 * Set the operator from the attribute.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.AugAssign.fromDom = function (block, element) {
  var op = element.getAttribute(ezP.Key.OPERATOR)
  block.ezp.setSubtype(block, op)
  var name = ezP.DelegateSvg.AugAssign.prototype.getModel().inputs.m_1.key
  ezP.Xml.Input.Named.fromDom(block, name, element)
  var name = ezP.DelegateSvg.AugAssign.prototype.getModel().inputs.m_3.key
  ezP.Xml.namedListInputFromDom(block, name, element)
}

ezP.DelegateSvg.AugAssign.prototype.xml = ezP.Xml.AugAssign
ezP.DelegateSvg.Stmt.augassign_numeric_stmt.prototype.xml = ezP.Xml.AugAssign
ezP.DelegateSvg.Stmt.augassign_bitwise_stmt.prototype.xml = ezP.Xml.AugAssign

goog.require('ezP.DelegateSvg.Group')
goog.provide('ezP.Xml.Group')

/**
 * Set the operator from the element's tagName.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
ezP.Xml.Group.domToBlock = function (element, workspace) {
  var name = element.tagName
  if (name && name.toLowerCase() === ezP.DelegateSvg.Stmt.else_part.prototype.xmlTagName()) {
    var type = ezP.T3.Stmt.else_part
    var id = element.getAttribute('id')
    var block = ezP.DelegateSvg.newBlockComplete(workspace, type, id)
    ezP.Xml.fromDom(block, element)
    return block
  }
}



goog.require('ezP.DelegateSvg.Parameters')

ezP.DelegateSvg.Expr.parameter_star.prototype.xml =
ezP.DelegateSvg.Expr.parameter_star_star.prototype.xml =
ezP.DelegateSvg.Expr.parameter_concrete.prototype.xml =
ezP.DelegateSvg.Expr.defparameter_concrete.prototype.xml =
ezP.Xml.InputList

goog.require('ezP.DelegateSvg.Lambda')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns the block type.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.DelegateSvg.Expr.lambda_expression.prototype.xmlTagName = function (block) {
  return ezP.Xml.LAMBDA
}

ezP.DelegateSvg.Manager.registerDelegate_(ezP.Xml.LAMBDA, ezP.DelegateSvg.Expr.lambda_expression)

ezP.DelegateSvg.Expr.lambda_expression.prototype.xml = ezP.Xml.InputList

goog.require('ezP.DelegateSvg.Argument')

ezP.DelegateSvg.Expr.keyword_item.prototype.xml = ezP.Xml.InputList
ezP.DelegateSvg.Expr.expression_star.prototype.xml = ezP.Xml.InputList
ezP.DelegateSvg.Expr.expression_star_star.prototype.xml = ezP.Xml.InputList

// ezP.T3.Expr.identifier,

// ezP.T3.Expr.argument_list,
// ezP.T3.Expr.identifier,
// ezP.T3.Expr.argument_list_comprehensive,

goog.provide('ezP.Xml.Comprehension')
goog.require('ezP.DelegateSvg.Comprehension')

ezP.DelegateSvg.Expr.comp_for.prototype.xml =
ezP.DelegateSvg.Expr.comp_if.prototype.xml =
ezP.DelegateSvg.Expr.comp_iter_list.prototype.xml =
ezP.DelegateSvg.Expr.key_datum_concrete.prototype.xml =
ezP.Xml.InputList

/**
 * toDom.
 * @param {!Blockly.Block} block to be translated.
 * @param {!Element} element dom element to be completed.
 * @param {boolean} optNoId true if no id is required.
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.key_datum_concrete.prototype.xml =
ezP.Xml.InputList


ezP.DelegateSvg.Expr.comprehension.prototype.xml =
ezP.DelegateSvg.Expr.generator_expression.prototype.xml =
ezP.Xml.InputList

ezP.DelegateSvg.Expr.dict_comprehension.prototype.xml = {}

/**
 * toDom.
 * @param {!Blockly.Block} block to be translated.
 * @param {!Element} element dom element to be completed.
 * @param {boolean} optNoId true if no id is required.
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.dict_comprehension.prototype.xml.toDom = function (block, element, optNoId) {
  // create a list element
  ezP.Xml.Input.Named.toDom(block, ezP.Key.KEY, element, optNoId)
  ezP.Xml.Input.Named.toDom(block, ezP.Key.DATUM, element, optNoId)
  ezP.Xml.namedListInputToDom(block, ezP.Key.FOR, element, optNoId)
  ezP.Xml.Input.Named.toDom(block, ezP.Key.IN, element, optNoId)
  ezP.Xml.namedListInputToDom(block, ezP.Key.COMP_ITER, element, optNoId)
}

/**
 * fromDom.
 * @param {!Blockly.Block} block to be initialized.
 * @param {!Element} xml dom element.
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.dict_comprehension.prototype.xml.fromDom = function (block, xml) {
  ezP.Xml.Input.Named.fromDom(block, ezP.Key.KEY, xml)
  ezP.Xml.Input.Named.fromDom(block, ezP.Key.DATUM, xml)
  ezP.Xml.namedListInputFromDom(block, ezP.Key.FOR, xml)
  ezP.Xml.Input.Named.fromDom(block, ezP.Key.IN, xml)
  ezP.Xml.namedListInputFromDom(block, ezP.Key.COMP_ITER, xml)
}

goog.require('ezP.DelegateSvg.Assignment')

/**
 * toDom.
 * @param {!Blockly.Block} block to be translated.
 * For subclassers eventually
 */
ezP.DelegateSvg.Expr.assignment_expression.prototype.xml = ezP.Xml.InputList

/**
 * xml.
 * For subclassers eventually
 */
ezP.DelegateSvg.Stmt.assignment_stmt.prototype.xml = ezP.DelegateSvg.Expr.assignment_expression.prototype.xml

ezP.DelegateSvg.Stmt.prototype.xml = ezP.Xml.Stmt
