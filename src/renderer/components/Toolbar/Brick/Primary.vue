<template>
  <b-btn-group
    id="brick-primary"
    key-nav
    aria-label="Block group primary"
  >
    <dotted
      :slotholder="slotholder"
      :ismethod="isMethod"
    />
    <name
      :slotholder="slotholder"
    />
    <variant
      :slotholder="slotholder"
      :ismethod="isMethod"
      :keyword="eyo.name_p ==='print'"
    />
    <ry
      v-if="showRy"
      :ismethod="isMethod"
    />
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

import Dotted from './Primary/Dotted.vue'
import Name from './Primary/Name.vue'
import Variant from './Primary/Variant.vue'
import Ry from './Primary/Ry.vue'

export default {
    name: 'InfoPrimary',
    components: {
        Dotted,
        Name,
        Variant,
        Ry
    },
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
            isMethod_: false
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
            showRy: state => state.toolbarRyVisible
        }),
        isMethod () {
            this.$$synchronize(this.step)
            return this.isMethod_
        }
    },
    methods: {
        $$doSynchronize (eyo) {
            var item = eyo.item_p
            this.isMethod_ = item && item.isMethod
        }
    }
}
</script>
<style>
  .eyo-dd-content {
    padding: 0;
  }
</style>
