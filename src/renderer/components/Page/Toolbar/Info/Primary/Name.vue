<template>
  <b-button-group :id="id" class="mx-1">
    <b-form-input v-model="myName" type="text" class="btn btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}'></b-form-input>
  </b-button-group>
</template>

<script>
  export default {
    name: 'info-primary-variant',
    data () {
      return {
        myName_: undefined
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      name: {
        type: String,
        default: undefined
      }
    },
    computed: {
      id () {
        return 'eyo-info-name'
      },
      myName: {
        get () {
          return this.name
        },
        set (newValue) {
          this.eyo.name_p = newValue
        }
      }
    }
  }
</script>
<style>
</style>
