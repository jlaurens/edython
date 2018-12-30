<template>
  <b-btn-group id="block-assert" key-nav  aria-label="Block assertion">
    <div
      class="item text eyo-code-reserved"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
      >except</div>
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
      :title="$$t('block.assert.expression')"
      v-tippy
      :style="{fontFamily: $$.eYo.Font.familyMono}"
        ></b-form-input>
    <div class="item">
        <input  type="checkbox"
                aria-label="Checkbox to activate the expression2 field"
                v-model="showExpression2" >
    </div>
    <div
      v-if="eyo.expression2_t"
      :class="`item${showExpression2? ' text' : ''}`"
      v-html="slotholder('eyo-slotholder-inline')"
      ></div>
    <b-form-input
    v-else
      v-model="expression2"
      type="text"
      :class="$$class(expression2, {no_text: !showExpression2})"
      :placeholder="$$t('block.placeholder.expression')"
      :title="$$t('block.assert.expression2')"
      v-tippy
      :style="{fontFamily: $$.eYo.Font.familyMono}"
      ></b-form-input>
  </b-btn-group>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    name: 'info-decorator',
    data: function () {
      return {
        saved_step: undefined,
        expression_: undefined,
        expression2_: undefined,
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
      showExpression2: {
        get () {
          return this.variant === eYo.Key.BINARY
        },
        set (newValue) {
          this.variant = newValue ? eYo.Key.BINARY : eYo.Key.UNARY
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
      expression2: {
        get () {
          this.$$synchronize(this.step)
          return this.expression2_
        },
        set (newValue) {
          this.eyo.expression2_p = newValue
        }
      },
      ...mapGetters('Selected', [
        'eyo',
        'step'
      ])
    },
    methods: {
      $$doSynchronize (eyo) {
        this.variant_ = eyo.variant_p
        this.expression_ = eyo.expression_p
        this.expression2_ = eyo.expression2_p
      },
      $$class (key, kwargs) {
        var text_class = kwargs && kwargs.no_text ? '' : ' text'
        var ph_class = key.length ? '' : ' placeholder'
        var wd_class = kwargs && goog.isNumber(kwargs.width) ? ` w-${kwargs.width}rem` : ' w-10rem'
        return `eyo-code and item${text_class}${ph_class}${wd_class}`
      }
    }
  }
</script>
<style>
</style>
