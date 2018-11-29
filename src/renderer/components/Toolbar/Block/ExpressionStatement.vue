<template>
  <b-btn-group id='block-stmt-expression' v-if="canShow">
    <div class="item" v-if="canCheck">
      <input type="checkbox" id="block-stmt-expression-check" v-model="hasExpression" :disabled="noCheck">
    </div>
    <div class="item text" v-if="withSlotholder" v_html="slot"></div>
    <b-input v-else v-model="expression" type="text" :disabled="!hasExpression" :class="$$class"></b-input>
  </b-btn-group>
</template>

<script>
  import {mapState} from 'vuex'

  export default {
    name: 'block-stmt-expression',
    data: function () {
      return {
        saved_step: 0,
        saved_eyo: undefined,
        variant_: undefined,
        commentVariant_: undefined,
        expression_: undefined,
        withSlotholder_: undefined
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
        default: (item) => {
          return item
        }
      }
    },
    computed: {
      $$class () {
        (this.saved_step === this.step) || this.$$synchronize()
        return `eyo-code item${this.hasExpression ? ' text' : ''} w-16rem`
      },
      commentVariant () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.commentVariant_ === eYo.Key.NONE
      },
      noCheck () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.commentVariant_ === eYo.Key.NONE
      },
      canExpression () {
        (this.saved_step === this.step) || this.$$synchronize()
        return !this.eyo.expression_s.targetBlock()
      },
      hasExpression: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.variant === eYo.Key.EXPRESSION
        },
        set (newValue) {
          this.hasExpression_ = newValue
          this.eyo.variant_p = newValue
            ? eYo.Key.EXPRESSION
            : eYo.Key.NONE
        }
      },
      variant () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.variant_
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
      slot () {
        return this.slotholder('eyo-slotholder')
      },
      withSlotholder () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.withSlotholder_
      },
      canShow () {
        return this.canCheck || this.hasExpression
      },
      canCheck () {
        return (this.selectedMode !== eYo.App.TUTORIAL) && (this.selectedMode !== eYo.App.BASIC)
      },
      ...mapState({
        selectedMode: state => state.UI.selectedMode
      })
    },
    created () {
      this.$$synchronize()
    },
    beforeUpdate () {
      (this.saved_step === this.step) || this.$$synchronize()
    },
    methods: {
      $$synchronize () {
        if (!this.eyo || (this.saved_step === this.step)) {
          return
        }
        this.saved_eyo = this.eyo
        this.saved_step = this.step
        this.expression_ = this.eyo.expression_p
        this.withSlotholder_ = !!this.eyo.expression_s.targetBlock()
        this.commentVariant_ = this.eyo.commentVariant_p
        this.variant_ = this.eyo.variant_p
      }
    }
  }
</script>
<style>
</style>
