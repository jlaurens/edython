/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * License EUPL-1.2
 */
/**
 * @fileoverview Object representing text, controlling and owning a field. Headless without an associate field.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

goog.provide('eYo.Content')

goog.require('eYo.Const')
goog.require('eYo.Do')
goog.require('eYo.T3.Profile')

goog.forwardDeclare('eYo.Field')
goog.forwardDeclare('eYo.Field.Label')
goog.forwardDeclare('eYo.Field.Input')

/**
 * The field content contains everything needed to create a field eventually.
 * @param {!Object} owner  The owner is a block delegate.
 * @param {!string} key  One of the keys in `content` section of the block or slot model.
 * @param {!Object} model  the model for the given key in the above mention section.
 * @constructor
 */
eYo.Content = function (owner, key, model) {
  goog.asserts.assert(owner, 'Missing content owner')
  goog.asserts.assert(key, 'Missing content key')
  goog.asserts.assert(model, 'Missing content model')
  this.owner = owner
  this.key = key
  this.model = model
  this.field = undefined
  this.next = undefined
  if (!model.setupp_) {
    this.setupModel()
  }
}

/**
 * Create all the contents from the given model.
 * For edython.
 * @param {!Object} owner
 * @param {!Object} contentsModel
 */
eYo.Content.feed = function () {
  // Change some `... = true,` entries to real functions
  return function (owner, contentsModel) {
    owner.contents || (owner.contents = Object.create(null))
    // content maker
    // Serious things here
    var block = owner.getBlock()
    goog.asserts.assert(block, 'Missing block while making content')
    for (var key in contentsModel) {
      var model = contentsModel[key]
      if (goog.isString(model)) {
        if (model.startsWith('css')) {
          continue
        }
        model = {
          value: model
        }
      } 
      var content = new eYo.Content(owner, key, model)
      owner.contents[key] = content
      if (key === eYo.Key.BIND) {
        owner.bindContent = content
      }
    }
    // now order
    // contents must not have the same order
    // some default contents have predefined relative order
    var byOrder = Object.create(null)
    var unordered = []
    var fromStart = [] // contents ordered from the beginning
    var toEnd = [] // // contents ordered to the end
    for (key in owner.contents) {
      var content = owner.contents[key]
      var order = content.model.order
      if (order) {
        goog.asserts.assert(!goog.isDefAndNotNull(byOrder[order]),
        'Contents with the same order  %s = %s / %s',
        byOrder[order] && byOrder[order].key || 'NOTHING', content.key, owner.getBlock().type)
        byOrder[order] = content
        if (order > 0) {
          // insert this content from the start
          for (var i = 0; i < fromStart.length; i++) {
            // find the first index which corresponding order is > order
            if (fromStart[i].model.order > order) {
              break
            }
          }
          // insert the content at that position (possibly at the end)
          fromStart.splice(i, 0, content)
        } else /* if (order < 0) */ {
          // insert this content to the end
          for (i = 0; i < toEnd.length; i++) {
            // find the first index which corresponding order is < order
            if (toEnd[i].eyo.model.order < order) {
              break
            }
          }
          toEnd.splice(i, 0, content)
        }
      } else {
        // this is an unordered content
        unordered.push(content)
      }
    }
    // now order the contents in linked lists
    // Next returns the first content in a chain content.next -> ...
    // The chain is built from the list of arguments
    // arguments are either content names or contents
    // When content names are given, we just insert the corresponding
    // content into the chain
    // When contents are given, we insert the chain starting at that point
    // The result is a chain of contents.
    // content.next points to the next content of the chain
    // content.next.previous is a fixed point.
    // A content is the head of a chain in one of two cases
    // 1) content._last_ is the content of a field (possibly the first of the chain)
    // 2) It has no previous nor next content, meaning that
    // ...eyo.next and ...eyo.previous are false.
    // contents with a .previous cannot have a ._last_ because they are not the head of the chain.
    var chain = function (/* variable argument list */) {
      // We first loop to find the first content that can be the
      // start of a chain. Every content before is ignored.
      var start, next
      for (var i = 0; i < arguments.length; i++) {
        var name = arguments[i]
        if ((start = goog.isString(name) ? owner.contents[name] : name)) {
          // remove this content from the list of unordered contents
          if (start.previous) {
            // this content already belongs to a chain
            // but it is not the first one
            // It does not fit in
            continue
          }
          // This content is acceptable as the first chain element
          var content = start._last_ || start
          // Now scan the next argument contents, if any
          while (++i < arguments.length) {
            name = arguments[i]
            if ((next = goog.isString(name) ? owner.contents[name] : name)) {
              if (next.previous) {
                // this was not a starting point
                continue
              }
              if (next === start) {
                // avoid infinite loop
                continue
              }
              content.next = next
              next.previous = content
              content = next
              var last = content._last_
              if (last) {
                delete content._last_
                content = last
              }
            }
          }
          start._last_ = content || start
          // singleton in the latter case
          break
        }
      }
      return start
    }
    owner.fromStartContent = chain.apply(this, fromStart)
    owner.fromStartContent = chain(eYo.Key.MODIFIER, eYo.Key.PREFIX, eYo.Key.START, eYo.Key.LABEL, eYo.Key.SEPARATOR, owner.fromStartContent)
    owner.toEndContent = chain.apply(this, toEnd)
    owner.toEndContent = chain(owner.toEndContent, eYo.Key.END, eYo.Key.SUFFIX, eYo.Key.COMMENT_MARK, eYo.Key.COMMENT)
    // we have exhausted all the contents that are already ordered
    // either explicitely or not
    // Remove from unordered what has been ordered so far
    var j = unordered.length
    while (j--) {
      if (unordered[j].previous || unordered[j]._last_) {
        unordered.splice(j, 1)
      }
    }
    goog.asserts.assert(unordered.length < 2,
      eYo.Do.format('Too many unordered contents in {0}/{1}', key, JSON.stringify(model)))
    unordered[0] && (owner.fromStartContent = chain(owner.fromStartContent, unordered[0]))
    owner.fromStartContent && delete owner.fromStartContent._last_
    owner.toEndContent && delete owner.toEndContent._last_
    owner.contents.comment && (owner.contents.comment.isComment = true)
  }
} ()

/**
 * Make the field.
 * @return {?eYo.Field}
 */
eYo.Content.prototype.makeField = function () {
  var fieldName = this.key
  var model = this.model
  var field
  if (goog.isString(model)) {
    if (model.startsWith('css')) {
      return
    }
    field = new eYo.FieldLabel(this, model)
    field.eyo.css_class = eYo.T3.getCssClassForText(model)
  } else if (goog.isObject(model)) {
    setupModel(model)
    if (model.edit || model.validator || model.endEditing || model.startEditing) {
      // this is an editable field
      field = new (model.variable? eYo.FieldVariable: eYo.FieldInput)(this, model.edit || '', model.validator, fieldName)
      field.eyo.isEditable = true
    } else if (goog.isDefAndNotNull(model.value) || goog.isDefAndNotNull(model.css)) {
      // this is just a label field
      field = new eYo.FieldLabel(this, model.value || '')
    } else { // other entries are ignored
      return
    }
    field.eyo.model = model
    if (!(field.eyo.css_class = model.css_class || (model.css && 'eyo-code-' + model.css))) {
      field.eyo.css_class = eYo.T3.getCssClassForText(field.getValue())
    }
    field.eyo.css_style = model.css_style
  } else {
    return
  }
  field.name = field.eyo.key = fieldName // main contents have identical name and key
  field.eyo.nextField = undefined // debug step
  return field
}

/**
 * Setup the model.
 */
eYo.Content.prototype.setupModel = function () {
}

/**
 * Default method to start editing.
 * @this {Object} is a field owning an helper
 */
eYo.Content.onStartEditing = function () {
}

/**
 * Default method to end editing.
 * @this {Object} is a field owning an helper
 */
eYo.Content.onEndEditing = function () {
  var newValue = this.getValue()
  this.eyo.data.fromField(newValue)
}
