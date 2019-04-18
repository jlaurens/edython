/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview BlockSvg delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.DelegateSvg')
goog.provide('eYo.HoleFiller')

goog.require('eYo.XRE')
goog.require('eYo.T3')
goog.require('eYo.Data')
goog.require('eYo.Slot')
goog.require('eYo.Renderer')
goog.require('eYo.Where')
goog.require('eYo.Delegate')
goog.forwardDeclare('eYo.BlockSvg')
goog.forwardDeclare('eYo.DelegateSvg.Expr')
goog.forwardDeclare('eYo.DelegateSvg.Stmt')
goog.forwardDeclare('eYo.Selected')
goog.require('goog.dom')

/**
 * Class for a DelegateSvg.
 * Not normally called directly, eYo.DelegateSvg.create(...) is preferred.
 * For edython.
 */
eYo.Delegate.makeSubclass('Svg')

// Mimic Blockly naming convention
eYo.DelegateSvg = eYo.Delegate.Svg

eYo.DelegateSvg.prototype.packedQuotes = true
eYo.DelegateSvg.prototype.packedBrackets = true

Object.defineProperties(
  eYo.DelegateSvg.prototype,
  {
    workspace: {
      get () {
        return this.block_.workspace
      }
    },
    isCollapsed: {
      get () {
        return this.block_.isCollapsed()
      }
    },
    span: {
      get () {
        return this.span_
      }
    },
    renderer: {
      get () {
        return this.renderer_
      }
    }
  }
)
/**
 * Ends a mutation
 * For edython.
 * @return {Number} change level
 */
eYo.DelegateSvg.prototype.changeEnd = function () {
  var yorn = eYo.DelegateSvg.superClass_.changeEnd.call(this)
  if (!yorn) {
    this.render()
  }
  return yorn
}

eYo.DelegateSvg.Manager = eYo.Delegate.Manager

/**
 * Method to register an expression or a statement block.
 * The delegate is searched as a DelegateSvg element
 * @param{!string} key  key is the last component of the block type as a dotted name.
 */
eYo.DelegateSvg.Manager.register = function (key) {
  var prototypeName = eYo.T3.Expr[key]
  var delegateC9r, available
  if (prototypeName) {
    delegateC9r = eYo.DelegateSvg.Expr[key]
    available = eYo.T3.Expr.Available
  } else if ((prototypeName = eYo.T3.Stmt[key])) {
    // console.log('Registering statement', key)
    delegateC9r = eYo.DelegateSvg.Stmt[key]
    available = eYo.T3.Stmt.Available
  } else {
    throw new Error('Unknown block eYo.T3.Expr or eYo.T3.Stmt key: ' + key)
  }
  eYo.DelegateSvg.Manager.registerDelegate_(prototypeName, delegateC9r)
  available.push(prototypeName)
}

// TRANSITION, next is aimed to be removed
Object.defineProperties(eYo.DelegateSvg.prototype, {
  svgGroup_: {
    get () {
      return this.block_.svgGroup_
    }
  },
    /**
   * This is the contour group.
   * @type {SVGGroupElement}
   * @private
   */
  svgGroupShape_: {
    get () {
      return this.renderer.driver.groupShape_
    },
    set (newValue) {
      this.renderer.driver.groupShape_ = newValue
    }
  },
  /**
   * This is the contour group.
   * @type {SVGGroupElement}
   * @private
   */
  svgGroupContour_: {
    get () {
      return this.renderer.driver.groupContour_
    },
    set (newValue) {
      this.renderer.driver.groupContour_ = newValue
    }
  },
  /**
   * This is the shape used to draw the outline of a block
   * @type {SVGPathElement}
   * @private
   */
  svgPathShape_: {
    get () {
      return this.renderer.driver.pathShape_
    },
    set (newValue) {
      this.renderer.driver.pathShape_ = newValue
    }
  },
  /**
   * This is the shape used to draw the background of a block
   * @type {SVGPathElement}
   * @private
   */
  svgPathContour_: {
    get () {
      return this.renderer.driver.pathContour_
    },
    set (newValue) {
      this.renderer.driver.pathContour_ = newValue
    }
  },
  /**
   * This is the shape used to draw a collapsed block.
   * Background or outline ?
   * @type {SVGPathElement}
   * @private
   */
  svgPathCollapsed_: {
    get () {
      return this.renderer.driver.pathCollapsed_
    },
    set (newValue) {
      this.renderer.driver.pathCollapsed_ = newValue
    }
  },
  /**
   * This is the shape used to draw a block...
   * @type {SVGPathElement}
   * @private
   */
  svgPathInner_: {
    get () {
      return this.renderer.driver.pathInner_
    },
    set (newValue) {
      this.renderer.driver.pathInner_ = newValue
    }
  },
  /**
   * This is the shape used to draw an highlighted block contour when selected.
   * When a block is hilighted,
   * the outer line stroke width is bigger and the color is different,
   * the inner line have the same width, only the color changes.
   * In general, this is a duplicate of svgPathShape_,
   * but this is not (yet) a requiremenent
   * @type {SVGPathElement}
   * @private
   */
  svgPathSelect_: {
    get () {
      return this.renderer.driver.pathSelect_
    },
    set (newValue) {
      this.renderer.driver.pathSelect_ = newValue
    }
  },
  /**
   * This is the shape used to draw an highlighted block contour when a parent is selected.
   * @type {SVGPathElement}
   * @private
   */
  svgPathHilight_: {
    get () {
      return this.renderer.driver.pathHilight_
    },
    set (newValue) {
      this.renderer.driver.pathHilight_ = newValue
    }
  },
  /**
   * This is the shape used to draw an highlighted connection contour.
   * @type {SVGPathElement}
   * @private
   */
  svgPathConnection_: {
    get () {
      return this.renderer.driver.pathConnection_
    },
    set (newValue) {
      this.renderer.driver.pathConnection_ = newValue
    }
  }
})

/**
 * When set, used to create an input value.
 * three inputs can be created on the fly.
 * The data is an object with following properties: first, middle, last
 * each value is an object with properties
 * - key, string uniquely identify the value input. When absent, a dummy input is created
 * - label, optional string
 * - wrap, optional, the type of the block wrapped by this input
 * - check, [an array of] strings, types to check the connections. When absent, replaced by `wrap` if any.
 * - optional, true/false whether the connection is optional, only when no wrap.
 */

/**
 * Create and initialize the various paths.
 * Called once at block creation time.
 * Should not be called directly
 * The block implementation is created according to a dictionary
 * input model available through `model.slots`.
 * The structure of that dictionary is detailled in the treatment flow
 * below.
 */
eYo.DelegateSvg.prototype.init = eYo.Decorate.reentrant_method(
  'initBlockSvg',
  function () {
    this.changeWrap(
      function () {
        this.span_ = new eYo.Span(this)
        eYo.DelegateSvg.superClass_.init.call(this)
        var block = this.block_
        block.setTooltip('')
        block.setHelpUrl('')
      }
    )
  }
)

console.warn('implement async and await, see above awaitable and asyncable')
/**
 * Revert operation of init.
 */
eYo.DelegateSvg.prototype.deinit = function () {
  if (this === eYo.Selected.eyo) {
    // this block was selected, select the block below or above before deletion
    // this does not work most probably because it is the wrong place
    var t_eyo
    if ((t_eyo = this.next) || (t_eyo = this.previous) || (t_eyo = this.output)) {
      setTimeout(() => {
        t_eyo.select()
      })// broken for outputConnection ?
    }
  }
  this.renderer_ && this.renderer_.dispose() && (this.renderer_ = null)
  eYo.DelegateSvg.superClass_.deinit.call(this)
}

/**
 * Create and initialize the SVG representation of the block.
 * May be called more than once.
 */
eYo.DelegateSvg.prototype.preInitSvg = function () {
}

/**
 * Create and initialize the SVG representation of the block.
 * Called by `initSvg`.
 * May be called more than once along with `initSvg`.
 * No rendering.
 */
eYo.DelegateSvg.prototype.postInitSvg = function () {
  if (this.renderer_) {
    return
  }
  this.renderer_ = new eYo.renderer(this)
  this.eventsInit_ = true
}

/**
 * Called when the parent will just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.DelegateSvg.prototype.parentWillChange = function (newParent) {
  this.renderer.parentWillChange(newParent)
}

/**
 * Called when the parent did just change.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.DelegateSvg.prototype.parentDidChange = function (newParent) {
  eYo.DelegateSvg.superClass_.parentDidChange.call(this, newParent)
  this.renderer && this.renderer.parentDidChange(newParent)
}

/**
 * Returns the named field from a block.
 * Only fields that do not belong to an input are searched for.
 * @param {string} name The name of the field.
 * @return {Blockly.Field} Named field, or null if field does not exist.
 */
eYo.DelegateSvg.prototype.getField = function (name) {
  var fields = this.fields
  for (var key in fields) {
    var field = fields[key]
    if (field.name === name) {
      return field
    }
  }
  var slot
  if ((slot = this.headSlot)) {
    do {
      var fields = slot.fields
      for (var key in fields) {
        var field = fields[key]
        if (field.name === name) {
          return field
        }
      }
    } while ((slot = slot.next))
  }
  return null
}

/**
 * When the block is just a wrapper, returns the wrapped target.
 */
eYo.DelegateSvg.prototype.getMenuTarget = function () {
  var wrapped
  if (this.wrap && (wrapped = this.wrap.input.eyo.target)) {
    return wrapped.eyo.getMenuTarget()
  }
  if (this.wrappedC8nDlgt_ && this.wrappedC8nDlgt_.length === 1 &&
    (wrapped = this.wrappedC8nDlgt_[0].connection.targetBlock())) {
    // if there are more than one wrapped block,
    // then we choose none of them
    return wrapped.eyo.getMenuTarget()
  }
  return this.block_
}

/**
 * Render the given connection, if relevant.
 * @param {*} recorder 
 * @param {*} c8n 
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.DelegateSvg.prototype.renderDrawC8n_ = function (recorder, c8n) {
  if (!c8n) {
    return
  }
  var target = c8n.targetBlock()
  if (!target) {
    return
  }
  if (c8n.eyo.isNextLike) {
    c8n.tighten_()
  }
  var do_it = !target.rendered ||
  (!this.renderer.up &&
    !eYo.Connection.disconnectedParentC8n &&
    !eYo.Connection.disconnectedChildC8n&&
    !eYo.Connection.connectedParentC8n)
  if (do_it) {
    try {
      target.eyo.renderer.down = true
      target.eyo.render(false, recorder)
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      target.eyo.renderer.down = false
    }
    return true
  }
}

eYo.DelegateSvg.debugPrefix = ''
eYo.DelegateSvg.debugCount = {}

/**
 * Render the next block, if relevant.
 * @param {*} recorder
 * @return {boolean=} true if an rendering message was sent, false othrwise.
 */
eYo.DelegateSvg.prototype.renderDrawNext_ = function (recorder) {
  if (this.nextConnection && eYo.DelegateSvg.debugStartTrackingRender) {
    console.log(eYo.DelegateSvg.debugPrefix, 'NEXT')
  }
  return this.renderDrawC8n_(recorder, this.nextConnection)
}

/**
 * Render the right block, if relevant.
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.DelegateSvg.prototype.renderRight_ = function () {
  return
}

/**
 * Render the suite block, if relevant.
 * @return {boolean=} true if a rendering message was sent, false otherwise.
 */
eYo.DelegateSvg.prototype.renderSuite_ = function (io) {
  return
}

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {*} recorder
 * @param {boolean=} optBubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
// deleted blocks are rendered during deletion
// this should be avoided
eYo.DelegateSvg.prototype.render = function () {
  this.renderer.render()
}

/**
 * Whether the block is sealed to its parent.
 * The sealed status is decided at init time.
 * The corresponding input.eyo.connection.wrapped_ is set to true.
 * @private
 */
eYo.DelegateSvg.prototype.wrapped_ = undefined

/**
 * Fetches the named input object.
 * @param {!String} name The name of the input.
 * @param {?Boolean} dontCreate Whether the receiver should create inputs on the fly. Ignored.
 * @return {Blockly.Input} The input object, or null if input does not exist. Input that are disabled are skipped.
 */
eYo.DelegateSvg.prototype.getInput = function (name, dontCreate) {
  return this.someInput(input => input.name === name)
}

/**
 * Class for a statement block enumerator.
 * Deep first traversal.
 * Starts with the given block.
 * The returned object has next and depth messages.
 * @param {!Blockly.Block} block The root of the enumeration.
 * @constructor
 */
eYo.Delegate.prototype.statementEnumerator = function () {
  var eyo
  var eyos = [this]
  var e8r
  var e8rs = [this.inputEnumerator()]
  var next
  var me = {}
  me.next = () => {
    me.next = me.next_
    return this
  }
  me.depth = () => {
    return eyos.length
  }
  me.next_ = () => {
    while ((eyo = eyos.shift())) {
      e8r = e8rs.shift()
      while (e8r.next()) {
        if (e8r.here.type === Blockly.NEXT_STATEMENT) {
          if (e8r.here.connection && (next = e8r.here.connection.targetBlock())) {
            next = next.eyo
            eyos.unshift(eyo)
            e8rs.unshift(e8r)
            eyos.unshift(next)
            e8rs.unshift(next.inputEnumerator())
            return next
          }
        }
      }
      if ((eyo = eyo.next)) {
        eyos.unshift(eyo)
        e8rs.unshift(eyo.inputEnumerator())
        return eyo
      }
    }
  }
  return me
}

/**
 * Execute the helper for all the statements.
 * Deep first traversal.
 * @param {!Function} helper
 * @return the truthy value from the helper.
 */
eYo.Delegate.prototype.forEachStatement = function (helper) {
  var e8r = this.statementEnumerator()
  var eyo
  while ((eyo = e8r.next())) {
    helper(eyo, e8r.depth())
  }
}

/**
 * Execute the helper until one answer is a truthy value.
 * Deep first traversal.
 * @param {!Function} helper
 * @return the truthy value from the helper.
 */
eYo.Delegate.prototype.someStatement = function (helper) {
  var e8r = this.statementEnumerator()
  var eyo
  var ans
  while ((eyo = e8r.next())) {
    if ((ans = helper(eyo, e8r.depth()))) {
      return ans === true ? eyo : ans
    }
  }
}

/**
 * Class for a statement block enumerator.
 * Deep first traversal.
 * Starts with the given block.
 * The returned object has next and depth messages.
 * @param {!Blockly.Block} block The root of the enumeration.
 * @constructor
 */
eYo.StatementBlockEnumerator = function (block) {
  var b
  var bs = [block]
  var e8r
  var e8rs = [block.eyo.inputEnumerator()]
  var next
  var me = {}
  me.next = function () {
    me.next = me.next_
    return block
  }
  me.depth = function () {
    return bs.length
  }
  me.next_ = function () {
    while ((b = bs.shift())) {
      e8r = e8rs.shift()
      while (e8r.next()) {
        if (e8r.here.eyo.isNextLike) {
          if (e8r.here.connection && (next = e8r.here.connection.targetBlock())) {
            bs.unshift(b)
            e8rs.unshift(e8r)
            bs.unshift(next)
            e8rs.unshift(next.eyo.inputEnumerator())
            return next
          }
        }
      }
      if ((b = b.getNextBlock())) {
        bs.unshift(b)
        e8rs.unshift(b.eyo.inputEnumerator())
        return b
      }
    }
    return undefined
  }
  return me
}

eYo.DelegateSvg.prototype.nextStatementCheck = undefined
eYo.DelegateSvg.prototype.previousStatementCheck = undefined

/**
 * Subclassers will override this but won't call it directly,
 * except form the overriding function.
 * @private
 */
eYo.DelegateSvg.prototype.duringBlockWrapped = function () {
  eYo.DelegateSvg.superClass_.duringBlockWrapped.call(this)
  goog.asserts.assert(!this.renderer.hasSelect, 'Deselect block before')
  this.block_.initSvg() // is it necessary ?
  this.renderer.makeBlockWrapped()
}

/**
 * Creates the contour path.
 * Does nothing if this contour already exists.
 * @private
 */
eYo.DelegateSvg.prototype.duringBlockUnwrapped = function () {
  eYo.DelegateSvg.superClass_.duringBlockUnwrapped.call(this)
  this.renderer.duringBlockUnwrapped()
}

/**
 * Create a new block, with full contents.
 * This is the expected way to create a block 
 * to be displayed immediately.
 * @param {!WorkspaceSvg} workspace
 * @param {!String|Object} model  prototypeName or xml representation.
 * @param {?String} id
 * @private
 */
eYo.DelegateSvg.newBlockReady = function (workspace, model, id) {
  var B = eYo.DelegateSvg.newBlockComplete.apply(null, arguments)
  B && B.eyo.beReady()
  return B
}

/**
 * Create a new block, with svg background.
 * This is the expected way to create the block.
 * There is a caveat due to proper timing in initializing the svg.
 * Whether blocks are headless or not is not clearly designed in Blockly.
 * If the model fits an identifier, then create an identifier
 * If the model fits a number, then create a number
 * If the model fits a string literal, then create a string literal...
 * This is headless and should not render until a beReady message is sent.
 * @param {!*} owner  workspace or block
 * @param {!String|Object} model
 * @param {?String|Object} id
 * @private
 */
eYo.DelegateSvg.newBlockComplete = function (owner, model, id) {
  var workspace = owner.workspace || owner
  var processModel = (block, model, id) => {
    var dataModel = model
    if (!block) {
      if (eYo.DelegateSvg.Manager.get(model.type)) {
        block = workspace.newBlock(model.type, id)
        block.eyo.setDataWithType(model.type)
      } else if (eYo.DelegateSvg.Manager.get(model)) {
        block = workspace.newBlock(model, id) // can undo
        block.eyo.setDataWithType(model)
      } else if (goog.isString(model) || goog.isNumber(model)) {
        var p5e = eYo.T3.Profile.get(model, null)
        var f = (p5e) => {
          var b
          if (p5e.expr && (b = workspace.newBlock(p5e.expr, id))) {
            p5e.expr && b.eyo.setDataWithType(p5e.expr)
            model && b.eyo.setDataWithModel(model)
            dataModel = {data: model}
          } else if (p5e.stmt && (b = workspace.newBlock(p5e.stmt, id))) {
            p5e.stmt && b.eyo.setDataWithType(p5e.stmt)
            dataModel = {data: model}
          } else if (goog.isNumber(model)  && (b = workspace.newBlock(eYo.T3.Expr.numberliteral, id))) {
            b.eyo.setDataWithType(eYo.T3.Expr.numberliteral)
            dataModel = {data: model.toString()}
          } else {
            console.warn('No block for model:', model)
          }
          return b
        }
        if (!p5e.isVoid && !p5e.isUnset) {
          block = f(p5e)
        } else {
          console.warn('No block for model either:', model)
          return
        }
      }
    }
    block && block.eyo.changeWrap(
      function () { // `this` is `block.eyo`
        this.willLoad()
        this.setDataWithModel(dataModel)
        var Vs = model.slots
        for (var k in Vs) {
          if (eYo.Do.hasOwnProperty(Vs, k)) {
            var input = this.getInput(k)
            if (input && input.connection) {
              var target = input.eyo.target
              var V = Vs[k]
              var B = processModel(target, V)
              if (!target && B && B.outputConnection) {
                B.eyo.changeWrap(
                  () => {
                    var slot = input.connection.slot
                    slot && slot.setIncog(false)
                    B.outputConnection.connect(input.connection)
                  }
                )
              }
            }
          }
        }
        Vs = model
        this.forEachSlot(slot => {
          var input = slot.input
          if (!input || !input.connection) {
            return
          }
          k = slot.key + '_s'
          if (eYo.Do.hasOwnProperty(Vs, k)) {
            var V = Vs[k]
          } else if (Vs.slots && eYo.Do.hasOwnProperty(Vs.slots, slot.key)) {
            V = Vs.slots[slot.key]
          } else {
            return
          }
          var target = input.eyo.target
          var B = processModel(target, V)
          if (!target && B && B.outputConnection) {
            B.eyo.changeWrap(
              () => {
                // The connection can be established only when not incog
                slot.setIncog(false)
                B.outputConnection.connect(input.connection)
              }
            )
          }
        })
        // now blocks and slots have been set
        this.didLoad()
        if (block.nextConnection) {
          var nextModel = dataModel.next
          if (nextModel) {
            B = processModel(null, nextModel)
            if (B && B.previousConnection) {
              try {
                B.previousConnection.connect(block.nextConnection)
              } catch (err) {
                console.error(err)
                throw err
              } finally {
                // do nothing
              }
            }
          }
        }
      }
    )
    return block
  }
  var B = processModel(null, model, id)
  B && B.eyo.consolidate()
  return B
}

/**
 * When setup is finish.
 * The state has been created, some expected connections are created
 * This is the final step before the first rendering.
 * This is a one shot function.
 */
eYo.DelegateSvg.prototype.beReady = function () {
  this.changeWrap(
    function () {
      this.forEachData(data => data.beReady()) // data was headless
      var block = this.block_
      block.initSvg()
      // install all the fields and slots in the DOM
      Object.values(this.fields).forEach(field => {
        if (!field.sourceBlock_) {
          field.setSourceBlock(block)
          field.init()
        }
      })
      this.forEachSlot(slot => slot.beReady())
      for (var i = 0, input; (input = block.inputList[i++]);) {
        input.eyo.beReady()
      }
      this.inputSuite && this.inputSuite.eyo.beReady()
      this.inputRight && this.inputRight.eyo.beReady()
      this.nextConnection && this.nextConnection.eyo.beReady()
      var parent = block.outputConnection && block.outputConnection.targetBlock()
      if (parent && parent.eyo.svgGroupContour_) {
        goog.dom.insertChildAt(parent.eyo.svgGroupContour_, this.svgGroupContour_, 0)
        goog.dom.classlist.add(/** @type {!Element} */(this.svgGroupContour_),
          'eyo-inner')
        goog.dom.appendChild(parent.eyo.svgGroupShape_, this.svgGroupShape_)
        goog.dom.classlist.add(/** @type {!Element} */(this.svgGroupShape_),
          'eyo-inner')
      } else {
        goog.dom.insertChildAt(block.svgGroup_, this.svgGroupContour_, 0)
        goog.dom.classlist.remove(/** @type {!Element} */(this.svgGroupContour_),
          'eyo-inner')
        goog.dom.insertSiblingBefore(this.svgGroupShape_, this.svgGroupContour_)
        goog.dom.classlist.remove(/** @type {!Element} */(this.svgGroupShape_),
          'eyo-inner')
      }
      this.forEachData(data => data.synchronize()) // data is not headless
      this.beReady = eYo.Do.nothing // one shot function
    }
  )
}

Object.defineProperties(
  eYo.Delegate.prototype,
  {
    isReady: {
      get () {
        return this.beReady === eYo.Do.nothing
      }
    }
  }
)

/**
 * Returns the python type of the block.
 * This information may be displayed as the last item in the contextual menu.
 * Wrapped blocks will return the parent's answer.
 */
eYo.DelegateSvg.prototype.getPythonType = function () {
  if (this.wrapped_) {
    return this.parent.getPythonType()
  }
  return this.pythonType_
}

/**
 * Insert a parent.
 * If the block's output connection is connected,
 * connects the parent's output to it.
 * The connection cannot always establish.
 * The holes are filled.
 * @param {!Block} block
 * @param {Object} model, for subclassers
 * @return {?Blockly.Block} the created block
 */
eYo.DelegateSvg.prototype.insertParentWithModel = function (processModel) {
  goog.asserts.assert(false, 'Must be subclassed')
}

/**
 * Get the hole filler data object for the given check.
 * @param {!Array} check an array of types.
 * @param {objet} value value of the block that will fill the hole, a string for an identifier block.
 * @private
 */
eYo.HoleFiller.getData = function (check, value) {
  var data
  if (goog.isFunction(value)) {
    data = {
      filler: value
    }
  } else if (check.indexOf(eYo.T3.Expr.identifier) >= 0) {
    if (value) {
      data = {
        type: eYo.T3.Expr.identifier,
        value: value
      }
    }
  } else if (check.length === 1 && eYo.T3.All.core_expressions.indexOf(check[0]) >= 0) {
    data = {
      type: check[0],
      value: value
    }
  }
  return data
}

/**
 * Get an array of the deep connections that can be filled.
 * @param {!Block} block
 * @param {Array} holes whengiven the is the array to be filled
 * @return an array of connections, holes if given.
 */
eYo.HoleFiller.getDeepHoles = function (block, holes = undefined) {
  var H = holes || []
  var getDeepHoles = (c8n) => {
    if (c8n && c8n.eyo.isInput && ((!c8n.eyo.disabled_ && !c8n.eyo.incog_) || c8n.eyo.wrapped_)) {
      var target = c8n.targetBlock()
      if (target) {
        eYo.HoleFiller.getDeepHoles(target, H)
      } else if (c8n.eyo.hole_data) {
        H.push(c8n)
      }
    }
  }
  if (goog.isDef(block.getSourceBlock)) { // this is a connection...
    getDeepHoles(block)
  } else {
    block.eyo.forEachInputConnection((c8n) => {
      getDeepHoles(c8n)
    })
  }
  return H
}

/**
 * For each value input that is not optional and accepts an identifier,
 * create and connect an identifier block.
 * Called once at block creation time.
 * Should not be called directly
 * 
 * @param {*} workspace 
 * @param {*} holes 
 * @param {!Blockly.Block} block to be initialized..
 */
eYo.HoleFiller.fillDeepHoles = function (workspace, holes) {
  var i = 0
  eYo.Events.groupWrap(
    () => {
      for (; i < holes.length; ++i) {
        var c8n = holes[i]
        if (c8n && c8n.eyo.isInput && !c8n.isConnected()) {
          var data = c8n.eyo.hole_data
          if (data) {
            try {
              if (data.filler) {
                var B = data.filler(workspace)
              } else {
                B = eYo.DelegateSvg.newBlockReady(workspace, data.type)
                if (data.value) {
                  (B.eyo.phantom_d && B.eyo.phantom_d.set(data.value)) ||
                  (B.eyo.value_d && B.eyo.value_d.set(data.value))
                }
                B.render()
              }
              c8n.connect(B.outputConnection)
            } catch (err) {
              console.log(err.message)
            }
          }
        }
      }
    }
  )
}

/**
 * Returns the coordinates of a bounding rect describing the dimensions of this
 * block.
 * As the shape is not the same comparing to Blockly's default,
 * the bounding rect changes too.
 * Coordinate system: workspace coordinates.
 * @return {!goog.math.Rect}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
eYo.DelegateSvg.prototype.getBoundingRect = function () {
  return goog.math.Rect.createFromPositionAndSize(
    this.block_.getRelativeToSurfaceXY(),
    this.block_.getHeightWidth()
  )
}

/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * block.
 * As the shape is not the same comparing to Blockly's default,
 * the bounding box changes too.
 * Coordinate system: workspace coordinates.
 * @return {!goog.math.Box}
 *    Object with top left and bottom right coordinates of the bounding box.
 */
eYo.DelegateSvg.prototype.getBoundingBox = function () {
  return this.getBoundingRect().toBox()
}

/**
 * Insert a block of the given type.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {Object|string} model
 * @return {?Blockly.Block} the block that was inserted
 */
eYo.DelegateSvg.prototype.insertBlockWithModel = function (model, connection) {
  if (!model) {
    return null
  }
  var block = this.block_
  // get the type:
  var p5e = eYo.T3.Profile.get(model, null)
  if (!p5e.isVoid && !p5e.isUnset) {
    if (connection) {
      if (connection.eyo.isNextLike || connection.eyo.isPrevious) {
        p5e.stmt && (model = {
          type: p5e.stmt,
          data: model
        })
      } else {
        p5e.expr && (model = {
          type: p5e.expr,
          data: model
        })
      }
    }
  }
  // create a block out of the undo mechanism
  var candidate
  eYo.Events.disableWrap(
    () => {
      var c8n, otherC8n
      candidate = eYo.DelegateSvg.newBlockReady(block.workspace, model)
      var fin = (prepare) => {
        eYo.Events.groupWrap(() => {
          eYo.Events.enableWrap(() => {
            eYo.Do.tryFinally(() => {
              eYo.Events.fireBlockCreate(candidate)
              prepare && prepare()
              otherC8n.connect(c8n)
            }, () => {
              candidate.eyo.render()
              candidate.select()
              candidate.bumpNeighbours_()
            })
          })
        })
        return candidate
      }
      if (!candidate) {
        // very special management for tuple input
        if ((otherC8n = eYo.Selected.connection) && goog.isString(model)) {
          var otherSource = otherC8n.getSourceBlock()
          if (otherSource.eyo instanceof eYo.DelegateSvg.List && otherC8n.eyo.isInput) {
            eYo.Events.groupWrap(() => {
              var blocks = model.split(',').map(x => {
                var model = x.trim()
                var p5e = eYo.T3.Profile.get(model, null)
                console.warn('MODEL:', model)
                console.warn('PROFILE:', p5e)
                return {
                  model,
                  p5e
                }
              }).filter(({p5e}) => !p5e.isVoid && !p5e.isUnset).map(x => {
                var b = eYo.DelegateSvg.newBlockReady(block.workspace, x.model)
                b.eyo.setDataWithModel(x.model)
                console.error('BLOCK', b)
                return b
              })
              blocks.some(b => {
                candidate = b
                if ((c8n = candidate.outputConnection) && c8n.checkType_(otherC8n)) {
                  fin()
                  var next = false
                  otherSource.eyo.someInputConnection(c8n => {
                    if (next) {
                      otherC8n = c8n
                      return true
                    } else if (c8n === otherC8n) {
                      next = true
                    }
                  })
                }
              })
              eYo.Selected.connection = otherC8n
            })
          }
        }
        return
      }
      if ((otherC8n = eYo.Selected.connection)) {
        otherSource = otherC8n.getSourceBlock()
        if (otherC8n.eyo.isInput) {
          if ((c8n = candidate.outputConnection) && c8n.checkType_(otherC8n)) {
            return fin()
          }
        } else if (otherC8n.eyo.isPrevious) {
          if ((c8n = candidate.nextConnection) && c8n.checkType_(otherC8n)) {
            var targetC8n = otherC8n.targetConnection
            if (targetC8n && candidate.previousConnection &&
              targetC8n.checkType_(candidate.previousConnection)) {
              return fin(() => {
                targetC8n.connect(candidate.previousConnection)
              })
            } else {
              return fin(() => {
                var its_xy = block.getRelativeToSurfaceXY()
                var my_xy = candidate.getRelativeToSurfaceXY()
                var HW = candidate.getHeightWidth()
                candidate.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y - HW.height)
              })
            }
            // unreachable code
          }
        } else if (otherC8n.eyo.isNextLike) {
          if ((c8n = candidate.previousConnection) && c8n.checkType_(otherC8n)) {
            if ((targetC8n = otherC8n.targetConnection) && candidate.nextConnection &&
              targetC8n.checkType_(candidate.nextConnection)) {
              return fin(() => {
                targetC8n.connect(candidate.nextConnection)
              })
            } else {
              return fin()
            }
          }
        }
      }
      var c8n_N = model.input
      if ((c8n = candidate.outputConnection)) {
        // try to find a free connection in a block
        // When not undefined, the returned connection can connect to c8n.
        var findC8n = (block) => {
          var otherC8n, target
          otherC8n = block.eyo.someInputConnection((foundC8n) => {
            if (foundC8n.eyo.isInput) {
              if ((target = foundC8n.targetBlock())) {
                if (!(foundC8n = findC8n(target))) {
                  return
                }
              } else if (!c8n.checkType_(foundC8n)) {
                return
              } else if (foundC8n.eyo.bindField) {
                return
              }
              if (!foundC8n.eyo.disabled_ && !foundC8n.eyo.s7r_ && (!c8n_N || foundC8n.eyo.name_ === c8n_N)) {
                // we have found a connection
                // which s not a separator and
                // with the expected name
                return foundC8n
              }
              // if there is no connection with the expected name,
              // then remember this connection and continue the loop
              // We remember the last separator connection
              // of the first which is not a separator
              if (!otherC8n || (!otherC8n.eyo.disabled_ && otherC8n.eyo.s7r_)) {
                otherC8n = foundC8n
              }
            }
          })
          return otherC8n
        }
        if ((otherC8n = findC8n(block))) {
          return fin()
        }
      }
      if ((c8n = candidate.previousConnection)) {
        if ((otherC8n = this.nextConnection) && c8n.checkType_(otherC8n)) {
          return fin(() => {
            if ((targetC8n = otherC8n.targetConnection)) {
              // connected to something, beware of orphans
              otherC8n.disconnect()
              if (candidate.nextConnection && candidate.nextConnection.checkType_(targetC8n)) {
                candidate.nextConnection.connect(targetC8n)
                targetC8n = null
              }
            }
            c8n.connect(otherC8n)
            if (targetC8n) {
              targetC8n.getSourceBlock().bumpNeighbours_()
            }
          })
        }
      }
      if ((c8n = candidate.nextConnection)) {
        if ((otherC8n = block.previousConnection) && c8n.checkType_(otherC8n)) {
          if ((targetC8n = otherC8n.targetConnection) && candidate.previousConnection && candidate.previousConnection.checkType_(targetC8n)) {
            return fin(() => {
              candidate.previousConnection.connect(targetC8n)
            })
          } else {
            return fin(() => {
              var its_xy = block.getRelativeToSurfaceXY()
              var my_xy = candidate.getRelativeToSurfaceXY()
              var HW = candidate.getHeightWidth()
              candidate.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y - HW.height)
            })
          }
        }
      }
      candidate.dispose(true)
      candidate = null
    }
  )
  return candidate
}
console.warn('Use eYo.Events.setGroup(...)')
/**
 * Whether the given block can lock.
 * For edython.
 * @return boolean
 */
eYo.DelegateSvg.prototype.canLock = function () {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var c8n, target
  return !this.someInput(input => {
    if ((c8n = input.connection) && !c8n.eyo.disabled_) {
      if ((target = c8n.targetBlock())) {
        if (!target.eyo.canLock()) {
          return true
        }
      } else if (!c8n.eyo.optional_ && !c8n.eyo.s7r_) {
        return true
      }
    }
  })
}
/**
 * Whether the given block can unlock.
 * For edython.
 * @return {boolean}, true only if there is something to unlock
 */
eYo.DelegateSvg.prototype.canUnlock = function () {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var c8n, target
  return this.someInput(input => {
    if ((c8n = input.connection)) {
      if ((target = c8n.targetBlock())) {
        if (target.eyo.canUnlock()) {
          return true
        }
      }
    }
  })
}

/**
 * Lock the given block.
 * For edython.
 * @return {number} the number of blocks locked
 */
eYo.DelegateSvg.prototype.lock = function () {
  var ans = 0
  if (this.locked_ || !this.canLock()) {
    return ans
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
      this.block_, eYo.Const.Event.locked, null, this.locked_, true))
  }
  this.locked_ = true
  if (this === eYo.Selected.eyo) {
    eYo.Selected.connection = null
  }
  // list all the input for connections with a target
  var c8n
  var t_eyo
  this.forEachInput(input => {
    if ((c8n = input.connection)) {
      if ((t_eyo = c8n.eyo.t_eyo)) {
        ans += t_eyo.lock()
      }
      if (c8n.eyo.isInput) {
        c8n.setHidden(true)
      }
    }
  })
  // maybe redundant calls here
  this.forEachSlot(slot => {
    if (slot.input && (c8n = slot.input.connection)) {
      if ((t_eyo = c8n.eyo.t_eyo)) {
        ans += t_eyo.lock()
      }
      if (c8n.eyo.isInput) {
        c8n.setHidden(true)
      }      
    }
  })
  if ((c8n = this.nextConnection)) {
    if ((t_eyo = c8n.eyo.t_eyo)) {
      ans += t_eyo.lock()
    }
  }
  if (this === eYo.Selected.eyo) {
    var parent = this
    while ((parent = parent.surround)) {
      if (!parent.wrapped_ && !parent.locked_) {
        parent.select()
        break
      }
    }
  }
  (this.surround || this).render()
  return ans
}
/**
 * Unlock the given block.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} deep Whether to unlock statements too.
 * @return {number} the number of blocks unlocked
 */
eYo.DelegateSvg.prototype.unlock = function (shallow) {
  var block = this.block_
  var ans = 0
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
      this.block_, eYo.Const.Event.locked, null, this.locked_, false))
  }
  this.locked_ = false
  // list all the input for connections with a target
  var c8n, t_eyo
  this.forEachInput(input => {
    if ((c8n = input.connection)) {
      if ((!shallow || c8n.eyo.isInput) && (t_eyo = c8n.eyo.t_eyo)) {
        ans += t_eyo.unlock(shallow)
      }
      c8n.setHidden(false)
    }
  })
  if (!shallow && (c8n = block.nextConnection)) {
    if ((t_eyo = c8n.eyo.t_eyo)) {
      ans += t_eyo.unlock()
    }
  }
  (this.surround || this).render()
  return ans
}

/**
 * Whether the block of the receiver is in the visible area.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return {boolean}
 */
eYo.DelegateSvg.prototype.inVisibleArea = function () {
  var area = this.getDistanceFromVisible()
  return area && !area.x && !area.y
}
console.error('viewRect must go to the renderer')

Object.defineProperties(
  eYo.DelegateSvg.prototype,
  {
    /**
     * Get the visible block area.
     * This is the intersection of the block rectangle
     * and the workspace view rect.
     * For edython.
     * @property {?eYo.Rect}
     */
    viewRect: {
      get () {
        var block = this.block_
        var workspace = block.workspace
        if (!workspace) {
          return undefined
        }
        // Workspace scale, used to convert from workspace coordinates to pixels.
        var scale = workspace.scale;
        // XY is in workspace coordinates.
        var xy = block.getRelativeToSurfaceXY();
        // Height/width is in workspace units.
        var heightWidth = block.getHeightWidth();
        var metrics = workspace.getMetrics()
        return new goog.math.Rect(
          xy.x * scale - metrics.viewLeft,
          xy.y * scale - metrics.viewTop,
          heightWidth.width * scale,
          heightWidth.height * scale
        )
      }
    },
    /**
     * Get the visible block area.
     * This is the intersection of the block rectangle
     * and the workspace view rect.
     * For edython.
     * @property {?eYo.Rect}
     */
    visibleRect: {
      get () {
        var block = this.block_
        var workspace = block.workspace
        if (!workspace) {
          return undefined
        }
        var metrics = workspace.getMetrics()
        var a = new goog.math.Rect(
          0,
          0,
          metrics.viewWidth,
          metrics.viewHeight
        )
        // Workspace scale, used to convert from workspace coordinates to pixels.
        var scale = workspace.scale;
        // XY is in workspace coordinates.
        var xy = block.getRelativeToSurfaceXY();
        // Height/width is in workspace units.
        var heightWidth = block.getHeightWidth();
        var b = new goog.math.Rect(
          xy.x * scale - metrics.viewLeft,
          xy.y * scale - metrics.viewTop,
          heightWidth.width * scale,
          heightWidth.height * scale
        )
        return eYo.Rect.intersection(a, b)  
      }
    }
  }
)

/**
 * Get the position of receiver's block relative to
 * the visible area.
 * Return value: if `x < 0`, left of the visible area,
 * if `x > 0`, right of the visible area, 0 otherwise.
 * undefined when the block is not in a workspace.
 * The same holds for `y`.
 * The values are the signed distances between the center
 * of the block and the visible area.
 * If the answer is `{x: -15, y: 0}`, we just have to scroll the workspace
 * 15 units to the right and the block is visible.
 * For edython.
 * @param {!Object} newLoc The owner of the receiver.
 * @return {{x: number, y: number}|undefined}
 */
eYo.DelegateSvg.prototype.getDistanceFromVisible = function (newLoc) {
  var block = this.block_
  var workspace = block.workspace
  if (!workspace) {
    return undefined
  }
  // is the block in the visible area ?
  var metrics = workspace.getMetrics()
  if (!metrics) {
    // sometimes undefined is returned
    metrics = workspace.getMetrics() // break here to debug
    return {
      x: 0,
      y: 0
    }
  }
  var scale = workspace.scale || 1
  var heightWidth = block.getHeightWidth()
  // the block is in the visible area if we see its center
  var leftBound = metrics.viewLeft / scale - heightWidth.width / 2
  var topBound = metrics.viewTop / scale - heightWidth.height / 2
  var rightBound = (metrics.viewLeft + metrics.viewWidth) / scale - heightWidth.width / 2
  var downBound = (metrics.viewTop + metrics.viewHeight) / scale - heightWidth.height / 2
  var xy = newLoc || block.getRelativeToSurfaceXY()
  return {
    x: xy.x < leftBound? xy.x - leftBound: (xy.x > rightBound? xy.x - rightBound: 0),
    y: xy.y < topBound? xy.y - topBound: (xy.y > downBound? xy.y - downBound: 0),
  }
}

/**
 * Whether the block of the receiver is in the visible area.
 * For edython.
 * @param {*} dx 
 * @param {*} dy 
 * @return {boolean}
 */
eYo.DelegateSvg.prototype.setOffset = function (dc, dl) {
  // Workspace coordinates.
  var block = this.block_
  if (!this.svgGroupShape_) {
    throw 'block is not inited '+this.type
  }
  var dx = dc * eYo.Unit.x
  var dy = dl * eYo.Unit.y
  var xy = Blockly.utils.getRelativeXY(block.getSvgRoot());
  var transform = 'translate(' + (xy.x + dx) + ',' + (xy.y + dy) + ')';
  block.getSvgRoot().setAttribute('transform', transform);
  this.svgGroupShape_.setAttribute('transform', transform);
  this.svgGroupContour_.setAttribute('transform', transform);
  block.moveConnections_(dx, dy);
}
eYo.DelegateSvg.prototype.setOffset = function (dx, dy) {
  // Workspace coordinates.
  var block = this.block_
  if (!this.svgGroupShape_) {
    throw 'block is not inited '+this.type
  }
  var xy = Blockly.utils.getRelativeXY(block.getSvgRoot());
  var transform = 'translate(' + (xy.x + dx) + ',' + (xy.y + dy) + ')';
  block.getSvgRoot().setAttribute('transform', transform);
  var xy1 = Blockly.utils.getRelativeXY(this.svgGroupShape_);
  this.svgGroupShape_.setAttribute('transform', transform);
  var xy2 = Blockly.utils.getRelativeXY(this.svgGroupContour_);
  this.svgGroupContour_.setAttribute('transform', transform);
  if (xy1.x !== xy2.x || xy1.y !== xy2.y) {
    console.error('WEIRD A', xy1, xy2)
  }
  if ((xy.x !== xy1.x || xy.y !== xy1.y) && (xy1.x || xy1.y)) {
    console.error('WEIRD B', xy, xy1)
  }
  block.moveConnections_(dx, dy);
}

/**
 * Renders the block when connections are no longer hidden.
 * @param {boolean} hidden True to hide connections.
 */
eYo.DelegateSvg.prototype.setConnectionsHidden = function (hidden) {
  var block = this.block_
  if (this.connectionsHidden_ === hidden) {
    return
  }
  this.connectionsHidden_ = hidden
  if (hidden) {
    if (eYo.DelegateSvg.debugStartTrackingRender) {
      console.log('HIDE', block.id, block.type)
    }
  } else {
    // eYo.DelegateSvg.debugStartTrackingRender = true
    // console.log('SHOW CONNECTIONS', block.id, block.type)
    block.rendered || block.render()
  }
}

/**
 * Execute the handler with block rendering deferred to the end, if any.
 * handler
 * @param {!Function} handler `this` is the receiver.
 * @param {!Function} err_handler `this` is the receiver, one argument: the error catched.
 */
eYo.DelegateSvg.prototype.doAndRender = function (handler, group, err_handler) {
  var block = this.block_
  return function (event) {
    block.eyo.changeBegin()
    group && eYo.Events.setGroup(true)
    try {
      handler.call(block.eyo, event)
    } catch (err) {
      err_handler && err_handler.call(block.eyo, err) || console.error(err)
      throw err
    } finally {
      group && eYo.Events.setGroup(false)
      block.eyo.changeEnd()
    }
  }
}

/**
 * Move a block by a relative offset.
 * @param {number} dx Horizontal offset in character units.
 * @param {number} dy Vertical offset in character units.
 */
eYo.DelegateSvg.prototype.moveBy = function(dx, dy) {
  this.block_.moveBy(dx * eYo.Unit.x, dy * eYo.Unit.y)
}

console.error('TODO: this.block_.select -> this.select()')
/**
 * Select the block.
 */
eYo.DelegateSvg.prototype.select = function() {
  this.block_.select()
}
