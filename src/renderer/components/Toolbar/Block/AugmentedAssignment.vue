<template>
  <b-btn-group id="block-augmented-assignment">
    <b-input v-model="name" type="text" :class="$$class" :style='{fontFamily: $$.eYo.Font.familyMono}' :placeholder="$$t('block.placeholder.name')"></b-input>
      <b-dropdown class="item text mw-4rem" variant="outline-secondary" :text="operator">
      <b-dropdown-item-button v-for="item in operatorsA" v-on:click="operator = item" :key="item" class="block-binary-operator eyo-code" v-html="item">
      </b-dropdown-item-button>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item-button v-for="item in operatorsB" v-on:click="operator = item" :key="item" class="eyo-code" v-html="item">
      </b-dropdown-item-button>          
    </b-dropdown>    
  </b-btn-group>
</template>

<script>
  export default {
    name: 'info-augmented-assignment',
    data: function () {
      return {
        saved_step: undefined,
        name_: undefined,
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
      $$class: {
        get () {
          return `eyo-code and item text${this.name.length ? '' : ' placeholder'}`
        }
      },
      name: {
        get () {
          (this.step_ === this.step) || this.$$synchronize()
          return this.name_
        },
        set (newValue) {
          this.eyo.name_p = newValue
        }
      },
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
      this.operators.num = this.eyo.numberOperator_d.getAll()
      this.operators.bin = this.eyo.bitwiseOperator_d.getAll()
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
        this.name_ = this.eyo.name_p
        this.operator_ = this.eyo.operator_p
      }
    }
  }
</script>
<style>
</style>
  
