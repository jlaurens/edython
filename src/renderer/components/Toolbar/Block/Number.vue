<template>
  <b-btn-toolbar
    id="block-number"
    key-nav
    aria-label="Block toolbar number"
    justify>
    <b-btn-group>
      <b-form-input
        v-model="content"
        type="text"
        class="item text"
        :style='{fontFamily: $$.eYo.Font.familyMono}'
      ></b-form-input>
    </b-btn-group>
    <div
      v-if="selectedMode > $$.eYo.App.BASIC"
      id='info-number-keyword'
      class="item"
      :disabled="!can_imag">
      <input
        type="checkbox"
        id="block-imag"
        v-model="imag"
        :disabled="!can_imag">
    </div>
    <div
      v-if="selectedMode > $$.eYo.App.BASIC"
      :class="`item${imag ? ' text' : ''}`"
    >{{suffix_}}</div>
  </b-btn-toolbar>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  export default {
    name: 'info-number',
    data: function () {
      return {
        saved_step: undefined,
        suffix_: undefined,
        value_: undefined
      }
    },
    computed: {
      ...mapState('Selected', [
        'step'
      ]),
      ...mapGetters('Selected', [
        'eyo'
      ]),
      type () {
        this.$$synchronize(this.step)
        return eYo.T3.Profile.get(this.value_).expr
      },
      imag: {
        get () {
          this.$$synchronize(this.step)
          return this.type === eYo.T3.Expr.imagnumber
        },
        set (newValue) {
          if (this.imag !== newValue) {
            this.eyo.value_p = this.content + (newValue ? this.suffix_ : '')
          }
        }
      },
      can_imag () {
        this.$$synchronize(this.step)
        return this.imag || eYo.T3.Profile.get(this.value_ + 'j').expr === eYo.T3.Expr.imagnumber
      },
      content: {
        get () {
          this.$$synchronize(this.step)
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
      $$doSynchronize (eyo) {
        this.value_ = eyo.value_p
        this.suffix_ = this.imag ? this.value_.slice(-1) : 'j'
      }
    }
  }
</script>
<style>
</style>
