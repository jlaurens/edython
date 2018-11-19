<template>
  <b-dropdown id="info-modifier" key-nav  aria-label="Info toolbar modifier" class="eyo-dropdown" variant="outline-secondary">
    <template slot="button-content"><span class="info-modifier eyo-code eyo-content" v-html="selected_item.title"></span></template>
    <b-dropdown-item-button v-for="item in items" v-on:click="modifier = item.key" :key="item.key" class="info-modifier eyo-code" v-html="item.title"></b-dropdown-item-button>
    </b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-modifier',
    data () {
      return {
        step_: undefined,
        modifier_: undefined
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      modifier: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
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
      this.synchronize()
    },
    updated () {
      this.synchronize()
    },
    methods: {
      synchronize () {
        var eyo = this.eyo
        if (this.step_ !== eyo.change.step) {
          this.step_ = eyo.change.step
          this.modifier_ = eyo.modifier_p || ''
        }
      }
    }
  }
</script>
<style>
  #info-modifier {
    padding-right:0.5rem;
  }
  .info-modifier {
    width:3rem;
  }
</style>
