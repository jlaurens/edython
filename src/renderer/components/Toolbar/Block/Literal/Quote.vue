<template>
  <b-dd variant="outline-secondary" :text="chosen" class="eyo-code-reserved item text mw-4rem">
    <template slot="button-content"><span class="eyo-code-reserved">{{chosen}}</span></template>
    <b-dd-item-button v-for="choice in choices" v-on:click="chosen = choice" :key="choice" :title="other_title(choice)" v-tippy v-html="as_html(choice)"></b-dd-item-button>
  </b-dd>
</template>

<script>
  export default {
    name: 'block-literal-quote',
    data () {
      return {
        saved_step: undefined,
        delimiter_: undefined,
        other_delimiter_: undefined
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
      choices: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return [this.other_delimiter_]
        }
      },
      chosen: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.delimiter_
        },
        set (newValue) {
          this.eyo.delimiter_p = newValue
          this.$$synchronize() // could not avoid
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
        this.delimiter_ = this.eyo.delimiter_p
        this.other_delimiter_ = {
          '\'': '"',
          '"': '\'',
          '\'\'\'': '"""',
          '"""': '\'\'\''
        }[this.delimiter_]
      },
      as_html (choice) {
        return `<span class="eyo-code-reserved">${choice}</span>`
      },
      other_title (choice) {
        return this.$$t({
          '\'': 'block.tooltip.quote.single',
          '"': 'block.tooltip.quote.double',
          '\'\'\'': 'block.tooltip.quote.single',
          '"""': 'block.tooltip.quote.double'
        }[choice])
      }
    }
  }
</script>
<style>
</style>
  
