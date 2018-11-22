<template>
  <b-btn-group id="block-starred" key-nav  aria-label="Block decorator" justify>
    <b-dropdown id="block-starred-dd" class="eyo-dropdown" variant="outline-secondary">
      <template slot="button-content"><span class="block-modifier eyo-code eyo-content" v-html="chosen.title"></span></template>
      <b-dropdown-item-button v-for="choice in choices" v-on:click="chosen = choice" :key="choice.key" class="block-variant eyo-code" v-html="choice.title"></b-dropdown-item-button>
    </b-dropdown>
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
        return this.slotholder('eyo-slot-holder')
      },
      choices_by_key () {
        return {
          [eYo.Key.STAR]: {
            key: eYo.Key.STAR,
            title: '<div class="eyo-code-reserved">*&nbsp;</div>',
            action (eyo) {
              eyo.modifier_p = '*'
              eyo.variant_p = eYo.Key.STAR
            }
          },
          [eYo.Key.STAR_NAME]: {
            key: eYo.Key.STAR_NAME,
            title: '<div class="eyo-code-reserved">*</div>' + this.my_slot,
            action (eyo) {
              eyo.modifier_p = '*'
              eyo.variant_p = eYo.Key.NONE
            }
          },
          [eYo.Key.STAR_STAR_NAME]: {
            key: eYo.Key.STAR_STAR_NAME,
            title: '<div class="eyo-code-reserved">**</div>' + this.my_slot,
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
    updated () {
      this.$$synchronize()
    },
    methods: {
      $$synchronize () {
        if (!this.eyo) {
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
