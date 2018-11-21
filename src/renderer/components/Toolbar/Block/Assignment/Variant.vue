<template>
  <b-dropdown id="block-assignment-variant" class="eyo-dropdown" variant="outline-secondary">
    <template slot="button-content"><span class="block-variant eyo-code eyo-content" v-html="selected_item.title"></span></template>
    <b-dropdown-item-button v-for="item in items" v-on:click="variant = item.key" :key="item.key" class="block-variant eyo-code" v-html="item.title"></b-dropdown-item-button>
    </b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-assignment-variant',
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
          console.log('default ', item)
          return item.length ? this.$t('message.' + ({'*': 'star', '**': 'two_stars', '.': 'dot', '..': 'two_dots'}[item] || item)) : '&nbsp;'
        }
      }
    },
    computed: {
      variant: {
        get () {
          return this.variant_ === this.eyo.variant_p
            ? this.variant_
            : (this.variant_ = this.eyo.variant_p)
        },
        set (newValue) {
          this.variant_ = this.eyo.variant_p = newValue
        }
      },
      items () {
        return [
          this.items_by_key[eYo.Key.NAME],
          this.items_by_key[eYo.Key.TARGET]
        ]
      },
      my_slot () {
        return this.slotholder('eyo-block-primary-variant1')
      },
      items_by_key () {
        return {
          [eYo.Key.NAME]: {
            key: eYo.Key.NAME,
            title: '<div class="eyo-block-primary-variant2">nom =</div>' + this.my_slot
          },
          [eYo.Key.TARGET]: {
            key: eYo.Key.TARGET,
            title: this.my_slot + '<div class="eyo-block-primary-variant2">,… =</div>' + this.my_slot + '<div class="eyo-block-primary-variant2">,…</div>'
          }
        }
      },
      selected_item () {
        return this.items_by_key[this.variant_]
      }
    },
    created () {
      this.variant_ = this.eyo.variant_p
    },
    updated () {
      this.synchronize()
    }
  }
</script>
<style>
  .info-variant {
    padding-right:1rem;
  }
</style>
