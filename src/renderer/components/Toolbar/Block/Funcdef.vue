<template>
  <b-btn-group>
    <div
      class="item text eyo-code-reserved"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
      >def</div>
    <b-form-input
      id="block-funcdef-name"
      v-model="name"
      type="text"
      :class="$$class(name)"
      :style='{fontFamily: $$.eYo.Font.familyMono}'
      :title="title"
      v-tippy ></b-form-input>
    <div
      class="item text"
      v-html="ry"
      ></div>
  </b-btn-group>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'
  
  export default {
    name: 'block-funcdef',
    data: function () {
      return {
        saved_step: undefined,
        name_: undefined
      }
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
        return this.$$t('block.tooltip.funcdef.name')
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
