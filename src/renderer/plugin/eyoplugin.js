var eYoPlugin = {}

eYoPlugin.test = function () {
  console.error('TEST eYoPlugin')
}

eYoPlugin.install = function (Vue, options) {
  console.error('INSTALLING eYoPlugin')
  // 1. add global method or property
  Vue.myGlobalMethod = function () {
    // some logic ...
    console.log('THIS IS MY GLOBAL METHOD')
  }

  // 2. add a global asset
  Vue.directive('my-directive', {
    bind (el, binding, vnode, oldVnode) {
      // some logic ...
      console.log('THIS IS MY DIRECTIVE')
    }
  })

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
   * Trick to force synchronization of the various vues with the selected block.
   * @param{!Number} step
   */
  Vue.prototype.$$synchronize = function (step) {
    var eyo = this.eyo
    if (!eyo || (this.saved_step === step)) {
      return
    }
    this.saved_step = step
    this.$$doSynchronize(eyo)
  }
}
export default eYoPlugin
