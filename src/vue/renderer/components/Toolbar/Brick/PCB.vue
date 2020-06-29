<template>
  <b-btn-group
    id="b3k-gnd"
    key-nav
    aria-label="Block pass, continue or break"
  >
    <b-dd
      variant="outline-secondary"
      class="eyo-code-reserved item text mw-6rem"
      :text="chosen.key"
    >
      <b-dd-item-button
        v-for="choice in choices"
        :key="choice.variant"
        v-tippy
        class="eyo-code-reserved"
        :title="choice.title"
        @click="chosen = choice"
      >
        {{ choice.key }}
      </b-dd-item-button>
    </b-dd>
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'InfoDecorator',
  props: {
    slotholder: {
      type: Function,
      default: function (item) {
        return item
      }
    }
  },
  data () {
    return {
      saved_step: undefined,
      variant_: undefined,
      choices_: undefined,
      chosen_: undefined
    }
  },
  computed: {
    ...mapState('Selected', [
      'step'
    ]),
    ...mapGetters('Selected', [
      'eyo'
    ]),
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
      if (!this.choices_) {
        this.choices_ = [
          {
            key: 'pass',
            tooltip: this.$$t('brick.tooltip.pass'),
            variant: eYo.Key.PASS
          },
          {
            key: 'continue',
            tooltip: this.$$t('brick.tooltip.continue'),
            variant: eYo.Key.CONTINUE
          },
          {
            key: 'break',
            tooltip: this.$$t('brick.tooltip.break'),
            variant: eYo.Key.BREAK
          }
        ]
      }
      this.chosen_ = null
      if (!this.choices_.some((choice) => {
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
