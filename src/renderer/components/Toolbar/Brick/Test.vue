<template>
  <b-btn-group>
    <div
      v-if="eyo.lhs_t"
      class="item text"
      v-html="slotholder('eyo-slotholder-inline')"
    />
    <b-input
      v-else
      v-model="lhs"
      type="text"
      :class="$$class(lhs)"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
      :placeholder="$$t('brick.placeholder.condition')"
    />
    <b-dd
      id="brick-test-operator"
      class="eyo-code eyo-code-reserved item text mw-4rem"
      variant="outline-secondary"
      :text="operator"
    >
      <b-dd-item-button
        v-for="item in operators"
        :key="item"
        class="brick-compare-operator eyo-code"
        @click="operator = item"
      >
        {{ item }}
      </b-dd-item-button>        
    </b-dd>
    <div
      v-if="eyo.rhs_t"
      class="item text"
      v-html="slotholder('eyo-slotholder-inline')"
    />
    <b-input
      v-else
      v-model="rhs"
      type="text"
      :class="$$class(rhs)"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
      :placeholder="$$t('brick.placeholder.condition')"
    />
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
    name: 'InfoCompareOperator',
    props: {
        slotholder: {
            type: Function,
            default: function (item) {
                return item
            }
        }
    },
    data: function () {
        return {
            saved_step: undefined,
            lhs_: undefined,
            rhs_: undefined,
            operator_: '?',
            operators: ['or', 'and']
        }
    },
    computed: {
        ...mapState('Selected', [
            'step'
        ]),
        ...mapGetters('Selected', [
            'eyo'
        ]),
        lhs: {
            get () {
                this.$$synchronize(this.step)
                return this.lhs_
            },
            set (newValue) {
                this.eyo.lhs_p = newValue
            }
        },
        rhs: {
            get () {
                this.$$synchronize(this.step)
                return this.rhs_
            },
            set (newValue) {
                this.eyo.rhs_p = newValue
            }
        },
        operator: {
            get () {
                this.$$synchronize(this.step)
                return this.operator_
            },
            set (newValue) {
                this.eyo.operator_p = newValue
            }
        }
    },
    methods: {
        $$doSynchronize (eyo) {
            this.operator_ = eyo.operator_p
            this.lhs_ = eyo.lhs_p
            this.rhs_ = eyo.rhs_p
        },
        $$class (key) {
            return `eyo-code and item text${key.length ? '' : ' placeholder'}`
        }
    }
}
</script>
<style>
  .brick-test-operator {
    padding-right: 0.75rem;
  }
</style>
  
