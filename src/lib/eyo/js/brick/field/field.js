/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview Label fields and input fields.
 */
'use strict'

/**
 * @name{eYo.field}
 * @namespace
 */
eYo.dfs.makeNS(eYo, 'field', {
  STATUS_NONE: '', // names correspond to `eyo-code-...` css class names
  STATUS_COMMENT: 'comment',
  STATUS_RESERVED: 'reserved',
  STATUS_BUILTIN: 'builtin',
  BIND: 'bind',
})

eYo.field.allowModelPaths({
  [eYo.model.ROOT]: 'fields',
  '(?:slots\\.\\w+\\.)?fields\\.\\w+': [
    'order', // number,
    'value', // '(',
    'reserved', // : '.',
    'separator', // : true,
    'hidden', // : true,
    'variable', // : true, obsolete
    'validate', // : true,
    'edit', // : foo,
    'startEditing', // : true|function,
    'endEditing', // : true|function,
    'didLoad', //  () => {},
    'willRender', //  () => {},
  ],
})

;(() => {
  let endEditing = function () {
    var data = this.data
    eYo.assert(data, `No data bound to field ${this.name}/${this.brick.type}`)
    var ans = this.validate(this.text)
    if (ans) {
      data.fromField(ans)
    } else {
      this.text = data.toText()
    }
  }
  eYo.field.allowModelShortcuts({
    '(?:slots\\.\\w+\\.|right\\.)?fields\\.\\w+': (before, p) => {
      if (eYo.isD(before)) {
        let a = new Set('value', 'reserved', 'builtin', 'comment', 'edit')
        let b = Object.keys(before).filter(x => a.has(x))
        b.length > 1 && eYo.throw(`Only one key of 'value', 'reserved', 'builtin', 'comment' and 'edit' at ${p}`)
        if (eYo.isStr(before.edit)) {
          before.text__ = before.edit
          before.status = eYo.field.STATUS_NONE
        } else if (eYo.isStr(before.value)) {
          before.text__ = before.value
          // this is just a label field
          // field = new eYo.field.Label(owner, name, model.value || '')
          before.status = eYo.field.STATUS_NONE
        } else if (eYo.isStr(before.reserved)) {
          before.text__ = before.reserved
          // this is just a label field
          // field = new eYo.fieldLabel(owner, name, model.reserved)
          before.status = eYo.field.STATUS_RESERVED
        } else if (eYo.isStr(before.builtin)) {
          before.text__ = before.builtin
          // this is just a label field
          // field = new eYo.field.Label(owner, name, model.builtin)
          before.status = eYo.field.STATUS_BUILTIN
        } else if (eYo.isStr(before.comment)) {
          before.text__ = before.comment
          // this is just a label field
          // field = new eYo.field.Label(owner, name, model.comment)
          status = eYo.field.STATUS_COMMENT
        } else if ([
          eYo.field.STATUS_NONE,
          eYo.field.STATUS_COMMENT,
          eYo.field.STATUS_RESERVED,
          eYo.field.STATUS_BUILTIN,
        ].includes(before.status)) {
          before.text__ = ''
        } else {
          console.error(before)
          eYo.throw(`Bad model ${before} at ${p}`)
        }
      } else {
        return {
          value: before,
        }
      }
    },
    '(?:slots\\.\\w+\\.|right\\.)?fields\\.\\w+.startEditing': (before, p) => {
      return eYo.isF(before) ? before : eYo.doNothing
    },
    '(?:slots\\.\\w+\\.|right\\.)?fields\\.\\w+.endEditing': (before, p) => {
      return eYo.isF(before) ? before : endEditing
    },
    '(?:slots\\.\\w+\\.|right\\.)?fields\\.\\w+.(?:didLoad|willRender)': (before, p) => {
      return eYo.isF(before) ? before : eYo.INVALID
    },
  })
})()

eYo.require('geom.Size')
eYo.require('xre')

// actual field names
/*
eYo.key.MODIFIER
eYo.key.PREFIX
eYo.key.LABEL
eYo.key.START
eYo.key.SEPARATOR

operator < bind

bind
delimiter?

value
expression
variant

content
open
sep
FIELD

open
close
begin



eYo.key.END,
eYo.key.SUFFIX,
eYo.key.COMMENT_MARK,
eYo.key.COMMENT

/**
 * The model path.
 * @see The `new` method.
 * @param {String} key
 */
eYo.field._p.modelPath = function (key) {
  return eYo.isStr(key) ? `fields.${key}` : 'fields'
}

/**
 * The model Base used to derive a new class.
 * @see The `new` method.
 * @param {Object} model
 */
eYo.field._p.modelBase = function (model) {
  return model.edit || model.endEditing || model.startEditing
    ? eYo.field.Input
    : eYo.field.Label
}

/**
 * For subclassers.
 * Called from ``modelMakeC9r``.
 * @param {Object} prototype
 * @param {String} key
 * @param {Object} model
 */
eYo.field._p.modelHandle = function (_p, name, model) {
  let willRender_m = model.willRender
  if (eYo.isF(willRender_m)) {
    if (willRender_m.length) {
      _p.willRender = function () {
        willRender_m.call(this, () => {
          eYo.field.Base_p.willRender.call(this)
        })
      }
    } else {
      _p.willRender = function () {
        try {
          this.willRender = eYo.field.Base_p.willRender
          willRender_m.call(this)
        } finally {
          delete this.willRender
        }
      }
    }
  }
}

/**
 * Abstract class for text fields.
 * @param {eYo.brick|eYo.slot.Base|eYo.magnet.Base} bsim The owner of the field.
 * @param {string} text The initial content of the field.
 * @constructor
 */
eYo.field.makeBase({
  init (bsm, name) {
    this.name_ = name
    this.text_ = this.model.text__
    this.reentrant_ = {}
    Object.defineProperty(bsm, `${name}_f`, { value: this})
    console.warn('Defer next line to the owner ?')
    bsm.hasUI && this.initUI()
  },
  properties: {
    status: eYo.field.STATUS_NONE, // one of STATUS_... above
    isEditing: false,
    editable: false,
    model: eYo.NA,
    /**
     * The name of field must be unique within a brick.
     * This is necessary for proper undo management.
     * Static label fields are named for practical use.
     * @readonly
     * @type {String} The name of the field
     */
    name: '',
    /**
     * @type {String} The text of the field.
     */
    text: {
      validate (after) {
        return after ? String(after) : eYo.INVALID
      },
      willChange(before, after) {
        this.brick.fireChangeEvent('field', this.name, before, after)
      },
      /**
       * 
       */
      set (builtin, after) {
        this.brick.changer.wrap(() => {
          builtin(after)
          this.size.setFromText(after)
        })
      },
      didChange(after) {
        this.placeholder_ = !after || !after.length
      },
    },
    /**
     * Is the field visible, or hidden due to the brick being collapsed?
     * @type {boolean}
     * @private
     */
    visible: {
      value: true,
      /**
       * Sets whether this editable field is visible or not.
       * @param {boolean} after True if visible.
       */
      didChange (after) /** @suppress {globalThis} */ {
        var d = this.ui_driver
        d && d.displayedUpdate(this)
        if (this.brick.rendered) {
          this.brick.render()
          after && this.brick.bumpNeighbours_()
        }
      },
    },
    css_class: {},
    /**
     * @readonly
     * @type {eYo.geom.Size} The size of the field
     */
    size: {
      value () {
        return new eYo.geom.Size()
      },
      copy: true,
    },
    /**
     * @readonly
     * @type {String} The text of the field.
     */
    displayText: {
      get () { return this.text_ },
    },
    /**
     * Check whether this field is currently editable.
     * Text labels are not editable and are not serialized to XML.
     * Editable fields are serialized, but may exist on locked brick.
     * @return {boolean} whether this field is editable and on an editable brick
     */
    isCurrentlyEditable: {
      get () {
        return this.editable && this.brick.editable
      },
    },
    isComment: {
      get () {
        return this.status === eYo.field.STATUS_COMMENT
      },
    },
    isReserved: {
      get () {
        return this.status === eYo.field.STATUS_RESERVED
      },
    },
    isBuiltin: {
      get () {
        return this.status === eYo.field.STATUS_BUILTIN
      },
    },
    /**
     * Whether the field of the receiver starts with a separator.
     */
    startsWithSeparator: {
      get () {
        // if the text is void, it can not change whether
        // the last character was a letter or not
        var text = this.text
        if (text.length) {
          if (this.name === 'separator'
            || (this.model && this.model.separator)
            || eYo.xre.operator.test(text[0])
            || eYo.xre.delimiter.test(text[0])
            || text[0] === '.'
            || text[0] === ':'
            || text[0] === ','
            || text[0] === ';') {
            // add a separation before
            return true
          }
        }
      },
    },
  },
})

/**
 * Initializes the model of the field after it has been installed on a block.
 * No-op by default.
 */
eYo.field.Base_p.initModel = eYo.doNothing

/**
 * Draws the border with the correct width.
 * Saves the computed width in a property.
 * @private
 */
eYo.field.Base_p.render_ = function() {
  if (!this.visible_) {
    this.size_.width = 0
    return
  }
  var d = this.ui_driver
  d && (d.textRemove(field), d.textCreate(field))
  this.updateWidth()
}

/**
 * Updates the width of the field in the UI.
 **/
eYo.field.Base_p.updateWidth = function() {
  var d = this.ui_driver
  d && (d.updateWidth(this))
}

/**
 * Validate the keyed data of the source brick.
 * Asks the data object to do so.
 * The bound data must exist.
 * @param {String} txt
 * @return {String}
 */
eYo.field.Base_p.validate = function (txt) {
  var v = this.data.validate(eYo.isDef(txt) ? txt : this.text)
  return eYo.isVALID(v) ? v : eYo.NA
}

/**
 * Will render the field.
 * We should call `this.willRender()` from the model.
 */
eYo.field.Base_p.willRender = function () {
  var d = this.ui_driver
  if (d) {
    d.makePlaceholder(this, this.isPlaceholder)
    d.makeComment(this, this.isComment)
  }
}

/**
 * Class for a non-editable field.
 * The only purpose is to start with a different height.
 * @param {eYo.brick|eYo.slot.Base} bsi The owner of the field.
 * @param {string} name The required name of the field
 * @param {string} text The initial content of the field.
 * @extends {eYo.field}
 * @constructor
 */
eYo.field.makeC9r('Label', {
  properties: {
    isLabel: true
  },
})

/**
 * Class for an editable code field.
 * @param {eYo.brick.Base|eYo.slot.Base} bs The owner of the field.
 * @param {string=} name
 * @param {string} text The initial content of the field.
 * @extends {eYo.field}
 * @constructor
 */
eYo.field.makeC9r('Input', {
  properties: {
    /**
     * css class for both the text element and html input.
     */
    css_class: 'eyo-code',
    editable: true,
    placeholderText: '',
    /**
     * Get the text from this field as displayed on screen.
     * @return {string} Currently displayed text.
     * @private
     * @suppress{accessControls}
     */
    displayText: {
      get () {
        if (!this.isEditing && !this.text_.length &&(this.isPlaceholder || (this.data && (this.data.placeholder || this.data.model.placeholder)))) {
          return this.getPlaceholderText()
        }
        return this.text 
      },
    },
    /**
     * Whether the field text corresponds to a placeholder.
     */
    isPlaceholder: {
      get () {
        return !!this.model.placeholder
      },
    },
  },
  methods: {
    /**
     * The placeholder text.
     * Get the model driven value if any.
     * @param {boolean} clear
     * @return {string} Currently displayed text.
     * @private
     */
    getPlaceholderText (clear) {
      if (clear) {
        this.placeholderText_ = eYo.NA
      } else if (this.placeholderText_) {
        return this.placeholderText_
      }
      if (this.brick) {
        var ph = model => {
          var placeholder = model && model.placeholder
          if (eYo.isNum(placeholder)) {
            return placeholder.toString()
          }
          placeholder = eYo.do.valueOf(placeholder, this)
          if (placeholder) {
            placeholder = placeholder.toString()
            if (placeholder.length > 1) {
              placeholder = placeholder.trim() // one space alone is allowed
            }
          }
          return placeholder
        }
        var data = this.data
        return (this.placeholderText_ = ph(data && data.model) || ph(this.model) || eYo.msg.placeholder.CODE)
      }
    },
  },
})

