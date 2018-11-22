<template>
  <b-btn-group id="block-stmt-comment" class="eyo-block-edit-comment" v-if="canComment">
    <div class="input-group btn-outline-secondary eyo-btn-inert">
      <div class="input-group-prepend">
        <div class="input-group-text">
          <input type="checkbox" aria-label="Checkbox to enable comment" v-model="hasComment" :disabled="mustComment">
          <span class="pl-2 eyo-code-reserved">#</span>
        </div>
      </div>
      <input type="text"
      class="form-control eyo-code-comment" v-model="comment" :disabled="!hasComment" aria-label="Comment input">
    </div>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'info-stmt-comment',
    data: function () {
      return {
        step_: undefined,
        comment_: undefined,
        hasComment_: undefined,
        commentVariant_: undefined
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
      }
    },
    computed: {
      canComment () {
        return this.eyo && this.eyo.comment_d
      },
      commentVariant: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
          return this.commentVariant_
        },
        set (newValue) {
          this.eyo.comment_variant_p = newValue
        }
      },
      hasComment: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
          return this.hasComment_
        },
        set (newValue) {
          this.commentVariant = newValue || this.mustComment
            ? eYo.Key.COMMENT
            : eYo.Key.NONE
          this.synchronize()
        }
      },
      comment: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
          return this.comment_
        },
        set (newValue) {
          this.eyo.comment_p = newValue
          this.$emit('synchronize')
        }
      }
    },
    created () {
      this.synchronize()
    },
    updated () {
      this.synchronize()
    },
    methods: {
      synchronize () {
        this.step_ = this.eyo.change.step
        this.comment_ = this.eyo.comment_p
        if (this.mustComment) {
          this.eyo.comment_variant_p = eYo.Key.COMMENT
        }
        this.commentVariant_ = this.eyo.comment_variant_p
        this.hasComment_ = this.commentVariant_ === eYo.Key.COMMENT
      }
    }
  }
</script>
<style scoped>
  label {
    margin: 0;
  }
  .form-control {
    margin: 0;
    padding: 0 0.25rem;
  }
</style>
