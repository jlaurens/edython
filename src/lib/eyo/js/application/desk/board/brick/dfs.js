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
eYo.dfs._p.dataPrepare = function (object, models, keys_p) {
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
  keys_p.concat(...head, ...middle, ...tail)
}

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


