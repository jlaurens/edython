<template>
  <b-dropdown id="block-builtin" class="eyo-dropdown" v-if="values && values.length" variant="outline-secondary">
    <template slot="button-content"><span class="block-value eyo-code-reserved eyo-content" v-html="value"></span></template>
    <b-dropdown-item-button v-for="item in values" v-on:click="value = item" :key="item" class="block-value eyo-code-reserved" v-html="item"></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-value',
    data () {
      return {
        step_: undefined,
        value_: undefined
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      value: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
          return this.value_
        },
        set (newValue) {
          this.eyo.value_p = newValue
        }
      },
      values () {
        return this.eyo.data.value.model.all
      }
    },
    created () {
      this.synchronize()
    },
    updated () {
      this.synchronize()
    },
    methods: {
      synchronize () {
        this.step_ = this.eyo.change.step
        this.value_ = this.eyo.value_p
      }
    }
  }
</script>
<style>
  #block-builtin {
    padding-left:0.25rem;
  }
</style>
  