/**
 * edython
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
 * The Blockly original methods are overriden to manage the edython blocks.
 * The xml nodes concerning edython all pertain to the `edy` namespace.
 * There are separate xml nodes for statements and expressions,
 * the latter are characterized by an input attribute, which may be
 * a void string. This is useful for call expression that can appear as
 * statements too.
 * The domToWorkspace has been overriden to manage more blocks.
 * When both an expression and a statement share the same
 * tag, the expression always have an input attribute,
 * which may be void.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('edY.Xml')

goog.require('edY.Const')
goog.require('edY.T3')

goog.require('Blockly.Xml')

edY.Xml = {
  INPUT: 'edy:input', // attribute name
  FLOW: 'edy:flow', // attribute name
  NEXT: 'edy:next', // attribute name
  DOTTED_NAME: 'edy:dotted_name', // attribute name
  NAME: 'edy:name', // attribute name
  MODIFIER: 'edy:modifier', // attribute name
  VALUE: 'edy:value', // attribute name
  AS: 'edy:as', // attribute name
  FROM: 'edy:from', // attribute name
  COMMENT: 'edy:comment', // attribute name

  STATE: 'edy:state', // attribute name
  LOCKED: 'edy:locked', // attribute name
  QUESTION: '?',

  LITERAL: 'edy:literal',
  TERM: 'edy:term',
  LIST: 'edy:list',
  COMPARISON: 'edy:comparison',
  PARAMETER: 'edy:parameter',
  LAMBDA: 'edy:lambda',
  CALL: 'edy:call',
  BUILTIN: 'edy:builtin',
  BUILTIN_CALL: 'edy:builtin_call',
  GLOBAL: 'edy:global',
  NONLOCAL: 'edy:nonlocal',
}

console.warn('No edY.Xml.CALL !!!!')
/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 * Overriden to add the `edy` namespace.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Value representation.
 */
Blockly.Xml.domToText = function(dom) {
  dom.setAttribute('xmlns:edy', 'urn:edython:1.0')
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

  // Disable workspace resizes as an optimization.
  if (workspace.setResizesEnabled) {
    workspace.setResizesEnabled(false);
  }

  // This part is the custom part for edython
  var newBlock = function(xmlChild) {
    var block
    if (xmlChild && goog.isFunction(xmlChild.getAttribute)) {
      if ((block = Blockly.Xml.domToBlock(xmlChild, workspace))) {
        newBlockIds.push(block.id);
        var blockX = xmlChild.hasAttribute('x') ?
            parseInt(xmlChild.getAttribute('x'), 10) : 10;
        var blockY = xmlChild.hasAttribute('y') ?
            parseInt(xmlChild.getAttribute('y'), 10) : 10;
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
  Blockly.Events.setGroup(true)
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
        var blockX = xmlChild.hasAttribute('x') ?
            parseInt(xmlChild.getAttribute('x'), 10) : 10;
        var blockY = xmlChild.hasAttribute('y') ?
            parseInt(xmlChild.getAttribute('y'), 10) : 10;
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
        // for edython
        newBlock(xmlChild)
      }
    }
  } finally {
    Blockly.Events.setGroup(false)
    Blockly.Field.stopCache();
  }
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
edY.Xml.savedBlockToDom = Blockly.Xml.blockToDom
Blockly.Xml.blockToDom = function (block, optNoId) {
  if (block.type.indexOf('edy:')<0) {
    // leave the control to the original player
    return edY.Xml.savedBlockToDom(block, optNoId)
  } else {
    return edY.Xml.blockToDom(block, optNoId)
  }
}

/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Element} xmlBlock XML block element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {!Blockly.Block} The root block created.
 */
edY.Xml.savedDomToBlock = Blockly.Xml.domToBlock
Blockly.Xml.domToBlock = function(xmlBlock, workspace) {
  if (xmlBlock instanceof Blockly.Workspace) {
    var swap = xmlBlock;
    xmlBlock = workspace;
    workspace = swap;
    console.warn('Deprecated call to Blockly.Xml.domToBlock, ' +
                 'swap the arguments.');
  }
  var topBlock = edY.Xml.savedDomToBlock(xmlBlock, workspace)
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
edY.Xml.savedDomToBlockHeadless_ = Blockly.Xml.domToBlockHeadless_
Blockly.Xml.domToBlockHeadless_ = function (xmlBlock, workspace) {
  var block = null
  if (xmlBlock.nodeName) {
    var prototypeName = xmlBlock.nodeName.toLowerCase();
    if (prototypeName.indexOf('edy:')<0) {
      block = edY.Xml.savedDomToBlockHeadless_(xmlBlock, workspace)
    } else {
      block = edY.Xml.domToBlock(xmlBlock, workspace)
    }
  }
  return block
}


/**
 * Encode a block subtree as XML.
 * There are various hooks at different levels.
 * Control is tranferred to the first object in the following list
 * which implements a blockToDom function, if any.
 * 1) block.edy
 * 2) block.edy.xml
 * 3) block.edy.constructor.xml
 * 4) block.edy.constructor
 * Otherwise an xml element with the block's tag name is created.
 * Then it is populated with the toDom method.
 * There are 5 particular situations: literal, augmented assignments and comparisons, wrapped blocks, list blocks and finally solid blocks.
 * 1) Literal blocks include various numbers and strings.
 * They all share the same tag name: edy:literal.
 * The solid block type is guessed from
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
 * The same holds for comparison blocks, mutatis mutandis.
 * 3) List blocks are meant to be wrapped. They should never appear
 * as top blocks. When wrapped, the tag name is always edy:list.
 * The solid type is encoded in the input attribute,
 * it also depends on the enclosing block.
 * 4) Wrapped blocks other than lists will not add an xml child level.
 * As a consequence, this method just returns nothing for such blocks.
 * 5) solid blocks are named after their type which edy:foo_s3d.
 * These block types correspond to an alternate in the python grammar.
 * The persistence storage may remember these blocks as edy:foo instead of edy:foo_s3d.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
edY.Xml.blockToDom = function() {
  var blockToDom = function (block, optNoId) {
    var edy = block.edy
    if (edy.wrapped_  && !(edy instanceof edY.DelegateSvg.List)) {
      // a wrapped block does not create a new element on its own
      // it only can populate an already existing xml node.
      // Except for list nodes.
      return
    }
    var controller = edy
    if ((controller &&
      goog.isFunction(controller.blockToDom)) ||
      ((controller = edy.xml) &&
      goog.isFunction(controller.blockToDom)) ||
      ((controller = edy.constructor) &&
      (controller = controller.xml) &&
      goog.isFunction(controller.blockToDom)) ||
      ((controller = edy.constructor) &&
      goog.isFunction(controller.blockToDom))) {
      var element = controller.blockToDom.call(edy, block, optNoId)
    } else {
      element = goog.dom.createDom(block.edy.tagName(block))
      if (!optNoId) {
        element.setAttribute('id', block.id)
      }
      edY.Xml.toDom(block, element, optNoId)
    }
    // this is for the editor, not python
    if (block.edy.locked_) {
      element.setAttribute(edY.Xml.STATE, edY.Xml.LOCKED)
    }
    if (block.edy instanceof edY.DelegateSvg.Expr && goog.isNull(element.getAttribute(edY.Xml.INPUT))) {
      element.setAttribute(edY.Xml.INPUT, '')
    }
    return element
  }
  return function(block, optNoId) {
    edY.Xml.registerAllTags && edY.Xml.registerAllTags()
    edY.Xml.blockToDom = blockToDom
    return blockToDom(block, optNoId)
  }
} ()

goog.require('edY.DelegateSvg.Expr')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
edY.Delegate.prototype.tagName = function (block) {
  var tag = this.constructor.edy.tagName || (this instanceof edY.DelegateSvg.Expr? edY.T3.Xml.toDom.Expr: edY.T3.Xml.toDom.Stmt)[this.constructor.edy.key]
  return tag && 'edy:'+tag || block.type
}

goog.require('edY.DelegateSvg.List')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns the block type.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
edY.DelegateSvg.List.prototype.tagName = function (block) {
  return block.getSurroundParent()? edY.Xml.LIST: edY.DelegateSvg.List.superClass_.tagName.call(this, block)
}

goog.provide('edY.Xml.Text')

/**
 * Convert the block's value to a text dom element.
 * For edython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element
 */
edY.Xml.Text.toDom = function(block, element, optNoId) {
  var text = block.edy.data.value.get()
  if (text && text.length) {
    var child = goog.dom.createTextNode(text)
    goog.dom.appendChild(element, child)
  }
  return element
}

/**
 * Convert the block from a dom element.
 * For edython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element
 */
edY.Xml.Text.fromDom = function(block, element) {
  for (var i = 0, xmlChild; (xmlChild = element.childNodes[i]); i++) {
    if (xmlChild.nodeType === 3 && block.edy.data.value.set(xmlChild.nodeValue)) {
      return true
    }
  }
  return false
}

goog.require('edY.DelegateSvg.Literal')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns 'edy:literal'
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
edY.DelegateSvg.Literal.prototype.tagName = function (block) {
  return edY.Xml.LITERAL
}

edY.DelegateSvg.Literal.prototype.xml = edY.Xml.Text

goog.provide('edY.Xml.Literal')
/**
 * Try to create a comparison block from the given element.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
edY.Xml.Literal.domToBlock = function (element, workspace) {
  var prototypeName = element.nodeName.toLowerCase()
  if (prototypeName !== edY.Xml.LITERAL) {
    return
  }
  var id = element.getAttribute('id')
  for (var i = 0, xmlChild; (xmlChild = element.childNodes[i]); i++) {
    if (xmlChild.nodeType === 3) {
      var text = xmlChild.nodeValue
      var type = edY.Do.typeOfString(text)
      switch(type) {
        case edY.T3.Expr.integer:
        case edY.T3.Expr.floatnumber:
        case edY.T3.Expr.imagnumber:
        var block = edY.DelegateSvg.newBlockComplete(workspace, edY.T3.Expr.numberliteral, id)
        break
        case edY.T3.Expr.shortstringliteral:
        case edY.T3.Expr.shortbytesliteral:
        var block = edY.DelegateSvg.newBlockComplete(workspace, edY.T3.Expr.shortliteral, id)
        break
        case edY.T3.Expr.longstringliteral:
        case edY.T3.Expr.longbytesliteral:
        var block = edY.DelegateSvg.newBlockComplete(workspace, edY.T3.Expr.longliteral, id)
        break
      }
      if (block) {
        var edy = block.edy
        edy.data.value.set(text)
        || edy.data.content.setTrusted(text)
        return block
      }
    }
  }
  return  edY.DelegateSvg.newBlockComplete(workspace, edY.T3.Expr.shortliteral, id)
}

goog.provide('edY.Xml.Data')

/**
 * Convert the block's data.
 * List all the available data and converts them to xml.
 * For edython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @param {boolean} optNoId.
 * @return a dom element, void lists may return nothing
 * @this a block delegate
 */
edY.Xml.Data.toDom = function(block, element, optNoId) {
  var hasText = false
  for(var key in block.edy.data) {
    var data = block.edy.data[key]
    data.saveToDom(element)
  }
}

/**
 * Convert the block's data from a dom element.
 * For edython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element, void lists may return nothing
 * @this a block delegate
 */
edY.Xml.Data.fromDom = function(block, element) {
  var hasText
  for(var key in block.edy.data) {
    var data = block.edy.data[key]
    data.loadFromDom(element)
    // Consistency section, to be removed
    var xml = data.model.xml
    goog.asserts.assert(!xml || !xml.text || !hasText,
      edY.Do.format('Only one text node {0}/{1}', key, block.type))
    hasText = xml && xml.text
  }
}

/**
 * Encode a block subtree as XML.
 * The xml element was created to hold what the block contains.
 * Some information is stored as an attribute, whereas other
 * needs another xml node.
 * When possible, the control is transferred to the first controller
 * in the following list which implements a toDom method.
 * 1) block.edy
 * 2) block.edy.xml
 * 3) block.edy.constructor.xml (no inheritance)
 * 4) block.edy.constructor (no inheritance here too)
 * The default implementation does nothing if there's no controller
 * to take control.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {element} dom element to encode in
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
edY.Xml.toDom = function (block, element, optNoId) {
  var edy = block.edy
  var controller = edy
  if ((controller && goog.isFunction(controller.toDom)) ||
    ((controller = edy.xml) && goog.isFunction(controller.toDom)) ||
    ((controller = edy.constructor.xml) && goog.isFunction(controller.toDom)) ||
    ((controller = edy.constructor) && goog.isFunction(controller.toDom))) {
      return controller.toDom.call(edy, block, element, optNoId)
  } else {
    edY.Xml.Data.toDom(block, element, optNoId)
    // save tiles
    var tile = block.edy.ui.headTile
    while (tile) {
      tile.toDom(element, optNoId)
      tile = tile.nextTile
    }
    var blockToDom = function(c8n, name, key) {
      if (c8n && !c8n.edy.wrapped_) {
        // wrapped blocks belong to tiles, they are managed from there
        var target = c8n.targetBlock()
        if(target) {
          var child = Blockly.Xml.blockToDom(target, optNoId)
          if (child) {
            child.setAttribute(name, key)
            goog.dom.appendChild(element, child)
          }
        }
      }
    }
    // the list blocks have no tiles yet
    for (var i = 0, input;(input = block.inputList[i++]);) {
      if (!input.edy.tile) {
        blockToDom(input.connection, edY.Xml.INPUT, input.name)
      }
    }
    // the suite and the flow
    blockToDom(edy.inputSuite && edy.inputSuite.connection, edY.Xml.FLOW, edY.XmlKey.SUITE)
    blockToDom(block.nextConnection, edY.Xml.FLOW, edY.XmlKey.NEXT)
  }
}

/**
 * Registers all the known models for their tags
 * 
 */
edY.Xml.registerAllTags = function() {
  // mode is one of 'Expr' and 'Stmt'
  var register = function(mode) {
    var where = edY.T3[mode]
    for (var key in where) {
      var type = where[key]
      var model = edY.Delegate.Manager.getModel(type)
      var tag = model && model.xml && model.xml.tag
      if (!goog.isString(tag)) {
        var m = XRegExp.exec(type, edY.XRE.s3d)
        if (m) {
          tag = m.core
        } else {
          continue
        }
      } else if (!tag.length) {
        continue
      }
      // register as fromDom
      // console.log('register ', tag)
      var already = edY.T3.Xml.fromDom[tag]
      if (goog.isArray(already)) {
        if (already.indexOf(type) < 0) {
          already.push(type)
        }
      } else if (goog.isString(already)) {
        if (type != already) {
          edY.T3.Xml.fromDom[tag] = already = [already, type]
        }
      } else {
        edY.T3.Xml.fromDom[tag] = type
      }
      // register the reverse
      var c9r = edY.Delegate.Manager.get(type)
      if (c9r) {
        c9r.edy.tagName = tag || edY.T3.Xml.toDom[mode][key] || key
      }
    }
  }
  register('Expr')
  register('Stmt')
  delete edY.Xml.registerAllTags
}

/**
 * Decode an XML block tag and create a block (and possibly sub blocks)
 * on the workspace.
 * Try to decode a literal or other special node.
 * If that does not work, try to deconde ans edython block,
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
edY.Xml.domToBlock = function() {
  var domToBlock = function(xmlBlock, workspace) {
    var block = null
    if (!xmlBlock.nodeName) {
      return block
    }
    var id = xmlBlock.getAttribute('id')
    var name = xmlBlock.nodeName.toLowerCase()
    var prototypeName
    // 
    // is it a literal or something else special ?
    if ((block = edY.Xml.Literal.domToBlock(xmlBlock, workspace))
    || (block = edY.Xml.Comparison.domToBlock(xmlBlock, workspace))
    || (block = edY.Xml.Group.domToBlock(xmlBlock, workspace))
    || (block = edY.Xml.Call.domToBlock(xmlBlock, workspace))) {
    } else
  // is there a simple correspondance with a known type
    if ((prototypeName = edY.T3.Xml.fromDom[name.substring(4)])) {
      if (goog.isArray(prototypeName)) {
        if (prototypeName.length === 1) {
          prototypeName = prototypeName[0]
        } else if (!(prototypeName = function() {
            var where = goog.isDefAndNotNull(xmlBlock.getAttribute(edY.Xml.INPUT))? edY.T3.Expr: edY.T3.Stmt
            for (var i = 0; i < prototypeName.length; i++) {
              var candidate = prototypeName[i]
              var C8r = edY.DelegateSvg.Manager.get(candidate)
              if (C8r && where[C8r.edy.key]) {
                return candidate
              }
            }
          } ())){
          return block
        }
      }
      block = edY.DelegateSvg.newBlockComplete(workspace, prototypeName, id)
    } else {
      prototypeName = name
      var solid = prototypeName + '_s3d'
      var controller = edY.DelegateSvg.Manager.get(solid)
      if (controller) {
        if (controller.edy && goog.isFunction(controller.edy.domToBlock)) {
          return controller.edy.domToBlock(xmlBlock, workspace, id)
        } else if (goog.isFunction(controller.domToBlock)) {
          return controller.domToBlock(xmlBlock, workspace, id)
        }
        block = edY.DelegateSvg.newBlockComplete(workspace, solid, id)
      } else if ((controller = edY.DelegateSvg.Manager.get(prototypeName))) {
        if (controller.edy && goog.isFunction(controller.edy.domToBlock)) {
          return controller.edy.domToBlock(xmlBlock, workspace, id)
        } else if (goog.isFunction(controller.domToBlock)) {
          return controller.domToBlock(xmlBlock, workspace, id)
        }
        block = edY.DelegateSvg.newBlockComplete(workspace, prototypeName, id)
      }
      // Now create the block, either solid or not
    }
    if (block) {
      var edy = block.edy
  //    console.log('Block created from dom:', xmlBlock, block.type, block.id)
      // then fill it based on the xml data
      edY.Xml.fromDom(block, xmlBlock)
      var state = xmlBlock.getAttribute(edY.Xml.STATE)
      if (state && state.toLowerCase() === edY.Xml.LOCKED) {
        edy.lock(block)
      }
      // this block have been created from untrusted data
      // We might need to fix some stuff before returning
      // In particular, it will be the perfect place to setup variants
      edy.beReady(block)
    }
    return block
  }
  return function(xmlBlock, workspace) {
    edY.Xml.registerAllTags && edY.Xml.registerAllTags()
    edY.Xml.domToBlock = domToBlock
    return domToBlock(xmlBlock, workspace)
  }
} ()

/**
 * Decode a block subtree from XML.
 * When possible, the control is transferred to the first controller
 * in the following list which implements a fromDom method.
 * 1) block.edy
 * 2) block.edy.xml
 * 3) block.edy.constructor.xml (no inheritance)
 * 4) block.edy.constructor (no inheritance here too)
 * The default implementation does nothing if there's no controller
 * @param {!Blockly.Block} block The root block to encode.
 * @param {element} dom element to encode in
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
edY.Xml.fromDom = function (block, element) {
  var edy = block.edy
  var controller = edy
  if ((controller &&
    goog.isFunction(controller.fromDom)) ||
    ((controller = edy.xml) &&
    goog.isFunction(controller.fromDom)) ||
    ((controller = edY.DelegateSvg.Manager.get(block.type)) &&
    (controller = controller.xml) &&
    goog.isFunction(controller.fromDom)) ||
    ((controller = edY.DelegateSvg.Manager.get(block.type)) &&
    goog.isFunction(controller.fromDom))) {
    return controller.fromDom.call(edy, block, element)
  } else {
    var data = edy.data
    for (var k in data) {
      data[k].waitOn()
    }
    edY.Xml.Data.fromDom(block, element)
    // read tile
    var tile = edy.ui.headTile
    while (tile) {
      tile.fromDom(element)
      tile = tile.nextTile
    }
    var statement = function(c8n, key) {
      if (c8n) {
        for (var i = 0, child; (child = element.childNodes[i++]);) {
          if (goog.isFunction(child.getAttribute) && (child.getAttribute(edY.Xml.FLOW) === key)) {
            var target = Blockly.Xml.domToBlock(child, block.workspace)
            if (target) {
              // we could create a block from that child element
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
    if (edy instanceof edY.DelegateSvg.List) {
      for (var i = 0, child;(child = element.childNodes[i++]);) {
        if (goog.isFunction(child.getAttribute)) {
          var name = child.getAttribute(edY.XmlKey.INPUT)
          var input = edy.getInput(block, name)
          if (input) {
            if (!input.connection) {
              console.warn('Missing connection')
            }
            var inputTarget = input.connection.targetBlock()
            if (inputTarget) {
              edY.Xml.fromDom(inputTarget, child)
            } else if ((inputTarget = edY.Xml.domToBlock(child, block.workspace))) {
              var targetC8n = inputTarget.outputConnection
              if (targetC8n && targetC8n.checkType_(input.connection)) {
                targetC8n.connect(input.connection)
              }
            }
          }
        }
      }
    }
    // read flow and suite
    var out = statement(block.nextConnection, edY.XmlKey.NEXT)
    var out = statement(edy.inputSuite && edy.inputSuite.connection, edY.XmlKey.SUITE) || out
    return out
  }
}

goog.provide('edY.Xml.Comparison')
goog.require('edY.DelegateSvg.Operator')

/**
 * Try to create a comparison block from the given element.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
edY.Xml.Comparison.domToBlock = function (element, workspace) {
  var block
  var prototypeName = element.nodeName.toLowerCase()
  var id = element.getAttribute('id')
  if (prototypeName === edY.Xml.COMPARISON) {
    var op = element.getAttribute(edY.Key.OPERATOR)
    var C8r, model, type = edY.T3.Expr.number_comparison
    if ((C8r = edY.DelegateSvg.Manager.get(type))
    && (model = C8r.edy.getModel().tiles)
    && model.operators
    && model.operators.indexOf(op)>=0) {
      block = edY.DelegateSvg.newBlockComplete(workspace, type, id)
    } else if ((type = edY.T3.Expr.object_comparison) && (C8r = edY.DelegateSvg.Manager.get(type)) && (model = C8r.edy.getModel().tiles) && model.operators && model.operators.indexOf(op)>=0) {
      block = edY.DelegateSvg.newBlockComplete(workspace, type, id)
    } else {
      return block
    }
    edY.Xml.fromDom(block, element)    
    return block
  }
}

goog.require('edY.DelegateSvg.Group')
goog.provide('edY.Xml.Group')

/**
 * Set the operator from the element's tagName.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 * @override
 */
edY.Xml.Group.domToBlock = function (element, workspace) {
  var name = element.tagName
  if (name && name.toLowerCase() === edY.DelegateSvg.Stmt.else_part.prototype.tagName()) {
    var type = edY.T3.Stmt.else_part
    var id = element.getAttribute('id')
    var block = edY.DelegateSvg.newBlockComplete(workspace, type, id)
    edY.Xml.fromDom(block, element)
    return block
  }
}

goog.provide('edY.Xml.Call')

// call blocks have edy:call and tag edy:builtin_call names
// if there is an edy:input attribute, even a ''
// then it is an expression block otherwise it is a statement block.
console.warn('convert print statement to print expression and conversely, top blocks only')
edY.Xml.Call.domToBlock = function(element, workspace) {
  if (element.nodeName.toLowerCase() === edY.Xml.CALL) {
    var input = element.getAttribute(edY.Xml.INPUT)
    if (goog.isDefAndNotNull(input)) {
      var type = edY.T3.Expr.call_expr
    } else {
      type = edY.T3.Stmt.call_stmt
    }
    var id = element.getAttribute('id')
    var block = edY.DelegateSvg.newBlockComplete(workspace, type, id)
    if (block) {
      edY.Xml.fromDom(block, element)
      return block
    }
  }
}

// goog.provide('edY.Xml.Global')

// General stuff

// goog.provide('edY.Xml.Stmt')

// /**
//  * Convert the block's input list and next blocks to a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId.
//  * @return a dom element, void lists may return nothing at all
//  * @this a block delegate
//  */
// edY.Xml.Stmt.toDomX = function(block, element, optNoId) {
//   edY.Xml.Data.toDom(block, element) 
//   edY.Xml.InputList.toDom(block, element, optNoId)
//   edY.Xml.Flow.toDom(block, element, optNoId)  
// }

// /**
//  * Convert the block's input list and next statement from a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @return a dom element, void lists may return nothing
//  * @this a block delegate
//  */
// edY.Xml.Stmt.fromDomX = function(block, element) {
//   edY.Xml.Data.fromDom(block, element) 
//   edY.Xml.InputList.fromDom(block, element)
//   edY.Xml.Flow.fromDom(block, element)  
// }

// //////////////  basic methods

// goog.provide('edY.Xml.Input')

// /**
//  * Convert the block's input to a dom element.
//  * Only value inputs are taken into account.
//  * Dummy inputs are ignored.
//  * If they contain editable fields, then
//  * the persistent storage is managed independently.
//  * If the input list contains only one value input which is a wrapper,
//  * then the method is forwarded as is to the target.
//  * If the target is a list, then a list element is created
//  * and populated by the target.
//  * Variants make things more complicated.
//  * Depending on the value of the variant,
//  * the input may be disabled or not.
//  * A disabled input will not save its data to the dom.
//  * An optional input with no data will save nothing.
//  * On the opposite, we may have an input that must save data
//  * but has nothing available.
//  * What are the criteria to decide if an input is require or not?
//  * When writing to dom, such an input must not be disabled,
//  * and must have some data or be marked as required.
//  * For edython.
//  * @param {!edY.Input} input  the input to be saved.
//  * @param {Element} element a dom element in which to save the input
//  * @param {boolean} optNoId.
//  * @param {boolean} optNoName. For lists, if there is no ambiguity, we can avoid the use of the input attribute.
//  * @return the added child, if any
//  */
// edY.Xml.Input.toDom = function(input, element, optNoId, optNoName) {
//   var out = function() {
//     var target = input.getTarget()
//     if (target) { // otherwise, there is nothing to remember
//       if (target.edy.wrapped_) {
//         // wrapped blocks are just a convenient computational model.
//         // For lists only, we do create a further level
//         if (target.edy instanceof edY.DelegateSvg.List) {
//           var child = edY.Xml.blockToDom(target, optNoId)
//           if (child.childNodes.length>0) {
//             if (!optNoName) {
//               child.setAttribute(edY.Xml.INPUT, input.key)
//             }
//             goog.dom.appendChild(element, child)
//             return child      
//           }
//         } else {
//           // let the target populate the given element
//           return edY.Xml.toDom(target, element, optNoId)
//         }
//       } else {
//         var child = edY.Xml.blockToDom(target, optNoId)
//         if (child.childNodes.length>0 || child.hasAttributes()) {
//           if (!optNoName) {
//             if (input.type === Blockly.INPUT_VALUE) {
//               child.setAttribute(edY.Xml.INPUT, input.key)
//             } else if (input.type === Blockly.NEXT_STATEMENT) {
//               child.setAttribute(edY.Xml.FLOW, input.key)
//             }
//           }
//           goog.dom.appendChild(element, child)
//           return child      
//         }
//       }
//     }
//   } ()
//   if (!out && input.isRequiredToDom()) {
//     var child = goog.dom.createDom(edY.Xml.PLACEHOLDER)
//     child.setAttribute(edY.Xml.INPUT, input.key)
//     goog.dom.appendChild(element, child)
//     return true
//   }
// }

// /**
//  * Convert the delegates's input from a dom element.
//  * Given an input and an element, initialize the input target
//  * block with data from the given element.
//  * The given element was created by the input's source block
//  * in a blockToDom method. If it contains a child element
//  * which input attribute is exactly the input's name,
//  * then we ask the input target block to fromDom.
//  * Target blocks are managed here too.
//  * No consistency test is made however.
//  * For edython.
//  * @param {!edY.Input} block The block to be converted.
//  * @param {Element} element a dom element in which to save the input
//  * @return the added child, if any
//  */
// edY.Xml.Input.fromDom = function(input, element) {
//   input.setRequiredFromDom(false)
//   var target = input.getTarget()
//   if (target && target.edy.wrapped_ && !(target.edy instanceof edY.DelegateSvg.List)) {
//     input.setRequiredFromDom(true)
//     return edY.Xml.fromDom(target, element)
//   }
//   // find an xml child with the proper input attribute
//   for (var i = 0, child; (child = element.childNodes[i++]);) {
//     if (goog.isFunction(child.getAttribute)) {
//       if (input.type === Blockly.INPUT_VALUE) {
//         var attribute = child.getAttribute(edY.Xml.INPUT)
//       } else if (input.type === Blockly.NEXT_STATEMENT) {
//         var attribute = child.getAttribute(edY.Xml.FLOW)
//       }
//     }
//     if (attribute === input.key) {
//       if (child.tagName && child.tagName.toLowerCase() === edY.Xml.PLACEHOLDER) {
//         input.setRequiredFromDom(true)
//         return true
//       }
//       if (target) {
//         input.setRequiredFromDom(true)
//         return edY.Xml.fromDom(target, child)
//       } else if ((target = Blockly.Xml.domToBlock(child, input.getWorkspace()))) {
//         // we could create a block form that child element
//         // then connect it
//         var c8n = input.getConnection()
//         if (target.outputConnection && c8n.checkType_(target.outputConnection)) {
//           c8n.connect(target.outputConnection)
//         } else if (target.previousConnection && c8n.checkType_(target.previousConnection)) {
//           c8n.connect(target.previousConnection)
//         }
//         input.setRequiredFromDom(true)
//         return target
//       }
//     }
//   }
// }

// goog.provide('edY.Xml.Input.Named')

// /**
//  * Convert the block's input with the given name to a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {string} name The name of the input
//  * @param {Element} element a dom element in which to save the input
//  * @param {boolean} optNoId.
//  * @return the added child, if any
//  */
// edY.Xml.Input.Named.toDom = function(block, name, element, optNoId, withPlaceholder) {
//   var input = block.edy.ui.tiles[name]
//   if (input && !input.disabled) {
//     var out = edY.Xml.Input.toDom(input, element, optNoId)
//   }
//   return out
// }

// /**
//  * Convert the block's input with the given name to a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {string} name The name of the input
//  * @param {Element} element a dom element in which to save the input
//  * @param {boolean} withPlaceholder a dom element in which to save the input
//  * @return the added child, if any, or just true in case of a placeholder
//  */
// edY.Xml.Input.Named.fromDom = function(block, name, element, withPlaceholder) {
//   var input = block.edy.ui.tiles[name]
//   if (input) {
//     var out = edY.Xml.Input.fromDom(input, element, withPlaceholder)
//   }
//   return out
// }

// goog.provide('edY.Xml.InputList')

// /**
//  * Convert the block's input list from a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId.
//  * @return a dom element, void lists may return nothing
//  */
// edY.Xml.InputList.toDom = function(block, element, optNoId) {
//   var out
//   var inputs = block.edy.ui.tiles
//   for (var k in inputs) {
//     var input = inputs[k]
//     if (!input.disabled) {
//       out = edY.Xml.Input.toDom(input, element, optNoId)
//     }
//   }
//   return out
// }

// /**
//  * Convert the delagate's input list from a dom element.
//  * We filtered out disabled inputs while saving,
//  * we do not while loading.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @return a dom element, void lists may return nothing
//  */
// edY.Xml.InputList.fromDom = function(block, element) {
//   var inputs = block.edy.ui.tiles
//   for (var k in inputs) {
//     var input = inputs[k]
//     edY.Xml.Input.fromDom(input, element)
//   }
//   block.bumpNeighbours_()
// }
















// goog.provide('edY.Xml.Flow')

// /**
//  * Convert the block's next statements to a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId.
//  * @return a dom element, void lists may return nothing
//  */
// edY.Xml.Flow.toDom = function(block, element, optNoId) {
//   var c8n = block.nextConnection
//   if (c8n) {
//     var target = c8n.targetBlock()
//     if(target) {
//       var child = Blockly.Xml.blockToDom(target, optNoId)
//       if (child) {
//         child.setAttribute(edY.Xml.FLOW, edY.Xml.NEXT)
//         goog.dom.appendChild(element, child)
//       }
//     }
//   }
// }

// /**
//  * Convert the block's next statement from a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @return a dom element, void lists may return nothing
//  */
// edY.Xml.Flow.fromDom = function(block, element) {
//   var c8n = block.nextConnection
//   if (c8n) {
//     for (var i = 0, child; (child = element.childNodes[i++]);) {
//       if (goog.isFunction(child.getAttribute) && (child.getAttribute(edY.Xml.FLOW) === edY.Xml.NEXT)) {
//         var target = Blockly.Xml.domToBlock(child, block.workspace)
//         if (target) {
//           // we could create a block form that child element
//           // then connect it to 
//           if (target.previousConnection && c8n.checkType_(target.previousConnection)) {
//             c8n.connect(target.previousConnection)
//           }
//           return target
//         }
//       }
//     }
//   }
// }

// // import_stmt

// goog.require('edY.DelegateSvg.Import')

// edY.DelegateSvg.Stmt.import_stmt.prototype.xml = edY.Xml.InputList

// /**
//  * Convert the block to a dom element.
//  * Transfer control to the first input that is not disabled.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId.
//  * @return a dom element
//  */
// edY.DelegateSvg.Stmt.import_stmt.prototype.toDom = function(block, element, optNoId) {
//   var variant = this.data.variant.get()
//   if (variant === 0) {
//     return edY.Xml.Input.Named.toDom(block, edY.Key.IMPORT_MODULE, element, optNoId)
//   }
//   var text = this.data.value.get()
//   element.setAttribute(edY.Xml.FROM, text || '?')
//   if (variant === 1) {
//     return edY.Xml.Input.Named.toDom(block, edY.Key.IMPORT, element, optNoId, true)
//   }
// }

// /**
//  * Convert the block's input list to a dom element.
//  * Void lists may not appear in the persistent storage.
//  * As list are dynamic objects, the input list is not
//  * known until the end.
//  * List blocks are expected to contain only expressions,
//  * no statements.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @return a dom element, void lists may return nothing
//  */
// edY.DelegateSvg.Stmt.import_stmt.prototype.fromDom = function(block, xml) {
//   var text = xml.getAttribute(edY.Xml.FROM)
//   if (!text || !text.length) {
//     this.data.variant.set(0)
//     return edY.Xml.Input.Named.fromDom(block, edY.Key.IMPORT_MODULE, xml)
//   }
//   if (text !== '?') {
//     block.edy.data.value.set(text)
//   }
//   var variant = edY.Xml.Input.Named.fromDom(block, edY.Key.IMPORT, xml, true)?1: 2
//   this.data.variant.set(variant)
// }

// goog.require('edY.DelegateSvg.Primary')

// goog.require('edY.DelegateSvg.Print')

// goog.require('edY.DelegateSvg.Proc')

// goog.provide('edY.Xml.Decorator')

// edY.DelegateSvg.Stmt.decorator.prototype.xml = edY.Xml.Decorator

// /**
//  * Records the operator as attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Xml.Decorator.toDom = function (block, element, optNoId) {
//   var edy = block.edy
//   var variant = edy.data.variant.get()
//   var value = variant === edY.Key.BUILTIN? edy.getBuiltin(block): edy.data.value.get()
//   if (goog.isDefAndNotNull(value)) {
//     var child = goog.dom.createTextNode(value)
//     goog.dom.appendChild(element, child)
//   }
//   if (variant === edY.Key.ARGUMENTS) {
//     edY.Xml.Input.Named.toDom(block, edY.Key.ARGUMENTS, element, optNoId)
//   }
// }

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Xml.Decorator.fromDom = function (block, element) {
//   var builtin
//   var value
//   var edy = block.edy
//   for (var i = 0, xmlChild; (xmlChild = element.childNodes[i]); i++) {
//     if (xmlChild.nodeType === 3) {
//       var text = xmlChild.nodeValue
//       value = text
//       if (edy.validateBuiltin(block, text)) {
//         builtin = text
//       }
//       break
//     }
//   }
//   if (edY.Xml.Input.Named.fromDom(block, edY.Key.ARGUMENTS, element)) {
//     edy.data.value.set(value)
//     edy.data.variant.set(2)
//   } else if(builtin) {
//     edy.data.variant.set(1)
//     edy.setBuiltin(block, builtin)
//   } else {
//     edy.data.variant.set(0)
//     if (goog.isDefAndNotNull(value)) {
//       edy.data.value.set(value)
//     }
//   }
// }

// goog.provide('edY.Xml.Funcdef')

// edY.DelegateSvg.Stmt.funcdef_part.prototype.xml = edY.Xml.Funcdef

// /**
//  * Records the operator as attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Xml.Funcdef.toDom = function (block, element, optNoId) {
//   var value = block.edy.data.value.get()
//   if (value) {
//     element.setAttribute(edY.Xml.NAME, value)
//   }
//   edY.Xml.Input.Named.toDom(block, edY.Key.PARAMETERS, element, optNoId)
//   var variant = block.edy.data.variant.get()
//   if (variant) {
//     edY.Xml.Input.Named.toDom(block, edY.Key.TYPE, element, optNoId, true)
//   }
//   edY.Xml.Input.Named.toDom(block, edY.Key.SUITE, element, optNoId)
//   edY.Xml.Flow.toDom(block, element, optNoId)
// }

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Xml.Funcdef.fromDom = function (block, element) {
//   var value = element.getAttribute(edY.Xml.NAME)
//   if (goog.isDefAndNotNull(value)) {
//     block.edy.data.value.set(value)
//   }
//   edY.Xml.Input.Named.fromDom(block, edY.Key.PARAMETERS, element)
//   if (edY.Xml.Input.Named.fromDom(block, edY.Key.TYPE, element, true)) {
//     block.edy.data.variant.set(edY.Key.TYPE)
//   }
//   edY.Xml.Input.Named.fromDom(block, edY.Key.SUITE, element)
//   edY.Xml.Flow.fromDom(block, element)
// }

// goog.provide('edY.Xml.Classdef')

// edY.DelegateSvg.Stmt.classdef_part.prototype.xml = edY.Xml.Classdef

// /**
//  * Records the operator as attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Xml.Classdef.toDom = function (block, element, optNoId) {
//   var value = block.edy.data.value.get()
//   if (value) {
//     element.setAttribute(edY.Xml.NAME, value)
//   }
//   var variant = block.edy.data.variant.get()
//   if (variant) {
//     edY.Xml.Input.Named.toDom(block, edY.Key.ARGUMENTS, element, optNoId, true)
//   }
//   edY.Xml.Input.Named.toDom(block, edY.Key.SUITE, element, optNoId)
//   edY.Xml.Flow.toDom(block, element, optNoId)
// }

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Xml.Classdef.fromDom = function (block, element) {
//   var value = element.getAttribute(edY.Xml.NAME)
//   if (goog.isDefAndNotNull(value)) {
//     block.edy.data.value.set(value)
//   }
//   if (edY.Xml.Input.Named.fromDom(block, edY.Key.ARGUMENTS, element, true)) {
//     block.edy.data.variant.set(edY.Key.ARGUMENTS)
//   }
//   edY.Xml.Input.Named.fromDom(block, edY.Key.SUITE, element)
//   edY.Xml.Flow.fromDom(block, element)
// }

// goog.require('edY.DelegateSvg.Try')

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.DelegateSvg.Stmt.raise_stmt.prototype.fromDom = function (block, element) {
//   var max = -1
//   var k = null
//   var subtypes = this.data.subtype.getAll()
//   for (var i = 0, child; (child = element.childNodes[i++]);) {
//     if (child.getAttribute) {
//       var attribute = child.getAttribute(edY.Xml.INPUT)
//       var j = subtypes.indexOf(attribute)
//       if (j>max) {
//         max = j
//         k = attribute
//       }
//     }
//   }
//   this.data.subtype.set(k)
//   edY.Xml.InputList.fromDom(block, element)
// }

// goog.require('edY.DelegateSvg.Yield')
// goog.provide('edY.Xml.Yield')

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Xml.Yield.toDom = function (block, element) {
//   edY.Xml.InputList.toDom(block, element)
//   if (block.edy instanceof edY.DelegateSvg.Expr) {
//     element.setAttribute(edY.Key.INPUT, '')
//   }
// }

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Xml.Yield.fromDom = function (block, element) {
//   var max = -1
//   var k = null
//   var subtypes = this.data.subtype.getAll()
//   for (var i = 0, child; (child = element.childNodes[i++]);) {
//     if (child.getAttribute) {
//       var attribute = child.getAttribute(edY.Xml.INPUT)
//       var j = subtypes.indexOf(attribute)
//       if (j>max) {
//         max = j
//         k = attribute
//       }
//     }
//   }
//   block.edy.data.subtype.set(k)
//   edY.Xml.InputList.fromDom(block, element)
// }

// edY.DelegateSvg.Expr.yield_expression.prototype.xml = edY.DelegateSvg.Stmt.yield_stmt.prototype.xml = edY.Xml.Yield









// goog.require('Blockly.Field')
// goog.require('Blockly.FieldVariable')

// Blockly.Field.prototype.getSerializedXml = function () {
//   var container = goog.dom.createDom('field', null, this.data.value.get())
//   container.setAttribute('name', this.name)
//   return container
// }

// Blockly.FieldVariable.prototype.getSerializedXml = function () {
//   var container = Blockly.FieldVariable.superClass_.getSerializedXml.call(this)
//   var variable = this.sourceBlock_.workspace.getVariable(this.data.value.get())
//   if (variable) {
//     container.setAttribute('id', variable.getId())
//     container.setAttribute('variableType', variable.type)
//   }
//   return container
// }

// Blockly.Field.prototype.deserializeXml = function (xml) {
//   this.setValue(xml.textContent)
// }

// Blockly.FieldVariable.prototype.deserializeXml = function (xml) {
//   // TODO (marisaleung): When we change setValue and getValue to
//   // interact with id's instead of names, update this so that we get
//   // the variable based on id instead of textContent.
//   var type = xml.getAttribute('variableType') || ''
//   var workspace = this.sourceBlock_.workspace
//   var text = xml.textContent
//   var variable = workspace.getVariable(text)
//   if (!variable) {
//     variable = workspace.createVariable(text, type,
//       xml.getAttribute('id'))
//   }
//   if (typeof (type) !== 'undefined' && type !== null) {
//     if (type !== variable.type) {
//       throw Error('Serialized variable type with id \'' +
//         variable.getId() + '\' had type ' + variable.type + ', and ' +
//         'does not match variable field that references it: ' +
//         Blockly.Xml.domToText(xml) + '.')
//     }
//   }
//   this.setValue(text)
// }











// /**
//  * Convert the block's input list with the given name to a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId.
//  * @return a dom element, void lists may return nothing
//  */
// edY.Xml.namedListInputToDom = function(block, name, element, optNoId) {
//   var input = block.getInput(name)
//   if (input) {
//     var target = input.connection.targetBlock()
//     if (target) {
//       var child = goog.dom.createDom(edY.Xml.LIST)
//       if (edY.Xml.toDom(target, child, optNoId)) {
//         goog.dom.appendChild(element, child)
//         child.setAttribute(edY.Xml.INPUT, input.name)
//         return child
//       }
//     }
//   }
//   return undefined
// }

// /**
//  * Convert the block's input list with the given name to a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {string} name.
//  * @param {Element} xml the persistent element.
//  * @return a dom element, void lists may return nothing
//  */
// edY.Xml.namedListInputFromDom = function(block, name, element) {
//   var input = block.getInput(name)
//   if (input) {
//     if (!input.connection) {
//       console.warn('Missing connection')
//     }
//     var target = input.connection.targetBlock()
//     if (target) {
//       for (var i = 0, child;(child = element.childNodes[i++]);) {
//         if (child.nodeName.toLowerCase() === edY.Xml.LIST && child.getAttribute(edY.Xml.INPUT) === name) {
//           edY.Xml.fromDom(target, child)
//           return true
//         }
//       }
//     }
//   }
//   return false
// }

// goog.require('edY.Data')

// /**
//  * Records the data as attribute.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Data.prototype.toDomAttribute = function (element) {
//   var value = this.get()
//   if (value && value.length) {
//     element.setAttribute(this.name, this.get())
//   }
//   return element
// }

// /**
//  * Records the data from the attribute.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Data.prototype.fromDomAttribute = function (element) {
//   var text = element.getAttribute(this.name)
//   if (goog.isDefAndNotNull(text)) {
//     this.set(text)
//   }
// }

// goog.provide('edY.Xml.Value')

// /**
//  * Records the subtype as 'value' attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Xml.Value.toDom = function (block, element, optNoId) {
//   element.setAttribute('value', block.edy.data.value.get())
//   return element
// }

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Xml.Value.fromDom = function (block, element) {
//   var value = element.getAttribute('value')
//   if (goog.isDefAndNotNull(value)) {
//     block.edy.data.value.set(value)
//   }
// }

// goog.require('edY.DelegateSvg.Expr')

// edY.DelegateSvg.Expr.builtin_object.prototype.xml = edY.Xml.Value

// edY.DelegateSvg.Expr.any.prototype.xml = edY.Xml.Text


// edY.DelegateSvg.Expr.proper_slice.prototype.xml = edY.DelegateSvg.Expr.conditional_expression_s3d.prototype.xml = edY.Xml.InputList


// goog.provide('edY.Xml.SingleInput')

// /**
//  * Convert the block's input list from a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId.
//  * @return a dom element
//  */
// edY.Xml.SingleInput.toDom = function(block, element, optNoId) {
//   return block.inputList.length? edY.Xml.Input.toDom(block.inputList[0], element, optNoId, true): element
// }

// /**
//  * Convert the block's input list from a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @return a dom element, void lists may return nothing
//  */
// edY.Xml.SingleInput.fromDom = function(block, xml) {
//   return xml.childNodes.length && edY.Xml.Input.fromDom(block.inputList[0], xml.childNodes[0])
// }

// edY.DelegateSvg.Expr.not_test_s3d.prototype.xml = edY.Xml.SingleInput

// // edY.DelegateSvg.Expr.T3s = [
// //   edY.DelegateSvg.Expr.proper_slice,
// //   edY.DelegateSvg.Expr.conditional_expression_s3d,
// //   edY.DelegateSvg.Expr.or_expr_star,
// //   edY.DelegateSvg.Expr.or_expr_star_star,
// //   edY.DelegateSvg.Expr.not_test_s3d,
// //   edY.DelegateSvg.Expr.shortstringliteral,
// //   edY.DelegateSvg.Expr.shortbytesliteral,
// //   edY.DelegateSvg.Expr.longstringliteral,
// //   edY.DelegateSvg.Expr.longbytesliteral,
// //   edY.DelegateSvg.Expr.numberliteral,
// //   edY.DelegateSvg.Expr.integer,
// //   edY.DelegateSvg.Expr.floatnumber,
// //   edY.DelegateSvg.Expr.imagnumber,
// //   edY.DelegateSvg.Expr.builtin_object,
// //   edY.DelegateSvg.Expr.any,
// // ]

// goog.require('edY.DelegateSvg.Expr.longliteral')

// goog.require('edY.DelegateSvg.Literal')

// /**
//  * Convert the block to a dom element and vice versa.
//  * For edython.
//  */
// edY.DelegateSvg.Literal.prototype.xml = edY.Xml.Text

// goog.require('edY.DelegateSvg.List')

// /**
//  * Convert the block to a dom element.
//  * Called at the end of blockToDom.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId.
//  * @return a dom element
//  */
// edY.DelegateSvg.List.prototype.toDom = function(block, element, optNoId) {
//   var x = edY.Xml.InputList.toDom(block, element, optNoId)
//   return block.getSurroundParent()? x: element
// }

// /**
//  * Convert the block's input list to a dom element.
//  * Void lists may not appear in the persistent storage.
//  * As list are dynamic objects, the input list is not
//  * known until the end.
//  * List blocks are expected to contain only expressions,
//  * no statements.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @return a dom element, void lists may return nothing
//  */
// edY.DelegateSvg.List.prototype.fromDom = function(block, xml, type) {
//   var out = block
//   for (var i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
//     if (goog.isFunction(xmlChild.getAttribute)) {
//       var name = xmlChild.getAttribute(edY.Xml.INPUT)
//       if (name) {
//         var input = block.getInput(name)
//         if (input) {
//           var c8n = input.connection
//           if (c8n) {
//             var target = c8n.targetBlock()
//             if (target) {
//               out = out || edY.Xml.fromDom(target, (target.edy.wrapped_ && !(target.edy instanceof edY.DelegateSvg.List))?
//                 xml: xmlChild)
//               continue
//             } else if (type && (target = edY.DelegateSvg.newBlockComplete(type, input.sourceBlock_.workspace, true))) {
//               out = out || edY.Xml.fromDom(target, xmlChild)
//               continue
//             } else if ((target = Blockly.Xml.domToBlock(xmlChild, input.sourceBlock_.workspace))) {
//               out = target
//               // we could create a block form that child element
//               // then connect it to 
//               if (target.outputConnection && c8n.checkType_(target.outputConnection)) {
//                 c8n.connect(target.outputConnection)
//               } else if (target.previousConnection && c8n.checkType_(target.previousConnection)) {
//                 c8n.connect(target.previousConnection)
//               }
//             }
//           }
//         }
//       }
//     }
//   }
//   return out
// }

// /**
//  * The xml tag name of this block, as it should appear in the saved data.
//  * Default implementation just returns 'edy:list' when this block is embedded
//  * and the inherited value otherwise.
//  * For edython.
//  * @param {!Blockly.Block} block The owner of the receiver.
//  * @return true if the given value is accepted, false otherwise
//  */
// edY.DelegateSvg.Expr.target_list.prototype.tagName = function (block) {
//   return edY.DelegateSvg.List.superClass_.tagName.call(this, block)
// }

// edY.DelegateSvg.Expr.target_list_list.prototype.XfromDom = function(block, xml) {
//   var out = block
//   for (var i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
//     if (goog.isFunction(xmlChild.getAttribute)) {
//       var name = xmlChild.getAttribute(edY.Xml.INPUT)
//       if (name) {
//         var input = block.getInput(name)
//         if (input) {
//           var c8n = input.connection
//           if (c8n) {
//             var target = c8n.targetBlock()
//             if (target) {
//               out = out || edY.Xml.fromDom(target, (target.edy.wrapped_ && !(target.edy instanceof edY.DelegateSvg.List))?
//                 xml: xmlChild)
//               continue
//             } else if ((target = edY.DelegateSvg.newBlockComplete(input.sourceBlock_.workspace, edY.T3.Expr.target_list, true))) {
//               c8n.connect(target.outputConnection)
//               out = edY.Xml.fromDom(target, xmlChild)
//               continue
//             } else if ((target = Blockly.Xml.domToBlock(xmlChild, input.sourceBlock_.workspace))) {
//               out = target
//               // we could create a block form that child element
//               // then connect it to 
//               if (target.outputConnection && c8n.checkType_(target.outputConnection)) {
//                 c8n.connect(target.outputConnection)
//               } else if (target.previousConnection && c8n.checkType_(target.previousConnection)) {
//                 c8n.connect(target.previousConnection)
//               }
//             }
//           }
//         }
//       }
//     }
//   }
//   return out
// }

// goog.provide('edY.Xml.Operator')
// goog.require('edY.DelegateSvg.Operator')

// /**
//  * The xml tag name of this block, as it should appear in the saved data.
//  * Default implementation just returns 'expr'
//  * For edython.
//  * @param {!Blockly.Block} block The owner of the receiver.
//  * @return true if the given value is accepted, false otherwise
//  */
// edY.DelegateSvg.Operator.prototype.tagName = function (block) {
//   var m = XRegExp.exec(block.type, edY.XRE.solid)
// if (m) {
//   return m.core
// }
//   return block.type
// }

// /**
//  * Records the operator as attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Xml.Operator.toDom = function (block, element, optNoId) {
//   block.edy.data.operator.toDomAttribute(element)
//   element.setAttribute(edY.Xml.VALUE, block.edy.data.operator.get())
//   edY.Xml.InputList.toDom(block, element, optNoId)
// }

// /**
//  * Set the operator from the attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.Xml.Operator.fromDom = function (block, element) {
//   block.edy.data.operator.fromDomAttribute(element)
//   edY.Xml.InputList.fromDom(block, element)
// }

// edY.DelegateSvg.Operator.prototype.xml = edY.Xml.Operator
// edY.DelegateSvg.Expr.power_s3d.prototype.xml = edY.Xml.Operator


// goog.require('edY.DelegateSvg.AugAssign')

// /**
//  * Records the operator as attribute.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.toDom = function (block, element, optNoId) {
//   var variantData = this.data.variant
//   var model = variantData.model
//   var variant = variantData.get()
//   var withTarget = edY.Do.getVariantFlag(variant, model.TARGET)
//   if (withTarget) {
//     edY.Xml.Input.Named.toDom(block, edY.Key.TARGET, element, optNoId, true)
//   } else {
//     var text = this.data.value.get()
//     if (text && text.length) {
//       element.setAttribute(edY.Key.VALUE, text)
//     }
//   }
//   element.setAttribute(edY.Key.OPERATOR, this.data.operator.get())
//   edY.Xml.Input.Named.toDom(block, edY.Key.EXPRESSIONS, element, optNoId)
// }

// /**
//  * Set the augmented_assignment_stmt from the element.
//  * @param {!Blockly.Block} block.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// edY.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.fromDom = function (block, element) {
//   var variant = 0
//   if (edY.Xml.Input.Named.fromDom(block, edY.Key.TARGET, element, true)) {
//     variant = edY.Do.makeVariantFlags(variant, this.data.variant.model.TARGET)
//   } else {
//     var text = element.getAttribute(edY.Key.VALUE)
//     if (goog.isDefAndNotNull(text)) {
//       this.data.value.set(text)
//     }
//   }
//   var operator = element.getAttribute(edY.Key.OPERATOR)
//   var numberOperators = this.data.numberOperator.getAll()
//   var bitwiseOperators = this.data.bitwiseOperator.getAll()
//   if (numberOperators.indexOf(operator) >= 0) {
//     this.data.numberOperator.set(operator)
//   } else if (bitwiseOperators.indexOf(operator) >= 0) {
//     this.data.bitwiseOperator.set(operator)
//     variant = edY.Do.makeVariantFlags(variant, this.data.variant.model.BITWISE)
//   }
//   edY.Xml.Input.Named.fromDom(block, edY.Key.ARGUMENTS, element)
//   this.data.variant.set(variant)
// }

// /**
//  * Convert the block to a dom element.
//  * Called at the end of blockToDom.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId.
//  * @return a dom element
//  */
// edY.DelegateSvg.Expr.attributeref.prototype.toDom = function(block, element, optNoId) {
//   var text = this.data.value.get()
//   if (text && text.length) {
//     element.setAttribute(edY.Xml.VALUE, text)
//   }
//   return edY.Xml.Input.Named.toDom(block, edY.Key.PRIMARY, element, optNoId)
// }

// /**
//  * fromDom.
//  * @param {!Blockly.Block} block to be initialized.
//  * @param {!Element} xml dom element.
//  * For subclassers eventually
//  */
// edY.DelegateSvg.Expr.attributeref.prototype.fromDom = function (block, element) {
//   var text = element.getAttribute(edY.Xml.VALUE)
//   if (text) {
//     block.edy.data.value.set(text) // validation?
//   }
//   return edY.Xml.Input.Named.fromDom(block, edY.Key.PRIMARY, element)
// }

// /**
//  * Convert the block to a dom element.
//  * Called at the end of blockToDom.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId.
//  * @return a dom element
//  */
// edY.DelegateSvg.Expr.slicing.prototype.toDom = function(block, element, optNoId) {
//   var variant = this.data.variant.get()
//   if (variant) {
//     edY.Xml.Input.Named.toDom(block, edY.Key.PRIMARY, element, optNoId)
//   } else {
//     var text = this.data.value.get()
//     element.setAttribute(edY.Xml.VALUE, text || '?')  
//   }
//   return edY.Xml.Input.Named.toDom(block, edY.Key.SLICE, element, optNoId)
// }

// /**
//  * fromDom.
//  * @param {!Blockly.Block} block to be initialized.
//  * @param {!Element} xml dom element.
//  * For subclassers eventually
//  */
// edY.DelegateSvg.Expr.slicing.prototype.fromDom = function (block, element) {
//   var text = element.getAttribute(edY.Xml.VALUE)
//   if (text) {
//     this.data.variant.set(0)
//     if (text === '?') {
//       block.edy.data.value.setTrusted('')
//     } else {
//       block.edy.data.value.set(text)
//     }
//   } else {
//     this.data.variant.set(1)
//     edY.Xml.Input.Named.fromDom(block, edY.Key.PRIMARY, element)
//   }
//   return edY.Xml.Input.Named.fromDom(block, edY.Key.SLICE, element)
// }

// goog.require('edY.DelegateSvg.Term')

// /**
//  * The xml tag name of this block, as it should appear in the saved data.
//  * Default implementation just returns the block type.
//  * For edython.
//  * @param {!Blockly.Block} block The owner of the receiver.
//  * @return true if the given value is accepted, false otherwise
//  */
// edY.DelegateSvg.Expr.term.prototype.tagNameX = function (block) {
//   return edY.Xml.TERM
// }

// /**
//  * Convert the block to a dom element.
//  * Called at the end of blockToDom.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId.
//  * @return a dom element
//  */
// edY.DelegateSvg.Expr.term.prototype.toDomX = function(block, element, optNoId) {
//   var variant = this.data.variant.get()
//   var model = this.data.variant.model
//   var modifier = '', withAnnotation, withDefinition
//   var withoutName, withAlias
//   switch(variant) {
//     case model.NAME:
//     break
//     case model.STAR_NAME:
//       modifier = '*'
//     break
//     case model.STAR_STAR_NAME:
//       modifier = '**'
//     break
//     case model.NAME_ANNOTATION:
//       withAnnotation = true
//     break
//     case model.STAR_NAME_ANNOTATION:
//       modifier = '*'
//       model = true
//     break
//     case model.NAME_ANNOTATION_DEFINITION:
//       withAnnotation = true
//       withDefinition = true
//     break
//     case model.NAME_DEFINITION:
//       withDefinition = true
//     break
//     case model.NAME_ALIAS:
//       withoutAlias = true
//     break
//     case model.STAR:
//       modifier = '*'
//       withoutName = true
//     break
//   }
//   if (modifier.length) {
//     element.setAttribute(edY.Xml.MODIFIER, modifier)
//   }
//   if (!withoutName) {
//     var text = this.data.value.get()
//     if (text && text.length || modifier === '*') {
//       element.setAttribute(edY.Xml.VALUE, text || '?')
//     }
//     if (withAnnotation) {
//       edY.Xml.Input.Named.toDom(block, edY.Key.ANNOTATION, element, optNoId, true)
//     }
//     if (withDefinition) {
//       edY.Xml.Input.Named.toDom(block, edY.Key.DEFINITION, element, optNoId, true)
//     }
//     if (withAlias) {
//       var text = this.data.alias.get()
//       element.setAttribute(edY.Xml.AS, text || '?')
//     }
//   }
// }

// /**
//  * fromDom.
//  * @param {!Blockly.Block} block to be initialized.
//  * @param {!Element} xml dom element.
//  * For subclassers eventually
//  */
// edY.DelegateSvg.Expr.term.prototype.fromDomX = function (block, element) {
//   edY.Xml.Expr.fromDom(block, element)
//   var model = this.data.variant.model
//   var modifier = this.data.modifier.get()
//   var withoutName = modifier === '*' && !this.data.name.isActive()
//   var withAlias = this.data.alias.isActive()
//   var withAnnotation = this.ui.tiles.annotation.isRequiredFromDom()
//   var newVariant = undefined
//   var model = this.data.variant.model
//   if (modifier === '**') {
//     newVariant = model.STAR_STAR_NAME
//   } else if (modifier === '*') {
//     if (withoutName) {
//       newVariant = model.STAR
//     } else if (withAnnotation) {
//       newVariant = model.STAR_NAME_ANNOTATION
//     } else {
//       newVariant = model.STAR_NAME
//     }
//   }
//   var withDefinition = this.ui.tiles.definition.isRequiredFromDom()
//   var expected = model.bySubtype[this.data.subtype.get()]
//   if (expected && expected.indexOf(newVariant) < 0) { // maybe newVariant is undefined
//     if (withDefinition) {
//       newVariant = withAnnotation? model.NAME_ANNOTATION_DEFINITION: model.NAME_DEFINITION
//     }
//     if (expected.indexOf(newVariant) < 0) {
//       newVariant = withAnnotation? model.NAME_ANNOTATION: model.NAME
//     }
//   }
//   this.data.variant.setTrusted(newVariant)
// }
// console.log('manage the conflicts/ bad data.')
// goog.require('edY.DelegateSvg.Lambda')

// /**
//  * The xml tag name of this block, as it should appear in the saved data.
//  * Default implementation just returns the block type.
//  * For edython.
//  * @param {!Blockly.Block} block The owner of the receiver.
//  * @return true if the given value is accepted, false otherwise
//  */
// edY.DelegateSvg.Expr.lambda.prototype.tagName = function (block) {
//   return edY.Xml.LAMBDA
// }

// edY.DelegateSvg.Manager.registerDelegate_(edY.Xml.LAMBDA, edY.DelegateSvg.Expr.lambda)

// edY.DelegateSvg.Expr.lambda.prototype.xml = edY.Xml.InputList

// goog.require('edY.DelegateSvg.Argument')

// edY.DelegateSvg.Expr.keyword_item.prototype.xml = edY.Xml.InputList

// // edY.T3.Expr.identifier,

// // edY.T3.Expr.argument_list,
// // edY.T3.Expr.identifier,
// // edY.T3.Expr.argument_list_comprehensive,

// goog.provide('edY.Xml.Comprehension')
// goog.require('edY.DelegateSvg.Comprehension')

// edY.DelegateSvg.Expr.comp_for.prototype.xml =
// edY.DelegateSvg.Expr.comp_if.prototype.xml =
// edY.DelegateSvg.Expr.comp_iter_list.prototype.xml =
// edY.DelegateSvg.Expr.key_datum_s3d.prototype.xml =
// edY.Xml.InputList

// /**
//  * toDom.
//  * @param {!Blockly.Block} block to be translated.
//  * @param {!Element} element dom element to be completed.
//  * @param {boolean} optNoId true if no id is required.
//  * For subclassers eventually
//  */
// edY.DelegateSvg.Expr.key_datum_s3d.prototype.xml =
// edY.Xml.InputList


// edY.DelegateSvg.Expr.comprehension.prototype.xml =
// edY.DelegateSvg.Expr.generator_expression.prototype.xml =
// edY.Xml.InputList

// edY.DelegateSvg.Expr.dict_comprehension.prototype.xml = {}

// /**
//  * toDom.
//  * @param {!Blockly.Block} block to be translated.
//  * @param {!Element} element dom element to be completed.
//  * @param {boolean} optNoId true if no id is required.
//  * For subclassers eventually
//  */
// edY.DelegateSvg.Expr.dict_comprehension.prototype.xml.toDom = function (block, element, optNoId) {
//   // create a list element
//   edY.Xml.Input.Named.toDom(block, edY.Key.KEY, element, optNoId)
//   edY.Xml.Input.Named.toDom(block, edY.Key.DATUM, element, optNoId)
//   edY.Xml.namedListInputToDom(block, edY.Key.FOR, element, optNoId)
//   edY.Xml.Input.Named.toDom(block, edY.Key.IN, element, optNoId)
//   edY.Xml.namedListInputToDom(block, edY.Key.COMP_ITER, element, optNoId)
// }

// /**
//  * fromDom.
//  * @param {!Blockly.Block} block to be initialized.
//  * @param {!Element} xml dom element.
//  * For subclassers eventually
//  */
// edY.DelegateSvg.Expr.dict_comprehension.prototype.xml.fromDom = function (block, xml) {
//   edY.Xml.Input.Named.fromDom(block, edY.Key.KEY, xml)
//   edY.Xml.Input.Named.fromDom(block, edY.Key.DATUM, xml)
//   edY.Xml.namedListInputFromDom(block, edY.Key.FOR, xml)
//   edY.Xml.Input.Named.fromDom(block, edY.Key.IN, xml)
//   edY.Xml.namedListInputFromDom(block, edY.Key.COMP_ITER, xml)
// }

// goog.require('edY.DelegateSvg.Assignment')

// edY.DelegateSvg.Stmt.assignment_stmt.prototype.xml = {}

// /**
//  * toDom.
//  * @param {!Blockly.Block} block to be translated.
//  * @param {!Element} element dom element to be completed.
//  * @param {boolean} optNoId true if no id is required.
//  * @this is the block delegate
//  * For subclassers eventually
//  */
// edY.DelegateSvg.Stmt.assignment_stmt.prototype.xml.toDom = function (block, element, optNoId) {
//   var variant = this.data.variant.get()
//   if (variant == 2) {
//     edY.Xml.Input.Named.toDom(block, edY.Key.TARGET, element, optNoId, true)
//   } else {
//     var text = this.data.value.get()
//     if (text && text.length) {
//       element.setAttribute(edY.Xml.VALUE, text || '?')
//     }
//     if (variant == 1) {
//       edY.Xml.Input.Named.toDom(block, edY.Key.ANNOTATION, element, optNoId, true)
//     }
//   }
//   edY.Xml.Input.Named.toDom(block, edY.Key.ASSIGNED, element, optNoId)
// }

// /**
//  * fromDom.
//  * @param {!Blockly.Block} block to be initialized.
//  * @param {!Element} xml dom element.
//  * For subclassers eventually
//  */
// edY.DelegateSvg.Stmt.assignment_stmt.prototype.xml.fromDom = function (block, element) {
//   if (edY.Xml.Input.Named.fromDom(block, edY.Key.TARGET, element, true)) {
//     this.data.variant.set(2)
//   } else {
//     var text = element.getAttribute(edY.Xml.VALUE)
//     if (goog.isDefAndNotNull(text)) {
//       this.data.value.set(text)
//     }
//     if (edY.Xml.Input.Named.fromDom(block, edY.Key.ANNOTATION, element, true)) {
//       this.data.variant.set(1)
//     } else {
//       this.data.variant.set(0)
//     }
//   }
//   edY.Xml.Input.Named.fromDom(block, edY.Key.ASSIGNED, element)
// }

// goog.require('edY.DelegateSvg.Expr')

// edY.DelegateSvg.Expr.starred_expression.prototype.xml = {}

// /**
//  * toDom.
//  * @param {!Blockly.Block} block to be translated.
//  * @param {!Element} element dom element to be completed.
//  * @param {boolean} optNoId true if no id is required.
//  * @this is the block delegate
//  * For subclassers eventually
//  */
// edY.DelegateSvg.Expr.starred_expression.prototype.xml.toDom = function (block, element, optNoId) {
//   block.edy.data.modifier.toDomAttribute(element)
//   edY.Xml.Input.Named.toDom(block, edY.Key.EXPRESSION, element, optNoId)
// }

// /**
//  * fromDom.
//  * @param {!Blockly.Block} block to be initialized.
//  * @param {!Element} xml dom element.
//  * For subclassers eventually
//  */
// edY.DelegateSvg.Expr.starred_expression.prototype.xml.fromDom = function (block, element) {
//   block.edy.data.modifier.fromDomAttribute(element)
//   edY.Xml.Input.Named.fromDom(block, edY.Key.EXPRESSION, element)
// }

