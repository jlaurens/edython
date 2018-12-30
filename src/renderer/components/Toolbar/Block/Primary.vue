<template>
  <b-btn-group id="block-primary" key-nav  aria-label="Block group primary">
    <dotted
      :slotholder="slotholder"
      :ismethod="isMethod">
    </dotted>
    <name></name>
    <variant
      :slotholder="slotholder"
      :ismethod="isMethod">
    </variant>
    <ry
      v-if="showRy"
      :ismethod="isMethod">
    </ry>
  </b-btn-group>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  import Dotted from './Primary/Dotted.vue'
  import Name from './Primary/Name.vue'
  import Variant from './Primary/Variant.vue'
  import Ry from './Primary/Ry.vue'

  export default {
    name: 'info-primary',
    data: function () {
      return {
        saved_step: undefined,
        isMethod_: false
      }
    },
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
    computed: {
      isMethod () {
        this.$$synchronize(this.step)
        return this.isMethod_
      },
      ...mapState('UI', {
        showRy: state => state.toolbarRyVisible
      }),
      ...mapGetters('Selected', [
        'eyo',
        'step'
      ])
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
