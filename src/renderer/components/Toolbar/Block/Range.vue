<template>
  <b-btn-group
    id="block-range"
    class="b3k-edit-content"
    aria-label="Block range edit content"
    justify>
    <b-dd
      v-if="!!eyo.dotted_d"
      id="child_id"
      class="item text eyo-code-reserved"
      :text="chosen">
      <b-dd-item-button
        v-for="choice in choices"
        v-on:click="chosen = choice"
        :key="choice"
        class="eyo-code"><span class="eyo-code-reserved">{{choice}}</span></b-dd-item-button>
    </b-dd>
    <div
      class="item text w-5rem">
      <span class="eyo-code-reserved">{{`${!!eyo.dotted_d ? 'rand' : ''}range`}}</span>(</div>
    <div
      class="item">
      <input
        type="checkbox"
        class="item w-1rem"
        v-model="showStart">
    </div>
    <div
      v-if="eyo.start_t"
      :class="$$class({no_text: !showStart})"
      v-html="slotholder('eyo-slotholder-inline')"
      ></div>
    <input
      v-else
      type="text"
      :class="$$class({key: r_start, no_text: !showStart})"
      v-model="r_start"
      placeholder="0"
      :disabled="!showStart">
    <div
    :class="$$class({no_text: !showStart, width: 2})">,</div>
    <div
      v-if="eyo.stop_t"
      class="item text"
      v-html="slotholder('eyo-slotholder-inline')"
      ></div>
    <input
      v-else
      type="text"
      :class="$$class({key: r_stop})"
      v-model="r_stop"
      placeholder="10">
    <div
      class="item">
      <input
        type="checkbox"
        class="item w-1rem"
        v-model="showStep"
        placeholder="1">
    </div>
    <div
     :class="$$class({no_text: !showStep, width: 2})">,</div>
    <div
      v-if="eyo.step_t"
      :class="$$class({no_text: !showStep})"
      v-html="slotholder('eyo-slotholder-inline')"
      ></div>
    <input
      v-else
      type="item text"
      :class="$$class({key: r_start, no_text: !showStep})"
      v-model="r_step"
      placeholder="1"
      :disabled="!showStep">
    <div
      class="item text">)</div>
  </b-btn-group>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    name: 'info-range',
    data () {
      return {
        saved_step: undefined,
        r_start_: undefined,
        r_stop_: undefined,
        r_step_: undefined,
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
      ...mapGetters('Selected', [
        'eyo',
        'step'
      ]),
      choices () {
        return [
          '',
          'random.'
        ]
      },
      chosen: {
        get () {
          this.$$synchronize(this.step)
          return this.choices[this.eyo.dotted_p]
        },
        set (newValue) {
          this.eyo.dotted_p = newValue.length > 0 ? 1 : 0
        }
      },
      r_start: {
        get () {
          this.$$synchronize(this.step)
          return this.r_start_
        },
        set (newValue) {
          this.eyo.start_p = newValue
        }
      },
      r_stop: {
        get () {
          this.$$synchronize(this.step)
          return this.r_stop_
        },
        set (newValue) {
          this.eyo.stop_p = newValue
        }
      },
      r_step: {
        get () {
          this.$$synchronize(this.step)
          return this.r_step_
        },
        set (newValue) {
          this.eyo.step_p = newValue
        }
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
      showStart: {
        get () {
          return this.variant !== eYo.Key.NONE
        },
        set (newValue) {
          if (newValue) {
            if (this.variant !== eYo.Key.STEP) {
              this.variant = eYo.Key.START
            }
          } else {
            this.variant = eYo.Key.NONE
          }
        }
      },
      showStep: {
        get () {
          return this.variant === eYo.Key.STEP
        },
        set (newValue) {
          if (newValue) {
            this.variant = eYo.Key.STEP
          } else {
            this.variant = eYo.Key.START
          }
        }
      }
    },
    methods: {
      $$doSynchronize (eyo) {
        this.variant_ = this.eyo.variant_p
        this.r_start_ = this.eyo.start_p
        this.r_stop_ = this.eyo.stop_p
        this.r_step_ = this.eyo.step_p
      },
      $$class (kwargs) {
        var text_class = kwargs && kwargs.no_text ? '' : ' text'
        var ph_class = kwargs && kwargs.key && !kwargs.key.length
          ? ' placeholder'
          : ''
        var wd_class = kwargs && goog.isNumber(kwargs.width) ? ` w-${kwargs.width}rem` : ' w-4rem'
        return `eyo-code and item${text_class}${ph_class}${wd_class}`
      }
    }
  }
</script>
<style>
</style>
