<template>
  <b-button-toolbar id="info-primary" key-nav  aria-label="Info toolbar primary" justify>
    <b-button-toolbar>
      <b-button-group class="mx-1">
        <modifier :selected-block="selectedBlock"></modifier>
        <parent :selected-block="selectedBlock"></parent>
        <dotted :selected-block="selectedBlock" :placeholder="placeholder"></dotted>
      </b-button-group>
      <b-button-group class="mx-1">
        <variant :selected-block="selectedBlock" :placeholder="placeholder"></variant>
      </b-button-group>
    </b-button-toolbar>
    <common :selected-block="selectedBlock"></common>
  </b-button-toolbar>
</template>

<script>
  import Modifier from './Primary/Modifier.vue'
  import Parent from './Primary/Parent.vue'
  import Dotted from './Primary/Dotted.vue'
  import Value from './Value.vue'
  import Variant from './Primary/Variant.vue'
  import OptionX from './Primary/Option.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-primary',
    data: function () {
      return {
      }
    },
    components: {
      Modifier,
      Parent,
      Dotted,
      Value,
      Variant,
      OptionX,
      Comment,
      Common
    },
    props: {
      selectedBlock: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      placeholder () {
        var d = eYo.DelegateSvg.prototype.placeHolderPathDefWidth_(0).d
        var one_rem = parseInt(getComputedStyle(document.documentElement).fontSize)
        return function (className) {
          return '<div class="eyo-info-placeholder' + (className ? ' ' : '') + className + '"><svg xmlns="http://www.w3.org/2000/svg" height="' + (1.75 * one_rem) + '" width="' + (2 * one_rem) + '"><path class="eyo-path-contour" d="' + d + ' z"></path></svg></div>'
        }
      },
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
  .eyo-info-placeholder {
    display: inline-block;
    height: 1.75rem;
  }
  .btn .eyo-info-placeholder .eyo-path-contour {
    stroke-width: 2px;
  }
  .dropdown-item:hover .eyo-info-placeholder .eyo-path-contour {
    stroke: rgb(100,100,100);
  }
  .eyo-info-primary-option1 {
    display: inline-block;
  }
  .eyo-info-primary-option2 {
    display: inline-block;
    position: relative;
    top: -0.45rem;
  }
</style>
