<template>
  <b-button-toolbar id="info-any-expression" key-nav  aria-label="Info any expression" justify>
    <b-button-toolbar>
      <b-form-input v-model="expression" type="text" class="btn btn-outline-secondary eyo-form-input-text eyo-form-input-text-any-expression" :style='{fontFamily: $$.eYo.Font.familyMono}' :title="title" v-tippy ></b-form-input>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
  </b-button-toolbar>
</template>

<script>
  import Common from './Common.vue'

  export default {
    name: 'info-any-expression',
    data: function () {
      return {
        expression_: undefined
      }
    },
    components: {
      Common
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      title () {
        return this.$t('message.enter_any_valid_expression')
      },
      expression: {
        get () {
          return this.expression_ === this.eyo.expression_p
            ? this.expression_
            : (this.expression_ = this.eyo.expression_p)
        },
        set (newValue) {
          this.expression_ = this.eyo.expression_p = newValue
        }
      }
    },
    created () {
      this.expression_ = this.eyo.expression_p
    }
  }
</script>
<style>
  #info-any-expression {
    padding: 0 0.25rem;
  }
  .eyo-form-input-text-any-expression {
    width: 30rem;
  }
</style>
