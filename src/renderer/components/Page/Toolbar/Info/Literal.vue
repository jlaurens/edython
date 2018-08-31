<template>
  <b-button-toolbar id="info-literal" key-nav  aria-label="Info toolbar literal" justify>
    <b-button-toolbar>
      <div id='info-literal-keyword' class="btn btn-outline-secondary">
        <input type="checkbox" id="info-literal-r" v-model="r" :disabled="!can_r">
        <label for="info-literal-r" class="eyo-code">r</label>
        <input type="checkbox" id="info-literal-b" v-model="b" :disabled="!can_b">
        <label for="info-literal-b" class="eyo-code">b</label>
        <input type="checkbox" id="info-literal-f" v-model="f" :disabled="!can_f">
        <label for="info-literal-f" class="eyo-code" :disabled="!can_f">f</label>
      </div>
      <b-button-group class="mx-1">
        <b-btn :disabled="doubleQuote" v-on:click="doDoubleQuote()" :title="titleDoubleQuote" v-tippy>
          {{contentDoubleQuote}}
        </b-btn>
        <b-btn :disabled="singleQuote" v-on:click="doSingleQuote()" :title="titleSingleQuote" v-tippy>
          {{contentSingleQuote}}
        </b-btn>
      </b-button-group>
      <comment :selected-block="selectedBlock"></comment>
    </b-button-toolbar>
    <common :selected-block="selectedBlock"></common>
  </b-button-toolbar>
</template>

<script>
  import Comment from './Comment.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-literal',
    data: function () {
      return {
      }
    },
    components: {
      Comment,
      Common
    },
    props: {
      selectedBlock: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      data () {
        return this.selectedBlock.eyo.data
      },
      doubleQuote () {
        return this.data.delimiter.get() === '"'
      },
      contentDoubleQuote () {
        return '"…"'
      },
      titleDoubleQuote () {
        return 'Utiliser des guillemets droits doubles'
      },
      singleQuote () {
        return this.data.delimiter.get() === '\''
      },
      contentSingleQuote () {
        return '\'…\''
      },
      titleSingleQuote () {
        return 'Utiliser des guillemets droits simples'
      },
      prefix () {
        return this.data.prefix.get().toLowerCase()
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
          var content = this.selectedBlock.eyo.data.content.get()
          if (!content.length) {
            return true
          }
          var value = this.selectedBlock.eyo.data.value.get()
          var can = !!XRegExp.exec(value, this.$$.eYo.XRE.longbytesliteralSingleNoPrefix) || !!XRegExp.exec(value, this.$$.eYo.XRE.longbytesliteralDoubleNoPrefix) || !!XRegExp.exec(value, this.$$.eYo.XRE.shortbytesliteralSingleNoPrefix) || !!XRegExp.exec(value, this.$$.eYo.XRE.shortbytesliteralDoubleNoPrefix)
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
      }
    },
    whatch: {
      indeterminate (oldValue, newValue) {
        var el = document.getElementById('info-literal-checkbox-bytes')
        el.indeterminate = newValue
      }
    },
    methods: {
      doDoubleQuote () {
        this.data.delimiter.set('"')
        this.selectedBlock.render()
      },
      doSingleQuote () {
        this.data.delimiter.set('\'')
        this.selectedBlock.render()
      },
      do_r () {
        this.data.prefix.set({
          '': 'r',
          'r': '',
          'b': 'rb',
          'f': 'rf',
          'rf': 'f',
          'fr': 'f',
          'rb': 'b',
          'br': 'b'
        }[this.prefix])
        this.selectedBlock.render()
      },
      do_b () {
        this.data.prefix.set({
          '': 'b',
          'b': '',
          'r': 'rb',
          'rb': 'r',
          'br': 'r'
        }[this.prefix])
        this.selectedBlock.render()
      },
      do_f () {
        this.data.prefix.set({
          '': 'f',
          'f': '',
          'r': 'rf',
          'rf': 'r',
          'fr': 'r'
        }[this.prefix])
        this.selectedBlock.render()
      }
    }
  }
</script>
<style>
  #info-literal {
    padding: 0 0.25rem;
  }
</style>
