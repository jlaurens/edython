<template>
  <b-dd
    variant="outline-secondary"
    :text="chosen"
    :class="$$class"
  >
    <template
      slot="button-content"
    >
      <span
        :class="reserved"
      >{{ chosen }}</span>
    </template>
    <b-dd-item-button
      v-for="choice in choices"
      :key="choice"
      v-tippy
      :title="other_title(choice)"
      @click="chosen = choice"
      v-html="as_html(choice)"
    />
  </b-dd>
</template>

<script>
import {mapState, mapGetters, mapMutations} from 'vuex'

export default {
    name: 'BrickLiteralQuote',
    data () {
        return {
            saved_step: undefined,
            delimiter_: undefined,
            other_delimiter_: undefined
        }
    },
    computed: {
        ...mapState('Selected', [
            'step'
        ]),
        ...mapState('Block', [
            'invalidDelimiter',
            'invalidDelimiterId'
        ]),
        ...mapGetters('Selected', [
            'eyo'
        ]),
        $$class () {
            return `eyo-code-reserved item text mw-4rem${this.invalidDelimiter ? ' invalid' : ''}`
        },
        choices: {
            get () {
                this.$$synchronize(this.step)
                return [this.other_delimiter_]
            }
        },
        reserved: {
            cache: false,
            get () {
                return `eyo-code-reserved${this.invalidDelimiter ? ' invalid' : ''}`
            }
        },
        chosen: {
            get () {
                this.$$synchronize(this.step)
                return this.invalidDelimiter || this.delimiter_
            },
            set (newValue) {
                if (this.eyo.validateComponents({delimiter: newValue})) {
                    this.eyo.delimiter_p = newValue
                    this.setInvalidDelimiter(undefined)
                    this.setInvalidDelimiterId(undefined)
                } else {
                    this.setInvalidDelimiter(newValue)
                    this.setInvalidDelimiterId(this.eyo.id)
                }
            }
        }
    },
    methods: {
        ...mapMutations('Block', [
            'setInvalidDelimiter',
            'setInvalidDelimiterId'
        ]),
        $$doSynchronize (eyo) {
            this.delimiter_ = eyo.delimiter_p
            if (this.invalidDelimiterId !== this.eyo.id || this.invalidDelimiter === this.delimiter_) {
                this.setInvalidDelimiter(undefined)
                this.setInvalidDelimiterId(undefined)
            }
            this.other_delimiter_ = {
                '\'': '"',
                '"': '\'',
                '\'\'\'': '"""',
                '"""': '\'\'\''
            }[this.delimiter_]
        },
        $$contentDidChange () {
            if (this.invalidDelimiter) {
                this.chosen = this.invalidDelimiter
            }
        },
        as_html (choice) {
            return `<span class="eyo-code-reserved">${choice}</span>`
        },
        other_title (choice) {
            return this.$$t({
                '\'': 'brick.tooltip.quote.single',
                '"': 'brick.tooltip.quote.double',
                '\'\'\'': 'brick.tooltip.quote.single',
                '"""': 'brick.tooltip.quote.double'
            }[choice])
        }
    }
}
</script>
<style>
</style>
  
