<template>
  <b-button-toolbar id="info-primary" key-nav  aria-label="Info toolbar primary" justify>
    <b-button-toolbar>
      <dotted :eyo="eyo" :slotholder="slotholder" :holder="holder" :dotted="dotted"></dotted>
      <name :eyo="eyo" :name="name"></name>
      <variant :eyo="eyo" :slotholder="slotholder" :variant="variant" :annotation="annotation" :definition="definition" :alias="alias"></variant>
      <ry :eyo="eyo" :can_ry="can_ry" :ary="ary" :mandatory="mandatory" v-if="variant === $$.eYo.Key.CALL_EXPR"></ry>
      <comment :eyo="eyo"></comment>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
  </b-button-toolbar>
</template>

<script>
  import Dotted from './Primary/Dotted.vue'
  import Name from './Primary/Name.vue'
  import Variant from './Primary/Variant.vue'
  import Ry from './Primary/Ry.vue'
  import Comment from './Comment.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-primary',
    data: function () {
      return {
        step_: undefined,
        holder_: undefined,
        dotted_: undefined,
        name_: undefined,
        variant_: undefined,
        annotation_: undefined,
        definition_: undefined,
        alias_: undefined,
        can_ry_: undefined,
        ary_: undefined,
        mandatory_: undefined
      }
    },
    components: {
      Dotted,
      Name,
      Variant,
      Ry,
      Comment,
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
      holder () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.holder_
      },
      dotted () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.dotted_
      },
      name () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.name_
      },
      variant () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.variant_
      },
      annotation () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.annotation_
      },
      definition () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.definition_
      },
      alias () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.alias_
      },
      can_ry () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.can_ry_
      },
      ary () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.ary_
      },
      mandatory () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.mandatory_
      }
    },
    created () {
      this.synchronize()
    },
    methods: {
      synchronize () {
        var eyo = this.eyo
        if (this.step_ !== eyo.change.step) {
          this.step_ = eyo.change.step
          this.holder_ = eyo.holder_p
          this.dotted_ = eyo.dotted_p
          this.name_ = eyo.name_p
          this.variant_ = eyo.variant_p
          this.annotation_ = eyo.annotation_p
          this.definition_ = eyo.definition_p
          this.alias_ = eyo.alias_p
          var tos = eyo.profile_p.tos
          this.can_ry_ = !tos || !tos.model
          this.ary_ = eyo.ary_p
          this.mandatory_ = eyo.mandatory_p
        }
      }
    }
  }
</script>
<style>
  .eyo-dd-content {
    padding: 0;
  }
</style>
