<template>
  <b-button-group class="mx-1 eyo-button-group">
    <b-dropdown :id="id" class="eyo-dropdown" v-if="variants && variants.length" variant="outline-secondary">
      <template slot="button-content"><div class="eyo-info-primary-variant eyo-code eyo-content" v-html="selected.content"></div></template>
      <b-dropdown-item-button v-for="variant in variants" v-on:click="selected = variant" :key="variant.key" class="eyo-info-primary-variant eyo-code" v-html="variant.content"></b-dropdown-item-button>
    </b-dropdown>
    <b-form-input v-model="blockAlias" type="text" class="btn btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}' v-if="selected.key === 'ALIASED'"></b-form-input>
  </b-button-group>
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
      id () {
        return 'eyo-info-variant'
      },
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
            content: '<div class="eyo-info-primary-variant2">(</div>' + this.slotholder('eyo-info-primary-variant1') + '<div class="eyo-info-primary-variant2">)</div>',
            key: 'CALL_EXPR',
            action (eyo) {
              eyo.variant_p = eYo.Key.CALL_EXPR
            }
          },
          SLICING: {
            content: '<div class="eyo-info-primary-variant2">[</div>' + this.slotholder('eyo-info-primary-variant1') + '<div class="eyo-info-primary-variant2">]</div>',
            key: 'SLICING',
            action (eyo) {
              eyo.variant_p = eYo.Key.SLICING
            }
          },
          ALIASED: {
            content: '<div class="eyo-code eyo-code-reserved">as</div>',
            key: 'ALIASED',
            action (eyo) {
              eyo.variant_p = eYo.Key.ALIASED
            }
          },
          ANNOTATED: {
            content: '<div class="eyo-info-primary-variant2">:</div>' + this.slotholder('eyo-info-primary-variant1'),
            key: 'ANNOTATED',
            action (eyo) {
              eyo.annotation_p = eYo.Key.ANNOTATED
              eyo.definition_p = eYo.Key.NONE
            }
          },
          DEFINED: {
            content: '<div class="eyo-info-primary-variant2">=</div>' + this.slotholder('eyo-info-primary-variant1'),
            key: 'DEFINED',
            action (eyo) {
              eyo.annotation_p = eYo.Key.NONE
              eyo.definition_p = eYo.Key.DEFINED
            }
          },
          ANNOTATED_DEFINED: {
            content: '<div class="eyo-info-primary-variant2">:</div>' + this.slotholder('eyo-info-primary-variant1') + '<div class="eyo-info-primary-variant2">=</div>' + this.slotholder('eyo-info-primary-variant1'),
            key: 'ANNOTATED_DEFINED',
            action (eyo) {
              eyo.annotation_p = eYo.Key.ANNOTATED
              eyo.definition_p = eYo.Key.DEFINED
            }
          }
        }
      },
      variants () {
        return [
          this.items.NONE,
          this.items.CALL_EXPR,
          this.items.SLICING,
          this.items.ALIASED,
          this.items.ANNOTATED,
          this.items.DEFINED,
          this.items.ANNOTATED_DEFINED
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
  .btn .eyo-info-primary-variant {
    padding-right: 0.75rem;
  }
</style>
  