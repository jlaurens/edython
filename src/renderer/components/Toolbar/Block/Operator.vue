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
        step_: undefined
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
      }
    },
    computed: {
      unary () {
        return this.eyo.block_.type === eYo.T3.Expr.u_expr
      },
      operator: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
          return this.operator_d
        },
        set (newValue) {
          this.eyo.operator_p = newValue
        }
      },
      operators () {
        return this.eyo.operator_d.getAll()
      }
    },
    created () {
      this.synchronize()
    },
    updated () {
      this.synchronize()
    },
    methods: {
      synchronize () {
        this.step_ = this.eyo.change.step
        this.operator_ = this.eyo.operator_p
      }
    }
  }
</script>
<style scoped>
  .info-operator {
    padding-right:1rem;
  }
</style>
