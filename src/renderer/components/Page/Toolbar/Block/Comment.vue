<template>
  <b-button-toolbar v-if="canComment">
    <div id='info-stmt-comment' class="btn btn-outline-secondary">
      <input type="checkbox" id="info-stmt-comment-check" v-model="hasComment" :disabled="mustComment">
      <label for="info-stmt-comment-check" class="eyo-code-reserved">#</label>
      <b-form-input v-model="comment"
      type="text"
      class="eyo-code" :disabled="!hasComment"></b-form-input>
    </div>
  </b-button-toolbar>
</template>

<script>
  export default {
    name: 'info-stmt-comment',
    data: function () {
      return {
        comment_: undefined,
        hasComment_: undefined,
        myCommentVariant_: undefined
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      mustComment: {
        type: Boolean,
        default: false
      },
      commentVariant: {
        type: String,
        default: undefined
      }
    },
    computed: {
      canComment () {
        return this.eyo && this.eyo.data.comment
      },
      myCommentVariant () {
        return this.commentVariant || this.myCommentVariant_
      },
      hasComment: {
        get () {
          return this.commentVariant === eYo.Key.COMMENT
        },
        set (newValue) {
          this.hasComment_ = newValue
          this.eyo.comment_variant_p = newValue
            ? eYo.Key.COMMENT
            : eYo.Key.NONE
          this.$emit('synchronize')
        }
      },
      comment: {
        get () {
          return this.comment_
        },
        set (newValue) {
          this.comment_ = this.eyo.comment_p = newValue
          this.$emit('synchronize')
        }
      }
    },
    created () {
      this.comment_ = this.eyo.comment_p
      if (!this.commentVariant) {
        this.myCommentVariant_ = this.eyo.comment_variant_p
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
