<template>
  <b-btn-group id="block-unary-operator">
    <b-dd
      class="eyo-dropdown item text"
      variant="outline-secondary"
      :text="operator">
      <b-dd-item-button v-for="item in operators" v-on:click="operator = item" :key="item" class="block-unary-operator eyo-code" v-html="item"></b-dd-item-button>
      </b-dd-item-button>
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
  export default {
    name: 'info-unary-operator',
    data () {
      return {
        saved_step: undefined,
        operator_: 0,
        rhs_: undefined
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
      operators () {
        return this.eyo.operator_d.getAll()
      },
      slot () {
        return this.slotholder('eyo-slotholder')
      }
    },
    methods: {
      $$doSynchronize (eyo) {
        this.operator_ = eyo.operator_p
        this.rhs_ = eyo.rhs_p
      },
      $$class (key) {
        return `eyo-code and item text${key.length ? '' : ' placeholder'}`
      }
    }
  }
</script>
<style>
</style>
  
