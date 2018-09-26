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
goog.require('eYo.Decorate')
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
  this.change = {
    count: 0,
    level: 0
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
 * Increment the change count.
 * The change.count is used to compute some properties that depend
 * on the core state. Some changes induce a change in the change.count
 * which in turn may induce a change in properties.
 * Beware of the stability problem.
 * The change.count is incremented whenever a data changes,
 * a child block changes or a connection changes.
 * This is used by the primary delegate's getType
 * to cache the return value.
 * For edython.
 */
eYo.Delegate.prototype.incrementChangeCount = function () {
  ++ this.change.count
}

/**
 * Begin a mutation.
 * The change level is used to keep track of the cascading mutations.
 * When mutations imply other mutations, there is no need to perform some actions until the original mutation is done.
 * For example, rendering should not be done until all the mutations are made.
 * Changes not only concern the data, they may concern the
 * slot visibility too.
 * For edython.
 */
eYo.Delegate.prototype.changeBegin = function () {
  ++this.change.level
}

/**
 * Ends a mutation.
 * When a change is complete at the top level,
 * the change count is incremented and the receiver
 * is consolidated.
 * This is the only place where consolidation should occur.
 * For edython.
 * @return {Number} the change level
 */
eYo.Delegate.prototype.changeEnd = function () {
  --this.change.level
  if (this.change.level === 0) {
    this.incrementChangeCount()
    this.consolidate()
  }
  return this.change.level
}

/**
 * Begin a mutation
 * For edython.
 */
eYo.Delegate.prototype.changeWrap = function () {
  var args = Array.prototype.slice.call(arguments)
  try {
    this.changeBegin()
    args[0] && args[0].apply(args[1] || this, args.slice(2))
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    this.changeEnd()
  }
}

/**
 * Decorate of change hooks.
 * Returns a function with signature is `foo(whatever) → whatever`
 * `foo` is overriden by the model.
 * The model `foo` can call the builtin `foo` with `this.foo(...)`.
 * `do_it` receives all the parameters that the decorated function will receive.
 * If `do_it` return value is not an object, the change.count is not recorded
 * If `do_it` return value is an object with a `return` property,
 * the `change.count` is recorded such that `do_it` won't be executed
 * until the next `change.count` increment.
 * @param {!String} key, 
 * @param {!Function} do_it
 * @return {!Function}
 */
eYo.Decorate.onChangeCount = function (key, do_it) {
  goog.asserts.assert(goog.isFunction(do_it), 'do_it MUST be a function')
  var saved = key + '_changeCount_saved'
  var cached = key + '_cached'
  return function() {
    if (this[saved] === this.change.count) {
      return this[cached]
    }
    var did_it = do_it.apply(this, arguments)
    if (did_it) {
      this[saved] = this.change.count
      this[cached] = did_it.return  
    }
    return this[cached]
  }
}

/**
 * This methods is a higher state mutator.
 * A primary data change or a primary connection change has just occurred.
 * (Primary meaning that no other change has been performed
 * that has caused the so called primary change).
 * At return type, the block is in a consistent state.
 * All the connections and components are consolidated
 * and are in a consistent state.
 * This method is sent from a `changeEnd` method only.
 * Sends a `consolidate` message to each component of the block.
 * However, there might be some caveats related to undo management,
 * this must be investigated.
 * This method is reentrant and `change.count` aware.
 * This message is sent by:
 * - an expression to its parent when consolidated
 * - a list just before rendering
 * - when removing items from a list
 * - when a list creates a consolidator
 * - when an argument list changes its `ary` or `mandatory`
 * - in the changeEnd method
 * Consolidation will not occur when no change has been
 * preformed since the last consolidation
 * @param {?Boolean} deep
 * @param {?Boolean} force
 * @return {Boolean} true when consolidation occurred
 */
eYo.Delegate.prototype.doConsolidate = function (deep, force) {
  if (!force && (!Blockly.Events.recordUndo || !this.block_.workspace || this.change.level > 1)) {
    // do not consolidate while un(re)doing
    return
  }
  // synchronize everything
  this.synchronizeData()
  this.synchronizeSlots()
  // first the in state
  this.consolidateData()
  this.consolidateSlots(deep, force)
  this.consolidateInputs(deep, force)
  // then the out state
  this.consolidateConnections()
  this.consolidateType()
  this.consolidateSubtype()
}

/**
 * Wraps `doConsolidate`.
 * 
 * 
 */
eYo.Delegate.prototype.consolidate = eYo.Decorate.reentrant_method(
  'consolidate',
  eYo.Decorate.onChangeCount(
    'consolidate',
    eYo.Delegate.prototype.doConsolidate
  )
)

/**
 * Make the data
 * For edython.
 */
eYo.Delegate.prototype.makeData = function () {
  var data = Object.create(null) // just a hash
  var dataModel = this.getModel().data
  var byOrder = []
  var defineProperty = function (k) {
    // make a closure to catch the value of k
    return function () {
      Object.defineProperty(
        this,
        k + '_p',
        {
          get: function () {
            return data[k].get()
          },
          set: function (newValue) {
            data[k].change(newValue)
          }
        }
      )
    }
  }

  for (var k in dataModel) {
    if (eYo.Do.hasOwnProperty(dataModel, k)) {
      var model = dataModel[k]
      if (model) {
        // null models are used to neutralize the inherited data
        if (!model.setup_) {
          model.setup_ = true
          if (goog.isFunction(model.willChange)
            && !goog.isFunction(model.willUnchange)) {
            model.willUnchange = model.willChange
          }
          if (goog.isFunction(model.didChange)
            && !goog.isFunction(model.didUnchange)) {
            model.didUnchange = model.didChange
          }
          if (goog.isFunction(model.isChanging)
            && !goog.isFunction(model.isUnchanging)) {
            model.isUnchanging = model.isChanging
          }
        }
        var d = new eYo.Data(this, k, model)
        if (d.model.main) {
          goog.asserts.assert(!data.main, 'No 2 main data '+k+'/'+this.block_.type)
          data.main = d
        }
        data[k] = d
        defineProperty(k).call(this)
        d.data = data // convenient shortcut
        for (var i = 0, dd; (dd = byOrder[i]); ++i) {
          if (dd.model.order > d.model.order) {
            break
          }
        }
        byOrder.splice(i, 0, d)
      }
    }
  }
  if ((d = this.headData = byOrder[0])) {
    for (i = 1; (dd = byOrder[i]); ++i) {
      d.next = dd
      dd.previous = d
      d = dd
    }
  }
  this.data = data
}

/**
 * Make the Fields
 * For edython.
 */
eYo.Delegate.prototype.makeFields = function () {
  eYo.Slot.makeFields(this, this.getModel().fields)
}

/**
 * Make the contents
 * For edython.
 */
eYo.Delegate.prototype.makeContents = function () {
  eYo.Content.feed(this, this.getModel().contents || this.getModel().fields)
}

/**
 * Make the slots
 * For edython.
 */
eYo.Delegate.prototype.makeSlots = function () {
  this.slots = Object.create(null)
  this.headSlot = this.feedSlots(this.getModel().slots)
}

/**
 * Create the block connections.
 * Called from receiver's initBlock method.
 * For subclassers eventually
 */
eYo.Delegate.prototype.makeConnections = function () {
  // configure the connections
  var block = this.block_
  var model = this.getModel()
  var D
  if ((D = model.output) && Object.keys(D).length) {
    block.setOutput(true) // check is setup in the consolidateConnections
    var eyo = block.outputConnection.eyo
    eyo.model = D
  } else if ((D = model.statement) && Object.keys(D).length) {
    if (D.previous && D.previous.check !== null) {
      block.setPreviousStatement(true)
      block.previousConnection.eyo.model = D.previous
    }
    if (D.next && D.next.check !== null) {
      block.setNextStatement(true)
      block.nextConnection.eyo.model = D.next
    }
    if (D.suite) {
      this.inputSuite = block.appendStatementInput('suite')
      this.inputSuite.connection.eyo.model = D
    }
  }
}

/**
 * Feed the owner with slots built from the model.
 * For edython.
 * @param {!Blockly.Input} input
 */
eYo.Delegate.prototype.feedSlots = function (slotsModel) {
  var slots = this.slots
  var ordered = []
  for (var k in slotsModel) {
    var model = slotsModel[k]
    if (!model) {
      continue
    }
    var order = model.order
    var insert = model.insert
    var slot, next
    if (insert) {
      var model = eYo.Delegate.Manager.getModel(insert)
      if (model) {
        if ((slot = this.feedSlots(model.slots))) {
          next = slot
          do {
            goog.asserts.assert(!goog.isDef(slots[next.key]),
              'Duplicate inserted slot key %s/%s/%s', next.key, insert, block.type)
            slots[next.key] = next
          } while ((next = next.next))
        } else {
          continue
        }
      } else {
        continue
      }
    } else if (goog.isObject(model) && (slot = new eYo.Slot(this, k, model))) {
      goog.asserts.assert(!goog.isDef(slots[k]),
        eYo.Do.format('Duplicate slot key {0}/{1}', k, this.block_.type))
      slots[k] = slot
    } else {
      continue
    }
    slot.order = order
    for (var i = 0; i < ordered.length; i++) {
      // we must not find an aleady existing entry.
      goog.asserts.assert(i !== slot.order,
        eYo.Do.format('Same order slot {0}/{1}', i, this.block_.type))
      if (ordered[i].model.order > slot.model.order) {
        break
      }
    }
    ordered.splice(i, 0, slot)
  }
  if ((slot = ordered[0])) {
    i = 1
    while ((next = ordered[i++])) {
      slot.next = next
      next.previous = slot
      slot = next
    }
  }
  return ordered[0]
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
    this.owner = owner
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
   * to and from are trees.
   * Add to destination all the leafs from source.
   * @param {!Object} to  destination.
   * @param {!Object} from  source.
   */
  var merger = function (to, from, ignore) {
    var from_d
    if ((from.check)) {
      from.check = eYo.Do.ensureArrayFunction(from.check)
    } else if ((from_d = from.wrap)) {
      from.check = eYo.Do.ensureArrayFunction(from_d)
    }
    for (var k in from) {
      if (ignore && ignore(k)) {
        continue
      }
      from_d = from[k]
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
      to.check = eYo.Do.ensureArrayFunction(to.check)
    } else if ((to_d = to.wrap)) {
      to.check = eYo.Do.ensureArrayFunction(to_d)
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
    goog.asserts.assert(eyo, 'Forbidden constructor, `eyo` is missing')
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
      insertModel.heads && merger(model.heads, insertModel.heads)
      insertModel.slots && merger(model.slots, insertModel.slots)
      insertModel.tails && merger(model.tails, insertModel.tails)
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
   * In particular, some blocks share a basic do nothing delegate
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
    eYo.Delegate.Manager.registerDelegate_(eYo.T3.Expr[key] || eYo.T3.Stmt[key] || key, delegateC9r)
    if (goog.isFunction(model)) {
      model = model()
    }
    if (model) {
      // manage the link: key
      var link
      var linkModel = model
      if ((link = model.link)) {
        do {
          var linkC9r = goog.isFunction(link) ? link : me.get(link)
          goog.asserts.assert(linkC9r, 'Not inserted: ' + link)
          var linkModel = linkC9r.eyo.getModel()
          if (linkModel) {
            model = linkModel
          } else {
            break
          }
        } while ((link = model.link))
        model = {}
        linkModel && me.merger(model, linkModel)
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
        model.output.check = eYo.Do.ensureArrayFunction(model.output.check || t)
        model.statement && (model.statement = undefined)
      } else if ((t = eYo.T3.Stmt[key])) {
        var statement = model.statement || (model.statement = Object.create(null))
        if (!statement.previous) {
          statement.previous = Object.create(null)
        }
        if (statement.previous.check) {
          statement.previous.check = eYo.Do.ensureArrayFunction(statement.previous.check)
        } else if (!goog.isNull(statement.previous.check)) {
          statement.previous.check = eYo.Do.ensureArrayFunction(eYo.T3.Stmt.Previous[key])
        }
        if (!statement.next) {
          statement.next = Object.create(null)
        }
        if (statement.next.check) {
          statement.next.check = eYo.Do.ensureArrayFunction(statement.next.check)
        } else if (!goog.isNull(statement.next.check)) {
          statement.next.check = eYo.Do.ensureArrayFunction(eYo.T3.Stmt.Next[key])
        }
        // this is a statement, remove the irrelevant output info
        model.output && (model.output = undefined)
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
   * @param {!Blockly.Block} block
   * @param {?string} prototypeName Name of the language object containing
   */
  me.create = function (block, prototypeName) {
    goog.asserts.assert(!goog.isString(block), 'API DID CHANGE, update!')
    var DelegateC9r = C9rs[prototypeName || block.type]
    goog.asserts.assert(DelegateC9r, 'No delegate for ' + prototypeName || block.type)
    var d = DelegateC9r && new DelegateC9r(block)
    d && d.setupType(prototypeName)
    return d
  }
  /**
   * Get the Delegate constructor for the given prototype name.
   * @param {?string} prototypeName Name of the language object containing
   */
  me.get = function (prototypeName) {
    goog.asserts.assert(!prototypeName || !C9rs[prototypeName] || C9rs[prototypeName].eyo, 'FAILURE' + prototypeName)
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
    goog.asserts.assert(prototypeName, 'Missing prototypeName')
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
 * getType.
 * The default implementation just returns the block type.
 * This should be used instead of direct block querying.
 * @return {String} The type of the receiver's block.
 */
eYo.Delegate.prototype.getType = function () {
  return this.block_.type
}

/**
 * getSubtype.
 * The default implementation just returns `undefined`.
 * Subclassers will use it to return the correct type
 * depending on their actual inner state.
 * This should be used instead of direct block querying.
 * @return {String} The type of the receiver's block.
 */
eYo.Delegate.prototype.getSubtype = function () {
}

/**
 * getBaseType.
 * The default implementation just returns the receiver's
 * `baseType_` property or its block type.
 * Subclassers will use it to return the correct type
 * depending on their actual inner state.
 * The raw type of the block is the type without any modifier.
 * The raw type is the same as the block type except for blocks
 * with modifiers.
 * This should be used instead of direct block querying.
 * @return {?String} The type of the receiver's block.
 */
eYo.Delegate.prototype.getBaseType = function () {
  return this.baseType_ || this.block_.type
}

/**
 * execute the given function for the head slot of the receiver and its next sibling.
 * If the return value of the given function is true,
 * then it was the last iteration and the loop nreaks.
 * For edython.
 * @param {!function} helper
 * @return {Object} The first slot for which helper returns true
 */
eYo.Delegate.prototype.someSlot = function (helper) {
  var slot = this.headSlot
  if (slot && goog.isFunction(helper)) {
    var last
    do {
      last = helper.call(slot)
    } while (!last && (slot = slot.next))
  }
  return slot
}

/**
 * execute the given function for the head slot of the receiver and its next sibling.
 * For edython.
 * @param {!function} helper
 * @return {boolean} whether there was an slot to act upon or a valid helper
 */
eYo.Delegate.prototype.foreachSlot = function (helper) {
  var slot = this.headSlot
  if (slot && goog.isFunction(helper)) {
    do {
      helper.call(slot)
    } while ((slot = slot.next))
  }
}

/**
 * execute the given function for the head data of the receiver and its next sibling.
 * Ends the loop as soon as the helper returns true.
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
    var slot = this.slots[k]
    if (slot) {
      data.slot = slot
      slot.data = data
      // try the unique editable field
      if (Object.keys(slot.fields).length === 1) {
        for (var kk in slot.fields) {
          data.field = slot.fields[kk]
          break
        }
      } else {
        data.field = slot.fields.bind
      }
    } else if ((data.field = this.fields[k])) {
      data.slot = null
      data.field.eyo.data = data
    } else {
      for (kk in this.slots) {
        slot = this.slots[kk]
        if ((data.field = slot.fields[k])) {
          data.slot = slot
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
 * Initialize the data values from the type.
 * One block implementation may correspond to different types,
 * For example, there is one implementation for all the primaries.
 * @param {!Blockly.Block} block to be initialized..
 * @param {!String} type
 * @return {boolean} whether the model was really used.
 */
eYo.Delegate.prototype.initDataWithType = function (block, type) {
  this.foreachData(function () {
    this.initWithType(type)
  })
}

/**
 * Initialize the data values from the model.
 * @param {!Blockly.Block} block to be initialized..
 * @param {!Object} model
 * @return {boolean} whether the model was really used.
 */
eYo.Delegate.prototype.initDataWithModel = function (block, model, noCheck) {
  var done = false
  var data_in = model.data
  if (goog.isString(data_in)) {
    var d = this.data.main || this.headData
    if (d && d.validate(data_in)) {
      d.set(data_in)
      done = true
    }
  } else if (goog.isDef(data_in)) {
    this.foreachData(function () {
      var k = this.key
      if (eYo.Do.hasOwnProperty(data_in, k)) {
        this.set(data_in[k])
        done = true
      }
    })
    if (!noCheck) {
      for (var k in data_in) {
        if (eYo.Do.hasOwnProperty(data_in, k)) {
          var D = this.data[k]
          if (!D) {
            console.warn('Unused data:', block.type, k, data_in[k])
          }
        }
      }
    }
  } else {
    done = true
  }
  return done
}

/**
 * Synchronize the data to the UI.
 * Sends a `synchronize` message to all data controllers.
 */
eYo.Delegate.prototype.synchronizeData = function () {
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
 * No need to override this.
 * @param {?string} optNewType, 
 * @constructor
 */
eYo.Delegate.prototype.setupType = function (optNewType) {
  var block = this.block_
  if (!optNewType && !block.type) {
    console.error('Error!')
  }
  if (optNewType === eYo.T3.Expr.unset) {
    console.error('C\'est une erreur!')
  }
  if (goog.isDef(optNewType) && block.type === optNewType) {
    return
  }
  optNewType && (block.type = optNewType)
  var m = /^eyo:((?:fake_)?((.*?)(?:)?))$/.exec(block.type)
  this.pythonType_ = m ? m[1] : block.type
  this.type_ = m ? 'eyo:' + m[2] : block.type
  this.xmlType_ = m ? m[3] : block.type
  if (!this.pythonType_) {
    console.error('Error! this.pythonType_')
  } 
}

/**
 * For edython.
 */
eYo.Delegate.prototype.synchronizeData = function () {
  this.foreachData(function () {
    this.synchronize()
  })
}

/**
 * For edython.
 */
eYo.Delegate.prototype.synchronizeSlots = function () {
  this.foreachSlot(function () {
    this.synchronize()
  })
}

/**
 * Some blocks may change when their properties change.
 * Consolidate the data.
 * Only used by `consolidate`.
 * Should not be called directly, but may be overriden.
 * For edython.
 * @param {?string} type Name of the new type.
 */
eYo.Delegate.prototype.consolidateData = function () {
  this.foreachData(function () {
    this.consolidate()
  })
}

/**
 * Some blocks may change when their properties change.
 * Consolidate the slots.
 * Only used by `consolidate`.
 * Should not be called directly, but may be overriden.
 * For edython.
 * @param {?Boolean} deep
 * @param {?Boolean} force
 */
eYo.Delegate.prototype.consolidateSlots = function (deep, force) {
  this.foreachSlot(function () {
    // some child blocks may be disconnected as side effect
    this.consolidate(deep, force)
  })
}

/**
 * Some blocks may change when their properties change.
 * Consolidate the slots.
 * Only used by `consolidate`.
 * Should not be called directly, but may be overriden.
 * For edython.
 * @param {?Boolean} deep
 * @param {?Boolean} force
 */
eYo.Delegate.prototype.consolidateInputs = function (deep, force) {
  if (deep) {
    // Consolidate the child blocks that are still connected
    var e8r = this.block_.eyo.inputEnumerator()
    while (e8r.next()) {
      e8r.here.eyo.consolidate(deep, force)
    }
  }
}

/**
 * Some blocks may change when their properties change.
 * For edython.
 * @param {?string} type Name of the new type.
 */
eYo.Delegate.prototype.consolidateType = function (type) {
  this.setupType(type || this.getType())
}

/**
 * Set the subtype of the delegate.
 * Default implementation does nothing
 * and should be overriden by subclassers.
 * @param {?string} optNewSubtype, 
 * @constructor
 */
eYo.Delegate.prototype.setupSubtype = function (optNewSubtype) {
  return
}

/**
 * Some blocks may change when their properties change.
 * For edython.
 * @param {?string} subtype Name of the new subtype
 *     type-specific functions for this block.
 */
eYo.Delegate.prototype.consolidateSubtype = function (subtype) {
  this.setupSubtype(subtype || this.getSubtype())
}

/**
 * Set the connection check array.
 * The connections are supposed to be configured once.
 * This method may disconnect blocks as side effect,
 * thus interacting with the undo manager.
 * After initialization, this should be called whenever
 * the block type has changed.
 * @param {!Blockly.Block} block to be initialized.
 * @constructor
 */
eYo.Delegate.prototype.consolidateConnections = function () {
  var b = this.block_
  var t = this.getType()
  var st = this.getSubtype()
  var f = function (c8n) {
    c8n && c8n.eyo.updateCheck(t, st)
  }
  f(b.outputConnection)
  f(b.previousConnection)
  f(b.nextConnection)
  f(this.inputSuite && this.inputSuite.connection)
}

/**
 * Initialize a block.
 * Called from block's init method.
 * @param {!Blockly.Block} block to be initialized..
 * For subclassers eventually
 */
eYo.Delegate.prototype.initBlock = function () {
  // configure the connections
  this.changeWrap(
    function () {
      this.makeData()
      this.makeContents()
      this.makeFields()
      this.makeSlots()
      this.makeConnections()    
    },
    this
  )
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
        target = eYo.DelegateSvg.newBlockReady(block.workspace, prototypeName, block.id+'.wrapped:'+input.connection.eyo.name_)
        goog.asserts.assert(target, 'completeWrapped_ failed: ' + prototypeName)
        goog.asserts.assert(target.outputConnection, 'Did you declare an Expr block typed ' + target.type)
        input.connection.connect(target.outputConnection)
      } catch (err) {
        console.error(err)
        throw err
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
}

/**
 * Did connect this block's connection to another connection.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} connection what has been connected in the block
 * @param {!Blockly.Connection} oldTargetConnection what was previously connected in the block
 * @param {!Blockly.Connection} oldConnection what was previously connected to the new targetConnection
 */
eYo.Delegate.prototype.didConnect = function (block, connection, oldTargetConnection, oldConnection) {
}

/**
 * Will disconnect this block's connection.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} blockConnection
 */
eYo.Delegate.prototype.willDisconnect = function (block, blockConnection) {
  // console.log('will disconnect')
  this.changeBegin()
}

/**
 * Did disconnect this block's connection from another connection.
 * @param {!Blockly.Block} block
 * @param {!Blockly.Connection} blockConnection
 * @param {!Blockly.Connection} oldTargetConnection that was connected to blockConnection
 */
eYo.Delegate.prototype.didDisconnect = function (block, blockConnection, oldTargetConnection) {
  // console.log('did disconnect')
  this.changeEnd()
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
  if (this.inputSuite) {
    var c8n = this.inputSuite.connection
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
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    this.render()
    eYo.Events.setGroup(false)
  }
}

/**
 * Enable/Disable the connections of the block.
 * A disabled block cannot enable its connections.
 * @param {!Block} block
 * @param {!Boolean} disabled
 * @return {boolean} whether changes have been made
 * @private
 */
eYo.Delegate.prototype.setIncog = function (block, incog) {
  if (!this.incog_ === !incog) {
    return false
  }
  if (incog) {
    if (this.incog_) {
      // The block is already incognito,
      // normally no change to the block tree
      return false
    }
  } else if (block.disabled) {
    // enable the block before enabling its connections
    return false
  }
  this.incog_ = incog
  var setupIncog = function (input) {
    var c8n = input && input.connection
    c8n && c8n.eyo.setIncog(incog)
  }
  var slot = this.headSlot
  while (slot) {
    setupIncog(slot.input)
    slot = slot.next
  }
  setupIncog(this.inputSuite)
  for (var i = 0, input; (input = this.block_.inputList[i++]);) {
    setupIncog(input)
  }
  if (!incog) { // for lists mainly
    this.consolidate() // no deep consolidation because connected blocs were consolidated above
  }
  return true
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
eYo.Delegate.prototype.inputEnumerator = function (all) {
  return eYo.Do.Enumerator(this.block_.inputList, all ? undefined : function (x) {
    return !x.connection || !x.connection.eyo.slot || !x.connection.eyo.slot.isIncog()
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

/**
 * get the slot connections, mainly for debugging purposes.
 * For edython.
 * @return An aray of all the connections
 */
eYo.Delegate.prototype.getSlotConnections = function () {
  var ra = []
  this.foreachSlot(
    function () {
      var c8n = this.input && this.input.connection
      c8n && ra.push(c8n)
    }
  )
  return ra
}
