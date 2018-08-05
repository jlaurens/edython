<template>
  <b-button-toolbar v-if="canComment">
    <div id='info-stmt-comment' class="btn btn-outline-secondary">
      <input type="checkbox" id="info-stmt-comment-check" v-model="hasComment">
      <label for="info-stmt-comment-check" class="eyo-code-reserved">#</label>
      <b-form-input v-model="comment"
      type="text"
      :placeholder="placeholder"
      class="eyo-code" :disabled="!hasComment"></b-form-input>
    </div>
  </b-button-toolbar>
</template>

<script>
  export default {
    name: 'info-stmt-comment',
    data: function () {
      return {
      }
    },
    props: {
      selectedBlock: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      placeholder () {
        return eYo.Msg.Placeholder.COMMENT
      },
      comment_variant_d () {
        var block = this.selectedBlock
        return block && block.eyo.data.comment_variant
      },
      comment_d () {
        var block = this.selectedBlock
        return block && block.eyo.data.comment
      },
      canComment () {
        return this.comment_d
      },
      hasComment: {
        get () {
          var comment_variant_d = this.comment_variant_d
          if (comment_variant_d) {
            return comment_variant_d.get() === comment_variant_d.COMMENT
          }
          return false
        },
        set (newValue) {
          var comment_variant_d = this.comment_variant_d
          if (comment_variant_d) {
            comment_variant_d.set(newValue ? comment_variant_d.COMMENT : comment_variant_d.NO_COMMENT)
          }
        }
      },
      comment: {
        get () {
          var comment_d = this.comment_d
          return comment_d && comment_d.get()
        },
        set (newValue) {
          var comment_d = this.comment_d
          if (comment_d) {
            comment_d.set(newValue)
          }
        }
      }
    }
  }
</script>
<style>
  #info-stmt-comment.btn {
    margin: 0 0 0 0.25rem;
    padding: 0 0.125rem 0 0.25rem;
  }
  #info-stmt-comment label {
    margin: 0;
  }
  #info-stmt-comment input {
    margin: 0;
    padding: 0 0.25rem;
    display: inline-block;
    width: auto;
    border: none;
    position:relative;
    top:-0.0625rem;
  }
</style>
