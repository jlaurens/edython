<template>
  <b-dropdown id="block-variant" :class="`item${withSlot ? ' eyo-with-slot-holder': ''}`" variant="outline-secondary" v-if="!!eyo.variant_d">
    <template slot="button-content"><span class="eyo-code" v-html="chosen.title"></span></template>
    <b-dropdown-item-button v-for="choice in choices" v-on:click="chosen = choice" :key="choice.key" class="eyo-code" v-html="choice.title"></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-variant',
    data () {
      return {
        saved_step: undefined,
        chosen_: undefined,
        choices_: undefined
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
      chosen: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.chosen_
        },
        set (newValue) {
          this.eyo.variant_p = newValue.key
        }
      },
      choices () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.choices_
      }
    },
    created () {
      this.$$synchronize()
    },
    beforeUpdate () {
      (this.saved_step === this.step) || this.$$synchronize()
    },
    methods: {
      $$synchronize () {
        if (!this.eyo || (this.saved_step === this.step)) {
          return
        }
        this.saved_step = this.step
        this.variant = this.eyo.variant_p
        var keys = (this.eyo.variant_d && this.eyo.variant_d.getAll()) || []
        this.chosen_ = null
        this.choices_ = []
        this.withSlot = false
        for (var i = 0; i < keys.length; ++i) {
          var k = keys[i]
          var choice = {
            key: k,
            title: this.formatted(k)
          }
          if ((k === this.eyo.variant_p) || !this.chosen_) {
            this.chosen_ = choice
          }
          this.choices_.push(choice)
        }
      },
      formatted: function (item) {
        var formatted = item.length ? this.$t(`message.${({'*': 'star', '**': 'two_stars', '.': 'dot', '..': 'two_dots'}[item] || item)}`) : '&nbsp;'
        if (formatted.indexOf('{{slotholder}}') < 0) {
          return formatted
        }
        var replacement = `</span>${this.slotholder('eyo-slot-holder')}<span>`
        this.withSlot = true
        return `<span>${formatted.replace('{{slotholder}}', replacement)}</span>`
      }
    }
  }
</script>
<style>
  .info-variant {
    padding-right:1rem;
  }
</style>
