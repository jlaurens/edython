<template>
  <b-dropdown id="info-builtin" class="eyo-dropdown" v-if="values && values.length" variant="outline-secondary">
    <template slot="button-content"><span class="info-value eyo-code-reserved eyo-content" v-html="value"></span></template>
    <b-dropdown-item-button v-for="item in values" v-on:click="value = item" :key="item" class="info-value eyo-code-reserved" v-html="item"></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-value',
    data () {
      return {
        value_: undefined
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      value: {
        get () {
          return this.value_
        },
        set (newValue) {
          this.value_ = newValue
          this.eyo.value_p = newValue
        }
      },
      values () {
        return this.eyo.data.value.model.all
      }
    },
    created () {
      this.value_ = this.eyo.value_p
    }
  }
</script>
<style>
  #info-builtin {
    padding-left:0.25rem;
  }
</style>
  