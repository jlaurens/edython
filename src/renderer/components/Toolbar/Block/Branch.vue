<template>
  <b-btn-group
    id="block-branch"
    key-nav
    aria-label="Block branch"
    justify>
    <b-dd
      id="block-branch"
      class="eyo-code eyo-code-reserved item text mw-6rem"
      variant="outline-secondary"
      :text="variant">
      <b-dd-item-button
        v-for="branch in branches"
        v-on:click="variant = branch"
        :key="branch"
        class="block-branch eyo-code eyo-code-reserved"
        >{{branch}}</b-dd-item-button>      
    </b-dd>
    <div
      v-if="canIf && eyo.if_t"
      class="item text"
      v-html="slotholder('eyo-slotholder-inline')"></div>
    <b-input
      v-else-if="canIf"
      v-model="condition"
      type="text"
      :class="$$class(condition)"
      :style='{fontFamily: $$.eYo.Font.familyMono}'
      :placeholder="$$t('block.placeholder.condition')"></b-input>
  </b-btn-group>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    name: 'info-branch',
    data: function () {
      return {
        saved_step: undefined,
        if_: undefined,
        variant_: undefined
      }
    },
    props: {
      slotholder: {
        type: Function,
        branch: function (item) {
          return item
        }
      }
    },
    computed: {
      ...mapGetters('Selected', [
        'eyo',
        'step'
      ]),
      canIf () {
        this.$$synchronize(this.step)
        var variant = this.eyo.variant_p
        return variant !== this.$$.eYo.Key.ELSE
      },
      condition: {
        get () {
          this.$$synchronize(this.step)
          return this.if_
        },
        set (newValue) {
          this.eyo.if_p = newValue
        }
      },
      variant: {
        get () {
          this.$$synchronize(this.step)
          return this.variant_
        },
        set (newValue) {
          this.eyo.variant_p = newValue
        }
      },
      branches () {
        return this.eyo.variant_d.getAll()
      }
    },
    methods: {
      $$doSynchronize (eyo) {
        this.variant_ = eyo.variant_p
        this.if_ = eyo.if_p
      },
      $$class (key) {
        return `eyo-code and item text${key.length ? '' : ' placeholder'}`
      }
    }
  }
</script>
<style>
</style>
