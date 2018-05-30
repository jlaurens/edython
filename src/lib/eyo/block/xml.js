/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
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
 * The xml nodes concerning edython all pertain to the `eyo` namespace.
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

goog.provide('eYo.Xml')

goog.require('eYo.Const')
goog.require('eYo.T3')

goog.require('Blockly.Xml')
goog.require('goog.dom');

eYo.Xml = {
  INPUT: 'eyo:input', // attribute name
  FLOW: 'eyo:flow', // attribute name
  NEXT: 'eyo:next', // attribute name
  DOTTED_NAME: 'eyo:dotted_name', // attribute name
  NAME: 'eyo:name', // attribute name
  MODIFIER: 'eyo:modifier', // attribute name
  VALUE: 'eyo:value', // attribute name
  AS: 'eyo:as', // attribute name
  FROM: 'eyo:from', // attribute name
  COMMENT: 'eyo:comment', // attribute name

  STATE: 'eyo:state', // attribute name
  LOCKED: 'eyo:locked', // attribute name
  QUESTION: '?',

  LITERAL: 'eyo:literal',
  TERM: 'eyo:term',
  LIST: 'eyo:list',
  COMPARISON: 'eyo:comparison',
  PARAMETER: 'eyo:parameter',
  LAMBDA: 'eyo:lambda',
  CALL: 'eyo:call',
  BUILTIN: 'eyo:builtin',
  BUILTIN_CALL: 'eyo:builtin_call',
  GLOBAL: 'eyo:global',
  NONLOCAL: 'eyo:nonlocal'
}

console.warn('No eYo.Xml.CALL !!!!')
/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 * Overriden to add the `eyo` namespace.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Value representation.
 */
Blockly.Xml.domToText = function (dom) {
  dom.setAttribute('xmlns:eyo', 'urn:edython:1.0')
  var oSerializer = new XMLSerializer()
  return oSerializer.serializeToString(dom)
}

/**
 * Decode an XML DOM and create blocks on the workspace.
 * overriden to support other kind of blocks
 * This is a copy with a tiny formal modification.
 * @param {!Element} xml XML DOM.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {Array.<string>} An array containing new block IDs.
 */
Blockly.Xml.domToWorkspace = eYo.Xml.domToWorkspace = function (xml, workspace) {
  if (xml instanceof Blockly.Workspace) {
    var swap = xml
    xml = workspace
    workspace = swap
    console.warn('Deprecated call to Blockly.Xml.domToWorkspace, ' +
                 'swap the arguments.')
  }
  var width // Not used in LTR.
  if (workspace.RTL) {
    width = workspace.getWidth()
  }
  var newBlockIds = [] // A list of block IDs added by this call.
  Blockly.Field.startCache()
  // Safari 7.1.3 is known to provide node lists with extra references to
  // children beyond the lists' length.  Trust the length, do not use the
  // looping pattern of checking the index for an object.
  var childCount = xml.childNodes.length

  // Disable workspace resizes as an optimization.
  if (workspace.setResizesEnabled) {
    workspace.setResizesEnabled(false)
  }

  // This part is the custom part for edython
  var newBlock = function (xmlChild) {
    var block
    if (xmlChild && goog.isFunction(xmlChild.getAttribute)) {
      if ((block = Blockly.Xml.domToBlock(xmlChild, workspace))) {
        newBlockIds.push(block.id)
        var blockX = xmlChild.hasAttribute('x')
          ? parseInt(xmlChild.getAttribute('x'), 10) : 10
        var blockY = xmlChild.hasAttribute('y')
          ? parseInt(xmlChild.getAttribute('y'), 10) : 10
        if (!isNaN(blockX) && !isNaN(blockY)) {
          block.moveBy(blockX, blockY)
        }
      } else {
        // create children in a conservative idea
        for (var ii = 0, child; (child = xml.childNodes[ii]); ii++) {
          newBlock(child)
        }
      }
    }
    return block
  }
  eYo.Events.setGroup(true)
  var variablesFirst = true
  try {
    for (var i = 0; i < childCount; i++) {
      var xmlChild = xml.childNodes[i]
      var name = xmlChild.nodeName.toLowerCase()
      if (name === 'block' ||
        (name === 'shadow' && !Blockly.Events.recordUndo)) {
        // Allow top-level shadow blocks if recordUndo is disabled since
        // that means an undo is in progress.  Such a block is expected
        // to be moved to a nested destination in the next operation.
        var block = Blockly.Xml.domToBlock(xmlChild, workspace)
        newBlockIds.push(block.id)
        var blockX = xmlChild.hasAttribute('x')
          ? parseInt(xmlChild.getAttribute('x'), 10) : 10
        var blockY = xmlChild.hasAttribute('y')
          ? parseInt(xmlChild.getAttribute('y'), 10) : 10
        if (!isNaN(blockX) && !isNaN(blockY)) {
          block.moveBy(workspace.RTL ? width - blockX : blockX, blockY)
        }
        variablesFirst = false
      } else if (name === 'shadow') {
        goog.asserts.fail('Shadow block cannot be a top-level block.')
        variablesFirst = false
      } else if (name === 'variables') {
        if (variablesFirst) {
          Blockly.Xml.domToVariables(xmlChild, workspace)
        } else {
          throw Error('\'variables\' tag must exist once before block and ' +
            'shadow tag elements in the workspace XML, but it was found in ' +
            'another location.')
        }
        variablesFirst = false
      } else {
        // for edython
        newBlock(xmlChild)
      }
    }
  } finally {
    eYo.Events.setGroup(false)
    Blockly.Field.stopCache()
  }
  // Re-enable workspace resizing.
  if (workspace.setResizesEnabled) {
    workspace.setResizesEnabled(true)
  }
  return newBlockIds
}

goog.exportSymbol('eYo.Xml.domToWorkspace', eYo.Xml.domToWorkspace)

/**
 * Encode a block subtree as XML.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {Element} xml the persistent element.
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
eYo.Xml.savedBlockToDom = Blockly.Xml.blockToDom
Blockly.Xml.blockToDom = function (block, optNoId) {
  if (block.type.indexOf('eyo:') < 0) {
    // leave the control to the original player
    return eYo.Xml.savedBlockToDom(block, optNoId)
  } else {
    return eYo.Xml.blockToDom(block, optNoId)
  }
}

/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Element|string} xmlBlock XML block element or string representation of an xml block.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {!Blockly.Block} The root block created.
 */
eYo.Xml.savedDomToBlock = Blockly.Xml.domToBlock
Blockly.Xml.domToBlock = function (xmlBlock, workspace) {
  if (xmlBlock instanceof Blockly.Workspace) {
    var swap = xmlBlock
    xmlBlock = workspace
    workspace = swap
    console.warn('Deprecated call to Blockly.Xml.domToBlock, ' +
                 'swap the arguments.')
  }
  if (goog.isString(xmlBlock)) {
    var parser = new DOMParser()  
    xmlBlock = parser.parseFromString(xmlBlock, 'text/xml').firstElementChild.firstElementChild
  }
  var topBlock = eYo.Xml.savedDomToBlock(xmlBlock, workspace)
  // the block has been partially rendered but it was when
  // the connections were hidden
  if (topBlock) {
    setTimeout(function () {
      if (topBlock.workspace && !topBlock.workspace.isDragging()) { // Check that the block hasn't been deleted and ...
        topBlock.render()
      }
    }, 1)
  }
  return topBlock
}

/**
 * Create a new block, with full contents.
 * This is the expected way to create a block 
 * to be displayed immediately.
 * @param {!WorkspaceSvg} workspace
 * @param {!String|Object} prototypeName or xml representation.
 * @private
 */
eYo.DelegateSvg.newBlockReady = function (workspace, prototypeName, id) {
  if (prototypeName.startsWith && prototypeName.startsWith('<')) {
    return Blockly.Xml.domToBlock(prototypeName, workspace)
  }
  var B = this.newBlockComplete(workspace, prototypeName, id)
  B.eyo.beReady()
  return B
}

/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Element} xmlBlock XML block element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {!Blockly.Block} The root block created.
 * @private
 */
eYo.Xml.savedDomToBlockHeadless_ = Blockly.Xml.domToBlockHeadless_
Blockly.Xml.domToBlockHeadless_ = function (xmlBlock, workspace) {
  var block = null
  if (xmlBlock.nodeName) {
    var prototypeName = xmlBlock.nodeName.toLowerCase()
    if (prototypeName.indexOf('eyo:') < 0) {
      block = eYo.Xml.savedDomToBlockHeadless_(xmlBlock, workspace)
    } else {
      block = eYo.Xml.domToBlock(xmlBlock, workspace)
    }
  }
  return block
}

/**
 * Encode a block subtree as XML.
 * There are various hooks at different levels.
 * Control is tranferred to the first object in the following list
 * which implements a blockToDom function, if any.
 * 1) block.eyo
 * 2) block.eyo.xml
 * 3) block.eyo.constructor.xml
 * 4) block.eyo.constructor
 * Otherwise an xml element with the block's tag name is created.
 * Then it is populated with the toDom method.
 * There are 5 particular situations: literal, augmented assignments and comparisons, wrapped blocks, list blocks and finally solid blocks.
 * 1) Literal blocks include various numbers and strings.
 * They all share the same tag name: eyo:literal.
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
 * as top blocks. When wrapped, the tag name is always eyo:list.
 * The solid type is encoded in the input attribute,
 * it also depends on the enclosing block.
 * 4) Wrapped blocks other than lists will not add an xml child level.
 * As a consequence, this method just returns nothing for such blocks.
 * 5) solid blocks are named after their type which eyo:foo.
 * These block types correspond to an alternate in the python grammar.
 * The persistence storage may remember these blocks as eyo:foo instead of eyo:foo.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
eYo.Xml.blockToDom = (function () {
  var blockToDom = function (block, optNoId) {
    var eyo = block.eyo
    if (eyo.wrapped_ && !(eyo instanceof eYo.DelegateSvg.List)) {
      // a wrapped block does not create a new element on its own
      // it only can populate an already existing xml node.
      // Except for list nodes.
      return
    }
    var controller = eyo
    if ((controller &&
      goog.isFunction(controller.blockToDom)) ||
      ((controller = eyo.xml) &&
      goog.isFunction(controller.blockToDom)) ||
      ((controller = eyo.constructor) &&
      (controller = controller.xml) &&
      goog.isFunction(controller.blockToDom)) ||
      ((controller = eyo.constructor) &&
      goog.isFunction(controller.blockToDom))) {
      var element = controller.blockToDom.call(eyo, block, optNoId)
    } else {
      element = goog.dom.createDom(block.eyo.tagName(block))
      if (!optNoId) {
        element.setAttribute('id', block.id)
      }
      eYo.Xml.toDom(block, element, optNoId)
    }
    // this is for the editor, not python
    if (block.eyo.locked_) {
      element.setAttribute(eYo.Xml.STATE, eYo.Xml.LOCKED)
    }
    if (block.eyo instanceof eYo.DelegateSvg.Expr && goog.isNull(element.getAttribute(eYo.Xml.INPUT))) {
      element.setAttribute(eYo.Xml.INPUT, '')
    }
    return element
  }
  return function (block, optNoId) {
    eYo.Xml.registerAllTags && eYo.Xml.registerAllTags()
    eYo.Xml.blockToDom = blockToDom
    return blockToDom(block, optNoId)
  }
}())

goog.exportSymbol('eYo.Xml.blockToDom', eYo.Xml.blockToDom)

goog.require('eYo.DelegateSvg.Expr')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
eYo.Delegate.prototype.tagName = function (block) {
  var tag = this.constructor.eyo.tagName || (this instanceof eYo.DelegateSvg.Expr ? eYo.T3.Xml.toDom.Expr : eYo.T3.Xml.toDom.Stmt)[this.constructor.eyo.key]
  return (tag && 'eyo:' + tag) || block.type
}

goog.require('eYo.DelegateSvg.Group')

goog.require('eYo.DelegateSvg.List')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns the block type.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
eYo.DelegateSvg.List.prototype.tagName = function (block) {
  return block.eyo.wrapped_ ? eYo.Xml.LIST : eYo.DelegateSvg.List.superClass_.tagName.call(this, block)
}

goog.provide('eYo.Xml.Text')

/**
 * Convert the block's value to a text dom element.
 * For edython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element
 */
eYo.Xml.Text.toDom = function (block, element, optNoId) {
  var text = block.eyo.data.value.get()
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
eYo.Xml.Text.fromDom = function (block, element) {
  for (var i = 0, xmlChild; (xmlChild = element.childNodes[i]); i++) {
    if (xmlChild.nodeType === 3 && block.eyo.data.value.set(xmlChild.nodeValue)) {
      return true
    }
  }
  return false
}

goog.require('eYo.DelegateSvg.Literal')

goog.provide('eYo.Xml.Literal')
/**
 * Try to create a Literal block from the given element.
 * @param {!Blockly.Block} block
 * @param {!Element} element dom element to be completed.
 * @override
 */
eYo.Xml.Literal.domToBlock = function (element, workspace) {
  var prototypeName = element.nodeName.toLowerCase()
  if (prototypeName !== eYo.Xml.LITERAL) {
    return
  }
  var id = element.getAttribute('id')
  for (var i = 0, xmlChild; (xmlChild = element.childNodes[i]); i++) {
    if (xmlChild.nodeType === 3) {
      var text = xmlChild.nodeValue
      var type = eYo.Do.typeOfString(text)
      switch (type) {
      case eYo.T3.Expr.integer:
      case eYo.T3.Expr.floatnumber:
      case eYo.T3.Expr.imagnumber:
        var block = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.numberliteral, id)
        break
      case eYo.T3.Expr.shortstringliteral:
      case eYo.T3.Expr.shortbytesliteral:
        block = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.shortliteral, id)
        break
      case eYo.T3.Expr.longstringliteral:
      case eYo.T3.Expr.longbytesliteral:
        block = eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.longliteral, id)
        break
      }
      if (block) {
        var eyo = block.eyo
        eyo.data.value.set(text)
        return block
      }
    }
  }
  return eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.shortliteral, id)
}

goog.provide('eYo.Xml.Data')

/**
 * Convert the block's data.
 * List all the available data and converts them to xml.
 * For edython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @param {boolean} optNoId
 * @return a dom element, void lists may return nothing
 * @this a block delegate
 */
eYo.Xml.Data.toDom = function (block, element, optNoId) {
  block.eyo.foreachData(function () {
    this.save(element)
  })
}

/**
 * Convert the block's data from a dom element.
 * For edython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element, void lists may return nothing
 * @this a block delegate
 */
eYo.Xml.Data.fromDom = function (block, element) {
  var hasText
  block.eyo.foreachData(function () {
    this.load(element)
    // Consistency section, to be removed
    var xml = this.model.xml
    if (hasText && xml && xml.text) {
      console.log(eYo.Do.format('Only one text node {0}/{1}',
        this.key, block.type))
    }
    hasText = hasText || (xml && xml.text)
  })
}

/**
 * Encode a block subtree as XML.
 * The xml element was created to hold what the block contains.
 * Some information is stored as an attribute, whereas other
 * needs another xml node.
 * When possible, the control is transferred to the first controller
 * in the following list which implements a toDom method.
 * 1) block.eyo
 * 2) block.eyo.xml
 * 3) block.eyo.constructor.xml (no inheritance)
 * 4) block.eyo.constructor (no inheritance here too)
 * The default implementation does nothing if there's no controller
 * to take control.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {element} dom element to encode in
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
eYo.Xml.toDom = function (block, element, optNoId) {
  var eyo = block.eyo
  var controller = eyo
  if ((controller && goog.isFunction(controller.toDom)) ||
    ((controller = eyo.xml) && goog.isFunction(controller.toDom)) ||
    ((controller = eyo.constructor.xml) && goog.isFunction(controller.toDom)) ||
    ((controller = eyo.constructor) && goog.isFunction(controller.toDom))) {
    return controller.toDom.call(eyo, block, element, optNoId)
  } else {
    eYo.Xml.Data.toDom(block, element, optNoId)
    // save tiles
    block.eyo.foreachTile(function () {
      this.save(element, optNoId)
    })
    var blockToDom = function (c8n, name, key) {
      if (c8n && !c8n.eyo.wrapped_) {
        // wrapped blocks belong to tiles, they are managed from there
        var target = c8n.targetBlock()
        if (target) {
          var child = Blockly.Xml.blockToDom(target, optNoId)
          if (child) {
            child.setAttribute(name, key)
            goog.dom.appendChild(element, child)
          }
        }
      }
    }
    // the list blocks have no tiles yet
    for (var i = 0, input; (input = block.inputList[i++]);) {
      if (!input.eyo.tile) {
        blockToDom(input.connection, eYo.Xml.INPUT, input.name)
      }
    }
    // the suite and the flow
    blockToDom(eyo.inputSuite && eyo.inputSuite.connection, eYo.Xml.FLOW, eYo.XmlKey.SUITE)
    blockToDom(block.nextConnection, eYo.Xml.FLOW, eYo.XmlKey.NEXT)
  }
}

/**
 * Registers all the known models for their tags
 *
 */
eYo.Xml.registerAllTags = function () {
  // mode is one of 'Expr' and 'Stmt'
  var register = function (mode) {
    var where = eYo.T3[mode]
    for (var key in where) {
      var type = where[key]
      var model = eYo.Delegate.Manager.getModel(type)
      var tag = model && model.xml && model.xml.tag
      if (!goog.isString(tag)) {
        var m = XRegExp.exec(type, eYo.XRE.s3d)
        if (m) {
          tag = m.core
        } else {
          tag = type.substring(4)
        }
      } else if (!tag.length) {
        continue
      }
      // register as fromDom
      // console.log('register ', tag)
      var already = eYo.T3.Xml.fromDom[tag]
      if (goog.isArray(already)) {
        if (already.indexOf(type) < 0) {
          already.push(type)
        }
      } else if (goog.isString(already)) {
        if (type !== already) {
          eYo.T3.Xml.fromDom[tag] = already = [already, type]
        }
      } else {
        eYo.T3.Xml.fromDom[tag] = type
      }
      // register the reverse
      var c9r = eYo.Delegate.Manager.get(type)
      if (c9r) {
        // if (!tag.startsWith('eyo:')) {
        //   console.warn('DOUBLE eYo')
        // }
        // console.warn('Register:', c9r.eyo.key, tag, eYo.T3.Xml.toDom[mode][key], key)
        c9r.eyo.tagName = eYo.T3.Xml.toDom[mode][key] || key
      }
    }
  }
  register('Expr')
  register('Stmt')
  delete eYo.Xml.registerAllTags
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
eYo.Xml.domToBlock = (function () {
  var domToBlock = function (xmlBlock, workspace) {
    var block = null
    if (!xmlBlock.nodeName) {
      return block
    }
    var id = xmlBlock.getAttribute('id')
    var name = xmlBlock.nodeName.toLowerCase()
    var prototypeName
    //
    // is it a literal or something else special ?
    if ((block = eYo.Xml.Literal.domToBlock(xmlBlock, workspace)) ||
    (block = eYo.Xml.Comparison.domToBlock(xmlBlock, workspace)) ||
    (block = eYo.Xml.Group.domToBlock(xmlBlock, workspace)) ||
    (block = eYo.Xml.Call.domToBlock(xmlBlock, workspace))) {
    } else
    // is there a simple correspondance with a known type
    if ((prototypeName = eYo.T3.Xml.fromDom[name.substring(4)])) {
      if (goog.isArray(prototypeName)) {
        if (prototypeName.length === 1) {
          prototypeName = prototypeName[0]
        } else if (!(prototypeName = (function () {
          var where = goog.isDefAndNotNull(xmlBlock.getAttribute(eYo.Xml.INPUT)) ? eYo.T3.Expr : eYo.T3.Stmt
          for (var i = 0; i < prototypeName.length; i++) {
            var candidate = prototypeName[i]
            var C8r = eYo.DelegateSvg.Manager.get(candidate)
            if (C8r && where[C8r.eyo.key]) {
              return candidate
            }
          }
        }()))) {
          return block
        }
      }
      block = eYo.DelegateSvg.newBlockComplete(workspace, prototypeName, id)
    } else {
      prototypeName = name
      var solid = prototypeName + ''
      var controller = eYo.DelegateSvg.Manager.get(solid)
      if (controller) {
        if (controller.eyo && goog.isFunction(controller.eyo.domToBlock)) {
          return controller.eyo.domToBlock(xmlBlock, workspace, id)
        } else if (goog.isFunction(controller.domToBlock)) {
          return controller.domToBlock(xmlBlock, workspace, id)
        }
        block = eYo.DelegateSvg.newBlockComplete(workspace, solid, id)
      } else if ((controller = eYo.DelegateSvg.Manager.get(prototypeName))) {
        if (controller.eyo && goog.isFunction(controller.eyo.domToBlock)) {
          return controller.eyo.domToBlock(xmlBlock, workspace, id)
        } else if (goog.isFunction(controller.domToBlock)) {
          return controller.domToBlock(xmlBlock, workspace, id)
        }
        block = eYo.DelegateSvg.newBlockComplete(workspace, prototypeName, id)
      }
      // Now create the block, either solid or not
    }
    if (block) {
      var eyo = block.eyo
      //    console.log('Block created from dom:', xmlBlock, block.type, block.id)
      // then fill it based on the xml data
      eYo.Xml.fromDom(block, xmlBlock)
      var state = xmlBlock.getAttribute(eYo.Xml.STATE)
      if (state && state.toLowerCase() === eYo.Xml.LOCKED) {
        eyo.lock(block)
      }
      // this block have been created from untrusted data
      // We might need to fix some stuff before returning
      // In particular, it will be the perfect place to setup variants
      eyo.beReady(block)
    }
    return block
  }
  return function (xmlBlock, workspace) {
    eYo.Xml.registerAllTags && eYo.Xml.registerAllTags()
    eYo.Xml.domToBlock = domToBlock
    return domToBlock(xmlBlock, workspace)
  }
}())

goog.exportSymbol('eYo.Xml.domToBlock', eYo.Xml.domToBlock)

/**
 * Decode a block subtree from XML.
 * When possible, the control is transferred to the first controller
 * in the following list which implements a fromDom method.
 * 1) block.eyo
 * 2) block.eyo.xml
 * 3) block.eyo.constructor.xml (no inheritance)
 * 4) block.eyo.constructor (no inheritance here too)
 * The default implementation does nothing if there's no controller
 * @param {!Blockly.Block} block The root block to encode.
 * @param {element} dom element to encode in
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
eYo.Xml.fromDom = function (block, element) {
  var eyo = block.eyo
  var controller = eyo
  if ((controller &&
    goog.isFunction(controller.fromDom)) ||
    ((controller = eyo.xml) &&
    goog.isFunction(controller.fromDom)) ||
    ((controller = eYo.DelegateSvg.Manager.get(block.type)) &&
    (controller = controller.xml) &&
    goog.isFunction(controller.fromDom)) ||
    ((controller = eYo.DelegateSvg.Manager.get(block.type)) &&
    goog.isFunction(controller.fromDom))) {
    return controller.fromDom.call(eyo, block, element)
  } else {
    var data = eyo.data
    for (var k in data) {
      data[k].waitOn()
    }
    eYo.Xml.Data.fromDom(block, element)
    // read tile
    eyo.foreachTile(function () {
      this.load(element)
    })
    var statement = function (c8n, key) {
      if (c8n) {
        for (var i = 0, child; (child = element.childNodes[i++]);) {
          if (goog.isFunction(child.getAttribute) && (child.getAttribute(eYo.Xml.FLOW) === key)) {
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
    if (eyo instanceof eYo.DelegateSvg.List) {
      for (var i = 0, child; (child = element.childNodes[i++]);) {
        if (goog.isFunction(child.getAttribute)) {
          var name = child.getAttribute(eYo.XmlKey.INPUT)
          var input = eyo.getInput(block, name)
          if (input) {
            if (!input.connection) {
              console.warn('Missing connection')
            }
            var inputTarget = input.connection.targetBlock()
            if (inputTarget) {
              eYo.Xml.fromDom(inputTarget, child)
            } else if ((inputTarget = eYo.Xml.domToBlock(child, block.workspace))) {
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
    var out = statement(block.nextConnection, eYo.XmlKey.NEXT)
    out = statement(eyo.inputSuite && eyo.inputSuite.connection, eYo.XmlKey.SUITE) || out
    return out
  }
}

goog.provide('eYo.Xml.Comparison')
goog.require('eYo.DelegateSvg.Operator')

/**
 * Try to create a comparison block from the given element.
 * @param {!Blockly.Block} block
 * @param {!Element} element dom element to be completed.
 * @override
 */
eYo.Xml.Comparison.domToBlock = function (element, workspace) {
  var block
  var prototypeName = element.nodeName.toLowerCase()
  var id = element.getAttribute('id')
  if (prototypeName === eYo.Xml.COMPARISON) {
    var op = element.getAttribute(eYo.Key.OPERATOR)
    var C8r, model
    var type = eYo.T3.Expr.number_comparison
    if ((C8r = eYo.DelegateSvg.Manager.get(type)) &&
    (model = C8r.eyo.getModel().tiles) &&
    model.operators &&
    model.operators.indexOf(op) >= 0) {
      block = eYo.DelegateSvg.newBlockComplete(workspace, type, id)
    } else if ((type = eYo.T3.Expr.object_comparison) && (C8r = eYo.DelegateSvg.Manager.get(type)) && (model = C8r.eyo.getModel().tiles) && model.operators && model.operators.indexOf(op) >= 0) {
      block = eYo.DelegateSvg.newBlockComplete(workspace, type, id)
    } else {
      return block
    }
    eYo.Xml.fromDom(block, element)
    return block
  }
}

goog.require('eYo.DelegateSvg.Group')
goog.provide('eYo.Xml.Group')

/**
 * Set the operator from the element's tagName.
 * @param {!Blockly.Block} block
 * @param {!Element} element dom element to be completed.
 * @override
 */
eYo.Xml.Group.domToBlock = function (element, workspace) {
  var name = element.tagName
  if (name && name.toLowerCase() === eYo.DelegateSvg.Stmt.else_part.prototype.tagName()) {
    var type = eYo.T3.Stmt.else_part
    var id = element.getAttribute('id')
    var block = eYo.DelegateSvg.newBlockComplete(workspace, type, id)
    eYo.Xml.fromDom(block, element)
    return block
  }
}

goog.provide('eYo.Xml.Call')

// call blocks have eyo:call and tag eyo:builtin_call names
// if there is an eyo:input attribute, even a ''
// then it is an expression block otherwise it is a statement block.
console.warn('convert print statement to print expression and conversely, top blocks only')
eYo.Xml.Call.domToBlock = function (element, workspace) {
  if (element.nodeName.toLowerCase() === eYo.Xml.CALL) {
    var input = element.getAttribute(eYo.Xml.INPUT)
    if (goog.isDefAndNotNull(input)) {
      var type = eYo.T3.Expr.call_expr
    } else {
      type = eYo.T3.Stmt.call_stmt
    }
    var id = element.getAttribute('id')
    var block = eYo.DelegateSvg.newBlockComplete(workspace, type, id)
    if (block) {
      eYo.Xml.fromDom(block, element)
      return block
    }
  }
}

/**
 * Compare the blocks by comparing their xml string representation.
 * Usefull for testing.
 * For edython.
 * @param {!Blockly.Block} lhs
 * @param {!Blockly.Block} rhs
 * @return an enumerator
 */
eYo.Xml.compareBlocks = function (lhs, rhs) {
  var xmlL = goog.dom.xml.serialize(eYo.Xml.blockToDom(lhs, false))
  var xmlR = goog.dom.xml.serialize(eYo.Xml.blockToDom(rhs, false))
  return xmlL < xmlR ? -1 : (xmlL < xmlR ? 1 : 0)
}
