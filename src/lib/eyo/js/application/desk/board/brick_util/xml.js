/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Xml override.
 * The default brick to and from Xml translation is rewritten.
 * There are mainly 4 entries:
 * 1) brickToDom, to convert a given brick into an xml tree.
 * 2) domToBrick, to create a brick from an xml tree.
 * 3) toDom, to convert the brick content, into an existing xml element
 * 4) fromDom, to convert the content of an existing element into a brick.
 * The Blockly original methods are overriden to manage the edython bricks.
 * The xml nodes concerning edython all pertain to the `eyo` namespace.
 * There are separate xml nodes for statements and expressions,
 * the latter are characterized by a slot attribute, which may be
 * a void string. This is useful for call expression that can appear as
 * statements too.
 * The domToBoard has been overriden to manage more bricks.
 * When both an expression and a statement share the same
 * tag, the expression always have a slot attribute,
 * which may be void.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

eYo.require('const')

eYo.require('xre')
eYo.require('t3')
eYo.require('brick')

//g@@g.require('g@@g.dom');

eYo.makeNS('xml', {
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

  LIST: 'List', // attribute name

  WORKSPACE: 'board', // tag name
  CONTENT: 'content', // tag name
  EDYTHON: 'edython', // tag name
})

eYo.provide('xml.text')
eYo.provide('xml.assignment')
eYo.provide('xml.starred')
eYo.provide('xml.literal')
eYo.provide('xml.comparison')
eYo.provide('xml.data')
eYo.provide('xml.primary')
eYo.provide('xml.recover')
eYo.provide('xml.group')
eYo.provide('xml.compatibility')
eYo.provide('xml.call')

eYo.model.allowModelPaths({
  [eYo.model.ROOT]: [
    'xml',
  ],
  xml: [
    'attr', 'types', 'attribute',
  ],
})

// Next are used to let the compiler know that we need them
eYo.forward('brick.functions');
eYo.forward('brick.stdtypes');
eYo.forward('brick.random');
eYo.forward('brick.math');
eYo.forward('brick.cmath');
eYo.forward('brick.turtle');
eYo.forward('brick.decimal');
eYo.forward('brick.fractions');
eYo.forward('brick.statistics');
eYo.forward('brick.range')
eYo.forward('expr')

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 * Overriden to add the `eyo` namespace.
 * @param {Element} dom A tree of XML elements.
 * @return {string} Value representation.
 */
eYo.xml.domToText = function (dom) {
  dom.setAttribute('xmlns', eYo.xml.XMLNS)
  dom.setAttribute('xmlns:eyo', eYo.xml.XMLNS)
  var oSerializer = new XMLSerializer()
  return oSerializer.serializeToString(dom)
}


/**
 * Encode a brick subtree as XML with where coordinates. Eliminates the use of the Blockly's eponym method.
 * @param {eYo.brick.BaseC9r} brick The root brick to encode.
 * @param {Object} [opt]  See the eponym parameter in `eYo.xml.brickToDom`.
 * @return {!Element} Tree of XML elements.
 */
eYo.xml.brickToDomWithWhere = function(brick, opt) {
  var element = eYo.xml.brickToDom(brick, opt)
  var xy = brick.xy
  element.setAttribute('x', Math.round(xy.x))
  element.setAttribute('y', Math.round(xy.y))
  return element
};

/**
 * Encode a brick tree as XML.
 * @param {eYo.board} board The board containing bricks.
 * @param {Object} [opt]  See eponym parameter in `eYo.xml.brickToDom`.
 * @return {!Element} XML document.
 */
eYo.xml.boardToDom = function(board, opt) {
  var root = eYo.dom.createDom(eYo.xml.EDYTHON, null,
    eYo.dom.createDom(eYo.xml.WORKSPACE, null,
      eYo.dom.createDom(eYo.xml.cONTENT)
    )
  )
  var xml = root.firstChild.firstChild
  board.orderedTopBricks.forEach(brick => {
    var dom = eYo.xml.brickToDomWithWhere(brick, opt)
    var p = new eYo.py.Exporter()
    eYo.do.tryFinally(() => {
      if (!brick.isControl) {
        var code = p.export(brick, {is_deep: true})
        if (code.length) {
          var py_dom = eYo.dom.createDom(eYo.xml.PYTHON)
          eYo.dom.insertChildAt(dom, py_dom, 0)
          eYo.dom.appendChild(py_dom, eYo.dom.createTextNode(`\n${code}\n`))
        }
      }
    }, () => {
      eYo.dom.appendChild(xml, dom)
    })
  })
  root.setAttribute('xmlns', eYo.xml.XMLNS) // default namespace
  root.setAttribute('xmlns:eyo', eYo.xml.XMLNS) // global namespace declaration
  return root;
};

/**
 * Decode an XML DOM and create bricks on the board.
 * overriden to support other kind of bricks
 * This is a copy with a tiny formal modification.
 * @param {Element} xml XML DOM.
 * @param {*} owner The board or the parent brick.
 * @return {Array<string>} An array containing new brick IDs.
 */
eYo.xml.domToBoard = function (xml, owner) {
  var board = owner.board || owner
  if (eYo.isStr(xml)) {
    var parser = new DOMParser()
    xml = parser.parseFromString(xml, 'application/xml')
  }
  var newBlockIds = [] // A list of brick IDs added by this call.
  // Safari 7.1.3 is known to provide node lists with extra references to
  // children beyond the lists' length.  Trust the length, do not use the
  // looping pattern of checking the index for an object.

  board[eYo.$].recover.whenRecovered(
    brick => newBlockIds.push(brick.id)
  )

  // Disable board resizes as an optimization.
  if (board.setResizesEnabled) {
    board.setResizesEnabled(false)
  }

  // This part is a custom part for edython
  var brickMaker = (xmlChild) => {
    var brick
    if (xmlChild && xmlChild.nodeType === Node.ELEMENT_NODE) {
      if ((brick = eYo.xml.domToBrick(xmlChild, owner))) {
        newBlockIds.push(brick.id)
        var xy = new eYo.geom.Point()
        xy.x = xmlChild.hasAttribute('x')
          ? parseInt(xmlChild.getAttribute('x'), 10) : 10
        xy.y = xmlChild.hasAttribute('y')
          ? parseInt(xmlChild.getAttribute('y'), 10) : 10
        if (!isNaN(xy.x) && !isNaN(xy.y)) {
          brick.moveBy(xy)
        } else {
          xy.c = xmlChild.hasAttribute('c')
            ? parseInt(xmlChild.getAttribute('c'), 10)
            : 1
            xy.l = xmlChild.hasAttribute('l')
            ? parseInt(xmlChild.getAttribute('l'), 10)
            : 1
          if (!isNaN(c) && !isNaN(l)) {
            brick.moveBy(xy)
          }
        }
      }
    }
    return brick
  }
  var brick
  eYo.event.groupWrap(() => {
    xml.childNodes.forEach(child => {
      var name = child.nodeName.toLowerCase()
      if (name === eYo.xml.EDYTHON) {
        child.childNodes.some(child => {
          if (child.tagName && child.tagName.toLowerCase() === eYo.xml.WORKSPACE) {
            child.childNodes.some(child => {
              if (child.tagName && child.tagName.toLowerCase() === eYo.xml.cONTENT) {
                child.childNodes.forEach(child => {
                  if ((brick = brickMaker(child))) {
                    newBlockIds.push(brick.id)
                  }
                })
                return true
              }
            })
            return true
          }
        })
      } else if (name === eYo.xml.sTMT || name === eYo.xml.EXPR) {
        // for edython
        ;(brick = brickMaker(child)) && (newBlockIds.push(brick.id))
      }
    })
  }, () => {
    // Re-enable board resizing.
    if (board.setResizesEnabled) {
      board.setResizesEnabled(true)
    }
    board[eYo.$].recover.whenRecovered(null) // clean
  })
  return newBlockIds
}

/**
 * Create a new brick, with full contents.
 * This is the expected way to create a brick
 * to be displayed immediately.
 * @param {BoardSvg} board
 * @param {String|Object} model prototypeName or xml representation.
 * @param {string} [id]
 * @private
 */
eYo.brick.newReady = (() => {
  var newReady = eYo.brick.newReady
  return (model, id, owner) => {
    if (eYo.isStr(model)) {
      model = model.trim()
      if (model.startsWith('<')) {
        var brick = eYo.xml.stringToBrick(model, owner)
      }
    } else if (model.getAttribute) {
      brick = eYo.xml.domToBrick(model, owner)
    }
    return brick || newReady(model, id, owner)
  }
}) ()

/**
 * Encode a brick subtree as dom.
 * There are various hooks at different levels.
 * Control is tranferred to the first object in the following list
 * which implements a brickToDom function, if any.
 * 1) brick
 * 2) brick.xml
 * 3) brick.constructor.xml
 * 4) brick.constructor
 * Otherwise an xml element with the brick's tag name is created.
 * Then it is populated with the toDom method.
 * There are 5 particular situations: literal, augmented assignments and comparisons, wrapped bricks, list bricks and finally solid bricks.
 * 1) Literal bricks include various numbers and strings.
 * They all share the same tag name: eyo:literal.
 * The solid brick type is guessed from
 * the nature of the brick content.
 * It's easy to encode such bricks, but decoding is based on the use
 * of a regular expression.
 * 2) Augmented assignments and comparisons.
 * The number of operators involved in augmented assignment is very big.
 * We separate in 2 categories:
 * number assignment and bitwise assignment.
 * This allows a simpler user interface.
 * Encoding the bricks is straightforward, decoding is not.
 * The operator is stored as an attribute and used to distinguish between
 * bitwise and number augmented assignments.
 * The same holds for comparison bricks, mutatis mutandis.
 * 3) List bricks are meant to be wrapped. They should never appear
 * as top bricks. When wrapped, the tag name is always eyo:list.
 * The solid type is encoded in the slot attribute,
 * it also depends on the enclosing brick.
 * 4) Wrapped bricks other than lists will not add an xml child level.
 * As a consequence, this method just returns nothing for such bricks.
 * 5) solid bricks are named after their type which eyo:foo.
 * These brick types correspond to an alternate in the python grammar.
 * The persistence storage may remember these bricks as eyo:foo instead of eyo:foo.
 * @param {eYo.brick.BaseC9r} brick The root brick to encode.
 * @param {Object} [opt]  Options `noId` is True if the encoder should skip the brick id, `noNext` is True if the encoder should skip the next brick.
 * @return {!Element} Tree of XML elements, possibly null.
 */
eYo.xml.brickToDom = (() => {
  var brickToDom = function (brick, opt) {
    if (brick.target_is_wrapped_ && !(brick instanceof eYo.expr.List)) {
      // a wrapped brick does not create a new element on its own
      // it only can populate an already existing xml node.
      // Except for list nodes.
      return
    }
    var controller = brick
    if ((controller &&
      eYo.isF(controller.brickToDom)) ||
      ((controller = brick.xml) &&
      eYo.isF(controller.brickToDom)) ||
      ((controller = brick.constructor) &&
      (controller = controller.xml) &&
      eYo.isF(controller.brickToDom)) ||
      ((controller = brick.constructor) &&
      eYo.isF(controller.brickToDom))) {
      var element = controller.brickToDom(brick, opt)
    } else {
      var attr = brick.xmlAttr()
      element = eYo.dom.createDom(brick.isExpr? eYo.xml.EXPR: eYo.xml.sTMT)
      element.setAttribute(eYo.key.EYO, attr)
      !(opt && opt.noId) && (element.setAttribute('id', brick.id))
      eYo.xml.toDom(brick, element, opt)
    }
    // this is for the editor, not python
    if (brick.locked_) {
      element.setAttribute(eYo.xml.sTATE, eYo.xml.LOCKED)
    }
    return element
  }
  return function (brick, opt) {
    eYo.xml.registerAllTags && (eYo.xml.registerAllTags())
    eYo.xml.brickToDom = brickToDom
    return brickToDom(brick, opt)
  }
}) ()

eYo.require('stmt.group')

/**
 * The xml tag name of this brick, as it should appear in the saved data.
 * For edython.
 * @return attr name
 */
eYo.brick.BaseC9r_p.xmlAttr = function () {
  var attr = this.constructor[eYo.$].xmlAttr || (this.isExpr ? eYo.t3.xml.toDom.Expr : eYo.t3.xml.toDom.Stmt)[this.constructor[eYo.$].key]
  return attr || (this.type && this.type.substring(4)) || eYo.key.PLACEHOLDER
}

eYo.require('expr.List')

/**
 * The xml tag name of this brick, as it should appear in the saved data.
 * Default implementation just returns the brick type.
 * For edython.
 * @return !String
 */
eYo.expr.List_p.xmlAttr = function () {
  return this.wrapped_
    ? eYo.xml.LIST
    : eYo.expr.List[eYo.$].C9r_s.xmlAttr.call(this)
}

eYo.require('expr.primary')

/**
 * Convert the brick's value to a text dom element.
 * For edython.
 * @param {eYo.brick.BaseC9r} brick The brick to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element
 */
eYo.xml.text.toDom = function (brick, element) {
  var text = brick.value_d.get()
  if (text && text.length) {
    var child = eYo.dom.createTextNode(text)
    eYo.dom.appendChild(element, child)
  }
  return element
}

/**
 * Convert the brick from a dom element.
 * For edython.
 * @param {eYo.brick.BaseC9r} brick The brick to be converted.
 * @param {Element} xml the persistent element.
 * @return a dom element
 */
eYo.xml.text.fromDom = function (brick, element) {
  return eYo.do.someChild(element, child => child.nodeType === Node.TEXT_NODE && (brick.Value_p = child.nodeValue)
  )
}

eYo.require('brick.assignment')

eYo.require('brick.starred')
/**
 * Try to create a Literal brick from the given element.
 * @param {Element} element dom element to be completed.
 * @param {*} owner  The board or the parent brick.
 * @override
 */
eYo.xml.literal.domToComplete = (() => {
  var brickMaker = (board, text, id, stmt_expected) => {
    if (text && text.length) {
      var type = eYo.t3.profile.get(text, null).expr
      switch (type) {
      case eYo.t3.expr.integer:
      case eYo.t3.expr.floatnumber:
      case eYo.t3.expr.imagnumber:
        return eYo.brick.newReady(eYo.t3.expr.numberliteral, id, board)
      case eYo.t3.expr.shortliteral:
      case eYo.t3.expr.shortstringliteral:
      case eYo.t3.expr.shortbytesliteral:
        return eYo.brick.newReady(eYo.t3.expr.shortliteral, id, board)
      case eYo.t3.expr.longliteral:
      case eYo.t3.expr.longstringliteral:
        return eYo.brick.newReady(stmt_expected
          ? eYo.t3.stmt.docstring_stmt
          : eYo.t3.expr.longliteral, id, board)
      case eYo.t3.expr.longbytesliteral:
        return eYo.brick.newReady(board, eYo.t3.expr.longliteral, id, board)
      }
    }
  }
  return function (element, owner) {
    if (element.getAttribute(eYo.key.EYO) !== eYo.xml.LITERAL) {
      return
    }
    var board = owner.board || owner
    // is it a statement or an expression ?
    var stmt_expected = element.tagName.toLowerCase() === eYo.xml.sTMT
    var id = element.getAttribute('id')
    var brick
    eYo.do.someChild(element, child => {
      if (child.nodeType === Node.TEXT_NODE) {
        return brick = brickMaker(board, child.nodeValue, id, stmt_expected)
      }
    })
    if (!brick) {
      // there was no text node to infer the type
      brick = brickMaker(board, element.getAttribute(eYo.key.PLACEHOLDER), id, stmt_expected)
    }
    return brick || eYo.brick.newReady(eYo.t3.expr.shortliteral, id, board)
  }
}) ()

eYo.require('brick.operator')

/**
 * Save the brick's data.
 * For edython.
 * @param {Element} element the persistent element.
 * @param {Object} [opt]
 */
eYo.brick.BaseC9r_p.saveData = function (element, opt) {
  this.dataForEach(data => data.save(element, opt))
}

/**
 * Save the brick's slots.
 * For edython.
 * @param {Element} element the persistent element.
 * @param {Object} [opt]
 */
eYo.brick.BaseC9r_p.saveSlots = function (element, opt) {
  this.slotForEach(slot => slot.save(element, opt))
}

/**
 * Convert the brick's data from a dom element.
 * For edython.
 * @param {eYo.brick.BaseC9r} brick The brick to be converted.
 * @param {Element} xml the persistent element.
 */
eYo.xml.data.fromDom = function (brick, element) {
  var hasText
  brick.changer.wrap(() => { // `this` is `brick`
    brick.dataForEach(data => {
      data.load(element)
      // Consistency section, to be removed
      var xml = data.model.xml
      if (hasText && xml && xml.text) {
        console.log(`Only one text node ${data.key}/${brick.type}`)
      }
      hasText = hasText || (xml && xml.text)
    })
  })
}

/**
 * Encode a brick subtree as dom.
 * The xml element was created to hold what the brick contains.
 * Some information is stored as an attribute, whereas other
 * needs another xml node.
 * When possible, the control is transferred to the first controller
 * in the following list which implements a toDom method.
 * 1) brick
 * 2) brick.xml
 * 3) brick.constructor.xml (no inheritance)
 * 4) brick.constructor (no inheritance here too)
 * The default implementation does nothing if there's no controller
 * to take control.
 * @param {eYo.brick.BaseC9r} brick The root brick to encode.
 * @param {element} dom element to encode in
 * @param {Object} [opt]  See the eponym option in `eYo.xml.brickToDom`.
 * @return {!Element} Tree of XML elements, possibly null.
 */
eYo.xml.toDom = function (brick, element, opt) {
  if (brick.isControl) {
    var p = new eYo.py.Exporter()
    eYo.do.tryFinally(() => {
      var code = p.export(brick, {is_deep: true})
      if (code.length) {
        var py_dom = eYo.dom.createDom(eYo.xml.PYTHON)
        eYo.dom.insertChildAt(element, py_dom, 0)
        eYo.dom.appendChild(py_dom, eYo.dom.createTextNode(`\n${code}\n`))
      }
    })
  }
  var controller = brick
  if ((controller && eYo.isF(controller.toDom)) ||
    ((controller = brick.xml) && eYo.isF(controller.toDom)) ||
    ((controller = brick.constructor.xml) && eYo.isF(controller.toDom)) ||
    ((controller = brick.constructor) && eYo.isF(controller.toDom))) {
    return controller.toDom(brick, element, opt)
  } else {
    var optNoNext = opt && opt.noNext
    brick.saveData(element, opt)
    brick.saveSlots(element, opt)
    opt && (opt.noNext = false)
    var magnetToDom = (m4t, name, key) => {
      if (m4t && !m4t.wrapped_) {
        // wrapped bricks belong to slots, they are managed from there
        var t9k = m4t.targetBrick
        if (t9k) {
          var child = eYo.xml.brickToDom(t9k, opt)
          if (child) {
            child.setAttribute(name, key)
            eYo.dom.appendChild(element, child)
          }
        }
      }
    }
    // the right, suite and next flows
    magnetToDom(brick.right_m, eYo.xml.FLOW, eYo.xml.RIGHT)
    magnetToDom(brick.suite_m, eYo.xml.FLOW, eYo.xml.sUITE)
    !optNoNext && (magnetToDom(brick.foot_m, eYo.xml.FLOW, eYo.xml.NEXT))
  }
}

/**
 * Registers all the known models for their tags.
 * One shot function deleted after use.
 *
 */
eYo.xml.registerAllTags = function () {
  // mode is one of 'expr' or 'stmt'
  var register = (mode) => {
    var where = eYo.t3[mode]
    for (var key in where) {
      if (!eYo.hasOwnProperty(where, key)) {
        continue
      }
      var type = where[key]
      if (!type.startsWith || type.startsWith('.')) {
        continue
      }
      var C9r = eYo.c9r.forType(type)
      var model = eYo.model.forType(type)
      var xml = model && model.xml
      var attr = xml && xml.attr
      if (!eYo.isStr(attr)) {
        var m = XRegExp.exec(type, eYo.xre.S3d)
        if (m) {
          attr = m.core
        } else {
          attr = type.substring(4)
        }
      } else if (!attr.length) {
        continue
      }
      var already = eYo.t3.xml.fromDom[attr]
      if (eYo.isRA(already)) {
        if (already.indexOf(type) < 0) {
          already.push(type)
        }
      } else if (eYo.isStr(already)) {
        if (type !== already) {
          eYo.t3.xml.fromDom[attr] = already = [already, type]
        }
      } else {
        eYo.t3.xml.fromDom[attr] = type
      }
      // register the reverse
      if (C9r) {
        // console.warn('REGISTER XML ATTR:', c9r[eYo.$].key, eYo.t3.xml.toDom[mode][key], attr, key)
        C9r[eYo.$].xmlAttr = eYo.t3.xml.toDom[mode][key] || attr || key // ERROR ? Dynamic tag name ?
      }
    }
  }
  register('expr')
  register('stmt')
  delete eYo.xml.registerAllTags
}

/**
 * Decode a string and create a brick (and possibly sub bricks)
 * on the board.
 * If the string is not valid xml, then nothing is returned.
 *
 * @param {String} string a serialized dom element.
 * @param {*} owner board or brick.
 * @return {?eYo.brick.BaseC9r} The root brick created, if any.
 */
eYo.xml.stringToBrick = function (string, owner) {
  var brick
  try {
    var dom = eYo.do.StringToDom(string)
    if (dom) {
      brick = eYo.xml.domToBrick(dom.documentElement, owner)
    }
  } catch (err) {
    console.error(err)
    throw err
  }
  return brick
}

/**
 * Recover nodes from a possibly corrupted xml data.
 */
eYo.xml.Recover = function (board) {
  this.board = board
  this.recovered = []
  this.to_resit = []
  this.to_resit_stack = []
}

/**
 * Will execute the given action for each recovered brick.
 * @param {Function} [f]
 */
eYo.xml.Recover.prototype.whenRecovered = function (f) {
  this.recovered_f = f
}

/**
 * Don't resit the given dom.
 *
 * @param {Element} dom XML dom element.
 * @param {eYo.board} board  The board.
 */
eYo.xml.Recover.prototype.dontResit = function (dom) {
  var i = this.to_resit.indexOf(dom)
  if (i >= 0) {
    this.to_resit.splice(i, 1)
  }
}

/**
 * Create bricks with elements that were not used during the normal flow.
 * Uses `domToBrick`.
 * @param {*} dom
 * @param {*} try_f
 * @param {*} [finally_f]
 * @param {*} [recovered_f]
 */
eYo.xml.Recover.prototype.resitWrap = function (dom, try_f, finally_f) {
  this.dontResit(dom)
  this.to_resit_stack.push(this.to_resit)
  this.to_resit = []
  eYo.do.forEachElementChild(
    dom,
    child => this.to_resit.push(child)
  )
  return eYo.event.groupWrap(() => {
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
          var brick = eYo.xml.domToBrick(dom, this.board)
          brick && (this.recovered.push(brick))
        }
        try {
          this.recovered_f && (this.recovered.forEach(this.recovered_f))
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
  })
}

/**
 * The `domToBrick` could not return a brick.
 * We must do something to recover errors.
 * The idea is to replace the faulty xml part by a brick
 * and parse the children separately with `recoverDom`
 *
 * @param {Element} dom XML dom element.
 * @param {eYo.board | eYo.brick.BaseC9r} owner either the board or a brick.
 * @return {!eYo.brick.BaseC9r} The root brick created.
 */
eYo.xml.Recover.prototype.domToBrick = function (dom, owner) {
  var board = owner.board
  if (!board) {
    board = owner
    owner = eYo.NA
  }
  if (!board.newBrick) {
    console.error('ARGH')
  }
  // First create a brick that we will return to replace the expected one
  // This is a brick of the same kind (expression/statement)
  // but at least with a generic type such that any connection will fit.
  var tag = dom.tagName
  var fallback, where
  if (tag === eYo.xml.EXPR) {
    fallback = eYo.t3.expr.expression_any
    where = eYo.t3.expr
  } else if (tag === eYo.xml.sTMT) {
    fallback = eYo.t3.stmt.expression_stmt
    where = eYo.t3.stmt
  }
  // amongst all the `where` bricks,
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
    var data = eYo.model.forType(type).data
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
  eYo.event.disableWrap(
    () => {
      if (best.types.length === 1) {
        fallback = best.types[0]
      } else if (owner && (best.types.length > 1)) {
        var name = dom.getAttribute(eYo.xml.sLOT)
        var slot = owner.getSlot(name)
        var slot_m4t = slot && slot.magnet
        var flow_m4t = dom.getAttribute(eYo.xml.FLOW)
          ? owner.suite_m
          : owner.foot_m
        // return the first brick that would connect to the owner
        if (!best.types.some(type => {
            var b3k = eYo.brick.newReady(type, board)
            var m4t = b3k && b3k.out_m
            if (slot_m4t && m4t && slot_m4t.checkType_(m4t)) {
              ans = b3k
              return true
            }
            m4t = b3k.head_m
            if (flow_m4t && m4t && flow_m4t.checkType_(m4t)) {
              ans = b3k
              return true
            }
          })) {
          fallback = best.types[0]
        }
      }
      ans || (ans = eYo.brick.newReady(fallback, board))
    }
  )
  if (ans) {
    ans.errorRecover = true
    eYo.event.fireBrickCreate(ans)
    eYo.xml.fromDom(ans, dom)
  }
  return ans
}

/**
 * Decode an XML brick tag and create a brick (and possibly sub bricks)
 * on the board.
 * Try to decode a literal or other special node.
 * If that does not work, try to deconde ans edython brick,
 * if that still does not work, fall down to the original
 * Blockly's method.
 * We have 2 hooks levels.
 * If a controller implements a domToBrick method,
 * control is tranferred to it.
 * A controller is either the xml instance of a constructor,
 * of the constructor itself.
 * Is it really headless ?
 *
 * @param {Element} xmlBrick XML brick element.
 * @param {*} owner The board or the owning brick.
 * @return {!eYo.brick.BaseC9r} The root brick created.
 */
eYo.xml.domToBrick = (() => {
  var domToBrick = function (dom, owner) {
    if (!eYo.isF(dom.getAttribute)) {
      return eYo.NA
    }
    var id = dom.getAttribute('id')
    var name = dom.getAttribute(eYo.key.EYO)
    var prototypeName
    //
    var board = owner.board || owner
    return board[eYo.$].recover.resitWrap(
      dom,
      () => {
        var brick
        // is it a literal or something else special ?
        if ((brick = eYo.xml.primary.domToComplete(dom, owner)) ||
        (brick = eYo.xml.assignment.domToComplete(dom, owner)) ||
        (brick = eYo.xml.literal.domToComplete(dom, owner)) ||
        (brick = eYo.xml.comparison.domToComplete(dom, owner)) ||
        (brick = eYo.xml.starred.domToComplete(dom, owner)) ||
        // (brick = eYo.xml.group.domToComplete(dom, owner)) ||
        (brick = eYo.xml.call.domToComplete(dom, owner)) ||
        (brick = eYo.xml.compatibility.domToComplete(dom, owner))) {
          eYo.xml.fromDom(brick, dom)
          return brick
        }
        // is there a simple correspondance with a known type
        if (dom.tagName.toLowerCase() === 's') {
          prototypeName = eYo.t3.xml.fromDom[name + '_stmt'] || eYo.t3.xml.fromDom[name + '_part'] || eYo.t3.xml.fromDom[name]
        } else {
          prototypeName = eYo.t3.xml.fromDom[name]
        }
        if (prototypeName) {
          if (eYo.isRA(prototypeName)) {
            if (prototypeName.length === 1) {
              prototypeName = prototypeName[0]
            } else if (!(prototypeName = (() => {
                var where = dom.tagName.toLowerCase() === eYo.xml.EXPR ? eYo.t3.expr : eYo.t3.stmt
                for (var i = 0; i < prototypeName.length; i++) {
                  var candidate = prototypeName[i]
                  var C9r = eYo.model.forType(candidate)
                  if (C9r && where[C9r[eYo.$].key]) {
                    return candidate
                  }
                }
              }) ())) {
              // no prototype found, bail out.
              return
            }
          }
          brick = eYo.brick.newReady(prototypeName, id, boards)
        } else {
          if (!name) {
            name = dom.tagName.toLowerCase() === 's' ? 'expression_stmt': 'any_expression'
          }
          prototypeName = 'eyo:'+name
          var solid = prototypeName + ''
          var controller = eYo.model.forType(solid)
          if (controller) {
            if (controller[eYo.$] && eYo.isF(controller[eYo.$].domToBrick)) {
              return controller[eYo.$].domToBrick(dom, board, id)
            } else if (eYo.isF(controller.domToBrick)) {
              return controller.domToBrick(dom, board, id)
            }
            brick = eYo.brick.newReady(solid, id, board)
          } else if ((controller = eYo.model.forType(prototypeName))) {
            if (controller[eYo.$] && eYo.isF(controller[eYo.$].domToBrick)) {
              return controller[eYo.$].domToBrick(dom, board, id)
            } else if (eYo.isF(controller.domToBrick)) {
              return controller.domToBrick(dom, board, id)
            }
            brick = eYo.brick.newReady(prototypeName, id, board)
          }
          // Now create the brick, either solid or not
        }
        if (brick) {
          eYo.xml.fromDom(brick, dom)
          board.hasUI && brick.initUI()
          return brick
        }
      }
    )
  }
  return function (dom, owner) {
    eYo.xml.registerAllTags && (eYo.xml.registerAllTags())
    eYo.xml.domToBrick = domToBrick
    return domToBrick(dom, owner)
  }
})()

/**
 * Decode a brick subtree from XML.
 * When possible, the control is transferred to the first controller
 * in the following list which implements a fromDom method.
 * 1) brick
 * 2) brick.xml
 * 3) brick.constructor.xml (no inheritance)
 * 4) brick.constructor (no inheritance here too)
 * The default implementation does nothing if there's no controller
 * @param {eYo.brick.BaseC9r} brick  The root brick to decode.
 * @param {element} dom element to encode in
 * @return {?Boolean} Used?
 */
eYo.xml.fromDom = function (brick, element) {
  // headless please
  brick.changer.wrap(() => { // `this` is `brick`
  //    console.log('Brick created from dom:', xmlBrick, brick.type, brick.id)
  // then fill it based on the xml data
    this.willLoad()
    var conclude // will run at the end if any
    var controller = brick
    if (!brick.controller_fromDom_locked && (controller &&
        eYo.isF(controller.fromDom)) ||
        ((controller = brick.xml) &&
        eYo.isF(controller.fromDom)) ||
        ((controller = eYo.model.forType(brick.type)) &&
        (controller = controller.xml) &&
        eYo.isF(controller.fromDom)) ||
        ((controller = eYo.model.forType(brick.type)) &&
        eYo.isF(controller.fromDom))) {
      eYo.do.tryFinally(() => {
        brick.controller_fromDom_locked = true
        out = controller.fromDom(brick, element)
      }, () => {
        delete brick.controller_fromDom_locked
        var state = element.getAttribute(eYo.xml.sTATE)
        if (state && state.toLowerCase() === eYo.xml.LOCKED) {
          brick.lock()
        }
      })
    } else {
      eYo.xml.data.fromDom(this, element)
      // read slot
      this.slotForEach(slot => slot.load(element))
      if (this instanceof eYo.expr.List) {
        eYo.do.forEachElementChild(element, child => {
          var name = child.getAttribute(eYo.xml.sLOT)
          var slot = this.getSlot(name)
          var m4t = slot && slot.magnet
          if (m4t) {
            var t9k = m4t.targetBrick
            if (t9k) {
              t9k.recover.dontResit(child)
              eYo.xml.fromDom(t9k, child)
            } else if ((t9k = eYo.xml.domToBrick(child, this))) {
              t9k.recover.dontResit(child)
              var targetM4t = t9k.out_m
              if (targetM4t && targetM4t.checkType_(m4t)) {
                targetM4t.connect(m4t)
              }
            } else {
              console.error('Xml.fromDom: Ignoring', child)
            }
          } else if (slot) {
            console.error('Missing connection')
          }
        })
        conclude = () => {
          this.changeDone() // force new type
          this.consolidateType()
          this.consolidateMagnets()
          this.consolidate() // too many consolidation !!!
        }
      }
      this.didLoad() // before the next and suite connections will connect
      // read flow and suite
      const statement = (m4t, key) => {
        if (m4t) {
          return eYo.do.SomeElementChild(element, child => {
            if ((child.getAttribute(eYo.xml.FLOW) === key)) {
              this.board[eYo.$].recover.dontResit(child)
              var brick = eYo.xml.domToBrick(child, this)
              if (brick) { // still headless!
                // we could create a brick from that child element
                // then connect it to
                var m5s = brick.magnets
                if (m5s.head) {
                  if (m4t.checkType_(m5s.head)) {
                    m4t.connect(m5s.head)
                  } else {
                    // we could not connect possibly because the
                    // type is not yet properly set
                    this.changeDone() // force new type
                    this.consolidateType()
                    this.consolidateMagnets()
                    this.consolidate()
                    if (m4t.checkType_(m5s.head)) {
                      m4t.connect(m5s.head)
                    }
                  }
                }
                return true
              }
            }
          })
        }
      }
      var out = statement(this.right_m, eYo.xml.RIGHT)
      out = statement(this.suite_m, eYo.xml.sUITE) || out
      out = statement(this.foot_m, eYo.xml.NEXT) || out
      var state = element.getAttribute(eYo.xml.sTATE)
      if (state && state.toLowerCase() === eYo.xml.LOCKED) {
        this.lock()
      }
    }
    conclude && (conclude())
    return out
  })
}

/**
 * The xml tag name of this brick, as it should appear in the saved data.
 * For edython.
 * @return !String
 */
eYo.expr.primary_p.xmlAttr = function () {
  var type = this.type
  if ([
    eYo.t3.expr.identifier_valued,
    eYo.t3.expr.identifier_annotated_valued,
    eYo.t3.expr.assignment_chain
  ].indexOf(type) >= 0) {
    return '='
  }
  if (type === eYo.t3.expr.named_expr) {
    return ':=' // 0.3
  }
  if ([
    eYo.t3.expr.parent_module,
    eYo.t3.expr.identifier_valued,
    eYo.t3.expr.dotted_name,
    eYo.t3.expr.dotted_name_as,
    eYo.t3.expr.attributeref
  ].indexOf(type) >= 0) {
    return '.' // >=v0.3, eYo.t3.expr.primary.Substring(4)
  }
  if ([
    eYo.t3.expr.named_call_expr,
    eYo.t3.expr.call_expr
  ].indexOf(type) >= 0) {
    return '…()' // >=v0.3, eYo.key.CALL
  }
  if ([
    eYo.t3.expr.named_slicing,
    eYo.t3.expr.slicing,
    eYo.t3.expr.named_subscription,
    eYo.t3.expr.subscription
  ].indexOf(type) >= 0) {
    return '…[]' // >=v0.3, eYo.t3.expr.slicing.Substring(4)
  }
  if ([
    eYo.t3.expr.identifier_annotated,
    eYo.t3.expr.augtarget_annotated,
    eYo.t3.expr.key_datum
  ].indexOf(type) >= 0) {
    return ':' // >=v0.3, eYo.t3.expr.identifier.Substring(4)
  }
  if ([
    eYo.t3.expr.identifier_as,
    eYo.t3.expr.expression_as,
    eYo.t3.expr.dotted_name_as
  ].indexOf(type) >= 0) {
    return '~' // eYo.t3.expr.identifier.Substring(4)
  }
  return '…'
}

/**
 * The xml `eyo` attribute of this brick, as it should appear in the saved data.
 * For edython.
 */
eYo.stmt.assignment_stmt_p.xmlAttr = function () {
  return this.type === eYo.t3.stmt.augmented_assignment_stmt
  ? this.Operator_p
  : this.type === eYo.t3.stmt.annotated_stmt || this.variant === eYo.key.NONE || this.variant === eYo.key.VALUED || this.variant === eYo.key.EXPRESSION
    ? 'x'
    : '='
}

/**
 * Try to create a primary brick from the given element.
 * @param {Element} element dom element to be completed.
 * @param {*} owner  The board or the parent brick.
 * @override
 */
eYo.xml.assignment.domToComplete = function (element, owner) {
  if (element.tagName.toLowerCase() === 's') {
    var prototypeName = element.getAttribute(eYo.key.EYO)
    var id = element.getAttribute('id')
    if (prototypeName === 'x') {
      var brick = eYo.brick.newReady(owner, eYo.t3.stmt.expression_stmt, id)
      return brick
    } else if (['+=', '-=', '*=', '/=', '//=', '%=', '**=', '@=', '<<=', '>>=', '&=', '^=', '|='].indexOf(prototypeName) >= 0) {
      brick = eYo.brick.newReady(owner, eYo.t3.stmt.augmented_assignment_stmt, id)
      brick.Operator_p = prototypeName
      return brick
    } else if (prototypeName === '=') {
      brick = eYo.brick.newReady(owner, eYo.t3.stmt.assignment_stmt, id)
      brick.Operator_p = prototypeName
      return brick
    }
  }
}

/**
 * Try to create a comparison brick from the given element.
 * @param {Element} element dom element to be completed.
 * @param {*} owner  The board or the parent brick.
 * @override
 */
eYo.xml.comparison.domToComplete = function (element, owner) {
  var prototypeName = element.getAttribute(eYo.key.EYO)
  var id = element.getAttribute('id')
  if (prototypeName === eYo.xml.cOMPARISON) {
    var op = element.getAttribute(eYo.xml.OPERATOR)
    var C9r, model
    var type = eYo.t3.expr.number_comparison
    if ((C9r = eYo.model.forType(type))
      && (model = C9r[eYo.$].model.data)
      && (model = model.operator)
      && model.all
      && (model.all.indexOf(op) >= 0)) {
      var b3k = eYo.brick.newReady(owner, type, id)
    } else if ((type = eYo.t3.expr.object_comparison)
      && (C9r = eYo.model.forType(type))
      && (model = C9r[eYo.$].model.data)
      && (model = model.operator)
      && model.all
      && (model.all.indexOf(op) >= 0)) {
        b3k = eYo.brick.newReady(owner, type, id)
    }
    return b3k
  }
}

/**
 * Try to create a starred brick from the given element.
 * @param {Element} element dom element to be completed.
 * @param {*} owner  The board or the parent brick.
 * @override
 */
eYo.xml.starred.domToComplete = function (element, owner) {
  var prototypeName = element.getAttribute(eYo.key.EYO)
  var id = element.getAttribute('id')
  if (prototypeName === "*") {
    var b3k = eYo.brick.newReady(owner, eYo.t3.expr.star_expr, id)
  } else if (prototypeName === "**") {
    b3k = eYo.brick.newReady(owner, eYo.t3.expr.or_expr_star_star, id)
  }
  return b3k
}

/**
 * Try to create a primary brick from the given element.
 * @param {Element} element dom element to be completed.
 * @param {*} owner  The board or the parent brick.
 * @override
 */
eYo.xml.primary.domToComplete = function (element, owner) {
  if (element.tagName.toLowerCase() === 'x') {
    var prototypeName = element.getAttribute(eYo.key.EYO)
    var t = {
      '=': eYo.t3.expr.identifier_valued,
      ':=': eYo.t3.expr.named_expr,
      '.': eYo.t3.expr.parent_module,
      '…()': eYo.t3.expr.named_call_expr,
      '…[]': eYo.t3.expr.named_subscription,
      ':': eYo.t3.expr.identifier_annotated,
      '~': eYo.t3.expr.identifier_as,
      '…': eYo.t3.expr.identifier
    } [prototypeName]
    if (t) {
      var id = element.getAttribute('id')
      return eYo.brick.newReady(owner, t, id)
    }
  }
}

// /**
//  * Reads the given element into a brick.
//  * @param {Element} element dom element to be read.
//  * @param {*} owner  The board or the parent brick.
//  * @override
//  */
// eYo.xml.group.domToComplete = function (element, owner) {
//   var attr = element.getAttribute(eYo.key.EYO)
//   if (attr === eYo.stmt.else_part.prototype.xmlAttr()) {
//     var type = eYo.t3.stmt.else_part
//     var id = element.getAttribute('id')
//     return eYo.brick.newReady(owner, type, id)
//   }
// }

/**
 * .
 * @param {Element} element dom element to be completed.
 * @param {*} owner  The board or the parent brick
 * @override
 */
eYo.xml.compatibility.domToComplete = function (element, owner) {
  var name = element.getAttribute(eYo.key.EYO)
  // deprecated since v0.3.0
  if (name === 'dict_comprehension') {
    // <x eyo="dict_comprehension" xmlns="urn:edython:0.2" xmlns: eyo="urn:edython:0.2"><x eyo="identifier" name="k" slot="key"></x><x eyo="identifier" name="d" slot="datum"></x></x>
    var id = element.getAttribute('id')
    var b3k = eYo.brick.newReady(owner, eYo.t3.expr.comprehension, id)
    if (b3k) {
      var kd = eYo.brick.newReady(owner, eYo.t3.expr.key_datum)
      // the 'key' slot
      eYo.do.forEachElementChild(element, child => {
        var name = child.getAttribute(eYo.xml.sLOT)
        if (name === 'key') {
          var dd = eYo.brick.newReady(owner, child)
          kd.target_b.connectLast(dd)
        } else if (name === 'datum') {
          dd = eYo.brick.newReady(owner, child)
          kd.annotated_s.connect(dd)
        }
      })
      b3k.expression_s.connect(kd)
      return b3k
    }
  }
}

/**
 * Reads the given element into a brick.
 * call bricks have eyo:call and tag eyo:builtin__call names
 * if there is an `eyo:slot` attribute, even a ''
 * then it is an expression brick otherwise it is a statement brick. DEPRECATED.
 * @param {Element} element dom element to be completed.
 * @param {*} owner  The board or the parent brick
 * @override
 */
eYo.xml.call.domToComplete = function (element, owner) {
  if (element.getAttribute(eYo.key.EYO) === eYo.xml.cALL) {
    var type = element.tagName.toLowerCase() === eYo.xml.EXPR
      ? eYo.t3.expr.call_expr
      : eYo.t3.stmt.call_stmt
    var id = element.getAttribute('id')
    return eYo.brick.newReady(owner, type, id)
  }
}

/**
 * Compare the bricks by comparing their xml string representation.
 * Usefull for testing.
 * For edython.
 * @param {eYo.brick.BaseC9r} lhs
 * @param {eYo.brick.BaseC9r} rhs
 * @return {Number} classical values -1, 0 or 1.
 */
eYo.xml.compareBricks = function (lhs, rhs) {
  var xmlL = eYo.xml.serialize(eYo.xml.brickToDom(lhs, {noId: true}))
  var xmlR = eYo.xml.serialize(eYo.xml.brickToDom(rhs, {noId: true}))
  return xmlL < xmlR ? -1 : (xmlL < xmlR ? 1 : 0)
}

goog.require('goog.dom.xml')
eYo.xml.srialize = goog.dom.xml.serialize