<template>
  <b-button-toolbar id="info-primary" key-nav  aria-label="Info toolbar primary" justify>
    <b-button-toolbar>
      <dotted :selected-block="selectedBlock" :placeholder="placeholder"></dotted>
      <name :selected-block="selectedBlock"></name>
      <b-button-group class="mx-1">
        <variant :selected-block="selectedBlock" :placeholder="placeholder"></variant>
      </b-button-group>
    </b-button-toolbar>
    <common :selected-block="selectedBlock"></common>
  </b-button-toolbar>
</template>

<script>
  import Dotted from './Primary/Dotted.vue'
  import Name from './Primary/Name.vue'
  import Variant from './Primary/Variant.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-primary',
    data: function () {
      return {
      }
    },
    components: {
      Dotted,
      Name,
      Variant,
      Common
    },
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
      }
    },
    computed: {
      variant_d () {
        var block = this.selectedBlock
        return block && block.eyo && block.eyo.data.variant
      },
      variant: {
        get () {
          var variant_d = this.variant_d
          return variant_d && this.items[variant_d.get()]
        },
        set (item) {
          var variant_d = this.variant_d
          variant_d && variant_d.set(item.key)
        }
      },
      items () {
        return {
          [eYo.Key.NAME]: {
            content: '<span class="eyo-code-placeholder">nom</span>',
            key: eYo.Key.NAME
          },
          [eYo.Key.EXPRESSION]: {
            content: this.placeholder(),
            key: eYo.Key.EXPRESSION
          }
        }
      }
    }
  }
</script>
<style>
  .eyo-dd-content {
    padding: 0;
  }
  .eyo-form-input-text {
    text-align: left;
    width: 8rem;
  }
  .btn-outline-secondary.eyo-form-input-text:hover {
    background: white;
    color: black;
  }
</style>
