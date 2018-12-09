<template>
  <b-dd id="block-operator" class="eyo-dropdown" v-if="operators.length">
    <template slot="button-content" ><span class="block-operator">{{formatter(operator)}}</span></template>
    <b-dd-item-button v-for="item in operators" v-on:click="operator = item" v-bind:style="{fontFamily: $$.eYo.Font.familySans}" :key="item">{{formatter(item)}}</b-dd-item-button>
  </b-dd>
</template>

<script>
  export default {
    name: 'info-operator',
    data: function () {
      return {
        saved_step: undefined
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
      formatter: {
        type: Function,
        default: function (item) {
          return this.unary ? item + '…' : '…' + item + '…'
        }
      }
    },
    computed: {
      unary () {
        return this.eyo.block_.type === eYo.T3.Expr.u_expr
      },
      operator: {
        get () {
          this.$$synchronize(this.step)
          return this.operator_d
        },
        set (newValue) {
          this.eyo.operator_p = newValue
        }
      },
      operators () {
        return (this.eyo.operator_d && this.eyo.operator_d.getAll()) || []
      }
    },
    methods: {
      $$doSynchronize (eyo) {
        this.operator_ = eyo.operator_p
      }
    }
  }
</script>
<style scoped>
  .info-operator {
    padding-right:1rem;
  }
</style>
