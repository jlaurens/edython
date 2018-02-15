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
goog.provide('ezP.TupleConsolidator')

goog.require('ezP.Helper')
goog.require('Blockly.Blocks')

goog.require('ezP.T3')
goog.forwardDeclare('ezP.Block')

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
  this.inputData_ = {}
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
   * Delegate registrator.
   * @param {?string} prototypeName Name of the language object containing
   * @param {Object} constructor
   */
  me.registerDelegate = function (prototypeName, Ctor) {
    // console.log(prototypeName+' -> '+Ctor)
    Ctors[prototypeName] = Ctor
    goog.asserts.assert(me.create(prototypeName), 'Registration failure: '+prototypeName)
    if (!Ctor.prototype.inputData || !Object.keys(Ctor.prototype.inputData).length) {
      var dlgt = me.create(prototypeName)
      Ctor.prototype.inputData = dlgt.inputData_
      Ctor.prototype.outputCheck = dlgt.outputCheck
      //console.log(prototypeName, Ctor.prototype.inputData)
      // the input data has been constructed with inheritance support
      // but this is immutable
    } else if (!Ctor.prototype.statementData_ || !Object.keys(Ctor.prototype.statementData_).length) {
      var dlgt = me.create(prototypeName)
      Ctor.prototype.statementData_ = dlgt.statementData__
      Ctor.prototype.previousCheck = dlgt.previousCheck
      Ctor.prototype.nextCheck = dlgt.nextCheck
      // console.log(prototypeName, Ctor.prototype.statementData_)
      // the input data has been constructed with inheritance support
      // but this is immutability design
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
      throw "Unknown block ezP.T3.Expr ot ezP.T3.Stmt key: "+key
    }
    me.registerDelegate(prototypeName, Ctor)
    available.push(prototypeName)
    Blockly.Blocks[prototypeName] = {}
  }
  me.registerAll = function (keyedPrototypeNames, Ctor, fake) {
    var k
    for (k in keyedPrototypeNames) {
      k = keyedPrototypeNames[k]
      if (typeof k === 'string' || k instanceof String) {
//        console.log('Registering', k)
        me.registerDelegate(k, Ctor)
        if (fake) {
          k = k.replace('ezp_', 'ezp_fake_')
//          console.log('Registering', k)
          me.registerDelegate(k, Ctor)
        }
      }
    }
  }
  me.registerDefault = function (Ctor) {
    // console.log(prototypeName+' -> '+Ctor)
    Ctors['ezp_default'] = Ctor
    return defaultDelegate = new Ctor('ezp_default')
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

Blockly.Block.prototype.ezp = ezP.Delegate.Manager.registerDefault(ezP.Delegate)

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
 * @param {!Block} block.
 * @return {Number} The max number of inputs. null for unlimited.
 * @private
 */
ezP.Delegate.prototype.getInputTupleMax = function (block, grp) {
  return null
}

ezP.Delegate.prototype.tupleConsolidate = function (block) {
  var C = this.tupleConsolidator
  if (!C) {
    C = this.tupleConsolidator = new ezP.TupleConsolidator_()
  }
  C(block)
}

ezP.TupleConsolidator_ = function () {
  var block
  var list, i, input // list of inputs, index, element at index
  var tuple, grp, n, sep // ezPython data, group, index, separator
  var start, end, connected, max
  var hidden
  var c8n
  var getCurrent = function (_) {
    if ((input = list[i])) {
      tuple = input.ezpTuple
      c8n = input.connection
      goog.asserts.assert(!tuple || c8n, 'Tuple item must have a connection')
      return input
    }
    tuple = c8n = null
    return null
  }
  var getNext = function () {
    ++i
    return getCurrent()
  }
  var rewind = function (_) {
    n = 0
    i = start
    return getCurrent()
  }
  var isTuple = function () {
    return input && (tuple = input.ezpTuple)
  }
  var disposeNotAtI = function (notI) {
    list[notI].dispose()
    list.splice(notI, 1)
    --end
  }
  var disposeAtI = function () {
    list[i].dispose()
    list.splice(i, 1)
    --end
    getCurrent()
  }
  var disposeFromI = function (bound) {
    bound = Math.min(bound, end)
    while (i < bound) {
      disposeNotAtI(i)
      --bound
    }
    getCurrent()
  }
  var disposeToI = function (bound) {
    bound = Math.max(bound, start)
    while (bound < i) {
      disposeNotAtI(bound)
      --i
    }
  }
  var insertPlaceholderAtI = function () {
    c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, '_', block, c8n)
    list.splice(i, 0, input)
    ++end
    tuple = input.ezpTuple = {}
  }
  var insertSeparatorAtI = function () {
    insertPlaceholderAtI()
    tuple.isSeparator = true
  }
  var doFinalizeSeparator = function (extreme) {
    tuple.grp = grp
    tuple.n = n
    tuple.sep = sep
    input.name = 'S7R_' + grp + '_' + n
    tuple.isSeparator = c8n.ezp.s7r_ = true
    c8n.setHidden(hidden)
    if (extreme) {
      tuple.hidden = hidden
      while (input.fieldRow.length) {
        input.fieldRow.shift().dispose()
      }
    } else if (!input.fieldRow.length) {
      input.appendField(new ezP.FieldLabel(sep || ','))
    }
  }
  var doFinalizePlaceholder = function () {
    tuple.grp = grp
    tuple.n = n
    tuple.sep = sep
    input.name = 'TUPLE_' + grp + '_' + n++
    tuple.isSeparator = c8n.ezp.s7r_ = false
  }
  var doGroup = function () {
    // group bounds and connected
    n = 0
    sep = tuple.sep || ','
    connected = 0
    start = i
    var removeSep = false
    var placeholder
    do {
      if (c8n.isConnected()) {
        ++connected
        removeSep = tuple.isSeparator = false
      } else if (removeSep) {
        disposeNotAtI(i--)
      } else if (!tuple.isSeparator) {
        // remove separators before
        while (i > start) {
          if (!list[i - 1].ezpTuple.isSeparator) {
            break
          }
          disposeNotAtI(--i)
        }
        removeSep = tuple.isSeparator = true
        placeholder = i
      }
      if (!max || connected < max) {
        if (!getNext() || !isTuple()) {
          break
        }
      } else {
        while (getNext() && isTuple()) {
          if (c8n.isConnected()) {
            c8n.targetBlock().unplug()
            disposeAtI()
          } else if (removeSep) {
            disposeNotAtI(i--)
          } else if (!tuple.isSeparator) {
            // remove separators before
            while (i > start) {
              if (!list[i - 1].ezpTuple.isSeparator) {
                break
              }
              disposeNotAtI(--i)
            }
            removeSep = tuple.isSeparator = true
          }
        }
        break
      }
    } while (true)
    end = i// this group has index [start, end[
    hidden = max !== null && connected >= max
    rewind()
    if (connected) {
      if (!tuple.isSeparator) {
        insertSeparatorAtI()
      }
      doFinalizeSeparator(true)
      while (n < connected) { // eslint-disable-line no-unmodified-loop-condition
        getNext()
        while (tuple.isSeparator) {
          disposeAtI()
        }
        doFinalizePlaceholder() // increment n
        getNext()
        if (!tuple || !tuple.isSeparator) {
          insertSeparatorAtI()
        }
        doFinalizeSeparator(i === end - 1)
      }
      while (getNext() && isTuple()) {
        disposeAtI()
      }
    } else if (placeholder !== undefined) {
      i = placeholder
      getCurrent()
      tuple.isSeparator = false
      doFinalizePlaceholder()
      disposeToI(start)
      getNext()
      disposeFromI(end)
    } else {
      disposeToI(start)
      insertPlaceholderAtI()
      doFinalizePlaceholder()
      getNext()
    }
  }
  var consolidator = function (block_) {
    block = block_
    var ezp = block.ezp
    if (!ezp) {
      return
    }
    list = block.inputList
    i = start = end = 0
    tuple = grp = n = sep = input = undefined
    rewind()
    do {
      if (isTuple()) {
        grp = 0
        max = ezp.getInputTupleMax(block, grp)
        doGroup()
        do {
          tuple = grp = n = sep = input = undefined
          if (isTuple()) {
            ++grp
            max = ezp.getInputTupleMax(block, grp)
            doGroup()
          }
        } while (getNext())
        return
      }
    } while (getNext())
  }
  return consolidator
}

/**
 * Fetches the named input object.
 * @param {!Blockly.Block} block.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 * The undefined return value for the default block getInput implementation.
 */
ezP.Delegate.prototype.getInputTuple_ = function (block, name) {
  if (!name.length) {
    return null
  }
  var L = name.split('_')
  if (L.length !== 3 || L[0] !== 'TUPLE') {
    return null
  }
  var grp = parseInt(L[1])
  if (isNaN(grp)) {
    return null
  }
  var n = parseInt(L[2])
  if (isNaN(n)) {
    return null
  }
  var max = this.getInputTupleMax(block, grp)
  if (max !== null && n >= max) {
    return null
  }
  this.tupleConsolidate(block)
  var list = block.inputList
  var i = 0
  var input
  while ((input = list[i])) {
    var tuple = input.ezpTuple
    if (!tuple || tuple.grp !== grp) {
      ++i
      continue
    }
    var already = 0
    do {
      if (!tuple.isSeparator) {
        if (tuple.n === n) {
          return input
        }
        ++already
      } else {
        var sep = tuple.sep
      }
    } while ((input = list[++i]) && (tuple = input.ezpTuple) && tuple.grp === grp)
    max = this.getInputTupleMax(block, grp)
    if (max !== null && already + 1 >= max) {
      return null
    }
    var c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, 'S7R_' + grp + '_' + (n + 1), block, c8n)
    tuple = input.ezpTuple = {grp: grp, n: n + 1, sep: sep, isSeparator: true}
    input.appendField(new Blockly.FieldLabel(tuple.sep || ','))
    list.splice(i, 0, input)
    c8n = block.makeConnection_(Blockly.INPUT_VALUE)
    input = new Blockly.Input(Blockly.INPUT_VALUE, name, block, c8n)
    tuple = input.ezpTuple = {grp: grp, n: n, sep: sep}
    list.splice(i, 0, input)
    return input
  }
  return null
}

/**
 * The default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {boolean} hidden True if connections are hidden.
 * @override
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
      if (field instanceof ezP.FieldVariable) {
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
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden a dom element.
 */
ezP.Delegate.prototype.fromDom = function (block, element) {
}
/**
 * Same as Block's getDescendants except that it
 * includes this block in the list only when not sealed.
 * @param {!Blockly.Block} block.
 * @return {!Array.<!Blockly.Block>} Flattened array of blocks.
 */
ezP.Delegate.prototype.getUnsealedDescendants = function(block) {
  var blocks = [];
  if (!this.wrapped_) {
    blocks.push(block)
  }
  for (var child, x = 0; child = block.childBlocks_[x]; x++) {
    blocks.push.apply(blocks, child.ezp.getUnsealedDescendants(child))
  }
  return blocks;
};


/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden a dom element.
 */
ezP.Delegate.prototype.fromDom = function (block, element) {
  this.completeWrapped_(block)
}

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
 * The wrapped blocks are special.
 * @param {!Block} block.
 * @private
 */
ezP.Delegate.prototype.makeBlockWrapped_ = function (block) {
  if (!block.ezp.wrapped_) {
    block.ezp.wrapped_ = true
    block.ezp.makeBlockWrapped(block)
  }
}

/**
 * Complete the wrapped block.
 * When created from dom, the connections are established
 * but the nodes were not created sealed.
 * @param {!Block} block.
 * @param {!Input} input.
 * @param {!String} prototypeName.
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
 * @param {!Blockly.Connection} connection what was connected in the block
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
 */
ezP.Delegate.prototype.canBypassAndRemoveParent = function (block) {
  return false
}

