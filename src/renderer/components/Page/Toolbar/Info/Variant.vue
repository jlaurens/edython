<template>
  <b-dropdown id="info-variant" class="eyo-dropdown" v-if="variant_d">
    <button-content class="info-variant eyo-code eyo-content" slot="button-content" v-html='formatter(variant)'></button-content>
    <b-dropdown-item-button v-for="item in variants" v-on:click="variant = item" class="eyo-code" :key="item">
        <button-content class="info-variant eyo-code" slot="button-content" v-html='formatter(item)'></button-content>
    </b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-variant',
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
          console.log('item:', item, this.$t('message.' + item))
          return this.$t('message.' + item)
        }
      }
    },
    computed: {
      variant_d () {
        var block = this.selectedBlock
        return block && block.eyo.data.variant
      },
      variant: {
        get () {
          var variant_d = this.variant_d
          return variant_d
            ? variant_d.get()
            : 'Variant'
        },
        set (newValue) {
          var variant_d = this.variant_d
          if (variant_d) {
            variant_d.set(newValue)
          }
        }
      },
      variants () {
        var variant_d = this.variant_d
        return variant_d
          ? variant_d.model.all
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
  