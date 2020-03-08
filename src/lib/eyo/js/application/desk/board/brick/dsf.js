/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Object with data, slots or fields.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * Ancestor of object owning data, slots and fields.
 * @name {eYo.dsf}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'dsf', {
  MODIFIER: 'modifier', // this MUST be in lower case
  PREFIX: 'prefix', // lowercase
  LABEL: 'label', // lowercase
  SEPARATOR: 'separator', // lowercase
  START: 'start', // lowercase
  OPERATOR: 'operator', // lowercase

  END: 'end', // lowercase
  SUFFIX: 'suffix', // lowercase
  COMMENT_MARK: 'comment_mark', // lowercase
  COMMENT: 'comment', // lowercase

})

/**
 * @name {eYo.dsf.Base}
 * @name {constructor}
 * @param{eYo.desk.Base | eYo.brick.Base} owner - A brick or a desk
 */
eYo.dsf.makeBase()

/**
 * Initialize an instance with given property models.
 * @param {Object} instance -  an instance of a subclass of the `C9r` of the receiver
 * @param {*} properties - a properties model
 * @param {Array<String>} keys_p - A list of keys
 */
eYo.dsf._p.prepareFields = function (object, fields, keys_f) {
  if (!fields) {
    return
  }
  this.modelExpand(fields, 'fields')
  let todo = Object.keys(fields)
  // head fields
  let head = []
  ;[
    eYo.dsf.MODIFIER,
    eYo.dsf.PREFIX,
    eYo.dsf.LABEL,
    eYo.dsf.START,
    eYo.dsf.SEPARATOR,
    eYo.dsf.OPERATOR
  ].forEach(k => {
    let i = todo.indexOf(k)
    if (k >= 0) {
      head.push(k)
      todo.splice(i, 1)
    }
  })
  let tail = []
  ;[
    eYo.dsf.END,
    eYo.dsf.SUFFIX,
    eYo.dsf.COMMENT_MARK,
    eYo.dsf.COMMENT
  ].forEach(k => {
    let i = todo.indexOf(k)
    if (k >= 0) {
      tail.push(k)
      todo.splice(i, 1)
    }
  })
  let middle = []
  let done = new Set()
  let again = []
  var more = false
  while(true) {
    var k
    if ((k = todo.pop())) {
      let model = fields[k]
      if (model.after) {
        if (eYo.isStr(model.after)) {
          if (!done.includes(model.after) && todo.includes(model.after)) {
            again.push(k)
            continue
          }
        } else if (model.after.some(k => (!done.includes(k) && todo.includes(k)))) {
          again.push(k)
          continue
        }
      }
      done.push(k)
      middle.push(k)
      more = true
    } else if (more) {
      more = false
      todo = again
      again = []
    } else {
      again.length && eYo.throw(`Cycling/Missing properties in ${object.eyo.name}: ${again}`)
      break
    }
  }
  keys_f.concat(...head, ...middle, ...tail)
}

/**
 * Prepares an instance with field.
 * @param {Object} object -  object is an instance of a subclass of the `C9r` of the receiver
 */
eYo.dsf.Dlgt_p.prepareFields = function (object) {
  if (!eYo.isDef(this.keys_f__)) {
    var ns = this.ns
    if (!ns || !ns.prepareFields) {
      ns = eYo.field
    }
    ns.prepareFields(object, this.fields, this.keys_f__ = [])
  }
  let fields = []
  let byKey = Object.create(null)
  this.keys_f__.forEach(k_f => {
    let k = k_f.substring(0, k_f.length-2)
    let f = eYo.field.new(object, k, this.fields[k])
    fields.push(f)
    Object.defineProperties(object, {
      [k_f]: eYo.descriptorR(function () {
        return f
      }),
    })
    object[k_f] || eYo.throw(`Missing field ${object.eyo.name}(${k})`)
  })
  var ff = object.fieldAtStart = fields.shift()
  for (let f in fields) {
    ff.nextField = f
    f.previousField = ff
    ff = f
  }
  object.toEndField = fields.pop() || object.fieldAtStart  
  object.fields = byKey
}

/**
 * Initialize the fields of the given instance.
 * @param {Object} object -  object is an instance of a subclass of the `C9r_` of the receiver
 */
eYo.dsf.Dlgt_p.initFields = function (object, ...$) {
  this.fieldForEach(object, f => {
    let init = object[f.name + 'FieldInit']
    init && init.call(object, f, ...$)
  })
}

/**
 * 
 * @param {eYo.brick|eYo.slot.Base}
 */
eYo.dsf.Dlgt_p.disposeFields = function(owner) {
  this.fieldForEach(object, f => f.dispose())
  ;(owner instanceof eYo.slot.Base) && (owner.bindField = eYo.NA)
  owner.fieldAtStart = owner.toEndField = owner.fields = eYo.NA
}

/**
 * Expens the fields section to the receiver.
 * @param{Object} fields - Fields model.
 */
eYo.dsf.Dlgt_p.fieldsMerge = function (fields) {
  this.keys_f__ = eYo.NA
  delete this.fields
  this.forEachSubC9r(C9r => C9r.eyo.fieldsMerge({})) // force to recalculate the `fields` list.
  ;(this.ns || eYo.model).modelExpand(fields, 'fields')
  this.fields__ || (this.fields__ = Object.create(null))
  for (let k in fields) {
    this.fields__[k] = fields[k]
  }
}

/**
 * Iterator over the properties.
 * @param {Object} object
 * @param {Object} [$this] - Optional this, cannot be a function
 * @param {Function} f
 */
eYo.dsf.Dlgt_p.fieldForEach = function (object, $this, f) {
  if (eYo.isF($this)) {
    [$this, f] = [f, $this]
  }
  this.keys_f__.forEach(k_f => f.call($this, object[k_f]))
}

/**
 * Iterator over the properties.
 * @param {Object} object
 * @param {Object} [$this] - Optional this, cannot be a function
 * @param {Function} f
 */
eYo.dsf.Dlgt_p.fieldSome = function (object, $this, f) {
  if (eYo.isF($this)) {
    [$this, f] = [f, $this]
  }
  return this.keys_f__.some(k_f => f.call($this, object[k_f]))
}

Object.defineProperties(eYo.dsf.Dlgt_p, {
  /**
   * this.fields__ merged with the prepared fields of super, if any.
   */
  fields: eYo.descriptorR(function () {
    this.fields__ || (this.fields__ = Object.create(null))
    let superFs = this.super && this.super.fields
    let Fs = superFs? eYo.provideR(this.fields__, superFs) : this.fields__
    Object.defineProperties(this, {
      properties: eYo.descriptorR(function () {
        return Fs
      }, true)
    })
    return Fs
  })
})
