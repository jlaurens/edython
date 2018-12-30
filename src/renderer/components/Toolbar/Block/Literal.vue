<template>
  <b-btn-group
    id="block-literal"
      key-nav
      aria-label="Block toolbar literal"
      class="b3k-edit-content">
    <div
      class="item">
      <input
        type="checkbox"
        v-model="r"
        :disabled="!can_r"
        :title="title_r"
        v-tippy>
    </div>
    <div
      class="item text eyo-code-reserved"
      >r</div>
    <div
      class="item">
      <input
        type="checkbox"
        v-model="b"
        :disabled="!can_b"
        :title="title_b"
        v-tippy>
    </div>
    <div
      class="item text eyo-code-reserved"
    >b</div>
    <div
      class="item">
      <input
        type="checkbox"
        v-model="f"
        :disabled="!can_f"
        :title="title_f"
        v-tippy>
    </div>
    <div
      class="item text eyo-code-reserved"
    >f</div>
    <literal-quote></literal-quote>
    <b-input
      v-model="content"
      type="text"
      class="item text"
      size="20"
      :style='{fontFamily: $$.eYo.Font.familyMono}'
      :title="title_content"
      v-tippy></b-input>
    <literal-quote></literal-quote>
  </b-btn-group>
</template>

<script>
  import {mapGetters} from 'vuex'
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
    computed: {
      ...mapGetters('Selected', [
        'eyo',
        'step'
      ]),
      prefix: {
        get () {
          this.$$synchronize(this.step)
          return this.prefix_
        },
        set (newValue) {
          this.eyo.prefix_p = newValue
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
        return this.$$t('block.tooltip.literal.raw')
      },
      content_f () {
        return 'f'
      },
      title_f () {
        return this.$$t('block.tooltip.literal.format')
      },
      content_b () {
        return 'b'
      },
      title_b () {
        return this.$$t('block.tooltip.literal.byte')
      },
      content: {
        get () {
          this.$$synchronize(this.step)
          return this.content_
        },
        set (newValue) {
          this.eyo.content_p = newValue
        }
      },
      title_content () {
        return this.$$t('block.one_line_of_text')
      }
    },
    methods: {
      $$doSynchronize (eyo) {
        this.prefix_ = eyo.prefix_p.toLowerCase()
        this.content_ = eyo.content_p
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
