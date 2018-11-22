<template>
  <b-dropdown id="block-modifier" key-nav  aria-label="Block toolbar modifier" class="eyo-dropdown" variant="outline-secondary">
    <template slot="button-content"><span class="block-modifier eyo-code eyo-content" v-html="selected_item.title"></span></template>
    <b-dropdown-item-button v-for="item in items" v-on:click="modifier = item.key" :key="item.key" class="block-modifier eyo-code" v-html="item.title"></b-dropdown-item-button>
    </b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-modifier',
    data () {
      return {
        saved_step: undefined,
        modifier_: undefined
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
      }
    },
    computed: {
      modifier: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.modifier_
        },
        set (newValue) {
          console.log('set (newValue)', newValue, '!')
          this.modifier_ = newValue
          this.eyo.modifier_p = newValue || undefined
        }
      },
      items () {
        return [
          this.items_by_key[''],
          this.items_by_key['*'],
          this.items_by_key['**']
        ]
      },
      items_by_key () {
        return {
          '': {
            key: '',
            title: '&nbsp;'
          },
          '*': {
            key: '*',
            title: '*'
          },
          '**': {
            key: '**',
            title: '**'
          }
        }
      },
      selected_item () {
        return this.items_by_key[this.modifier_]
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
        var eyo = this.eyo
        this.saved_step = eyo.change.step
        this.modifier_ = eyo.modifier_p || ''
      }
    }
  }
</script>
<style>
  #block-modifier {
    padding-right:0.5rem;
  }
  .info-modifier {
    width:3rem;
  }
</style>
