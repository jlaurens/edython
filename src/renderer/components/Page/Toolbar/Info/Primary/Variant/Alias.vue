<template>
  <b-form-input v-model="alias" type="text" size="10" class="btn btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}'></b-form-input>
</template>

<script>
  export default {
    name: 'info-primary-variant-alias',
    data () {
      return {
        dataKey: 'variant-alias',
        alias_: undefined
      }
    },
    props: {
      selectedBlock: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      id () {
        return 'eyo-info-' + this.dataKey
      },
      alias: {
        get () {
          console.warn('GET:', this.alias_)
          if (!this.alias_) {
            this.alias_ = this.blockAlias
          }
          return this.alias_
        },
        set (newValue) {
          console.warn('SET:', newValue)
          this.blockAlias = newValue
          this.alias_ = newValue
        }
      },
      blockAlias: {
        get () {
          return this.selectedBlock.eyo.data.alias.value_
        },
        set (newValue) {
          this.selectedBlock.eyo.data.alias.change(newValue)
          this.selectedBlock.render()
        }
      }
    }
  }
</script>
<style>
</style>
  