<template>
  <b-dd id="brick-modifier" key-nav  aria-label="Brick toolbar modifier" class="eyo-dropdown" variant="outline-secondary">
    <template slot="button-content"><span class="brick-modifier eyo-code eyo-content" v-html="selected_item.title"></span></template>
    <b-dd-item-button v-for="item in items" v-on:click="modifier = item.key" :key="item.key" class="brick-modifier eyo-code" v-html="item.title"></b-dd-item-button>
    </b-dd-item-button>
  </b-dd>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  export default {
    name: 'info-modifier',
    data () {
      return {
        saved_step: undefined,
        modifier_: undefined
      }
    },
    computed: {
      ...mapState('Selected', [
        'step'
      ]),
      ...mapGetters('Selected', [
        'eyo'
      ]),
      modifier: {
        get () {
          this.$$synchronize(this.step)
          return this.modifier_
        },
        set (newValue) {
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
    methods: {
      $$doSynchronize (eyo) {
        this.modifier_ = eyo.modifier_p || ''
      }
    }
  }
</script>
<style>
  #brick-modifier {
    padding-right:0.5rem;
  }
  .info-modifier {
    width:3rem;
  }
</style>
