<template>
  <b-dropdown id="info-variant" class="eyo-dropdown" variant="outline-secondary" v-if="data">
    <template slot="button-content"><span class="info-variant eyo-code eyo-content" v-html="formatter(variant)"></span></template>
    <b-dropdown-item-button v-for="item in variants" v-on:click="variant = item" :key="item" class="info-variant eyo-code" v-html="formatter(item)"></b-dropdown-item-button>
    </b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-variant',
    data () {
      return {
        variant_: undefined
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      slotholder: {
        type: Function,
        default: function (item) {
          return item
        }
      },
      formatter: {
        type: Function,
        default: function (item) {
          var formatted = item.length ? this.$t('message.' + ({'*': 'star', '**': 'two_stars', '.': 'dot', '..': 'two_dots'}[item] || item)) : '&nbsp;'
          if (formatted.indexOf('{{slotholder}}') < 0) {
            return formatted
          }
          var replacement = '</span>' +
            this.slotholder('eyo-info-primary-variant1') +
            '<span class="eyo-info-primary-variant2">'
          return '<span class="eyo-info-primary-variant2">' +
            formatted.replace('{{slotholder}}', replacement) +
            '</span>'
        }
      },
      dataKey: {
        type: String,
        default: 'variant'
      }
    },
    computed: {
      data () {
        return this.eyo.data[this.dataKey]
      },
      variant: {
        get () {
          return this.variant_
        },
        set (newValue) {
          this.variant_ = newValue
          this.data && this.data.change(newValue)
        }
      },
      variants () {
        return this.data
          ? this.data.model.all
          : []
      }
    },
    created () {
      this.variant_ = this.data
        ? this.data.get()
        : this.dataKey.charAt(0).toUpperCase() + this.dataKey.slice(1)
    }
  }
</script>
<style>
  .info-variant {
    padding-right:1rem;
  }
</style>
