/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Block delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Delegate')

goog.require('ezP.Helper')
goog.require('Blockly.Blocks')

goog.require('ezP.T3')
goog.require('ezP.Do')
goog.forwardDeclare('ezP.Block')
goog.require('ezP.Data')

/**
 * Class for a Block Delegate.
 * Not normally called directly, ezP.Delegate.Manager.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.Delegate = function (block) {
  ezP.Delegate.superClass_.constructor.call(this)
  this.errors = Object.create(null) // just a hash
  this.block_ = block
  block.ezp = this
  var data = this.data = Object.create(null) // just a hash
  var dataModel = this.getModel().data
  for (var k in dataModel) {
    if (ezP.Do.hasOwnProperty(dataModel, k)) {
      data[k] = new ezP.Data(this, k, dataModel[k])
    }
  }
}
goog.inherits(ezP.Delegate, ezP.Helper)

/**
 * Get the block.
 * For ezPython.
 * @param {boolean} newValue.
 */
ezP.Delegate.prototype.getBlock = function () {
  return this.block_
}

/**
 * Get the ezp namespace in the constructor.
 * Create one if it does not exist.
 * Closure used.
 */
ezP.Delegate.getCtorEzp = function() {
  // one (almost hidden) shared constructor
  var ezpCtor = function(key, owner) {
    owner.ezp = this
    this.owner_ = owner
    this.key = key
    this.types = []
  }
  return function(delegateCtor, key) {
    if (delegateCtor.ezp) {
      return delegateCtor.ezp
    }
    return new ezpCtor(key, delegateCtor)
  }
} ()


/**
 * Delegate manager.
 * @param {?string} prototypeName Name of the language object containing
 */
ezP.Delegate.Manager = function () {
  var me = {}
  var Ctors = Object.create(null)
  var defaultCtor = undefined
  var defaultDelegate = undefined
  /**
   * Just adds a proper ezp object to the delegate.
   * @param {Object} constructor
   * @param {string} key
   * @private
   */
  me.prepareDelegate = function (delegateCtor, key) {
    var ezp = ezP.Delegate.getCtorEzp(delegateCtor, key || '')
    ezp.getModel || (ezp.getModel = function () {
      return modeller(delegateCtor)
    })
    return ezp
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
      if(ignore && ignore(k)) {
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
      to.check = ezP.Do.ensureArray(to.check)
    } else if ((to_d = to.wrap)) {
      to.check = ezP.Do.ensureArray(to_d)
    }
  }
  /**
   * Private modeller to provide the constructor with a complete getModel.
   * @param {!Object} delegateCtor the constructor of a delegate. Must have an `ezp` namespace.
   * @param {?Object} insertModel  data and inputs entries are merged into the model.
   */
  var modeller = function(delegateCtor, insertModel) {
    var ezp = delegateCtor.ezp
    goog.asserts.assert(ezp, 'Forbidden constructor, `ezp`is missing')
    if (ezp.model_) {
      return ezp.model_
    }
    var model = Object.create(null)
    var c = delegateCtor.superClass_
    if (c && (c = c.constructor) && c.ezp) {
      merger(model, modeller(c))
    }
    if (delegateCtor.model__) {
      if (goog.isFunction(delegateCtor.model__)) {
        model = delegateCtor.model__(model)
      } else if (Object.keys(delegateCtor.model__).length) {
        merger(model, delegateCtor.model__)
      }
      delete delegateCtor.model__
    }
    if (insertModel) {
      insertModel.data && merger(model.data, insertModel.data)
      insertModel.tiles && merger(model.tiles, insertModel.tiles)
    }
    // store that object permanently
    delegateCtor.ezp.model_ = model
    // now change the getModel to return this stored value
    delegateCtor.ezp.getModel = function() {
      return delegateCtor.ezp.model_
    }
    return model
  }
  /**
   * Method to create the constructor of a subclass.
   * One constructor, one key.
   * Registers the subclass too.
   * For any constructor C built with this method, we have
   * C === me.get(C.ezp.key)
   * and in general
   * key in me.get(key).ezp.types
   * but this is not a requirement!
   * In particular, some blocks share a bseic do nothing delegate
   * because they are not meant to really exist yet.
   @return the constructor created
   */
  me.makeSubclass = function(key, model, parent, owner = undefined) {
    goog.asserts.assert(parent.ezp, 'Only subclass constructors with an `ezp` namespace.')
    if (key.indexOf('ezp:') >= 0) {
      key = key.substring(4)
    }
    owner = owner 
    || ezP.T3.Expr[key] && ezP.Delegate.Svg && ezP.Delegate.Svg.Expr
    || ezP.T3.Stmt[key] && ezP.Delegate.Svg && ezP.Delegate.Svg.Stmt
    || parent
    var delegateCtor = owner[key] = function (block) {
      delegateCtor.superClass_.constructor.call(this, block)
    }
    goog.inherits(delegateCtor, parent)
    me.prepareDelegate(delegateCtor, key)
    ezP.Delegate.Manager.registerDelegate_(ezP.T3.Expr[key]||ezP.T3.Stmt[key], delegateCtor)
    if (goog.isFunction(model)) {
      model = model()
    }
    if (model) {
      // manage the link: key
      var link, linkModel = model
      while((link = model.link)) {
        var linkCtor = goog.isFunction(link)? link: me.get(link)
        goog.asserts.assert(linkCtor, 'Not inserted: '+link)
        var linkModel = linkCtor.ezp.getModel()
        if (linkModel) {
          model = linkModel
        }
      }
      var t = ezP.T3.Expr[key]
      if (t) {
        if (!model.output) {
          model.output = Object.create(null)
        }
        if (!model.output.check) {
          model.output.check = t
        }
      } else if ((t = ezP.T3.Stmt[key])) {
        var statement = model.statement || (model.statement = Object.create(null))
        if (!statement.previous) {
          statement.previous = Object.create(null)
        }
        if (!statement.previous.check && !goog.isNull(statement.previous.check)) {
          statement.previous.check = ezP.T3.Stmt.Previous[key]
        }
        if (!statement.next) {
          statement.next = Object.create(null)
        }
        if (!statement.next.check && !goog.isNull(statement.next.check)) {
          statement.next.check = ezP.T3.Stmt.Next[key]
        }
      }
      delegateCtor.model__ = model // intermediate storage used by `modeller` in due time
    }
    delegateCtor.makeSubclass = function(key, model, owner) {
      return me.makeSubclass(key, model, delegateCtor, owner)
    }
    return delegateCtor
  }
  /**
   * Delegate instance creator.
   * @param {?string} prototypeName Name of the language object containing
   */
  me.create = function (block) {
    goog.asserts.assert(!goog.isString(block), 'API DID CHANGE, update!')
    var delegateCtor = Ctors[block.type]
    goog.asserts.assert(delegateCtor, 'No delegate for '+block.type)
    return new delegateCtor(block)
  }
  /**
   * Get the Delegate constructor for the given prototype name.
   * @param {?string} prototypeName Name of the language object containing
   */
  me.get = function (prototypeName) {
    return Ctors[prototypeName]
  }
  /**
   * Get the Delegate constructor for the given prototype name.
   * @param {?string} prototypeName Name of the language object containing
   */
  me.getTypes = function () {
    return Object.keys(Ctors)
  }
  /**
   * Get the input model for that prototypeName.
   * @param {?string} prototypeName Name of the language object containing
   * @return void object if no delegate is registered for that name
   */
  me.getModel = function (prototypeName) {
    var delegateCtor = Ctors[prototypeName]
    return delegateCtor && delegateCtor.ezp.getModel() || Object.create(null)
  }
  /**
   * Delegate registrator.
   * The constructor has an ezp attached object for
   * some kind of introspection.
   * Computes and caches the model
   * only once from the creation of the delegate.
   * 
   * The last delegate registered for a given prototype name wins.
   * @param {?string} prototypeName Name of the language object containing
   * @param {Object} constructor
   * @private
   */
  me.registerDelegate_ = function (prototypeName, delegateCtor, key) {
    // console.log(prototypeName+' -> '+delegateCtor)
    Ctors[prototypeName] = delegateCtor
    // cache all the input, output and statement data at the prototype level
    me.prepareDelegate(delegateCtor, key)
    delegateCtor.ezp.types.push(prototypeName)
    Blockly.Blocks[prototypeName] = {}
  }
  /**
   * Handy method to register an expression or statement block.
   */
  me.register = function (key) {
    var prototypeName = ezP.T3.Expr[key]
    var delegateCtor = undefined
    var available = undefined
    if (prototypeName) {
      delegateCtor = ezP.Delegate[key]
      available = ezP.T3.Expr.Available
    } else if ((prototypeName = ezP.T3.Stmt[key])) {
      delegateCtor = ezP.Delegate[key]
      available = ezP.T3.Stmt.Available
    } else {
      throw "Unknown block ezP.T3.Expr or ezP.T3.Stmt key: "+key
    }
    me.registerDelegate_(prototypeName, delegateCtor, key)
    available.push(prototypeName)
  }
  me.registerAll = function (keyedPrototypeNames, delegateCtor, fake) {
    for (var k in keyedPrototypeNames) {
      var prototypeName = keyedPrototypeNames[k]
      if (goog.isString(prototypeName)) {
//        console.log('Registering', k)
        me.registerDelegate_(prototypeName, delegateCtor, k)
        if (fake) {
          prototypeName = prototypeName.replace('ezp:', 'ezp:fake_')
//          console.log('Registering', k)
          me.registerDelegate_(prototypeName, delegateCtor, k)
        }
      }
    }
  }
  me.display = function() {
    var keys = Object.keys(Ctors)
    for (var k=0; k<keys.length; k++) {
      var prototypeName = keys[k]
      console.log(''+k+'->'+prototypeName+'->'+Ctors[prototypeName])
    }
  }
  return me
}()

/**
 * Model getter. Convenient shortcut.
 */
ezP.Do.getModel = function(type) {
  return ezP.Delegate.Manager.getModel(ezP.T3.Stmt.comment_any)
}

/**
 * Model getter. Ask the constructor.
 */
ezP.Delegate.prototype.getModel = function() {
  return this.constructor.ezp.getModel()
}

// register this delegate for all the T3 types
ezP.Delegate.Manager.registerAll(ezP.T3.Expr, ezP.Delegate)
ezP.Delegate.Manager.registerAll(ezP.T3.Stmt, ezP.Delegate)

/**
 * Some blocks may change when their properties change,
 * for example. This message is sent whenever one of the properties
 * declared below changes.
 * The type of the block may change, thus implying some connection changes.
 * The connection checks may change too.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.Delegate.prototype.consolidateType = function (block) {
  this.setupType(block)
}

/**
 * Initialize the data.
 * Bind data and fields.
 * We assume that if data and fields share the same name,
 * they must be bound, otherwise we would have chosen different names...
 * if the data model contains an intializer, use it,
 * otherwise send an init message to all the data controllers.
 */
ezP.Delegate.prototype.initData = function() {
  for (var k in this.data) {
    var data = this.data[k]
    data.ui = this.ui
    var tile = this.ui.tiles[k]
    if (tile) {
      data.tile = tile
      tile.data = data
      // try the unique editable field
      if (Object.keys(tile.fields).length === 1) {
        for(var kk in tile.fields) {
          data.field = tile.fields[kk]
          break
        }
      } else {
        data.field = tile.fields.edit
      }
    } else if ((data.field = this.ui.fields[k])) {
      data.tile = null
      data.field.ezp.data = data
    } else {
      for(var kk in this.ui.tiles) {
        tile = this.ui.tiles[kk]
        if ((data.field = tile.fields[k])) {
          data.tile = tile
          break
        }
      }
    }
    var field = data.field
    var ezp = field && field.ezp
    if (ezp) {
      // this is for editable fields
      ezp.data = data
    }
  }
  var init = this.getModel().initData
  if (goog.isFunction(init)) {
    init.call(this)
    return
  }
  var data = this.data
  for (var k in data) {
    data[k].init()
  }
}

/**
 * Synchronize the data to the UI.
 * Sends a `synchronize` message to all data controllers.
 * May be used at the end of an initialization process
 * where we use only data's `internalSet` method.
 */
ezP.Delegate.prototype.synchronizeData = function(block) {
  var data = this.data
  for (var k in data) {
    data[k].synchronize(data[k].get())
  }
}

/**
 * Subclass maker.
 * Start point in the hierarchy.
 * Each subclass created will have its own makeSubclass method.
 */
ezP.Delegate.makeSubclass = function(key, model, owner) {
  // First ensure that ezP.Delegate is well formed
  ezP.Delegate.Manager.prepareDelegate(ezP.Delegate)
  return ezP.Delegate.Manager.makeSubclass(key, model, ezP.Delegate, owner)
}

/**
 * The python type of the owning block.
 */
ezP.Delegate.prototype.pythonType_ = undefined

/**
 * The real type of the owning block.
 * There are fake blocks initially used for debugging purposes.
 * For a block type ezp:fake_foo, the delegate type is ezp:foo.
 */
ezP.Delegate.prototype.type_ = undefined

/**
 * Set the [python ]type of the delegate according to the type of the block.
 * @param {!Blockly.Block} block to be initialized..
 * @param {string} optNewType
 * @constructor
 */
ezP.Delegate.prototype.setupType = function (block, optNewType) {
  optNewType && (block.type = optNewType)
  var m = /^ezp:((?:fake_)?((.*?)(?:_solid)?))$/.exec(block.type)
  this.pythonType_ = m? m[1]: block.type
  this.type_ = m? 'ezp:'+m[2]: block.type
  this.xmlType_ = m? m[3]: block.type
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
ezP.Delegate.prototype.initBlock = function (block) {
  this.setupType(block)
  var D = this.getModel().output
  if (D && Object.keys(D).length) {
    block.setOutput(true, D.check)
    var ezp = block.outputConnection.ezp
    ezp.model = D
    if (D.suite && Object.keys(D.suite).length) {
      goog.mixin(ezp, D.suite)
    }
  } else if ((D = this.getModel().statement) && Object.keys(D).length) {
    if (D.key) {
      var input = block.appendStatementInput(D.key).setCheck(D.check) // Check ?
      input.connection.ezp.model = D
    }
    if (D.next && D.next.check !== null) {
      block.setNextStatement(true, D.next.check)
      block.nextConnection.ezp.model = D.next
    }
    if (D.previous && D.previous.check !== null) {
      block.setPreviousStatement(true, D.previous.check)
      block.previousConnection.ezp.model = D.previous
    }
  }
}

/**
* Deinitialize a block. Nothing to do yet.
* @param {!Blockly.Block} block to be deinitialized..
* @constructor
*/
ezP.Delegate.prototype.deinitBlock = function (block) {
}

/**
 * Whether the block has a previous statement.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.hasPreviousStatement_ = function (block) {
  var c8n = block.previousConnection
  return c8n && c8n.isConnected() &&
    c8n.targetBlock().nextConnection === c8n.targetConnection
}

/**
 * Whether the block has a next statement.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.hasNextStatement_ = function (block) {
  return block.nextConnection && block.nextConnection.isConnected()
}

/**
 * The default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {boolean} hidden True if connections are hidden.
 */
ezP.Delegate.prototype.setConnectionsHidden = function (block, hidden) {
}

/**
 * Return all ezp variables referenced by this block.
 * @return {!Array.<string>} List of variable names.
 */
ezP.Delegate.prototype.getVars = function (block) {
  var vars = []
  for (var i = 0, input; (input = block.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field instanceof ezP.FieldInput) {
        vars.push(field.getText())
      }
    }
  }
  return vars
}

/**
 * Same as Block's getDescendants except that it
 * includes this block in the list only when not sealed.
 * @param {!Blockly.Block} block.
 * @return {!Array.<!Blockly.Block>} Flattened array of blocks.
 */
ezP.Delegate.prototype.getWrappedDescendants = function(block) {
  var blocks = [];
  if (!this.wrapped_) {
    blocks.push(block)
  }
  for (var child, x = 0; child = block.childBlocks_[x]; x++) {
    blocks.push.apply(blocks, child.ezp.getWrappedDescendants(child))
  }
  return blocks;
};

/**
 * If the sealed connections are not connected,
 * create a node for it.
 * The default implementation connects all the blocks from the wrappedInputs_ list.
 * Subclassers will evntually create appropriate new nodes
 * and connect it to any sealed connection.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.completeWrapped_ = function (block) {
  if (this.wrappedInputs_) {
    ezP.Delegate.wrappedFireWall = 100
    for (var i = 0; i < this.wrappedInputs_.length; i++) {
      var data = this.wrappedInputs_[i]
      this.completeWrappedInput_(block, data[0], data[1])
    }
  }
}

/**
 * The default implementation does nothing.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.makeBlockWrapped = function (block) {
}

/**
 * The default implementation is false.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 */
ezP.Delegate.prototype.canUnwrap = function(block) {
  return false
}

/**
 * The default implementation does nothing.
 * Subclassers will override this but won't call it.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.makeBlockUnwrapped = function (block) {
}

/**
 * The wrapped blocks are special.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.makeBlockWrapped_ = function (block) {
  if (!block.ezp.wrapped_ && !this.noBlockWrapped(block)) {
    block.ezp.makeBlockWrapped(block)
    block.ezp.wrapped_ = true
  }
}

/**
 * Some block should not be wrapped.
 * Default implementation returns false
 * @param {!Block} block.
 * @return whether the block should be wrapped
 */
ezP.Delegate.prototype.noBlockWrapped = function (block) {
  return false
}

/**
 * The wrapped blocks are special.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.makeBlockUnwrapped_ = function (block) {
  if (block.ezp.wrapped_) {
    block.ezp.makeBlockUnwrapped(block)
    block.ezp.wrapped_ = false
  }
}

/**
 * Get the first enclosing unwrapped block.
 * @param {!Block} block.
 * @param {!Input} input.
 * @param {!String} prototypeName.
 * @return yorn whether a change has been made
 * @private
 */
ezP.Delegate.prototype.getUnwrapped = function (block) {
  var parent = block
  do {
    if (!parent.ezp.wrapped_) {
      break
    }
  } while ((parent = parent.getSurroundParent()))
  return parent
}

/**
 * Complete the wrapped block.
 * When created from dom, the connections are established
 * but the nodes were not created sealed.
 * @param {!Block} block.
 * @param {!Input} input.
 * @param {!String} prototypeName.
 * @return yorn whether a change has been made
 * @private
 */
ezP.Delegate.prototype.completeWrappedInput_ = function (block, input, prototypeName) {
  if (!!input) {
    var target = input.connection.targetBlock()
    if (!!target) {
      target.ezp.makeBlockWrapped_(target)
      target.ezp.completeWrapped_(target)
    } else {
      goog.asserts.assert(prototypeName, 'Missing wrapping prototype name in block '+block.type)
      if (ezP.Delegate.wrappedFireWall > 0) {
        --ezP.Delegate.wrappedFireWall
        var target = block.workspace.newBlock(prototypeName)
        goog.asserts.assert(target, 'completeWrapped_ failed: '+ prototypeName);
        goog.asserts.assert(target.outputConnection, 'Did you declare an Expr block typed '+target.type)
        input.connection.connect(target.outputConnection)
        target.ezp.makeBlockWrapped_(target)
        target.ezp.completeWrapped_(target)  
      } else {
        console.log('Maximum value reached in completeWrappedInput_ (circular)')
        this.ignoreCompleteWrapped = true
        return
      }
    }
    target.id = block.id+'.wrapped:'+input.name
  }
}

/**
 * Will connect this block's connection to another connection.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} connection
 * @param {!Blockly.Connection} childConnection
 */
ezP.Delegate.prototype.willConnect = function(block, connection, childConnection) {
  // console.log('will connect')
}

/**
 * Did connect this block's connection to another connection.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} connection what has been connected in the block
 * @param {!Blockly.Connection} oldTargetConnection what was previously connected in the block
 * @param {!Blockly.Connection} oldConnection what was previously connected to the new targetConnection
 */
ezP.Delegate.prototype.didConnect = function(block, connection, oldTargetConnection, oldConnection) {
  // console.log('did connect')
}

/**
 * Will disconnect this block's connection.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} blockConnection
 */
ezP.Delegate.prototype.willDisconnect = function(block, blockConnection) {
  // console.log('will disconnect')
}

/**
 * Did connect this block's connection to another connection.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} blockConnection
 * @param {!Blockly.Connection} oldTargetConnection that was connected to blockConnection
 */
ezP.Delegate.prototype.didDisconnect = function(block, blockConnection, oldTargetConnection) {
  // console.log('did disconnect')
}

/**
 * In a connection, the inferior block's delegate may have a plugged_.
 * This is used for example to distinguish generic blocks such as identifiers.
 * An identifier is in general a variable name but sometimes it cannot be.
 * module names are such an example.
 * @private
 */
ezP.Delegate.prototype.plugged_ = undefined

/**
 * Can remove and bypass the parent?
 * If the parent's output connection is connected,
 * can connect the block's output connection to it?
 * The connection cannot always establish.
 * @param {!Block} block.
 * @param {!Block} other the block to be replaced
 */
ezP.Delegate.prototype.canReplaceBlock = function (block, other) {
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
ezP.Delegate.prototype.removeInput = function(block, input, opt_quiet) {
  if (input.block === block) {
    if (input.connection && input.connection.isConnected()) {
      input.connection.setShadowDom(null);
      var block = input.connection.targetBlock();
      block.unplug();
    }
    input.dispose();
    this.inputList.splice(i, 1);
    return;
  }
  if (!opt_quiet) {
    goog.asserts.fail('Input "%s" not found.', name);
  }
}

/**
 * When the output connection is connected,
 * returns the input holding the parent's corresponding connection.
 * @param {!Blockly.Block} block The owner of the delegate.
 * @return an input.
 */
ezP.Delegate.prototype.getParentInput = function(block) {
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
ezP.Delegate.prototype.getStatementCount = function (block) {
  var n = 1
  var hasActive = false
  var hasNext = false
  var e8r = block.ezp.inputEnumerator(block)
  while (e8r.next()) {
    var c8n = e8r.here.connection
    if (c8n && c8n.type === Blockly.NEXT_STATEMENT) {
      hasNext = true
      if (c8n.isConnected()) {
        var target = c8n.targetBlock()
        do {
          hasActive = hasActive || (!target.disabled && !target.ezp.isWhite(target))
          n += target.ezp.getStatementCount(target)
        } while ((target = target.getNextBlock()))
      }
    }
  }
  return n + (hasNext && !hasActive? 1: 0)
}

/**
 * Whether this block is white. White blocks have no effect,
 * the action of the algorithm is exactly the same whether the block is here or not.
 * White blocks are comment statements, disabled blocks
 * and maybe other kinds of blocks to be found...
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @param {!array} components the array of python code strings, will be joined to make the code.
 * @return None
 */
ezP.Delegate.prototype.isWhite = function (block) {
  return block.disabled
}

/**
 * Get the next connection of this block.
 * Comment and disabled blocks are transparent with respect to connection checking.
 * If block
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.Delegate.prototype.getNextConnection = function (block) {
  while(block.ezp.isWhite(block)) {
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
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.Delegate.prototype.getPreviousConnection = function (block) {
  while(block.ezp.isWhite(block)) {
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
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return None
 */
ezP.Delegate.prototype.setDisabled = function (block, yorn) {
  if (!!block.disabled === !!yorn) {
    // nothing to do the block is already in the good state
    return
  }
  var grouper = new ezP.Events.Grouper()
  var previous, next
  try {
    if (yorn) {
      block.setDisabled(true)
      // Does it break next connections
      if ((previous = block.previousConnection)
      && (next = previous.targetConnection)
      && next.ezp.getBlackConnection()) {
        while ((previous = block.nextConnection)
        && (previous = previous.targetConnection)
        && (previous = previous.ezp.getBlackConnection())) {
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
        if ((previous = next.targetConnection)
        && (previous = previous.ezp.getBlackConnection())
        && !next.checkType_(previous)) {
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
            } else if (!target.ezp.isWhite(target)) {
              // the black connection is reached, no need to go further
              // but the next may have change and the checkType_ must
              // be computed once again
              if (!next.checkType_(previous)) {
                target.unplug()
                target.bumpNeighbours_();
              }
              break
            }
          } while ((previous = previous.ezp.getConnectionBelow()))
        }
      }
      // now consolidate the chain above
      if ((previous = block.previousConnection)) {
        if ((next = previous.targetConnection)
        && (next = next.ezp.getBlackConnection())
        && !previous.checkType_(next)) {
          // find  white block in the above chain that can be activated
          // stop before the black connection found just above
          next = previous.targetConnection
          do {
            var target = next.getSourceBlock()
            if (target.disabled) {
              target.disabled = false
              var check = previous.checkType_(next)
              target.disabled = true
              if (check) {
                target.setDisabled(false)
                if (!(previous = target.previousConnection)) {
                  break
                }
              }
            } else if (!target.ezp.isWhite(target)) {
              // the black connection is reached, no need to go further
              // but the next may have change and the checkType_ must
              // be computed once again
              if (!next.checkType_(previous)) {
                target = previous.getSourceBlock()
                target.unplug()
                target.bumpNeighbours_();
              }
              break
            }
          } while ((next = next.ezp.getConnectionAbove()))
        }
      }
    }
  } finally {
    grouper.stop()
  }
}

/**
 * The xml type of this block, as it should appear in the saved data.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.Delegate.prototype.xmlType = function (block) {
  return this.xmlType_
}

/**
 * Input enumerator
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @return true if the given value is accepted, false otherwise
 */
ezP.Delegate.prototype.inputEnumerator = function (block, all) {
  return ezP.Do.Enumerator(block.inputList, all? undefined: function(x) {
    return !x.ezp.disabled_
  })
}

/**
 * Set the error
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {!string} key
 * @param {!string} msg
 * @return true if the given value is accepted, false otherwise
 */
ezP.Delegate.prototype.setError = function (block, key, msg) {
  this.errors[key] = {
    message: msg,
  }
}

/**
 * get the error
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {!string} key
 * @return true if the given value is accepted, false otherwise
 */
ezP.Delegate.prototype.getError = function (block, key) {
  return this.errors[key]
}

/**
 * get the error
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {!string} key
 * @return true if the given value is accepted, false otherwise
 */
ezP.Delegate.prototype.removeError = function (block, key) {
  delete this.errors[key]
}

