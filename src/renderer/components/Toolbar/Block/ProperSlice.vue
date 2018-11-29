<template>
  <b-btn-group id="block-proper-slice" key-nav  aria-label="Block any expression" justify>
    <b-form-input v-model="lower"
                  placeholder="min"
                  type="text"
                  :class="$$class(lower)"
                  :style='{fontFamily: $$.eYo.Font.familyMono}'
                  :title="title('lower')"
                  v-tippy ></b-form-input>
    <div class="item text eyo-code">:</div>
    <b-form-input v-model="upper"
                  placeholder="end"
                  type="text"
                  :class="$$class(upper)"
                  :style='{fontFamily: $$.eYo.Font.familyMono}'
                  :title="title('upper')"
                  v-tippy ></b-form-input>
    <div class="item">
      <input type="checkbox" aria-label="Checkbox to enable the stride entry" v-model="showStride" >
    </div>
    <div class="item text eyo-code">:</div>
    <b-form-input v-model="stride"
                  placeholder="step"
                  type="text"
                  :class="$$class(stride)"
                  :style='{fontFamily: $$.eYo.Font.familyMono}'
                  :title="title('stride')"
                  v-tippy ></b-form-input>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'block-proper-slice',
    data: function () {
      return {
        saved_step: 0,
        lower_: undefined,
        upper_: undefined,
        stride_: undefined,
        variant_: undefined
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
      }
    },
    computed: {
      lower: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.lower_
        },
        set (newValue) {
          this.eyo.lower_p = newValue
        }
      },
      upper: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.upper_
        },
        set (newValue) {
          this.eyo.upper_p = newValue
        }
      },
      stride: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.stride_
        },
        set (newValue) {
          this.eyo.stride_p = newValue
        }
      },
      variant: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.variant_
        },
        set (newValue) {
          this.eyo.variant_p = newValue
        }
      },
      showStride: {
        get () {
          return this.variant === eYo.Key.STRIDE
        },
        set (newValue) {
          this.variant = newValue ? eYo.Key.STRIDE : eYo.Key.NONE
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
        var eyo = this.eyo
        if (!eyo || (this.saved_step === this.step)) {
          return
        }
        this.saved_step = this.step
        this.lower_ = eyo.lower_p
        this.upper_ = eyo.upper_p
        this.stride_ = eyo.stride_p
        this.variant_ = eyo.variant_p
      },
      title (key) {
        return this.$$t(`block.tooltip.proper_slice.${key}`)
      },
      $$class (key) {
        return `eyo-code and item text${key && key.length ? '' : ' placeholder'}`
      }
    }
  }
</script>
<style>
  #block-any-expression {
    padding: 0 0.25rem;
  }
  .eyo-form-input-text-any-expression {
    width: 30rem;
  }
</style>
