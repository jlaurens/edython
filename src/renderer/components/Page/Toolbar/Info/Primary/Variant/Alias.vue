<template>
  <b-form-input v-model="alias" type="text" size="10" class="btn btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}'></b-form-input>
</template>

<script>
  export default {
    name: 'info-primary-variant-alias',
    data () {
      return {
        alias_: undefined
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      id () {
        return 'eyo-info-variant-alias'
      },
      alias: {
        get () {
          return this.alias_ === this.eyo.alias_p
            ? this.alias_
            : (this.alias_ = this.eyo.alias_p)
        },
        set (newValue) {
          this.alias_ = this.eyo.alias_p = newValue
        }
      }
    },
    created () {
      this.alias_ = this.eyo.alias_p
    }
  }
</script>
<style>
</style>
  