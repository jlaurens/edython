<template>
  <b-btn-group id="block-primary-ry" key-nav  aria-label="Block primary ary" v-if="(variant === $$.eYo.Key.CALL_EXPR) && can_ry && show_ry" class="deeper">
    <b-input v-model="mandatory" type="text" class="eyo-code item w-2rem" :style='{fontFamily: $$.eYo.Font.familyMono}'></b-input>
    <b-dropdown class="eyo-code eyo-form-input-text item mw-4rem" variant="outline-secondary">
      <b-dropdown-item-button v-for="item in items" v-on:click="mandatory = item" :key="item" class="eyo-code eyo-content" v-html="item"></b-dropdown-item-button>
      </b-dropdown-item-button>
    </b-dropdown>
    <div class="eyo-label eyo-code item">≤ # args ≤</div>
    <b-input v-model="ary" type="text" class="eyo-code item w-2rem" :style="{fontFamily: $$.eYo.Font.familyMono}"></b-input>
    <b-dropdown class="eyo-code item mw-4rem" variant="outline-secondary">
      <b-dropdown-item-button v-for="item in items" v-on:click="ary = item" :key="item" class="eyo-code eyo-content w-4" v-html="item"></b-dropdown-item-button>
      </b-dropdown-item-button>
    </b-dropdown>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'block-primary-ry',
    data: function () {
      return {
        saved_step: 0,
        variant_: undefined,
        can_ry: true,
        ary_: Infinity,
        mandatory_: 0,
        items: ['0', '1', '2', '3', '4', '5', '∞']
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
      variant: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.variant_
        }
      },
      show_ry: {
        get () {
          return this.$store.state.UI.blockEditShowRy
        }
      },
      ary: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.ary_ === Infinity
            ? '∞'
            : this.ary_.toString()
        },
        set (newValue) {
          var filtered = newValue === '∞'
            ? Infinity
            : Number(newValue)
          if (!isNaN(filtered)) {
            this.eyo.ary_p = filtered
          }
        }
      },
      mandatory: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.mandatory_ === Infinity
            ? '∞'
            : this.mandatory_.toString()
        },
        set (newValue) {
          var filtered = newValue === '∞'
            ? Infinity
            : Number(newValue)
          if (!isNaN(filtered)) {
            this.eyo.mandatory_p = filtered
          }
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
        this.saved_step = eyo.change.step
        this.variant_ = eyo.variant_p
        var p5e = eyo.profile_p.p5e
        this.can_ry_ = !p5e || !p5e.item
        this.ary_ = eyo.ary_p
        this.mandatory_ = eyo.mandatory_p
      }
    }
  }
</script>
<style>
</style>
