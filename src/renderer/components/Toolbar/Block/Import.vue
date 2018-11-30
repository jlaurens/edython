<template>
  <b-btn-group id="block-import">
    <b-dd class="item eyo-with-slotholder">
      <b-dd-item-button v-for="choice in choices" v-on:click="chosen = choice" :key="choice.key" class="eyo-code" v-html="choice.title"></b-dd-item-button>
    </b-dd>
    <div class="item text eyo-code-reserved" v-if="isFromInput">from</div>
    <div class="item text eyo-code-reserved" v-html="$fromSlot" v-if="isFromSlot"></div>
    <b-input :class="$$class" v-model="from" v-if="isFromInput" :placeholder="$$placeholder"></b-input>
    <div class="item text eyo-code-reserved" v-html="$import" v-if="!isImportStar"></div>
    <div class="item text eyo-code-reserved" v-html="$importStar" v-if="isImportStar"></div>
  </b-btn-group>
</template>

<script>
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
      eyo: {
        type: Object,
        default: undefined
      },
      step: {
        type: Number,
        default: 0
      },
      slotholder: {
        type: Function,
        default: function (item) {
          return item
        }
      }
    },
    computed: {
      isFromSlot () {
        this.$$synchronize(this.step)
        return this.chosen.key !== eYo.Key.IMPORT && this.eyo.from_s.targetBlock()
      },
      isFromInput () {
        this.$$synchronize(this.step)
        return this.chosen.key !== eYo.Key.IMPORT && !this.eyo.from_s.targetBlock()
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
        return this.$$t('block.placeholder.module')
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
      }
    },
    created () {
      this.choices_by_key = {
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
      this.choices = [
        this.choices_by_key[eYo.Key.IMPORT],
        this.choices_by_key[eYo.Key.FROM_MODULE_IMPORT],
        this.choices_by_key[eYo.Key.FROM_MODULE_IMPORT_STAR]
      ]
      this.$$synchronize(this.step)
    },
    beforeUpdate () {
      this.$$synchronize(this.step)
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
