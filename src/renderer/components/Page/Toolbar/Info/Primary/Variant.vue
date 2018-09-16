<template>
    <b-button-group class="mx-1">
      <b-dropdown :id="id" class="eyo-dropdown" v-if="variants && variants.length" variant="outline-secondary">
        <template slot="button-content"><div class="eyo-info-primary-variant eyo-code eyo-content" v-html="selected_.content"></div></template>
        <b-dropdown-item-button v-for="variant in variants" v-on:click="selected = variant" :key="variant.key" class="eyo-info-primary-variant eyo-code" v-html="variant.content"></b-dropdown-item-button>
      </b-dropdown>
      <b-form-input v-model="alias" type="text" size="10" class="btn btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}' v-if="selected.key === 'ALIASED'"></b-form-input>
    </b-button-group>
  </template>
  
  <script>
    export default {
      name: 'info-primary-variant',
      data () {
        return {
          dataKey: 'variant',
          selected__: undefined
        }
      },
      props: {
        selectedBlock: {
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
        id () {
          return 'eyo-info-' + this.dataKey
        },
        annotation_d () {
          return this.selectedBlock.eyo.data.annotation
        },
        definition_d () {
          return this.selectedBlock.eyo.data.definition
        },
        variant_d () {
          return this.selectedBlock.eyo.data.variant
        },
        modifier_d () {
          return this.selectedBlock.eyo.data.modifier
        },
        dotted_d () {
          return this.selectedBlock.eyo.data.dotted
        },
        selected_: {
          get () {
            if (!this.selected__) {
              this.selected__ = this.selected
            }
            return this.selected__
          },
          set (newValue) {
            this.selected__ = newValue
          }
        },
        selected: {
          get () {
            var variant = this.variant_d.get()
            if (variant === eYo.Key.NONE) {
              var annotation = this.annotation_d.get()
              var definition = this.definition_d.get()
              if (annotation !== eYo.Key.NONE) {
                if (definition !== eYo.Key.NONE) {
                  return this.items.ANNOTATED_DEFINED
                } else {
                  return this.items.ANNOTATED
                }
              } else if (definition !== eYo.Key.NONE) {
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
            this.selected_ = newValue
            this.selectedBlock.eyo.changeWrap(
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
                this.annotation_d.set(eYo.Key.NONE)
                this.definition_d.set(eYo.Key.NONE)
                this.variant_d.set(eYo.Key.NONE)
                this.selectedBlock.render()
              }
            },
            CALL_EXPR: {
              content: '<div class="eyo-info-primary-variant2">(</div>' + this.placeholder('eyo-info-primary-variant1') + '<div class="eyo-info-primary-variant2">)</div>',
              key: 'CALL_EXPR',
              action () {
                this.variant_d.set(eYo.Key.CALL_EXPR)
                this.selectedBlock.render()
              }
            },
            SLICING: {
              content: '<div class="eyo-info-primary-variant2">[</div>' + this.placeholder('eyo-info-primary-variant1') + '<div class="eyo-info-primary-variant2">]</div>',
              key: 'SLICING',
              action () {
                this.variant_d.set(eYo.Key.SLICING)
                this.selectedBlock.render()
              }
            },
            ALIASED: {
              content: '<div class="eyo-code eyo-code-reserved">as</div>',
              key: 'ALIASED',
              action () {
                this.consolidateModifier('*')
                this.consolidateModifier('.')
                this.variant_d.set(eYo.Key.ALIASED)
                this.selectedBlock.render()
              }
            },
            ANNOTATED: {
              content: '<div class="eyo-info-primary-variant2">:</div>' + this.placeholder('eyo-info-primary-variant1'),
              key: 'ANNOTATED',
              action () {
                this.annotation_d.set(eYo.Key.ANNOTATED)
                this.definition_d.set(eYo.Key.NONE)
                this.consolidateModifier('.')
                this.variant_d.set(eYo.Key.NONE)
                this.selectedBlock.render()
              }
            },
            DEFINED: {
              content: '<div class="eyo-info-primary-variant2">=</div>' + this.placeholder('eyo-info-primary-variant1'),
              key: 'DEFINED',
              action () {
                this.annotation_d.set(eYo.Key.NONE)
                this.definition_d.set(eYo.Key.DEFINED)
                this.consolidateModifier('.')
                this.consolidateModifier('*')
                this.variant_d.set(eYo.Key.NONE)
                this.selectedBlock.render()
              }
            },
            ANNOTATED_DEFINED: {
              content: '<div class="eyo-info-primary-variant2">:</div>' + this.placeholder('eyo-info-primary-variant1') + '<div class="eyo-info-primary-variant2">=</div>' + this.placeholder('eyo-info-primary-variant1'),
              key: 'ANNOTATED_DEFINED',
              action () {
                this.annotation_d.set(eYo.Key.ANNOTATED)
                this.definition_d.set(eYo.Key.DEFINED)
                this.consolidateModifier('.')
                this.consolidateModifier('*')
                this.variant_d.set(eYo.Key.NONE)
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
            var block = this.selectedBlock
            return block && block.eyo.data.alias.get()
          },
          set (newValue) {
            var block = this.selectedBlock
            block.eyo.changeWrap(
              function () {
                block.eyo.data.alias.set(newValue)
              }
            )
          }
        }
      },
      methods: {
        consolidateModifier (c) {
          var modifier_d = this.modifier_d
          var modifier = modifier_d.get()
          if (modifier.length && modifier[0] === c) {
            modifier_d.set('')
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
    