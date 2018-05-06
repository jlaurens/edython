/**
 * ezPython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License CeCILL-B
 */
/**
 * @fileoverview Input extension for ezPython.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('ezP.Tile')

goog.require('ezP.Do')

goog.require('Blockly.Input')

/**
 * Convenient method to wrap the Blockly input object for the outside.
 * The model is one of the entries of the `tiles` section
 * of the object used to create a delegate's subclass.
 * Here are some specifications for that model part.
 *
 * Any tile is constructed the same way
 * 1) operator field
 * 2) label field
 * 3) start field
 * 4) either editable field, value input of wrapped block.
 * 5) end field
 * 
  // we assume that one input model only contains at most one of
  // - editable field
  // - value input, check: key
  // - wrap input
  // - insert input
  // It may contain label fields
 * @param {!Object} owner  The owner is a block delegate.
 * @param {!string} key  One of the keys in `tiles` section of the model.
 * @param {!Object} tileModel  the model for the given key i the above mention section.
 */
ezP.Tile = function(owner, key, tileModel) {
  goog.asserts.assert(owner, 'Missing tile owner')
  goog.asserts.assert(key, 'Missing tile key')
  goog.asserts.assert(tileModel, 'Missing tile model')
   goog.asserts.assert(tileModel.order, 'Missing tile model order')
  this.owner = owner
  this.key = key
  this.model = tileModel
  this.input = undefined
  var block = this.block = owner.block_
  goog.asserts.assert(block,
    ezP.Do.format('block must exist {0}/{1}', key))  
  ezP.Tile.makeFields(this, this, tileModel.fields)
  if (tileModel.wrap) {
    this.setInput(block.appendWrapValueInput(key, tileModel.wrap, tileModel.optional, tileModel.hidden))
  } else if (tileModel.check) {
    this.setInput(block.appendValueInput(key))
  }
}

/**
 * Install this tile on a block.
 */
ezP.Tile.prototype.init = function() {
  if (this.svgRoot_) {
    // Tile has already been initialized once.
    return;
  }
  // Build the DOM.
  this.svgGroup_ = Blockly.utils.createSvgElement('g', {
    class: 'ezp-tile'
  }, null);
  if (this.disabled_) {
    this.svgGroup_.style.display = 'none';
  }
  // init all the fields
  for (var k in this.fields) {
    var field = this.fields[k]
    field.setSourceBlock(this.block) // is it necessary?
    field.ezp.tile = this
    field.init()
  }
  this.getBlock().getSvgRoot().appendChild(this.svgGroup_);
  // this.render_();
};
console.warn('What would be a tile rendering?')
/**
 * The DOM SVG group representing this tile.
 */
ezP.Tile.prototype.getSvgRoot = function() {
  return this.svgGroup_
};

/**
 * Dispose of all DOM objects belonging to this tile.
 */
ezP.Tile.prototype.dispose = function() {
  goog.dom.removeNode(this.svgGroup_);
  this.svgGroup_ = null;
  this.owner = null
  this.key = null
  this.model = null
  this.input = null
  this.block = null
  this.ui = null
}

goog.require('ezP.FieldLabel')
goog.require('ezP.FieldInput')


/**
 * Create all the fields from the model.
 * For ezPython.
 * @param {!Object} owner
 * @param {!Object} ui
 * @param {!Object} fieldsModel
 */
ezP.Tile.makeFields = function() {
  // This is a closure
  // default helper functions for an editable field bound to a data object
  // `this` is an instance of  ezP.FieldInput
  var validate = function (txt) {
      return this.ezp.validate.call(this, txt)
  }
  var startEditing = function () {
  }
  var endEditing = function () {
    goog.asserts.assert(this.ezp.data, 'No data bound to field '+this.name+'/'+this.sourceBlock_.type)
    this.ezp.data.fromText(this.getValue())
  }
  // Change some `... = true,` entrie to real functions
  var setupModel = function(model) {
    // no need to setup the model each time we create a new block
    if (model.setup_) {
      return
    }
    model.setup_ = true
    if (model.validate === true) {
      model.validate = validate
    } else if (model.validate && !goog.isFunction(model.validate)) {
      delete model.validate
    }
    if (model.startEditing === true) {
      model.startEditing = startEditing
    } else if (model.startEditing && !goog.isFunction(model.startEditing)) {
      delete model.startEditing
    }
    if (model.endEditing === true) {
      model.endEditing = endEditing
    } else if (model.endEditing && !goog.isFunction(model.endEditing)) {
      delete model.endEditing
    }
  }
  var makeField = function (fieldName, model) {
    var field
    if (goog.isString(model)) {
      if (model.startsWith('css')) {
        return
      }
      field = new ezP.FieldLabel(model)
      field.ezp.css_class = 'ezp-code'
    } else if (goog.isObject(model)) {
      setupModel(model)
      if (model.edit || model.validate || model.endEditing || model.startEditing) {
        // this is an ediable field
        field = new ezP.FieldInput(model.edit || '', model.validate, fieldName)
      } else if (goog.isDefAndNotNull(model.value)) {
        // this is just a label field
        field = new ezP.FieldLabel(model.value)
      } else { // other entries are ignored
        return
      }
      field.ezp.model = model
      if (!(field.ezp.css_class = model.css_class || model.css && 'ezp-code-'+model.css)) {
        switch(ezP.Do.typeOfString(field.getValue())) {
          case ezP.T3.Expr.reserved_identifier:
          case ezP.T3.Expr.reserved_keyword:
          field.ezp.css_class = 'ezp-code-reserved'
          break
          case ezP.T3.Expr.builtin_name:
          field.ezp.css_class = 'ezp-code-builtin'
          break
          default:
          field.ezp.css_class = 'ezp-code'
        }
      }
      field.ezp.css_style = model.css_style
      field.ezp.order = model.order
    } else {
      return
    }
    field.name = field.ezp.key = fieldName // main fields have identical name and key
    return field
  }
  return function (owner, ui, fieldsModel) {
    ui.fields = ui.fields || Object.create(null)
    // field maker
    // Serious things here
    var block = owner.getBlock()
    goog.asserts.assert(block, 'Missing while making fields')
    for(var key in fieldsModel) {
      var model = fieldsModel[key]
      var field = makeField(key, model)
      if (field) {
        ui.fields[key] = field
      }
    }
    // now order
    // fields must not have the same order 
    // some default fields have predefined order
    var byOrder = Object.create(null)
    var unordered = []
    var fromStart = [] // fields ordered from the beginning
    var toEnd = [] // // fields ordered to the end
    for(var key in ui.fields) {
      var field = ui.fields[key]
      var order = field.ezp.order
      if (order) {
        goog.asserts.assert(!byOrder[order],
        ezP.Do.format('Fields with the same order  {0} = {1} / {2}',
        byOrder[order].name, field.name, field.sourceBlock_.type))
        byOrder[order] = field
        if (order>0) {
          for (var i = 0; i < fromStart.length; i++) {
            if (fromStart[i].ezp.order > order) {
              break
            }
          }
          fromStart.splice(i, 0, field)
        } else if (order<0) {
          for (var i = 0; i < toEnd.length; i++) {
            if (toEnd[i].ezp.order < order) {
              break
            }
          }
          toEnd.splice(i, 0, field)
        }
      } else {
        unordered.push(field)
      }
    }
    // now order the fields in linked lists
    // Next returns the first field in a chain field.ezp.nextField -> ...
    // The chain is built from the list of arguments
    // arguments are either field names or fields
    var chain = function() {
      var field
      for (var i = 0; i < arguments.length; i++) {
        var fieldName = arguments[i]
        if ((field = goog.isString(fieldName)? ui.fields[fieldName]: fieldName)) {
          var j = unordered.length
          while (j--) {
            if(unordered[j] === field) {
              unordered.splice(j, 1);
            }
          }
          var ezp = field.ezp.ezpLast_ || field.ezp
          for (i++; i < arguments.length; i++) {
            var fieldName = arguments[i]
            if ((ezp.nextField = goog.isString(fieldName)? ui.fields[fieldName]: fieldName)) {
              var j = unordered.length
              while (j--) {
                if(unordered[j] === ezp.nextField) {
                  unordered.splice(j, 1);
                }
              }
              ezp = ezp.nextField.ezp
              delete ezp.ezpLast_
            }
          }
          field.ezp.ezpLast_ = ezp
          break
        }
      }
      return field
    }
    ui.fromStartField = chain.apply(fromStart)
    ui.fromStartField = chain(ezP.Key.MODIFIER, ezP.Key.PREFIX, ezP.Key.LABEL, ui.fromStartField)
    ui.toEndField = chain.apply(toEnd)
    ui.toEndField = chain(ui.toEndField, ezP.Key.SUFFIX, ezP.Key.COMMENT_MARK, ezP.Key.COMMENT)
    // we have exhausted all the fields that are already ordered
    // either explicitely or not
    goog.asserts.assert(unordered.length < 2,
    ezP.Do.format('Too many unordered fields in {0}/{1}',key, JSON.stringify(model)))
    unordered[0] && (ui.fromStartField = chain(ui.fromStartField, unordered[0]))
    ui.fromStartField && delete ui.fromStartField.ezp.ezpLast_
    ui.toEndField && delete ui.toEndField.ezp.ezpLast_
    ui.fields.comment && (ui.fields.comment.ezp.comment = true)
  }
} ()

/**
 * Set the underlying Blockly input.
 * Some time we will not need these inputs.
 * For ezPython.
 * @param {!Blockly.Input} input
 */
ezP.Tile.prototype.setInput = function (input) {
  this.input = input
  this.connection = input.connection
  input.ezp.tile = this
  var c8n = this.connection
  if (c8n) {
    var ezp = c8n.ezp
    ezp.tile = this
    ezp.name_ = this.key
    if (this.model.plugged) {
      ezp.plugged_ = D.plugged
    }
    if (this.model.suite && Object.keys(this.model.suite).length) {
      goog.mixin(ezp, this.model.suite)
    }
    if (this.model.optional) {//svg
      ezp.optional_ = true
    }
    ezp.disabled_ = this.model.disabled && !this.model.enabled
    var v
    if ((v = this.model.check)) {
      c8n.setCheck(v)
      ezp.hole_data = ezP.HoleFiller.getData(v, this.model.hole_value)
    } else if ((v = this.model.check = this.model.wrap)) {
      c8n.setCheck(v)
    }
  }
}

/**
 * Get the block.
 * For ezPython.
 * @param {boolean} newValue.
 */
ezP.Tile.prototype.getBlock = function () {
  return this.block
}

/**
 * Whether the input has a connection.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Tile.prototype.getConnection = function () {
  return this.input && this.input.connection
}

/**
 * Geth the workspace.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Tile.prototype.getWorkspace = function () {
  return this.connection && this.connection.sourceBlock_.workspace
}

/**
 * The target.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Tile.prototype.getTarget = function () {
  return this.connection && this.connection.targetBlock()
}

/**
 * Set the disable state.
 * For ezPython.
 * @param {!bollean} newValue.
 */
ezP.Tile.prototype.setDisabled = function (newValue) {
  this.disabled = newValue
  this.synchronize()
}

/**
 * Get the disable state.
 * For ezPython.
 */
ezP.Tile.prototype.isDisabled = function () {
  return this.disabled
}

/**
 * Get the required status.
 * For ezPython.
 * @param {boolean} newValue.
 */
ezP.Tile.prototype.isRequiredToDom = function () {
  if (this.disabled) {
    return false
  }
  if (!this.connection) {
    return false
  }
  if (this.connection.targetBlock()) {
    return true
  }
  return !this.connection.ezp.optional_
}

/**
 * Set the required status.
 * For ezPython.
 */
ezP.Tile.prototype.setRequiredFromDom = function (newValue) {
  this.required_from = newValue
}

/**
 * Get the required status.
 * For ezPython.
 * @param {boolean} newValue.
 */
ezP.Tile.prototype.isRequiredFromDom = function () {
  return this.required_from
}

/**
 * Set the disable state.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
ezP.Tile.prototype.synchronize = function () {
  var input = this.input
  if (!input) {
    return
  }
  var newValue = this.disabled
  var oldValue = input.ezp.disabled_
  if (!!oldValue === !!newValue) {
    return
  }
  input.ezp.disabled_ = newValue
  var current = this.skipRendering
  this.skipRendering = true
  input.setVisible(!newValue)
  this.skipRendering = current
  var c8n = input.connection
  if (c8n) {
    c8n.ezp.hidden_ = !!newValue // the hidden status will be forced
    c8n.setHidden(newValue)
  }
  if (input.isVisible()) {
    for (var __ = 0, field; (field = input.fieldRow[__]); ++__) {
      if (field.getText().length>0) {
        var root = field.getSvgRoot()
        if (root) {
          root.removeAttribute('display')
        } else {
          console.log('Field with no root: did you ...initSvg()?')
        }
      }
    }
    if (c8n) {
      var target = c8n.targetBlock()
      if (target) {
        var root = target.getSvgRoot()
        if (root) {
          root.removeAttribute('display')
        } else {
          console.log('Block with no root: did you ...initSvg()?')
        }
      }
    }
  }
  this.owner.delayedRender(this.block)
}

/**
 * Set the value of the field in the input given by its index
 * and the key.
 * @param {!Object} newValue.
 * @param {string} fieldKey  of the input holder in the owner object 
 * @private
 */
ezP.Tile.prototype.setFieldValue = function (newValue, fieldKey) {
  var field = this.fields[fieldKey]
  if (field) {
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.disable()
      var enable = true
    }
    try {
      field.setValue(newValue)
    } finally {
      enable && Blockly.Events.enable()
    }
  }
}
