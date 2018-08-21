<template>
  <b-dropdown :id="id" class="eyo-dropdown" v-if="values && values.length">
    <template slot="button-content"><span class="info-value eyo-code eyo-content" v-html="formatter(value)"></span></template>
    <b-dropdown-item-button v-for="item in values" v-on:click="value = item" :key="item" class="info-value eyo-code" v-html="formatter(item)"></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-value',
    props: {
      selectedBlock: {
        type: Object,
        default: undefined
      },
      formatter: {
        type: Function,
        default: function (item) {
          return item && item.length ? this.$t('message.' + ({'*': 'star', '**': 'two_stars'}[item] || item)) : '&nbsp;'
        }
      },
      dataKey: {
        type: String,
        default: 'value'
      }
    },
    computed: {
      id () {
        return 'info-' + this.dataKey
      },
      data () {
        var block = this.selectedBlock
        return block && block.eyo.data[this.dataKey]
      },
      value: {
        get () {
          return this.data
            ? this.data.get()
            : this.dataKey.charAt(0).toUpperCase() + this.dataKey.slice(1)
        },
        set (newValue) {
          this.data && this.data.set(newValue)
        }
      },
      values () {
        return this.data && this.data.model.all
      }
    }
  }
</script>
<style>
  .info-value {
    padding-right:0.75rem;
  }
</style>
  