<template>
  <b-dropdown id="info-operator" class="eyo-dropdown" v-if="operators.length">
    <template slot="button-content" ><span class="info-operator">{{formatter(operator)}}</span></template>
    <b-dropdown-item-button v-for="item in operators" v-on:click="operator = item" v-bind:style="{fontFamily: $$.eYo.Font.familySans}" :key="item">{{formatter(item)}}</b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-operator',
    data: function () {
      return {
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      formatter: {
        type: Function,
        default: function (item) {
          return this.unary ? item + '…' : '…' + item + '…'
        }
      },
      dataKey: {
        type: String,
        default: 'operator'
      }
    },
    computed: {
      unary () {
        return this.eyo.block_.type === this.$$.eYo.T3.Expr.u_expr
      },
      operator_d () {
        return this.eyo.data[this.dataKey]
      },
      operator: {
        get () {
          var operator_d = this.operator_d
          return operator_d
            ? operator_d.get()
            : 'Operator'
        },
        set (newValue) {
          var operator_d = this.operator_d
          if (operator_d) {
            operator_d.set(newValue)
          }
        }
      },
      operators () {
        var operator_d = this.operator_d
        return operator_d
          ? operator_d.model.all
          : []
      }
    }
  }
</script>
<style scoped>
  .info-operator {
    padding-right:1rem;
  }
</style>
