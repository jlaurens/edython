<template>
  <b-btn-group id="eyo-block-primary-variant">
    <b-dropdown variant="outline-secondary" class="eyo-dropdown">
      <template slot="button-content"><span class="eyo-code" v-html="selected.content"></span></template>
      <b-dropdown-item-button v-for="variant in variants" v-on:click="selected = variant" :key="variant.key" class="eyo-code" v-html="variant.content"></b-dropdown-item-button>
    </b-dropdown>
    <b-form-input v-model="blockAlias" type="text" class="eyo-btn-inert btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}' v-if="selected.key === 'ALIASED'"></b-form-input>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'info-primary-variant',
    data () {
      return {
      }
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
      },
      can_call: {
        type: Boolean,
        default: true
      },
      can_andef: {
        type: Boolean,
        default: true
      },
      variant: {
        type: String,
        default: eYo.Key.NONE
      },
      annotation: {
        type: String,
        default: eYo.Key.NONE
      },
      definition: {
        type: String,
        default: eYo.Key.NONE
      },
      alias: {
        type: String,
        default: eYo.Key.NONE
      }
    },
    computed: {
      selected: {
        get () {
          var variant = this.variant
          if (variant === eYo.Key.NONE) {
            if (this.annotation !== eYo.Key.NONE) {
              if (this.definition !== eYo.Key.NONE) {
                return this.items.ANNOTATED_DEFINED
              } else {
                return this.items.ANNOTATED
              }
            } else if (this.definition !== eYo.Key.NONE) {
              return this.items.DEFINED
            } else {
              return this.items.NONE
            }
          } else if (variant === eYo.Key.CALL_EXPR) {
            return this.items.CALL_EXPR
          } else if (variant === eYo.Key.SLICING) {
            return this.items.SLICING
          } else if (variant === eYo.Key.ALIASED) {
            return this.items.ALIASED
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
          this.$emit('synchronize')
        }
      },
      items () {
        return {
          NONE: {
            content: '&nbsp;',
            key: 'NONE',
            action (eyo) {
              eyo.annotation_p = eYo.Key.NONE
              eyo.definition_p = eYo.Key.NONE
              eyo.variant_p = eYo.Key.NONE
            }
          },
          CALL_EXPR: {
            content: `<span>(</span>${this.slotholder('eyo-slot-holder')}<span>)</span>`,
            key: 'CALL_EXPR',
            action (eyo) {
              eyo.variant_p = eYo.Key.CALL_EXPR
            }
          },
          SLICING: {
            content: `<span>[</span>${this.slotholder('eyo-slot-holder')}<span>]</span>`,
            key: 'SLICING',
            action (eyo) {
              eyo.variant_p = eYo.Key.SLICING
            }
          },
          ALIASED: {
            content: '<span class="eyo-code eyo-code-reserved">as</span>',
            key: 'ALIASED',
            action (eyo) {
              eyo.variant_p = eYo.Key.ALIASED
            }
          },
          ANNOTATED: {
            content: `<span>:</span>${this.slotholder('eyo-slot-holder')}`,
            key: 'ANNOTATED',
            action (eyo) {
              eyo.annotation_p = eYo.Key.ANNOTATED
              eyo.definition_p = eYo.Key.NONE
            }
          },
          DEFINED: {
            content: `<span>=</span>${this.slotholder('eyo-slot-holder')}`,
            key: 'DEFINED',
            action (eyo) {
              eyo.annotation_p = eYo.Key.NONE
              eyo.definition_p = eYo.Key.DEFINED
            }
          },
          ANNOTATED_DEFINED: {
            content: `<span>:</span>${this.slotholder('eyo-slot-holder')}<span>=</span>${this.slotholder('eyo-slot-holder')}`,
            key: 'ANNOTATED_DEFINED',
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
              this.items.NONE,
              this.items.CALL_EXPR,
              this.items.SLICING,
              this.items.ALIASED,
              this.items.ANNOTATED,
              this.items.DEFINED,
              this.items.ANNOTATED_DEFINED
            ]
            : [
              this.items.NONE,
              this.items.CALL_EXPR,
              this.items.SLICING,
              this.items.ALIASED
            ]
          : this.can_andef
            ? [
              this.items.NONE,
              this.items.SLICING,
              this.items.ALIASED,
              this.items.ANNOTATED,
              this.items.DEFINED,
              this.items.ANNOTATED_DEFINED
            ]
            : [
              this.items.NONE,
              this.items.SLICING,
              this.items.ALIASED
            ]
      },
      blockAlias: {
        get () {
          return this.alias
        },
        set (newValue) {
          this.eyo.alias_p = newValue
          this.$emit('synchronize')
        }
      }
    }
  }
</script>
<style>
</style>
  