<template>
    <b-button-group class="mx-1">
      <b-dropdown :id="id" class="eyo-dropdown" v-if="variants && variants.length" variant="outline-secondary">
        <template slot="button-content"><div class="eyo-info-primary-option eyo-code eyo-content" v-html="selected.content"></div></template>
        <b-dropdown-item-button v-for="option in variants" v-on:click="selected = option" :key="option.key" class="eyo-info-primary-option eyo-code" v-html="option.content"></b-dropdown-item-button>
      </b-dropdown>
      <b-form-input v-model="alias" type="text" size="10" class="btn btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}' v-if="selected.key === 'ALIASED'"></b-form-input>
    </b-button-group>
  </template>
  
  <script>
    export default {
      name: 'info-primary-option',
      data () {
        return {
          dataKey: 'option'
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
          var block = this.selectedBlock
          return block && block.eyo.data.annotation
        },
        definition_d () {
          var block = this.selectedBlock
          return block && block.eyo.data.definition
        },
        option_d () {
          var block = this.selectedBlock
          return block && block.eyo.data.option
        },
        modifier_d () {
          var block = this.selectedBlock
          return block && block.eyo.data.modifier
        },
        dotted_d () {
          var block = this.selectedBlock
          return block && block.eyo.data.dotted
        },
        variant_d () {
          var block = this.selectedBlock
          return block && block.eyo.data.variant
        },
        selected: {
          get () {
            var option = this.option_d.get()
            if (option === eYo.Key.NONE) {
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
            } else if (option === eYo.Key.CALL_EXPR) {
              return this.items.CALL_EXPR
            } else if (option === eYo.Key.SLICING) {
              return this.items.SLICING
            } else if (option === eYo.Key.ALIASED) {
              return this.items.ALIASED
            } else {
              console.warn('Logically unreachable code')
            }
          },
          set (newValue) {
            newValue.action.call(this)
            this.selectedBlock.eyo.render()
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
                this.option_d.set(eYo.Key.NONE)
              }
            },
            CALL_EXPR: {
              content: '<div class="eyo-info-primary-option2">(</div>' + this.placeholder('eyo-info-primary-option1') + '<div class="eyo-info-primary-option2">)</div>',
              key: 'CALL_EXPR',
              action () {
                this.option_d.set(eYo.Key.CALL_EXPR)
              }
            },
            SLICING: {
              content: '<div class="eyo-info-primary-option2">[</div>' + this.placeholder('eyo-info-primary-option1') + '<div class="eyo-info-primary-option2">]</div>',
              key: 'SLICING',
              action () {
                this.option_d.set(eYo.Key.SLICING)
              }
            },
            ALIASED: {
              content: '<div class="eyo-code eyo-code-reserved">as</div>',
              key: 'ALIASED',
              action () {
                this.consolidateModifier('*')
                this.consolidateModifier('.')
                this.option_d.set(eYo.Key.ALIASED)
              }
            },
            ANNOTATED: {
              content: '<div class="eyo-info-primary-option2">:</div>' + this.placeholder('eyo-info-primary-option1'),
              key: 'ANNOTATED',
              action () {
                this.annotation_d.set(eYo.Key.ANNOTATED)
                this.definition_d.set(eYo.Key.NONE)
                this.consolidateModifier('.')
                this.option_d.set(eYo.Key.NONE)
              }
            },
            DEFINED: {
              content: '<div class="eyo-info-primary-option2">=</div>' + this.placeholder('eyo-info-primary-option1'),
              key: 'DEFINED',
              action () {
                this.annotation_d.set(eYo.Key.NONE)
                this.definition_d.set(eYo.Key.DEFINED)
                this.consolidateModifier('.')
                this.consolidateModifier('*')
                this.option_d.set(eYo.Key.NONE)
              }
            },
            ANNOTATED_DEFINED: {
              content: '<div class="eyo-info-primary-option2">:</div>' + this.placeholder('eyo-info-primary-option1') + '<div class="eyo-info-primary-option2">=</div>' + this.placeholder('eyo-info-primary-option1'),
              key: 'ANNOTATED_DEFINED',
              action () {
                this.annotation_d.set(eYo.Key.ANNOTATED)
                this.definition_d.set(eYo.Key.DEFINED)
                this.consolidateModifier('.')
                this.consolidateModifier('*')
                this.option_d.set(eYo.Key.NONE)
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
            block && block.eyo.data.alias.set(newValue)
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
    .btn .eyo-info-primary-option {
      padding-right: 0.75rem;
    }
    .dropdown-item.eyo-info-primary-option {
      padding-right: 0.5rem;
    }
    .eyo-form-input-text {
      text-align: left;
      width:8rem;
    }
    .btn-outline-secondary.eyo-form-input-text:hover {
      background: white;
      color: black;
    }
  </style>
    