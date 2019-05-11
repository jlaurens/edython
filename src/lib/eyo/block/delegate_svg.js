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

goog.require('eYo.XRE')
goog.require('eYo.T3')
goog.require('eYo.Data')
goog.require('eYo.Slot')
goog.require('eYo.UI')
goog.require('eYo.Where')
goog.require('eYo.Delegate')
goog.forwardDeclare('eYo.Delegate.Expr')
goog.forwardDeclare('eYo.Delegate.Stmt')
goog.forwardDeclare('eYo.Selected')
goog.require('goog.dom')

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 */
// deleted blocks are rendered during deletion
// this should be avoided
eYo.Delegate.prototype.render = eYo.Do.nothing

/**
 * Render the block. Real function.
 */
eYo.Delegate.prototype.render_ = function () {
  this.ui.render()
}

Object.defineProperties(eYo.Delegate.prototype, {
  collapsed_: {
    writable: true
  },
  collapsed: {
    get () {
      return this.collapsed_
    },
    set (newValue) {
      if (this.collapsed_ === newValue) {
        return
      }
      // Show/hide the next statement inputs.
      this.forEachInput(input => input.setVisible(!collapsed))
      eYo.Events.fireDlgtChange(
          this, 'collapsed', null, this.collapsed_, newValue)
      this.collapsed_ = newValue;
      this.render()
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
})

eYo.Delegate.prototype.packedQuotes = true
eYo.Delegate.prototype.packedBrackets = true

/**
 * Method to register an expression or a statement block.
 * The delegate is searched as a Delegate element
 * @param{!string} key  key is the last component of the block type as a dotted name.
 */
eYo.Delegate.Manager.register = function (key) {
  var prototypeName = eYo.T3.Expr[key]
  var delegateC9r, available
  if (prototypeName) {
    delegateC9r = eYo.Delegate.Expr[key]
    available = eYo.T3.Expr.Available
  } else if ((prototypeName = eYo.T3.Stmt[key])) {
    // console.log('Registering statement', key)
    delegateC9r = eYo.Delegate.Stmt[key]
    available = eYo.T3.Stmt.Available
  } else {
    throw new Error('Unknown block eYo.T3.Expr or eYo.T3.Stmt key: ' + key)
  }
  eYo.Delegate.Manager.registerDelegate_(prototypeName, delegateC9r)
  available.push(prototypeName)
}


// Mimic Blockly naming convention
eYo.Delegate = eYo.Delegate


/**
 * Called when the parent will just change.
 * This code is responsible to place the various path
 * in the proper domain of the dom tree.
 * @param {!Blockly.Block} newParent to be connected.
 */
eYo.Delegate.prototype.parentWillChange = function (newParent) {
}

/**
 * Returns the named field from a block.
 * Only fields that do not belong to an input are searched for.
 * @param {string} name The name of the field.
 * @return {Blockly.Field} Named field, or null if field does not exist.
 */
eYo.Delegate.prototype.getField = function (name) {
  var ans = null
  var f = F => Object.values(F).some(f => (f.name === name) && (ans = f))
  if (f(this.fields)) return ans
  var slot
  if ((slot = this.slotAtHead)) {
    do {
      if (f(slot.fields)) return ans
    } while ((slot = slot.next))
  }
  this.inputList.some(input => input.fieldRow.some(f => (f.name === name) && (ans = f)))
  return ans
}

/**
 * When the block is just a wrapper, returns the wrapped target.
 */
eYo.Delegate.prototype.getMenuTarget = function () {
  var wrapped
  if (this.wrap && (wrapped = this.wrap.input.target)) {
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

eYo.Delegate.debugPrefix = ''
eYo.Delegate.debugCount = {}

/**
 * Fetches the named input object.
 * @param {!String} name The name of the input.
 * @return {eYo.Input} The input object, or null if input does not exist. Input that are disabled are skipped.
 */
eYo.Delegate.prototype.getInput = function (name) {
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
        var eyo = e8r.here.eyo.magnet
        if (eyo.isFoot || eyo.isSuite) {
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
eYo.Delegate.newReady = function (owner, model, id) {
  var dlgt = eYo.Delegate.newComplete.apply(null, arguments)
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
eYo.Delegate.newComplete = (() => {
  var processModel = (workspace, model, id, eyo) => {
    var dataModel = model
    if (!eyo) {
      if (eYo.Delegate.Manager.get(model.type)) {
        eyo = workspace.newDlgt(model.type, id)
        eyo.setDataWithType(model.type)
      } else if (eYo.Delegate.Manager.get(model)) {
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
              var t_eyo = input.t_eyo
              var V = Vs[k]
              var dlgt = processModel(workspace, V, null, t_eyo)
              if (!t_eyo && dlgt && dlgt.magnets.output) {
                dlgt.changeWrap(
                  () => {
                    var slot = input.magnet.slot
                    slot && (slot.incog = false)
                    dlgt.magnets.output.connect(input.magnet)
                  }
                )
              }
            }
          }
        }
        Vs = model
        this.forEachSlot(slot => {
          var input = slot.input
          if (!input || !input.magnet) {
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
          var t_eyo = input.magnet.t_eyo
          var y = processModel(workspace, V, null, t_eyo)
          if (!t_eyo && y && y.magnets.output) {
            y.changeWrap(
              () => {
                // The connection can be established only when not incog
                slot.incog = false
                y.magnets.output.connect(input.magnet)
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
eYo.Delegate.prototype.beReady = function (headless) {
  if (headless === false || !this.workspace) {
    return
  }
  this.changeWrap(() => {
      this.beReady = eYo.Do.nothing // one shot function
      this.eventsInit_ = true
      this.ui_ = new eYo.UI(this)
      this.forEachField(field => field.eyo.beReady())
      this.forEachSlot(slot => slot.beReady())
      this.inputList.forEach(input => {
        input.beReady()
      })
      ;[this.magnets.suite,
        this.magnets.right,
        this.magnets.foot
      ].forEach(m => m && m.beReady())
      this.forEachData(data => data.synchronize()) // data is no longer headless
      this.render = eYo.Delegate.prototype.render_
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
eYo.Delegate.prototype.getPythonType = function () {
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
 * @param {Object} model, for subclassers
 * @return {?eYo.Delegate} the created block
 */
eYo.Delegate.prototype.insertParentWithModel = function (model) {
  goog.asserts.assert(false, 'Must be subclassed')
}

/**
 * Insert a block of the given type.
 * For edython.
 * @param {Object|string} model
 * @param {eYo.Magnet} m4t
 * @return {?Blockly.Block} the block that was inserted
 */
eYo.Delegate.prototype.insertBlockWithModel = function (model, m4t) {
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
      candidate = eYo.Delegate.newComplete(this, model)
      var fin = prepare => {
        eYo.Events.groupWrap(() => {
          eYo.Events.enableWrap(() => {
            eYo.Do.tryFinally(() => {
              eYo.Events.fireDlgtCreate(candidate)
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
          if (otherDlgt instanceof eYo.Delegate.List && otherM4t.eyo.isInput) {
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
                var eyo = eYo.Delegate.newComplete(this, x.model)
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
                candidate.moveByXY(its_xy.x - my_xy.x, its_xy.y - my_xy.y - candidate.size.height * eYo.Unit.y)
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
              if (!otherM4t || (!otherM4t.disabled_ && otherM4t.s7r_)) {
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
              candidate.moveByXY(its_xy.x - my_xy.x, its_xy.y - my_xy.y - candidate.size.height * eYo.Unit.y)
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
eYo.Delegate.prototype.canLock = function () {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var m4t, target
  return !this.someInput(input => {
    if ((m4t = input.magnet) && !m4t.disabled_) {
      if ((target = m4t.target)) {
        if (!target.canLock()) {
          return true
        }
      } else if (!m4t.optional_ && !m4t.s7r_) {
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
eYo.Delegate.prototype.canUnlock = function () {
  if (this.locked_) {
    return true
  }
  // list all the input for a non optional connection with no target
  var m4t, t_eyo
  return this.someInput(input => {
    if ((m4t = input.magnet)) {
      if ((t_eyo = m4t.t_eyo)) {
        if (t_eyo.canUnlock()) {
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
eYo.Delegate.prototype.lock = function () {
  var ans = 0
  if (this.locked_ || !this.canLock()) {
    return ans
  }
  eYo.Events.fireDlgtChange(
    this, eYo.Const.Event.locked, null, this.locked_, true)
  this.locked_ = true
  if (this.selected) {
    eYo.Selected.magnet = null
  }
  // list all the input for connections with a target
  var m4t
  var t_eyo
  this.forEachInput(input => {
    if ((m4t = input.magnet)) {
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
  if (this.selected) {
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
eYo.Delegate.prototype.unlock = function (shallow) {
  var block = this.block_
  var ans = 0
  eYo.Events.fireDlgtChange(
      this, eYo.Const.Event.locked, null, this.locked_, false)
  this.locked_ = false
  // list all the input for connections with a target
  var m4t, t_eyo
  this.forEachInput(input => {
    if ((m4t = input.magnet)) {
      if ((!shallow || m4t.isInput) && (t_eyo = m4t.t_eyo)) {
        ans += t_eyo.unlock(shallow)
      }
      m4t.setHidden(false)
    }
  })
  if (!shallow && (m4t = this.magnets.right)) {
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
eYo.Delegate.prototype.inVisibleArea = function () {
  var area = this.ui && this.ui.distanceFromVisible
  return area && !area.x && !area.y
}

/**
 * Side effect: renders the block when connections are no longer hidden.
 * @param {boolean} hidden True to hide connections.
 */
eYo.Delegate.prototype.setConnectionsHidden = function (hidden) {
  if (this.connectionsHidden_ === hidden) {
    return
  }
  this.connectionsHidden_ = hidden
  if (hidden) {
    if (eYo.Delegate.debugStartTrackingRender) {
      console.log('HIDE', this.id, this.type)
    }
  } else {
    // eYo.Delegate.debugStartTrackingRender = true
    // console.log('SHOW CONNECTIONS', this.id, this.type)
    this.rendered || this.render()
  }
}

/**
 * Execute the handler with block rendering deferred to the end, if any.
 * handler
 * @param {!Function} handler `this` is the receiver.
 * @param {!Function} err_handler `this` is the receiver, one argument: the error catched.
 */
eYo.Delegate.prototype.doAndRender = function (handler, group, err_handler) {
  return e => {
    this.changeBegin()
    group && eYo.Events.setGroup(true)
    try {
      handler.call(this, e)
    } catch (err) {
      err_handler && err_handler.call(this, err) || console.error(err)
      throw err
    } finally {
      group && eYo.Events.setGroup(false)
      this.changeEnd()
    }
  }
}
