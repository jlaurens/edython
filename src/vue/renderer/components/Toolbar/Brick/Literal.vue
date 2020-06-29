<template>
  <b-btn-group
    id="brick-literal"
    key-nav
    aria-label="Brick toolbar literal"
    class="b3k-edit-content"
  >
    <b-btn-group
      v-if="selectedMode > $$.eYo.App.BASIC"
    >
      <div
        class="item"
      >
        <input
          v-model="r"
          v-tippy
          type="checkbox"
          :disabled="!can_r"
          :title="title_r"
        >
      </div><div
        class="item text eyo-code-reserved"
      >
        r
      </div><div
        class="item"
      >
        <input
          v-model="b"
          v-tippy
          type="checkbox"
          :disabled="!can_b"
          :title="title_b"
        >
      </div><div
        class="item text eyo-code-reserved"
      >
        b
      </div><div
        class="item"
      >
        <input
          v-model="f"
          v-tippy
          type="checkbox"
          :disabled="!can_f"
          :title="title_f"
        >
      </div><div
        class="item text eyo-code-reserved"
      >
        f
      </div>
    </b-btn-group>
    <literal-quote
      ref="quote"
    />
    <b-input
      v-model="content"
      v-tippy
      type="text"
      :class="$$class"
      size="20"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
      :title="title_content"
    />
    <literal-quote />
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import LiteralQuote from './Literal/Quote.vue'

export default {
  name: 'InfoLiteral',
  components: {
    LiteralQuote
  },
  data () {
    return {
      saved_step: undefined,
      prefix_: undefined,
      content_: undefined,
      invalid: false
    }
  },
  computed: {
    ...mapState('UI', [
      'selectedMode'
    ]),
    ...mapState('Selected', [
      'step'
    ]),
    ...mapGetters('Selected', [
      'eyo'
    ]),
    $$class () {
      return `item text w-24rem${this.invalid ? ' invalid' : ''}`
    },
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
      set (newValue) { // eslint-disable-line no-unused-vars
        this.do_r()
      }
    },
    f: {
      get () {
        return this.prefix.indexOf('f') >= 0
      },
      set (newValue) { // eslint-disable-line no-unused-vars
        this.do_f()
      }
    },
    b: {
      get () {
        return this.prefix.indexOf('b') >= 0
      },
      set (newValue) { // eslint-disable-line no-unused-vars
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
      return false
    },
    content_r () {
      return 'r'
    },
    title_r () {
      return this.$$t('brick.tooltip.literal.raw')
    },
    content_f () {
      return 'f'
    },
    title_f () {
      return this.$$t('brick.tooltip.literal.format')
    },
    content_b () {
      return 'b'
    },
    title_b () {
      return this.$$t('brick.tooltip.literal.byte')
    },
    content: {
      get () {
        this.$$synchronize(this.step)
        return this.content_
      },
      set (newValue) {
        this.eyo.changeWrap(() => {
          this.eyo.content_p = newValue
          this.invalid = newValue !== this.eyo.content_p
          this.$refs.quote.$$contentDidChange()
        })
      }
    },
    title_content () {
      return this.$$t('brick.one_line_of_text')
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
  #brick-literal {
    padding: 0 0.25rem;
  }
</style>
