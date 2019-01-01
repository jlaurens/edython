<template>
  <b-btn-group>
    <b-input
      v-if="!eyo.lhs_t"
      v-model="lhs"
      type="text"
      :class="$$class(lhs)"
      :style='{fontFamily: $$.eYo.Font.familyMono}'
      :placeholder="$$t('block.placeholder.number')"></b-input>
    <div
      v-else class="item text"
      v-html="slotholder('eyo-slotholder-inline')"></div>
    <b-dd
      id="block-binary-operator"
      class="eyo-code item text mw-4rem block-binary-operator"
      variant="outline-secondary"
      :text="operator">
      <b-dd-item-button
        v-for="item in operatorsA"
        v-on:click="operator = item"
        :key="item"
        class="block-binary-operator eyo-code"
        >{{item}}</b-dd-item-button> 
      </b-dd-item-button>
      <b-dd-divider></b-dd-divider>
      <b-dd-item-button
        v-for="item in operatorsB"
        v-on:click="operator = item"
        :key="item"
        class="block-binary-operator eyo-code"
        >{{item}}</b-dd-item-button>          
    </b-dd>
    <b-input
      v-if="!eyo.rhs_t"
      v-model="rhs"
      type="text"
      :class="$$class(rhs)"
      :style='{fontFamily: $$.eYo.Font.familyMono}'
      :placeholder="$$t('block.placeholder.number')"></b-input>
    <div
      v-else class="item text"
      v-html="slotholder('eyo-slotholder-inline')"></div>
  </b-btn-group>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  export default {
    name: 'info-binary-operator',
    data: function () {
      return {
        saved_step: undefined,
        lhs_: undefined,
        rhs_: undefined,
        operator_: '?',
        operators: {
          num: ['+', '-', '*', '/', '//', '%', '**', '@'],
          bin: ['<<', '>>', '&', '^', '|']
        }
      }
    },
    props: {
      slotholder: {
        type: Function,
        default: function (item) {
          return item
        }
      }
    },
    computed: {
      ...mapState('Selected', [
        'step'
      ]),
      ...mapGetters('Selected', [
        'eyo'
      ]),
      lhs: {
        get () {
          this.$$synchronize(this.step)
          return this.lhs_
        },
        set (newValue) {
          this.eyo.lhs_p = newValue
        }
      },
      rhs: {
        get () {
          this.$$synchronize(this.step)
          return this.rhs_
        },
        set (newValue) {
          this.eyo.rhs_p = newValue
        }
      },
      operator: {
        get () {
          this.$$synchronize(this.step)
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
      }
    },
    methods: {
      $$doSynchronize (eyo) {
        this.operator_ = eyo.operator_p
        this.lhs_ = eyo.lhs_p
        this.rhs_ = eyo.rhs_p
      },
      $$class (key) {
        return `eyo-code and item text${key.toString().length ? '' : ' placeholder'}`
      }
    }
  }
</script>
<style>
  .block-binary-operator {
    text-align: center;
  }
</style>
  
