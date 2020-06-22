<template>
  <b-dd
    v-if="!!eyo.variant_d"
    :id="childId"
    :class="$$class"
    variant="outline-secondary"
  >
    <template
      slot="button-content"
    >
      <span
        class="eyo-code"
        v-html="chosen.title"
      />
    </template>
    <b-dd-item-button
      v-for="choice in choices"
      :key="choice.key"
      class="eyo-code"
      @click="chosen = choice"
      v-html="choice.title"
    />
  </b-dd>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'InfoVariant',
  props: {
    childId: {
      type: String,
      default: 'brick-variant'
    },
    text: {
      type: Boolean,
      default: false
    },
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
      chosen_: undefined,
      choices_: undefined
    }
  },
  computed: {
    ...mapState('Selected', [
      'step'
    ]),
    ...mapGetters('Selected', [
      'eyo'
    ]),
    $$class () {
      return `item${this.withSlot ? ' eyo-with-slotholder' : ''}${this.text ? ' text' : ''}`
    },
    chosen: {
      get () {
        this.$$synchronize(this.step)
        return this.chosen_
      },
      set (newValue) {
        this.eyo.variant_p = newValue.key
      }
    },
    choices () {
      this.$$synchronize(this.step)
      return this.choices_
    }
  },
  methods: {
    $$doSynchronize (eyo) {
      this.variant = eyo.variant_p
      var keys = (eyo.variant_d && eyo.variant_d.getAll()) || []
      this.chosen_ = null
      this.choices_ = []
      this.withSlot = false
      for (var i = 0; i < keys.length; ++i) {
        var k = keys[i]
        var choice = {
          key: k,
          title: this.formatted(k)
        }
        if (!this.chosen_) {
          this.chosen_ = choice
        } else if ((k === eyo.variant_p)) {
          this.chosen_ = choice
        }
        this.choices_.push(choice)
      }
    },
    formatted: function (item) {
      var formatted = item.length
        ? this.$$t(`message.${({
          '*': 'star',
          '**': 'two_stars',
          '.': 'dot',
          '..': 'two_dots'
        }[item] || item)}`) || item
        : '&nbsp;'
      console.warn('item, formatted:', item, formatted)
      if (formatted.indexOf && formatted.indexOf('{{slotholder}}') < 0) {
        return formatted
      }
      if (formatted.replace) {
        var replacement = `</span>${this.slotholder('eyo-slotholder')}<span>`
        this.withSlot = true
        return `<span>${formatted.replace('{{slotholder}}', replacement)}</span>`
      } else {
        return `${formatted}`
      }
    }
  }
}
</script>
<style>
  .info-variant {
    padding-right:1rem;
  }
</style>
