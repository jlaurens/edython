<template>
  <b-dropdown id="block-unary-operator" class="eyo-dropdown" variant="outline-secondary">
    <template slot="button-content"><span class="block-unary-operator eyo-code eyo-content" v-html="formatter(operator)"></span></template>
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
          return item.length ? '<div>' + item + '</div>' + this.my_slot : '&nbsp;'
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
        return this.eyo.data.operator.getAll()
      },
      my_slot () {
        return this.slotholder('eyo-slot-holder')
      }
    },
    created () {
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
  .info-unary-operator {
    padding-right: 0.75rem;
  }
</style>
  
