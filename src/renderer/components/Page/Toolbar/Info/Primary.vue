<template>
  <b-button-toolbar id="info-primary" key-nav  aria-label="Info toolbar primary" justify>
    <b-button-toolbar>
      <dotted :eyo="eyo" :slotholder="slotholder" :holder="holder" :dotted="dotted" v-on:synchronize="synchronize"></dotted>
      <name :eyo="eyo"></name>
      <b-button-group class="mx-1">
        <variant :eyo="eyo" :slotholder="slotholder" :variant="variant" :annotation="annotation" :definition="definition" :alias="alias" v-on:synchronize="synchronize"></variant>
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
        holder_: undefined,
        dotted_: undefined,
        name_: undefined,
        variant_: undefined,
        annotation_: undefined,
        definition_: undefined,
        alias_: undefined
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
      slotholder: {
        type: Function,
        default: function (item) {
          return item
        }
      }
    },
    computed: {
      holder: {
        get () {
          return this.holder_ === this.eyo.holder_p
            ? this.holder_
            : (this.holder_ = this.eyo.holder_p)
        },
        set (newValue) {
          this.holder_ = this.eyo.holder_p = newValue
        }
      },
      dotted: {
        get () {
          return this.dotted_ === this.eyo.dotted_p
            ? this.dotted_
            : (this.dotted_ = this.eyo.dotted_p)
        },
        set (newValue) {
          this.dotted_ = this.eyo.dotted_p = newValue
        }
      },
      name: {
        get () {
          return this.name_ === this.eyo.name_p
            ? this.name_
            : (this.name_ = this.eyo.name_p)
        },
        set (newValue) {
          this.name_ = this.eyo.name_p = newValue
        }
      },
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
      annotation: {
        get () {
          return this.annotation_ === this.eyo.annotation_p
            ? this.annotation_
            : (this.annotation_ = this.eyo.annotation_p)
        },
        set (newValue) {
          this.annotation_ = this.eyo.annotation_p = newValue
        }
      },
      definition: {
        get () {
          return this.definition_ === this.eyo.definition_p
            ? this.definition_
            : (this.definition_ = this.eyo.definition_p)
        },
        set (newValue) {
          this.definition_ = this.eyo.definition_p = newValue
        }
      },
      alias: {
        get () {
          return this.alias_ === this.eyo.alias_p
            ? this.alias_
            : (this.alias_ = this.eyo.alias_p)
        },
        set (newValue) {
          this.alias_ = this.eyo.alias_p = newValue
        }
      }
    },
    created () {
      this.synchronize()
    },
    methods: {
      synchronize () {
        var eyo = this.eyo
        this.holder_ = eyo.holder_p
        this.dotted_ = eyo.dotted_p
        this.name_ = eyo.name_p
        this.variant_ = eyo.variant_p
        this.annotation_ = eyo.annotation_p
        this.definition_ = eyo.definition_p
        this.alias_ = eyo.alias_p
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
