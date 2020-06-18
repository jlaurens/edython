<template>
  <b-btn-group
    v-if="canChoose"
    id="brick-enclosure"
    key-nav
    aria-label="Brick toolbar enclosure"
    class="b3k-edit-content"
  >
    <b-dd
      variant="outline-secondary"
    >
      <template
        slot="button-content"
        v-html="as_html(chosen)"
      />
      <b-dd-item-button
        v-for="choice in choices"
        :key="choice"
        v-tippy
        :title="other_title(choice)"
        @click="chosen = choice"
        v-html="as_html(choice)"
      />
    </b-dd>
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
  
export default {
    name: 'InfoEnclosure',
    data: function () {
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
        canChoose: {
            get () {
                this.$$synchronize(this.step)
                return this.other_variants_.length > 0
            }
        },
        choices: {
            get () {
                this.$$synchronize(this.step)
                return this.other_variants_
            }
        },
        chosen: {
            get () {
                this.$$synchronize(this.step)
                return this.variant_
            },
            set (newValue) {
                this.eyo.variant_p = newValue
            }
        }
    },
    methods: {
        $$doSynchronize (eyo) {
            this.variant_ = eyo.variant_p
            if (this.variant_ === eYo.Key.PAR) {
                // this is a parenth_form
                var target = eyo.firstTarget
                if (target) {
                    if (target.type === eYo.T3.Expr.yield_expression) {
                        this.other_variants_ = []
                    } else {
                        this.other_variants_ = [eYo.Key.SQB, eYo.Key.BRACE]
                    }
                } else {
                    this.other_variants_ = [eYo.Key.SQB, eYo.Key.BRACE]
                }
            } else if (this.variant_ === eYo.Key.SQB) {
                this.other_variants_ = [eYo.Key.PAR, eYo.Key.BRACE]
            } else /* if (this.variant_ === eYo.Key.BRACE) */ {
                target = eyo.firstTarget
                if (target) {
                    if (target.type === eYo.T3.Expr.dict_comprehension) {
                        this.other_variants_ = []
                    } else if (eYo.T3.Expr.Check.key_datum_all.indexOf(target.type) >= 0) {
                        this.other_variants_ = []
                    } else {
                        this.other_variants_ = [eYo.Key.PAR, eYo.Key.SQB]
                    }
                } else {
                    this.other_variants_ = [eYo.Key.PAR, eYo.Key.SQB]
                }
            }
        },
        as_html (choice) {
            return `<span>${{
                [eYo.Key.PAR]: '(…)',
                [eYo.Key.SQB]: '[…]',
                [eYo.Key.BRACE]: '{…}'
            }[choice]}</span>`
        },
        other_title (choice) {
            return this.$$t({
                [eYo.Key.PAR]: 'brick.tooltip.enclosure.PAR',
                [eYo.Key.SQB]: 'brick.tooltip.enclosure.SQB',
                [eYo.Key.BRACE]: 'brick.tooltip.enclosure.BRACE'
            }[choice])
        }
    }
}
</script>
<style>
  #brick-literal {
    padding: 0 0.25rem;
  }
</style>
