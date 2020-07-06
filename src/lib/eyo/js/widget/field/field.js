/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */

/**
 * @fileoverview Label fields and input fields.
 */
'use strict'

eYo.require('data')

/**
 * @name{eYo.field}
 * @namespace
 */
eYo.fsm.newNS(eYo, 'field', {
  STATUS_NONE: '', // names correspond to `eyo-code-...` css class names
  STATUS_COMMENT: 'comment',
  STATUS_RESERVED: 'reserved',
  STATUS_BUILTIN: 'builtin',
  BIND: 'bind',
})

eYo.require('geom')
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
*/

eYo.mixinFR(eYo.field._p, {
  /**
   * The model path.
   * @see The `new` method.
   * @param {String} key
   */
  modelPath (key) {
    return eYo.isStr(key) ? `fields.${key}` : 'fields'
  },
  /**
   * The model Base used to derive a new class.
   * @see The `new` method.
   * @param {Object} model
   * @param {Object} key
   */
  modelBaseC9r (model, key) { // eslint-disable-line
    //<<< mochai: modelBaseC9r
    //... ['edit', 'endEditing', 'startEditing'].forEach(K => {
    //...   let field = eYo.field.new({
    //...     [K]: true,
    //...   }, 'field', onr)
    //...   chai.expect(field).instanceOf(eYo.field.Input)
    //... })
    //... let field = eYo.field.new({}, 'field', onr)
    //... chai.expect(field).instanceOf(eYo.field.Label)
    return model.edit || model.endEditing || model.startEditing
      ? eYo.field.Input
      : eYo.field.Label
    //>>>
  },
})

/**
 * Abstract class for text fields.
 * @param {eYo.brick|eYo.slot.BaseC9r|eYo.magnet.BaseC9r} bsim The owner of the field.
 * @param {string} text The initial content of the field.
 * @constructor
 */
eYo.field.makeBaseC9r(true, {
  //<<< mochai: eYo.Field
  //<<< mochai: Basics
  //... chai.expect(eYo.Field).not.undefined
  //>>>
  init (name, bsm) {
    //<<< mochai: init
    this.text__ = this.eyo.model.text__ || ''
    console.warn('Defer next line to the owner ?')
    bsm.hasUI && this.initUI()
    //... let changer = eYo.changer.new('changer', onr)
    //... setup({
    //...   properties: {
    //...     changer
    //...   }
    //... })
    //... let f = eYo.field.new({}, 'foo', onr)
    //... chai.expect(f.text).equal('')
    //>>>
  },
  properties: {
    //<<< mochai: properties
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
        return eYo.isDef(after) ? String(after) : eYo.INVALID
      },
      willChange(before, after) {
        this.owner.fireChangeEvent('field', this.name, before, after)
      },
      /**
       * 
       */
      set (builtin, after) {
        this.owner.changer.wrap(() => {
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
      didChange (after) /** @suppress {globalThis} */ { // eslint-disable-line
        var d = this.drvr
        d && d.displayedUpdate(this)
        this.owner.rendered && this.owner.render()
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
        return this.editable && this.owner.editable
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
    //>>>
  },
  methods: {
    //<<< mochai: methods
    /**
     * Initializes the model of the field after it has been installed on a block.
     * No-op by default.
     */
    initModel: eYo.doNothing,
    /**
     * Draws the border with the correct width.
     * Saves the computed width in a property.
     * @private
     */
    render_ () {
      if (!this.visible_) {
        this.size_.width = 0
        return
      }
      var d = this.drvr
      d && (d.textRemove(this), d.textCreate(this))
      this.updateWidth()
    },
    /**
     * Updates the width of the field in the UI.
     **/
    updateWidth () {
      var d = this.drvr
      d && (d.updateWidth(this))
    },
    /**
     * Validate the keyed data of the source brick.
     * Asks the data object to do so.
     * The bound data must exist.
     * @param {String} txt
     * @return {String}
     */
    validate (txt) {
      var v = this.data.validate(eYo.isDef(txt) ? txt : this.text)
      return eYo.isVALID(v) ? v : eYo.NA
    },
    /**
     * Will render the field.
     * We should call `this.willRender()` from the model.
     */
    willRender () {
      var d = this.drvr
      if (d) {
        d.makePlaceholder(this, this.isPlaceholder)
        d.makeComment(this, this.isComment)
      }
    },
    //>>>
  },
  //>>>
})

eYo.mixinFR(eYo.field.Dlgt_p, {
  //<<< mochai: Delegate
  /**
   * Various methods are translated.
   * @param{Object} model - the model
   */
  methodsMerge (model) {
    this.methodsMergeRender (model)
    return eYo.data.Dlgt[eYo.$SuperC9r_p].methodsMerge.call(this, model)
  },
  /**
   * Translate the `*Render` methods.
   * @param {*} model 
   */
  methodsMergeRender (model) {
    //<<< mochai: methodsMergeRender
    //... let mngr = eYo.drvr.newNS()
    //... let drvr = mngr.getDrvr('')
    //... setup({
    //...   properties: {
    //...     drvr
    //...   }
    //... })
    //... chai.expect(drvr).equalDrvr(onr.drvr)
    //... var ns, field
    //... let new_ns = () => {
    //...   flag.reset()
    //...   ns = eYo.field.newNS()
    //...   ns.makeBaseC9r()
    //... }
    //... mngr.newDrvrC9r('Field', {
    //...   properties: {
    //...     makePlaceholder (instance) {
    //...       flag.push(3)  
    //...     },
    //...     makeComment (instance) {
    //...       flag.push(4)  
    //...     },
    //...   }, 
    //... })
    let _p = this.C9r_p
    ;['willRender'].forEach(K => { // closure!
      //... ;['willRender'].forEach(K => {
      //...   new_ns()
      //...   let test = (expect, f) => {
      //...     field = ns.new({
      //...       methods: {
      //...         [K]: flag.decorate(1, f),
      //...       },
      //...     }, 'field', onr)
      //...     chai.expect(drvr).equalDrvr(field.drvr)
      //...     chai.expect(field[K]()).undefined
      //...     flag.expect(expect)
      //...   }
      let f_m = model[K]
      if (eYo.isF(f_m)) {
        let f_p = _p[K] || eYo.doNothing
        if (f_m.length > 0) {
          // builtin
          var m = {$ () {
            f_m.call(this, f_p.bind(this))
          }}
          //...   var f_m = function (builtin) {
          //...     flag.push(2)
          //...     builtin()
          //...   }
          //...   test(12, f_m) 
          //...   eYo.test.extend(ns.BaseC9r_p, K, function() {
          //...     flag.push(3)
          //...   })
          //...   test(123, f_m)
        } else {
          m = {$ () {
            //...   new_ns()
            //...   var f_m = function () {
            //...     flag.push(2)
            //...   }
            //...   test(12, f_m)
            //...   new_ns()
            //...   var f_m = function () {
            //...     flag.push(2)
            //...     this[K]()
            //...   }
            //...   test(12, f_m)
            //...   eYo.test.extend(ns.BaseC9r_p, K, function() {
            //...     flag.push(3)
            //...   })
            //...   test(123, f_m)
            let owned = eYo.objectHasOwnProperty(this, K) && this[K]
            try {
              this[K] = f_p
              f_m.call(this)
            } finally {
              if (owned) {
                this[K] = owned
              } else {
                delete this[K]
              }
            }
          }}
        }
        model[K] = m.$
      } else {
        f_m && eYo.throw(`Unexpected model (${this.name}/${K}) value validate -> ${f_m}`)
      }
      //... })
    })
    //>>>
  },
  //>>>
})

{
  let endEditing = { $ () {
    var data = this.data
    eYo.assert(data, `No data bound to field ${this.name}/${this.owner.type}`)
    var ans = this.validate(this.text)
    if (ans) {
      data.fromField(ans)
    } else {
      this.text = data.toText()
    }
  }}.$

  eYo.Field$.finalizeC9r([
    'order', // number,
    'value', // '(',
    'reserved', // : '.',
    'separator', // : true, or false
    'hidden', // : true,
    'variable', // : true, obsolete
    'validate', // : true,
    'edit', // : foo,
  ], eYo.model.manyDescriptorF(
    'didLoad', //  () => {},
    'willRender', //  () => {},
  ), {
    startEditing: {
      [eYo.model.VALIDATE] (before, p) { // eslint-disable-line
        return eYo.isF(before)
          ? before
          : before
            ? eYo.doNothing
            : eYo.INVALID
      },
    },
    endEditing: {
      [eYo.model.VALIDATE] (before, p) { // eslint-disable-line
        return eYo.isF(before)
          ? before
          : before
            ? endEditing
            : eYo.INVALID
      },
    },
  })
}

/**
 * Class for a non-editable field.
 * The only purpose is to start with a different height.
 * @param {eYo.brick|eYo.slot.BaseC9r} bsi The owner of the field.
 * @param {string} name The required name of the field
 * @param {string} text The initial content of the field.
 * @extends {eYo.field}
 * @constructor
 */
eYo.field.newC9r('Label', {
  properties: {
    isLabel: true
  },
})
eYo.field.Label$.finalizeC9r()

/**
 * Class for an editable code field.
 * @param {eYo.brick.BaseC9r|eYo.slot.BaseC9r} bs The owner of the field.
 * @param {string=} name
 * @param {string} text The initial content of the field.
 * @extends {eYo.field}
 * @constructor
 */
eYo.field.newC9r('Input', {
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
      if (this.owner) {
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
eYo.field.Input$.finalizeC9r()
