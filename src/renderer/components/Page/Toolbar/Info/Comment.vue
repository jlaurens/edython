<template>
  <b-button-toolbar>
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
    computed: {
      placeholder () {
        return eYo.Msg.Placeholder.COMMENT
      },
      selectedBlock () {
        var id = this.$store.state.UI.selectedBlockId
        var block = id && this.$$.eYo.App.workspace.blockDB_[id]
        return block
      },
      hasComment: {
        get () {
          var block = this.selectedBlock
          if (block) {
            var comment_variant_d = block.eyo.data.comment_variant
            if (comment_variant_d) {
              return comment_variant_d.get() === comment_variant_d.COMMENT
            }
          }
          return false
        },
        set (newValue) {
          var block = this.selectedBlock
          if (block) {
            var comment_variant_d = block.eyo.data.comment_variant
            if (comment_variant_d) {
              comment_variant_d.set(newValue ? comment_variant_d.COMMENT : comment_variant_d.NO_COMMENT)
            }
          }
        }
      },
      comment: {
        get () {
          var block = this.selectedBlock
          if (block) {
            var comment_d = block.eyo.data.comment
            if (comment_d) {
              return comment_d.get()
            }
          }
          return undefined
        },
        set (newValue) {
          var block = this.selectedBlock
          if (block) {
            var comment_d = block.eyo.data.comment
            if (comment_d) {
              comment_d.set(newValue)
            }
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
