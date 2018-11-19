<template>
  <b-button-toolbar id="info-literal" key-nav  aria-label="Info toolbar literal" justify>
    <div id='info-literal-keyword' class="btn btn-outline-secondary">
      <input type="checkbox" id="info-literal-r" v-model="r" :disabled="!can_r" :title="title_r" v-tippy>
      <label for="info-literal-r" class="eyo-code">r</label>
      <input type="checkbox" id="info-literal-b" v-model="b" :disabled="!can_b" :title="title_b" v-tippy>
      <label for="info-literal-b" class="eyo-code">b</label>
      <input type="checkbox" id="info-literal-f" v-model="f" :disabled="!can_f" :title="title_f" v-tippy>
      <label for="info-literal-f" class="eyo-code" :disabled="!can_f">f</label>
    </div>
    <span class="eyo-code-reserved" d>{{delimiter}}</span>
    <b-button-group class="mx-1">
      <b-form-input v-model="content" type="text" class="btn btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}' :title="title_content" v-tippy ></b-form-input>
    </b-button-group>
    <span class="eyo-code-reserved" d>{{delimiter}}</span>
    <b-button-group class="mx-1">
      <b-btn v-on:click="doOtherQuote()" :title="titleOtherQuote" v-tippy class="btn-outline-secondary eyo-code-reserved">
        {{otherQuote}}
      </b-btn>
    </b-button-group>
    <comment :eyo="eyo" :must-comment="mustComment" :comment-variant="commentVariant" v-on:synchronize="synchronize"></comment>
  </b-button-toolbar>
</template>

<script>
  import Comment from './Comment.vue'

  export default {
    name: 'info-literal',
    data: function () {
      return {
        step_: undefined,
        prefix_: undefined,
        delimiter_: undefined,
        long_: undefined,
        content_: undefined
      }
    },
    components: {
      Comment
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      delimiter: {
        get () {
          return this.delimiter_
        },
        set (newValue) {
          this.delimiter_ = this.eyo.delimiter_p = newValue
        }
      },
      singleQuote () {
        return this.long_ ? '\'\'\'' : '\''
      },
      doubleQuote () {
        return this.long_ ? '"""' : '"'
      },
      isSingleQuote () {
        return this.delimiter_ === this.singleQuote
      },
      otherQuote () {
        return this.isSingleQuote ? this.doubleQuote : this.singleQuote
      },
      titleOtherQuote () {
        return this.isSingleQuote
          ? this.$t('message.use_double_quotes_in_long_literal')
          : this.$t('message.use_single_quotes_in_long_literal')
      },
      prefix: {
        get () {
          var id = this.$store.state.UI.selectedBlockId
          if (id) {
            this.synchronize()
          }
          return this.prefix_
        },
        set (newValue) {
          this.prefix_ = this.eyo.prefix_p = newValue
        }
      },
      r: {
        get () {
          return this.prefix.indexOf('r') >= 0
        },
        set (newValue) {
          this.do_r()
        }
      },
      f: {
        get () {
          return this.prefix.indexOf('f') >= 0
        },
        set (newValue) {
          this.do_f()
        }
      },
      b: {
        get () {
          return this.prefix.indexOf('b') >= 0
        },
        set (newValue) {
          this.do_b()
        }
      },
      can_r () {
        return ['', 'r', 'b', 'f', 'rf', 'fr', 'br', 'rb'].indexOf(this.prefix) >= 0
      },
      can_f () {
        return ['', 'r', 'f', 'fr', 'rf'].indexOf(this.prefix) >= 0
      },
      can_b () {
        if (['b', 'br', 'rb'].indexOf(this.prefix) >= 0) {
          return true
        }
        if (['', 'r'].indexOf(this.prefix) >= 0) {
          var content = this.eyo.content_p
          if (!content.length) {
            return true
          }
          var value = this.eyo.value_p
          var can = !!XRegExp.exec(value, eYo.XRE.longbytesliteralSingleNoPrefix) || !!XRegExp.exec(value, eYo.XRE.longbytesliteralDoubleNoPrefix) || !!XRegExp.exec(value, eYo.XRE.shortbytesliteralSingleNoPrefix) || !!XRegExp.exec(value, eYo.XRE.shortbytesliteralDoubleNoPrefix)
          return can
        }
      },
      content_r () {
        return 'r'
      },
      title_r () {
        return this.$t('message.prefix_r_for_raw')
      },
      content_f () {
        return 'f'
      },
      title_f () {
        return this.$t('message.prefix_f_for_format')
      },
      content_b () {
        return 'b'
      },
      title_b () {
        return this.$t('message.prefix_b_for_byte')
      },
      content: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
          return this.content_
        },
        set (newValue) {
          this.content_ = this.eyo.content_p = newValue
        }
      },
      title_content () {
        return this.$t('message.one_line_of_text')
      }
    },
    methods: {
      doOtherQuote () {
        this.delimiter = this.long_
          ? this.isSingleQuote ? '"""' : '\'\'\''
          : this.isSingleQuote ? '"' : '\''
      },
      do_r () {
        this.prefix = {
          '': 'r',
          'r': '',
          'b': 'rb',
          'f': 'rf',
          'rf': 'f',
          'fr': 'f',
          'rb': 'b',
          'br': 'b'
        }[this.prefix]
      },
      do_b () {
        this.prefix = {
          '': 'b',
          'b': '',
          'r': 'rb',
          'rb': 'r',
          'br': 'r'
        }[this.prefix]
      },
      do_f () {
        this.prefix = {
          '': 'f',
          'f': '',
          'r': 'rf',
          'rf': 'r',
          'fr': 'r'
        }[this.prefix]
      },
      synchronize () {
        this.step_ = this.eyo.change.step
        this.prefix_ = this.eyo.prefix_p.toLowerCase()
        this.delimiter_ = this.eyo.delimiter_p
        this.long_ = this.delimiter_.length === 3
        this.content_ = this.eyo.content_p
      }
    },
    created () {
      this.synchronize()
    },
    updated () {
      this.synchronize()
    }
  }
</script>
<style>
  #info-literal {
    padding: 0 0.25rem;
  }
</style>
