<template>
  <b-btn-group
    v-if="show_ry"
    id="brick-primary-ry"
    key-nav
    aria-label="Block primary ary"
    class="deeper"
  >
    <b-input
      v-model="mandatory"
      type="text"
      class="eyo-code item w-2rem"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
    />
    <b-dd
      class="eyo-code item mw-4rem"
      variant="outline-secondary"
    >
      <b-dd-item-button
        v-for="item in items"
        :key="item"
        class="eyo-code eyo-content"
        @click="mandatory = item"
        v-html="item"
      />
    </b-dd>
    <div
      class="eyo-label eyo-code item"
    >
      ≤ # args ≤
    </div>
    <b-input
      v-model="ary"
      type="text"
      class="eyo-code item w-2rem"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
    />
    <b-dd
      class="eyo-code item mw-4rem"
      variant="outline-secondary"
    >
      <b-dd-item-button
        v-for="item in items"
        :key="item"
        class="eyo-code eyo-content w-4"
        @click="ary = item"
        v-html="item"
      />
    </b-dd>
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
    name: 'BrickPrimaryRy',
    props: {
        ismethod: {
            type: Boolean,
            default: false
        }
    },
    data: function () {
        return {
            saved_step: 0,
            variant_: undefined,
            can_ry: true,
            ary_: Infinity,
            mandatory_: 0,
            items: ['0', '1', '2', '3', '4', '5', '∞']
        }
    },
    computed: {
        ...mapState('Selected', [
            'step'
        ]),
        ...mapGetters('Selected', [
            'eyo'
        ]),
        ...mapState('UI', {
            brickEditShowRy: state => state.brickEditShowRy
        }),
        variant () {
            this.$$synchronize(this.step)
            return this.variant_
        },
        show_ry () {
            return this.brickEditShowRy && !this.ismethod && (this.variant === eYo.Key.CALL_EXPR) && this.can_ry
        },
        ary: {
            get () {
                this.$$synchronize(this.step)
                return this.ary_ === Infinity
                    ? '∞'
                    : this.ary_.toString()
            },
            set (newValue) {
                var filtered = newValue === '∞'
                    ? Infinity
                    : Number(newValue)
                if (!isNaN(filtered)) {
                    this.eyo.ary_p = filtered
                }
            }
        },
        mandatory: {
            get () {
                this.$$synchronize(this.step)
                return this.mandatory_ === Infinity
                    ? '∞'
                    : this.mandatory_.toString()
            },
            set (newValue) {
                var filtered = newValue === '∞'
                    ? Infinity
                    : Number(newValue)
                if (!isNaN(filtered)) {
                    this.eyo.mandatory_p = filtered
                }
            }
        }
    },
    methods: {
        $$doSynchronize (eyo) {
            this.variant_ = eyo.variant_p
            var p5e = eyo.profile_p.p5e
            this.can_ry_ = !p5e || !p5e.item
            this.ary_ = eyo.ary_p
            this.mandatory_ = eyo.mandatory_p
        }
    }
}
</script>
<style>
</style>
