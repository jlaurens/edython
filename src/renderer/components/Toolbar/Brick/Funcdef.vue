<template>
  <b-btn-group>
    <div
      class="item text eyo-code-reserved"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
    >
      def
    </div>
    <b-form-input
      id="brick-funcdef-name"
      v-model="name"
      v-tippy
      type="text"
      :class="$$class(name)"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
      :title="title"
    />
    <div
      class="item text"
      v-html="ry"
    />
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
  
export default {
    name: 'BrickFuncdef',
    props: {
        slotholder: {
            type: Function,
            default: function (item) {
                return item
            }
        }
    },
    data: function () {
        return {
            saved_step: undefined,
            name_: undefined
        }
    },
    computed: {
        ...mapState('Selected', [
            'step'
        ]),
        ...mapGetters('Selected', [
            'eyo'
        ]),
        ry () {
            return `(${this.slotholder('eyo-slotholder-inline')}):`
        },
        title () {
            return this.$$t('brick.tooltip.funcdef.name')
        },
        name: {
            get () {
                this.$$synchronize(this.step)
                return this.name_
            },
            set (newValue) {
                this.eyo.name_p = newValue
            }
        }
    },
    methods: {
        $$doSynchronize (eyo) {
            this.name_ = eyo.name_p
        },
        $$class (key) {
            return `eyo-code and item text${key.length ? '' : ' placeholder'} w-24rem`
        }
    }
}
</script>
<style>
</style>
