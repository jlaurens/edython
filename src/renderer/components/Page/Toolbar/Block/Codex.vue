<template>
  <b-button-toolbar>
    <div id='info-stmt-code' class="btn btn-outline-secondary" v-if="withSlotholder_">
      <div class="eyo-block-primary-variant2">
        <input type="checkbox" id="info-stmt-code-check" v-model="hasCode" :disabled="noCheck">
        <div class="eyo-block-primary-variant3" v-html="my_slot"></div>
      </div>
    </div>
    <div id='info-stmt-code' class="btn btn-outline-secondary" v-else>
      <input type="checkbox" id="info-stmt-code-check" v-model="hasCode" :disabled="noCheck">
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
      },
      variant: {
        type: String,
        default: undefined
      },
      commentVariant: {
        type: String,
        required: true
      }
    },
    computed: {
      noCheck () {
        return this.commentVariant === eYo.Key.NONE
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
      code: {
        get () {
          return this.expression_
        },
        set (newValue) {
          this.expression_ = this.eyo.expression_p = newValue
        }
      },
      my_slot () {
        return this.slotholder('eyo-block-primary-variant1')
      }
    },
    created () {
      this.expression_ = this.eyo.expression_p
      this.withSlotholder_ = this.eyo.expression_s.targetBlock()
    }
  }
</script>
<style>
  #info-stmt-code.btn {
    margin: 0 0 0 0.25rem;
    padding: 0 0.125rem 0 0.25rem;
  }
  #info-stmt-code label {
    margin: 0;
  }
  #info-stmt-code input {
    margin: 0;
    padding: 0 0.25rem;
    display: inline-block;
    width: auto;
    border: none;
    position:relative;
    top:-0.0625rem;
  }
</style>
