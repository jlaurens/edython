<template>
  <b-btn-group
    v-if="canComment"
    id="brick-stmt-comment"
    class="b3k-edit-comment"
  >
    <div
      class="item"
    >
      <input
        v-model="hasComment"
        type="checkbox"
        aria-label="Checkbox to enable comment"
        :disabled="mustComment"
      ><span
        class="pl-2 eyo-code-reserved"
      >#</span>
    </div>
    <b-input
      v-model="comment"
      type="text"
      :class="$$class"
      :disabled="!hasComment"
      aria-label="Comment input"
      :placeholder="$$t('brick.placeholder.comment')"
    />
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
    name: 'InfoStmtComment',
    data: function () {
        return {
            saved_step: undefined,
            variant_: undefined,
            comment_: undefined,
            hasComment_: undefined,
            commentVariant_: undefined
        }
    },
    computed: {
        ...mapState('Selected', [
            'step'
        ]),
        ...mapGetters('Selected', [
            'eyo'
        ]),
        $$class: {
            get () {
                return `eyo-code and item${this.hasComment ? ' text' : ''}${this.comment.length ? '' : ' placeholder'} w-24rem`
            }
        },
        canComment () {
            return this.eyo && this.eyo.comment_d
        },
        commentVariant: {
            get () {
                this.$$synchronize(this.step)
                return this.commentVariant_
            },
            set (newValue) {
                this.eyo.comment_variant_p = newValue
            }
        },
        mustComment () {
            this.$$synchronize(this.step)
            return this.eyo.type === eYo.T3.Stmt.any_expression && this.eyo.expression_d && (this.variant !== eYo.Key.EXPRESSION)
        },
        variant () {
            this.$$synchronize(this.step)
            return this.variant_
        },
        hasComment: {
            get () {
                this.$$synchronize(this.step)
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
                this.$$synchronize(this.step)
                return this.comment_
            },
            set (newValue) {
                this.eyo.comment_p = newValue
            }
        }
    },
    methods: {
        $$doSynchronize (eyo) {
            this.variant_ = eyo.variant_p
            this.comment_ = eyo.comment_p
            if (this.comment_ && !goog.isString(this.comment_)) {
                // sometimes, I receive an object named `observer`, this might be related to Vuejs...
                this.comment_ = eyo.comment_p = ''
            }
            if (this.mustComment) {
                eyo.comment_variant_p = eYo.Key.COMMENT
            }
            this.commentVariant_ = eyo.comment_variant_p
            this.hasComment_ = this.commentVariant_ === eYo.Key.COMMENT
        }
    }
}
</script>
<style>
</style>
