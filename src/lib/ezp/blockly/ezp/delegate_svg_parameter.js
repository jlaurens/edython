/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview BlockSvg delegates for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.DelegateSvg.Parameter')

goog.require('ezP.DelegateSvg.List')

/**
 * List consolidator for parameter list.
 * A parameter list contains 3 kinds of objects
 * 1) parameters as identifiers, (possibly annotated or defaulted)
 * 2) '*' identifier
 * 3) '**' identifier
 * Here are the rules
 * A) The starred identifiers must appear only once at most.
 * B) The single starred must appear before the double starred, if any
 * C) The double starred must be the last one if any
 * D) Citing the documentation:
 *    If a parameter has a default value,
 *    all following parameters up until the “*”
 *    must also have a default value...
 * All the inputs are connectedÒ.
 */
ezP.Consolidator.Parameter = function() {
  ezP.Consolidator.Parameter.superClass_.constructor.call(this, ezP.Consolidator.Parameter.data)
}
goog.inherits(ezP.Consolidator.Parameter, ezP.Consolidator.List)

ezP.Consolidator.Parameter.data = {
  check: ezP.T3.Expr.Check.primary,
  empty: true,
  sep: ',',
}

/**
 * Consolidate a connected input but the first one.
 * Does nothing if this is the last input of '**' type.
 * @param {!Object} io parameter.
 * @return yes exactly if there are more input
 * @override
 */
ezP.Consolidator.Parameter.prototype.consolidate_connected = function(io) {
  if (io.i + 1 ===  io.list.length) {
    var check = io.c8n.targetConnection.check_
    if (goog.array.contains(check,ezP.T3.Expr.parameter_star_star)) {
      // do not add a separator after
      return false
    }
  }
  return ezP.Consolidator.Parameter.superClass_.consolidate_connected.call(this, io)
}

/**
 * Prepare io, just before walking through the input list for example.
 * Subclassers may add their own stuff to io.
 * @param {!Blockly.block} block owner of the receiver
 */
ezP.Consolidator.Parameter.prototype.getIO = function(block) {
  var io = ezP.Consolidator.Parameter.superClass_.getIO.call(this, block)
  io.first_star_star = io.first_star = io.first_default = io.last_default = -1
  return io
}

/**
 * Once the whole list has been managed,
 * there might be unwanted things.
 */
ezP.Consolidator.Parameter.prototype.doCleanup = function () {
  // preparation: walk through the list of inputs and
  // find the key inputs
  var Type = {
    unconnected: 0,
    parameter: 1,
    default: 2,
    star: 3,
    star_star: 4,
  }
  /**
   * Whether the input corresponds to an identifier...
   * Called when io.input is connected.
   * @param {Object} io, parameters....
   */
  var getCheckType = function(io) {
    var target = io.c8n.targetConnection
    if (!target) {
      return Type.unconnected
    }
    var check = target.check_
    if (goog.array.contains(check,ezP.T3.Expr.parameter_star)) {
      return Type.star
    } else if (goog.array.contains(check,ezP.T3.Expr.parameter_star_star)) {
      return Type.star_star
    } else if (goog.array.contains(check,ezP.T3.Expr.defparameter_concrete)) {
      return Type.default
    } else {
      return Type.parameter
    }
  }
  var setupFirst = function (io) {
    io.first_star_star = io.first_star = io.first_default = io.last_default = -1
    var last_default = -1
    this.setupIO(io, 0)
    while (!!io.ezp) {
      switch((io.ezp.parameter_type_ = getCheckType(io))) {
        case Type.star_star:
        if (io.first_star_star < 0) {
          io.first_star_star = io.i
        }
        break
        case Type.star:
        if (io.first_star < 0) {
          // this is an error
          io.first_star = io.i
        }
        break
        case Type.default:
        if (io.first_default < 0 && io.first_star < 0) {
          io.first_default = io.i
        }
        if (io.last_default < 0) {
          last_default = io.i
        }
        break
        case Type.parameter:
        if (io.last_default < 0) {
          io.last_default = last_default
        }
        break
      }
      this.nextInput(io)
    }
  }
  return function(io) {
    ezP.Consolidator.Parameter.superClass_.doCleanup.call(this, io)
    setupFirst.call(this, io)
    // there must be an only one
    // first remove all the extra ** parameters
    var i = io.first_star_star
    if (i>=0 && i+2 < io.list.length) {
      io.i = i+2
      while (this.setupIO(io)) {
        if (io.ezp.parameter_type_ == Type.star_star) {
          this.disposeAtI(io)
          this.disposeAtI(io)
        } else {
          io.i += 2
        }
      }
      if (i+2 < io.list.length) {
        io.ezp.edited = true
        this.setupIO(io, i)
        // move this parameter to the end of the list and hide a space
        // 1) disconnect the '**' from its input
        var c8n = io.c8n
        var targetC8n = c8n.targetConnection
        c8n.disconnect()
        while (true) {
          if (this.setupIO(io, io.i + 2)) {
            var nextC8n = io.c8n
            var nextTargetC8n = c8n.targetConnection
            nextC8n.disconnect()
            c8n.connect(nextTargetC8n)
            c8n = nextC8n
          } else {
            c8n.connect(targetC8n)
            break
          }
        }
      }
      setupFirst.call(this)
    }
    if (io.first_star_star >= 0) {
      i = io.first_star_star + 1
      if (i < io.list.length) {
        this.disposeAtI(io, i)
      }
    }
  // Now remove any extra * parameter
    i = io.list.indexOf(io.first_star)
    if (i>=0) {
      io.i = i+2
      while (this.setupIO(io)) {
        if (io.ezp.parameter_type_ === Type.star) {
          this.disposeAtI(io)
          this.disposeAtI(io)
        } else {
          io.i += 2
        }
      }
      setupFirst.call(this)
    }
    // now move the '*' input
    if (io.last_default >= 0 && io.last_default + 4 <= io.first_star) {
      // it means that io.last_default + 2 is a no default parameter
      // we must move the '*' block at io.last_default + 2
      io.ezp.edited = true
      this.setupIO(io, io.first_star)
      var c8n = io.c8n
      var targetC8n = c8n.targetConnection
      c8n.disconnect()
      while (true) {
        this.setupIO(io, io.i - 2)
        var nextC8n = io.c8n
        var nextTargetC8n = c8n.targetConnection
        nextC8n.disconnect()
        c8n.connect(nextTargetC8n)
        c8n = nextC8n
        if (io.i <= io.last_default + 2) {
          c8n.connect(targetC8n)
          break
        }
      }
      setupFirst.call(this)
    }
  }
} ()

/**
 * Returns the required types for the current input.
 * This does not suppose that the list of input has been completely consolidated
 * @param {!Object} io parameter.
 */
ezP.Consolidator.Parameter.prototype.getCheck = function() {
  var cache = {}
  return function (io) {
    var can_star_star = (io.first_star_star < 0 && io.i + 3  > io.list.length )
    || io.first_star_star == io.i
    var can_star = (io.first_star < 0 && (io.last_default < 0 || io.i <= io.last_default + 2)) || io.first_star == io.i
    var can_parameter = io.first_default < 0 || io.i <= io.first_default || io.first_star < 0 || io.i >= io.first_star
    var can_default = io.first_star < 0 || io.i > io.first_star - 3 || (io.last_default < 0 && io.last_default - 2 < io.i)
    var K = 0
    if (can_parameter) {
      K += 1
    }
    if (can_default) {
      K += 2
    }
    if (can_star) {
      K += 4
    }
    if (can_star_star) {
      K += 8
    }
    var out = cache[K]
    if (out) {
      return out
    }
    out = []
    if (can_parameter) {
      out = ezP.T3.Expr.Check.parameter.slice()
    }
    if (can_default) {
      out.push(ezP.T3.Expr.defparameter_concrete)
    }
    if (can_star) {
      out.push(ezP.T3.Expr.parameter_star)      
    }
    if (can_star_star) {
      out.push(ezP.T3.Expr.parameter_star_star)      
    }
    return cache[K] = out
  }
} ()

/**
 * Class for a DelegateSvg, parameter_list block.
 * This block may be sealed.
 * Not normally called directly, ezP.DelegateSvg.create(...) is preferred.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('parameter_list', {
  inputs: {
    list: {
      consolidator: ezP.Consolidator.Parameter,
    }
  }
})

/**
 * Class for a DelegateSvg, parameter_star.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Manager.makeSubclass('parameter', {
  inputs: {
    modifiers: ['', '*', '**'],
    modifier: {
      label: '',
      css_class: 'ezp-code-reserved',
    },
    i_1: {
      key: ezP.Key.IDENTIFIER,
      identifier: '',
      hole_value: 'parameter',
    },
    i_2: {
      key: ezP.Key.ANNOTATION,
      label: ':',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
    i_3: {
      key: ezP.Key.DEFINITION,
      label: '=',
      css_class: 'ezp-code-reserved',
      check: ezP.T3.Expr.Check.expression,
      hole_value: 'expression',
    },
  }
})

ezP.DelegateSvg.Expr.parameter_concrete = ezP.DelegateSvg.Expr.parameter

ezP.DelegateSvg.Manager.register('parameter_concrete', ezP.DelegateSvg.Expr.parameter)

/**
 * Init the subtype.
 * @param {!Blockly.Block} block to be initialized.
 */
ezP.DelegateSvg.Expr.parameter.prototype.initSubtype = function (block) {
  ezP.DelegateSvg.Expr.parameter.superClass_.initValue.call(this, block)
  this.setSubtype(block, 0)
  return
}

/**
 * Init the value.
 * @param {!Blockly.Block} block to be initialized.
 */
ezP.DelegateSvg.Expr.parameter.prototype.initValue = function (block) {
  ezP.DelegateSvg.Expr.parameter.superClass_.initValue.call(this, block)
  this.setValue(block, this.ui.i_1.fields.identifier.getValue())
  return
}

/**
 * Get the content for the menu item.
 * @param {!Blockly.Block} block The block.
 * @param {string} op op is the operator
 * @private
 */
ezP.DelegateSvg.Expr.parameter.prototype.getContent = function (block, op, flags) {
  if (flags === undefined) {
    flags = this.getSubtype(block)
  }
  var withAnnotation = flags % 2
  var withDefinition = flags & 2
  var withoutIdentifier = flags & 4
  
  var element = goog.dom.createDom(goog.dom.TagName.SPAN, null,
    ezP.Do.createSPAN(op||' ', 'ezp-code-reserved'),
  )
  if (!withoutIdentifier) {
    var value = this.getValue(block)
    element.appendChild(ezP.Do.createSPAN(value || 'nom', value? 'ezp-code': 'ezp-code-placeholder'))
  }
  if (withAnnotation) {
    element.appendChild(ezP.Do.createSPAN(':', 'ezp-code-reserved'))
    element.appendChild(ezP.Do.createSPAN(' …', 'ezp-code-placeholder'))
  }
  if (withDefinition) {
    element.appendChild(ezP.Do.createSPAN(' = ', 'ezp-code-reserved'))
    element.appendChild(ezP.Do.createSPAN('…', 'ezp-code-placeholder'))
  }
  return element
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.parameter.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var currentModifier = this.getModifier(block)
  var currentFlags = this.getSubtype(block)
  var F = function(modifier, flags) {
    if (modifier !== currentModifier || flags !== currentFlags) {
      var content = block.ezp.getContent(block, modifier, flags)
      var menuItem = new ezP.MenuItem(content, function() {
        block.ezp.setModifier(block, modifier)
        block.ezp.setSubtype(block, flags)
      })
      mgr.addChild(menuItem, true)
    }
  }
  F('*', 4)
  F('', 0)
  F('', 1)
  F('', 2)
  F('', 3)
  F('*', currentFlags & 1)
  F('**', currentFlags & 1)
  mgr.shouldSeparate()
  ezP.DelegateSvg.Expr.parameter.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

/**
 * This block may have one of different types and output check.
 * For ezPython.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @constructor
 */
ezP.DelegateSvg.Expr.parameter.prototype.consolidateType = function (block) {
  var flags = this.getSubtype(block)
  var withAnnotation = flags % 2
  var withDefinition = flags & 2
  var modifier = this.getModifier(block)
  var modifiers = this.getModel().inputs.modifiers
  var i = modifiers.indexOf(modifier)
  this.setupType(block, [ezP.T3.Expr.identifer, ezP.T3.Expr.parameter_star, ezP.T3.Expr.parameter_star_star][i])
  block.setOutput(true, [
    withDefinition?[ezP.T3.Expr.defparameter_concrete]: (withAnnotation? [ezP.T3.Expr.parameter_concrete]: [ezP.T3.Expr.identifier]),
    [ezP.T3.Expr.parameter_star],
    [ezP.T3.Expr.parameter_star_star],
  ][i])
}

/**
 * When the modifier did change.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldModifier
 * @param {string} newModifier
 */
ezP.DelegateSvg.Expr.parameter.prototype.didChangeModifier = function(block, oldModifier, newModifier) {
  ezP.DelegateSvg.Expr.parameter.superClass_.didChangeModifier.call(this, block, oldModifier, newModifier)
  var modifiers = this.getModel().inputs.modifiers
  var i = modifiers.indexOf(newModifier)
  if (i<0) {
    i = 0
  }
  var field = block.ezp.ui.fields.modifier
  field.setValue(newModifier)
  field.setVisible(newModifier && newModifier.length>0)
  this.consolidateType(block)
}

/**
 * Validates the new subtype.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.parameter.prototype.validateSubtype = function (block, newSubtype) {
  return goog.isNumber(newSubtype) && 0 <= newSubtype && newSubtype <= 4
}

/**
 * When the subtype did change.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldSubtype
 * @param {string} newSubtype
 */
ezP.DelegateSvg.Expr.parameter.prototype.didChangeSubtype = function(block, oldSubtype, newSubtype) {
  ezP.DelegateSvg.Expr.parameter.superClass_.didChangeSubtype.call(this, block, oldSubtype, newSubtype)
  var withAnnotation = newSubtype % 2
  var withDefinition = newSubtype & 2
  var withoutIdentifier = newSubtype & 4
  this.setNamedInputDisabled(block, ezP.Key.IDENTIFIER, withoutIdentifier)
  this.setNamedInputDisabled(block, ezP.Key.ANNOTATION, !withAnnotation)
  this.setNamedInputDisabled(block, ezP.Key.DEFINITION, !withDefinition)
  this.consolidateType(block)
}

/**
 * Validates the new value.
 * For ezPython.
 * @param {!Blockly.Block} block The owner of the receiver.
 * @param {string} newValue
 * @return true if newValue is acceptable, false otherwise
 */
ezP.DelegateSvg.Expr.parameter.prototype.validateValue = function (block, newValue) {
  var type = ezP.Do.typeOfString(newValue)
  return type === ezP.T3.Expr.identifier
}

/**
 * When the value did change.
 * @param {!Blockly.Block} block to be initialized.
 * @param {string} oldValue
 * @param {string} newValue
 */
ezP.DelegateSvg.Expr.parameter.prototype.didChangeValue = function(block, oldValue, newValue) {
  ezP.DelegateSvg.Expr.parameter.superClass_.didChangeValue.call(this, block, oldValue, newValue)
  this.ui.i_1.fields.identifier.setValue(this.getValue(block) || '')
}

/**
 * Populate the context menu for the given block.
 * @param {!Blockly.Block} block The block.
 * @param {!ezP.MenuManager} mgr mgr.menu is the menu to populate.
 * @private
 */
ezP.DelegateSvg.Expr.parameter_list.prototype.populateContextMenuFirst_ = function (block, mgr) {
  var e8r = block.ezp.inputEnumerator(block)
  var F = function(modifier, flags, msg) {
    var BB
    ezP.Events.Disabler.wrap(function() {
      BB = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.parameter)
      BB.ezp.skipRendering = true
      BB.ezp.setModifier(BB, modifier)
      BB.ezp.setSubtype(BB, flags)
    })
    e8r.end()
    while(e8r.previous()) {
      var c8n = e8r.here.connection
      if (c8n && !c8n.targetConnection) {
        if (c8n.checkType_(BB.outputConnection)) {
          var content = goog.dom.createDom(goog.dom.TagName.SPAN, 'ezp-code',
            ezP.Do.createSPAN('( ', 'ezp-code-disabled'),
            ezP.Do.createSPAN(msg),
            ezP.Do.createSPAN(' )', 'ezp-code-disabled'),
          )
          mgr.addInsertChild(new ezP.MenuItem(content, function() {
            var grouper = new ezP.Events.Grouper()
            try {
              var B = ezP.DelegateSvg.newBlockComplete(block.workspace, ezP.T3.Expr.parameter)
              B.ezp.skipRendering = true
              B.ezp.setModifier(B, modifier)
              B.ezp.setSubtype(B, flags)
              B.ezp.skipRendering = false
              c8n.connect(B.outputConnection)
              B.render()
            } finally {
              grouper.stop()
            }
          }))
        }
      }
    }
    ezP.Events.Disabler.wrap(function() {
      BB.dispose(true)
    })
  }
  F('', 0, 'name')
  F('', 1, 'name: expression')
  F('', 2, 'name = value')
  F('*', 4, '*')
  F('*', 0, '*…')
  F('**', 0, '**…')
  mgr.shouldSeparateInsert()
  ezP.DelegateSvg.Expr.parameter_list.superClass_.populateContextMenuFirst_.call(this,block, mgr)
  return true
}

ezP.DelegateSvg.Parameter.T3s = [
  ezP.T3.Expr.parameter_list,
  ezP.T3.Expr.parameter,
]

console.warn('Use a modifier field for * and ** (instead of await and async too)')