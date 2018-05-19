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
 * @param {!Element} xmlBlock XML block element.
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
  var topBlock = eYo.Xml.savedDomToBlock(xmlBlock, workspace)
  // the block has been partially rendered but it was when
  // the connections were hidden
  if (topBlock) {
    setTimeout(function () {
      if (topBlock.workspace) { // Check that the block hasn't been deleted.
        topBlock.render()
      }
    }, 1)
  }
  return topBlock
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
 * 5) solid blocks are named after their type which eyo:foo_s3d.
 * These block types correspond to an alternate in the python grammar.
 * The persistence storage may remember these blocks as eyo:foo instead of eyo:foo_s3d.
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

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns 'eyo:literal'
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
eYo.DelegateSvg.Literal.prototype.tagName = function (block) {
  return eYo.Xml.LITERAL
}

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
        eyo.data.value.set(text) ||
        eyo.data.content.setTrusted(text)
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
          continue
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
        if (!tag.startsWith('eyo:')) {
          console.warn('DOUBLE eYo')
        }
        console.warn('Register:', c9r.eyo.key, tag, eYo.T3.Xml.toDom[mode][key], key)
        c9r.eyo.tagName = tag || eYo.T3.Xml.toDom[mode][key] || key
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
      var solid = prototypeName + '_s3d'
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
 * Compare the blocks by comparing their xml representation.
 * Usefull for testing.
 * For edython.
 * @param {!Blockly.Block} lhs
 * @param {!Blockly.Block} rhs
 * @return an enumerator
 */
eYo.Xml.compareBlocks = function (lhs, rhs) {
  var xmlL = eYo.Xml.blockToDom(lhs, false)
  var xmlR = eYo.Xml.blockToDom(rhs, false)
  return xmlL < xmlR ? -1 : (xmlL < xmlR ? 1 : 0)
}

// goog.provide('eYo.Xml.Global')

// General stuff

// goog.provide('eYo.Xml.Stmt')

// /**
//  * Convert the block's input list and next blocks to a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId
//  * @return a dom element, void lists may return nothing at all
//  * @this a block delegate
//  */
// eYo.Xml.Stmt.toDomX = function(block, element, optNoId) {
//   eYo.Xml.Data.toDom(block, element)
//   eYo.Xml.InputList.toDom(block, element, optNoId)
//   eYo.Xml.Flow.toDom(block, element, optNoId)
// }

// /**
//  * Convert the block's input list and next statement from a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @return a dom element, void lists may return nothing
//  * @this a block delegate
//  */
// eYo.Xml.Stmt.fromDomX = function(block, element) {
//   eYo.Xml.Data.fromDom(block, element)
//   eYo.Xml.InputList.fromDom(block, element)
//   eYo.Xml.Flow.fromDom(block, element)
// }

// //////////////  basic methods

// goog.provide('eYo.Xml.Input')

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
//  * @param {!eYo.Input} input  the input to be saved.
//  * @param {Element} element a dom element in which to save the input
//  * @param {boolean} optNoId
//  * @param {boolean} optNoName For lists, if there is no ambiguity, we can avoid the use of the input attribute.
//  * @return the added child, if any
//  */
// eYo.Xml.Input.toDom = function(input, element, optNoId, optNoName) {
//   var out = function() {
//     var target = input.getTarget()
//     if (target) { // otherwise, there is nothing to remember
//       if (target.eyo.wrapped_) {
//         // wrapped blocks are just a convenient computational model.
//         // For lists only, we do create a further level
//         if (target.eyo instanceof eYo.DelegateSvg.List) {
//           var child = eYo.Xml.blockToDom(target, optNoId)
//           if (child.childNodes.length>0) {
//             if (!optNoName) {
//               child.setAttribute(eYo.Xml.INPUT, input.key)
//             }
//             goog.dom.appendChild(element, child)
//             return child
//           }
//         } else {
//           // let the target populate the given element
//           return eYo.Xml.toDom(target, element, optNoId)
//         }
//       } else {
//         var child = eYo.Xml.blockToDom(target, optNoId)
//         if (child.childNodes.length>0 || child.hasAttributes()) {
//           if (!optNoName) {
//             if (input.type === Blockly.INPUT_VALUE) {
//               child.setAttribute(eYo.Xml.INPUT, input.key)
//             } else if (input.type === Blockly.NEXT_STATEMENT) {
//               child.setAttribute(eYo.Xml.FLOW, input.key)
//             }
//           }
//           goog.dom.appendChild(element, child)
//           return child
//         }
//       }
//     }
//   } ()
//   if (!out && input.isRequiredToDom()) {
//     var child = goog.dom.createDom(eYo.Xml.PLACEHOLDER)
//     child.setAttribute(eYo.Xml.INPUT, input.key)
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
//  * @param {!eYo.Input} block The block to be converted.
//  * @param {Element} element a dom element in which to save the input
//  * @return the added child, if any
//  */
// eYo.Xml.Input.fromDom = function(input, element) {
//   input.setRequiredFromDom(false)
//   var target = input.getTarget()
//   if (target && target.eyo.wrapped_ && !(target.eyo instanceof eYo.DelegateSvg.List)) {
//     input.setRequiredFromDom(true)
//     return eYo.Xml.fromDom(target, element)
//   }
//   // find an xml child with the proper input attribute
//   for (var i = 0, child; (child = element.childNodes[i++]);) {
//     if (goog.isFunction(child.getAttribute)) {
//       if (input.type === Blockly.INPUT_VALUE) {
//         var attribute = child.getAttribute(eYo.Xml.INPUT)
//       } else if (input.type === Blockly.NEXT_STATEMENT) {
//         var attribute = child.getAttribute(eYo.Xml.FLOW)
//       }
//     }
//     if (attribute === input.key) {
//       if (child.tagName && child.tagName.toLowerCase() === eYo.Xml.PLACEHOLDER) {
//         input.setRequiredFromDom(true)
//         return true
//       }
//       if (target) {
//         input.setRequiredFromDom(true)
//         return eYo.Xml.fromDom(target, child)
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

// goog.provide('eYo.Xml.Input.Named')

// /**
//  * Convert the block's input with the given name to a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {string} name The name of the input
//  * @param {Element} element a dom element in which to save the input
//  * @param {boolean} optNoId
//  * @return the added child, if any
//  */
// eYo.Xml.Input.Named.toDom = function(block, name, element, optNoId, withPlaceholder) {
//   var input = block.eyo.ui.tiles[name]
//   if (input && !input.disabled) {
//     var out = eYo.Xml.Input.toDom(input, element, optNoId)
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
// eYo.Xml.Input.Named.fromDom = function(block, name, element, withPlaceholder) {
//   var input = block.eyo.ui.tiles[name]
//   if (input) {
//     var out = eYo.Xml.Input.fromDom(input, element, withPlaceholder)
//   }
//   return out
// }

// goog.provide('eYo.Xml.InputList')

// /**
//  * Convert the block's input list from a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId
//  * @return a dom element, void lists may return nothing
//  */
// eYo.Xml.InputList.toDom = function(block, element, optNoId) {
//   var out
//   var inputs = block.eyo.ui.tiles
//   for (var k in inputs) {
//     var input = inputs[k]
//     if (!input.disabled) {
//       out = eYo.Xml.Input.toDom(input, element, optNoId)
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
// eYo.Xml.InputList.fromDom = function(block, element) {
//   var inputs = block.eyo.ui.tiles
//   for (var k in inputs) {
//     var input = inputs[k]
//     eYo.Xml.Input.fromDom(input, element)
//   }
//   block.bumpNeighbours_()
// }

// goog.provide('eYo.Xml.Flow')

// /**
//  * Convert the block's next statements to a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId
//  * @return a dom element, void lists may return nothing
//  */
// eYo.Xml.Flow.toDom = function(block, element, optNoId) {
//   var c8n = block.nextConnection
//   if (c8n) {
//     var target = c8n.targetBlock()
//     if(target) {
//       var child = Blockly.Xml.blockToDom(target, optNoId)
//       if (child) {
//         child.setAttribute(eYo.Xml.FLOW, eYo.Xml.NEXT)
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
// eYo.Xml.Flow.fromDom = function(block, element) {
//   var c8n = block.nextConnection
//   if (c8n) {
//     for (var i = 0, child; (child = element.childNodes[i++]);) {
//       if (goog.isFunction(child.getAttribute) && (child.getAttribute(eYo.Xml.FLOW) === eYo.Xml.NEXT)) {
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

// goog.require('eYo.DelegateSvg.Import')

// eYo.DelegateSvg.Stmt.import_stmt.prototype.xml = eYo.Xml.InputList

// /**
//  * Convert the block to a dom element.
//  * Transfer control to the first input that is not disabled.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId
//  * @return a dom element
//  */
// eYo.DelegateSvg.Stmt.import_stmt.prototype.toDom = function(block, element, optNoId) {
//   var variant = this.data.variant.get()
//   if (variant === 0) {
//     return eYo.Xml.Input.Named.toDom(block, eYo.Key.IMPORT_MODULE, element, optNoId)
//   }
//   var text = this.data.value.get()
//   element.setAttribute(eYo.Xml.FROM, text || '?')
//   if (variant === 1) {
//     return eYo.Xml.Input.Named.toDom(block, eYo.Key.IMPORT, element, optNoId, true)
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
// eYo.DelegateSvg.Stmt.import_stmt.prototype.fromDom = function(block, xml) {
//   var text = xml.getAttribute(eYo.Xml.FROM)
//   if (!text || !text.length) {
//     this.data.variant.set(0)
//     return eYo.Xml.Input.Named.fromDom(block, eYo.Key.IMPORT_MODULE, xml)
//   }
//   if (text !== '?') {
//     block.eyo.data.value.set(text)
//   }
//   var variant = eYo.Xml.Input.Named.fromDom(block, eYo.Key.IMPORT, xml, true)?1: 2
//   this.data.variant.set(variant)
// }

// goog.require('eYo.DelegateSvg.Primary')

// goog.require('eYo.DelegateSvg.Print')

// goog.require('eYo.DelegateSvg.Proc')

// goog.provide('eYo.Xml.Decorator')

// eYo.DelegateSvg.Stmt.decorator.prototype.xml = eYo.Xml.Decorator

// /**
//  * Records the operator as attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.Xml.Decorator.toDom = function (block, element, optNoId) {
//   var eyo = block.eyo
//   var variant = eyo.data.variant.get()
//   var value = variant === eYo.Key.BUILTIN? eyo.getBuiltin(block): eyo.data.value.get()
//   if (goog.isDefAndNotNull(value)) {
//     var child = goog.dom.createTextNode(value)
//     goog.dom.appendChild(element, child)
//   }
//   if (variant === eYo.Key.ARGUMENTS) {
//     eYo.Xml.Input.Named.toDom(block, eYo.Key.ARGUMENTS, element, optNoId)
//   }
// }

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.Xml.Decorator.fromDom = function (block, element) {
//   var builtin
//   var value
//   var eyo = block.eyo
//   for (var i = 0, xmlChild; (xmlChild = element.childNodes[i]); i++) {
//     if (xmlChild.nodeType === 3) {
//       var text = xmlChild.nodeValue
//       value = text
//       if (eyo.validateBuiltin(block, text)) {
//         builtin = text
//       }
//       break
//     }
//   }
//   if (eYo.Xml.Input.Named.fromDom(block, eYo.Key.ARGUMENTS, element)) {
//     eyo.data.value.set(value)
//     eyo.data.variant.set(2)
//   } else if(builtin) {
//     eyo.data.variant.set(1)
//     eyo.setBuiltin(block, builtin)
//   } else {
//     eyo.data.variant.set(0)
//     if (goog.isDefAndNotNull(value)) {
//       eyo.data.value.set(value)
//     }
//   }
// }

// goog.provide('eYo.Xml.Funcdef')

// eYo.DelegateSvg.Stmt.funcdef_part.prototype.xml = eYo.Xml.Funcdef

// /**
//  * Records the operator as attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.Xml.Funcdef.toDom = function (block, element, optNoId) {
//   var value = block.eyo.data.value.get()
//   if (value) {
//     element.setAttribute(eYo.Xml.NAME, value)
//   }
//   eYo.Xml.Input.Named.toDom(block, eYo.Key.PARAMETERS, element, optNoId)
//   var variant = block.eyo.data.variant.get()
//   if (variant) {
//     eYo.Xml.Input.Named.toDom(block, eYo.Key.TYPE, element, optNoId, true)
//   }
//   eYo.Xml.Input.Named.toDom(block, eYo.Key.SUITE, element, optNoId)
//   eYo.Xml.Flow.toDom(block, element, optNoId)
// }

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.Xml.Funcdef.fromDom = function (block, element) {
//   var value = element.getAttribute(eYo.Xml.NAME)
//   if (goog.isDefAndNotNull(value)) {
//     block.eyo.data.value.set(value)
//   }
//   eYo.Xml.Input.Named.fromDom(block, eYo.Key.PARAMETERS, element)
//   if (eYo.Xml.Input.Named.fromDom(block, eYo.Key.TYPE, element, true)) {
//     block.eyo.data.variant.set(eYo.Key.TYPE)
//   }
//   eYo.Xml.Input.Named.fromDom(block, eYo.Key.SUITE, element)
//   eYo.Xml.Flow.fromDom(block, element)
// }

// goog.provide('eYo.Xml.Classdef')

// eYo.DelegateSvg.Stmt.classdef_part.prototype.xml = eYo.Xml.Classdef

// /**
//  * Records the operator as attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.Xml.Classdef.toDom = function (block, element, optNoId) {
//   var value = block.eyo.data.value.get()
//   if (value) {
//     element.setAttribute(eYo.Xml.NAME, value)
//   }
//   var variant = block.eyo.data.variant.get()
//   if (variant) {
//     eYo.Xml.Input.Named.toDom(block, eYo.Key.ARGUMENTS, element, optNoId, true)
//   }
//   eYo.Xml.Input.Named.toDom(block, eYo.Key.SUITE, element, optNoId)
//   eYo.Xml.Flow.toDom(block, element, optNoId)
// }

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.Xml.Classdef.fromDom = function (block, element) {
//   var value = element.getAttribute(eYo.Xml.NAME)
//   if (goog.isDefAndNotNull(value)) {
//     block.eyo.data.value.set(value)
//   }
//   if (eYo.Xml.Input.Named.fromDom(block, eYo.Key.ARGUMENTS, element, true)) {
//     block.eyo.data.variant.set(eYo.Key.ARGUMENTS)
//   }
//   eYo.Xml.Input.Named.fromDom(block, eYo.Key.SUITE, element)
//   eYo.Xml.Flow.fromDom(block, element)
// }

// goog.require('eYo.DelegateSvg.Try')

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.DelegateSvg.Stmt.raise_stmt.prototype.fromDom = function (block, element) {
//   var max = -1
//   var k = null
//   var subtypes = this.data.subtype.getAll()
//   for (var i = 0, child; (child = element.childNodes[i++]);) {
//     if (child.getAttribute) {
//       var attribute = child.getAttribute(eYo.Xml.INPUT)
//       var j = subtypes.indexOf(attribute)
//       if (j>max) {
//         max = j
//         k = attribute
//       }
//     }
//   }
//   this.data.subtype.set(k)
//   eYo.Xml.InputList.fromDom(block, element)
// }

// goog.require('eYo.DelegateSvg.Yield')
// goog.provide('eYo.Xml.Yield')

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.Xml.Yield.toDom = function (block, element) {
//   eYo.Xml.InputList.toDom(block, element)
//   if (block.eyo instanceof eYo.DelegateSvg.Expr) {
//     element.setAttribute(eYo.Key.INPUT, '')
//   }
// }

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.Xml.Yield.fromDom = function (block, element) {
//   var max = -1
//   var k = null
//   var subtypes = this.data.subtype.getAll()
//   for (var i = 0, child; (child = element.childNodes[i++]);) {
//     if (child.getAttribute) {
//       var attribute = child.getAttribute(eYo.Xml.INPUT)
//       var j = subtypes.indexOf(attribute)
//       if (j>max) {
//         max = j
//         k = attribute
//       }
//     }
//   }
//   block.eyo.data.subtype.set(k)
//   eYo.Xml.InputList.fromDom(block, element)
// }

// eYo.DelegateSvg.Expr.yield_expression.prototype.xml = eYo.DelegateSvg.Stmt.yield_stmt.prototype.xml = eYo.Xml.Yield

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
//  * @param {boolean} optNoId
//  * @return a dom element, void lists may return nothing
//  */
// eYo.Xml.namedListInputToDom = function(block, name, element, optNoId) {
//   var input = block.getInput(name)
//   if (input) {
//     var target = input.connection.targetBlock()
//     if (target) {
//       var child = goog.dom.createDom(eYo.Xml.LIST)
//       if (eYo.Xml.toDom(target, child, optNoId)) {
//         goog.dom.appendChild(element, child)
//         child.setAttribute(eYo.Xml.INPUT, input.name)
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
//  * @param {string} name
//  * @param {Element} xml the persistent element.
//  * @return a dom element, void lists may return nothing
//  */
// eYo.Xml.namedListInputFromDom = function(block, name, element) {
//   var input = block.getInput(name)
//   if (input) {
//     if (!input.connection) {
//       console.warn('Missing connection')
//     }
//     var target = input.connection.targetBlock()
//     if (target) {
//       for (var i = 0, child;(child = element.childNodes[i++]);) {
//         if (child.nodeName.toLowerCase() === eYo.Xml.LIST && child.getAttribute(eYo.Xml.INPUT) === name) {
//           eYo.Xml.fromDom(target, child)
//           return true
//         }
//       }
//     }
//   }
//   return false
// }

// goog.require('eYo.Data')

// /**
//  * Records the data as attribute.
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.Data.prototype.toDomAttribute = function (element) {
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
// eYo.Data.prototype.fromDomAttribute = function (element) {
//   var text = element.getAttribute(this.name)
//   if (goog.isDefAndNotNull(text)) {
//     this.set(text)
//   }
// }

// goog.provide('eYo.Xml.Value')

// /**
//  * Records the subtype as 'value' attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.Xml.Value.toDom = function (block, element, optNoId) {
//   element.setAttribute('value', block.eyo.data.value.get())
//   return element
// }

// /**
//  * Set the value from the attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.Xml.Value.fromDom = function (block, element) {
//   var value = element.getAttribute('value')
//   if (goog.isDefAndNotNull(value)) {
//     block.eyo.data.value.set(value)
//   }
// }

// goog.require('eYo.DelegateSvg.Expr')

// eYo.DelegateSvg.Expr.builtin_object.prototype.xml = eYo.Xml.Value

// eYo.DelegateSvg.Expr.any.prototype.xml = eYo.Xml.Text

// eYo.DelegateSvg.Expr.proper_slice.prototype.xml = eYo.DelegateSvg.Expr.conditional_expression.prototype.xml = eYo.Xml.InputList

// goog.provide('eYo.Xml.SingleInput')

// /**
//  * Convert the block's input list from a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId
//  * @return a dom element
//  */
// eYo.Xml.SingleInput.toDom = function(block, element, optNoId) {
//   return block.inputList.length? eYo.Xml.Input.toDom(block.inputList[0], element, optNoId, true): element
// }

// /**
//  * Convert the block's input list from a dom element.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @return a dom element, void lists may return nothing
//  */
// eYo.Xml.SingleInput.fromDom = function(block, xml) {
//   return xml.childNodes.length && eYo.Xml.Input.fromDom(block.inputList[0], xml.childNodes[0])
// }

// eYo.DelegateSvg.Expr.not_test_s3d.prototype.xml = eYo.Xml.SingleInput

// // eYo.DelegateSvg.Expr.T3s = [
// //   eYo.DelegateSvg.Expr.proper_slice,
// //   eYo.DelegateSvg.Expr.conditional_expression_s3d,
// //   eYo.DelegateSvg.Expr.or_expr_star,
// //   eYo.DelegateSvg.Expr.or_expr_star_star,
// //   eYo.DelegateSvg.Expr.not_test_s3d,
// //   eYo.DelegateSvg.Expr.shortstringliteral,
// //   eYo.DelegateSvg.Expr.shortbytesliteral,
// //   eYo.DelegateSvg.Expr.longstringliteral,
// //   eYo.DelegateSvg.Expr.longbytesliteral,
// //   eYo.DelegateSvg.Expr.numberliteral,
// //   eYo.DelegateSvg.Expr.integer,
// //   eYo.DelegateSvg.Expr.floatnumber,
// //   eYo.DelegateSvg.Expr.imagnumber,
// //   eYo.DelegateSvg.Expr.builtin_object,
// //   eYo.DelegateSvg.Expr.any,
// // ]

// goog.require('eYo.DelegateSvg.Expr.longliteral')

// goog.require('eYo.DelegateSvg.Literal')

// /**
//  * Convert the block to a dom element and vice versa.
//  * For edython.
//  */
// eYo.DelegateSvg.Literal.prototype.xml = eYo.Xml.Text

// goog.require('eYo.DelegateSvg.List')

// /**
//  * Convert the block to a dom element.
//  * Called at the end of blockToDom.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId
//  * @return a dom element
//  */
// eYo.DelegateSvg.List.prototype.toDom = function(block, element, optNoId) {
//   var x = eYo.Xml.InputList.toDom(block, element, optNoId)
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
// eYo.DelegateSvg.List.prototype.fromDom = function(block, xml, type) {
//   var out = block
//   for (var i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
//     if (goog.isFunction(xmlChild.getAttribute)) {
//       var name = xmlChild.getAttribute(eYo.Xml.INPUT)
//       if (name) {
//         var input = block.getInput(name)
//         if (input) {
//           var c8n = input.connection
//           if (c8n) {
//             var target = c8n.targetBlock()
//             if (target) {
//               out = out || eYo.Xml.fromDom(target, (target.eyo.wrapped_ && !(target.eyo instanceof eYo.DelegateSvg.List))?
//                 xml: xmlChild)
//               continue
//             } else if (type && (target = eYo.DelegateSvg.newBlockComplete(type, input.sourceBlock_.workspace, true))) {
//               out = out || eYo.Xml.fromDom(target, xmlChild)
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
//  * Default implementation just returns 'eyo:list' when this block is embedded
//  * and the inherited value otherwise.
//  * For edython.
//  * @param {!Blockly.Block} block The owner of the receiver.
//  * @return true if the given value is accepted, false otherwise
//  */
// eYo.DelegateSvg.Expr.target_list.prototype.tagName = function (block) {
//   return eYo.DelegateSvg.List.superClass_.tagName.call(this, block)
// }

// eYo.DelegateSvg.Expr.target_list_list.prototype.XfromDom = function(block, xml) {
//   var out = block
//   for (var i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
//     if (goog.isFunction(xmlChild.getAttribute)) {
//       var name = xmlChild.getAttribute(eYo.Xml.INPUT)
//       if (name) {
//         var input = block.getInput(name)
//         if (input) {
//           var c8n = input.connection
//           if (c8n) {
//             var target = c8n.targetBlock()
//             if (target) {
//               out = out || eYo.Xml.fromDom(target, (target.eyo.wrapped_ && !(target.eyo instanceof eYo.DelegateSvg.List))?
//                 xml: xmlChild)
//               continue
//             } else if ((target = eYo.DelegateSvg.newBlockComplete(input.sourceBlock_.workspace, eYo.T3.Expr.target_list, true))) {
//               c8n.connect(target.outputConnection)
//               out = eYo.Xml.fromDom(target, xmlChild)
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

// goog.provide('eYo.Xml.Operator')
// goog.require('eYo.DelegateSvg.Operator')

// /**
//  * The xml tag name of this block, as it should appear in the saved data.
//  * Default implementation just returns 'expr'
//  * For edython.
//  * @param {!Blockly.Block} block The owner of the receiver.
//  * @return true if the given value is accepted, false otherwise
//  */
// eYo.DelegateSvg.Operator.prototype.tagName = function (block) {
//   var m = XRegExp.exec(block.type, eYo.XRE.solid)
// if (m) {
//   return m.core
// }
//   return block.type
// }

// /**
//  * Records the operator as attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.Xml.Operator.toDom = function (block, element, optNoId) {
//   block.eyo.data.operator.toDomAttribute(element)
//   element.setAttribute(eYo.Xml.VALUE, block.eyo.data.operator.get())
//   eYo.Xml.InputList.toDom(block, element, optNoId)
// }

// /**
//  * Set the operator from the attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.Xml.Operator.fromDom = function (block, element) {
//   block.eyo.data.operator.fromDomAttribute(element)
//   eYo.Xml.InputList.fromDom(block, element)
// }

// eYo.DelegateSvg.Operator.prototype.xml = eYo.Xml.Operator
// eYo.DelegateSvg.Expr.power_s3d.prototype.xml = eYo.Xml.Operator

// goog.require('eYo.DelegateSvg.AugAssign')

// /**
//  * Records the operator as attribute.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.toDom = function (block, element, optNoId) {
//   var variantData = this.data.variant
//   var model = variantData.model
//   var variant = variantData.get()
//   var withTarget = eYo.Do.getVariantFlag(variant, model.TARGET)
//   if (withTarget) {
//     eYo.Xml.Input.Named.toDom(block, eYo.Key.TARGET, element, optNoId, true)
//   } else {
//     var text = this.data.value.get()
//     if (text && text.length) {
//       element.setAttribute(eYo.Key.VALUE, text)
//     }
//   }
//   element.setAttribute(eYo.Key.OPERATOR, this.data.operator.get())
//   eYo.Xml.Input.Named.toDom(block, eYo.Key.EXPRESSIONS, element, optNoId)
// }

// /**
//  * Set the augmented_assignment_stmt from the element.
//  * @param {!Blockly.Block} block
//  * @param {!Element} element dom element to be completed.
//  * @override
//  */
// eYo.DelegateSvg.Stmt.augmented_assignment_stmt.prototype.fromDom = function (block, element) {
//   var variant = 0
//   if (eYo.Xml.Input.Named.fromDom(block, eYo.Key.TARGET, element, true)) {
//     variant = eYo.Do.makeVariantFlags(variant, this.data.variant.model.TARGET)
//   } else {
//     var text = element.getAttribute(eYo.Key.VALUE)
//     if (goog.isDefAndNotNull(text)) {
//       this.data.value.set(text)
//     }
//   }
//   var operator = element.getAttribute(eYo.Key.OPERATOR)
//   var numberOperators = this.data.numberOperator.getAll()
//   var bitwiseOperators = this.data.bitwiseOperator.getAll()
//   if (numberOperators.indexOf(operator) >= 0) {
//     this.data.numberOperator.set(operator)
//   } else if (bitwiseOperators.indexOf(operator) >= 0) {
//     this.data.bitwiseOperator.set(operator)
//     variant = eYo.Do.makeVariantFlags(variant, this.data.variant.model.BITWISE)
//   }
//   eYo.Xml.Input.Named.fromDom(block, eYo.Key.ARGUMENTS, element)
//   this.data.variant.set(variant)
// }

// /**
//  * Convert the block to a dom element.
//  * Called at the end of blockToDom.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId
//  * @return a dom element
//  */
// eYo.DelegateSvg.Expr.attributeref.prototype.toDom = function(block, element, optNoId) {
//   var text = this.data.value.get()
//   if (text && text.length) {
//     element.setAttribute(eYo.Xml.VALUE, text)
//   }
//   return eYo.Xml.Input.Named.toDom(block, eYo.Key.PRIMARY, element, optNoId)
// }

// /**
//  * fromDom.
//  * @param {!Blockly.Block} block to be initialized.
//  * @param {!Element} xml dom element.
//  * For subclassers eventually
//  */
// eYo.DelegateSvg.Expr.attributeref.prototype.fromDom = function (block, element) {
//   var text = element.getAttribute(eYo.Xml.VALUE)
//   if (text) {
//     block.eyo.data.value.set(text) // validation?
//   }
//   return eYo.Xml.Input.Named.fromDom(block, eYo.Key.PRIMARY, element)
// }

// /**
//  * Convert the block to a dom element.
//  * Called at the end of blockToDom.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId
//  * @return a dom element
//  */
// eYo.DelegateSvg.Expr.slicing.prototype.toDom = function(block, element, optNoId) {
//   var variant = this.data.variant.get()
//   if (variant) {
//     eYo.Xml.Input.Named.toDom(block, eYo.Key.PRIMARY, element, optNoId)
//   } else {
//     var text = this.data.value.get()
//     element.setAttribute(eYo.Xml.VALUE, text || '?')
//   }
//   return eYo.Xml.Input.Named.toDom(block, eYo.Key.SLICE, element, optNoId)
// }

// /**
//  * fromDom.
//  * @param {!Blockly.Block} block to be initialized.
//  * @param {!Element} xml dom element.
//  * For subclassers eventually
//  */
// eYo.DelegateSvg.Expr.slicing.prototype.fromDom = function (block, element) {
//   var text = element.getAttribute(eYo.Xml.VALUE)
//   if (text) {
//     this.data.variant.set(0)
//     if (text === '?') {
//       block.eyo.data.value.setTrusted('')
//     } else {
//       block.eyo.data.value.set(text)
//     }
//   } else {
//     this.data.variant.set(1)
//     eYo.Xml.Input.Named.fromDom(block, eYo.Key.PRIMARY, element)
//   }
//   return eYo.Xml.Input.Named.fromDom(block, eYo.Key.SLICE, element)
// }

// goog.require('eYo.DelegateSvg.Term')

// /**
//  * The xml tag name of this block, as it should appear in the saved data.
//  * Default implementation just returns the block type.
//  * For edython.
//  * @param {!Blockly.Block} block The owner of the receiver.
//  * @return true if the given value is accepted, false otherwise
//  */
// eYo.DelegateSvg.Expr.term.prototype.tagNameX = function (block) {
//   return eYo.Xml.TERM
// }

// /**
//  * Convert the block to a dom element.
//  * Called at the end of blockToDom.
//  * For edython.
//  * @param {!Blockly.Block} block The block to be converted.
//  * @param {Element} xml the persistent element.
//  * @param {boolean} optNoId
//  * @return a dom element
//  */
// eYo.DelegateSvg.Expr.term.prototype.toDomX = function(block, element, optNoId) {
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
//     element.setAttribute(eYo.Xml.MODIFIER, modifier)
//   }
//   if (!withoutName) {
//     var text = this.data.value.get()
//     if (text && text.length || modifier === '*') {
//       element.setAttribute(eYo.Xml.VALUE, text || '?')
//     }
//     if (withAnnotation) {
//       eYo.Xml.Input.Named.toDom(block, eYo.Key.ANNOTATION, element, optNoId, true)
//     }
//     if (withDefinition) {
//       eYo.Xml.Input.Named.toDom(block, eYo.Key.DEFINITION, element, optNoId, true)
//     }
//     if (withAlias) {
//       var text = this.data.alias.get()
//       element.setAttribute(eYo.Xml.AS, text || '?')
//     }
//   }
// }

// /**
//  * fromDom.
//  * @param {!Blockly.Block} block to be initialized.
//  * @param {!Element} xml dom element.
//  * For subclassers eventually
//  */
// eYo.DelegateSvg.Expr.term.prototype.fromDomX = function (block, element) {
//   eYo.Xml.Expr.fromDom(block, element)
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
// goog.require('eYo.DelegateSvg.Lambda')

// /**
//  * The xml tag name of this block, as it should appear in the saved data.
//  * Default implementation just returns the block type.
//  * For edython.
//  * @param {!Blockly.Block} block The owner of the receiver.
//  * @return true if the given value is accepted, false otherwise
//  */
// eYo.DelegateSvg.Expr.lambda.prototype.tagName = function (block) {
//   return eYo.Xml.LAMBDA
// }

// eYo.DelegateSvg.Manager.registerDelegate_(eYo.Xml.LAMBDA, eYo.DelegateSvg.Expr.lambda)

// eYo.DelegateSvg.Expr.lambda.prototype.xml = eYo.Xml.InputList

// goog.require('eYo.DelegateSvg.Argument')

// eYo.DelegateSvg.Expr.keyword_item.prototype.xml = eYo.Xml.InputList

// // eYo.T3.Expr.identifier,

// // eYo.T3.Expr.argument_list,
// // eYo.T3.Expr.identifier,
// // eYo.T3.Expr.argument_list_comprehensive,

// goog.provide('eYo.Xml.Comprehension')
// goog.require('eYo.DelegateSvg.Comprehension')

// eYo.DelegateSvg.Expr.comp_for.prototype.xml =
// eYo.DelegateSvg.Expr.comp_if.prototype.xml =
// eYo.DelegateSvg.Expr.comp_iter_list.prototype.xml =
// eYo.DelegateSvg.Expr.key_datum_s3d.prototype.xml =
// eYo.Xml.InputList

// /**
//  * toDom.
//  * @param {!Blockly.Block} block to be translated.
//  * @param {!Element} element dom element to be completed.
//  * @param {boolean} optNoId true if no id is required.
//  * For subclassers eventually
//  */
// eYo.DelegateSvg.Expr.key_datum_s3d.prototype.xml =
// eYo.Xml.InputList

// eYo.DelegateSvg.Expr.comprehension.prototype.xml =
// eYo.DelegateSvg.Expr.generator_expression.prototype.xml =
// eYo.Xml.InputList

// eYo.DelegateSvg.Expr.dict_comprehension.prototype.xml = {}

// /**
//  * toDom.
//  * @param {!Blockly.Block} block to be translated.
//  * @param {!Element} element dom element to be completed.
//  * @param {boolean} optNoId true if no id is required.
//  * For subclassers eventually
//  */
// eYo.DelegateSvg.Expr.dict_comprehension.prototype.xml.toDom = function (block, element, optNoId) {
//   // create a list element
//   eYo.Xml.Input.Named.toDom(block, eYo.Key.KEY, element, optNoId)
//   eYo.Xml.Input.Named.toDom(block, eYo.Key.DATUM, element, optNoId)
//   eYo.Xml.namedListInputToDom(block, eYo.Key.FOR, element, optNoId)
//   eYo.Xml.Input.Named.toDom(block, eYo.Key.IN, element, optNoId)
//   eYo.Xml.namedListInputToDom(block, eYo.Key.COMP_ITER, element, optNoId)
// }

// /**
//  * fromDom.
//  * @param {!Blockly.Block} block to be initialized.
//  * @param {!Element} xml dom element.
//  * For subclassers eventually
//  */
// eYo.DelegateSvg.Expr.dict_comprehension.prototype.xml.fromDom = function (block, xml) {
//   eYo.Xml.Input.Named.fromDom(block, eYo.Key.KEY, xml)
//   eYo.Xml.Input.Named.fromDom(block, eYo.Key.DATUM, xml)
//   eYo.Xml.namedListInputFromDom(block, eYo.Key.FOR, xml)
//   eYo.Xml.Input.Named.fromDom(block, eYo.Key.IN, xml)
//   eYo.Xml.namedListInputFromDom(block, eYo.Key.COMP_ITER, xml)
// }

// goog.require('eYo.DelegateSvg.Assignment')

// eYo.DelegateSvg.Stmt.assignment_stmt.prototype.xml = {}

// /**
//  * toDom.
//  * @param {!Blockly.Block} block to be translated.
//  * @param {!Element} element dom element to be completed.
//  * @param {boolean} optNoId true if no id is required.
//  * @this is the block delegate
//  * For subclassers eventually
//  */
// eYo.DelegateSvg.Stmt.assignment_stmt.prototype.xml.toDom = function (block, element, optNoId) {
//   var variant = this.data.variant.get()
//   if (variant === 2) {
//     eYo.Xml.Input.Named.toDom(block, eYo.Key.TARGET, element, optNoId, true)
//   } else {
//     var text = this.data.value.get()
//     if (text && text.length) {
//       element.setAttribute(eYo.Xml.VALUE, text || '?')
//     }
//     if (variant === 1) {
//       eYo.Xml.Input.Named.toDom(block, eYo.Key.ANNOTATION, element, optNoId, true)
//     }
//   }
//   eYo.Xml.Input.Named.toDom(block, eYo.Key.ASSIGNED, element, optNoId)
// }

// /**
//  * fromDom.
//  * @param {!Blockly.Block} block to be initialized.
//  * @param {!Element} xml dom element.
//  * For subclassers eventually
//  */
// eYo.DelegateSvg.Stmt.assignment_stmt.prototype.xml.fromDom = function (block, element) {
//   if (eYo.Xml.Input.Named.fromDom(block, eYo.Key.TARGET, element, true)) {
//     this.data.variant.set(2)
//   } else {
//     var text = element.getAttribute(eYo.Xml.VALUE)
//     if (goog.isDefAndNotNull(text)) {
//       this.data.value.set(text)
//     }
//     if (eYo.Xml.Input.Named.fromDom(block, eYo.Key.ANNOTATION, element, true)) {
//       this.data.variant.set(1)
//     } else {
//       this.data.variant.set(0)
//     }
//   }
//   eYo.Xml.Input.Named.fromDom(block, eYo.Key.ASSIGNED, element)
// }

// goog.require('eYo.DelegateSvg.Expr')

// eYo.DelegateSvg.Expr.starred_expression.prototype.xml = {}

// /**
//  * toDom.
//  * @param {!Blockly.Block} block to be translated.
//  * @param {!Element} element dom element to be completed.
//  * @param {boolean} optNoId true if no id is required.
//  * @this is the block delegate
//  * For subclassers eventually
//  */
// eYo.DelegateSvg.Expr.starred_expression.prototype.xml.toDom = function (block, element, optNoId) {
//   block.eyo.data.modifier.toDomAttribute(element)
//   eYo.Xml.Input.Named.toDom(block, eYo.Key.EXPRESSION, element, optNoId)
// }

// /**
//  * fromDom.
//  * @param {!Blockly.Block} block to be initialized.
//  * @param {!Element} xml dom element.
//  * For subclassers eventually
//  */
// eYo.DelegateSvg.Expr.starred_expression.prototype.xml.fromDom = function (block, element) {
//   block.eyo.data.modifier.fromDomAttribute(element)
//   eYo.Xml.Input.Named.fromDom(block, eYo.Key.EXPRESSION, element)
// }
