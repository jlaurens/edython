<template>
  <b-dropdown id="info-assignment-variant" class="eyo-dropdown" v-if="data" variant="outline-secondary">
    <template slot="button-content"><span class="info-variant eyo-code eyo-content" v-html="variant.title"></span></template>
    <b-dropdown-item-button v-for="item in variants" v-on:click="variant = item" :key="item.key" class="info-variant eyo-code" v-html="item.title"></b-dropdown-item-button>
    </b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-assignment-variant',
    props: {
      selectedBlock: {
        type: Object,
        default: undefined
      },
      placeholder: {
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
      },
      dataKey: {
        type: String,
        default: 'variant'
      }
    },
    computed: {
      data () {
        var block = this.selectedBlock
        return block && block.eyo.data[this.dataKey]
      },
      variant: {
        get () {
          return this.data
            ? this.items[this.data.get()]
            : this.dataKey.charAt(0).toUpperCase() + this.dataKey.slice(1)
        },
        set (newValue) {
          this.data && this.data.set(newValue.key)
          this.selectedBlock.render()
        }
      },
      variants () {
        return [
          this.items[eYo.Key.NAME_VALUE],
          this.items[eYo.Key.NAME_ANNOTATION_VALUE],
          this.items[eYo.Key.TARGET_VALUE]
        ]
      },
      my_placeholder () {
        return this.placeholder('eyo-info-primary-variant1')
      },
      items () {
        return {
          [eYo.Key.NAME_VALUE]: {
            key: eYo.Key.NAME_VALUE,
            title: '<div class="eyo-info-primary-variant2">nom =</div>' + this.my_placeholder
          },
          [eYo.Key.NAME_ANNOTATION_VALUE]: {
            key: eYo.Key.NAME_ANNOTATION_VALUE,
            title: '<div class="eyo-info-primary-variant2">nom: </div>' + this.my_placeholder + '<div class="eyo-info-primary-variant2">=</div>' + this.my_placeholder
          },
          [eYo.Key.TARGET_VALUE]: {
            key: eYo.Key.TARGET_VALUE,
            title: this.my_placeholder + '<div class="eyo-info-primary-variant2">,… =</div>' + this.my_placeholder + '<div class="eyo-info-primary-variant2">,…</div>'
          }
        }
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
