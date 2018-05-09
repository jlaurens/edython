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

goog.provide('edY.Tile')

goog.require('edY.Do')

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
edY.Tile = function(owner, key, tileModel) {
  goog.asserts.assert(owner, 'Missing tile owner')
  goog.asserts.assert(key, 'Missing tile key')
  goog.asserts.assert(tileModel, 'Missing tile model')
  goog.asserts.assert(tileModel.order, 'Missing tile model order')
  this.owner = owner
  this.key = key
  this.model = tileModel
  this.input = undefined
  this.wait = 1
  var block = this.block = owner.block_
  goog.asserts.assert(block,
    edY.Do.format('block must exist {0}/{1}', key))  
  edY.Tile.makeFields(this, this, tileModel.fields)
  if (tileModel.wrap) {
    this.setInput(block.appendWrapValueInput(key, tileModel.wrap, tileModel.optional, tileModel.hidden))
    this.input.connection.edy.model = tileModel
  } else if (tileModel.check) {
    this.setInput(block.appendValueInput(key))
    this.input.connection.edy.model = tileModel
  }
}

/**
 * Install this tile on a block.
 */
edY.Tile.prototype.init = function() {
  if (this.svgRoot_) {
    // Tile has already been initialized once.
    return;
  }
  // Build the DOM.
  this.svgGroup_ = Blockly.utils.createSvgElement('g', {
    class: 'edy-tile'
  }, null);
  // init all the fields
  for (var k in this.fields) {
    var field = this.fields[k]
    field.setSourceBlock(this.block) // is it necessary?
    field.edy.tile = this
    field.edy.ui = this.ui
    field.init()
  }
  this.getBlock().getSvgRoot().appendChild(this.svgGroup_);
  // this.render_();
};
console.warn('What would be a tile rendering?')
/**
 * The DOM SVG group representing this tile.
 */
edY.Tile.prototype.getSvgRoot = function() {
  return this.svgGroup_
};

/**
 * Dispose of all DOM objects belonging to this tile.
 */
edY.Tile.prototype.dispose = function() {
  goog.dom.removeNode(this.svgGroup_);
  this.svgGroup_ = null;
  this.owner = null
  this.key = null
  this.model = null
  this.input = null
  this.block = null
  this.ui = null
}

goog.require('edY.FieldLabel')
goog.require('edY.FieldInput')


/**
 * Create all the fields from the model.
 * For ezPython.
 * @param {!Object} owner
 * @param {!Object} ui
 * @param {!Object} fieldsModel
 */
edY.Tile.makeFields = function() {
  // This is a closure
  // default helper functions for an editable field bound to a data object
  // `this` is an instance of  edY.FieldInput
  var validate = function (txt) {
      return this.edy.validate.call(this, txt)
  }
  var startEditing = function () {
  }
  var endEditing = function () {
    goog.asserts.assert(this.edy.data, 'No data bound to field '+this.key+'/'+this.sourceBlock_.type)
    this.edy.data.fromText(this.getValue())
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
      field = new edY.FieldLabel(model)
      field.edy.css_class = edY.Do.cssClassForText(model)
    } else if (goog.isObject(model)) {
      setupModel(model)
      if (model.edit || model.validate || model.endEditing || model.startEditing) {
        // this is an ediable field
        field = new edY.FieldInput(model.edit || '', model.validate, fieldName)
      } else if (goog.isDefAndNotNull(model.value) || goog.isDefAndNotNull(model.css)) {
        // this is just a label field
        field = new edY.FieldLabel(model.value || '')
      } else { // other entries are ignored
        return
      }
      field.edy.model = model
      if (!(field.edy.css_class = model.css_class || model.css && 'edy-code-'+model.css)) {
        field.edy.css_class = edY.Do.cssClassForText(field.getValue())
      }
      field.edy.css_style = model.css_style
      field.edy.order = model.order
    } else {
      return
    }
    field.name = field.edy.key = fieldName // main fields have identical name and key
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
      var order = field.edy.order
      if (order) {
        goog.asserts.assert(!byOrder[order],
        edY.Do.format('Fields with the same order  {0} = {1} / {2}',
        byOrder[order].name, field.name, field.sourceBlock_.type))
        byOrder[order] = field
        if (order>0) {
          for (var i = 0; i < fromStart.length; i++) {
            if (fromStart[i].edy.order > order) {
              break
            }
          }
          fromStart.splice(i, 0, field)
        } else if (order<0) {
          for (var i = 0; i < toEnd.length; i++) {
            if (toEnd[i].edy.order < order) {
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
    // Next returns the first field in a chain field.edy.nextField -> ...
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
          var edy = field.edy.ezpLast_ || field.edy
          for (i++; i < arguments.length; i++) {
            var fieldName = arguments[i]
            if ((edy.nextField = goog.isString(fieldName)? ui.fields[fieldName]: fieldName)) {
              var j = unordered.length
              while (j--) {
                if(unordered[j] === edy.nextField) {
                  unordered.splice(j, 1);
                }
              }
              edy = edy.nextField.edy
              delete edy.ezpLast_
            }
          }
          field.edy.ezpLast_ = edy
          break
        }
      }
      return field
    }
    ui.fromStartField = chain.apply(fromStart)
    ui.fromStartField = chain(edY.Key.MODIFIER, edY.Key.PREFIX, edY.Key.START, edY.Key.LABEL, ui.fromStartField)
    ui.toEndField = chain.apply(toEnd)
    ui.toEndField = chain(ui.toEndField, edY.Key.END, edY.Key.SUFFIX, edY.Key.COMMENT_MARK, edY.Key.COMMENT)
    // we have exhausted all the fields that are already ordered
    // either explicitely or not
    goog.asserts.assert(unordered.length < 2,
    edY.Do.format('Too many unordered fields in {0}/{1}',key, JSON.stringify(model)))
    unordered[0] && (ui.fromStartField = chain(ui.fromStartField, unordered[0]))
    ui.fromStartField && delete ui.fromStartField.edy.ezpLast_
    ui.toEndField && delete ui.toEndField.edy.ezpLast_
    ui.fields.comment && (ui.fields.comment.edy.comment = true)
  }
} ()

/**
 * Set the underlying Blockly input.
 * Some time we will not need these inputs.
 * For ezPython.
 * @param {!Blockly.Input} input
 */
edY.Tile.prototype.setInput = function (input) {
  this.input = input
  this.inputType = this.input.type
  this.connection = input.connection
  input.edy.tile = this
  var c8n = this.connection
  if (c8n) {
    var edy = c8n.edy
    edy.tile = this
    edy.name_ = this.key
    if (this.model.plugged) {
      edy.plugged_ = this.model.plugged
    }
    if (this.model.suite && Object.keys(this.model.suite).length) {
      goog.mixin(edy, this.model.suite)
    }
    if (this.model.optional) {//svg
      edy.optional_ = true
    }
    var v
    if ((v = this.model.check)) {
      c8n.setCheck(v)
      edy.hole_data = edY.HoleFiller.getData(v, this.model.hole_value)
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
edY.Tile.prototype.getBlock = function () {
  return this.block
}

/**
 * Whether the input has a connection.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
edY.Tile.prototype.getConnection = function () {
  return this.input && this.input.connection
}

/**
 * Geth the workspace.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
edY.Tile.prototype.getWorkspace = function () {
  return this.connection && this.connection.sourceBlock_.workspace
}

/**
 * The target.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
edY.Tile.prototype.getTarget = function () {
  return this.connection && this.connection.targetBlock()
}

/**
 * Set the disable state.
 * For ezPython.
 * @param {!bollean} newValue.
 */
edY.Tile.prototype.setIncog = function (newValue) {
  this.incog = newValue
  if (this.wait) {
    return
  }
  var c8n = this.input && this.input.connection
  c8n && c8n.edy.setIncog(newValue)
  this.synchronize()
}

/**
 * Get the disable state.
 * For ezPython.
 */
edY.Tile.prototype.isIncog = function () {
  return this.incog
}

/**
 * Get the required status.
 * For ezPython.
 * @param {boolean} newValue.
 */
edY.Tile.prototype.isRequiredToDom = function () {
  if (this.incog) {
    return false
  }
  if (!this.connection) {
    return false
  }
  if (!this.connection.edy.wrapped_ && this.connection.targetBlock()) {
    return true
  }
  if (this.required) {
    return true
  }
  if (this.model.xml && this.model.xml.required) {
    return true
  }
  return false
}

/**
 * Get the required status.
 * For ezPython.
 * @param {boolean} newValue.
 */
edY.Tile.prototype.isRequiredFromDom = function () {
 return this.is_required_from_dom || !this.incog && this.model.xml && this.model.xml.required
}

/**
 * Set the required status.
 * For ezPython.
 * @param {boolean} newValue.
 */
edY.Tile.prototype.setRequiredFromDom = function (newValue) {
  this.is_required_from_dom = newValue
}

/**
 * Consolidate the incog state.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
edY.Tile.prototype.consolidate = function () {
  if (this.wait) {
    return
  }
  var c8n = this.input && this.input.connection
  if (c8n) {
    c8n.edy.setIncog(this.isIncog())
    c8n.edy.wrapped_ && c8n.setHidden(true) // Don't ever connect any block to this
  }
}

/**
 * The receiver is now ready to eventually synchronize and consolidate.
 */
edY.Tile.prototype.beReady = function () {
  this.wait = 0
}

/**
 * Set the wait status of the field.
 * Any call to `waitOn` must be balanced by a call to `waitOff`
 */
edY.Tile.prototype.waitOn = function () {
  return ++ this.wait
}

/**
 * Set the wait status of the field.
 * Any call to `waitOn` must be balanced by a call to `waitOff`
 */
edY.Tile.prototype.waitOff = function () {
  goog.asserts.assert(this.wait>0, edY.Do.format('Too  many `waitOn` {0}/{1}', this.key, this.owner.block_.type))
  if (--this.wait == 0) {
    this.consolidate()
  }
}

/**
 * Set the disable state.
 * For ezPython.
 * @param {!Blockly.Input} workspace The block's workspace.
 */
edY.Tile.prototype.synchronize = function () {
  var input = this.input
  if (!input) {
    return
  }
  var newValue = this.incog
  var current = this.skipRendering
  this.skipRendering = true
  try {
   input.setVisible(!newValue)
  } finally {
    this.skipRendering = current
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
    var c8n = input.connection
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
edY.Tile.prototype.setFieldValue = function (newValue, fieldKey) {
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

goog.forwardDeclare('edY.DelegateSvg.List')

/**
 * Convert the tile's connected target into the given xml element.
 * List all the available data and converts them to xml.
 * For ezPython.
 * @param {Element} xml the persistent element.
 * @param {boolean} optNoId.
 * @return a dom element, void lists may return nothing
 * @this a block delegate
 */
edY.Tile.prototype.toDom = function(element, optNoId) {
  var xml = this.model.xml
  if (!this.isIncog() && (!goog.isDef(xml) || xml !== false)) {
    var out = function() {
      var c8n = this.connection
      if (c8n) {
        var target = c8n.targetBlock()
        if (target) { // otherwise, there is nothing to remember
          if (target.edy.wrapped_) {
            // wrapped blocks are just a convenient computational model.
            // For lists only, we do create a further level
            // Actually, every wrapped block is a list
            if (target.edy instanceof edY.DelegateSvg.List) {
              var child = edY.Xml.blockToDom(target, optNoId)
              if (child.childNodes.length>0) {
                if (!xml || !xml.noInputName) {
                  child.setAttribute(edY.Xml.INPUT, this.key)
                }
                goog.dom.appendChild(element, child)
                return child      
              }
            } else {
              // let the target populate the given element
              return edY.Xml.toDom(target, element, optNoId)
            }
          } else {
            var child = edY.Xml.blockToDom(target, optNoId)
            if (child.childNodes.length>0 || child.hasAttributes()) {
              if (!xml || !xml.noInputName) {
                if (this.inputType === Blockly.INPUT_VALUE) {
                  child.setAttribute(edY.XmlKey.INPUT, this.key)
                } else if (this.inputType === Blockly.NEXT_STATEMENT) {
                  child.setAttribute(edY.XmlKey.FLOW, this.key)
                }
              }
              goog.dom.appendChild(element, child)
              return child      
            }
          }
        }
      }
    }.call(this)
    if (!out && this.isRequiredToDom()) {
      var child = goog.dom.createDom('edy:placeholder')
      child.setAttribute(edY.XmlKey.INPUT, this.key)
      goog.dom.appendChild(element, child)
    }
  }
}

/**
 * Initialize the receiver from a dom element.
 * Given an input and an element, initialize the input target
 * block with data from the given element.
 * The given element was created by the input's source block
 * in a blockToDom method. If it contains a child element
 * which input attribute is exactly the input's name,
 * then we ask the input target block to fromDom.
 * Target blocks are managed here too.
 * No consistency test is made however.
 * For ezPython.
 * @param {Element} element a dom element in which to save the input
 * @return the added child, if any
 */
edY.Tile.prototype.fromDom = function(element) {
  var xml = this.model.xml
  if (!goog.isDef(xml) || xml !== false) {
    this.setRequiredFromDom(false)
    var c8n = this.connection
    if (c8n) {
      var out
      var target = c8n.targetBlock()
      if (target && target.edy.wrapped_ && !(target.edy instanceof edY.DelegateSvg.List)) {
        this.setRequiredFromDom(true) // this is not sure, it depends on how the target read the dom
        out = edY.Xml.fromDom(target, element)
      } else {
      // find an xml child with the proper input attribute
        for (var i = 0, child; (child = element.childNodes[i++]);) {
          if (goog.isFunction(child.getAttribute)) {
            if (this.inputType === Blockly.INPUT_VALUE) {
              var attribute = child.getAttribute(edY.Xml.INPUT)
            } else if (this.inputType === Blockly.NEXT_STATEMENT) {
              var attribute = child.getAttribute(edY.Xml.FLOW)
            }
          }
          if (attribute === this.key) {
            if (child.tagName && child.tagName.toLowerCase() === 'edy:placeholder') {
              this.setRequiredFromDom(true)
              out = true
            } else if (target) {
              if (target.edy instanceof edY.DelegateSvg.List) {
                for (var i = 0, grandChild;(grandChild = child.childNodes[i++]);) {
                  if (goog.isFunction(grandChild.getAttribute)) {
                    var name = grandChild.getAttribute(edY.XmlKey.INPUT)
                    var input = target.edy.getInput(target, name)
                    if (input) {
                      if (!input.connection) {
                        console.warn('Missing connection')
                      }
                      var inputTarget = input.connection.targetBlock()
                      if (inputTarget) {
                        edY.Xml.fromDom(inputTarget, grandChild)
                      } else if ((inputTarget = edY.Xml.domToBlock(grandChild, this.owner.block_.workspace))) {
                        var targetC8n = inputTarget.outputConnection
                        if (targetC8n && targetC8n.checkType_(input.connection)) {
                          targetC8n.connect(input.connection)
                          this.setRequiredFromDom(true)
                        }
                      }
                    }
                  }
                }
                out = true
              } else {
                out = edY.Xml.fromDom(target, child)
              }
            } else if ((target = Blockly.Xml.domToBlock(child, this.getWorkspace()))) {
              // we could create a block from that child element
              // then connect it
              if (target.outputConnection && c8n.checkType_(target.outputConnection)) {
                c8n.connect(target.outputConnection)
                this.setRequiredFromDom(true)
              } else if (target.previousConnection && c8n.checkType_(target.previousConnection)) {
                c8n.connect(target.previousConnection)
              }
              out = target
            }
          }
        }
      }
      if (out) {
        this.didLoad()
      }
      return out
    }
  }
}

/**
 * Convert the tile's connected target into the given xml element.
 * List all the available data and converts them to xml.
 * For ezPython.
 * @param {Element} xml the persistent element.
 * @param {boolean} optNoId.
 * @return a dom element, void lists may return nothing
 * @this a block delegate
 */
edY.Tile.prototype.didLoad = function() {
  var xml = this.model.xml
  xml && goog.isFunction(xml.didLoad) && xml.didLoad.call(this)
}