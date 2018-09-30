<template>
  <b-button-toolbar>
    <div id='info-stmt-code' class="btn btn-outline-secondary">
      <span>bah</span>
      <input type="checkbox" id="info-stmt-code-check" v-model="hasCode" :disabled="noCheck">
      <span>OK</span>
      <span v-if="withSlotholder_">COUCOU</span>
      <b-form-input v-model="code"
      type="text"
      class="eyo-code" :disabled="!canCode" v-else></b-form-input>
    </div>
  </b-button-toolbar>
</template>

<script>
  export default {
    name: 'info-stmt-code',
    data: function () {
      return {
        code_: undefined,
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
        default: function (item) {
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
        return this.commentVariant === this.$$.eYo.Key.NONE
      },
      canCode () {
        return !!this.eyo.data.code
      },
      hasCode: {
        get () {
          return this.variant === this.$$.eYo.Key.CODE
        },
        set (newValue) {
          this.hasCode_ = newValue
          this.eyo.variant_p = newValue
            ? eYo.Key.CODE
            : eYo.Key.NONE
          this.$emit('synchronize')
        }
      },
      code: {
        get () {
          return this.code_
        },
        set (newValue) {
          this.code_ = this.eyo.code_p = newValue
        }
      }
    },
    created () {
      this.code_ = this.eyo.code_p
      this.withSlotholder_ = this.eyo.slots.code.targetBlock()
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
