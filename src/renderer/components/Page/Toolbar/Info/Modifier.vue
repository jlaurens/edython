<template>
  <b-dropdown id="info-modifier" class="eyo-dropdown" v-if="modifiers && modifiers.length">
    <template slot="button-content"><span class="info-modifier eyo-content"  v-html="formatter(modifier)"></span></template>
    <b-dropdown-item-button v-for="item in modifiers" v-on:click="modifier = item" v-bind:style="{fontFamily: $$.eYo.Font.familySans}" :key="item"  v-html="formatter(item)"></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-modifier',
    data: function () {
      return {
      }
    },
    props: {
      selectedBlock: {
        type: Object,
        default: undefined
      },
      formatter: {
        type: Function,
        default: function (item) {
          return item.length ? this.$t('message.' + ({'*': 'star', '**': 'two_stars'}[item] || item)) : '&nbsp;'
        }
      }
    },
    computed: {
      modifier_d () {
        var block = this.selectedBlock
        return block && block.eyo.data.modifier
      },
      modifier: {
        get () {
          var modifier_d = this.modifier_d
          return modifier_d
            ? modifier_d.get()
            : 'Modifier'
        },
        set (newModifier) {
          var modifier_d = this.modifier_d
          if (modifier_d) {
            modifier_d.set(newModifier)
          }
        }
      },
      modifiers () {
        var modifier_d = this.modifier_d
        return modifier_d && modifier_d.model.all
      }
    }
  }
</script>
<style scoped>
  .info-modifier {
    padding-right:1rem;
  }
</style>
