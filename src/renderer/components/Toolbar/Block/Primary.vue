<template>
  <b-btn-group id="block-primary" key-nav  aria-label="Block group primary">
    <dotted :eyo="eyo" :step="step" :slotholder="slotholder" :ismethod="isMethod"></dotted>
    <name :eyo="eyo" :step="step"></name>
    <variant :eyo="eyo" :step="step" :slotholder="slotholder" :ismethod="isMethod"></variant>
    <ry :eyo="eyo" :step="step" :ismethod="isMethod"></ry>
  </b-btn-group>
</template>

<script>
  import Dotted from './Primary/Dotted.vue'
  import Name from './Primary/Name.vue'
  import Variant from './Primary/Variant.vue'
  import Ry from './Primary/Ry.vue'

  export default {
    name: 'info-primary',
    data: function () {
      return {
        saved_step: undefined,
        isMethod_: false
      }
    },
    components: {
      Dotted,
      Name,
      Variant,
      Ry
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      step: {
        type: Number,
        default: 0
      },
      slotholder: {
        type: Function,
        default: function (item) {
          return item
        }
      }
    },
    computed: {
      isMethod () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.isMethod_
      }
    },
    created () {
      this.$$synchronize()
    },
    beforeUpdate () {
      (this.saved_step === this.step) || this.$$synchronize()
    },
    methods: {
      $$synchronize () {
        var eyo = this.eyo
        if (!eyo || (this.saved_step === this.step)) {
          return
        }
        this.saved_step = eyo.change.step
        var item = eyo.item_p
        this.isMethod_ = item && item.isMethod
      }
    }
  }
</script>
<style>
  .eyo-dd-content {
    padding: 0;
  }
</style>
