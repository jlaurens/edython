<template>
  <b-btn-group id="block-stmt-comment" class="b3k-edit-comment" v-if="canComment">
    <div class="item">
      <input type="checkbox" aria-label="Checkbox to enable comment" v-model="hasComment" :disabled="mustComment">
      <span class="pl-2 eyo-code-reserved">#</span>
    </div>
    <b-input type="text"
      :class="$$class" v-model="comment" :disabled="!hasComment" aria-label="Comment input" :placeholder="$t('message.placeholder_comment')"></b-input>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'info-stmt-comment',
    data: function () {
      return {
        saved_step: undefined,
        variant_: undefined,
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
      step: {
        type: Number,
        default: 0
      }
    },
    computed: {
      $$class: {
        get () {
          return `eyo-code and item${this.hasComment ? ' text' : ''}${this.comment.length ? '' : ' placeholder'} w-16rem`
        }
      },
      canComment () {
        return this.eyo && this.eyo.comment_d
      },
      commentVariant: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.commentVariant_
        },
        set (newValue) {
          this.eyo.comment_variant_p = newValue
        }
      },
      mustComment () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.eyo.expression_d && (this.variant !== eYo.Key.EXPRESSION)
      },
      variant () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.variant_
      },
      hasComment: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.hasComment_
        },
        set (newValue) {
          this.commentVariant = newValue || this.mustComment
            ? eYo.Key.COMMENT
            : eYo.Key.NONE
        }
      },
      comment: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.comment_
        },
        set (newValue) {
          this.eyo.comment_p = newValue
        }
      }
    },
    created () {
      this.$$synchronize()
    },
    beforeUpdate () {
      (this.saved_step === this.step) || this.$$synchronize()
    },
    methods: {
      $$synchronize () {
        if (!this.eyo || (this.saved_step === this.step)) {
          return
        }
        this.saved_step = this.step
        this.variant_ = this.eyo.variant_p
        this.comment_ = this.eyo.comment_p
        if (this.comment_ && !goog.isString(this.comment_)) {
          // sometimes, I receive an object named `observer`, this might be related to Vuejs...
          this.comment_ = this.eyo.comment_p = ''
        }
        if (this.mustComment) {
          this.eyo.comment_variant_p = eYo.Key.COMMENT
        }
        this.commentVariant_ = this.eyo.comment_variant_p
        this.hasComment_ = this.commentVariant_ === eYo.Key.COMMENT
      }
    }
  }
</script>
<style>
</style>
