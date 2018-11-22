<template>
  <b-dropdown id="block-binary-operator" class="eyo-dropdown" variant="outline-secondary">
    <template slot="button-content"><span class="block-binary-operator eyo-code eyo-content" v-html="operator"></span></template>
    <b-dropdown-item-button v-for="item in operatorsA" v-on:click="operator = item" :key="item" class="block-binary-operator eyo-code" v-html="item">
    </b-dropdown-item-button>
    <b-dropdown-divider></b-dropdown-divider>
    <b-dropdown-item-button v-for="item in operatorsB" v-on:click="operator = item" :key="item" class="block-binary-operator eyo-code" v-html="item">
    </b-dropdown-item-button>            
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-binary-operator',
    data: function () {
      return {
        saved_step: undefined,
        operator_: '?',
        operators: {}
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
        default: function (item) {
          return item
        }
      }
    },
    computed: {
      operator: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.operator_
        },
        set (newValue) {
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
        return this.slotholder('eyo-slot-holder')
      }
    },
    created () {
      this.operators.num = this.eyo.data.numberOperator.getAll()
      this.operators.bin = this.eyo.data.bitwiseOperator.getAll()
      this.$$synchronize()
    },
    updated () {
      this.$$synchronize()
    },
    methods: {
      $$synchronize () {
        if (!this.eyo) {
          return
        }
        this.saved_step = this.eyo.change.step
        this.operator_ = this.eyo.operator_p
      }
    }
  }
</script>
<style>
  .info-binary-operator {
    padding-right: 1rem;
  }
</style>
  
