<template>
  <b-btn-group id="eyo-block-primary-name">
    <b-input v-model="name" type="text" class="eyo-btn-inert btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}'></b-input>
    <b-dropdown class="eyo-code eyo-text-dropdown eyo-form-input-text" v-if="module" variant="outline-secondary">
      <b-dropdown-item-button v-for="method in methods" v-on:click="myName = method" :key="method" class="eyo-code">{{method}}</b-dropdown-item-button>
    </b-dropdown>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'info-primary-name',
    data () {
      return {
        saved_step: 0,
        name_: undefined,
        variant_: undefined,
        module_: undefined
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
      name: {
        get () {
          (this.step_ === this.step) || this.$$synchronize()
          return this.name_
        },
        set (newValue) {
          this.eyo.name_p = newValue
        }
      },
      methods: {
        get () {
          //
          var ra = []
          this.module.forEachItemWithType(this.variant === eYo.Key.CALL_EXPR ? 'function' : 'data', item => {
            ra.push(item.name)
          })
          return ra
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
        this.name_ = this.eyo.name_p
        this.variant_ = this.eyo.variant_p
        this.module_ = this.eyo.module_p
      }
    }
  }
</script>
<style>
#dd-info-primary-name > .btn {
  padding-left:0.25rem;
}
.dropdown-menu {
    height: auto;
    max-height: 400px;
    overflow-x: hidden;
}
</style>
