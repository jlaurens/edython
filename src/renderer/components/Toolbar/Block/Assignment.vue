<template>
    <b-dropdown id="block-assignment" class="eyo-dropdown item text eyo-with-slot-holder">
      <template slot="button-content"><span class="eyo-code eyo-content" v-html="selected_item.title"></span></template>
      <b-dropdown-item-button v-for="item in items" v-on:click="variant = item.key" :key="item.key" class="eyo-code" v-html="item.title"></b-dropdown-item-button>
      </b-dropdown-item-button>
    </b-dropdown>
  </template>
  
  <script>
    export default {
      name: 'block-assignment',
      data () {
        return {
          saved_step: 0,
          variant_: undefined
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
        },
        formatter: {
          type: Function,
          default: function (item) {
            console.log('default ', item)
            return item.length
              ? this.$$t(`block.${{
                '*': 'star',
                '**': 'two_stars',
                '.': 'dot',
                '..': 'two_dots'
              }[item] || item}`)
              : '&nbsp;'
          }
        }
      },
      computed: {
        variant: {
          get () {
            (this.saved_step === this.step) || this.$$synchronize()
            return this.variant_
          },
          set (newValue) {
            this.eyo.variant_p = newValue
          }
        },
        items () {
          return [
            this.items_by_key[eYo.Key.NAME],
            this.items_by_key[eYo.Key.TARGET]
          ]
        },
        slot () {
          return this.slotholder('eyo-slot-holder')
        },
        items_by_key () {
          return {
            [eYo.Key.NAME]: {
              key: eYo.Key.NAME,
              title: `<span>nom =</span>${this.slot}`
            },
            [eYo.Key.TARGET]: {
              key: eYo.Key.TARGET,
              title: `${this.slot}<span>,… =</span>${this.slot}<span>,…</span>`
            }
          }
        },
        selected_item () {
          return this.items_by_key[this.variant]
        }
      },
      created () {
        this.$$synchronize()
      },
      beforeUpdate () {
        (this.saved_step === this.step) || this.$$synchronize()
      },
      methods: {
        $$synchronize () {
          if (!this.eyo || (this.saved_step === this.step)) {
            return
          }
          this.variant_ = this.eyo.variant_p
        }
      }
    }
  </script>
  <style>
  </style>
  