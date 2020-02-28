/**
 * edython
 *
 * Copyright 2018 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Change manager.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name {eYo.change.Base}
 * @namespace
 */
eYo.o3d.makeNS('change')


/**
 * Decorate of change count hooks.
 * Returns a function with signature is `foo(whatever) → whatever`
 * `foo` is overriden by the model.
 * The model `foo` can call the builtin `foo` with `this.foo(...)`.
 * `do_it` receives all the parameters that the decorated function will receive.
 * If `do_it` return value is not an object, the change.count is not recorded
 * If `do_it` return value is an object with a `return` property,
 * the `change.count` is recorded such that `do_it` won't be executed
 * until the next `change.count` increment.
 * @param {String} key -
 * @param {Function} do_it  must return something.
 * @return {!Function}
 */
eYo.change._p.decorate = function (key, do_it) {
  eYo.isF(do_it) || eYo.throw('do_it MUST be a function')
  return function() {
    var c = this.change
    if (c.save_[key] === c.count) {
      return c.cache_[key]
    }
    var did_it = do_it.apply(this, arguments)
    if (eYo.isValid(did_it)) {
      c.save_[key] = c.count
      c.cache_[key] = did_it
    }
    return c.cache_[key]
  }
}

/**
 * @name {eYo.change.Base}
 * @constructor
 * @param{Object} owner
 */
eYo.change.makeBase('Change', {
  init () {
    this.reset()
  },
  properties: {
    /** the count is incremented each time a change occurs,
     * even when undoing.
     * Some lengthy actions may be shortened when the count
     * has not changed since the last time it was performed
     */
    count: 0,
    /** the step is the count, except that it is freezed
     * according to the owner property `changeStepFreezed`
     */
    step: 0,
    /** The level indicates cascading changes
     * Some actions that are performed when something changes
     * should not be performed while there is a pending change.
     * The level is incremented before the change and
     * decremented after the change (see `change.wrap`)
     * If we have
     * A change (level 1) => B change (level 2) => C change (level 3)
     * Such level aware actions are not performed when B and C
     * have changed because the level is positive (respectivelly 1 and 2), * a contrario they are performed when the A has changed because
     * the level is 0.
     */
    level: 0,
    cache: {
      value: Object.create(null)
    },
    save: {
      value: Object.create(null)
    },
  },
  methods: {
    /**
     * Reset the receiver.
     */
    reset () {
      this.count_ = this.step_ = this.level_ = 0
      // Some operations are performed only when there is a change
      // In order to decide whether to run or do nothing,
      // we have to store the last change count when the operation was
      // last performed. See `eYo.change.decorate` decorator.
      this.save_ = Object.create(null)
      // When these operations return values, they are cached below
      // until they are computed once again.
      this.cache_ = Object.create(null)
    },
    /**
     * Increment the level.
     */
    begin () {
      ++this.level_
      var O = this.owner_
      O.onChangeBegin && O.onChangeBegin(arguments)
    },
    /**
     * Ends a mutation.
     * When a change is complete at the top level,
     * the change count is incremented and the receiver
     * is consolidated.
     * This is the only place where consolidation should occur.
     * For edython.
     */
    end () {
      --this.level_
      var O = this.owner_
      O.onChangeEnd && O.onChangeEnd(arguments)
      if (this.level === 0) {
        this.done()
      }
    },
    /**
     * Increment the change count.
     * The change.count is used to compute some properties that depend
     * on the core state. Some changes induce a change in the change.count
     * which in turn may induce a change in properties.
     * Beware of the stability problem.
     * The change.count is incremented whenever a data changes,
     * a child brick changes or a connection changes.
     * This is used by the primary delegate's getType
     * to cache the return value.
     * For edython.
     */
    done () {
      ++ this.count_
      var O = this.owner_
      if (!O.changeStepFreeze) {
        this.step_ = this.count
      }
      O.onChangeDone && O.onChangeDone(arguments)
    },
    /**
     * Begin a mutation.
     * For edython.
     * @param {Function} do_it
     * @return {*} whatever `do_it` returns.
     */
    wrap (do_it) {
      if (eYo.isF(do_it)) {
        try {
          this.begin()
          return do_it()
        } finally {
          this.end()
        }
      }
    },
  },
})
