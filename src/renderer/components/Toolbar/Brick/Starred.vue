<template>
  <b-btn-group
    id="brick-starred"
    key-nav 
    aria-label="Block '*' decorator">
    <b-dd
      class="item text mw-4rem"
      variant="outline-secondary">
      <template
        slot="button-content"
        ><span
          class="eyo-code-reserved"
          v-html="chosen"></span
        ></template
      >
      <b-dd-item-button
        v-for="choice in choices"
        v-on:click="chosen = choice"
        :key="choice"
        class="eyo-code"
        v-html="choice"></b-dd-item-button
      >
    </b-dd>
    <div
      v-if="chosen === '*'"
      class="item">
      <input
        type="checkbox"
        v-model="not_only_star">
    </div>
    <b-input
      v-if="!eyo.modified_t"
      v-model="modified"
      type="text"
      :class="$$class(modified)"
      :style='{fontFamily: $$.eYo.Font.familyMono}'
      :placeholder="$$t('brick.placeholder.expression')"
      :disabled="!canModified"
    ></b-input>
    <div
      v-else class="item text"
      v-html="slotholder('eyo-slotholder-inline')"></div>
  </b-btn-group>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  export default {
    name: 'info-starred',
    data: function () {
      return {
        saved_step: undefined,
        chosen_: undefined,
        not_only_star_: undefined,
        modified_: undefined
      }
    },
    props: {
      slotholder: {
        type: Function,
        default: item => item
      }
    },
    computed: {
      ...mapState('Selected', [
        'step'
      ]),
      ...mapGetters('Selected', [
        'eyo'
      ]),
      my_slot () {
        return this.slotholder('eyo-slotholder')
      },
      choices () {
        return ['*', '**']
      },
      chosen: {
        get () {
          this.$$synchronize(this.step)
          return this.chosen_
        },
        set (newValue) {
          this.eyo.modifier_p = newValue
          this.eyo.variant_p = !this.not_only_star_ && newValue === '*'
            ? eYo.Key.STAR
            : eYo.Key.NONE
        }
      },
      not_only_star: {
        get () {
          this.$$synchronize(this.step)
          return this.not_only_star_
        },
        set (newValue) {
          this.eyo.variant_p = !newValue && this.eyo.modifier_p === '*'
            ? eYo.Key.STAR
            : eYo.Key.NONE
        }
      },
      modified: {
        get () {
          this.$$synchronize(this.step)
          return this.modified_
        },
        set (newValue) {
          this.eyo.modified_p = newValue
        }
      },
      canModified () {
        this.$$synchronize(this.step)
        return this.chosen_ !== '*' || this.not_only_star
      }
    },
    methods: {
      $$doSynchronize (eyo) {
        this.chosen_ = eyo.modifier_p
        if (eyo.modifier_p === '*') {
          this.not_only_star_ = eyo.variant_p !== eYo.Key.STAR
        }
        this.modified_ = eyo.modified_p
      },
      $$class (key) {
        return `eyo-code and item${this.not_only_star ? ' text' : ''}${key.length ? '' : ' placeholder'}`
      }
    }
  }
</script>
<style>
</style>
