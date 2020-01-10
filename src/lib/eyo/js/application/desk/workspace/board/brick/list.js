/**
 * edython
 *
 * Copyright 2019 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview List of bricks.
 * @author jerome.laurens@u-bourgogne.fr
 */
'use strict'

eYo.require('c9r.owned')

eYo.forwardDeclare('brick')
eYo.forwardDeclare('dB')

goog.forwardDeclare('goog.array')

/**
 * Class for a brick list.
 * Any number of brick lists can be created.
 * This list is kept ordered according to brick's vertical position.
 * The main board, the draft board, the flyout board and the drag board
 * both own exactly one such list.
 * The main board, the draft board and the drag should share the same database.
 * @param{?eYo.DB} db
 * @constructor
 */
eYo.makeClass('list', eYo.c9r.Owned, {
  /**
   * Clear the list and sever all the links.
   */
  dispose () {
    this.clear()
  },
  valued: {
    /**
     * The top bricks are all the bricks with no parent.
     * They are owned by a board.
     * They are ordered by line number.
     * @type {!Array<!eYo.Brick>}
     * @private
     */
    bricks: {
      init () {
        return []
      },
      /**
       * Returns the list of bricks as an array
       * of bricks sorted by position; top to bottom.
       * @return {!Array<!eYo.Brick>} The top-level brick objects.
       */
      get () {
        return this.bricks_.slice()
      }
    },
  },
  owned: {
    db () {
      return this.owner__.listDB
    }
  },
  computed: {
    /**
     * Get all the bricks in list, top ones and their children.
     * No particular order.
     * @return {!Array<!eYo.Brick>} Array of bricks.
     */
    all () {
      var bricks = this.bricks
      for (var i = 0; i < bricks.length; i++) {
        bricks.push.apply(bricks, bricks[i].children)
      }
      return bricks
    },
  }
})

/**
 * Release all the bricks in the list.
 */
eYo.List_p.clear = function() {
  this.bricks_.forEach(b3k => {
    this.db.remove(b3k.id)
  })
  this.bricks_.length = 0
}

/**
 * Find the brick on this list with the specified ID.
 * Wrapped bricks have a complex id.
 * @param {string} id ID of brick to find.
 * @return {eYo.Brick.Dflt} The sought after brick or null if not found.
 */
eYo.List_p.getBrickById = function(id) {
  var b3k = this.db.byId(id)
  if (b3k) {
    return b3k
  }
  var m = XRegExp.exec(id, eYo.xre.id_wrapped)
  if (m && (b3k = this.db.byId(m.id))) {
    return b3k.slotSomeMagnet(m4t => {
      var b3k = m4t.targetBrick
      if (b3k && b3k.id === id) {
        return b3k
      }
    })
  }
}

/**
 * Add a brick to the list.
 * Update the line number of all the list blocks
 * accordingly.
 * 
 * About `id` management.
 * If `opt_id` is provided and is not the id
 * of an already existing brick, then it will be the `id` of the added brick once added.
 * If the `opt_id` is already used or is not provided, then a new id is created.
 * @param {eYo.Brick.Dflt} brick
 * @param {string} opt_id
 */
eYo.List_p.add = function (brick, opt_id) {
  var i = 0
  var b_min = this.bricks_[i]
  if (b_min && brick.where.l > b_min.where.l) {
    var i_max = this.bricks_.length - 1
    while (i < i_max) {
      const j = Math.floor((i + i_max) / 2)
      const d_l = brick.where.l - this.bricks_[j].where.l
      if (d_l < 0) {
        i_max = j
      } else {
        i = j
        if (d_l == 0) {
          break
        }
      }
    }
  }
  this.bricks_.splice(i, 0, b)
  var l = b.where.l
  var bb
  while ((bb = this.bricks_[++i])) {
    l += b.span.l + 2
    if (bb.where.l < l) {
      (b = bb).ui.xy_.l = l
    } else {
      break
    }
  }
  brick.id = (opt_id && !this.getBrickById(opt_id))
  ? opt_id : eYo.do.genUid()
  this.db.add(brick)
}

/**
 * Remove a brick from the receiver.
 * Throws if the brick is not in the list.
 * @param {eYo.Brick.Dflt} brick
 */
eYo.List_p.remove = function (brick) {
  if (!goog.array.remove(this.bricks_, brick)) {
    throw 'Brick not present in list.'
  }
  // Remove from list
  this.db.remove(brick)
}
;(() => {
  var forEachMake = (test) => {
    return function (f, deep=false) {
      var bricks = this.bricks_
      i = 0
      const stack = []
      while (true) {
        if (i < bricks.length) {
          var b3k = bricks[i]
          test(f) && f(b3k)
          if (deep && b3k.children.length) {
            stack.push(i)
            i = 0
            stack.push(bricks)
            bricks = b3k.children
          } else {
            ++i
          }
          continue
        } else if (bricks = stack.pop()) {
          i = stack.pop() + 1
          continue
        }
        break
      }
    }
  }
  /**
   * Performs a function on each brick.
   * Children are looked after too.
   * @param {function} f -  (element)=>None: {}
   */
  eYo.List_p.forEach = forEachMake(b3k=>true)
  /**
   * Performs a function on each expression brick
   * until one is found for which the answer is a truthy value.
   * Children are looked after too in a deep first traversal.
   * @param {function} f -  (element)=>None: {}
   */
  eYo.List_p.forEachExpr = forEachMake(b3k=>b3k.isExpr)
  /**
   * Performs a function on each statement brick
   * until one is found for which the answer is a truthy value.
   * Children are looked after too in a deep first traversal.
   * @param {function} f -  (element)=>None: {}
   */
  eYo.List_p.stmtForEach = forEachMake(b3k=>b3k.isStmt)
}) ()

;(() => {
  var someMake = (test) => {
    return function (f, deep=false) {
      var bricks = this.bricks_
      i = 0
      const stack = []
      while (true) {
        if (i < bricks.length) {
          var b3k = bricks[i]
          if (test(f) && f(b3k)) {
            return
          }
          if (deep && b3k.children.length) {
            stack.push(i)
            i = 0
            stack.push(bricks)
            bricks = b3k.children
          } else {
            ++i
          }
          continue
        } else if (bricks = stack.pop()) {
          i = stack.pop() + 1
          continue
        }
        break
      }
    }
  }
  /**
   * Performs a function on each brick until one is found for which the answer is a truthy value.
   * Children are looked after too.
   * @param {function} f -  (element)=>Boolean: {}
   * @param {Boolean} deep -  deep first traversal when true, flat traversal otherwise
   */
  eYo.List_p.some = someMake(b3k=>true)
  /**
   * Performs a function on each expression brick
   * until one is found for which the answer is a truthy value.
   * Children are looked after too.
   * @param {function} f -  (element)=>Boolean: {}
   */
  eYo.List_p.someExpr = someMake(b3k=>b3k.isExpr)
  /**
   * Performs a function on each statement brick
   * until one is found for which the answer is a truthy value.
   * Children are looked after too.
   * @param {function} f -  (element)=>Boolean: {}
   * @param {Boolean} deep -  deep first traversal when true, flat traversal otherwise
   */
  eYo.List_p.someStmt = someMake(b3k=>b3k.isStmt)
}) ()
