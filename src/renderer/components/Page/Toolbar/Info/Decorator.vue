<template>
  <b-button-toolbar id="info-decorator" key-nav  aria-label="Info decorator" justify>
    <b-button-toolbar>
    <variant :eyo="eyo"></variant>
      <comment :eyo="eyo" :must-comment="mustComment" :comment-variant="commentVariant" v-on:synchronize="synchronize"></comment>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
  </b-button-toolbar>
</template>

<script>
  import Variant from './Variant.vue'
  import Comment from './Comment.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-decorator',
    data: function () {
      return {
        variant: undefined,
        commentVariant: undefined,
        mustComment: undefined
      }
    },
    components: {
      Comment,
      Common,
      Variant
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
      }
    }
  }
</script>
<style>
  #info-decorator {
    padding: 0 0.25rem;
  }
</style>
