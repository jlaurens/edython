<template>
  <b-btn-group id="block-except" key-nav  aria-label="Block exception">
    <div class="item text eyo-code-reserved" :style="{fontFamily: $$.eYo.Font.familyMono}">except</div>
    <div class="item">
        <input  type="checkbox"
                aria-label="Checkbox to activate the error field"
                v-model="showError" >
    </div>
    <b-btn-group :class="showError ? '' : 'disabled'">
      <div v-if="eyo.expression_t" class="item text" v-html="slotholder('eyo-slotholder-inline')"></div>
      <b-form-input v-else
        v-model="expression"
        type="text"
        :class="$$class(expression)"
        :placeholder="$$t('block.placeholder.expression')"
        :title="$$t('block.except.expression')"
        v-tippy
        :style="{fontFamily: $$.eYo.Font.familyMono}"
          ></b-form-input>
    </b-btn-group>
    <div class="item">
      <input  type="checkbox"
              aria-label="Checkbox to activate the alias field"
              v-model="showAlias"
              :disabled="!showError">
    </div>
    <b-btn-group :class="showAlias && showError ? '' : 'disabled'">
      <div  class="item text eyo-code-reserved"
            :style="{fontFamily: $$.eYo.Font.familyMono}" >as</div>
      <div v-if="eyo.alias_t" class="item text" v-html="slotholder('eyo-slotholder-inline')"></div>
      <b-form-input v-else
              v-model="alias"
              type="text"
              :class="$$class(alias)"
              :style="{fontFamily: $$.eYo.Font.familyMono}"
              :placeholder="$$t('block.placeholder.alias')"
              :title="$$t('block.except.alias')"
              v-tippy ></b-form-input>
    </b-btn-group>
  </b-btn-group>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  export default {
    name: 'info-decorator',
    data: function () {
      return {
        saved_step: undefined,
        expression_: undefined,
        alias_: undefined,
        variant_: undefined
      }
    },
    props: {
      slotholder: {
        type: Function,
        default: function (item) {
          return item
        }
      }
    },
    computed: {
      ...mapState('Selected', [
        'step'
      ]),
      ...mapGetters('Selected', [
        'eyo'
      ]),
      showError: {
        get () {
          return this.variant !== eYo.Key.NONE
        },
        set (newValue) {
          if (newValue) {
            if (this.variant !== eYo.Key.ALIASED) {
              this.variant = eYo.Key.EXPRESSION
            }
          } else {
            this.variant = eYo.Key.NONE
          }
        }
      },
      showAlias: {
        get () {
          return this.variant === eYo.Key.ALIASED
        },
        set (newValue) {
          this.variant = newValue ? eYo.Key.ALIASED : eYo.Key.EXPRESSION
        }
      },
      classAlias () {
        return `eyo-code and item${this.showAlias ? ' text' : ''} w-10rem`
      },
      variant: {
        get () {
          this.$$synchronize(this.step)
          return this.variant_
        },
        set (newValue) {
          this.eyo.variant_p = newValue
        }
      },
      can_expression () {
        return this.variant !== eYo.Key.NONE && !this.eyo.expression_t
      },
      expression: {
        get () {
          this.$$synchronize(this.step)
          return this.expression_
        },
        set (newValue) {
          this.eyo.expression_p = newValue
        }
      },
      can_alias () {
        return this.variant === eYo.Key.ALIASED && !this.eyo.alias_s.targetBlock()
      },
      alias: {
        get () {
          this.$$synchronize(this.step)
          return this.alias_
        },
        set (newValue) {
          this.eyo.alias_p = newValue
        }
      }
    },
    methods: {
      content (choice) {
        if (choice === eYo.Key.NONE) {
          return 'except:'
        } else if (choice === eYo.Key.EXPRESSION) {
          return 'except …:'
        } else /* if (choice === eYo.Key.ALIASED) */ {
          return 'except … as …:'
        }
      },
      choose (choice) {
        this.eyo.variant_p = choice
      },
      $$doSynchronize (eyo) {
        this.variant_ = eyo.variant_p
        this.expression_ = eyo.expression_p
        this.alias_ = eyo.alias_p
      },
      $$class (key) {
        return `eyo-code and item text${key.length ? '' : ' placeholder'} w-10rem`
      }
    }
  }
</script>
<style>
</style>
