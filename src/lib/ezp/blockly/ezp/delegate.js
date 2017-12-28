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
}
goog.inherits(ezP.Delegate, ezP.Helper)
/**
 * Delegate manager.
 * @param {?string} prototypeName Name of the language object containing
 */
ezP.Delegate.Manager = (function () {
  var me = {}
  var Ctors = {}
  /**
   * Delegate creator.
   * @param {?string} prototypeName Name of the language object containing
   */
  me.create = function (prototypeName) {
    var Ctor = Ctors[prototypeName]
    if (Ctor !== undefined) {
      return new Ctor(prototypeName)
    }
    var Ks = prototypeName.split('_')
    if (Ks[0] === 'ezp') {
      while (Ks.length > 1) {
        Ks.splice(-1, 1)
        var name = Ks.join('_')
        Ctor = Ctors[name]
        if (Ctor !== undefined) {
          Ctor[prototypeName] = Ctor
          return new Ctor(prototypeName)
        }
      }
      Ctors[prototypeName] = ezP.Delegate
      return new ezP.Delegate(prototypeName)
    }
    return undefined
  }
  /**
   * Delegate registrator.
   * @param {?string} prototypeName Name of the language object containing
   * @param {Object} constructor
   */
  me.register = function (prototypeName, Ctor) {
    Ctors[prototypeName] = Ctor
  }
  return me
}())

/**
 * Initialize a block. Nothing to do yet.
 * @param {!Blockly.Block} block to be initialized..
 * @extends {Blockly.Block}
 * @constructor
 */
ezP.Delegate.prototype.init = function (block) {
}

/**
* Deinitialize a block. Nothing to do yet.
* @param {!Blockly.Block} block to be deinitialized..
* @extends {Blockly.Block}
* @constructor
*/
ezP.Delegate.prototype.deinit = function (block) {
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
    tuple.isSeparator = c8n.isSeparatorEZP = true
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
    tuple.isSeparator = c8n.isSeparatorEZP = false
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
 * @param {!Element} hidden True if connections are hidden.
 */
ezP.Delegate.prototype.toDom = function (block, element) {
}

/**
 * Final tune up depending on the block.
 * Default implementation does nothing.
 * @param {!Blockly.Block} block.
 * @param {!Element} hidden True if connections are hidden.
 */
ezP.Delegate.prototype.fromDom = function (block, element) {
}
