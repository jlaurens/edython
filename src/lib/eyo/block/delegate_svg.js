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

goog.require('eYo.XRE')
goog.require('eYo.T3')
goog.require('eYo.Data')
goog.require('eYo.Slot')
goog.require('eYo.UI')
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
    isCollapsed: {
      get () {
        return this.block_.isCollapsed()
      }
    },
    ui: {
      get () {
        return this.ui_
      }
    },
    uiHasSelect: {
      get () {
        return this.ui && this.ui.hasSelect
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
      return this.ui.driver.groupShape_
    },
    set (newValue) {
      this.ui.driver.groupShape_ = newValue
    }
  },
  /**
   * This is the contour group.
   * @type {SVGGroupElement}
   * @private
   */
  svgGroupContour_: {
    get () {
      return this.ui.driver.groupContour_
    },
    set (newValue) {
      this.ui.driver.groupContour_ = newValue
    }
  },
  /**
   * This is the shape used to draw the outline of a block
   * @type {SVGPathElement}
   * @private
   */
  svgPathShape_: {
    get () {
      return this.ui.driver.pathShape_
    },
    set (newValue) {
      this.ui.driver.pathShape_ = newValue
    }
  },
  /**
   * This is the shape used to draw the background of a block
   * @type {SVGPathElement}
   * @private
   */
  svgPathContour_: {
    get () {
      return this.ui.driver.pathContour_
    },
    set (newValue) {
      this.ui.driver.pathContour_ = newValue
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
      return this.ui.driver.pathCollapsed_
    },
    set (newValue) {
      this.ui.driver.pathCollapsed_ = newValue
    }
  },
  /**
   * This is the shape used to draw a block...
   * @type {SVGPathElement}
   * @private
   */
  svgPathInner_: {
    get () {
      return this.ui.driver.pathInner_
    },
    set (newValue) {
      this.ui.driver.pathInner_ = newValue
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
      return this.ui.driver.pathSelect_
    },
    set (newValue) {
      this.ui.driver.pathSelect_ = newValue
    }
  },
  /**
   * This is the shape used to draw an highlighted block contour when a parent is selected.
   * @type {SVGPathElement}
   * @private
   */
  svgPathHilight_: {
    get () {
      return this.ui.driver.pathHilight_
    },
    set (newValue) {
      this.ui.driver.pathHilight_ = newValue
    }
  },
  /**
   * This is the shape used to draw an highlighted connection contour.
   * @type {SVGPathElement}
   * @private
   */
  svgPathConnection_: {
    get () {
      return this.ui.driver.pathConnection_
    },
    set (newValue) {
      this.ui.driver.pathConnection_ = newValue
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
        eYo.DelegateSvg.superClass_.init.call(this)
        var block = this.block_
        block.setTooltip('')
        block.setHelpUrl('')
        if (this.workspace.rendered) {
          this.beReady()
        }
      }
    )
  }
)

/**
 * Revert operation of init.
 */
eYo.DelegateSvg.prototype.deinit = function () {
  if (this === eYo.Selected.eyo) {
    // this block was selected, select the block below or above before deletion
    // this does not work most probably because it is the wrong place
    var t_eyo
    if ((t_eyo = this.foot) || (t_eyo = this.head) || (t_eyo = this.output)) {
      setTimeout(() => {
        eYo.Selected.eyo = t_eyo
      })// broken for output magnet ?
    }
  }
  this.ui_ && this.ui_.dispose() && (this.ui_ = null)
  eYo.DelegateSvg.superClass_.deinit.call(this)
}

/**
 * Called when the parent will just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.DelegateSvg.prototype.parentWillChange = function (newParent) {
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
  if ((slot = this.slotAtHead)) {
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
  (!this.ui.up &&
    !eYo.Magnet.disconnectedParent &&
    !eYo.Magnet.disconnectedChild&&
    !eYo.Magnet.connectedParent)
  if (do_it) {
    try {
      target.eyo.ui.down = true
      target.eyo.render(false, recorder)
    } catch (err) {
      console.error(err)
      throw err
    } finally {
      target.eyo.ui.down = false
    }
    return true
  }
}

eYo.DelegateSvg.debugPrefix = ''
eYo.DelegateSvg.debugCount = {}

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 */
// deleted blocks are rendered during deletion
// this should be avoided
eYo.DelegateSvg.prototype.render = eYo.Do.nothing

/**
 * Render the block. Real function.
 */
eYo.DelegateSvg.prototype.render_ = function () {
  this.ui.render()
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
      if ((eyo = eyo.foot)) {
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
  goog.asserts.assert(!this.uiHasSelect, 'Deselect block before')
  this.ui && this.ui.updateBlockWrapped()
}

/**
 * Creates the contour path.
 * Does nothing if this contour already exists.
 * @private
 */
eYo.DelegateSvg.prototype.duringBlockUnwrapped = function () {
  eYo.DelegateSvg.superClass_.duringBlockUnwrapped.call(this)
  this.ui && this.ui.updateBlockWrapped()
}

/**
 * Create a new delegate, with svg background.
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
eYo.DelegateSvg.newReady = function (owner, model, id) {
  var dlgt = eYo.DelegateSvg.newComplete.apply(null, arguments)
  dlgt && dlgt.beReady()
  return dlgt
}

/**
 * Create a new Dlgt, with no ui.
 * This is the expected way to create the Dlgt.
 * If the model fits an identifier, then create an identifier
 * If the model fits a number, then create a number
 * If the model fits a string literal, then create a string literal...
 * This is headless and should not render until a beReady message is sent.
 * @param {!*} owner  workspace or dlgt
 * @param {!String|Object} model
 * @param {?String|Object} id
 * @param {?eYo.Delegate} id
 */
eYo.DelegateSvg.newComplete = (() => {
  var processModel = (workspace, model, id, eyo) => {
    var dataModel = model
    if (!eyo) {
      if (eYo.DelegateSvg.Manager.get(model.type)) {
        eyo = workspace.newDlgt(model.type, id)
        eyo.setDataWithType(model.type)
      } else if (eYo.DelegateSvg.Manager.get(model)) {
        eyo = workspace.newDlgt(model, id) // can undo
        eyo.setDataWithType(model)
      } else if (goog.isString(model) || goog.isNumber(model)) {
        var p5e = eYo.T3.Profile.get(model, null)
        var f = p5e => {
          var dlgt
          if (p5e.expr && (dlgt = workspace.newDlgt(p5e.expr, id))) {
            p5e.expr && dlgt.setDataWithType(p5e.expr)
            model && dlgt.setDataWithModel(model)
            dataModel = {data: model}
          } else if (p5e.stmt && (dlgt = workspace.newDlgt(p5e.stmt, id))) {
            p5e.stmt && dlgt.setDataWithType(p5e.stmt)
            dataModel = {data: model}
          } else if (goog.isNumber(model)  && (dlgt = workspace.newDlgt(eYo.T3.Expr.numberliteral, id))) {
            dlgt.setDataWithType(eYo.T3.Expr.numberliteral)
            dataModel = {data: model.toString()}
          } else {
            console.warn('No block for model:', model)
          }
          return dlgt
        }
        if (!p5e.isVoid && !p5e.isUnset) {
          eyo = f(p5e)
        } else {
          console.warn('No block for model either:', model)
          return
        }
      }
    }
    eyo && eyo.changeWrap(
      function () { // `this` is `eyo`
        this.willLoad()
        this.setDataWithModel(dataModel)
        var Vs = model.slots
        for (var k in Vs) {
          if (eYo.Do.hasOwnProperty(Vs, k)) {
            var input = this.getInput(k)
            if (input && input.connection) {
              var t_eyo = input.eyo.t_eyo
              var V = Vs[k]
              var dlgt = processModel(workspace, V, null, t_eyo)
              if (!t_eyo && dlgt && dlgt.magnets.output) {
                dlgt.changeWrap(
                  () => {
                    var slot = input.eyo.magnet.slot
                    slot && slot.setIncog(false)
                    dlgt.magnets.output.connect(input.eyo.magnet)
                  }
                )
              }
            }
          }
        }
        Vs = model
        this.forEachSlot(slot => {
          var input = slot.input
          if (!input || !input.eyo.magnet) {
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
          var t_eyo = input.eyo.magnet.t_eyo
          var y = processModel(workspace, V, null, t_eyo)
          if (!t_eyo && y && y.magnets.output) {
            y.changeWrap(
              () => {
                // The connection can be established only when not incog
                slot.setIncog(false)
                y.magnets.output.connect(input.eyo.magnet)
              }
            )
          }
        })
        // now blocks and slots have been set
        this.didLoad()
        if (eyo.magnets.foot) {
          var nextModel = dataModel.next
          if (nextModel) {
            dlgt = processModel(workspace, nextModel)
            if (dlgt && dlgt.magnets.head) {
              try {
                dlgt.magnets.head.connectSmart(eyo)
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
    return eyo
  }
  return function (owner, model, id) {
    var workspace = owner.workspace || owner
    var eyo = processModel(workspace, model, id)
    if (eyo) {
      eyo.consolidate()
      eyo.beReady(owner.isReady || workspace.rendered)
    }
    return eyo
  }
})()

/**
 * When setup is finish.
 * The state has been created, some expected connections are created
 * This is a one shot function.
 * @param {boolean} headless  no op when false
 */
eYo.DelegateSvg.prototype.beReady = function (headless) {
  if (headless === false || !this.workspace) {
    return
  }
  this.changeWrap(
    function () {
      this.beReady = eYo.Do.nothing // one shot function
      this.eventsInit_ = true
      this.ui_ = new eYo.UI(this)
      this.forEachField(field => field.eyo.beReady())
      this.forEachSlot(slot => slot.beReady())
      this.inputList.forEach(input => {
        input.eyo.beReady()
      })
      ;[this.magnets.suite,
        this.magnets.right,
        this.magnets.foot
      ].forEach(m => m && m.beReady())
      this.forEachData(data => data.synchronize()) // data is no longer headless
      this.render = eYo.DelegateSvg.prototype.render_
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
    this.ui.xyInSurface,
    this.ui.getHeightWidth()
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
 * @param {Object|string} model
 * @param {eYo.Magnet} m4t
 * @return {?Blockly.Block} the block that was inserted
 */
eYo.DelegateSvg.prototype.insertBlockWithModel = function (model, m4t) {
  if (!model) {
    return null
  }
  // get the type:
  var p5e = eYo.T3.Profile.get(model, null)
  if (!p5e.isVoid && !p5e.isUnset) {
    if (m4t) {
      if (m4t.isHead || m4t.isLeft || m4t.isRight || m4t.isSuite || m4t.isFoot) {
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
      var m4t, otherM4t
      candidate = eYo.DelegateSvg.newComplete(this, model)
      var fin = prepare => {
        eYo.Events.groupWrap(() => {
          eYo.Events.enableWrap(() => {
            eYo.Do.tryFinally(() => {
              eYo.Events.fireBlockCreate(candidate)
              prepare && prepare()
              otherM4t.connect(m4t)
            }, () => {
              eYo.Selected.eyo = candidate
              candidate.render()
              candidate.bumpNeighbours_()
            })
          })
        })
        return candidate
      }
      if (!candidate) {
        // very special management for tuple input
        if ((otherM4t = eYo.Selected.magnet) && goog.isString(model)) {
          var otherDlgt = otherM4t.b_eyo
          if (otherDlgt instanceof eYo.DelegateSvg.List && otherM4t.eyo.isInput) {
            eYo.Events.groupWrap(() => {
              var dlgts = model.split(',').map(x => {
                var model = x.trim()
                var p5e = eYo.T3.Profile.get(model, null)
                console.warn('MODEL:', model)
                console.warn('PROFILE:', p5e)
                return {
                  model,
                  p5e
                }
              }).filter(({p5e}) => !p5e.isVoid && !p5e.isUnset).map(x => {
                var eyo = eYo.DelegateSvg.newComplete(this, x.model)
                eyo.setDataWithModel(x.model)
                console.error('DLGT', eyo)
                return eyo
              })
              dlgts.some(eyo => {
                candidate = eyo
                if ((m4t = candidate.magnets.output) && m4t.checkType_(otherM4t)) {
                  fin()
                  var next = false
                  otherDlgt.someInputMagnet(m4t => {
                    if (next) {
                      otherM4t = m4t
                      return true
                    } else if (m4t === otherM4t) {
                      next = true
                    }
                  })
                }
              })
              eYo.Selected.magnet = otherM4t
            })
          }
        }
        return
      }
      if ((otherM4t = eYo.Selected.magnet)) {
        otherDlgt = otherM4t.b_eyo
        if (otherM4t.isInput) {
          if ((m4t = candidate.magnets.output) && m4t.checkType_(otherM4t)) {
            return fin()
          }
        } else if (otherM4t.isHead) {
          if ((m4t = candidate.magnets.foot) && m4t.checkType_(otherM4t)) {
            var targetM4t = otherM4t.target
            if (targetM4t && candidate.magnets.head &&
              targetM4t.checkType_(candidate.magnets.head)) {
              return fin(() => {
                targetM4t.connect(candidate.magnets.head)
              })
            } else {
              return fin(() => {
                var its_xy = this.ui.xyInSurface
                var my_xy = candidate.ui.xyInSurface
                var HW = candidate.ui.getHeightWidth()
                candidate.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y - HW.height)
              })
            }
            // unreachable code
          }
        } else if (otherM4t.isSuite || otherM4t.isFoot) {
          if ((m4t = candidate.magnets.head) && m4t.checkType_(otherM4t)) {
            if ((targetM4t = otherM4t.target) && candidate.magnets.foot &&
            targetM4t.checkType_(candidate.magnets.foot)) {
              return fin(() => {
                targetM4t.connect(candidate.magnets.foot)
              })
            } else {
              return fin()
            }
          }
        }
      }
      var c8n_N = model.input
      if ((m4t = candidate.magnets.output)) {
        // try to find a free magnet in a block
        // When not undefined, the returned magnet can connect to m4t.
        var findM4t = eyo => {
          var otherM4t, t_eyo
          otherM4t = eyo.someInputMagnet(foundM4t => {
            if (foundM4t.isInput) {
              if ((t_eyo = foundM4t.t_eyo)) {
                if (!(foundM4t = findM4t(t_eyo))) {
                  return
                }
              } else if (!m4t.checkType_(foundM4t)) {
                return
              } else if (foundM4t.bindField) {
                return
              }
              if (!foundM4t.disabled_ && !foundM4t.s7r_ && (!c8n_N || foundM4t.name_ === c8n_N)) {
                // we have found a connection
                // which s not a separator and
                // with the expected name
                return foundM4t
              }
              // if there is no connection with the expected name,
              // then remember this connection and continue the loop
              // We remember the last separator connection
              // of the first which is not a separator
              if (!otherM4t || (!otherM4t.eyo.disabled_ && otherM4t.eyo.s7r_)) {
                otherM4t = foundC8n
              }
            }
          })
          return otherM4t
        }
        if ((otherM4t = findM4t(this))) {
          return fin()
        }
      }
      if ((m4t = candidate.magnets.head)) {
        if ((otherM4t = this.magnets.foot) && m4t.checkType_(otherM4t)) {
          return fin(() => {
            if ((targetM4t = otherM4t.target)) {
              // connected to something, beware of orphans
              otherM4t.disconnect()
              if (candidate.magnets.foot && candidate.magnets.foot.checkType_(targetM4t)) {
                candidate.magnets.foot.connect(targetM4t)
                targetM4t = null
              }
            }
            m4t.connect(otherM4t)
            if (targetM4t) {
              targetM4t.b_eyo.bumpNeighbours_()
            }
          })
        }
      }
      if ((m4t = candidate.magnets.foot)) {
        if ((otherM4t = this.magnets.head) && m4t.checkType_(otherM4t)) {
          if ((targetM4t = otherM4t.target) && (otherM4t = candidate.magnets.head) && candidate.magnets.head.checkType_(targetM4t)) {
            return fin(() => {
              otherM4t.connect(targetM4t)
            })
          } else {
            return fin(() => {
              var its_xy = this.ui.xyInSurface
              var my_xy = candidate.eyo.ui.xyInSurface
              var HW = candidate.ui.getHeightWidth()
              candidate.moveBy(its_xy.x - my_xy.x, its_xy.y - my_xy.y - HW.height)
            })
          }
        }
      }
      candidate.dispose(true)
      candidate = null
    }
  )
  return candidate.block_
}

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
  var m4t
  var t_eyo
  this.forEachInput(input => {
    if ((m4t = input.eyo.magnet)) {
      if ((t_eyo = m4t.t_eyo)) {
        ans += t_eyo.lock()
      }
      if (m4t.isInput) {
        m4t.setHidden(true)
      }
    }
  })
  // maybe redundant calls here
  this.forEachSlot(slot => {
    if ((m4t = slot.magnet)) {
      if ((t_eyo = m4t.t_eyo)) {
        ans += t_eyo.lock()
      }
      if (m4t.isInput) {
        m4t.setHidden(true)
      }
    }
  })
  if ((m4t = this.magnets.right) && (t_eyo = m4t.t_eyo)) {
    ans += t_eyo.lock()
  }
  if ((m4t = this.magnets.suite) && (t_eyo = m4t.t_eyo)) {
    ans += t_eyo.lock()
  }
  if ((m4t = this.magnets.foot) && (t_eyo = m4t.t_eyo)) {
    ans += t_eyo.lock()
  }
  if (this === eYo.Selected.eyo) {
    var parent = this
    while ((parent = parent.surround)) {
      if (!parent.wrapped_ && !parent.locked_) {
        eYo.Selected.eyo = parent
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
  var m4t, t_eyo
  this.forEachInput(input => {
    if ((m4t = input.eyo.magnet)) {
      if ((!shallow || m4t.isInput) && (t_eyo = m4t.t_eyo)) {
        ans += t_eyo.unlock(shallow)
      }
      m4t.setHidden(false)
    }
  })
  if (!shallow && (m4t = block.eyo.magnets.foot)) {
    if ((t_eyo = m4t.t_eyo)) {
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
 * @param {?Object} newLoc The new location of the receiver, the actual location when undefined.
 * @return {{x: number, y: number}|undefined}
 */
eYo.DelegateSvg.prototype.getDistanceFromVisible = function (newLoc) {
  var workspace = this.workspace
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
  var heightWidth = this.ui.getHeightWidth()
  // the block is in the visible area if we see its center
  var leftBound = metrics.viewLeft / scale - heightWidth.width / 2
  var topBound = metrics.viewTop / scale - heightWidth.height / 2
  var rightBound = (metrics.viewLeft + metrics.viewWidth) / scale - heightWidth.width / 2
  var downBound = (metrics.viewTop + metrics.viewHeight) / scale - heightWidth.height / 2
  var xy = newLoc || this.ui.xyInSurface
  return {
    x: xy.x < leftBound? xy.x - leftBound: (xy.x > rightBound? xy.x - rightBound: 0),
    y: xy.y < topBound? xy.y - topBound: (xy.y > downBound? xy.y - downBound: 0),
  }
}

/**
 * Side effect: renders the block when connections are no longer hidden.
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

