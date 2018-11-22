<template>
  <b-btn-toolbar id="block-any-statement" key-nav  aria-label="Block any statement" justify>
    <codex :eyo="eyo" :step="step" :slotholder="slotholder" v-on:synchronize="synchronize"></codex>
    <comment :eyo="eyo" :step="step" ></comment>
  </b-btn-toolbar>
</template>

<script>
  import Codex from './Codex.vue'
  import Comment from './Comment.vue'

  export default {
    name: 'info-any-statement',
    data: function () {
      return {
        mustComment: undefined
      }
    },
    components: {
      Codex,
      Comment
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
      slotholder: {
        type: Function,
        default: function (item) {
          return item
        }
      }
    },
    created () {
      this.$$synchronize()
    },
    updated () {
      this.$$synchronize()
    },
    methods: {
      $$synchronize () {
        if (!this.eyo) {
          return
        }
        this.step = this.eyo.change.step
        this.mustComment = this.eyo.variant_p === eYo.Key.NONE
      }
    }
  }
</script>
<style>
  #block-any-statement {
    padding: 0 0.25rem;
  }
</style>
