<template>
  <b-dropdown id="block-builtin" class="item text" v-if="values && values.length" variant="outline-secondary">
    <template slot="button-content"><span class="block-value eyo-code-reserved eyo-content" v-html="value"></span></template>
    <b-dropdown-item-button v-for="item in values" v-on:click="value = item" :key="item" class="block-value eyo-code-reserved" v-html="item"></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-value',
    data () {
      return {
        saved_step: undefined,
        value_: undefined
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      step: {
        type: Number,
        default: 0
      }
    },
    computed: {
      value: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.value_
        },
        set (newValue) {
          this.eyo.value_p = newValue
        }
      },
      values () {
        return this.eyo.value_d.getAll()
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
        if (!this.eyo || (this.saved_step === this.step)) {
          return
        }
        this.saved_step = this.step
        this.value_ = this.eyo.value_p
      }
    }
  }
</script>
<style>
</style>
  
