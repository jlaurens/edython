<template>
  <b-dropdown id="info-variant" class="eyo-dropdown" v-if="data">
    <template slot="button-content"><span class="info-variant eyo-code eyo-content" v-html="formatter(variant)"></span></template>
    <b-dropdown-item-button v-for="item in variants" v-on:click="variant = item" :key="item" class="info-variant eyo-code" v-html="formatter(item)"></b-dropdown-item-button>
    </b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-variant',
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      formatter: {
        type: Function,
        default: function (item) {
          console.log('default ', item)
          return item.length ? this.$t('message.' + ({'*': 'star', '**': 'two_stars', '.': 'dot', '..': 'two_dots'}[item] || item)) : '&nbsp;'
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
          return this.data
            ? this.data.get()
            : this.dataKey.charAt(0).toUpperCase() + this.dataKey.slice(1)
        },
        set (newValue) {
          this.data && this.data.set(newValue)
          this.eyo.render()
        }
      },
      variants () {
        return this.data
          ? this.data.model.all
          : []
      }
    }
  }
</script>
<style>
  .info-variant {
    padding-right:1rem;
  }
  .eyo-content > .eyo-code-reserved {
    color: white;
    fill: white;
  }
</style>
