<template>
  <b-btn-group id="b3k-primary-name">
    <b-input v-model="name" type="text" :class="$$class" :style='{fontFamily: $$.eYo.Font.familyMono}' :placeholder="$$t('block.placeholder.name')"></b-input>
    <b-dd class="eyo-code item text" v-if="module" variant="outline-secondary">
      <b-dd-item-button v-for="method in methods" v-on:click="name = method" :key="method" class="eyo-code">{{method}}</b-dd-item-button>
    </b-dd>
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
      $$class: {
        get () {
          return `eyo-code and item text${this.name.length ? '' : ' placeholder'}`
        }
      },
      name: {
        get () {
          (this.step_ === this.step) || this.$$synchronize()
          return this.name_
        },
        set (newValue) {
          this.eyo.name_p = newValue
        }
      },
      variant: {
        get () {
          (this.step_ === this.step) || this.$$synchronize()
          return this.variant_
        }
      },
      module: {
        get () {
          (this.step_ === this.step) || this.$$synchronize()
          return this.module_
        }
      },
      methods: {
        get () {
          //
          var ra = []
          this.module.forEachItemWithType(this.variant === eYo.Key.NONE || this.variant === eYo.Key.CALL_EXPR || this.variant === eYo.Key.ALIASED ? 'function' : 'data', (item) => {
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
