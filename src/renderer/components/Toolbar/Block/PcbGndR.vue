<template>
  <b-btn-group id="b3k-gnd" key-nav  aria-label="Block global, nonlocal or del">
    <b-dd variant="outline-secondary" class="eyo-code-reserved item text mw-6rem" :text="chosen.variant">
      <b-dd-item-button
        v-for="choice in choices"
        v-on:click="chosen = choice"
        :key="choice.variant"
        class="eyo-code-reserved"
        :title="choice.title"
      v-tippy>{{choice.variant}}</b-dd-item-button>
    <b-dd-divider v-if="altChoices.length"></b-dd-divider>
    <b-dd-item-button
      v-for="choice in altChoices"
      v-on:click="chosen = choice"
      :key="choice.variant"
      class="eyo-code-reserved"
      :title="choice.title"
      v-tippy>{{choice.variant}}</b-dd-item-button>
  </b-dd>
    <div v-if="canSlot && !!slotholder" class="item text" v-html="slotholder('eyo-slotholder-inline')"></div>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'info-decorator',
    data: function () {
      return {
        saved_step: undefined,
        variant_: undefined,
        variants_: undefined,
        choices_: undefined,
        altChoices_: undefined,
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
        default: null
      },
      variants: {
        type: Array,
        default: () => {
          return []
        }
      },
      altVariants: {
        type: Array,
        default: () => {
          return []
        }
      }
    },
    computed: {
      canSlot () {
        this.$$synchronize(this.step)
        console.warn(this.variants_, this.variant, this.variants_.indexOf(this.variant) < 0)
        return this.variants_.indexOf(this.variant) < 0
      },
      variant: {
        get () {
          this.$$synchronize(this.step)
          return this.variant_
        },
        set (newValue) {
          this.eyo.variant_p = newValue
        }
      },
      choices () {
        this.$$synchronize(this.step)
        return this.choices_
      },
      altChoices () {
        this.$$synchronize(this.step)
        return this.altChoices_
      },
      chosen: {
        get () {
          this.$$synchronize(this.step)
          return this.chosen_
        },
        set (newValue) {
          this.eyo.variant_p = newValue.variant
        }
      }
    },
    methods: {
      $$doSynchronize (eyo) {
        this.variant_ = eyo.variant_p
        this.choices_ = []
        this.altChoices_ = []
        var variants = this.variants_ = this.variants
        if (!variants.length) {
          variants = this.variants_ = [
            eYo.Key.PASS,
            eYo.Key.CONTINUE,
            eYo.Key.BREAK
          ]
        }
        var altVariants = this.altVariants
        if (!altVariants.length) {
          altVariants = [
            eYo.Key.RETURN,
            eYo.Key.GLOBAL,
            eYo.Key.NONLOCAL,
            eYo.Key.DEL
          ]
        }
        var first, second
        if (altVariants.indexOf(eyo.variant_p) < 0) {
          first = variants
          second = altVariants
        } else {
          first = altVariants
          second = variants
        }
        first.forEach(element => {
          this.choices.push({
            tooltip: this.$$t(`block.tooltip.${element}`),
            variant: element
          })
        })
        second.forEach(element => {
          this.altChoices.push({
            tooltip: this.$$t(`block.tooltip.${element}`),
            variant: element
          })
        })
        this.chosen_ = null
        if (!this.choices_.some((choice) => {
          if (this.variant_ === choice.variant) {
            this.chosen_ = choice
            return true
          }
        }) && !this.altChoices_.some((choice) => {
          if (this.variant_ === choice.variant) {
            this.chosen_ = choice
            return true
          }
        })) {
          this.chosen = this.choices_[0] // with no trailing '_', reentrant once at most.
        }
      }
    }
  }
</script>
<style>
</style>
