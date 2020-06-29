<template>
  <b-btn-group>
    <div
      class="item text eyo-code-reserved"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
    >
      class
    </div>
    <b-form-input
      id="brick-classdef-name"
      v-model="name"
      v-tippy
      type="text"
      :class="$$class(name)"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
      :title="title"
    />
    <b-dd
      class="eyo-dropdown eyo-with-slotholder"
      variant="outline-secondary"
      text=""
    >
      <b-dd-item-button
        v-for="choice in choices"
        :key="choice"
        class="eyo-code"
        @click="$$choose(choice)"
        v-html="$$content(choice)"
      />
    </b-dd>
    <div
      class="item text"
      v-html="ry"
    />
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
  
export default {
  name: 'BrickClassdef',
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
      name_: undefined,
      variant_: undefined
    }
  },
  computed: {
    ...mapState('Selected', [
      'step'
    ]),
    ...mapGetters('Selected', [
      'eyo'
    ]),
    ry () {
      return this.variant_ === eYo.Key.N_ARY ? `(${this.slotholder('eyo-slotholder-inline')}):` : ':'
    },
    title () {
      return this.$$t('brick.tooltip.classdef.name')
    },
    name: {
      get () {
        this.$$synchronize(this.step)
        return this.name_
      },
      set (newValue) {
        this.eyo.name_p = newValue
      }
    },
    choices () {
      this.$$synchronize(this.step)
      return this.eyo.variant_d.getAll()
    }
  },
  methods: {
    $$doSynchronize (eyo) {
      this.name_ = eyo.name_p
      this.variant_ = eyo.variant_p
    },
    $$class (key) {
      return `eyo-code and item text${key.length ? '' : ' placeholder'} w-20rem`
    },
    $$choose (variant) {
      this.eyo.variant_p = variant
    },
    $$content (variant) {
      if (variant === eYo.Key.N_ARY) {
        return `(${this.slotholder('eyo-slotholder-inline')})`
      } else {
        return '&nbsp;'
      }
    }
  }
}
</script>
<style>
</style>
