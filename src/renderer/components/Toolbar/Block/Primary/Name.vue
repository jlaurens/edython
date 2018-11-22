<template>
  <b-btn-group id="eyo-block-primary-name">
    <b-form-input v-model="myName" type="text" class="eyo-btn-inert btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}'></b-form-input>
    <b-dropdown :id="'dd-' + id" class="eyo-dropdown" v-if="module" variant="outline-secondary">
      <b-dropdown-item-button v-for="method in methods" v-on:click="myName = method" :key="method" class="eyo-code">{{method}}</b-dropdown-item-button>
    </b-dropdown>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'info-primary-name',
    data () {
      return {
        myName_: undefined,
        methods_: undefined
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
      name: {
        type: String,
        default: undefined
      },
      variant: {
        type: String,
        default: undefined
      },
      module: {
        type: Object,
        defaut: undefined
      }
    },
    computed: {
      myName: {
        get () {
          return this.name
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
