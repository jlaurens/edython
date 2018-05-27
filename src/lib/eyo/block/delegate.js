/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Block delegates for edython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Delegate')

goog.require('eYo.Helper')
goog.require('Blockly.Blocks')

goog.require('eYo.T3')
goog.require('eYo.Do')
goog.forwardDeclare('eYo.Block')
goog.require('eYo.Data')

/**
 * Class for a Block Delegate.
 * Not normally called directly, eYo.Delegate.Manager.create(...) is preferred.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.Delegate = function (block) {
  eYo.Delegate.superClass_.constructor.call(this)
  this.errors = Object.create(null) // just a hash
  this.block_ = block
  block.eyo = this
  var data = this.data = Object.create(null) // just a hash
  var dataModel = this.getModel().data
  var byOrder = []
  for (var k in dataModel) {
    if (eYo.Do.hasOwnProperty(dataModel, k)) {
      var d = new eYo.Data(this, k, dataModel[k])
      data[k] = d
      for (var i = 0, dd; (dd = byOrder[i]); ++i) {
        if (dd.model.order > d.model.order) {
          break
        }
      }
      byOrder.splice(i, 0, d)
    }
  }
  if ((d = this.headData = byOrder[0])) {
    for (i = 1; (dd = byOrder[i]); ++i) {
      d.next = dd
      dd.previous = d
      d = dd
    }
  }
}
goog.inherits(eYo.Delegate, eYo.Helper)

/**
 * Get the block.
 * For edython.
 * @param {boolean} newValue
 */
eYo.Delegate.prototype.getBlock = function () {
  return this.block_
}

/**
 * Get the eyo namespace in the constructor.
 * Create one if it does not exist.
 * Closure used.
 */
eYo.Delegate.getC9rEyO = (function () {
  // one (almost hidden) shared constructor
  var EyOC9r = function (key, owner) {
    owner.eyo = this
    this.owner_ = owner
    this.key = key
    this.types = []
  }
  return function (delegateC9r, key) {
    if (delegateC9r.eyo) {
      return delegateC9r.eyo
    }
    return new EyOC9r(key, delegateC9r)
  }
}())

/**
 * Delegate manager.
 * @param {?string} prototypeName Name of the language object containing
 */
eYo.Delegate.Manager = (function () {
  var me = {}
  var C9rs = Object.create(null)
  /**
   * Just adds a proper eyo object to the delegate.
   * @param {Object} constructor
   * @param {string} key
   * @private
   */
  me.prepareDelegate = function (delegateC9r, key) {
    var eyo = eYo.Delegate.getC9rEyO(delegateC9r, key || '')
    eyo.getModel || (eyo.getModel = function () {
      return modeller(delegateC9r)
    })
    return eyo
  }
  /**
   * Helper to initialize a block's model.
   * to and from are tree.
   * Add to destination all the leafs from source.
   * @param {!Object} to  destination.
   * @param {!Object} from  source.
   */
  var merger = function (to, from, ignore) {
    for (var k in from) {
      if (ignore && ignore(k)) {
        continue
      }
      var from_d = from[k]
      // next contains my test for a dictionary, hence my meaning of dictionary
      // in that context
      if (goog.isNull(from_d) || goog.isBoolean(from_d) || goog.isNumber(from_d) || goog.isString(from_d) || goog.isFunction(from_d) || goog.isArray(from_d)) {
        to[k] = from_d
      } else if (from_d && Object.keys(from_d).length === Object.getOwnPropertyNames(from_d).length) {
        // we have a dictionary, do a mixin
        var to_d = to[k]
        if (to_d) {
          if (Object.keys(to_d).length !== Object.getOwnPropertyNames(to_d).length) {
            to_d = to[k] = Object.create(null)
          }
        } else {
          to_d = to[k] = Object.create(null)
        }
        merger(to_d, from_d)
      } else {
        // it is not a dictionary, do a simple copy/override
        to[k] = from_d
      }
    }
    if ((to.check)) {
      to.check = eYo.Do.ensureArray(to.check)
    } else if ((to_d = to.wrap)) {
      to.check = eYo.Do.ensureArray(to_d)
    }
  }
  me.merger = merger
  /**
   * Private modeller to provide the constructor with a complete getModel.
   * @param {!Object} delegateC9r the constructor of a delegate. Must have an `eyo` namespace.
   * @param {?Object} insertModel  data and inputs entries are merged into the model.
   */
  var modeller = function (delegateC9r, insertModel) {
    var eyo = delegateC9r.eyo
    goog.asserts.assert(eyo, 'Forbidden constructor, `eyo`is missing')
    if (eyo.model_) {
      return eyo.model_
    }
    var model = Object.create(null)
    var c = delegateC9r.superClass_
    if (c && (c = c.constructor) && c.eyo) {
      merger(model, modeller(c))
    }
    if (delegateC9r.model__) {
      if (goog.isFunction(delegateC9r.model__)) {
        model = delegateC9r.model__(model)
      } else if (Object.keys(delegateC9r.model__).length) {
        merger(model, delegateC9r.model__)
      }
      delete delegateC9r.model__
    }
    if (insertModel) {
      insertModel.data && merger(model.data, insertModel.data)
      insertModel.tiles && merger(model.tiles, insertModel.tiles)
    }
    // store that object permanently
    delegateC9r.eyo.model_ = model
    // now change the getModel to return this stored value
    delegateC9r.eyo.getModel = function () {
      return delegateC9r.eyo.model_
    }
    return model
  }
  /**
   * Method to create the constructor of a subclass.
   * One constructor, one key.
   * Registers the subclass too.
   * For any constructor C built with this method, we have
   * C === me.get(C.eyo.key)
   * and in general
   * key in me.get(key).eyo.types
   * but this is not a requirement!
   * In particular, some blocks share a bseic do nothing delegate
   * because they are not meant to really exist yet.
   @return the constructor created
   */
  me.makeSubclass = function (key, model, parent, owner = undefined) {
    goog.asserts.assert(parent.eyo, 'Only subclass constructors with an `eyo` namespace.')
    if (key.indexOf('eyo:') >= 0) {
      key = key.substring(4)
    }
    owner = owner ||
    (eYo.T3.Expr[key] && eYo.Delegate.Svg && eYo.Delegate.Svg.Expr) ||
    (eYo.T3.Stmt[key] && eYo.Delegate.Svg && eYo.Delegate.Svg.Stmt) ||
    parent
    var delegateC9r = owner[key] = function (block) {
      delegateC9r.superClass_.constructor.call(this, block)
    }
    goog.inherits(delegateC9r, parent)
    me.prepareDelegate(delegateC9r, key)
    eYo.Delegate.Manager.registerDelegate_(eYo.T3.Expr[key] || eYo.T3.Stmt[key], delegateC9r)
    if (goog.isFunction(model)) {
      model = model()
    }
    if (model) {
      // manage the link: key
      var link
      var linkModel = model
      while ((link = model.link)) {
        var linkC9r = goog.isFunction(link) ? link : me.get(link)
        goog.asserts.assert(linkC9r, 'Not inserted: ' + link)
        linkModel = linkC9r.eyo.getModel()
        if (linkModel) {
          model = linkModel
        }
      }
      // manage the inherits key, uncomplete management,
      var inherits = model.inherits
      if (inherits) {
        var inheritsC9r = goog.isFunction(inherits) ? inherits : me.get(inherits)
        var inheritsModel = inheritsC9r.eyo.getModel()
        if (inheritsModel) {
          var m = {}
          merger(m, inheritsModel)
          merger(m, model)
          model = m
        }
      }
      var inherits
      var t = eYo.T3.Expr[key]
      if (t) {
        if (!model.output) {
          model.output = Object.create(null)
        }
        if (!model.output.check) {
          model.output.check = t
        }
      } else if ((t = eYo.T3.Stmt[key])) {
        var statement = model.statement || (model.statement = Object.create(null))
        if (!statement.previous) {
          statement.previous = Object.create(null)
        }
        if (!statement.previous.check && !goog.isNull(statement.previous.check)) {
          statement.previous.check = eYo.T3.Stmt.Previous[key]
        }
        if (!statement.next) {
          statement.next = Object.create(null)
        }
        if (!statement.next.check && !goog.isNull(statement.next.check)) {
          statement.next.check = eYo.T3.Stmt.Next[key]
        }
      }
      delegateC9r.model__ = model // intermediate storage used by `modeller` in due time
    }
    delegateC9r.makeSubclass = function (key, model, owner) {
      return me.makeSubclass(key, model, delegateC9r, owner)
    }
    return delegateC9r
  }
  /**
   * Delegate instance creator.
   * @param {?string} prototypeName Name of the language object containing
   */
  me.create = function (block) {
    goog.asserts.assert(!goog.isString(block), 'API DID CHANGE, update!')
    var DelegateC9r = C9rs[block.type]
    goog.asserts.assert(DelegateC9r, 'No delegate for ' + block.type)
    return DelegateC9r && new DelegateC9r(block)
  }
  /**
   * Get the Delegate constructor for the given prototype name.
   * @param {?string} prototypeName Name of the language object containing
   */
  me.get = function (prototypeName) {
    return C9rs[prototypeName]
  }
  /**
   * Get the Delegate constructor for the given prototype name.
   * @param {?string} prototypeName Name of the language object containing
   */
  me.getTypes = function () {
    return Object.keys(C9rs)
  }
  /**
   * Get the input model for that prototypeName.
   * @param {?string} prototypeName Name of the language object containing
   * @return void object if no delegate is registered for that name
   */
  me.getModel = function (prototypeName) {
    var delegateC9r = C9rs[prototypeName]
    return (delegateC9r && delegateC9r.eyo.getModel()) || Object.create(null)
  }
  /**
   * Delegate registrator.
   * The constructor has an eyo attached object for
   * some kind of introspection.
   * Computes and caches the model
   * only once from the creation of the delegate.
   *
   * The last delegate registered for a given prototype name wins.
   * @param {?string} prototypeName Name of the language object containing
   * @param {Object} constructor
   * @private
   */
  me.registerDelegate_ = function (prototypeName, delegateC9r, key) {
    // console.log(prototypeName+' -> '+delegateC9r)
    C9rs[prototypeName] = delegateC9r
    // cache all the input, output and statement data at the prototype level
    me.prepareDelegate(delegateC9r, key)
    delegateC9r.eyo.types.push(prototypeName)
    Blockly.Blocks[prototypeName] = {}
  }
  /**
   * Handy method to register an expression or statement block.
   */
  me.register = function (key) {
    var prototypeName = eYo.T3.Expr[key]
    var delegateC9r, available
    if (prototypeName) {
      delegateC9r = eYo.Delegate[key]
      available = eYo.T3.Expr.Available
    } else if ((prototypeName = eYo.T3.Stmt[key])) {
      delegateC9r = eYo.Delegate[key]
      available = eYo.T3.Stmt.Available
    } else {
      throw new Error('Unknown block eYo.T3.Expr or eYo.T3.Stmt key: ' + key)
    }
    me.registerDelegate_(prototypeName, delegateC9r, key)
    available.push(prototypeName)
  }
  me.registerAll = function (keyedPrototypeNames, delegateC9r, fake) {
    for (var k in keyedPrototypeNames) {
      var prototypeName = keyedPrototypeNames[k]
      if (goog.isString(prototypeName)) {
        //        console.log('Registering', k)
        me.registerDelegate_(prototypeName, delegateC9r, k)
        if (fake) {
          prototypeName = prototypeName.replace('eyo:', 'eyo:fake_')
          //          console.log('Registering', k)
          me.registerDelegate_(prototypeName, delegateC9r, k)
        }
      }
    }
  }
  me.display = function () {
    var keys = Object.keys(C9rs)
    for (var k = 0; k < keys.length; k++) {
      var prototypeName = keys[k]
      console.log('' + k + '->' + prototypeName + '->' + C9rs[prototypeName])
    }
  }
  return me
}())

/**
 * Model getter. Convenient shortcut.
 */
eYo.Do.getModel = function (type) {
  return eYo.Delegate.Manager.getModel(eYo.T3.Stmt.comment_any)
}

/**
 * Model getter. Ask the constructor.
 */
eYo.Delegate.prototype.getModel = function () {
  return this.constructor.eyo.getModel()
}

// register this delegate for all the T3 types
eYo.Delegate.Manager.registerAll(eYo.T3.Expr, eYo.Delegate)
eYo.Delegate.Manager.registerAll(eYo.T3.Stmt, eYo.Delegate)

/**
 * Some blocks may change when their properties change,
 * for example. This message is sent whenever one of the properties
 * declared below changes.
 * The type of the block may change, thus implying some connection changes.
 * The connection checks may change too.
 * For edython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
eYo.Delegate.prototype.consolidateType = function (block) {
  this.setupType(block)
}

/**
 * execute the given function for the head tile of the receiver and its next sibling.
 * If the return value of the given function is true,
 * then it was the last iteration and the loop nreaks.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was a tile to act upon or a valid helper
 */
eYo.Delegate.prototype.foreachTile = function (helper) {
  var tile = this.ui.headTile
  if (tile && goog.isFunction(helper)) {
    var last
    do {
      last = helper.call(tile)
    } while (!last && (tile = tile.next))
    return true
  }
  return false
}

/**
 * execute the given function for the head data of the receiver and its next sibling.
 * Ends the loop as soon as the 
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was a data to act upon or a valid helper
 */
eYo.Delegate.prototype.foreachData = function (helper) {
  var data = this.headData
  if (data && goog.isFunction(helper)) {
    var last
    do {
      last = helper.call(data)
    } while (!last && (data = data.next))
  }
}

/**
 * Initialize the data.
 * Bind data and fields.
 * We assume that if data and fields share the same name,
 * they must be bound, otherwise we would have chosen different names...
 * if the data model contains an intializer, use it,
 * otherwise send an init message to all the data controllers.
 */
eYo.Delegate.prototype.initData = function () {
  for (var k in this.data) {
    var data = this.data[k]
    data.ui = this.ui
    var tile = this.ui.tiles[k]
    if (tile) {
      data.tile = tile
      tile.data = data
      // try the unique editable field
      if (Object.keys(tile.fields).length === 1) {
        for (var kk in tile.fields) {
          data.field = tile.fields[kk]
          break
        }
      } else {
        data.field = tile.fields.edit
      }
    } else if ((data.field = this.ui.fields[k])) {
      data.tile = null
      data.field.eyo.data = data
    } else {
      for (kk in this.ui.tiles) {
        tile = this.ui.tiles[kk]
        if ((data.field = tile.fields[k])) {
          data.tile = tile
          break
        }
      }
    }
    var field = data.field
    var eyo = field && field.eyo
    if (eyo) {
      // this is for editable fields
      eyo.data = data
    }
  }
  var init = this.getModel().initData
  if (goog.isFunction(init)) {
    init.call(this)
    return
  }
  this.foreachData(function () {
    this.init()
  })
}

/**
 * Synchronize the data to the UI.
 * Sends a `synchronize` message to all data controllers.
 */
eYo.Delegate.prototype.synchronizeData = function (block) {
  this.foreachData(function () {
    this.synchronize(this.get())
  })
}

/**
 * Subclass maker.
 * Start point in the hierarchy.
 * Each subclass created will have its own makeSubclass method.
 */
eYo.Delegate.makeSubclass = function (key, model, owner) {
  // First ensure that eYo.Delegate is well formed
  eYo.Delegate.Manager.prepareDelegate(eYo.Delegate)
  return eYo.Delegate.Manager.makeSubclass(key, model, eYo.Delegate, owner)
}

/**
 * The python type of the owning block.
 */
eYo.Delegate.prototype.pythonType_ = undefined

/**
 * The real type of the owning block.
 * There are fake blocks initially used for debugging purposes.
 * For a block type eyo:fake_foo, the delegate type is eyo:foo.
 */
eYo.Delegate.prototype.type_ = undefined

/**
 * Set the [python ]type of the delegate according to the type of the block.
 * @param {!Blockly.Block} block to be initialized..
 * @param {string} optNewType
 * @constructor
 */
eYo.Delegate.prototype.setupType = function (block, optNewType) {
  optNewType && (block.type = optNewType)
  var m = /^eyo:((?:fake_)?((.*?)(?:)?))$/.exec(block.type)
  this.pythonType_ = m ? m[1] : block.type
  this.type_ = m ? 'eyo:' + m[2] : block.type
  this.xmlType_ = m ? m[3] : block.type
  // test all connections
  var c8n, targetC8n
  if ((c8n = block.previousConnection) && (targetC8n = c8n.targetConnection)) {
    if (!c8n.checkType_(targetC8n)) {
      block.unplug()
      block.bumpNeighbours_()
    }
  }
  if ((c8n = block.outputConnection) && (targetC8n = c8n.targetConnection)) {
    if (!c8n.checkType_(targetC8n)) {
      block.unplug()
      block.bumpNeighbours_()
    }
  }
  if ((c8n = block.nextConnection) && (targetC8n = c8n.targetConnection)) {
    if (!c8n.checkType_(targetC8n)) {
      c8n.disconnect()
      targetC8n.getSourceBlock().bumpNeighbours_()
    }
  }
}

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
eYo.Delegate.prototype.initBlock = function (block) {
  this.setupType(block)
  var model = this.getModel()
  var D = model.output
  if (D && Object.keys(D).length) {
    block.setOutput(true, D.check)
    var eyo = block.outputConnection.eyo
    eyo.model = D
    if (D.suite && Object.keys(D.suite).length) {
      goog.mixin(eyo, D.suite)
    }
  } else if ((D = model.statement) && Object.keys(D).length) {
    if (D.suite) {
      this.inputSuite = block.appendStatementInput('suite').setCheck(D.check) // Check ?
      this.inputSuite.connection.eyo.model = D
    }
    if (D.next && D.next.check !== null) {
      block.setNextStatement(true, D.next.check)
      block.nextConnection.eyo.model = D.next
    }
    if (D.previous && D.previous.check !== null) {
      block.setPreviousStatement(true, D.previous.check)
      block.previousConnection.eyo.model = D.previous
    }
  }
}

/**
* Deinitialize a block. Nothing to do yet.
* @param {!Blockly.Block} block to be deinitialized..
* @constructor
*/
eYo.Delegate.prototype.deinitBlock = function (block) {
}

/**
 * Whether the block has a previous statement.
 * @param {!Block} block
 * @private
 */
eYo.Delegate.prototype.hasPreviousStatement_ = function (block) {
  var c8n = block.previousConnection
  return c8n && c8n.isConnected() &&
    c8n.targetBlock().nextConnection === c8n.targetConnection
}

/**
 * Whether the block has a next statement.
 * @param {!Block} block
 * @private
 */
eYo.Delegate.prototype.hasNextStatement_ = function (block) {
  return block.nextConnection && block.nextConnection.isConnected()
}

/**
 * The default implementation does nothing.
 * @param {!Blockly.Block} block
 * @param {boolean} hidden True if connections are hidden.
 */
eYo.Delegate.prototype.setConnectionsHidden = function (block, hidden) {
}

/**
 * Return all eyo variables referenced by this block.
 * @return {!Array.<string>} List of variable names.
 */
eYo.Delegate.prototype.getVars = function (block) {
  var vars = []
  for (var i = 0, input; (input = block.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field instanceof eYo.FieldInput) {
        vars.push(field.getText())
      }
    }
  }
  return vars
}

/**
 * Same as Block's getDescendants except that it
 * includes this block in the list only when not sealed.
 * @param {!Blockly.Block} block
 * @return {!Array.<!Blockly.Block>} Flattened array of blocks.
 */
eYo.Delegate.prototype.getWrappedDescendants = function (block) {
  var blocks = []
  if (!this.wrapped_) {
    blocks.push(block)
  }
  for (var child, x = 0; (child = block.childBlocks_[x]); x++) {
    blocks.push.apply(blocks, child.eyo.getWrappedDescendants(child))
  }
  return blocks
}

/**
 * If the sealed connections are not connected,
 * create a node for it.
 * The default implementation connects all the blocks from the wrappedInputs_ list.
 * Subclassers will evntually create appropriate new nodes
 * and connect it to any sealed connection.
 * @param {!Block} block
 * @private
 */
eYo.Delegate.prototype.completeWrapped_ = function (block) {
  if (this.wrappedInputs_) {
    eYo.Delegate.wrappedFireWall = 100
    for (var i = 0; i < this.wrappedInputs_.length; i++) {
      var data = this.wrappedInputs_[i]
      this.completeWrappedInput_(block, data[0], data[1])
    }
  }
}

/**
 * The default implementation does nothing.
 * Subclassers will override this but won't call it.
 * @param {!Block} block
 * @private
 */
eYo.Delegate.prototype.makeBlockWrapped = function (block) {
}

/**
 * The default implementation is false.
 * Subclassers will override this but won't call it.
 * @param {!Block} block
 */
eYo.Delegate.prototype.canUnwrap = function (block) {
  return false
}

/**
 * The default implementation does nothing.
 * Subclassers will override this but won't call it.
 * @param {!Block} block
 * @private
 */
eYo.Delegate.prototype.makeBlockUnwrapped = function (block) {
}

/**
 * The wrapped blocks are special.
 * @param {!Block} block
 * @private
 */
eYo.Delegate.prototype.makeBlockWrapped_ = function (block) {
  if (!block.eyo.wrapped_ && !this.noBlockWrapped(block)) {
    block.eyo.makeBlockWrapped(block)
    block.eyo.wrapped_ = true
  }
}

/**
 * Some block should not be wrapped.
 * Default implementation returns false
 * @param {!Block} block
 * @return whether the block should be wrapped
 */
eYo.Delegate.prototype.noBlockWrapped = function (block) {
  return false
}

/**
 * The wrapped blocks are special.
 * @param {!Block} block
 * @private
 */
eYo.Delegate.prototype.makeBlockUnwrapped_ = function (block) {
  if (block.eyo.wrapped_) {
    block.eyo.makeBlockUnwrapped(block)
    block.eyo.wrapped_ = false
  }
}

/**
 * Get the first enclosing unwrapped block.
 * @param {!Block} block
 * @param {!Input} input
 * @param {!String} prototypeName
 * @return yorn whether a change has been made
 * @private
 */
eYo.Delegate.prototype.getUnwrapped = function (block) {
  var parent = block
  do {
    if (!parent.eyo.wrapped_) {
      break
    }
  } while ((parent = parent.getSurroundParent()))
  return parent
}

/**
 * Complete the wrapped block.
 * When created from dom, the connections are established
 * but the nodes were not created sealed.
 * @param {!Block} block
 * @param {!Input} input
 * @param {!String} prototypeName
 * @return yorn whether a change has been made
 * @private
 */
eYo.Delegate.prototype.completeWrappedInput_ = function (block, input, prototypeName) {
  if (input) {
    var target = input.connection.targetBlock()
    if (!target) {
      try {
        Blockly.Events.disable()
        goog.asserts.assert(prototypeName, 'Missing wrapping prototype name in block ' + block.type)
        goog.asserts.assert(eYo.Delegate.wrappedFireWall, 'ERROR: Maximum value reached in completeWrappedInput_ (circular)')
        --eYo.Delegate.wrappedFireWall
        target = eYo.DelegateSvg.newBlockComplete(block.workspace, prototypeName, block.id+'.wrapped:'+input.connection.eyo.name_)
        goog.asserts.assert(target, 'completeWrapped_ failed: ' + prototypeName)
        goog.asserts.assert(target.outputConnection, 'Did you declare an Expr block typed ' + target.type)
        input.connection.connect(target.outputConnection)
      } finally {
        Blockly.Events.enable()
      }
    }
  }
}

/**
 * Will connect this block's connection to another connection.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} connection
 * @param {!Blockly.Connection} childConnection
 */
eYo.Delegate.prototype.willConnect = function (block, connection, childConnection) {
  // console.log('will connect')
}

/**
 * Did connect this block's connection to another connection.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} connection what has been connected in the block
 * @param {!Blockly.Connection} oldTargetConnection what was previously connected in the block
 * @param {!Blockly.Connection} oldConnection what was previously connected to the new targetConnection
 */
eYo.Delegate.prototype.didConnect = function (block, connection, oldTargetConnection, oldConnection) {
  // console.log('did connect')
}

/**
 * Will disconnect this block's connection.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} blockConnection
 */
eYo.Delegate.prototype.willDisconnect = function (block, blockConnection) {
  // console.log('will disconnect')
}

/**
 * Did connect this block's connection to another connection.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} blockConnection
 * @param {!Blockly.Connection} oldTargetConnection that was connected to blockConnection
 */
eYo.Delegate.prototype.didDisconnect = function (block, blockConnection, oldTargetConnection) {
  // console.log('did disconnect')
}

/**
 * In a connection, the inferior block's delegate may have a plugged_.
 * This is used for example to distinguish generic blocks such as identifiers.
 * An identifier is in general a variable name but sometimes it cannot be.
 * module names are such an example.
 * @private
 */
eYo.Delegate.prototype.plugged_ = undefined

/**
 * Can remove and bypass the parent?
 * If the parent's output connection is connected,
 * can connect the block's output connection to it?
 * The connection cannot always establish.
 * @param {!Block} block
 * @param {!Block} other the block to be replaced
 */
eYo.Delegate.prototype.canReplaceBlock = function (block, other) {
  return false
}

/**
 * Remove an input from this block.
 * @param {!Blockly.Block} block The owner of the delegate.
 * @param {!Blockly.Input} input the input.
 * @param {boolean=} opt_quiet True to prevent error if input is not present in block.
 * @throws {goog.asserts.AssertionError} if the input is not present and
 *     opt_quiet is not true.
 */
eYo.Delegate.prototype.removeInput = function (block, input, opt_quiet) {
  if (input.block === block) {
    if (input.connection && input.connection.isConnected()) {
      input.connection.setShadowDom(null)
      block = input.connection.targetBlock()
      block.unplug()
    }
    goog.array.remove(this.inputList, input)
    input.dispose()
    return
  }
  if (!opt_quiet) {
    goog.asserts.fail('Inconsistent data.')
  }
}

/**
 * When the output connection is connected,
 * returns the input holding the parent's corresponding connection.
 * @param {!Blockly.Block} block The owner of the delegate.
 * @return an input.
 */
eYo.Delegate.prototype.getParentInput = function (block) {
  var c8n = block.outputConnection
  if (c8n && (c8n = c8n.targetConnection)) {
    var list = c8n.sourceBlock_.inputList
    for (var i = 0, input; (input = list[i++]);) {
      if (input.connection === c8n) {
        return input
      }
    }
  }
  return null
}

/**
 * Returns the total number of code lines for that node and the node below.
 * One atomic instruction is one line.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @return {Number}.
 */
eYo.Delegate.prototype.getStatementCount = function (block) {
  var n = 1
  var hasActive = false
  var hasNext = false
  var e8r = block.eyo.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection
    if (c8n && c8n.type === Blockly.NEXT_STATEMENT) {
      hasNext = true
      if (c8n.isConnected()) {
        var target = c8n.targetBlock()
        do {
          hasActive = hasActive || (!target.disabled && !target.eyo.isWhite(target))
          n += target.eyo.getStatementCount(target)
        } while ((target = target.getNextBlock()))
      }
    }
  }
  if (this.suiteInput) {
    c8n = this.suiteInput.connection
    if (c8n && c8n.type === Blockly.NEXT_STATEMENT) {
      hasNext = true
      if (c8n.isConnected()) {
        target = c8n.targetBlock()
        do {
          hasActive = hasActive || (!target.disabled && !target.eyo.isWhite(target))
          n += target.eyo.getStatementCount(target)
        } while ((target = target.getNextBlock()))
      }
    }
  }
  return n + (hasNext && !hasActive ? 1 : 0)
}

/**
 * Whether this block is white. White blocks have no effect,
 * the action of the algorithm is exactly the same whether the block is here or not.
 * White blocks are comment statements, disabled blocks
 * and maybe other kinds of blocks to be found...
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
eYo.Delegate.prototype.isWhite = function (block) {
  return block.disabled
}

/**
 * Get the next connection of this block.
 * Comment and disabled blocks are transparent with respect to connection checking.
 * If block
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
eYo.Delegate.prototype.getNextConnection = function (block) {
  while (block.eyo.isWhite(block)) {
    var c8n
    if (!(c8n = block.previousConnection) || !(block = c8n.targetBlock())) {
      return undefined
    }
  }
  return block.nextConnection
}

/**
 * Get the previous connection of this block.
 * Comment and disabled blocks are transparent with respect to connection checking.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
eYo.Delegate.prototype.getPreviousConnection = function (block) {
  while (block.eyo.isWhite(block)) {
    var c8n
    if (!(c8n = block.nextConnection) || !(block = c8n.targetBlock())) {
      return undefined
    }
  }
  return block.previousConnection
}

/**
 * Set the disable state of the block.
 * Calls the block's method but also make sure that previous blocks
 * and next blocks are in an acceptable state.
 * For example, if I disable an if block, I should also disable
 * an elif/else following block, but only if it would make an elif/else orphan.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
eYo.Delegate.prototype.setDisabled = function (block, yorn) {
  if (!!block.disabled === !!yorn) {
    // nothing to do the block is already in the good state
    return
  }
  eYo.Events.setGroup(true)
  var previous, next
  try {
    if (yorn) {
      block.setDisabled(true)
      // Does it break next connections
      if ((previous = block.previousConnection) &&
      (next = previous.targetConnection) &&
      next.eyo.getBlackConnection()) {
        while ((previous = block.nextConnection) &&
        (previous = previous.targetConnection) &&
        (previous = previous.eyo.getBlackConnection())) {
          if (next.checkType_(previous)) {
            break
          }
          block = previous.getSourceBlock()
          // No recursion
          block.setDisabled(true)
        }
      }
    } else {
      block.setDisabled(false)
      // if the connection chain below this block is broken,
      // try to activate some blocks
      if ((next = block.nextConnection)) {
        if ((previous = next.targetConnection) &&
        (previous = previous.eyo.getBlackConnection()) &&
        !next.checkType_(previous)) {
          // find  white block in the below chain that can be activated
          // stop before the black connection found just above
          previous = next.targetConnection
          do {
            var target = previous.getSourceBlock()
            if (target.disabled) {
              target.disabled = false
              var check = next.checkType_(previous)
              target.disabled = true
              if (check) {
                target.setDisabled(false)
                if (!(next = target.nextConnection)) {
                  break
                }
              }
            } else if (!target.eyo.isWhite(target)) {
              // the black connection is reached, no need to go further
              // but the next may have change and the checkType_ must
              // be computed once again
              if (!next.checkType_(previous)) {
                target.unplug()
                target.bumpNeighbours_()
              }
              break
            }
          } while ((previous = previous.eyo.getConnectionBelow()))
        }
      }
      // now consolidate the chain above
      if ((previous = block.previousConnection)) {
        if ((next = previous.targetConnection) &&
        (next = next.eyo.getBlackConnection()) &&
        !previous.checkType_(next)) {
          // find  white block in the above chain that can be activated
          // stop before the black connection found just above
          next = previous.targetConnection
          do {
            target = next.getSourceBlock()
            if (target.disabled) {
              // beware of some side effet below
              // bad design, things have changed since then...
              target.disabled = false
              check = previous.checkType_(next)
              target.disabled = true
              if (check) {
                target.setDisabled(false)
                if (!(previous = target.previousConnection)) {
                  break
                }
              }
            } else if (!target.eyo.isWhite(target)) {
              // the black connection is reached, no need to go further
              // but the next may have change and the checkType_ must
              // be computed once again
              if (!next.checkType_(previous)) {
                target = previous.getSourceBlock()
                target.unplug()
                target.bumpNeighbours_()
              }
              break
            }
          } while ((next = next.eyo.getConnectionAbove()))
        }
      }
    }
  } finally {
    eYo.Events.setGroup(false)
  }
}

/**
 * Enable/Disable the connections of the block.
 * A disabled block cannot enable its connections.
 * @param {!Block} block
 * @param {!Boolean} disabled
 * @private
 */
eYo.Delegate.prototype.setIncog = function (block, incog) {
  if (!this.incog_ === !incog) {
    return
  }
  if (incog) {
    if (this.incog_) {
      // The block is already incognito,
      // normally no change to the block tree
      return
    }
  } else if (block.disabled) {
    // enable the block before enabling its connections
    return
  }
  this.incog_ = incog
  var setupIncog = function (input) {
    var c8n = input && input.connection
    c8n && c8n.eyo.setIncog(incog)
  }
  var tile = this.ui.headTile
  while (tile) {
    setupIncog(tile.input)
    tile = tile.next
  }
  setupIncog(this.inputSuite)
  for (var i = 0, input; (input = this.block_.inputList[i++]);) {
    setupIncog(input)
  }
  if (!incog) { // for lists mainly
    this.consolidate(block) // no deep consolidation because connected blocs were consolidated above
  }
}

/**
 * Get the disable state.
 * For edython.
 */
eYo.Delegate.prototype.isIncog = function () {
  return this.incog_
}

/**
 * The xml type of this block, as it should appear in the saved data.
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
eYo.Delegate.prototype.xmlType = function (block) {
  return this.xmlType_
}

/**
 * Input enumerator
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
eYo.Delegate.prototype.inputEnumerator = function (block, all) {
  return eYo.Do.Enumerator(block.inputList, all ? undefined : function (x) {
    return !x.eyo.disabled_
  })
}

/**
 * Set the error
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {!string} key
 * @param {!string} msg
 * @return true if the given value is accepted, false otherwise
 */
eYo.Delegate.prototype.setError = function (block, key, msg) {
  this.errors[key] = {
    message: msg
  }
}

/**
 * get the error
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {!string} key
 * @return true if the given value is accepted, false otherwise
 */
eYo.Delegate.prototype.getError = function (block, key) {
  return this.errors[key]
}

/**
 * get the error
 * For edython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {!string} key
 * @return true if the given value is accepted, false otherwise
 */
eYo.Delegate.prototype.removeError = function (block, key) {
  delete this.errors[key]
}
