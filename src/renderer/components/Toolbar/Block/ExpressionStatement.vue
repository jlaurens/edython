<template>
  <b-btn-group
    v-if="canShow"
    id='block-stmt-expression'>
    <div
      v-if="canCheck"
      class="item">
      <input
        type="checkbox"
        id="block-stmt-expression-check"
        v-model="hasExpression"
        :disabled="noCheck">
    </div>
    <div
      v-if="withSlotholder"
      class="item text"
      v_html="slot"></div>
    <b-input
      v-else
      v-model="expression"
      type="text"
      :disabled="!hasExpression"
      :class="$$class"></b-input>
  </b-btn-group>
</template>

<script>
  import {mapState} from 'vuex'

  export default {
    name: 'block-stmt-expression',
    data: function () {
      return {
        saved_step: 0,
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
        this.$$synchronize(this.step)
        return `eyo-code item${this.hasExpression ? ' text' : ''} w-16rem`
      },
      commentVariant () {
        this.$$synchronize(this.step)
        return this.commentVariant_ === eYo.Key.NONE
      },
      noCheck () {
        this.$$synchronize(this.step)
        return this.commentVariant_ === eYo.Key.NONE
      },
      canExpression () {
        this.$$synchronize(this.step)
        return !this.eyo.expression_s.targetBlock()
      },
      hasExpression: {
        get () {
          this.$$synchronize(this.step)
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
        this.$$synchronize(this.step)
        return this.variant_
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
      slot () {
        return this.slotholder('eyo-slotholder')
      },
      withSlotholder () {
        this.$$synchronize(this.step)
        return this.withSlotholder_
      },
      canShow () {
        return this.canCheck || this.hasExpression
      },
      canCheck () {
        return (this.selectedMode !== eYo.App.TUTORIAL) && (this.selectedMode !== eYo.App.BASIC)
      },
      ...mapState('UI', {
        selectedMode: state => state.selectedMode
      })
    },
    created () {
      this.$$synchronize(this.step)
    },
    beforeUpdate () {
      this.$$synchronize(this.step)
    },
    methods: {
      $$doSynchronize (eyo) {
        this.expression_ = eyo.expression_p
        this.withSlotholder_ = !!eyo.expression_t
        this.commentVariant_ = eyo.commentVariant_p
        this.variant_ = eyo.variant_p
      }
    }
  }
</script>
<style>
</style>
