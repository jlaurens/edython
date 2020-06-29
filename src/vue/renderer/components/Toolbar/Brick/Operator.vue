<template>
  <b-dd
    v-if="operators.length"
    id="brick-operator"
    class="eyo-dropdown"
  >
    <template
      slot="button-content"
    >
      <span
        class="brick-operator"
      >{{ formatter(operator) }}</span>
    </template>
    <b-dd-item-button
      v-for="item in operators"
      :key="item"
      :style="{fontFamily: $$.eYo.Font.familySans}"
      @click="operator = item"
    >
      {{ formatter(item) }}
    </b-dd-item-button>
  </b-dd>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'InfoOperator',
  props: {
    formatter: {
      type: Function,
      default: function (item) {
        return this.unary ? item + '…' : '…' + item + '…'
      }
    }
  },
  data () {
    return {
      saved_step: undefined
    }
  },
  computed: {
    ...mapState('Selected', [
      'step'
    ]),
    ...mapGetters('Selected', [
      'eyo'
    ]),
    unary () {
      return this.type === eYo.T3.Expr.u_expr
    },
    operator: {
      get () {
        this.$$synchronize(this.step)
        return this.operator_
      },
      set (newValue) {
        this.operator_p = newValue
      }
    },
    operators () {
      return (this.operator_d && this.operator_d.getAll()) || []
    }
  },
  methods: {
    $$doSynchronize (brick) {
      this.operator_ = brick.operator
    }
  }
}
</script>
<style scoped>
  .info-operator {
    padding-right:1rem;
  }
</style>
