<template>
  <b-button-group class="mx-1">
    <b-dropdown :id="id" class="eyo-dropdown" v-if="variants && variants.length" variant="outline-secondary">
      <template slot="button-content"><div class="eyo-info-primary-variant eyo-code eyo-content" v-html="selected.content"></div></template>
      <b-dropdown-item-button v-for="variant in variants" v-on:click="selected = variant" :key="variant.key" class="eyo-info-primary-variant eyo-code" v-html="variant.content"></b-dropdown-item-button>
    </b-dropdown>
    <b-form-input v-model="alias" type="text" size="10" class="btn btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}' v-if="selected.key === 'ALIASED'"></b-form-input>
  </b-button-group>
</template>

<script>
  import Alias from './Variant/Alias.vue'

  export default {
    name: 'info-primary-variant',
    data () {
      return {
        dataKey: 'variant',
        alias_: undefined
      }
    },
    components: {
      Alias
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
      }
    },
    computed: {
      id () {
        return 'eyo-info-' + this.dataKey
      },
      modifier_d () {
        return this.eyo.data.modifier
      },
      annotation_d () {
        return this.eyo.data.annotation
      },
      definition_d () {
        return this.eyo.data.definition
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
            newValue.action,
            this
          )
        }
      },
      items () {
        return {
          NONE: {
            content: '&nbsp;',
            key: 'NONE',
            action () {
              this.eyo.annotation_p = eYo.Key.NONE
              this.eyo.definition_p = eYo.Key.NONE
              this.eyo.variant_p = eYo.Key.NONE
              this.$emit('synchronize')
            }
          },
          CALL_EXPR: {
            content: '<div class="eyo-info-primary-variant2">(</div>' + this.placeholder('eyo-info-primary-variant1') + '<div class="eyo-info-primary-variant2">)</div>',
            key: 'CALL_EXPR',
            action () {
              this.eyo.variant_p = eYo.Key.CALL_EXPR
              this.$emit('synchronize')
            }
          },
          SLICING: {
            content: '<div class="eyo-info-primary-variant2">[</div>' + this.placeholder('eyo-info-primary-variant1') + '<div class="eyo-info-primary-variant2">]</div>',
            key: 'SLICING',
            action () {
              this.eyo.variant_p = eYo.Key.SLICING
              this.$emit('synchronize')
            }
          },
          ALIASED: {
            content: '<div class="eyo-code eyo-code-reserved">as</div>',
            key: 'ALIASED',
            action () {
              this.eyo.variant_p = eYo.Key.ALIASED
              this.$emit('synchronize')
            }
          },
          ANNOTATED: {
            content: '<div class="eyo-info-primary-variant2">:</div>' + this.placeholder('eyo-info-primary-variant1'),
            key: 'ANNOTATED',
            action () {
              this.eyo.annotation_p = eYo.Key.ANNOTATED
              this.eyo.definition_p = eYo.Key.NONE
              this.$emit('synchronize')
            }
          },
          DEFINED: {
            content: '<div class="eyo-info-primary-variant2">=</div>' + this.placeholder('eyo-info-primary-variant1'),
            key: 'DEFINED',
            action () {
              this.eyo.annotation_p = eYo.Key.NONE
              this.eyo.definition_p = eYo.Key.DEFINED
              this.$emit('synchronize')
            }
          },
          ANNOTATED_DEFINED: {
            content: '<div class="eyo-info-primary-variant2">:</div>' + this.placeholder('eyo-info-primary-variant1') + '<div class="eyo-info-primary-variant2">=</div>' + this.placeholder('eyo-info-primary-variant1'),
            key: 'ANNOTATED_DEFINED',
            action () {
              this.eyo.annotation_p = eYo.Key.ANNOTATED
              this.eyo.definition_p = eYo.Key.DEFINED
              this.$emit('synchronize')
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
      alias: {
        get () {
          return this.alias_ || (this.alias_ = this.blockAlias)
        },
        set (newValue) {
          this.blockAlias = this.alias_ = newValue
        }
      },
      blockAlias: {
        get () {
          return this.eyo.alias_p
        },
        set (newValue) {
          this.eyo.alias_p = newValue
        }
      }
    }
  }
</script>
<style>
  .btn .eyo-info-primary-variant {
    padding-right: 0.75rem;
  }
  .dropdown-item.eyo-info-primary-variant {
    padding-right: 0.5rem;
  }
</style>
  