var eYoPlugin = {}

eYoPlugin.test = function () {
  console.error('TEST eYoPlugin')
}

eYoPlugin.install = function (Vue, options) {
  // // 1. add global method or property
  // Vue.myGlobalMethod = function () {
  //   // some logic ...
  //   console.log('THIS IS MY GLOBAL METHOD')
  // }

  // // 2. add a global asset
  // Vue.directive('my-directive', {
  //   bind (el, binding, vnode, oldVnode) {
  //     // some logic ...
  //     console.log('THIS IS MY DIRECTIVE')
  //   }
  // })

  // 3. inject some component options
  Vue.mixin({
    created () {
      this.$$synchronize(this.step)
    },
    beforeUpdate () {
      this.$$synchronize(this.step)
    }
  })

  /**
   * Trick to force synchronization of the various vues with the selectedbrick.
   * @param{!Number} step
   */
  Vue.prototype.$$synchronize = function (step) {
    var eyo = this.eyo
    if (!eyo || (this.saved_step === step)) {
      return
    }
    this.saved_step = step
    this.$$doSynchronize && this.$$doSynchronize(eyo)
  }

  /**
   * Get the top. We have `top < bottom`.
   * We count from top to bottom.
   */
  Vue.prototype.$$top = function () {
    var top = -Infinity
    if (this.$el) {
      var candidate = this.$el.offsetTop
      if (candidate > top) {
        top = candidate
      }
    }
    this.$children.forEach(el => {
      if (el.$$top) {
        var candidate = el.$$top()
        if (candidate > top) {
          top = candidate
        }
      } else {
        candidate = el.offsetTop
        if (candidate > top) {
          top = candidate
        }
      }
    })
    return top
  }

  /**
   * Get the bottom.
   */
  Vue.prototype.$$bottom = function () {
    var bottom = +Infinity
    if (this.$el) {
      var candidate = this.$el.offsetTop + this.$el.clientHeight
      if (candidate < bottom) {
        candidate = bottom
      }
    }
    this.$children.forEach(el => {
      if (el.$$bottom) {
        candidate = el.$$bottom()
        if (candidate < bottom) {
          bottom = candidate
        }
      } else {
        candidate = el.offsetTop + el.clientHeight
        if (candidate < bottom) {
          bottom = candidate
        }
      }
    })
    return bottom
  }
  /**
   * Ensure that there is only one callback for this event, for this component only.
   * @param {String} event
   * @param {Function} callback
   */
  Vue.prototype.$$onOnly = function (event, callback) {
    var callbacks = this.callbacks || (this.callbacks = {})
    var previous = callbacks[event]
    if (previous) {
      this.$root.$off(event, previous)
    }
    callbacks[event] = callback
    this.$root.$on(event, callback)
  }
  /**
   * Ensure that there is only one callback for this event, for this component only.
   */
  Object.defineProperties(eYo.Key, {
    MAIN: {
      get: () => 'MAIN'
    },
    BRICK: {
      get: () => 'BRICK'
    },
    STRING3: {
      get: () => 'STRING3'
    }
  })
}
export default eYoPlugin
