<template>
  <b-button-toolbar id="info-any-statement" key-nav  aria-label="Info any statement" justify>
    <b-button-toolbar>
      <codex :eyo="eyo" :slotholder="slotholder" :variant="variant" :comment-variant="commentVariant" v-on:synchronize="synchronize"></codex>
      <comment :eyo="eyo" :must-comment="mustComment" :comment-variant="commentVariant" v-on:synchronize="synchronize"></comment>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
  </b-button-toolbar>
</template>

<script>
  import Codex from './Codex.vue'
  import Comment from './Comment.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-any-statement',
    data: function () {
      return {
        variant: undefined,
        commentVariant: undefined,
        mustComment: undefined
      }
    },
    components: {
      Codex,
      Comment,
      Common
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      slotholder: {
        type: Function,
        default: function (item) {
          return item
        }
      }
    },
    created () {
      this.synchronize()
    },
    methods: {
      synchronize () {
        console.log('COUCOU')
        this.variant = this.eyo.variant_p
        this.commentVariant = this.eyo.comment_variant_p
        this.mustComment = this.variant === this.$$.eYo.Key.NONE
      }
    }
  }
</script>
<style>
  #info-any-statement {
    padding: 0 0.25rem;
  }
</style>
