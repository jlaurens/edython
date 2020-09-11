/**
 * edython
 *
 * Copyright 2020 Jérôme LAURENS.
 *
 * @license EUPL-1.2
 */
/**
 * @fileoverview Change manager.
 * @author jerome.laurens@u-bourgogne.fr (Jérôme LAURENS)
 */
'use strict'

/**
 * @name {eYo.changer}
 * @namespace
 */
eYo.o4t.newNS(eYo, 'changer')
//<<< mochai: Basics
//... chai.assert(eYo.changer)
//>>>


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
 * @param {Function} do_it - must return something, @this is the owner.
 * @return {Function}
 */
eYo.changer._p.memoize = function (key, do_it) {
  //<<< mochai: memoize
  eYo.isF(do_it) || eYo.throw(`do_it MUST be a function, got: ${do_it}`)
  return function(...$) {
    var c = this.changer
    if (c.save_.get(key) === c.count) {
      return c.cache_.get(key)
    }
    var did_it = do_it.call(this.owner_, ...$)
    if (eYo.isVALID(did_it)) {
      c.save_.set(key, c.count)
      c.cache_.set(key, did_it)
    }
    return c.cache_.get(key)
  }
  //... onr.changer = eYo.changer.new('c', onr)
  //... onr.foo = eYo.changer.memoize('foo', (what) => {
  //...   eYo.flag.push(what)
  //...   return what
  //... })
  //... onr.bar = eYo.changer.memoize('bar', (what) => {
  //...   eYo.flag.push(what)
  //...   return 2 * what
  //... })
  //... chai.expect(onr.foo(421)).equal(421)
  //... eYo.flag.expect(421)
  //... chai.expect(onr.bar(421)).equal(842)
  //... eYo.flag.expect(421)
  //... // Values are cached
  //... chai.expect(onr.foo(421)).equal(421)
  //... eYo.flag.expect()
  //... chai.expect(onr.bar(421)).equal(842)
  //... eYo.flag.expect()
  //... // Cached values are no longer
  //... onr.changer.wrap(() => {
  //...   eYo.flag.push(123)
  //... })
  //... eYo.flag.expect(123)
  //... chai.expect(onr.foo(421)).equal(421)
  //... eYo.flag.expect(421)
  //... chai.expect(onr.bar(421)).equal(842)
  //... eYo.flag.expect(421)
  //... // Values are cached
  //... chai.expect(onr.foo(421)).equal(421)
  //... eYo.flag.expect()
  //... chai.expect(onr.bar(421)).equal(842)
  //... eYo.flag.expect()
  //>>>
}

/**
 * @name {eYo.changer.C9rBase}
 * @constructor
 * @param{Object} owner
 */
eYo.changer.makeC9rBase({
//<<< mochai: eYo.changer.C9rBase
  //<<< mochai: Basics
  //... chai.assert(eYo.changer.C9rBase)
  //... chai.expect(eYo.changer.C9rBase).equal(eYo.Changer)
  //>>>
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
     * decremented after the change (see `changer.wrap`)
     * If we have
     * A change (level 1) => B change (level 2) => C change (level 3)
     * Such level aware actions are not performed when B and C
     * have changed because the level is positive (respectivelly 1 and 2), * a contrario they are performed when the A has changed because
     * the level is 0.
     */
    level: 0,
    cache: new Map(),
    save: new Map(),
    listeners: [],
  },
  methods: {
    //<<< mochai: (add|remove)ChangeDoneListener
    //... let changer = eYo.changer.new('foo', onr)
    addChangeDoneListener (do_it) {
      this.listeners.push(do_it)
      return do_it
      //... let listener = changer.addChangeDoneListener(() => {
      //...   eYo.flag.push(1)
      //... })
      //... changer.done()
      //... eYo.flag.expect(1)
    },
    removeChangeDoneListener (listener) {
      //... changer.removeChangeDoneListener(listener)
      //... changer.done()
      //... eYo.flag.expect()
      return eYo.do.arrayRemove(this.listeners, listener)
    },
    //>>>
    /**
     * Reset the receiver.
     */
    reset () {
      this.count_ = this.step_ = this.level_ = 0
      // Some operations are performed only when there is a change
      // In order to decide whether to run or do nothing,
      // we have to store the last change count when the operation was
      // last performed. See `eYo.changer.memoize` decorator.
      this.save_.clear()
      // When these operations return values, they are cached below
      // until they are computed once again.
      this.cache_.clear()
    },
    /**
     * Increment the level.
     */
    begin () {
      //<<< mochai: begin
      ++this.level_
      let o = this.owner_
      o.onChangeBegin && o.onChangeBegin()
      //... let onr = eYo.c3s.new({
      //...   methods: {
      //...     onChangeBegin () {
      //...       eYo.flag.push(1)
      //...     },
      //...   },
      //... })
      //... let changer = eYo.changer.new('foo', onr)
      //... changer.begin()
      //... eYo.flag.expect(1)
      //>>>
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
      //<<< mochai: end
      //... let onr = eYo.c3s.new({
      //...   methods: {
      //...     onChangeEnd () {
      //...       eYo.flag.push(2)
      //...     },
      //...   },
      //... })
      //... let changer = eYo.changer.new('foo', onr)
      //... changer.end()
      //... eYo.flag.expect(2)
      --this.level_
      let o = this.owner_
      o.onChangeEnd && o.onChangeEnd()
      if (this.level === 0) {
        this.done()
      }
      //>>>
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
      //<<< mochai: done
      //... let onr = eYo.c3s.new({
      //...   methods: {
      //...     onChangeDone () {
      //...       eYo.flag.push(3)
      //...     },
      //...   },
      //... })
      //... let changer = eYo.changer.new('foo', onr)
      //... changer.done()
      //... eYo.flag.expect(3)
      ++ this.count_
      let o = this.owner_
      if (!o.changeStepFreeze) {
        this.step_ = this.count
      }
      o.onChangeDone && o.onChangeDone(arguments)
      this.listeners_.forEach(l => l(this.count))
      //>>>
    },
    /**
     * Wraps a mutation.
     * For edython.
     * @param {*} [$this] - Optional `this` parameter
     * @param {Function} do_it - Function.
     * @param  {...any} $ - arguments of `do_it`.
     * @return {*} whatever `do_it` returns.
     */
    wrap ($this, do_it, ...$) {
      //<<< mochai: wrap+begin/end/done
      //... let onr = eYo.c3s.new({
      //...   methods: {
      //...     onChangeBegin () {
      //...       eYo.flag.push(1)
      //...     },
      //...     onChangeEnd () {
      //...       eYo.flag.push(2)
      //...     },
      //...     onChangeDone () {
      //...       eYo.flag.push(3)
      //...     },
      //...   },
      //... })
      //... let changer = eYo.changer.new('foo', onr)
      //... changer.begin()
      //... eYo.flag.expect(1)
      //... changer.end()
      //... eYo.flag.expect(23)
      //... changer.begin()
      //... changer.begin()
      //... eYo.flag.expect(11)
      //... changer.end()
      //... eYo.flag.expect(2)
      //... changer.end()
      //... eYo.flag.expect(23)
      //... changer.wrap(() => {
      //...   eYo.flag.push(9)
      //... })
      //... eYo.flag.expect(1923)
      //... changer.wrap(() => {
      //...   changer.wrap(() => {
      //...     eYo.flag.push(9)
      //...   })
      //... })
      //... eYo.flag.expect(119223)
      if (eYo.isF($this)) {
        try {
          this.begin()
          return $this(do_it, ...$)
        } finally {
          this.end()
        }
      } else if (eYo.isF(do_it)) {
        try {
          this.begin()
          return do_it.call($this, ...$)
        } finally {
          this.end()
        }
      } 
      //>>>
    },
  },
  //>>>
})
