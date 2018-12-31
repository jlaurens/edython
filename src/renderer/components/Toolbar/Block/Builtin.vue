<template>
  <b-dd id="block-builtin" class="item text" v-if="values && values.length" variant="outline-secondary">
    <template slot="button-content"><span class="block-value eyo-code-reserved eyo-content" v-html="value"></span></template>
    <b-dd-item-button v-for="item in values" v-on:click="value = item" :key="item" class="block-value eyo-code-reserved" v-html="item"></b-dd-item-button>
  </b-dd>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  export default {
    name: 'info-value',
    data () {
      return {
        saved_step: undefined,
        value_: undefined
      }
    },
    computed: {
      ...mapState('Selected', [
        'step'
      ]),
      ...mapGetters('Selected', [
        'eyo'
      ]),
      value: {
        get () {
          this.$$synchronize(this.step)
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
    methods: {
      $$doSynchronize (eyo) {
        this.value_ = eyo.value_p
      }
    }
  }
</script>
<style>
</style>
  
