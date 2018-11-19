<template>
  <b-button-toolbar id="info-starred" key-nav  aria-label="Info decorator" justify>
    <b-button-group>
      <b-dropdown id="info-starred-dd" class="eyo-dropdown" variant="outline-secondary">
        <template slot="button-content"><span class="info-modifier eyo-code eyo-content" v-html="chosen.title"></span></template>
        <b-dropdown-item-button v-for="choice in choices" v-on:click="chosen = choice" :key="choice.key" class="info-variant eyo-code" v-html="choice.title"></b-dropdown-item-button>
      </b-dropdown>
    </b-button-group>
  </b-button-toolbar>
</template>

<script>
  import Comment from './Comment.vue'

  export default {
    name: 'info-starred',
    data: function () {
      return {
        step_: undefined,
        chosen_: undefined
      }
    },
    components: {
      Comment
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      slotholder: {
        type: Function,
        default: function (item) {
          return item
        }
      }
    },
    computed: {
      my_slot () {
        return this.slotholder('eyo-block-primary-variant1')
      },
      choices_by_key () {
        return {
          [eYo.Key.STAR]: {
            key: eYo.Key.STAR,
            title: '<div class="eyo-code-reserved">*&nbsp;</div>',
            action (eyo) {
              eyo.modifier_p = '*'
              eyo.variant_p = eYo.Key.STAR
            }
          },
          [eYo.Key.STAR_NAME]: {
            key: eYo.Key.STAR_NAME,
            title: '<div class="eyo-block-primary-variant2 eyo-code-reserved">*</div>' + this.my_slot,
            action (eyo) {
              eyo.modifier_p = '*'
              eyo.variant_p = eYo.Key.NONE
            }
          },
          [eYo.Key.STAR_STAR_NAME]: {
            key: eYo.Key.STAR_STAR_NAME,
            title: '<div class="eyo-block-primary-variant2 eyo-code-reserved">**</div>' + this.my_slot,
            action (eyo) {
              eyo.modifier_p = '**'
              eyo.variant_p = eYo.Key.NONE
            }
          }
        }
      },
      choices () {
        return [
          this.choices_by_key[eYo.Key.STAR],
          this.choices_by_key[eYo.Key.STAR_NAME],
          this.choices_by_key[eYo.Key.STAR_STAR_NAME]
        ]
      },
      chosen: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
          return this.chosen_
        },
        set (newValue) {
          newValue.action(this.eyo)
          this.synchronize()
        }
      }
    },
    created () {
      this.synchronize()
    },
    methods: {
      synchronize () {
        var eyo = this.eyo
        if (this.step_ !== eyo.change.step) {
          this.step_ = eyo.change.step
          if (eyo.modifier_p === '**') {
            this.chosen_ = this.choices_by_key[eYo.Key.STAR_STAR_NAME]
          } else if (eyo.variant_p === eYo.Key.STAR) {
            this.chosen_ = this.choices_by_key[eYo.Key.STAR]
          } else /* if (eyo.variant_p === eYo.Key.STAR) */ {
            this.chosen_ = this.choices_by_key[eYo.Key.STAR_NAME]
          }
        }
      }
    }
  }
</script>
<style>
  #info-decorator {
    padding: 0 0.25rem;
  }
</style>
