<template>
  <b-button-toolbar id="block-number" key-nav  aria-label="Block toolbar number" justify>
    <b-button-group>
      <b-form-input v-model="content" type="text" class="eyo-btn-inert btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}'></b-form-input>
    </b-button-group>
    <div id='info-number-keyword' class="eyo-btn-inert btn-outline-secondary" :disabled="!can_imag">
      <input type="checkbox" id="block-imag" v-model="imag" :disabled="!can_imag">
      <label for="block-imag" class="eyo-code">{{suffix_}}</label>
    </div>
  </b-button-toolbar>
</template>

<script>
  export default {
    name: 'info-number',
    data: function () {
      return {
        step_: undefined,
        suffix_: undefined,
        value_: undefined
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      type () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return eYo.T3.Profile.get(this.value_).expr
      },
      imag: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
          return this.type === eYo.T3.Expr.imagnumber
        },
        set (newValue) {
          if (this.imag !== newValue) {
            this.eyo.value_p = this.content + (newValue ? this.suffix_ : '')
          }
        }
      },
      can_imag () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.imag || eYo.T3.Profile.get(this.value_ + 'j').expr === eYo.T3.Expr.imagnumber
      },
      content: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
          return this.imag
            ? this.value_.slice(0, -1)
            : this.value_
        },
        set (newValue) {
          this.eyo.value_p = newValue + (this.imag ? this.suffix_ : '')
        }
      }
    },
    methods: {
      synchronize () {
        this.step_ = this.eyo.change.step
        this.value_ = this.eyo.value_p
        this.suffix_ = this.imag ? this.value_.slice(-1) : 'j'
      }
    },
    created () {
      this.synchronize()
    },
    updated () {
      this.synchronize()
    }
  }
</script>
<style>
</style>
