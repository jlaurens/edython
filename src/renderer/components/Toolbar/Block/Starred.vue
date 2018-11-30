<template>
  <b-btn-group id="block-starred" key-nav  aria-label="Block decorator">
    <b-dd class="item text eyo-with-slotholder mw-4rem" variant="outline-secondary">
      <template slot="button-content"><span class="eyo-code-reserved" v-html="chosen.title"></span></template>
      <b-dd-item-button v-for="choice in choices" v-on:click="chosen = choice" :key="choice.key" class="eyo-code" v-html="choice.title"></b-dd-item-button>
    </b-dd>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'info-starred',
    data: function () {
      return {
        saved_step: undefined,
        chosen_: undefined
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
      my_slot () {
        return this.slotholder('eyo-slotholder')
      },
      choices_by_key () {
        return {
          [eYo.Key.STAR]: {
            key: eYo.Key.STAR,
            title: '<span class="eyo-code-reserved">*&nbsp;</span>',
            action (eyo) {
              eyo.modifier_p = '*'
              eyo.variant_p = eYo.Key.STAR
            }
          },
          [eYo.Key.STAR_NAME]: {
            key: eYo.Key.STAR_NAME,
            title: '<span class="eyo-code-reserved">*</span>' + this.my_slot,
            action (eyo) {
              eyo.modifier_p = '*'
              eyo.variant_p = eYo.Key.NONE
            }
          },
          [eYo.Key.STAR_STAR_NAME]: {
            key: eYo.Key.STAR_STAR_NAME,
            title: '<span class="eyo-code-reserved">**</span>' + this.my_slot,
            action (eyo) {
              eyo.modifier_p = '**'
              eyo.variant_p = eYo.Key.NONE
            }
          }
        }
      },
      choices () {
        return [
          this.choices_by_key[eYo.Key.STAR],
          this.choices_by_key[eYo.Key.STAR_NAME],
          this.choices_by_key[eYo.Key.STAR_STAR_NAME]
        ]
      },
      chosen: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.chosen_
        },
        set (newValue) {
          newValue.action(this.eyo)
          this.$$synchronize()
        }
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
        var eyo = this.eyo
        this.saved_step = eyo.change.step
        if (eyo.modifier_p === '**') {
          this.chosen_ = this.choices_by_key[eYo.Key.STAR_STAR_NAME]
        } else if (eyo.variant_p === eYo.Key.STAR) {
          this.chosen_ = this.choices_by_key[eYo.Key.STAR]
        } else /* if (eyo.variant_p === eYo.Key.STAR) */ {
          this.chosen_ = this.choices_by_key[eYo.Key.STAR_NAME]
        }
      }
    }
  }
</script>
<style>
  #block-decorator {
    padding: 0 0.25rem;
  }
</style>
