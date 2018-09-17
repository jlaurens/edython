<template>
  <b-button-group class="mx-1">
    <b-form-input v-model="name" type="text" size="10" class="btn btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}'></b-form-input>
  </b-button-group>
</template>

<script>
  export default {
    name: 'info-primary-variant',
    data () {
      return {
        dataKey: 'name',
        name_: undefined
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
      name: {
        get () {
          return this.name_ || (this.name_ = this.selectedBlock.eyo.name_p)
        },
        set (newValue) {
          this.name_ = newValue
          var eyo = this.selectedBlock.eyo
          eyo.changeWrap(
            function () {
              eyo.name_p = newValue
            }
          )
        }
      }
    }
  }
</script>
<style>
</style>
