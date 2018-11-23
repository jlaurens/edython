<template>
  <b-btn-group id="b3k-primary-variant">
    <b-dropdown variant="outline-secondary" class="eyo-code item text eyo-with-slot-holder">
      <template slot="button-content"><span class="eyo-code" v-html="selected.content"></span></template>
      <b-dropdown-item-button v-for="variant in variants" v-on:click="selected = variant" :key="variant.key" class="eyo-code" v-html="variant.content"></b-dropdown-item-button>
    </b-dropdown>
    <b-input v-model="alias" type="text" class="btn-outline-secondary eyo-form-input-text item" :style='{fontFamily: $$.eYo.Font.familyMono}' v-if="selected.key === 'ALIASED'"></b-input>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'info-primary-variant',
    data () {
      return {
        saved_step: 0,
        can_call_: true,
        can_andef_: true,
        variant_: eYo.Key.NONE,
        annotation_: eYo.Key.NONE,
        definition_: eYo.Key.NONE,
        alias_: eYo.Key.NONE
      }
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
      can_call: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.can_call_
        }
      },
      can_andef: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.can_andef_
        }
      },
      variant: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.variant_
        }
      },
      annotation: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.annotation_
        }
      },
      definition: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.definition_
        }
      },
      alias: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.alias_
        },
        set (newValue) {
          this.eyo.alias_p = newValue
        }
      },
      selected: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          var variant = this.variant
          if (variant === eYo.Key.NONE) {
            if (this.annotation !== eYo.Key.NONE) {
              if (this.definition !== eYo.Key.NONE) {
                return this.items[eYo.Key.ANNOTATED_DEFINED]
              } else {
                return this.items[eYo.Key.ANNOTATED]
              }
            } else if (this.definition !== eYo.Key.NONE) {
              return this.items[eYo.Key.DEFINED]
            } else {
              return this.items[eYo.Key.NONE]
            }
          } else if (variant === eYo.Key.CALL_EXPR) {
            return this.items[eYo.Key.CALL_EXPR]
          } else if (variant === eYo.Key.SLICING) {
            return this.items[eYo.Key.SLICING]
          } else if (variant === eYo.Key.ALIASED) {
            return this.items[eYo.Key.ALIASED]
          } else {
            console.warn('Logically unreachable code')
          }
        },
        set (newValue) {
          this.eyo.changeWrap(
            function () {
              newValue.action(this)
            }
          )
        }
      },
      items () {
        return {
          [eYo.Key.NONE]: {
            content: '&nbsp;',
            key: eYo.Key.NONE,
            action (eyo) {
              eyo.annotation_p = eYo.Key.NONE
              eyo.definition_p = eYo.Key.NONE
              eyo.variant_p = eYo.Key.NONE
            }
          },
          [eYo.Key.CALL_EXPR]: {
            content: `<span>(</span>${this.slotholder('eyo-slot-holder')}<span>)</span>`,
            key: eYo.Key.CALL_EXPR,
            action (eyo) {
              eyo.variant_p = eYo.Key.CALL_EXPR
            }
          },
          [eYo.Key.SLICING]: {
            content: `<span>[</span>${this.slotholder('eyo-slot-holder')}<span>]</span>`,
            key: eYo.Key.SLICING,
            action (eyo) {
              eyo.variant_p = eYo.Key.SLICING
            }
          },
          [eYo.Key.ALIASED]: {
            content: '<span class="eyo-code eyo-code-reserved">as</span>',
            key: eYo.Key.ALIASED,
            action (eyo) {
              eyo.variant_p = eYo.Key.ALIASED
            }
          },
          [eYo.Key.ANNOTATED]: {
            content: `<span>:</span>${this.slotholder('eyo-slot-holder')}`,
            key: eYo.Key.ANNOTATED,
            action (eyo) {
              eyo.annotation_p = eYo.Key.ANNOTATED
              eyo.definition_p = eYo.Key.NONE
            }
          },
          [eYo.Key.DEFINED]: {
            content: `<span>=</span>${this.slotholder('eyo-slot-holder')}`,
            key: eYo.Key.DEFINED,
            action (eyo) {
              eyo.annotation_p = eYo.Key.NONE
              eyo.definition_p = eYo.Key.DEFINED
            }
          },
          [eYo.Key.ANNOTATED_DEFINED]: {
            content: `<span>:</span>${this.slotholder('eyo-slot-holder')}<span>=</span>${this.slotholder('eyo-slot-holder')}`,
            key: eYo.Key.ANNOTATED_DEFINED,
            action (eyo) {
              eyo.annotation_p = eYo.Key.ANNOTATED
              eyo.definition_p = eYo.Key.DEFINED
            }
          }
        }
      },
      variants () {
        return this.can_call
          ? this.can_andef
            ? [
              this.items[eYo.Key.NONE],
              this.items[eYo.Key.CALL_EXPR],
              this.items[eYo.Key.SLICING],
              this.items[eYo.Key.ALIASED],
              this.items[eYo.Key.ANNOTATED],
              this.items[eYo.Key.DEFINED],
              this.items[eYo.Key.ANNOTATED_DEFINED]
            ]
            : [
              this.items[eYo.Key.NONE],
              this.items[eYo.Key.CALL_EXPR],
              this.items[eYo.Key.SLICING],
              this.items[eYo.Key.ALIASED]
            ]
          : this.can_andef
            ? [
              this.items[eYo.Key.NONE],
              this.items[eYo.Key.SLICING],
              this.items[eYo.Key.ALIASED],
              this.items[eYo.Key.ANNOTATED],
              this.items[eYo.Key.DEFINED],
              this.items[eYo.Key.ANNOTATED_DEFINED]
            ]
            : [
              this.items[eYo.Key.NONE],
              this.items[eYo.Key.SLICING],
              this.items[eYo.Key.ALIASED]
            ]
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
        var eyo = this.eyo
        if (!eyo || (this.saved_step === this.step)) {
          return
        }
        this.saved_step = eyo.change.step
        this.variant_ = eyo.variant_p
        this.annotation_ = eyo.annotation_p
        this.definition_ = eyo.definition_p
        this.alias_ = eyo.alias_p
        var p5e = eyo.profile_p.p5e
        this.can_call_ = !p5e || !p5e.item || (p5e.item.type !== 'attribute' && p5e.item.type !== 'data' && p5e.item.type !== 'first last data')
        this.can_andef_ = !p5e || !p5e.item
      }
    }
  }
</script>
<style>
</style>
  
