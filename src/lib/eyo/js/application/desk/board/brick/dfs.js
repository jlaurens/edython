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
 * @name {eYo.dfs}
 * @namespace
 */
eYo.o3d.makeNS(eYo, 'dfs', {
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
 * @name {eYo.dfs.Base}
 * @name {constructor}
 * @param{eYo.desk.Base | eYo.brick.Base} owner - A brick or a desk
 */
eYo.dfs.makeBase()

// ANCHOR Data management

/**
 * Initialize an instance with given data models.
 * @param {Object} instance -  an instance of a subclass of the `C9r` of the receiver
 * @param {*} properties - a properties model
 * @param {Array<String>} keys_p - A list of keys
 */
eYo.dfs._p.dataPrepare = function (object, models, keys_d) {
  if (!models) {
    return
  }
  this.modelExpand(models, 'data')
  let head = []
  let tail = []
  let todo = []
  for (let [k, model] of Object.entries(models)) {
    if (model) {
      if (model.order >= 0) {
        head.push(k)
      } else if (model.order < 0) {
        tail.push(k)
      } else {
        todo.push(k)
      }
    }
  }
  let sorter = (a,b) => models[a].order < models[b].order
  head.sort(sorter)
  tail.sort(sorter)
  let middle = []
  let done = new Set()
  var again = []
  var more = false
  while(true) {
    var k
    if ((k = todo.pop())) {
      let model = models[k]
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
  keys_d.concat(...head, ...middle, ...tail)
}

/**
 * Prepares an instance with field.
 * @param {Object} object -  object is an instance of a subclass of the `C9r` of the receiver
 */
;[
  ['dataPrepare', 'data', 'keys_d__', eYo.data, 'dataHead', 'dataTail'],
  ['slotPrepare', 'slots', 'keys_s__', eYo.slot, 'slotHead', 'slotTail'],
  ['fieldPrepare', 'fields', 'keys_f__', eYo.field, 'fieldHead', 'fieldTail'],
].forEach(ks => {
  eYo.dfs.Dlgt_p[ks[0]] = function (object) {
    let models = this[ks[1] /* models */]
    if (!eYo.isDef(this[ks[2] /* keys_?_ */])) {
      var ns = this.ns
      if (!ns || !ns[ks[0]]) {
        ns = eYo.dfs
      }
      ns[ks[0]](object, models, this[ks[2] /* keys_?_ */] = [])
    }
    let values = []
    let byKey = Object.create(null)
    this[ks[2] /* keys_?_ */].forEach(k_dsf => {
      let k = k_dsf.substring(0, k_dsf.length-2)
      let d = byKey[k] = ks[3 /* eYo.ns */].new(object, k, models[k])
      values.push(d)
      Object.defineProperties(object, {
        [k_dsf]: eYo.descriptorR(function () {
          return d
        }),
      })
      object[k_dsf] || eYo.throw(`Missing field ${object.eyo.name}(${k})`)
    })
    var dd = object[ks[4]/* head */] = values.shift()
    for (let d in values) {
      dd.next = d
      d.previous = dd
      dd = d
    }
    object[ks[5]/* tail */] = values.pop() || object[ks[4]/* head */] 
    object[ks[1]] = byKey
  }  
})

/**
 * Initialize the data of the given instance.
 * @name{eYo.dfs.Dlgt.dataInit}
 * @param {Object} object -  object is an instance of a subclass of the `C9r_` of the receiver
 */
/**
 * Initialize the fields of the given instance.
 * @name{eYo.dfs.Dlgt.fieldInit}
 * @param {Object} object -  object is an instance of a subclass of the `C9r_` of the receiver
 */
/**
 * Initialize the slots of the given instance.
 * @name{eYo.dfs.Dlgt.slotInit}
 * @param {Object} object -  object is an instance of a subclass of the `C9r_` of the receiver
 */
;[
  ['dataInit', 'dataForEach', 'DataInit'],
  ['slotInit', 'slotForEach', 'SlotInit',],
  ['fieldInit', 'fieldForEach', 'FieldInit'],
].forEach(ks => {
  eYo.dfs.Dlgt_p[ks[0]] = function (object, ...$) {
    this[ks[1]](object, x => {
      let init = object[x.key + ks[2]]
      init && init.call(object, x, ...$)
    })
  }
})

/**
 * 
 * @param {eYo.brick|eYo.slot.Base}
 */
;['data', 'slot', 'field'].forEach(k => {
  eYo.dfs.Dlgt_p[k + 'Dispose'] = function(owner) {
    this[k + 'ForEach'](object, x => {
      let dispose = object[x.key + eYo.do.toTitleCase(k) + 'Dispose']
      dispose && dispose.call(object, x, ...$)
      x.dispose()
    })
    owner.bindField = owner[k+'Head'] = owner[k+'Tail'] = owner[k+'ByKey'] = eYo.NA
  }
})

// ANCHOR Fields management

/**
 * Initialize an instance with given property models.
 * @param {Object} instance -  an instance of a subclass of the `C9r` of the receiver
 * @param {*} properties - a properties model
 * @param {Array<String>} keys_p - A list of keys
 */
eYo.dfs._p.fieldPrepare = function (object, fields, keys_f) {
  if (!fields) {
    return
  }
  this.modelExpand(fields, 'fields')
  let todo = Object.keys(fields)
  // head fields
  let head = []
  ;[
    eYo.dfs.MODIFIER,
    eYo.dfs.PREFIX,
    eYo.dfs.LABEL,
    eYo.dfs.START,
    eYo.dfs.SEPARATOR,
    eYo.dfs.OPERATOR
  ].forEach(k => {
    let i = todo.indexOf(k)
    if (k >= 0) {
      head.push(k)
      todo.splice(i, 1)
    }
  })
  let tail = []
  ;[
    eYo.dfs.END,
    eYo.dfs.SUFFIX,
    eYo.dfs.COMMENT_MARK,
    eYo.dfs.COMMENT
  ].forEach(k => {
    let i = todo.indexOf(k)
    if (k >= 0) {
      tail.push(k)
      todo.splice(i, 1)
    }
  })
  let middle = []
  let done = new Set()
  var again = []
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
 * 
 * @param {eYo.brick|eYo.slot.Base}
 */
eYo.dfs.Dlgt_p.disposeFields = function(owner) {
  this.fieldForEach(object, f => f.dispose())
  ;(owner instanceof eYo.slot.Base) && (owner.bindField = eYo.NA)
  owner.fieldAtStart = owner.toEndField = owner.fields = eYo.NA
}

/**
 * Expands the fields section to the receiver.
 * @param{Object} fields - Fields model.
 */
eYo.dfs.Dlgt_p.fieldsMerge = function (fields) {
  this.keys_f__ = eYo.NA
  delete this.fields
  this.forEachSubC9r(C9r => C9r.eyo.fieldsMerge({})) // force to recalculate the `fields` list.
  ;(this.ns || eYo.model).modelExpand(fields, 'fields')
  this.fields__ || (this.fields__ = Object.create(null))
  for (let k in fields) {
    this.fields__[k] = fields[k]
  }
}

// ANCHOR Iterators
/**
 * Iterator over the data.
 * @name {eYo.dfs.Dlgt.dataForEach}
 * @param {Object} object
 * @param {Object} [$this] - Optional this, cannot be a function
 * @param {Function} f
 */
/**
 * Iterator over the fields.
 * @name {eYo.dfs.Dlgt.fieldForEach}
 * @param {Object} object
 * @param {Object} [$this] - Optional this, cannot be a function
 * @param {Function} f
 */
/**
 * Iterator over the slots.
 * @name {eYo.dfs.Dlgt.slotForEach}
 * @param {Object} object
 * @param {Object} [$this] - Optional this, cannot be a function
 * @param {Function} f
 */
/**
 * Iterator over the data.
 * @name {eYo.dfs.Dlgt.dataSome}
 * @param {Object} object
 * @param {Object} [$this] - Optional this, cannot be a function
 * @param {Function} f
 */
/**
 * Iterator over the fields.
 * @name {eYo.dfs.Dlgt.fieldSome}
 * @param {Object} object
 * @param {Object} [$this] - Optional this, cannot be a function
 * @param {Function} f
 */
/**
 * Iterator over the slots.
 * @name {eYo.dfs.Dlgt.slotSome}
 * @param {Object} object
 * @param {Object} [$this] - Optional this, cannot be a function
 * @param {Function} f
 */
;[
  ['keys_d__', 'dataForEach', 'dataSome', 'data', 'data__'],
  ['keys_f__', 'fieldForEach', 'fieldSome', 'fields', 'fields__'],
  ['keys_s__', 'slotForEach', 'slotSome', 'slots', 'slots__'],
].forEach (ks => {
  eYo.dfs.Dlgt_p[ks[1]] = function (object, $this, f) {
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    this[ks[0]].forEach(k => f.call($this, object[k]))
  }
  eYo.dfs.Dlgt_p[ks[2]] = function (object, $this, f) {
    if (eYo.isF($this)) {
      [$this, f] = [f, $this]
    }
    return this[ks[0]].some(k => f.call($this, object[k]))
  }
  Object.defineProperties(eYo.dfs.Dlgt_p, {
    /**
     * this.fields__ merged with the prepared fields of super, if any.
     */
    [ks[3]]: eYo.descriptorR(function () {
      this[ks[4]] || (this[ks[4]] = Object.create(null))
      let superFs = this.super && this.super[ks[3]]
      let Fs = superFs? eYo.provideR(this[ks[4]], superFs) : this[ks[4]]
      Object.defineProperties(this, {
        properties: eYo.descriptorR(function () {
          return Fs
        }, true)
      })
      return Fs
    })
  })
})


