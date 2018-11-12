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

// Next are used to let the compiler know that we need them
goog.require('eYo.DelegateSvg.Random');
goog.require('eYo.DelegateSvg.Math');
goog.require('eYo.DelegateSvg.CMath');
goog.require('eYo.DelegateSvg.Turtle');
goog.require('eYo.DelegateSvg.Decimal');
goog.require('eYo.DelegateSvg.Fraction');
goog.require('eYo.DelegateSvg.Statistics');

eYo.Xml = {
  EXPR: 'x', // tag name
  STMT: 's', // tag name
  SLOT: 'slot', // attribute name
  FLOW: 'flow', // attribute name
  NEXT: 'next', // attribute content
  SUITE: 'suite', // attribute content
  DOTTED_NAME: 'dotted_name', // attribute name
  NAME: 'name', // attribute name
  MODIFIER: 'modifier', // attribute name
  VALUE: 'value', // attribute name
  AS: 'as', // attribute name
  FROM: 'from', // attribute name
  COMMENT: 'comment', // attribute name
  OPERATOR: 'operator', // attribute name

  STATE: 'state', // attribute name
  LOCKED: 'locked', // attribute name
  QUESTION: '?',

  LITERAL: 'literal',
  TERM: 'term',
  COMPARISON: 'comparison',
  PARAMETER: 'parameter',
  LAMBDA: 'lambda',
  CALL: 'call',
  GLOBAL: 'global',
  NONLOCAL: 'nonlocal',

  LIST: 'list', // attribute name
  
  WORKSPACE: 'workspace', // tag name
  CONTENT: 'content', // tag name
  EDYTHON: 'edython', // tag name
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
  dom.setAttribute('xmlns', 'urn:edython:0.2')
  dom.setAttribute('xmlns:eyo', 'urn:edython:0.2')
  var oSerializer = new XMLSerializer()
  return oSerializer.serializeToString(dom)
}

/**
 * Encode a block tree as XML.
 * @param {!Blockly.Workspace} workspace The workspace containing blocks.
 * @param {boolean=} opt_noId True if the encoder should skip the block IDs.
 * @return {!Element} XML document.
 */
eYo.Xml.workspaceToDom = function(workspace, opt_noId) {
  var root = goog.dom.createDom(eYo.Xml.EDYTHON, null,
    goog.dom.createDom(eYo.Xml.WORKSPACE, null,
      goog.dom.createDom(eYo.Xml.CONTENT)
    )
  );
  var xml = root.firstChild.firstChild
  var blocks = workspace.getTopBlocks(true);
  for (var i = 0, block; block = blocks[i]; i++) {
    xml.appendChild(Blockly.Xml.blockToDomWithXY(block, opt_noId));
  }
  root.setAttribute('xmlns', 'urn:edython:0.2')
  root.setAttribute('xmlns:eyo', 'urn:edython:0.2')
  return root;
};

/**
 * Decode an XML DOM and create blocks on the workspace.
 * overriden to support other kind of blocks
 * This is a copy with a tiny formal modification.
 * @param {!Element} xml XML DOM.
 * @param {!*} owner The workspace or the parent block.
 * @return {Array.<string>} An array containing new block IDs.
 */
Blockly.Xml.domToWorkspace = eYo.Xml.domToWorkspace = function (xml, owner) {
  var workspace = owner
  if (xml instanceof Blockly.Workspace) {
    var swap = xml
    xml = workspace
    workspace = swap
    console.warn('Deprecated call to Blockly.Xml.domToWorkspace, ' +
                 'swap the arguments.')
  }
  var workspace = owner.workspace || owner
  var width // Not used in LTR.
  if (workspace.RTL) {
    width = workspace.getWidth()
  }
  if (goog.isString(xml)) {
    var parser = new DOMParser()
    xml = parser.parseFromString(xml, 'application/xml')
  }
  var newBlockIds = [] // A list of block IDs added by this call.
  // Safari 7.1.3 is known to provide node lists with extra references to
  // children beyond the lists' length.  Trust the length, do not use the
  // looping pattern of checking the index for an object.
  
  workspace.eyo.recover.whenRecovered(
    (block) => {
      newBlockIds.push(block.id)   
    }
  )

  // Disable workspace resizes as an optimization.
  if (workspace.setResizesEnabled) {
    workspace.setResizesEnabled(false)
  }

  // This part is a custom part for edython
  var newBlock = function (xmlChild) {
    var block
    if (xmlChild && xmlChild.nodeType === Node.ELEMENT_NODE) {
      if ((block = eYo.Xml.domToBlock(xmlChild, owner))) {
        newBlockIds.push(block.id)
        var x = xmlChild.hasAttribute('x')
          ? parseInt(xmlChild.getAttribute('x'), 10) : 10
        var y = xmlChild.hasAttribute('y')
          ? parseInt(xmlChild.getAttribute('y'), 10) : 10
        if (!isNaN(x) && !isNaN(y)) {
          block.moveBy(x, y)
        } else {
          var c = xmlChild.hasAttribute('c')
            ? parseInt(xmlChild.getAttribute('c'), 10)
            : 10
          var l = xmlChild.hasAttribute('l')
            ? parseInt(xmlChild.getAttribute('l'), 10)
            : 10
          if (!isNaN(c) && !isNaN(l)) {
            block.eyo.moveBy(c, l)
            
          }
        }
      }
    }
    return block
  }
  var variablesFirst = true
  var b
  var children = xml.childNodes
  eYo.Events.setGroup(true)
  try {
    Blockly.Field.startCache()
    for (var i = 0; i < children.length; i++) {
      var child = children[i]
      var name = child.nodeName.toLowerCase()
      if (name === 'block' ||
        (name === 'shadow' && !Blockly.Events.recordUndo)) {
        // Allow top-level shadow blocks if recordUndo is disabled since
        // that means an undo is in progress.  Such a block is expected
        // to be moved to a nested destination in the next operation.
        var block = Blockly.Xml.domToBlock(child, workspace)
        newBlockIds.push(block.id)
        var blockX = child.hasAttribute('x')
          ? parseInt(child.getAttribute('x'), 10) : 10
        var blockY = child.hasAttribute('y')
          ? parseInt(child.getAttribute('y'), 10) : 10
        if (!isNaN(blockX) && !isNaN(blockY)) {
          block.moveBy(workspace.RTL ? width - blockX : blockX, blockY)
        }
        variablesFirst = false
      } else if (name === 'shadow') {
        goog.asserts.fail('Shadow block cannot be a top-level block.')
        variablesFirst = false
      } else if (name === 'variables') {
        if (variablesFirst) {
          Blockly.Xml.domToVariables(child, workspace)
        } else {
          throw Error('\'variables\' tag must exist once before block and ' +
            'shadow tag elements in the workspace XML, but it was found in ' +
            'another location.')
        }
        variablesFirst = false
      } else if (name === eYo.Xml.EDYTHON) {
        var blockNodes = child.childNodes
        var blockCount = blockNodes.length
        var j = 0
        while (j < blockCount) {
          child = blockNodes[j++]
          if (child.tagName && child.tagName.toLowerCase() === eYo.Xml.WORKSPACE) {
            var blockNodes = child.childNodes
            var blockCount = blockNodes.length
            j = 0
            while (j < blockCount) {
              child = blockNodes[j++]
              if (child.tagName && child.tagName.toLowerCase() === eYo.Xml.CONTENT) {
                blockNodes = child.childNodes
                blockCount = blockNodes.length
                j = 0
                while (j < blockCount) {
                  child = blockNodes[j++]
                  if ((b = newBlock(child))) {
                    newBlockIds.push(b.id)
                    b.eyo.beReady()
                  }
                }
                break
              }
            }
            break
          }
        }
      } else if (name === eYo.Xml.STMT || name === eYo.Xml.EXPR) {
        // for edython
        if (b = newBlock(child)) {
          newBlockIds.push(b.id)
          b.eyo.beReady()
        }
      }
    }
  } catch(err) {
    console.error(err)
    throw err
  } finally {
    eYo.Events.setGroup(false)
    Blockly.Field.stopCache()
  }
  // Re-enable workspace resizing.
  if (workspace.setResizesEnabled) {
    workspace.setResizesEnabled(true)
  }
  workspace.eyo.recover.whenRecovered(null)
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
Blockly.Xml.blockToDom = (function () {
  var blockToDom = Blockly.Xml.blockToDom
  return function (block, optNoId) {
    if (block.type.indexOf('eyo:') < 0) {
      // leave the control to the original player
      return blockToDom(block, optNoId)
    } else {
      return eYo.Xml.blockToDom(block, optNoId)
    }
  }
}) ()

/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Element|string} xmlBlock XML block element or string representation of an xml block.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {!Blockly.Block} The root block created.
 */
Blockly.Xml.domToBlock = function (dom, workspace) {
  if (goog.isString(dom)) {
    return workspace.eyo.fromString(dom)
  }
  // Create top-level block.
  Blockly.Events.disable();
  try {
    if (workspace.rendered) {
      var topBlock = Blockly.Xml.domToBlockHeadless_(dom, workspace);
      // Hide connections to speed up assembly.
      // topBlock.setConnectionsHidden(true);
      topBlock.eyo.beReady()
      // Populating the connection database may be deferred until after the
      // blocks have rendered.
      // console.log('setTimeout', topBlock.type, topBlock.id)
      // setTimeout(function() {
      //   if (topBlock.workspace) {  // Check that the block hasn't been deleted.
      //     topBlock.setConnectionsHidden(false);
      //   }
      // }, 1);
      // Allow the scrollbars to resize and move based on the new contents.
      // TODO(@picklesrus): #387. Remove when domToBlock avoids resizing.
      workspace.resizeContents();
    }
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    Blockly.Events.enable();
  }
  if (Blockly.Events.isEnabled()) {
    eYo.Events.fireBlockCreate(topBlock);

  }
  return topBlock;
}

/**
 * Create a new block, with full contents.
 * This is the expected way to create a block 
 * to be displayed immediately.
 * @param {!WorkspaceSvg} workspace
 * @param {!String|Object} prototypeName or xml representation.
 * @param {?string} id
 * @private
 */
eYo.DelegateSvg.newBlockComplete = (function () {
  var newBlockComplete = eYo.DelegateSvg.newBlockComplete
  return function (workspace, model, id) {
    if (goog.isString(model) && model.startsWith('<')) {
      var B = eYo.Xml.stringToBlock(model, workspace)
    }
    if (!B) {
      B = newBlockComplete.call(this, workspace, model, id)
    }
    return B
  }
}) ()

/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Element} xmlBlock XML block element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {!Blockly.Block} The root block created.
 * @private
 */
Blockly.Xml.domToBlockHeadless_ = (function () {
  var domToBlockHeadless = Blockly.Xml.domToBlockHeadless_
  return function (xmlBlock, workspace) {
    var block = null
    if (goog.isFunction(xmlBlock.getAttribute)) {
      var attr = xmlBlock.getAttribute(eYo.Key.EYO)
      if (attr || xmlBlock.namespaceURI.startsWith('urn:edython:')) {
        block = eYo.Xml.domToBlock(xmlBlock, workspace)
      } else if (xmlBlock.tagName.toLowerCase().indexOf('eyo:') < 0) {
        block = domToBlockHeadless(xmlBlock, workspace)
      } else {
        block = eYo.Xml.domToBlock(xmlBlock, workspace)
      }
    }
    return block
  }
}) ()

/**
 * Encode a block subtree as dom.
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
 * @param {boolean} optNoNext True if the encoder should skip the next block.
 * @return {!Element} Tree of XML elements, possibly null.
 */
eYo.Xml.blockToDom = (function () {
  var blockToDom = function (block, optNoId, optNoNext) {
    var eyo = block.eyo
    if (eyo.target_is_wrapped_ && !(eyo instanceof eYo.DelegateSvg.List)) {
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
      var element = controller.blockToDom.call(eyo, block, optNoId, optNoNext)
    } else {
      var tag = block.eyo.tagName()
      element = goog.dom.createDom(block.eyo instanceof eYo.DelegateSvg.Expr? eYo.Xml.EXPR: eYo.Xml.STMT)
      element.setAttribute(eYo.Key.EYO, tag.substring(4))
      !optNoId && element.setAttribute('id', block.id)
      eYo.Xml.toDom(block, element, optNoId, optNoNext)
    }
    // this is for the editor, not python
    if (block.eyo.locked_) {
      element.setAttribute(eYo.Xml.STATE, eYo.Xml.LOCKED)
    }
    return element
  }
  return function (block, optNoId, optNoNext) {
    eYo.Xml.registerAllTags && eYo.Xml.registerAllTags()
    eYo.Xml.blockToDom = blockToDom
    return blockToDom(block, optNoId, optNoNext)
  }
}())

goog.exportSymbol('eYo.Xml.blockToDom', eYo.Xml.blockToDom)

goog.require('eYo.DelegateSvg.Expr')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * For edython.
 * @return true if the given value is accepted, false otherwise
 */
eYo.Delegate.prototype.tagName = function () {
  var tag = this.constructor.eyo.tagName || (this instanceof eYo.DelegateSvg.Expr ? eYo.T3.Xml.toDom.Expr : eYo.T3.Xml.toDom.Stmt)[this.constructor.eyo.key]
  return (tag && 'eyo:' + tag) || this.block_.type || ('eyo:' + eYo.Key.PLACEHOLDER)
}

goog.require('eYo.DelegateSvg.Group')

goog.require('eYo.DelegateSvg.List')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns the block type.
 * For edython.
 * @return true if the given value is accepted, false otherwise
 */
eYo.DelegateSvg.List.prototype.tagName = function () {
  return this.block_.eyo.wrapped_ ? 'eyo:' + eYo.Xml.LIST : eYo.DelegateSvg.List.superClass_.tagName.call(this)
}

goog.provide('eYo.Xml.Text')

/**
 * Convert the block's value to a text dom element.
 * For edython.
 * @param {!Blockly.Block} block The block to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element
 */
eYo.Xml.Text.toDom = function (block, element) {
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
  return eYo.Do.someChild(element, function (child) {
    return child.nodeType === Node.TEXT_NODE && block.eyo.data.value.set(child.nodeValue)
  })
}

goog.require('eYo.DelegateSvg.Literal')

goog.provide('eYo.Xml.Literal')
/**
 * Try to create a Literal block from the given element.
 * @param {!Element} element dom element to be completed.
 * @param {!*} owner  The workspace or the parent block.
 * @override
 */
eYo.Xml.Literal.domToBlockComplete = (function () {
  var newBlock = function (workspace, text, id, stmt_expected) {
    if (text && text.length) {
      var type = eYo.Do.typeOfString(text, null).expr
      switch (type) {
      case eYo.T3.Expr.integer:
      case eYo.T3.Expr.floatnumber:
      case eYo.T3.Expr.imagnumber:
        return eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.numberliteral, id)
      case eYo.T3.Expr.shortliteral:
      case eYo.T3.Expr.shortstringliteral:
      case eYo.T3.Expr.shortbytesliteral:
        return eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.shortliteral, id)
      case eYo.T3.Expr.longliteral:
      case eYo.T3.Expr.longstringliteral:
        return eYo.DelegateSvg.newBlockComplete(workspace, stmt_expected
          ? eYo.T3.Stmt.docstring_stmt
          : eYo.T3.Expr.longliteral, id)
      case eYo.T3.Expr.longbytesliteral:
        return eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.longliteral, id)
      }
    }
  }
  return function (element, owner) {
    if (element.getAttribute(eYo.Key.EYO) !== eYo.Xml.LITERAL) {
      return
    }
    var workspace = owner.workspace || owner
    // is it a statement or an expression ?
    var stmt_expected = element.tagName.toLowerCase() === eYo.Xml.STMT
    var id = element.getAttribute('id')
    var block
    eYo.Do.someChild(element, function (child) {
      if (child.nodeType === Node.TEXT_NODE) {
        return block = newBlock(workspace, child.nodeValue, id, stmt_expected)
      }
    })
    if (!block) {
      // there was no text node to infer the type
      block = newBlock(workspace, element.getAttribute(eYo.Key.PLACEHOLDER), id, stmt_expected)
    }
    return block || eYo.DelegateSvg.newBlockComplete(workspace, eYo.T3.Expr.shortliteral, id)
  }
}) ()

goog.provide('eYo.Xml.Data')

/**
 * Save the block's data.
 * For edython.
 * @param {Element} element the persistent element.
 */
eYo.Delegate.prototype.saveData = function (element) {
  this.foreachData(function () {
    this.save(element)
  })
}

/**
 * Save the block's slots.
 * For edython.
 * @param {Element} element the persistent element.
 * @param {?Boolean} opt_noId
 */
eYo.Delegate.prototype.saveSlots = function (element, opt_noId) {
  this.foreachSlot(function () {
    this.save(element, opt_noId)
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
  var eyo = block.eyo
  eyo.changeWrap(
    function () { // `this` is `eyo`
      this.foreachData(function () {
        this.load(element)
        // Consistency section, to be removed
        var xml = this.model.xml
        if (hasText && xml && xml.text) {
          console.log(eYo.Do.format('Only one text node {0}/{1}',
            this.key, block.type))
        }
        hasText = hasText || (xml && xml.text)
      })
      var xml = this.model.xml
      if (xml && goog.isFunction(xml.didLoad)) {
        xml.didLoad.call(this, element)
      }
    }
  )
}

/**
 * Encode a block subtree as dom.
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
 * @param {boolean} optNoNext True if the encoder should skip the next block.
 * @return {!Element} Tree of XML elements, possibly null.
 */
eYo.Xml.toDom = function (block, element, optNoId, optNoNext) {
  var eyo = block.eyo
  var controller = eyo
  if ((controller && goog.isFunction(controller.toDom)) ||
    ((controller = eyo.xml) && goog.isFunction(controller.toDom)) ||
    ((controller = eyo.constructor.xml) && goog.isFunction(controller.toDom)) ||
    ((controller = eyo.constructor) && goog.isFunction(controller.toDom))) {
    return controller.toDom.call(eyo, block, element, optNoId, optNoNext)
  } else {
    block.eyo.saveData(element)
    block.eyo.saveSlots(element, optNoId)
    var blockToDom = function (c8n, name, key) {
      if (c8n && !c8n.eyo.wrapped_) {
        // wrapped blocks belong to slots, they are managed from there
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
    // the list blocks have no slots yet
    for (var i = 0, input; (input = block.inputList[i++]);) {
      if (!input.eyo.slot && input !== eyo.inputSuite) {
        blockToDom(input.connection, eYo.Xml.SLOT, input.name)
      }
    }
    // the suite and the flow
    blockToDom(eyo.suiteConnection, eYo.Xml.FLOW, eYo.Xml.SUITE)
    !optNoNext && blockToDom(eyo.nextConnection, eYo.Xml.FLOW, eYo.Xml.NEXT)
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
      if (!eYo.Do.hasOwnProperty(where, key)) {
        continue
      }
      var type = where[key]
      if (!type.startsWith || type.startsWith('.')) {
        continue
      }
      var c9r = eYo.Delegate.Manager.get(type)
      var one_tag = function (tag) {
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
        if (c9r) {
          // if (!tag.startsWith('eyo:')) {
          //   console.warn('DOUBLE eYo')
          // }
          // console.warn('Register:', c9r.eyo.key, tag, eYo.T3.Xml.toDom[mode][key], key)
          c9r.eyo.tagName = eYo.T3.Xml.toDom[mode][key] || tag || key // ERROR ? Dynamic tag name ?
        }
      }
      var model = eYo.Delegate.Manager.getModel(type)
      var tags = model && model.xml && model.xml.tags
      if (tags) {
        for (var i = 0; i < tags.length; i++) {
          var tag = tags[i]
          one_tag(tags[i])
        }
      } else {
        var xml = model && model.xml
        if (xml && xml.tags) {
          var i = xml.tags.length
          if (i--) {
            do {
              one_tag(xml.tags[i])
            } while (i--)
            continue
          }
        }
        var tag = xml && xml.tag
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
        one_tag(tag)
      }
    }
  }
  register('Expr')
  register('Stmt')
  delete eYo.Xml.registerAllTags
}

/**
 * Decode a string and create a block (and possibly sub blocks)
 * on the workspace.
 * If the string is not valid xml, then nothing is returned.
 *
 * @param {!String} string a serialized dom element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {?Blockly.Block} The root block created, if any.
 */
eYo.Xml.stringToBlock = function (string, workspace) {
  var block
  try {
    var dom = eYo.Do.stringToDom(string)
    if (dom) {
      block = eYo.Xml.domToBlock(dom.documentElement, workspace)
    }
  } catch (err) {
    console.error(err)
    throw err
  }
  return block
}

goog.provide('eYo.Xml.Recover')

/**
 * Recover nodes from a possibly corrupted xml data.
 */
eYo.Xml.Recover = function (workspace) {
  this.workspace = workspace
  this.recovered = []
  this.to_resit = []
  this.to_resit_stack = []
}

/**
 * Will execute the given action for each recovered block.
 * @param {?Function} f
 */
eYo.Xml.Recover.prototype.whenRecovered = function (f) {
  this.recovered_f = f
}

/**
 * Don't resit the given dom.
 *
 * @param {!Element} dom XML dom element.
 * @param {!Blockly.Workspace} workspace  The workspace.
 */
eYo.Xml.Recover.prototype.dontResit = function (dom) {
  var i = this.to_resit.indexOf(dom)
  if (i >= 0) {
    this.to_resit.splice(i, 1)
  }
}

/**
 * Create blocks with elements that were not used during the normal flow.
 * Uses `domToBlock`.
 * @param {!*} dom 
 * @param {!*} try_f  Use the 
 * @param {?*} finally_f 
 * @param {?*} recovered_f 
 */
eYo.Xml.Recover.prototype.resitWrap = function (dom, try_f, finally_f) {
  this.dontResit(dom)
  this.to_resit_stack.push(this.to_resit)
  this.to_resit = []
  eYo.Do.forEachElementChild.call(this, dom, child => {
    this.to_resit.push(child)
  })
  var ans
  try {
    ans = try_f()
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    try {
      finally_f && (ans = finally_f(ans))
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      this.recovered.length = 0
      var dom
      while ((dom = this.to_resit.shift())) {
        var b = eYo.Xml.domToBlock(dom, this.workspace, this)
        if (b) {
          b.eyo.beReady()
          this.recovered.push(b)
        }
      }
      try {
        this.recovered_f && this.recovered.forEach(this.recovered_f)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        this.recovered.length = 0
        this.to_resit = this.to_resit_stack.pop()
        return ans
      }
    }
  }
}

/**
 * The `domToBlock` could not return a block.
 * We must do something to recover errors.
 * The idea is to replace the faulty xml part by a block
 * and parse the children separately with `recoverDom`
 *
 * @param {!Element} dom XML dom element.
 * @param {*} owner either the workspace or a block.
 * @return {!Blockly.Block} The root block created.
 */
eYo.Xml.Recover.prototype.domToBlock = function (dom, owner) {
  var workspace = owner.workspace
  if (!workspace) {
    workspace = owner
    owner = undefined
  }
  if (!workspace.newBlock) {
    console.error('ARGH')
  }
  // First create a block that we will return to replace the expected one
  // This is a block of the same kind (expression/statement)
  // but at least with a generic type such that any connection will fit.
  var tag = dom.tagName
  var ans, fallback, where
  if (tag === eYo.Xml.EXPR) {
    fallback = eYo.T3.Expr.expression_any
    where = eYo.T3.Expr
  } else if (tag === eYo.Xml.STMT) {
    fallback = eYo.T3.Stmt.expression_stmt
    where = eYo.T3.Stmt
  }
  // amongst all the `where` blocks,
  // if there is an only one that can initialize with all
  // the attributes of the dom element
  // first get all the attributes
  var attributeNames = []
  Array.prototype.forEach.call(
    dom.attributes,
    function (attribute) {
      attributeNames.push(attribute.nodeName)
    }
  )
  var best = {
    match: -Infinity,
    types: []
  }
  where.Available.forEach(function(type) {
    var data = eYo.Do.getModel(type).data
    var match = 0
    attributeNames.forEach(function (name) {
      if (data[name]) {
        ++match
      }
    })
    if (match > best.match) {
      best.match = match
      best.types = [type]
    } else if (match == best.match) {
      best.types.push[type]
    }
  })
  eYo.Events.disableWrap.call(this,
    function () {
      if (best.types.length === 1) {
        fallback = best.types[0]
      } else if (owner && (best.types.length > 1)) {
        var name = dom.getAttribute(eYo.Xml.SLOT)
        var input = owner.eyo.getInput(name)
        var slot_c8n = input && input.connection
        var flow = dom.getAttribute(eYo.Xml.FLOW)
        var flow_c8n = flow
          ? owner.eyo.suiteConnection
          : owner.nextConnection
        // return the first block that would connect to the owner
        if (!best.types.some(type => {
            var b = eYo.DelegateSvg.newBlockComplete(workspace, type)
            var c8n = ans && ans.outputConnection
            if (slot_c8n && c8n && slot_c8n.checkType_(c8n)) {
              ans = b
              return true
            }
            c8n = b.previousConnection
            if (flow_c8n && c8n && flow_c8n.checkType_(c8n)) {
              ans = b
              return true
            }
          })) {
          fallback = best.types[0]
        }
      }
      ans || (ans = eYo.DelegateSvg.newBlockComplete(workspace, fallback))
    }
  )
  if (ans) {
    ans.eyo.errorRecover = true
    eYo.Events.fireBlockCreate(ans)
    eYo.Xml.fromDom(ans, dom, this)
  }
  return ans
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
 * @param {*} owner The workspace or the owning block.
 * @return {!Blockly.Block} The root block created.
 */
eYo.Xml.domToBlock = (function () {
  var domToBlock = function (dom, owner) {
    if (!goog.isFunction(dom.getAttribute)) {
      return undefined
    }
    // var isStmt = xmlBlock.tagName.toLowerCase() === eYo.XML.STMT
    var id = dom.getAttribute('id')
    var name = dom.getAttribute(eYo.Key.EYO)
    var prototypeName
    //
    var workspace = owner.workspace || owner
    return workspace.eyo.recover.resitWrap(
      dom,
      () => {
        var block
        // is it a literal or something else special ?
        if ((block = eYo.Xml.Literal.domToBlockComplete(dom, owner)) ||
        (block = eYo.Xml.Comparison.domToBlockComplete(dom, owner)) ||
        (block = eYo.Xml.Group.domToBlockComplete(dom, owner)) ||
        (block = eYo.Xml.Call.domToBlockComplete(dom, owner))) {
          eYo.Xml.fromDom(block, dom)
          return block
        }
        // is there a simple correspondance with a known type
        if ((prototypeName = eYo.T3.Xml.fromDom[name])) {
          if (goog.isArray(prototypeName)) {
            if (prototypeName.length === 1) {
              prototypeName = prototypeName[0]
            } else if (!(prototypeName = (function () {
                var where = dom.tagName.toLowerCase() === eYo.Xml.EXPR ? eYo.T3.Expr : eYo.T3.Stmt
                for (var i = 0; i < prototypeName.length; i++) {
                  var candidate = prototypeName[i]
                  var C8r = eYo.DelegateSvg.Manager.get(candidate)
                  if (C8r && where[C8r.eyo.key]) {
                    return candidate
                  }
                }
              } ()))) {
              // no prototype found, bail out.
              return recover.domToBlock(dom, owner)
            }
          }
          block = eYo.DelegateSvg.newBlockComplete(workspace, prototypeName, id)
        } else {
          if (!name) {
            name = dom.tagName.toLowerCase() === 's' ? 'expression_stmt': 'any_expression'
          }
          prototypeName = 'eyo:'+name
          var solid = prototypeName + ''
          var controller = eYo.DelegateSvg.Manager.get(solid)
          if (controller) {
            if (controller.eyo && goog.isFunction(controller.eyo.domToBlock)) {
              return controller.eyo.domToBlock(dom, workspace, id)
            } else if (goog.isFunction(controller.domToBlock)) {
              return controller.domToBlock(dom, workspace, id)
            }
            block = eYo.DelegateSvg.newBlockComplete(workspace, solid, id)
          } else if ((controller = eYo.DelegateSvg.Manager.get(prototypeName))) {
            if (controller.eyo && goog.isFunction(controller.eyo.domToBlock)) {
              return controller.eyo.domToBlock(dom, workspace, id)
            } else if (goog.isFunction(controller.domToBlock)) {
              return controller.domToBlock(dom, workspace, id)
            }
            block = eYo.DelegateSvg.newBlockComplete(workspace, prototypeName, id)
          }
          // Now create the block, either solid or not
        }
        if (block) {
          eYo.Xml.fromDom(block, dom)
          return block
        }
        // block recovery
        return recover.domToBlock(dom, owner)
      }
    )
  }
  return function (dom, owner) {
    eYo.Xml.registerAllTags && eYo.Xml.registerAllTags()
    eYo.Xml.domToBlock = domToBlock
    return domToBlock(dom, owner)
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
  console.log('eYo.Xml.fromDom', element)
  var eyo = block.eyo
  // headless please
  var do_it = function () { // `this` is `eyo`
  //    console.log('Block created from dom:', xmlBlock, block.type, block.id)
  // then fill it based on the xml data
    var controller = eyo
    if (!eyo.controller_fromDom_locked && (controller &&
        goog.isFunction(controller.fromDom)) ||
        ((controller = eyo.xml) &&
        goog.isFunction(controller.fromDom)) ||
        ((controller = eYo.DelegateSvg.Manager.get(block.type)) &&
        (controller = controller.xml) &&
        goog.isFunction(controller.fromDom)) ||
        ((controller = eYo.DelegateSvg.Manager.get(block.type)) &&
        goog.isFunction(controller.fromDom))) {
      try {
        eyo.controller_fromDom_locked = true
        return controller.fromDom.call(eyo, block, element)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        delete eyo.controller_fromDom_locked
      }
    } else {
      eYo.Xml.Data.fromDom(block, element)
      // read slot
      eyo.foreachSlot(function () {
        this.load(element)
      })
      if (eyo instanceof eYo.DelegateSvg.List) {
        eYo.Do.forEachElementChild(element, function (child) {
          var name = child.getAttribute(eYo.Xml.SLOT)
          var input = eyo.getInput(name)
          if (input && input.connection) {
            var target = input.connection.targetBlock()
            if (target) {
              block.workspace.eyo.recover.dontResit(child)
              eYo.Xml.fromDom(target, child)
            } else if ((target = eYo.Xml.domToBlock(child, block))) {
              block.workspace.eyo.recover.dontResit(child)
              var targetC8n = target.outputConnection
              if (targetC8n && targetC8n.checkType_(input.connection)) {
                targetC8n.connect(input.connection)
              }
            }
          } else if (input) {
            console.error('Missing connection')
          }
        })
        eyo.didLoad()
        eyo.incrementChangeCount() // force new type
        eyo.consolidateType()
        eyo.consolidateConnections()
        eyo.consolidate()
      } else {
        eyo.didLoad()
        // eyo.incrementChangeCount() // force new type
        // eyo.consolidateType()
        // eyo.consolidateConnections()
        // eyo.consolidate()
      }
      // read flow and suite
      var statement = function (c8n, key) {
        if (c8n) {
          return eYo.Do.someElementChild(element, function (child) {
            if ((child.getAttribute(eYo.Xml.FLOW) === key)) {
              block.workspace.eyo.recover.dontResit(child)
              var target = eYo.Xml.domToBlock(child, block)
              if (target) { // still headless!
                // we could create a block from that child element
                // then connect it to
                if (target.previousConnection && c8n.checkType_(target.previousConnection)) {
                  c8n.connect(target.previousConnection)
                }
                return true
              }
            }
          })
        }
      }
      var out = statement(eyo.nextConnection, eYo.Xml.NEXT)
      out = statement(eyo.suiteConnection, eYo.Xml.SUITE) || out
      return out
    }
    var state = dom.getAttribute(eYo.Xml.STATE)
    if (state && state.toLowerCase() === eYo.Xml.LOCKED) {
      eyo.lock()
    }
  }
  eyo.changeWrap(do_it)
}

goog.require('eYo.DelegateSvg.Primary')

/**
 * Set the option from the `eyo` attribute.
 * The block argument is expected
 * @param {!Blockly.Block} block
 * @param {!Element} element dom element to be processed.
 * @override
 */
eYo.DelegateSvg.Expr.primary.prototype.fromDom = function (block, element) {
  // trick to call this function without the first argument
  // just like all other delegate methods
  // please deprecate this
  if (block !== this.block_) {
    element = block
    block = this.block_
  }
  eYo.Xml.fromDom(block, element)
  var type = element.getAttribute(eYo.Key.EYO)
  var d = this.data.variant
  if (type === eYo.Key.CALL) {
    d.set(d.CALL_EXPR)
  } else if (type === eYo.T3.Expr.call_expr.substring(4)) {
    d.set(d.CALL_EXPR)
  } else if (type === eYo.T3.Expr.slicing.substring(4)) {
    d.set(d.SLICING)
  } else if (type === eYo.T3.Expr.identifier_as.substring(4)) {
    d.set(d.ALIASED)
  } else if (type === eYo.T3.Expr.dotted_name_as.substring(4)) {
    d.set(d.ALIASED)
  } else {
    if (this.data.alias.isRequiredFromModel()) {
      d.set(d.ALIASED)
      this.data.annotation.set(d.NONE)
      this.data.definition.set(d.NONE)
    }
  }
  return block
}

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * For edython.
 * @return true if the given value is accepted, false otherwise
 */
eYo.DelegateSvg.Expr.primary.prototype.tagName = function () {
  var type = this.block_.type
  if ([
    eYo.T3.Expr.parent_module,
    eYo.T3.Expr.identifier_defined,
    eYo.T3.Expr.dotted_name,
    eYo.T3.Expr.dotted_name_as,
    eYo.T3.Expr.attributeref
  ].indexOf(type) >= 0) {
    return eYo.T3.Expr.primary
  }
  if (type === eYo.T3.Expr.call_expr) {
    return 'eyo:' + eYo.Key.CALL
  }
  if (type === eYo.T3.Expr.named_call_expr) {
    return 'eyo:' + eYo.Key.CALL
  }
  if (type === eYo.T3.Expr.named_slicing) {
    return eYo.T3.Expr.slicing
  }
  if (type === eYo.T3.Expr.named_subscription) {
    return eYo.T3.Expr.subscription
  }
  if ([
    eYo.T3.Expr.identifier_as,
    eYo.T3.Expr.identifier_annotated,
    eYo.T3.Expr.identifier_annotated_defined,
    eYo.T3.Expr.identifier_defined
  ].indexOf(type) >= 0) {
    return eYo.T3.Expr.identifier
  }
  return type
}


goog.provide('eYo.Xml.Starred')
goog.require('eYo.DelegateSvg.Starred')


goog.provide('eYo.Xml.Comparison')
goog.require('eYo.DelegateSvg.Operator')

/**
 * Try to create a comparison block from the given element.
 * @param {!Element} element dom element to be completed.
 * @param {!*} owner  The workspace or the parent block.
 * @override
 */
eYo.Xml.Comparison.domToBlockComplete = function (element, owner) {
  var block
  var prototypeName = element.getAttribute(eYo.Key.EYO)
  var id = element.getAttribute('id')
  if (prototypeName === eYo.Xml.COMPARISON) {
    var workspace = owner.workspace || owner
    var op = element.getAttribute(eYo.Xml.OPERATOR)
    var C8r, model
    var type = eYo.T3.Expr.number_comparison
    if ((C8r = eYo.DelegateSvg.Manager.get(type))
      && (model = C8r.eyo.model.data)
      && (model = model.operator)
      && model.all
      && model.all.indexOf(op) >= 0) {
      block = eYo.DelegateSvg.newBlockComplete(workspace, type, id)
    } else if ((type = eYo.T3.Expr.object_comparison)
      && (C8r = eYo.DelegateSvg.Manager.get(type))
      && (model = C8r.eyo.model.data)
      && (model = model.operator)
      && model.all
      && model.all.indexOf(op) >= 0) {
      block = eYo.DelegateSvg.newBlockComplete(workspace, type, id)
    } else {
      return block
    }
    return block
  }
}

goog.require('eYo.DelegateSvg.Group')
goog.provide('eYo.Xml.Group')

/**
 * Reads the given element into a block.
 * @param {!Element} element dom element to be completed.
 * @param {!*} owner  The workspace or the parent block.
 * @override
 */
eYo.Xml.Group.domToBlockComplete = function (element, workspace) {
  var name = element.getAttribute(eYo.Key.EYO)
  if (name === eYo.DelegateSvg.Stmt.else_part.prototype.tagName().substring(4)) {
    var workspace = owner.workspace || owner
    var type = eYo.T3.Stmt.else_part
    var id = element.getAttribute('id')
    var block = eYo.DelegateSvg.newBlockComplete(workspace, type, id)
    return block
  }
}

goog.provide('eYo.Xml.Call')

console.warn('convert print statement to print expression and conversely, top blocks only')
/**
 * Reads the given element into a block.
 * call blocks have eyo:call and tag eyo:builtin__call names
 * if there is an eyo:input attribute, even a ''
 * then it is an expression block otherwise it is a statement block. DEPRECATED.
 * @param {!Element} element dom element to be completed.
 * @param {!*} owner  The workspace or the parent block
 * @override
 */
eYo.Xml.Call.domToBlockComplete = function (element, owner) {
  if (element.getAttribute(eYo.Key.EYO) === eYo.Xml.CALL) {
    var workspace = owner.workspace || owner
    var type = element.tagName.toLowerCase() === eYo.Xml.EXPR? eYo.T3.Expr.call_expr: eYo.T3.Stmt.call_stmt
    var id = element.getAttribute('id')
    var block = eYo.DelegateSvg.newBlockComplete(workspace, type, id)
    if (block) {
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
  var xmlL = goog.dom.xml.serialize(eYo.Xml.blockToDom(lhs, true))
  var xmlR = goog.dom.xml.serialize(eYo.Xml.blockToDom(rhs, true))
  return xmlL < xmlR ? -1 : (xmlL < xmlR ? 1 : 0)
}
