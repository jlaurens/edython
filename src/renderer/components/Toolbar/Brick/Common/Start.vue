<template>
  <b-btn-group
    v-if="!eyo.previous"
    class="b3k-edit control"
  >
    <input
      v-model="restart"
      v-tippy
      type="checkbox"
      aria-label="Checkbox to enable restart feature"
      :title="$$t('toolbar.tooltip.restart')"
    ><div
      v-tippy
      class="label"
      :title="$$t('toolbar.tooltip.restart')"
    >
      {{ $$t('toolbar.content.restart') }}
    </div>
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
    name: 'InfoCommon',
    data () {
        return {
            saved_step: undefined,
            restart_: undefined
        }
    },
    computed: {
        ...mapState('Selected', [
            'step'
        ]),
        ...mapGetters('Selected', [
            'eyo'
        ]),
        restart: {
            get () {
                this.$$synchronize(this.step)
                return this.restart_
            },
            set (newValue) {
                this.eyo.restart_p = newValue
            }
        }
    },
    methods: {
        $$doSynchronize (eyo) { // eslint-disable-line no-unused-vars
            this.restart_ = this.eyo.restart_p
        }
    }
}
</script>
<style>
  .b3k-edit.control input[type="checkbox"] {
    height:100%;
    vertical-align: baseline;
    position: relative;
    bottom: 0.25rem;
    margin-left:0.5rem;
    margin-right:0.5rem;
  }
  .b3k-edit.control .label {
    vertical-align: baseline;
    display:inline-block;
    height:100%;
  }
</style>
