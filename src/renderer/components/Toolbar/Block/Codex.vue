<template>
  <b-button-toolbar>
    <div id='info-stmt-code' class="eyo-btn-inert btn-outline-secondary" v-if="withSlotholder">
      <div class="eyo-block-primary-variant2">
        <input type="checkbox" id="block-stmt-code-check" v-model="hasCode" :disabled="noCheck">
        <div class="eyo-block-primary-variant3" v-html="my_slot"></div>
      </div>
    </div>
    <div id='info-stmt-code' class="eyo-btn-inert btn-outline-secondary" v-else>
      <input type="checkbox" id="block-stmt-code-check" v-model="hasCode" :disabled="noCheck">
      <b-form-input v-model="code"
      type="text"
      class="eyo-code"></b-form-input>
    </div>
  </b-button-toolbar>
</template>

<script>
  export default {
    name: 'info-stmt-code',
    data: function () {
      return {
        step_: undefined,
        variant_: undefined,
        commentVariant_: undefined,
        expression_: undefined,
        withSlotholder_: undefined
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      slotholder: {
        type: Function,
        default: (item) => {
          return item
        }
      }
    },
    computed: {
      commentVariant () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.commentVariant_ === eYo.Key.NONE
      },
      noCheck () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.commentVariant_ === eYo.Key.NONE
      },
      canCode () {
        return !!this.eyo.expression_d
      },
      hasCode: {
        get () {
          return this.variant === eYo.Key.EXPRESSION
        },
        set (newValue) {
          this.hasCode_ = newValue
          this.eyo.variant_p = newValue
            ? eYo.Key.EXPRESSION
            : eYo.Key.NONE
          this.$emit('synchronize')
        }
      },
      variant () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.variant_
      },
      code: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
          return this.expression_
        },
        set (newValue) {
          this.eyo.expression_p = newValue
        }
      },
      my_slot () {
        return this.slotholder('eyo-block-primary-variant1')
      },
      withSlotholder () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.withSlotholder_
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
        this.expression_ = this.eyo.expression_p
        this.withSlotholder_ = this.eyo.expression_s.targetBlock()
        this.commentVariant_ = this.eyo.commentVariant_p
        this.variant_ = this.eyo.variant_p
      }
    }
  }
</script>
<style>
  #block-stmt-code.btn {
    margin: 0 0 0 0.25rem;
    padding: 0 0.125rem 0 0.25rem;
  }
  #block-stmt-code label {
    margin: 0;
  }
  #block-stmt-code input {
    margin: 0;
    padding: 0 0.25rem;
    display: inline-block;
    width: auto;
    border: none;
    position:relative;
    top:-0.0625rem;
  }
</style>
