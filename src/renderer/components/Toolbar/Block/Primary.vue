<template>
  <b-btn-group id="block-primary" key-nav  aria-label="Block group primary" class="eyo-block-edit" justify>
    <dotted :eyo="eyo" :step="step" :slotholder="slotholder" :holder="holder" :dotted="dotted"></dotted>
    <name :eyo="eyo" :step="step" :variant="variant" :name="name" :module="module"></name>
    <variant :eyo="eyo" :step="step" :can_call="can_call" :can_andef="can_andef" :slotholder="slotholder" :variant="variant" :annotation="annotation" :definition="definition" :alias="alias"></variant>
    <ry :eyo="eyo" :step="step" :ary="ary" :mandatory="mandatory" v-if="variant === $$.eYo.Key.CALL_EXPR && can_ry"></ry>
  </b-btn-group>
</template>

<script>
  import Dotted from './Primary/Dotted.vue'
  import Name from './Primary/Name.vue'
  import Variant from './Primary/Variant.vue'
  import Ry from './Primary/Ry.vue'

  export default {
    name: 'info-primary',
    data: function () {
      return {
        saved_step: undefined,
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
      Ry
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      step: {
        type: Number,
        default: 0
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
        (this.saved_step === this.step) || this.$$synchronize()
        return this.holder_
      },
      dotted () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.dotted_
      },
      name () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.name_
      },
      variant () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.variant_
      },
      annotation () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.annotation_
      },
      definition () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.definition_
      },
      alias () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.alias_
      },
      can_ry () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.can_ry_
      },
      can_call () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.can_call_
      },
      can_andef () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.can_andef_
      },
      ary () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.ary_
      },
      mandatory () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.mandatory_
      },
      module () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.module_
      }
    },
    created () {
      this.$$synchronize()
    },
    beforeUpdate () {
      (this.saved_step === this.step) || this.$$synchronize()
    },
    methods: {
      $$synchronize () {
        if (!this.eyo || (this.saved_step === this.step)) {
          return
        }
        var eyo = this.eyo
        this.saved_step = eyo.change.step
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
</script>
<style>
  .eyo-dd-content {
    padding: 0;
  }
</style>
