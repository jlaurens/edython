<template>
  <b-btn-group id="brick-augmented-assignment">
    <b-input
      v-if="!eyo.name_t"
      v-model="name"
      type="text"
      :class="$$class"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
      :placeholder="$$t('brick.placeholder.name')"
    />
    <div
      v-else
      class="item text"
      v-html="slotholder('eyo-slotholder-inline')"
    />
    <b-dd
      class="item text mw-4rem"
      variant="outline-secondary"
      :text="operator"
    >
      <b-dd-item-button
        v-for="item in operatorsA"
        :key="item"
        class="brick-binary-operator eyo-code"
        @click="operator = item"
        v-html="item"
      />
      <b-dd-divider />
      <b-dd-item-button
        v-for="item in operatorsB"
        :key="item"
        class="brick-binary-operator eyo-code"
        @click="operator = item"
        v-html="item"
      />          
    </b-dd>
    <div
      class="item text"
      v-html="slotholder('eyo-slotholder-inline')"
    />
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'InfoAugmentedAssignment',
  props: {
    slotholder: {
      type: Function,
      default: null
    }
  },
  data: function () {
    return {
      saved_step: undefined,
      name_: undefined,
      operator_: '?',
      operators: {}
    }
  },
  computed: {
    ...mapState('Selected', [
      'step'
    ]),
    ...mapGetters('Selected', [
      'eyo'
    ]),
    $$class: {
      get () {
        return `eyo-code and item text${this.name && this.name.length ? '' : ' placeholder'}`
      }
    },
    name: {
      get () {
        this.$$synchronize(this.step)
        return this.name_
      },
      set (newValue) {
        this.eyo.name_p = newValue
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
  created () {
    this.operators.num = this.eyo.numberOperator_d.getAll()
    this.operators.bin = this.eyo.bitwiseOperator_d.getAll()
  },
  methods: {
    $$doSynchronize (eyo) {
      this.name_ = eyo.name_p
      this.operator_ = eyo.operator_p
    }
  }
}
</script>
<style>
</style>
  
