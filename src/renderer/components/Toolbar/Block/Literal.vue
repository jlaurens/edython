<template>
  <b-btn-group id="block-literal" key-nav  aria-label="Block toolbar literal" class="eyo-block-edit-content">
    <div class="input-group-text">
      <input type="checkbox" v-model="r" :disabled="!can_r" :title="title_r" v-tippy>
    </div>
    <div class="input-group-text eyo-label eyo-code-reserved">r</div>
    <div class="input-group-text">
      <input type="checkbox" v-model="b" :disabled="!can_b" :title="title_b" v-tippy>
    </div>
    <div class="input-group-text eyo-label eyo-code-reserved">b</div>
    <div class="input-group-text">
      <input type="checkbox" v-model="f" :disabled="!can_f" :title="title_f" v-tippy>
    </div>
    <div class="input-group-text eyo-label eyo-code-reserved">f</div>
    <literal-quote :eyo="eyo" :step="step"></literal-quote>
    <b-form-input v-model="content" type="text" class="eyo-btn-inert btn-outline-secondary eyo-form-input-text" size="20" :style='{fontFamily: $$.eYo.Font.familyMono}' :title="title_content" v-tippy></b-form-input>
    <literal-quote :eyo="eyo" :step="step"></literal-quote>
  </b-btn-group>
</template>

<script>
  import LiteralQuote from './Literal/Quote.vue'

  export default {
    name: 'info-literal',
    data: function () {
      return {
        saved_step: undefined,
        prefix_: undefined,
        content_: undefined
      }
    },
    components: {
      LiteralQuote
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
      prefix: {
        get () {
          var id = this.$store.state.UI.selectedBlockId
          if (id) {
            this.$$synchronize()
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
          (this.saved_step === this.step) || this.$$synchronize()
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
        this.saved_step = this.eyo.change.step
        this.prefix_ = this.eyo.prefix_p.toLowerCase()
        this.content_ = this.eyo.content_p
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
      }
    }
  }
</script>
<style>
  #block-literal {
    padding: 0 0.25rem;
  }
</style>
