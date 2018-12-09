<template>
  <b-btn-group
    id="block-raise"
    key-nav 
    aria-label="Block exception raise"
    >
    <div
      class="item text eyo-code-reserved"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
      >raise</div>
    <div
      class="item">
      <input
        type="checkbox"
        aria-label="Checkbox to activate the expression field"
        v-model="showExpression" >
    </div>
    <b-btn-group
      :class="showExpression ? '' : 'disabled'">
      <div
        v-if="eyo.expression_t"
        class="item text"
        v-html="slotholder('eyo-slotholder-inline')"
        ></div>
      <b-form-input
        v-else
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
      <input
        type="checkbox"
        aria-label="Checkbox to activate the from field"
        v-model="showFrom"
        :disabled="!showExpression">
    </div>
    <b-btn-group
      :class="showFrom && showExpression ? '' : 'disabled'">
      <div
        class="item text eyo-code-reserved"
        :style="{fontFamily: $$.eYo.Font.familyMono}"
        >from</div>
      <div
        v-if="eyo.from_t"
        class="item text"
        v-html="slotholder('eyo-slotholder-inline')"
        ></div>
      <b-form-input
        v-else
        v-model="from"
        type="text"
        :class="$$class(from)"
        :style="{fontFamily: $$.eYo.Font.familyMono}"
        :placeholder="$$t('block.placeholder.expression')"
        :title="$$t('block.except.expression')"
        v-tippy
        ></b-form-input>
    </b-btn-group>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'info-raise',
    data: function () {
      return {
        saved_step: undefined,
        expression_: undefined,
        from_: undefined,
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
      showExpression: {
        get () {
          return this.variant !== eYo.Key.NONE
        },
        set (newValue) {
          if (newValue) {
            if (this.variant !== eYo.Key.FROM) {
              this.variant = eYo.Key.EXPRESSION
            }
          } else {
            this.variant = eYo.Key.NONE
          }
        }
      },
      showFrom: {
        get () {
          return this.variant === eYo.Key.FROM
        },
        set (newValue) {
          this.variant = newValue ? eYo.Key.FROM : eYo.Key.EXPRESSION
        }
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
      expression: {
        get () {
          this.$$synchronize(this.step)
          return this.expression_
        },
        set (newValue) {
          this.eyo.expression_p = newValue
        }
      },
      from: {
        get () {
          this.$$synchronize(this.step)
          return this.from_
        },
        set (newValue) {
          this.eyo.from_p = newValue
        }
      }
    },
    methods: {
      $$doSynchronize (eyo) {
        this.variant_ = eyo.variant_p
        this.expression_ = eyo.expression_p
        this.from_ = eyo.from_p
      },
      $$class (key) {
        return `eyo-code and item text${key.length ? '' : ' placeholder'} w-10rem`
      }
    }
  }
</script>
<style>
</style>
