<template>
  <b-dd id="block-binary-operator" class="eyo-code item text eyo-with-slotholder mw-6rem" variant="outline-secondary">
    <template slot="button-content"><span class="block-binary-operator eyo-code eyo-content" v-html="formatter(operator)"></span></template>
    <b-dd-item-button v-for="item in operatorsA" v-on:click="operator = item" :key="item" class="block-binary-operator eyo-code" v-html="formatter(item)">
    </b-dd-item-button>
    <b-dd-divider></b-dd-divider>
    <b-dd-item-button v-for="item in operatorsB" v-on:click="operator = item" :key="item" class="block-binary-operator eyo-code" v-html="formatter(item)">
    </b-dd-item-button>            
  </b-dd>
</template>

<script>
  export default {
    name: 'info-binary-operator',
    data: function () {
      return {
        saved_step: undefined,
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
      step: {
        type: Number,
        default: 0
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
          return item.length ? `${this.my_slot}<span>${item}</span>${this.my_slot}` : '&nbsp;'
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
        return this.slotholder('eyo-slotholder')
      }
    },
    created () {
      this.$$synchronize()
    },
    beforeUpdate () {
      (this.saved_step === this.step) || this.$$synchronize()
    },
    methods: {
      $$synchronize () {
        if (!this.eyo || (this.saved_step === this.step)) {
          return
        }
        this.saved_step = this.step
        this.operator_ = this.eyo.operator_p
      }
    }
  }
</script>
<style>
  .info-binary-operator {
    padding-right: 0.75rem;
  }
</style>
  
