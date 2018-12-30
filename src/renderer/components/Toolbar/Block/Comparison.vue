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
      :placeholder="$$t(isNum ? 'block.placeholder.number' : 'block.placeholder.element')"></b-input>
    <b-dd
      id="block-compare-operator"
      class="eyo-code eyo-code-reserved item text mw-8rem"
      variant="outline-secondary"
      :text="operator">
      <b-dd-item-button
        v-for="item in operatorsA"
        v-on:click="operator = item"
        :key="item"
        class="block-compare-operator eyo-code"
        >{{item}}</b-dd-item-button> 
      </b-dd-item-button>
      <b-dd-divider></b-dd-divider>
      <b-dd-item-button
        v-for="item in operatorsB"
        v-on:click="operator = item"
        :key="item"
        class="block-compare-operator eyo-code"
        >{{item}}</b-dd-item-button>          
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
      :placeholder="$$t(isNum ? 'block.placeholder.number' : 'block.placeholder.container')"></b-input>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'info-compare-operator',
    data: function () {
      return {
        saved_step: undefined,
        lhs_: undefined,
        rhs_: undefined,
        operator_: '?',
        operators: {
          num: ['<', '>', '==', '>=', '<=', '!='],
          obj: ['is', 'is not', 'in', 'not in']
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
      },
      operatorsA () {
        return this.isNum
          ? this.operators.num
          : this.operators.obj
      },
      operatorsB () {
        return this.isNum
          ? this.operators.obj
          : this.operators.num
      },
      isNum () {
        return this.operators.num.indexOf(this.operator) >= 0
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
  .info-compare-operator {
    padding-right: 0.75rem;
  }
</style>
  
