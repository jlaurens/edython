<template>
  <b-dd :id="child_id" class="item text" v-if="values && values.length" variant="outline-secondary">
    <template slot="button-content"><span class="block-value eyo-code eyo-content" v-html="formatter(value)"></span></template>
    <b-dd-item-button v-for="item in values" v-on:click="value = item" :key="item" class="block-value eyo-code" v-html="formatter(item)"></b-dd-item-button>
  </b-dd>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  export default {
    name: 'info-value',
    data: function () {
      return {
        saved_step: undefined,
        value_: undefined
      }
    },
    props: {
      child_id: {
        type: String,
        default: 'Block-value'
      },
      formatter: {
        type: Function,
        default: function (item) {
          return item && item.length
            ? this.$$t(`block.${({
              '*': 'star',
              '**': 'two_stars',
              '.': 'dot',
              '..': 'two_dots'
            }[item] || item)}`) || item
            : '&nbsp;'
        }
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
        this.$$synchronize(this.step)
        return (this.eyo.value_d && this.eyo.value_d.getAll()) || []
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
  .info-value {
    padding-right:0.75rem;
  }
</style>
  
