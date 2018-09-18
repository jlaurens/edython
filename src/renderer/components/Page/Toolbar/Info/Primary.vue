<template>
  <b-button-toolbar id="info-primary" key-nav  aria-label="Info toolbar primary" justify>
    <b-button-toolbar>
      <dotted :eyo="eyo" :placeholder="placeholder" :holder="holder" :dotted="dotted" v-on:synchronize="synchronize"></dotted>
      <name :eyo="eyo"></name>
      <b-button-group class="mx-1">
        <variant :eyo="eyo" :placeholder="placeholder" :variant="variant" :annotation="annotation" :definition="definition" v-on:synchronize="synchronize"></variant>
      </b-button-group>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
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
        modifier: undefined,
        holder: undefined,
        dotted: undefined,
        name: undefined,
        variant: undefined,
        annotation: undefined,
        definition: undefined
      }
    },
    components: {
      Dotted,
      Name,
      Variant,
      Common
    },
    props: {
      eyo: {
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
    },
    created () {
      this.synchronize()
    },
    methods: {
      synchronize () {
        var eyo = this.eyo
        eyo.render()
        this.modifier = eyo.modifier_p
        this.holder = eyo.holder_p
        this.dotted = eyo.dotted_p
        this.name = eyo.name_p
        this.variant = eyo.variant_p
        this.annotation = eyo.annotation_p
        this.definition = eyo.definition_p
        if (eyo.slots.dotted.isIncog()) {
          this.dotted = 0
        }
        if (eyo.slots.annotation.isIncog()) {
          this.annotation = eYo.Key.NONE
        }
        if (eyo.slots.definition.isIncog()) {
          this.definition = eYo.Key.NONE
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
