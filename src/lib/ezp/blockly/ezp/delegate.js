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
goog.provide('ezP.Mixin')

goog.require('ezP.Helper')
goog.require('Blockly.Blocks')

goog.require('ezP.T3')
goog.forwardDeclare('ezP.Block')

/**
 * mixin manager.
 * Adds mixin contents to constructor's prototype
 * if not already there.
 * Using strings as parameters is a facility that
 * must not be used in case the constructor is meant
 * to replace an already registered one.
 * For objects in constructor.mixins, does a mixin
 * on the constructor's prototype
 * Mixins do not play well with inheritance.
 * For ezPython.
 * @param {!constructor} constructor is either a constructor or the name of a constructor.
 */
ezP.Mixin = function (constructor) {
  var C = ezP.Delegate.Manager.get(constructor) || constructor
  var Ms = goog.isArray(mixins)? mixins:
  mixins? [mixins]: C.mixins
  if (Ms) {
    var target = C.prototype
    for (var i = 0, m; (m = Ms[i++]);) {
      var source = ezP.Mixin[m] || m
      for (var x in source) {
        if (!target.hasOwnProperty(x)) {
          target[x] = source[x]
        }
      }
    }
  }
}

/**
 * Class for a Block Delegate.
 * Not normally called directly, ezP.Delegate.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
console.warn('Remove the model__ below')
ezP.Delegate = function (prototypeName) {
  ezP.Delegate.superClass_.constructor.call(this)
  this.properties = {}
  this.model__ = {
    input: {},
    output: {},
    statement: {},
  }
}
goog.inherits(ezP.Delegate, ezP.Helper)

/**
 * Delegate manager.
 * @param {?string} prototypeName Name of the language object containing
 */
ezP.Delegate.Manager = function () {
  var me = {}
  var Ctors = {}
  var defaultCtor = undefined
  var defaultDelegate = undefined
  /**
   * Helper to initialize a block's input mode.
   * to and from are 1 depth tree.
   * @param {!Object} to  destination.
   * @param {!Object} from  source.
   */
  var mixinModel = function (to, from, ignore) {
    for (var k in from) {
      if(ignore && ignore(k)) {
        continue
      }
      var from_d = from[k]
      // next is my test for a dictionary, hence my meaning of dictionary
      // in that context
      if (from_d && Object.keys(from_d).length === Object.getOwnPropertyNames(from_d).length) {
        // we have a dictionary, do a mixin
        var to_d = to[k]
        if (to_d) {
          if (Object.keys(to_d).length !== Object.getOwnPropertyNames(to_d).length) {
            to_d = to[k] = {}
          }
        } else {
          to_d = to[k] = {}
        }
        mixinModel(to_d, from_d)
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
   * Private helper to provide the constructor with a getInputModel.
   * @param {?Object} Ctor a constructor
   */
  var helper = function(Ctor, inputModel) {
    if (Ctor.model_) {
      return Ctor.model_
    }
    var model = {
      input: {},
      output: {},
      statement: {},
    }
    if (Ctor !== ezP.Delegate && Ctor.superClass_) {
      mixinModel(model, helper(Ctor.superClass_.constructor))
    }
    if (Ctor.model__) {
      if (goog.isFunction(Ctor.model__)) {
        model = Ctor.model__(model)
      } else if (Object.keys(Ctor.model__).length) {
        mixinModel(model, Ctor.model__)
      }
      delete Ctor.model__
    }
    if (inputModel) {
      mixinModel(model.input, inputModel)
    }
    Ctor.model_ = model
    Ctor.prototype.getModel = function() {
      return Ctor.model_
    }
    return Ctor.model_
  }
  /**
   * Method to create the constructor of a subclass.
   * Registers the subclass too.
   */
  me.makeSubclass = function(key, model, parent, owner) {    
    var Ctor = (owner||parent)[key] = function (prototypeName) {
      Ctor.superClass_.constructor.call(this, prototypeName)
    }
    goog.inherits(Ctor, parent)
    ezP.DelegateSvg.Manager.registerDelegate_(ezP.T3.Expr[key]||ezP.T3.Stmt[key], Ctor)
    if (goog.isFunction(model)) {
      model = model()
    }
    if (model) {
      if (!goog.isFunction(model)) {
        if((model.input && (t = model.input.insert))) {
          var otherCtor = goog.isFunction(t)? t: me.get(t)
          goog.asserts.assert(otherCtor, 'Not inserted: '+t)
          var otherModel = otherCtor.prototype.getModel()
          if (otherModel.input) {
            Ctor.prototype.getModel = function() {
              return helper(Ctor, otherModel.input)
            }
          }
          delete model.input.insert
        }
        var t = ezP.T3.Expr[key]
        if (t) {
          if (!model.output) {
            model.output = {
              check: t,
            }
          }
        } else if ((t = ezP.T3.Stmt[key])) {
          var statement = model.statement || (model.statement = {})
          if (!statement.previous) {
            statement.previous = {
              check: ezP.T3.Stmt.Previous[key]
            }
          }
          if (!statement.next) {
            statement.next = {
              check: ezP.T3.Stmt.Next[key]
            }
          }
        }
      }
      Ctor.model__ = model
    }
  }
  /**
   * Delegate instance creator.
   * @param {?string} prototypeName Name of the language object containing
   */
  me.create = function (prototypeName, delegate) {
    if (delegate && delegate !== defaultDelegate) {
      return delegate
    }
    var Ctor = Ctors[prototypeName]
    goog.asserts.assert(Ctor, 'No delegate for '+prototypeName)
    return new Ctor(prototypeName)
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
  me.getInputModel = function (prototypeName) {
    var Ctor = Ctors[prototypeName]
    if (Ctor) {
      var model = Ctor.prototype.getModel()
      return model && model.input
    }
    return {}
  }
  /**
   * Get the output model for that prototypeName.
   * @param {?string} prototypeName Name of the language object containing
   * @return void object if no delegate is registered for that name
   */
  me.getOutputModel = function (prototypeName) {
    var Ctor = Ctors[prototypeName]
    if (Ctor) {
      var model = Ctor.prototype.getModel()
      return model && model.output
    }
    return {}
  }
  /**
   * Get the statement model for that prototypeName.
   * @param {?string} prototypeName Name of the language object containing
   * @return void object if no delegate is registered for that name
   */
  me.getStatementModel = function (prototypeName) {
    var Ctor = Ctors[prototypeName]
    if (Ctor) {
      var model = Ctor.prototype.getModel()
      return model && model.statement
    }
    return {}
  }
  /**
   * Delegate registrator.
   * 
   * Computes and caches the model
   * only once from the creation of the delegate.
   * 
   * The last delegate registered for a given prototype name wins.
   * @param {?string} prototypeName Name of the language object containing
   * @param {Object} constructor
   * @private
   */
  me.registerDelegate_ = function (prototypeName, Ctor) {
    // console.log(prototypeName+' -> '+Ctor)
    Ctors[prototypeName] = Ctor
    goog.asserts.assert(me.create(prototypeName), 'Registration failure: '+prototypeName)
    // cache all the input, output and statement data at the prototype level
    Ctor.prototype.getModel = function () {
      return helper(Ctor)
    }
  }
  /**
   * Handy method to register an expression or statement block.
   */
  me.register = function (key) {
    var prototypeName = ezP.T3.Expr[key]
    var Ctor = undefined
    var available = undefined
    if (prototypeName) {
      Ctor = ezP.Delegate[key]
      available = ezP.T3.Expr.Available
    } else if ((prototypeName = ezP.T3.Stmt[key])) {
      Ctor = ezP.Delegate[key]
      available = ezP.T3.Stmt.Available
    } else {
      throw "Unknown block ezP.T3.Expr or ezP.T3.Stmt key: "+key
    }
    ezP.Mixin(Ctor)
    me.registerDelegate_(prototypeName, Ctor)
    available.push(prototypeName)
    Blockly.Blocks[prototypeName] = {}
  }
  me.registerAll = function (keyedPrototypeNames, Ctor, fake) {
    var k
    for (k in keyedPrototypeNames) {
      k = keyedPrototypeNames[k]
      if (typeof k === 'string' || k instanceof String) {
//        console.log('Registering', k)
        me.registerDelegate_(k, Ctor)
        if (fake) {
          k = k.replace('ezp:', 'ezp:fake_')
//          console.log('Registering', k)
          me.registerDelegate_(k, Ctor)
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

// register this delegate for all the T3 types

ezP.Delegate.Manager.registerAll(ezP.T3.Expr, ezP.Delegate)
ezP.Delegate.Manager.registerAll(ezP.T3.Stmt, ezP.Delegate)

/**
 * The python type of the owning block.
 */
ezP.Delegate.prototype.pythonSort_ = undefined

/**
 * The real type of the owning block.
 * There are fake blocks initially used for debugging purposes.
 * For a block type ezp:fake_foo, the delegate type is ezp:foo.
 */
ezP.Delegate.prototype.type_ = undefined

/**
 * Set the [python ]type of the delegate according to the type of the block.
 * @param {!Blockly.Block} block to be initialized..
 * @constructor
 */
ezP.Delegate.prototype.setupType = function (block) {
  var m = /^ezp:((?:fake_)?((.*?)(?:_concrete)?))$/.exec(block.type)
  this.pythonSort_ = m? m[1]: block.type
  this.type_ = m? 'ezp:'+m[2]: block.type
  this.xmlType_ = m? m[3]: block.type
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
    if (goog.isFunction(D.willConnect)) {
      ezp.willConnect = D.willConnect
    }
    if (goog.isFunction(D.didConnect)) {
      ezp.didConnect = D.didConnect
    }
    if (goog.isFunction(D.willDisconnect)) {
      ezp.willDisconnect = D.willDisconnect
    }
    if (goog.isFunction(D.didDisconnect)) {
      ezp.didDisconnect = D.didDisconnect
    }
    if (D.do && Object.keys(D.do).length) {
      goog.mixin(ezp, D.do)
    }
  } else if ((D = this.getModel().statement) && Object.keys(D).length) {
    if (D.key) {
      var input = block.appendStatementInput(D.key).setCheck(D.check) // Check ?
    }
    var F = function(D, c8n) {
      var ezp = c8n.ezp
      if (goog.isFunction(D.willDisconnect)) {
        ezp.willDisconnect = D.willDisconnect
      }
      if (goog.isFunction(D.didDisconnect)) {
        ezp.didDisconnect = D.didDisconnect
      }
      if (goog.isFunction(D.willConnect)) {
        ezp.willConnect = D.willConnect
      }
      if (goog.isFunction(D.didConnect)) {
        ezp.didConnect = D.didConnect
      }
    }
    if (D.next) {
      block.setNextStatement(true, D.next.check)
      F(D.next, block.nextConnection)
    }
    if (D.previous) {
      block.setPreviousStatement(true, D.previous.check)
      F(D.previous, block.previousConnection)
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
      if (field instanceof ezP.FieldIdentifier) {
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
        target.ezp.makeBlockWrapped_(target)
        goog.asserts.assert(target.outputConnection, 'Did you declare an Expr block typed '+target.type)
        input.connection.connect(target.outputConnection)
        input.connection.ezp.disabled_ = true
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
 * Whether the block is not a variable.
 * @param {!Blockly.Block} block
 */
ezP.Delegate.prototype.isNotAVariable = function(block) {
  return this.plugged_ && ezP.T3.Expr.Check.not_a_variable.indexOf(this.plugged_)<0
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
      if (block.isShadow()) {
        // Destroy any attached shadow block.
        block.dispose();
      } else {
        // Disconnect any attached normal block.
        block.unplug();
      }
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
 * Convert the block to python code.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver, to be converted to python.
 * @constructor
 */
ezP.Delegate.prototype.toPython = function (block) {
  goog.asserts.assert(false, 'Missing toPython implementation for '+block.type)
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
          hasActive = hasActive || (!target.disabled && target.type !== ezP.T3.Stmt.comment_stmt)
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
  Blockly.Events.setGroup(true)
  var previous, next
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
  Blockly.Events.setGroup(false)
}

/**
 * Get the value of the block.
 * Used for simple blocks, form and to dom.
 * Default implementation returns the subtype.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {?string} value
 */
ezP.Delegate.prototype.getValue = function (block) {
  return block.ezp.getSubtype(block)
}

/**
 * Set the value of the block.
 * Used for simple blocks, form and to dom.
 * Default implementation sets the subtype.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {?string} value
 * @return true if the given value is accepted, false otherwise
 */
ezP.Delegate.prototype.setValue = function (block, value) {
  return block.ezp.setSubtype(block, value)
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
    return !x.ezpData.disabled_
  })
}

/**
 * Whether the named property for the given block exists.
 * Undo compliant.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} deep Whether to unlock statements too.
 * @return the number of block locked
 */
ezP.Delegate.prototype.hasProperty = function (block, key) {
  return !!block.ezp.properties[key+'_']
}

/**
 * Get the named property the given block.
 * Undo compliant.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} deep Whether to unlock statements too.
 * @return the number of block locked
 */
ezP.Delegate.prototype.getProperty = function (block, key) {
  var holder = block.ezp.properties[key+'_']
  return holder && holder.value
}

/**
 * Set the named property of the given block.
 * Undo compliant.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {boolean} deep Whether to unlock statements too.
 * @return the number of block locked
 */
ezP.Delegate.prototype.setProperty = function (block, key, newValue) {
  var holder = block.ezp.properties[key+'_']
  if (!holder) {
    return false
  }
  var oldValue = holder.value
  if (oldValue === newValue) {
    return false
  }
  if (holder.validate_ && !holder.validate_.call(block.ezp, block, oldValue, newValue)) {
    return false
  }
  if (holder.willChange_) {
    holder.willChange_.call(block.ezp, block, oldValue, newValue)
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
    block, ezP.Const.Event.property+':'+key, null, block.ezp[k], yorn))
  }
  holder.value = newValue
  if (holder.didChange_) {
    holder.didChange_.call(block.ezp, block, oldValue, newValue)
  }
  block.render()
  return true
}

/**
 * Init the named property of the given block.
 * Model is an object w.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} key Whether to unlock statements too.
 * @param {Object} value.
 * @param {function} validate.
 * @param {function} willChange.
 * @param {function} didChange.
 * @return the number of block locked
 */
ezP.Delegate.prototype.initProperty = function (block, key, value, validate, willChange, didChange) {
  var k = key+'_'
  var holder = block.ezp.properties[k] || (block.ezp.properties[k] = {})
  holder.value = value
  if (validate && goog.isFunction(validate)) {
    holder.validate = validate
  } else {
    delete holder.validate
  }
  if (willChange && goog.isFunction(willChange)) {
    holder.willChange = willChange
  } else {
    delete holder.willChange
  }
  if (didChange && goog.isFunction(didChange)) {
    holder.didChange = didChange
    didChange(block, undefined, value)
  } else {
    delete holder.didChange
  }
}
