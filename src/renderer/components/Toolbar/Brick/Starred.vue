<template>
  <b-btn-group
    id="brick-starred"
    key-nav 
    aria-label="Block '*' decorator"
  >
    <b-dd
      class="item text mw-4rem"
      variant="outline-secondary"
    >
      <template
        slot="button-content"
      >
        <span
          class="eyo-code-reserved"
          v-html="chosen"
        />
      </template>
      <b-dd-item-button
        v-for="choice in choices"
        :key="choice"
        class="eyo-code"
        @click="chosen = choice"
        v-html="choice"
      />
    </b-dd>
    <div
      v-if="chosen === '*'"
      class="item"
    >
      <input
        v-model="not_only_star"
        type="checkbox"
      >
    </div>
    <b-input
      v-if="!eyo.modified_t"
      v-model="modified"
      type="text"
      :class="$$class(modified)"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
      :placeholder="$$t('brick.placeholder.expression')"
      :disabled="!canModified"
    />
    <div
      v-else
      class="item text"
      v-html="slotholder('eyo-slotholder-inline')"
    />
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
    name: 'InfoStarred',
    props: {
        slotholder: {
            type: Function,
            default: item => item
        }
    },
    data: function () {
        return {
            saved_step: undefined,
            chosen_: undefined,
            not_only_star_: undefined,
            modified_: undefined
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
