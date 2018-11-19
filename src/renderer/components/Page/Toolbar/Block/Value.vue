<template>
  <b-dropdown :id="id" class="eyo-dropdown" v-if="values && values.length" variant="outline-secondary">
    <template slot="button-content"><span class="info-value eyo-code eyo-content" v-html="formatter(value)"></span></template>
    <b-dropdown-item-button v-for="item in values" v-on:click="value = item" :key="item" class="info-value eyo-code" v-html="formatter(item)"></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-value',
    data: function () {
      return {
        step_: undefined,
        value_: undefined
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      formatter: {
        type: Function,
        default: function (item) {
          return item && item.length ? this.$t('message.' + ({'*': 'star', '**': 'two_stars'}[item] || item)) : '&nbsp;'
        }
      }
    },
    computed: {
      id () {
        return 'info-value'
      },
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
        return this.eyo.value_d.getAll()
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
  .info-value {
    padding-right:0.75rem;
  }
</style>
  