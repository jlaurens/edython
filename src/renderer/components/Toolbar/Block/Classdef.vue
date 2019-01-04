<template>
  <b-btn-group>
    <div
      class="item text eyo-code-reserved"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
    >class</div>
    <b-form-input
      id="block-classdef-name"
      v-model="name"
      type="text"
      :class="$$class(name)"
      :style='{fontFamily: $$.eYo.Font.familyMono}'
      :title="title"
      v-tippy
    ></b-form-input>
    <b-dd
      class="eyo-dropdown eyo-with-slotholder"
      variant="outline-secondary"
      text=""
      >
      <b-dd-item-button
        v-for="choice in choices"
        v-on:click="$$choose(choice)" :key="choice"
        class="eyo-code"
        v-html="$$content(choice)"
      ></b-dd-item-button>
    </b-dd>
    <div
      class="item text"
      v-html="ry"
    ></div>
  </b-btn-group>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'
  
  export default {
    name: 'block-classdef',
    data: function () {
      return {
        saved_step: undefined,
        name_: undefined,
        variant_: undefined
      }
    },
    props: {
      slotholder: {
        type: Function,
        default: function (item) {
          return item
        }
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
        return this.$$t('block.tooltip.classdef.name')
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
          return `${this.slotholder('eyo-slotholder-inline')}`
        } else {
          return '&nbsp;'
        }
      }
    }
  }
</script>
<style>
</style>
