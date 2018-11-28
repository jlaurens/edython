<template>
  <b-dropdown :id="child_id" class="item text" v-if="values && values.length" variant="outline-secondary">
    <template slot="button-content"><span class="block-value eyo-code eyo-content" v-html="formatter(value)"></span></template>
    <b-dropdown-item-button v-for="item in values" v-on:click="value = item" :key="item" class="block-value eyo-code" v-html="formatter(item)"></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
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
      eyo: {
        type: Object,
        default: undefined
      },
      step: {
        type: Number,
        default: 0
      },
      formatter: {
        type: Function,
        default: function (item) {
          return item && item.length ? this.$t('message.' + ({'*': 'star', '**': 'two_stars'}[item] || item)) : '&nbsp;'
        }
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
        (this.saved_step === this.step) || this.$$synchronize()
        return (this.eyo.value_d && this.eyo.value_d.getAll()) || []
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
  .info-value {
    padding-right:0.75rem;
  }
</style>
  
