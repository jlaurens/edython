<template>
  <b-button-toolbar>
    <div id='info-stmt-code' class="btn btn-outline-secondary">
      <input type="checkbox" id="info-stmt-code-check" v-model="hasCode" :disabled="canCheck">
      <b-form-input v-model="code"
      type="text"
      class="eyo-code" :disabled="!canCode"></b-form-input>
    </div>
  </b-button-toolbar>
</template>

<script>
  export default {
    name: 'info-stmt-code',
    data: function () {
      return {
        code_: undefined,
        canCode_: undefined,
        hasCode_: undefined,
        canCheck_: undefined
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      canCheck () {
        return this.canCheck_
      },
      canCode () {
        return this.canCode_
      },
      hasCode: {
        get () {
          return this.hasCode_
        },
        set (newValue) {
          this.hasCode_ = newValue
          this.eyo.variant_p = newValue
            ? eYo.Key.CODE_COMMENT
            : eYo.Key.CODE
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
      this.canCode_ = !!this.eyo.data.code
      this.code_ = this.eyo.code_p
      this.canCheck_ = this.eyo.variant_p === eYo.Key.CODE_COMMENT
      this.hasCode_ = this.eyo.variant_p === eYo.Key.CODE || this.canCheck_
      console.log(this.eyo.variant_p)
      console.log(this.canCode_)
      console.log(this.code_)
      console.log(this.canCheck_)
      console.log(this.hasCode_)
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
