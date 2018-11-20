<template>
  <b-dropdown id="info-modifier" class="eyo-dropdown" v-if="modifiers && modifiers.length" variant="outline-secondary">
    <template slot="button-content"><span class="info-modifier eyo-content"  v-html="selected.title || selected.content"></span></template>
    <b-dropdown-item-button v-for="item in modifiers" v-on:click="selected = item" v-bind:style="{fontFamily: $$.eYo.Font.familySans}" :key="item.key" v-html="item.content"></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-modifier',
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      modifier_d () {
        return this.eyo.data.modifier
      },
      option_d () {
        return this.eyo.data.option
      },
      selected: {
        get () {
          var modifier_d = this.modifier_d
          return (modifier_d && this.items[modifier_d.get()]) || this.modifiers[0]
        },
        set (newItem) {
          if (newItem.key.length) {
            this.consolidateOption()
          }
          var modifier_d = this.modifier_d
          modifier_d && modifier_d.set(newItem.key)
          newItem.action && newItem.action.call(this, newItem)
          this.eyo.render()
        }
      },
      items () {
        return {
          '': {
            content: '&nbsp;',
            key: ''
          },
          '*': {
            content: this.$t('message.star'),
            key: '*'
          },
          '**': {
            content: this.$t('message.two_stars'),
            key: '**'
          },
          '.': {
            content: this.$t('message.dot'),
            key: '.'
          },
          '..': {
            content: this.$t('message.two_dots'),
            key: '..'
          }
        }
      },
      modifiers () {
        return [
          this.items[''],
          this.items['*'],
          this.items['**'],
          this.items['.'],
          this.items['..']
        ]
      }
    },
    methods: {
      consolidateOption () {
        var option_d = this.option_d
        var option = option_d && option_d.get()
        if ([
          option_d.ANNOTATED,
          option_d.DEFINED,
          option_d.ANNOTATED_DEFINED
        ].indexOf(option) >= 0) {
          option_d.set(option_d.NONE)
        }
      }
    }
  }
</script>
<style scoped>
  .info-modifier {
    padding-right:1rem;
  }
</style>
