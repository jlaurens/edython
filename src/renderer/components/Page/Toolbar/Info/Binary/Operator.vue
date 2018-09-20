<template>
  <b-dropdown id="info-binary-operator" class="eyo-dropdown" variant="outline-secondary">
    <template slot="button-content"><span class="info-binary-operator eyo-code eyo-content" v-html="formatter(operator)"></span></template>
    <b-dropdown-item-button v-for="item in operatorsA" v-on:click="operator = item" :key="item" class="info-binary-operator eyo-code" v-html="formatter(item)">
    </b-dropdown-item-button>
    <b-dropdown-divider></b-dropdown-divider>
    <b-dropdown-item-button v-for="item in operatorsB" v-on:click="operator = item" :key="item" class="info-binary-operator eyo-code" v-html="formatter(item)">
    </b-dropdown-item-button>            
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-binary-operator',
    data: function () {
      return {
        operator_: '?',
        operators: {
          num: ['+', '-', '*', '/', '//', '%', '**', '@'],
          bin: ['<<', '>>', '&', '^', '|']
        }
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      slotholder: {
        type: Function,
        default: function (item) {
          return item
        }
      },
      formatter: {
        type: Function,
        default: function (item) {
          return item.length ? this.my_slot + '<div class="eyo-info-primary-variant2">' + item + '</div>' + this.my_slot : '&nbsp;'
        }
      }
    },
    computed: {
      operator: {
        get () {
          return this.operator_
        },
        set (newValue) {
          this.operator_ = newValue
          this.eyo.operator_p = newValue
        }
      },
      operatorsA () {
        return this.operators.bin.indexOf(this.operator) >= 0
          ? this.operators.bin
          : this.operators.num
      },
      operatorsB () {
        return this.operators.bin.indexOf(this.operator) >= 0
          ? this.operators.num
          : this.operators.bin
      },
      my_slot () {
        return this.slotholder('eyo-info-primary-variant1')
      }
    },
    created () {
      this.operator_ = this.eyo.operator_p
    }
  }
</script>
<style>
  .info-binary-operator {
    padding-right: 0.75rem;
  }
</style>
  