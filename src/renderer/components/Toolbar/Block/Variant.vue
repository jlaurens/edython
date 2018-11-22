<template>
  <b-dropdown id="block-variant" class="eyo-dropdown" variant="outline-secondary" v-if="!!eyo.variant_d">
    <template slot="button-content"><span class="block-variant eyo-code eyo-content" v-html="formatter(variant)"></span></template>
    <b-dropdown-item-button v-for="item in variants" v-on:click="variant = item" :key="item" class="block-variant eyo-code" v-html="formatter(item)"></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-variant',
    data () {
      return {
        saved_step: undefined,
        variant_: undefined
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
          if (item) {
            var formatted = item.length ? this.$t('message.' + ({'*': 'star', '**': 'two_stars', '.': 'dot', '..': 'two_dots'}[item] || item)) : '&nbsp;'
            if (formatted.indexOf('{{slotholder}}') < 0) {
              return formatted
            }
            var replacement = '</span>' +
              this.slotholder('eyo-slot-holder') +
              '<span>'
            return '<span>' +
              formatted.replace('{{slotholder}}', replacement) +
              '</span>'
          } else {
            return ''
          }
        }
      }
    },
    computed: {
      variant: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.variant_
        },
        set (newValue) {
          this.eyo.variant_p = newValue
        }
      },
      variants () {
        return (this.eyo.variant_d && this.eyo.variant_d.getAll()) || []
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
        this.variant = this.eyo.variant_p
      }
    }
  }
</script>
<style>
  .info-variant {
    padding-right:1rem;
  }
</style>
