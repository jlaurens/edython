/**
 * ezPython
 *
 * Copyright 2017 Jérôme LAURENS.
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
ezP.Delegate = function (prototypeName) {
  ezP.Delegate.superClass_.constructor.call(this)
  this.initModel()
}
goog.inherits(ezP.Delegate, ezP.Helper)

/**
 * Inits the various input data.
 * Called by the constructor.
 * Separated to be mixed in.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.Delegate.prototype.initModel = function (prototypeName) {
  this.inputModel_ = {}
}

ezP.Delegate.prototype.inputModel = undefined
ezP.Delegate.prototype.outputModel = undefined
ezP.Delegate.prototype.statementModel = undefined

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
   * Get the inputModel for that prototypeName.
   * @param {?string} prototypeName Name of the language object containing
   * @return void object if no delegate is registered for that name
   */
  me.getInputModel = function (prototypeName) {
    var Ctor = Ctors[prototypeName]
    return Ctor? Ctor.prototype.inputModel: {}
  }
  /**
   * Get the outputModel for that prototypeName.
   * @param {?string} prototypeName Name of the language object containing
   * @return void object if no delegate is registered for that name
   */
  me.getOutputModel = function (prototypeName) {
    var Ctor = Ctors[prototypeName]
    return Ctor? Ctor.prototype.outputModel: {}
  }
  /**
   * Get the statementModel for that prototypeName.
   * @param {?string} prototypeName Name of the language object containing
   * @return void object if no delegate is registered for that name
   */
  me.getStatementModel = function (prototypeName) {
    var Ctor = Ctors[prototypeName]
    return Ctor? Ctor.prototype.statementModel: {}
  }
  /**
   * Delegate registrator.
   * 
   * Computes and caches inputModel, outputModel and statementModel
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
    // the input data are constructed below with inheritance support
    // as side effect of manager creation but this is immutability design
    var dlgt = me.create(prototypeName)
    var D = dlgt.inputModel_
    if (D && Object.keys(D).length) {
      Ctor.prototype.inputModel = D
      if (D.first) {
        D.first.check = ezP.Do.ensureArray(D.first.check||D.first.wrap)
      }
      if (D.middle) {
        D.middle.check = ezP.Do.ensureArray(D.middle.check||D.middle.wrap)
      }
      if (D.last) {
        D.last.check = ezP.Do.ensureArray(D.last.check||D.last.wrap)
      }
    }
    if ((D = dlgt.outputModel_) && Object.keys(D).length) {
      Ctor.prototype.outputModel = D
      D.check = ezP.Do.ensureArray(D.check)
    }
    if ((D = dlgt.statementModel_) && Object.keys(D).length) {
      Ctor.prototype.statementModel = D
      try {
        D.previous.check = ezP.Do.ensureArray(D.previous.check)
        D.next.check = ezP.Do.ensureArray(D.next.check)
      } finally {}
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
          k = k.replace('ezp_', 'ezp_fake_')
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
ezP.Delegate.prototype.pythonType_ = undefined

/**
 * The real type of the owning block.
 * There are fake blocks initially used for debugging purposes.
 * For a block type ezp_fake_foo, the delegate type is ezp_foo.
 */
ezP.Delegate.prototype.type_ = undefined

/**
 * Set the [python ]type of the delegate according to the type of the block.
 * @param {!Blockly.Block} block to be initialized..
 * @constructor
 */
ezP.Delegate.prototype.setupType = function (block) {
  var regex = new RegExp("^ezp_((?:fake_)?(.*))$")
  var m = regex.exec(block.type)
  this.pythonType_ = m? m[1]: block.type
  this.type_ = m? 'ezp_'+m[2]: block.type
}

/**
 * Initialize a block.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
ezP.Delegate.prototype.initBlock = function (block) {
  this.setupType(block)
  var D = this.outputModel_
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
  } else if ((D = this.statementModel_) && Object.keys(D).length) {
    if (D.key) {
      block.appendStatementInput(D.key).setCheck(D.check) // Check ?
    }
    if (D.next) {
      block.setNextStatement(true, D.next.check)
    }
    if (D.previous) {
      block.setPreviousStatement(true, D.previous.check)
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
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} element dom element to be completed.
 */
ezP.Delegate.prototype.toDom = function (block, element) {
}

/**
 * Final tune up depending on the block.
 * Default implementation calls `completeWrapped_`.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden a dom element.
 */
ezP.Delegate.prototype.fromDom = function (block, element) {
  this.completeWrapped_(block)
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
  if (Blockly.Events.recordUndo && this.wrappedInputs_) {
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
