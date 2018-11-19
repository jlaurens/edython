<template>
  <b-button-toolbar id="info-primary" key-nav  aria-label="Info toolbar primary" justify>
    <dotted :eyo="eyo" :slotholder="slotholder" :holder="holder" :dotted="dotted"></dotted>
    <name :eyo="eyo" :variant="variant" :name="name" :module="module"></name>
    <variant :eyo="eyo" :can_call="can_call" :can_andef="can_andef" :slotholder="slotholder" :variant="variant" :annotation="annotation" :definition="definition" :alias="alias"></variant>
    <ry :eyo="eyo" :ary="ary" :mandatory="mandatory" v-if="variant === $$.eYo.Key.CALL_EXPR && can_ry"></ry>
    <comment :eyo="eyo"></comment>
  </b-button-toolbar>
</template>

<script>
  import Dotted from './Primary/Dotted.vue'
  import Name from './Primary/Name.vue'
  import Variant from './Primary/Variant.vue'
  import Ry from './Primary/Ry.vue'
  import Comment from './Comment.vue'

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
        can_call_: undefined,
        can_ry_: undefined,
        can_andef_: undefined,
        ary_: undefined,
        mandatory_: undefined,
        module_: undefined
      }
    },
    components: {
      Dotted,
      Name,
      Variant,
      Ry,
      Comment
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
      can_call () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.can_call_
      },
      can_andef () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.can_andef_
      },
      ary () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.ary_
      },
      mandatory () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.mandatory_
      },
      module () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.module_
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
          var p5e = eyo.profile_p.p5e
          this.can_ry_ = !p5e || !p5e.item
          this.can_call_ = !p5e || !p5e.item || (p5e.item.type !== 'attribute' && p5e.item.type !== 'data' && p5e.item.type !== 'first last data')
          this.can_andef_ = !p5e || !p5e.item
          this.can_slice_ = !p5e || !p5e.item || (p5e.item.type !== 'method' && p5e.item.type !== 'function')
          this.ary_ = eyo.ary_p
          this.mandatory_ = eyo.mandatory_p
          this.module_ = p5e && p5e.item && p5e.item.module
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
