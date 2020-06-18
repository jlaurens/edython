<template>
  <b-btn-group
    v-if="canShow"
    id="brick-stmt-expression"
  >
    <div
      v-if="canCheck"
      class="item"
    >
      <input
        id="brick-stmt-expression-check"
        v-model="hasExpression"
        type="checkbox"
        :disabled="noCheck"
      >
    </div>
    <div
      v-if="withSlotholder"
      class="item text"
      v_html="slot"
    />
    <b-input
      v-else
      v-model="expression"
      type="text"
      :disabled="!hasExpression"
      :class="$$class"
    />
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
    name: 'BrickStmtExpression',
    props: {
        slotholder: {
            type: Function,
            default: (item) => {
                return item
            }
        }
    },
    data: function () {
        return {
            saved_step: 0,
            variant_: undefined,
            commentVariant_: undefined,
            expression_: undefined,
            withSlotholder_: undefined
        }
    },
    computed: {
        ...mapState('Selected', [
            'step'
        ]),
        ...mapGetters('Selected', [
            'eyo'
        ]),
        ...mapState('UI', {
            selectedMode: state => state.selectedMode
        }),
        $$class () {
            this.$$synchronize(this.step)
            return `eyo-code item${this.hasExpression ? ' text' : ''} w-24rem`
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
        }
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
