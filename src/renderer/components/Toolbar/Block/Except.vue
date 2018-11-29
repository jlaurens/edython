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
                  class="eyo-code and item text w-10rem"
                  :title="$$t('block.except.expression')"
                  v-tippy
                  :style="{fontFamily: $$.eYo.Font.familyMono}"></b-form-input>
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
              class="eyo-code and item text w-10rem"
              :style="{fontFamily: $$.eYo.Font.familyMono}"
              :title="$$t('block.except.alias')"
              v-tippy ></b-form-input>
    </b-btn-group>
  </b-btn-group>
</template>

<script>
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
          (this.saved_step === this.step) || this.$$synchronize()
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
          (this.saved_step === this.step) || this.$$synchronize()
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
          (this.saved_step === this.step) || this.$$synchronize()
          return this.alias_
        },
        set (newValue) {
          this.eyo.alias_p = newValue
        }
      }
    },
    created () {
      this.$$synchronize()
    },
    beforeUpdate () {
      (this.saved_step === this.step) || this.$$synchronize()
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
      $$synchronize () {
        var eyo = this.eyo
        if (!eyo || (this.saved_step === this.step)) {
          return
        }
        this.saved_step = this.step
        this.variant_ = eyo.variant_p
        this.expression_ = eyo.expression_p
        this.alias_ = eyo.alias_p
      }
    }
  }
</script>
<style>
</style>
