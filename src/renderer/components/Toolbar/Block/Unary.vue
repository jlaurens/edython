<template>
    <b-dropdown id="block-unary-operator" class="eyo-dropdown item text  eyo-with-slot-holder" variant="outline-secondary">
      <template slot="button-content"><span class="eyo-code eyo-content text" v-html="formatter(operator)"></span></template>
      <b-dropdown-item-button v-for="item in operators" v-on:click="operator = item" :key="item" class="block-unary-operator eyo-code" v-html="formatter(item)"></b-dropdown-item-button>
      </b-dropdown-item-button>
    </b-dropdown>
  </template>
  
  <script>
    export default {
      name: 'info-unary-operator',
      data () {
        return {
          saved_step: undefined,
          operator_: 0
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
            return item.length ? `<span>${item}</span>${this.slot}` : '&nbsp;'
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
        operators () {
          return this.eyo.operator_d.getAll()
        },
        slot () {
          return this.slotholder('eyo-slot-holder')
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
  </style>
    
  