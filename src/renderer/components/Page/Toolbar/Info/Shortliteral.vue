<template>
  <b-button-toolbar id="info-shortliteral" key-nav  aria-label="Info toolbar shortliteral" justify>
      <b-button-toolbar>
    <b-button-group class="mx-1">
      <b-btn :pressed="r" :disabled="!can_r" v-on:click="do_r()" :title="title_r" v-tippy>
        {{content_r}}
      </b-btn>
      <b-btn :pressed="b" :disabled="!can_b" v-on:click="do_b()" :title="title_b" v-tippy>
        {{content_b}}
      </b-btn>
      <b-btn :pressed="f" :disabled="!can_f" v-on:click="do_f()" :title="title_f" v-tippy>
        {{content_f}}
      </b-btn>
    </b-button-group>
    <b-button-group class="mx-1">
      <b-btn :disabled="doubleQuote" v-on:click="doDoubleQuote()" :title="titleDoubleQuote" v-tippy>
        {{contentDoubleQuote}}
      </b-btn>
      <b-btn :disabled="singleQuote" v-on:click="doSingleQuote()" :title="titleSingleQuote" v-tippy>
        {{contentSingleQuote}}
      </b-btn>
    </b-button-group>
  </b-button-toolbar>
    <common></common>
  </b-button-toolbar>
</template>

<script>
  import Common from './Common.vue'

  export default {
    name: 'info-shortliteral',
    data: function () {
      return {
      }
    },
    components: {
      Common
    },
    computed: {
      selectedBlock () {
        var id = this.$store.state.UI.selectedBlockId
        return id && this.$$.eYo.App.workspace.blockDB_[id]
      },
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
      r () {
        return this.prefix.indexOf('r') >= 0
      },
      f () {
        return this.prefix.indexOf('f') >= 0
      },
      b () {
        return this.prefix.indexOf('b') >= 0
      },
      can_r () {
        return ['', 'r', 'b', 'f', 'rf', 'fr', 'br', 'rb'].indexOf(this.prefix) >= 0
      },
      can_f () {
        return ['', 'r', 'f', 'fr', 'rf'].indexOf(this.prefix) >= 0
      },
      can_b () {
        return ['', 'r', 'b', 'br', 'rb'].indexOf(this.prefix) >= 0
      },
      content_r () {
        return 'r'
      },
      title_r () {
        return 'préfixe r pour raw'
      },
      content_f () {
        return 'f'
      },
      title_f () {
        return 'préfixe f pour format'
      },
      content_b () {
        return 'b'
      },
      title_b () {
        return 'préfixe b pour bytes'
      }
    },
    methods: {
      doDoubleQuote () {
        this.data.delimiter.set('"')
      },
      doSingleQuote () {
        this.data.delimiter.set('\'')
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
      },
      do_b () {
        this.data.prefix.set({
          '': 'b',
          'b': '',
          'r': 'rb',
          'rb': 'r',
          'br': 'r'
        }[this.prefix])
      },
      do_f () {
        this.data.prefix.set({
          '': 'f',
          'f': '',
          'r': 'rf',
          'rf': 'r',
          'fr': 'r'
        }[this.prefix])
      }
    }
  }
</script>
<style>
</style>
