<template>
  <b-button-toolbar id="info-number" key-nav  aria-label="Info toolbar number" justify>
    <b-button-toolbar>
      <b-button-group class="mx-1">
        <b-form-input v-model="content" type="text" class="btn btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}'></b-form-input>
      </b-button-group>
      <div id='info-number-keyword' class="btn btn-outline-secondary" :disabled="!can_imag">
        <input type="checkbox" id="info-imag" v-model="imag" :disabled="!can_imag">
        <label for="info-imag" class="eyo-code">{{suffix_}}</label>
      </div>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
  </b-button-toolbar>
</template>

<script>
  import Common from './Common.vue'

  export default {
    name: 'info-number',
    data: function () {
      return {
        suffix_: undefined,
        value_: undefined
      }
    },
    components: {
      Common
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      type () {
        return eYo.Do.typeOfString(this.value_).expr
      },
      imag: {
        get () {
          return this.type === this.$$.eYo.T3.Expr.imagnumber
        },
        set (newValue) {
          if (this.imag !== newValue) {
            this.eyo.value_p = this.content + (newValue ? this.suffix_ : '')
            this.synchronize()
          }
        }
      },
      can_imag () {
        return this.imag || eYo.Do.typeOfString(this.value_ + 'j').expr === this.$$.eYo.T3.Expr.imagnumber
      },
      content: {
        get () {
          return this.imag
            ? this.value_.slice(0, -1)
            : this.value_
        },
        set (newValue) {
          this.eyo.value_p = newValue + (this.imag ? this.suffix_ : '')
          this.synchronize()
        }
      }
    },
    methods: {
      synchronize () {
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
