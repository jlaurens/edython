<template>
  <b-btn-group>
    <div
      v-if="eyo.lhs_t"
      class="item text"
      v-html="slotholder('eyo-slotholder-inline')"></div>
    <b-input
      v-else
      v-model="lhs"
      type="text"
      :class="$$class(lhs)"
      :style='{fontFamily: $$.eYo.Font.familyMono}'
      :placeholder="$$t('block.placeholder.condition')"></b-input>
    <b-dd
      id="block-test-operator"
      class="eyo-code eyo-code-reserved item text mw-4rem"
      variant="outline-secondary"
      :text="operator">
      <b-dd-item-button
        v-for="item in operators"
        v-on:click="operator = item"
        :key="item"
        class="block-compare-operator eyo-code"
        >{{item}}</b-dd-item-button> 
      </b-dd-item-button>         
    </b-dd>
    <div
      v-if="eyo.rhs_t"
      class="item text"
      v-html="slotholder('eyo-slotholder-inline')"></div>
    <b-input
      v-else
      v-model="rhs"
      type="text"
      :class="$$class(rhs)"
      :style='{fontFamily: $$.eYo.Font.familyMono}'
      :placeholder="$$t('block.placeholder.condition')"></b-input>
  </b-btn-group>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    name: 'info-compare-operator',
    data: function () {
      return {
        saved_step: undefined,
        lhs_: undefined,
        rhs_: undefined,
        operator_: '?',
        operators: ['or', 'and']
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
      ...mapGetters('Selected', [
        'eyo',
        'step'
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
      }
    },
    methods: {
      $$doSynchronize (eyo) {
        this.operator_ = eyo.operator_p
        this.lhs_ = eyo.lhs_p
        this.rhs_ = eyo.rhs_p
      },
      $$class (key) {
        return `eyo-code and item text${key.length ? '' : ' placeholder'}`
      }
    }
  }
</script>
<style>
  .block-test-operator {
    padding-right: 0.75rem;
  }
</style>
  
