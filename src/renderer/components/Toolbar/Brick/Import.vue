<template>
  <b-btn-group
    id="brick-import">
    <b-dd
      class="item eyo-with-slotholder">
      <b-dd-item-button
        v-for="choice in choices"
        v-on:click="chosen = choice"
        :key="choice.key"
        class="eyo-code"
        v-html="choice.title"
      ></b-dd-item-button>
    </b-dd>
    <div
      v-if="isFromInput"
      class="item text eyo-code-reserved"
    >from</div>
    <div
      v-if="isFromSlot"
      class="item text eyo-code-reserved"
      v-html="$fromSlot"
    ></div>
    <b-input
      v-if="isFromInput"
      :class="$$class"
      v-model="from"
      :placeholder="$$placeholder"
    ></b-input>
    <div
      v-if="!isImportStar"
      class="item text eyo-code-reserved"
      v-html="$import"
    ></div>
    <div
      v-if="isImportStar"
      class="item text eyo-code-reserved"
      v-html="$importStar"
    ></div>
  </b-btn-group>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  export default {
    name: 'info-variant',
    data () {
      return {
        saved_step: undefined,
        hasModuleTarget_: undefined,
        chosen_: undefined
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
      isFromSlot () {
        this.$$synchronize(this.step)
        return this.chosen.key !== eYo.Key.IMPORT && this.eyo.from_s.targetBrick()
      },
      isFromInput () {
        this.$$synchronize(this.step)
        return this.chosen.key !== eYo.Key.IMPORT && !this.eyo.from_s.targetBrick()
      },
      isImportStar () {
        this.$$synchronize(this.step)
        return this.chosen.key === eYo.Key.FROM_MODULE_IMPORT_STAR
      },
      $fromSlot () {
        this.$$synchronize(this.step)
        return this.formatted('<span>from{{slotholder}}</span>')
      },
      $import () {
        this.$$synchronize(this.step)
        return this.formatted('<span>import{{slotholder}}</span>')
      },
      $importStar () {
        this.$$synchronize(this.step)
        return '<span>import *</span>'
      },
      $$class () {
        return `eyo-code item text w-12rem${this.from.length ? '' : ' placeholder'}`
      },
      $$placeholder () {
        return this.$$t('brick.placeholder.module')
      },
      chosen: {
        get () {
          this.$$synchronize(this.step)
          return this.chosen_
        },
        set (newValue) {
          this.eyo.variant_p = newValue.key
          this.$nextTick(this.$$synchronize)
        }
      },
      from: {
        get () {
          this.$$synchronize(this.step)
          return this.from_
        },
        set (newValue) {
          this.eyo.from_p = newValue
        }
      },
      choices_by_key () {
        if (!this.choices_by_key_) {
          this.choices_by_key_ = {
            [eYo.Key.IMPORT]: {
              key: eYo.Key.IMPORT,
              title: this.formatted('import {{slotholder}}')
            },
            [eYo.Key.FROM_MODULE_IMPORT]: {
              key: eYo.Key.FROM_MODULE_IMPORT,
              title: this.formatted('from … import {{slotholder}}')
            },
            [eYo.Key.FROM_MODULE_IMPORT_STAR]: {
              key: eYo.Key.FROM_MODULE_IMPORT_STAR,
              title: 'from … import *'
            }
          }
        }
        return this.choices_by_key_
      },
      choices () {
        if (!this.choices_) {
          this.choices_ = [
            this.choices_by_key[eYo.Key.IMPORT],
            this.choices_by_key[eYo.Key.FROM_MODULE_IMPORT],
            this.choices_by_key[eYo.Key.FROM_MODULE_IMPORT_STAR]
          ]
        }
        return this.choices_
      }
    },
    methods: {
      $$doSynchronize (eyo) {
        this.chosen_ = this.choices_by_key[eyo.variant_p] || this.choices[0]
        this.from_ = eyo.from_p
      },
      formatted: function (input) {
        if (input.indexOf('{{slotholder}}') < 0) {
          return input
        }
        var replacement = `</span>${this.slotholder('eyo-slotholder')}<span>`
        return `<span>${input.replace('{{slotholder}}', replacement)}</span>`
      }
    }
  }
</script>
<style>
</style>
