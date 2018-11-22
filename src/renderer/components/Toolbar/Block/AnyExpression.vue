<template>
  <b-btn-toolbar id="block-any-expression" key-nav  aria-label="Block any expression" justify>
    <modifier v-if="modifiable" :eyo="eyo"></modifier>
    <b-form-input v-model="expression" type="text" class="eyo-btn-inert btn-outline-secondary eyo-form-input-text eyo-form-input-text-any-expression" :style='{fontFamily: $$.eYo.Font.familyMono}' :title="title" v-tippy ></b-form-input>
  </b-btn-toolbar>
</template>

<script>
  import Modifier from './Modifier.vue'

  export default {
    name: 'info-any-expression',
    data: function () {
      return {
        step_: undefined,
        expression_: undefined
      }
    },
    components: {
      Modifier
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      modifiable: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      title () {
        return this.$t('message.enter_any_valid_expression')
      },
      expression: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
          return this.expression_
        },
        set (newValue) {
          this.eyo.expression_p = newValue
        }
      }
    },
    created () {
      this.synchronize()
    },
    updated () {
      this.synchronize()
    },
    methods: {
      synchronize () {
        this.step_ = this.eyo.change.step
        this.expression = this.eyo.expression_p
      }
    }
  }
</script>
<style>
  #block-any-expression {
    padding: 0 0.25rem;
  }
  .eyo-form-input-text-any-expression {
    width: 30rem;
  }
</style>
