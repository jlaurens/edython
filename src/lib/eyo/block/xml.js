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
 * 1) dlgtToDom, to convert a given block into an xml tree.
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
goog.require('eYo.XRE')
goog.require('eYo.T3')

goog.require('Blockly.Xml')
goog.require('goog.dom');

// Next are used to let the compiler know that we need them
goog.require('eYo.DelegateSvg.Functions');
goog.require('eYo.DelegateSvg.Stdtypes');
goog.require('eYo.DelegateSvg.Random');
goog.require('eYo.DelegateSvg.Math');
goog.require('eYo.DelegateSvg.CMath');
goog.require('eYo.DelegateSvg.Turtle');
goog.require('eYo.DelegateSvg.Decimal');
goog.require('eYo.DelegateSvg.Fractions');
goog.require('eYo.DelegateSvg.Statistics');
goog.require('eYo.DelegateSvg.Range')

eYo.Xml = {
  URN: 'urn:edython:',
  XMLNS: 'urn:edython:0.2',
  PYTHON: 'python',
  EXPR: 'x', // tag name
  STMT: 's', // tag name
  SLOT: 'slot', // attribute name
  FLOW: 'flow', // attribute name
  NEXT: 'next', // attribute content
  SUITE: 'suite', // attribute content
  RIGHT: 'right', // attribute content
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

  LIST: 'list', // attribute name
  
  WORKSPACE: 'workspace', // tag name
  CONTENT: 'content', // tag name
  EDYTHON: 'edython', // tag name
}

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 * Overriden to add the `eyo` namespace.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Value representation.
 */
Blockly.Xml.domToText = function (dom) {
  dom.setAttribute('xmlns', eYo.Xml.XMLNS)
  dom.setAttribute('xmlns:eyo', eYo.Xml.XMLNS)
  var oSerializer = new XMLSerializer()
  return oSerializer.serializeToString(dom)
}


/**
 * Encode a block subtree as XML with XY coordinates. Eliminates the use of the Blockly's eponym method.
 * @param {!eYo.Dlgt} dlgt The root Dlgt to encode.
 * @param {?Object} opt  See the eponym parameter in `eYo.Xml.dlgtToDom`.
 * @return {!Element} Tree of XML elements.
 */
eYo.Xml.dlgtToDomWithXY = function(dlgt, opt) {
  var element = eYo.Xml.dlgtToDom(dlgt, opt)
  var xy = dlgt.ui.xyInSurface
  element.setAttribute('x', Math.round(xy.x))
  element.setAttribute('y', Math.round(xy.y))
  return element
};

/**
 * Encode a block tree as XML.
 * @param {!Blockly.Workspace} workspace The workspace containing blocks.
 * @param {?Object} opt  See eponym parameter in `eYo.Xml.dlgtToDom`.
 * @return {!Element} XML document.
 */
eYo.Xml.workspaceToDom = function(workspace, opt) {
  var root = goog.dom.createDom(eYo.Xml.EDYTHON, null,
    goog.dom.createDom(eYo.Xml.WORKSPACE, null,
      goog.dom.createDom(eYo.Xml.CONTENT)
    )
  )
  var xml = root.firstChild.firstChild
  workspace.getTopBlocks(true).forEach(block => {
    var dlgt = block.eyo
    var dom = eYo.Xml.dlgtToDomWithXY(dlgt, opt)
    var p = new eYo.Py.Exporter()
    eYo.Do.tryFinally(() => {
      if (!dlgt.isControl) {
        var code = p.export(block, {is_deep: true})
        if (code.length) {
          var py_dom = goog.dom.createDom(eYo.Xml.PYTHON)
          goog.dom.insertChildAt(dom, py_dom, 0)
          goog.dom.appendChild(py_dom, goog.dom.createTextNode(`\n${code}\n`))
        }
      }
    }, () => {
      goog.dom.appendChild(xml, dom)
    })
  })
  root.setAttribute('xmlns', eYo.Xml.XMLNS) // default namespace
  root.setAttribute('xmlns:eyo', eYo.Xml.XMLNS) // global namespace declaration
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
    block => newBlockIds.push(block.id)
  )

  // Disable workspace resizes as an optimization.
  if (workspace.setResizesEnabled) {
    workspace.setResizesEnabled(false)
  }

  // This part is a custom part for edython
  var newBlock = (xmlChild) => {
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
    // Re-enable workspace resizing.
    if (workspace.setResizesEnabled) {
      workspace.setResizesEnabled(true)
    }
    workspace.eyo.recover.whenRecovered(null)
  }
  return newBlockIds
}

goog.exportSymbol('eYo.Xml.domToWorkspace', eYo.Xml.domToWorkspace)

/**
 * Encode a block subtree as XML.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {boolean} optNoId True if the encoder should skip the block id.
 * @return {!Element} Tree of XML elements, possibly null.
 */
Blockly.Xml.blockToDom = function (block, optNoId) {
  return eYo.Xml.dlgtToDom(block.eyo, {noId: optNoId})
}

/**
 * Encode a block subtree as XML with XY coordinates.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {boolean=} optNoId True if the encoder should skip the block ID.
 * @return {!Element} Tree of XML elements.
 */
Blockly.Xml.blockToDomWithXY = function(block, optNoId) {
  return eYo.Xml.dlgtToDomWithXY(block.eyo, {noId: optNoId})
}

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
  if (workspace.rendered) {
    var topBlock
    eYo.Events.disableWrap(() => {
      topBlock = Blockly.Xml.domToBlockHeadless_(dom, workspace);
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
    })
  }
  topBlock && eYo.Events.fireBlockCreate(topBlock)
  return topBlock
}

/**
 * Create a new block, with full contents.
 * This is the expected way to create a block 
 * to be displayed immediately.
 * @param {!WorkspaceSvg} workspace
 * @param {!String|Object} model prototypeName or xml representation.
 * @param {?string} id
 * @private
 */
eYo.DelegateSvg.newComplete = (() => {
  var newComplete = eYo.DelegateSvg.newComplete
  return function (owner, model, id) {
    if (goog.isString(model)) {
      model = model.trim()
      if (model.startsWith('<')) {
        var B = eYo.Xml.stringToBlock(model, owner)
      }
    } else if (model.getAttribute) {
      B = eYo.Xml.domToBlock(model, owner)
    }
    return (B && B.eyo) || newComplete.call(this, owner, model, id)
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
Blockly.Xml.domToBlockHeadless_ = (() => {
  var domToBlockHeadless = Blockly.Xml.domToBlockHeadless_
  return function (xmlBlock, workspace) {
    var block = null
    if (goog.isFunction(xmlBlock.getAttribute)) {
      var attr = xmlBlock.getAttribute(eYo.Key.EYO)
      if (attr || xmlBlock.namespaceURI.startsWith(eYo.Xml.URN)) {
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
 * which implements a dlgtToDom function, if any.
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
 * @param {?Object} opt  Options `noId` is True if the encoder should skip the block id, `noNext` is True if the encoder should skip the next block.
 * @return {!Element} Tree of XML elements, possibly null.
 */
eYo.Xml.dlgtToDom = (() => {
  var dlgtToDom = function (block, opt) {
    var eyo = block.eyo
    if (eyo.target_is_wrapped_ && !(eyo instanceof eYo.DelegateSvg.List)) {
      // a wrapped block does not create a new element on its own
      // it only can populate an already existing xml node.
      // Except for list nodes.
      return
    }
    var controller = eyo
    if ((controller &&
      goog.isFunction(controller.dlgtToDom)) ||
      ((controller = eyo.xml) &&
      goog.isFunction(controller.dlgtToDom)) ||
      ((controller = eyo.constructor) &&
      (controller = controller.xml) &&
      goog.isFunction(controller.dlgtToDom)) ||
      ((controller = eyo.constructor) &&
      goog.isFunction(controller.dlgtToDom))) {
      var element = controller.dlgtToDom(eyo, opt)
    } else {
      var attr = eyo.xmlAttr()
      element = goog.dom.createDom(eyo instanceof eYo.DelegateSvg.Expr? eYo.Xml.EXPR: eYo.Xml.STMT)
      element.setAttribute(eYo.Key.EYO, attr)
      !(opt && opt.noId) && element.setAttribute('id', block.id)
      eYo.Xml.toDom(eyo, element, opt)
    }
    // this is for the editor, not python
    if (eyo.locked_) {
      element.setAttribute(eYo.Xml.STATE, eYo.Xml.LOCKED)
    }
    return element
  }
  return function (block, opt) {
    eYo.Xml.registerAllTags && eYo.Xml.registerAllTags()
    eYo.Xml.dlgtToDom = dlgtToDom
    return dlgtToDom(block, opt)
  }
}) ()

goog.exportSymbol('eYo.Xml.dlgtToDom', eYo.Xml.dlgtToDom)

goog.require('eYo.DelegateSvg.Expr')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * For edython.
 * @return attr name
 */
eYo.Delegate.prototype.xmlAttr = function () {
  var attr = this.constructor.eyo.xmlAttr || (this instanceof eYo.DelegateSvg.Expr ? eYo.T3.Xml.toDom.Expr : eYo.T3.Xml.toDom.Stmt)[this.constructor.eyo.key]
  return attr || (this.type && this.type.substring(4)) || eYo.Key.PLACEHOLDER
}

goog.require('eYo.DelegateSvg.Group')

goog.require('eYo.DelegateSvg.List')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * Default implementation just returns the block type.
 * For edython.
 * @return !String
 */
eYo.DelegateSvg.List.prototype.xmlAttr = function () {
  return this.wrapped_
    ? eYo.Xml.LIST
    : eYo.DelegateSvg.List.superClass_.xmlAttr.call(this)
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
  var text = block.eyo.value_d.get()
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
  return eYo.Do.someChild(element, (child) => {
    return child.nodeType === Node.TEXT_NODE && block.eyo.value_d.set(child.nodeValue)
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
eYo.Xml.Literal.domToComplete = (() => {
  var newDlgt = (workspace, text, id, stmt_expected) => {
    if (text && text.length) {
      var type = eYo.T3.Profile.get(text, null).expr
      switch (type) {
      case eYo.T3.Expr.integer:
      case eYo.T3.Expr.floatnumber:
      case eYo.T3.Expr.imagnumber:
        return eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.numberliteral, id)
      case eYo.T3.Expr.shortliteral:
      case eYo.T3.Expr.shortstringliteral:
      case eYo.T3.Expr.shortbytesliteral:
        return eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.shortliteral, id)
      case eYo.T3.Expr.longliteral:
      case eYo.T3.Expr.longstringliteral:
        return eYo.DelegateSvg.newComplete(workspace, stmt_expected
          ? eYo.T3.Stmt.docstring_stmt
          : eYo.T3.Expr.longliteral, id)
      case eYo.T3.Expr.longbytesliteral:
        return eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.longliteral, id)
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
    var eyo
    eYo.Do.someChild(element, child => {
      if (child.nodeType === Node.TEXT_NODE) {
        return eyo = newDlgt(workspace, child.nodeValue, id, stmt_expected)
      }
    })
    if (!eyo) {
      // there was no text node to infer the type
      eyo = newDlgt(workspace, element.getAttribute(eYo.Key.PLACEHOLDER), id, stmt_expected)
    }
    return eyo || eYo.DelegateSvg.newComplete(workspace, eYo.T3.Expr.shortliteral, id)
  }
}) ()

goog.provide('eYo.Xml.Data')

/**
 * Save the block's data.
 * For edython.
 * @param {Element} element the persistent element.
 * @param {?Object} opt
 */
eYo.Delegate.prototype.saveData = function (element, opt) {
  this.forEachData(data => data.save(element, opt))
}

/**
 * Save the block's slots.
 * For edython.
 * @param {Element} element the persistent element.
 * @param {?Object} opt
 */
eYo.Delegate.prototype.saveSlots = function (element, opt) {
  this.forEachSlot(slot => slot.save(element, opt))
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
      this.forEachData(data => {
        data.load(element)
        // Consistency section, to be removed
        var xml = data.model.xml
        if (hasText && xml && xml.text) {
          console.log(`Only one text node ${data.key}/${block.type}`)
        }
        hasText = hasText || (xml && xml.text)
      })
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
 * @param {!eYo.Dlgt} dlgt The root block to encode.
 * @param {element} dom element to encode in
 * @param {?Object} opt  See the eponym option in `eYo.Xml.BlockToDom`.
 * @return {!Element} Tree of XML elements, possibly null.
 */
eYo.Xml.toDom = function (dlgt, element, opt) {
  if (dlgt.isControl) {
    var p = new eYo.Py.Exporter()
    eYo.Do.tryFinally(() => {
      var code = p.export(dlgt, {is_deep: true})
      if (code.length) {
        var py_dom = goog.dom.createDom(eYo.Xml.PYTHON)
        goog.dom.insertChildAt(element, py_dom, 0)
        goog.dom.appendChild(py_dom, goog.dom.createTextNode(`\n${code}\n`))
      }
    })
  }
  var controller = dlgt
  if ((controller && goog.isFunction(controller.toDom)) ||
    ((controller = dlgt.xml) && goog.isFunction(controller.toDom)) ||
    ((controller = dlgt.constructor.xml) && goog.isFunction(controller.toDom)) ||
    ((controller = dlgt.constructor) && goog.isFunction(controller.toDom))) {
    return controller.toDom(dlgt, element, opt)
  } else {
    var optNoNext = opt && opt.noNext
    dlgt.saveData(element, opt)
    dlgt.saveSlots(element, opt)
    opt && (opt.noNext = false)
    var magnetToDom = (m4t, name, key) => {
      if (m4t && !m4t.wrapped_) {
        // wrapped blocks belong to slots, they are managed from there
        var t_eyo = m4t.t_eyo
        if (t_eyo) {
          var child = eYo.Xml.dlgtToDom(t_eyo, opt)
          if (child) {
            child.setAttribute(name, key)
            goog.dom.appendChild(element, child)
          }
        }
      }
    }
    // the list blocks have no slots yet
    dlgt.inputList.forEach(input => {
      if (!input.eyo.slot) {
        magnetToDom(input.eyo.magnet, eYo.Xml.SLOT, input.name)
      }
    })
    // the right, suite and next flows
    magnetToDom(dlgt.magnets.right, eYo.Xml.FLOW, eYo.Xml.RIGHT)
    magnetToDom(dlgt.magnets.suite, eYo.Xml.FLOW, eYo.Xml.SUITE)
    !optNoNext && magnetToDom(dlgt.magnets.low, eYo.Xml.FLOW, eYo.Xml.NEXT)
  }
}

/**
 * Registers all the known models for their tags.
 * One shot function deleted after use.
 *
 */
eYo.Xml.registerAllTags = function () {
  // mode is one of 'Expr' or 'Stmt'
  var register = (mode) => {
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
      var model = eYo.Delegate.Manager.getModel(type)
      var xml = model && model.xml
      var attr = xml && xml.attr
      if (!goog.isString(attr)) {
        var m = XRegExp.exec(type, eYo.XRE.s3d)
        if (m) {
          attr = m.core
        } else {
          attr = type.substring(4)
        }
      } else if (!attr.length) {
        continue
      }
      var already = eYo.T3.Xml.fromDom[attr]
      if (goog.isArray(already)) {
        if (already.indexOf(type) < 0) {
          already.push(type)
        }
      } else if (goog.isString(already)) {
        if (type !== already) {
          eYo.T3.Xml.fromDom[attr] = already = [already, type]
        }
      } else {
        eYo.T3.Xml.fromDom[attr] = type
      }
      // register the reverse
      if (c9r) {
        // console.warn('REGISTER XML ATTR:', c9r.eyo.key, eYo.T3.Xml.toDom[mode][key], attr, key)
        c9r.eyo.xmlAttr = eYo.T3.Xml.toDom[mode][key] || attr || key // ERROR ? Dynamic tag name ?
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
 * @param {!*} owner workspace or block.
 * @return {?Blockly.Block} The root block created, if any.
 */
eYo.Xml.stringToBlock = function (string, owner) {
  var block
  try {
    var dom = eYo.Do.stringToDom(string)
    if (dom) {
      block = eYo.Xml.domToBlock(dom.documentElement, owner)
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
 * @param {!*} try_f
 * @param {?*} finally_f 
 * @param {?*} recovered_f 
 */
eYo.Xml.Recover.prototype.resitWrap = function (dom, try_f, finally_f) {
  this.dontResit(dom)
  this.to_resit_stack.push(this.to_resit)
  this.to_resit = []
  eYo.Do.forEachElementChild(
    dom,
    child => this.to_resit.push(child)
  )
  return eYo.Events.groupWrap(
    () => {
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
            var b = eYo.Xml.domToBlock(dom, this.workspace)
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
  )
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
  var fallback, where
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
  var ans
  eYo.Events.disableWrap(
    () => {
      if (best.types.length === 1) {
        fallback = best.types[0]
      } else if (owner && (best.types.length > 1)) {
        var name = dom.getAttribute(eYo.Xml.SLOT)
        var input = owner.eyo.getInput(name)
        var slot_m4t = input && input.eyo.magnet
        var flow_m4t = dom.getAttribute(eYo.Xml.FLOW)
          ? owner.eyo.magnets.suite
          : owner.eyo.magnets.low
        // return the first block that would connect to the owner
        if (!best.types.some(type => {
            var eyo = eYo.DelegateSvg.newComplete(workspace, type)
            var m4t = ans && ans.magnets.output
            if (slot_m4t && m4t && slot_m4t.checkType_(m4t)) {
              ans = eyo
              return true
            }
            m4t = eyo.magnets.high
            if (flow_m4t && m4t && flow_m4t.checkType_(m4t)) {
              ans = eyo
              return true
            }
          })) {
          fallback = best.types[0]
        }
      }
      ans || (ans = eYo.DelegateSvg.newComplete(workspace, fallback))
    }
  )
  if (ans) {
    ans.errorRecover = true
    eYo.Events.fireBlockCreate(ans.block_)
    eYo.Xml.fromDom(ans, dom, this)
  }
  return ans.block_
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
eYo.Xml.domToBlock = (() => {
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
        var eyo
        // is it a literal or something else special ?
        if ((eyo = eYo.Xml.Primary.domToComplete(dom, owner)) ||
        (eyo = eYo.Xml.Assignment.domToComplete(dom, owner)) ||
        (eyo = eYo.Xml.Literal.domToComplete(dom, owner)) ||
        (eyo = eYo.Xml.Comparison.domToComplete(dom, owner)) ||
        (eyo = eYo.Xml.Starred.domToComplete(dom, owner)) ||
        // (eyo = eYo.Xml.Group.domToComplete(dom, owner)) ||
        (eyo = eYo.Xml.Call.domToComplete(dom, owner)) ||
        (eyo = eYo.Xml.Compatibility.domToComplete(dom, owner))) {
          eYo.Xml.fromDom(eyo, dom)
          return eyo.block
        }
        // is there a simple correspondance with a known type
        if (dom.tagName.toLowerCase() === 's') {
          prototypeName = eYo.T3.Xml.fromDom[name + '_stmt'] || eYo.T3.Xml.fromDom[name + '_part'] || eYo.T3.Xml.fromDom[name]
        } else {
          prototypeName = eYo.T3.Xml.fromDom[name]
        }
        if (prototypeName) {
          if (goog.isArray(prototypeName)) {
            if (prototypeName.length === 1) {
              prototypeName = prototypeName[0]
            } else if (!(prototypeName = (() => {
                var where = dom.tagName.toLowerCase() === eYo.Xml.EXPR ? eYo.T3.Expr : eYo.T3.Stmt
                for (var i = 0; i < prototypeName.length; i++) {
                  var candidate = prototypeName[i]
                  var C9r = eYo.DelegateSvg.Manager.get(candidate)
                  if (C9r && where[C9r.eyo.key]) {
                    return candidate
                  }
                }
              }) ())) {
              // no prototype found, bail out.
              return
            }
          }
          eyo = eYo.DelegateSvg.newComplete(workspace, prototypeName, id)
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
            eyo = eYo.DelegateSvg.newComplete(workspace, solid, id)
          } else if ((controller = eYo.DelegateSvg.Manager.get(prototypeName))) {
            if (controller.eyo && goog.isFunction(controller.eyo.domToBlock)) {
              return controller.eyo.domToBlock(dom, workspace, id)
            } else if (goog.isFunction(controller.domToBlock)) {
              return controller.domToBlock(dom, workspace, id)
            }
            eyo = eYo.DelegateSvg.newComplete(workspace, prototypeName, id)
          }
          // Now create the block, either solid or not
        }
        if (eyo) {
          eYo.Xml.fromDom(eyo, dom)
          return eyo.block
        }
      }
    )
  }
  return function (dom, owner) {
    eYo.Xml.registerAllTags && eYo.Xml.registerAllTags()
    eYo.Xml.domToBlock = domToBlock
    return domToBlock(dom, owner)
  }
})()

eYo.Xml.domToDlgt = function (dom, owner) {
  var b = eYo.Xml.domToBlock(dom, owner)
  return b && b.eyo
}

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
 * @param {!eYo.Delegate} dlgt  The root block to decode.
 * @param {element} dom element to encode in
 * @return {?Boolean} Used?
 */
eYo.Xml.fromDom = function (dlgt, element) {
  // headless please
  dlgt.changeWrap(function () { // `this` is `dlgt`
  //    console.log('Block created from dom:', xmlBlock, block.type, block.id)
  // then fill it based on the xml data
    this.willLoad()
    var conclude // will run at the end if any
    var controller = this
    if (!this.controller_fromDom_locked && (controller &&
        goog.isFunction(controller.fromDom)) ||
        ((controller = this.xml) &&
        goog.isFunction(controller.fromDom)) ||
        ((controller = eYo.DelegateSvg.Manager.get(this.type)) &&
        (controller = controller.xml) &&
        goog.isFunction(controller.fromDom)) ||
        ((controller = eYo.DelegateSvg.Manager.get(this.type)) &&
        goog.isFunction(controller.fromDom))) {
      eYo.Do.tryFinally(() => {
        this.controller_fromDom_locked = true
        out = controller.fromDom(this, element)        
      }, () => {
        delete this.controller_fromDom_locked
        var state = element.getAttribute(eYo.Xml.STATE)
        if (state && state.toLowerCase() === eYo.Xml.LOCKED) {
          this.lock()
        }        
      })
    } else {
      eYo.Xml.Data.fromDom(this, element)
      // read slot
      this.forEachSlot(slot => slot.load(element))
      if (this instanceof eYo.DelegateSvg.List) {
        eYo.Do.forEachElementChild(element, child => {
          var name = child.getAttribute(eYo.Xml.SLOT)
          var input = this.getInput(name)
          var m4t = input && input.eyo.magnet
          if (m4t) {
            var t_eyo = m4t.t_eyo
            if (t_eyo) {
              t_eyo.recover.dontResit(child)
              eYo.Xml.fromDom(t_eyo, child)
            } else if ((t_eyo = eYo.Xml.domToDlgt(child, this))) {
              t_eyo.recover.dontResit(child)
              var targetM4t = t_eyo.magnets.output
              if (targetM4t && targetM4t.checkType_(m4t)) {
                targetM4t.connect(m4t)
              }
            } else {
              console.error('eYo.Xml.fromDom: Ignoring', child)
            }
          } else if (input) {
            console.error('Missing connection')
          }
        })
        conclude = () => {
          this.incrementChangeCount() // force new type
          this.consolidateType()
          this.consolidateConnections()
          this.consolidate() // too many consolidation !!!
        }
      }
      this.didLoad() // before the next and suite connections will connect
      // read flow and suite
      const statement = (m4t, key) => {
        if (m4t) {
          return eYo.Do.someElementChild(element, child => {
            if ((child.getAttribute(eYo.Xml.FLOW) === key)) {
              this.workspace.eyo.recover.dontResit(child)
              var t_eyo = eYo.Xml.domToDlgt(child, this)
              if (t_eyo) { // still headless!
                // we could create a block from that child element
                // then connect it to
                var m4ts = t_eyo.magnets
                if (m4ts.high) {
                  if (m4t.checkType_(m4ts.high)) {
                    m4t.connect(m4ts.high)
                  } else {
                    // we could not connect possibly because the
                    // type is not yet properly set
                    this.incrementChangeCount() // force new type
                    this.consolidateType()
                    this.consolidateConnections()
                    this.consolidate()
                    if (m4t.checkType_(m4ts.high)) {
                      m4t.connect(m4ts.high)
                    }            
                  }
                }
                return true
              }
            }
          })
        }
      }
      var out = statement(this.magnets.right, eYo.Xml.RIGHT)
      out = statement(this.magnets.suite, eYo.Xml.SUITE) || out
      out = statement(this.magnets.low, eYo.Xml.NEXT) || out
      var state = element.getAttribute(eYo.Xml.STATE)
      if (state && state.toLowerCase() === eYo.Xml.LOCKED) {
        this.lock()
      }
    }
    conclude && conclude()
    return out
  })
}

goog.require('eYo.DelegateSvg.Primary')

/**
 * The xml tag name of this block, as it should appear in the saved data.
 * For edython.
 * @return !String
 */
eYo.DelegateSvg.Expr.primary.prototype.xmlAttr = function () {
  var type = this.type
  if ([
    eYo.T3.Expr.identifier_valued,
    eYo.T3.Expr.identifier_annotated_valued,
    eYo.T3.Expr.assignment_chain
  ].indexOf(type) >= 0) {
    return '='
  }
  if (type === eYo.T3.Expr.named_expr) {
    return ':=' // 0.3
  }
  if ([
    eYo.T3.Expr.parent_module,
    eYo.T3.Expr.identifier_valued,
    eYo.T3.Expr.dotted_name,
    eYo.T3.Expr.dotted_name_as,
    eYo.T3.Expr.attributeref
  ].indexOf(type) >= 0) {
    return '.' // >=v0.3, eYo.T3.Expr.primary.substring(4)
  }
  if ([
    eYo.T3.Expr.named_call_expr,
    eYo.T3.Expr.call_expr
  ].indexOf(type) >= 0) {
    return '…()' // >=v0.3, eYo.Key.CALL
  }
  if ([
    eYo.T3.Expr.named_slicing,
    eYo.T3.Expr.slicing,
    eYo.T3.Expr.named_subscription,
    eYo.T3.Expr.subscription
  ].indexOf(type) >= 0) {
    return '…[]' // >=v0.3, eYo.T3.Expr.slicing.substring(4)
  }
  if ([
    eYo.T3.Expr.identifier_annotated,
    eYo.T3.Expr.augtarget_annotated,
    eYo.T3.Expr.key_datum
  ].indexOf(type) >= 0) {
    return ':' // >=v0.3, eYo.T3.Expr.identifier.substring(4)
  }
  if ([
    eYo.T3.Expr.identifier_as,
    eYo.T3.Expr.expression_as,
    eYo.T3.Expr.dotted_name_as
  ].indexOf(type) >= 0) {
    return '~' // eYo.T3.Expr.identifier.substring(4)
  }
  return '…'
}

goog.require('eYo.DelegateSvg.Assignment')

/**
 * The xml `eyo` attribute of this block, as it should appear in the saved data.
 * For edython.
 */
eYo.DelegateSvg.Stmt.assignment_stmt.prototype.xmlAttr = function () {
  return this.type === eYo.T3.Stmt.augmented_assignment_stmt
  ? this.operator_p
  : this.type === eYo.T3.Stmt.annotated_stmt || this.variant_p === eYo.Key.NONE || this.variant_p === eYo.Key.VALUED || this.variant_p === eYo.Key.EXPRESSION
    ? 'x'
    : '='
}

goog.provide('eYo.Xml.Assignment')

/**
 * Try to create a primary block from the given element.
 * @param {!Element} element dom element to be completed.
 * @param {!*} owner  The workspace or the parent block.
 * @override
 */
eYo.Xml.Assignment.domToComplete = function (element, owner) {
  if (element.tagName.toLowerCase() === 's') {
    var prototypeName = element.getAttribute(eYo.Key.EYO)
    var id = element.getAttribute('id')
    if (prototypeName === 'x') {
      var eyo = eYo.DelegateSvg.newComplete(owner, eYo.T3.Stmt.expression_stmt, id)  
      return eyo
    } else if (['+=', '-=', '*=', '/=', '//=', '%=', '**=', '@=', '<<=', '>>=', '&=', '^=', '|='].indexOf(prototypeName) >= 0) {
      eyo = eYo.DelegateSvg.newComplete(owner, eYo.T3.Stmt.augmented_assignment_stmt, id)
      eyo.eyo.operator_p = prototypeName
      return eyo
    } else if (prototypeName === '=') {
      eyo = eYo.DelegateSvg.newComplete(owner, eYo.T3.Stmt.assignment_stmt, id)
      eyo.eyo.operator_p = prototypeName
      return eyo
    }
  }
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
eYo.Xml.Comparison.domToComplete = function (element, owner) {
  var prototypeName = element.getAttribute(eYo.Key.EYO)
  var id = element.getAttribute('id')
  if (prototypeName === eYo.Xml.COMPARISON) {
    var op = element.getAttribute(eYo.Xml.OPERATOR)
    var C9r, model
    var type = eYo.T3.Expr.number_comparison
    if ((C9r = eYo.DelegateSvg.Manager.get(type))
      && (model = C9r.eyo.model.data)
      && (model = model.operator)
      && model.all
      && model.all.indexOf(op) >= 0) {
      var eyo = eYo.DelegateSvg.newComplete(owner, type, id)
    } else if ((type = eYo.T3.Expr.object_comparison)
      && (C9r = eYo.DelegateSvg.Manager.get(type))
      && (model = C9r.eyo.model.data)
      && (model = model.operator)
      && model.all
      && model.all.indexOf(op) >= 0) {
      eyo = eYo.DelegateSvg.newComplete(owner, type, id)
    }
    return eyo
  }
}

/**
 * Try to create a starred block from the given element.
 * @param {!Element} element dom element to be completed.
 * @param {!*} owner  The workspace or the parent block.
 * @override
 */
eYo.Xml.Starred.domToComplete = function (element, owner) {
  var prototypeName = element.getAttribute(eYo.Key.EYO)
  var id = element.getAttribute('id')
  if (prototypeName === "*") {
    var eyo = eYo.DelegateSvg.newComplete(owner, eYo.T3.Expr.star_expr, id)
  } else if (prototypeName === "**") {
    eyo = eYo.DelegateSvg.newComplete(owner, eYo.T3.Expr.or_expr_star_star, id)
  }
  return eyo
}

goog.provide('eYo.Xml.Primary')

/**
 * Try to create a primary block from the given element.
 * @param {!Element} element dom element to be completed.
 * @param {!*} owner  The workspace or the parent block.
 * @override
 */
eYo.Xml.Primary.domToComplete = function (element, owner) {
  if (element.tagName.toLowerCase() === 'x') {
    var prototypeName = element.getAttribute(eYo.Key.EYO)
    var t = {
      '=': eYo.T3.Expr.identifier_valued,
      ':=': eYo.T3.Expr.named_expr,
      '.': eYo.T3.Expr.parent_module,
      '…()': eYo.T3.Expr.named_call_expr,
      '…[]': eYo.T3.Expr.named_subscription,
      ':': eYo.T3.Expr.identifier_annotated,
      '~': eYo.T3.Expr.identifier_as,
      '…': eYo.T3.Expr.identifier
    } [prototypeName]
    if (t) {
      var id = element.getAttribute('id')
      return eYo.DelegateSvg.newComplete(owner, t, id)
    }
  }
}

goog.require('eYo.DelegateSvg.Group')
goog.provide('eYo.Xml.Group')

// /**
//  * Reads the given element into a block.
//  * @param {!Element} element dom element to be read.
//  * @param {!*} owner  The workspace or the parent block.
//  * @override
//  */
// eYo.Xml.Group.domToComplete = function (element, owner) {
//   var attr = element.getAttribute(eYo.Key.EYO)
//   if (attr === eYo.DelegateSvg.Stmt.else_part.prototype.xmlAttr()) {
//     var type = eYo.T3.Stmt.else_part
//     var id = element.getAttribute('id')
//     return eYo.DelegateSvg.newComplete(owner, type, id)
//   }
// }

goog.provide('eYo.Xml.Compatibility')

/**
 * .
 * @param {!Element} element dom element to be completed.
 * @param {!*} owner  The workspace or the parent block
 * @override
 */
eYo.Xml.Compatibility.domToComplete = function (element, owner) {
  var name = element.getAttribute(eYo.Key.EYO)
  // deprecated since v0.3.0
  if (name === 'dict_comprehension') {
    // <x eyo="dict_comprehension" xmlns="urn:edython:0.2" xmlns:eyo="urn:edython:0.2"><x eyo="identifier" name="k" slot="key"></x><x eyo="identifier" name="d" slot="datum"></x></x>
    var id = element.getAttribute('id')
    var eyo = eYo.DelegateSvg.newComplete(owner, eYo.T3.Expr.comprehension, id)
    if (eyo) {
      var kd = eYo.DelegateSvg.newComplete(owner, eYo.T3.Expr.key_datum)
      // the 'key' slot
      eYo.Do.forEachElementChild(element, child => {
        var name = child.getAttribute(eYo.Xml.SLOT)
        if (name === 'key') {
          var dd = eYo.DelegateSvg.newComplete(owner, child)
          kd.target_t.connectLast(dd)
        } else if (name === 'datum') {
          dd = eYo.DelegateSvg.newComplete(owner, child)
          kd.annotated_s.connect(dd)
        }
      })
      eyo.expression_s.connect(kd)
      return eyo
    }
  }
}

goog.provide('eYo.Xml.Call')

/**
 * Reads the given element into a block.
 * call blocks have eyo:call and tag eyo:builtin__call names
 * if there is an eyo:input attribute, even a ''
 * then it is an expression block otherwise it is a statement block. DEPRECATED.
 * @param {!Element} element dom element to be completed.
 * @param {!*} owner  The workspace or the parent block
 * @override
 */
eYo.Xml.Call.domToComplete = function (element, owner) {
  if (element.getAttribute(eYo.Key.EYO) === eYo.Xml.CALL) {
    var type = element.tagName.toLowerCase() === eYo.Xml.EXPR
      ? eYo.T3.Expr.call_expr
      : eYo.T3.Stmt.call_stmt
    var id = element.getAttribute('id')
    return eYo.DelegateSvg.newComplete(owner, type, id)
  }
}

/**
 * Compare the blocks by comparing their xml string representation.
 * Usefull for testing.
 * For edython.
 * @param {!eYo.Delegate} lhs
 * @param {!eYo.Delegate} rhs
 * @return {Number} classical values -1, 0 or 1.
 */
eYo.Xml.compareBlocks = function (lhs, rhs) {
  var xmlL = goog.dom.xml.serialize(eYo.Xml.dlgtToDom(lhs, {noId: true}))
  var xmlR = goog.dom.xml.serialize(eYo.Xml.dlgtToDom(rhs, {noId: true}))
  return xmlL < xmlR ? -1 : (xmlL < xmlR ? 1 : 0)
}
