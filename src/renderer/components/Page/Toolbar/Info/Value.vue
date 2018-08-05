<template>
  <b-dropdown id="info-value" class="eyo-dropdown" v-if="values && values.length">
    <template slot="button-content" ><span class="info-value">{{value}}</span></template>
    <b-dropdown-item-button v-for="item in values" v-on:click="value = item" v-bind:style="{fontFamily: $$.eYo.Font.familySans}" :key="item">{{item}}</b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-value',
    data: function () {
      return {
      }
    },
    props: {
      selectedBlock: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      unary () {
        return this.selectedBlock.type === this.$$.eYo.T3.Expr.u_expr
      },
      value_d () {
        var block = this.selectedBlock
        return block && block.eyo.data.value
      },
      value: {
        get () {
          var value_d = this.value_d
          return value_d
            ? value_d.get()
            : 'Value'
        },
        set (newValue) {
          var value_d = this.value_d
          if (value_d) {
            value_d.set(newValue)
          }
        }
      },
      values () {
        var value_d = this.value_d
        return value_d && value_d.model.all
      }
    }
  }
</script>
<style scoped>
  .info-value {
    padding-right:1rem;
  }
</style>
