<template>
  <b-btn-group id="block-assignment">
    <div
      v-if="variant === $$.eYo.Key.TARGETS"
      class="item text"
      v-html="`${slotholder('eyo-slotholder-inline')},…`"></div>
    <div
      v-else-if="!!eyo.name_t"
      class="item text"
      v-html="`${slotholder('eyo-slotholder-inline')}`"></div>
    <b-input
      v-else
      v-model="name"
      type="text"
      :class="$$class(name)"
      :style='{fontFamily: $$.eYo.Font.familyMono}'
      :placeholder="$$t('block.placeholder.name')"></b-input>
    <b-dd
      class="eyo-dropdown item text eyo-with-slotholder bl-"
      text=""
      right>
      <b-dd-item-button
        v-for="item in items"
        v-on:click="variant = item.key"
        :key="item.key"
        class="eyo-code placeholder" v-html="item.title"></b-dd-item-button>
      </b-dd-item-button>
    </b-dd>
    <div
      class="item text"
      v-html="`=${slotholder('eyo-slotholder-inline')},…`"></div>
  </b-btn-group>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  export default {
    name: 'block-assignment',
    data () {
      return {
        saved_step: 0,
        variant_: undefined,
        name_: undefined
      }
    },
    props: {
      slotholder: {
        type: Function,
        default: null
      },
      formatter: {
        type: Function,
        default: function (item) {
          return item.length
            ? this.$$t(`block.${{
              '*': 'star',
              '**': 'two_stars',
              '.': 'dot',
              '..': 'two_dots'
            }[item] || item}`) || item
            : '&nbsp;'
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
      variant: {
        get () {
          this.$$synchronize(this.step)
          return this.variant_
        },
        set (newValue) {
          this.eyo.variant_p = newValue
        }
      },
      name: {
        get () {
          this.$$synchronize(this.step)
          return this.name_
        },
        set (newValue) {
          this.eyo.name_p = newValue
        }
      },
      items () {
        return [
          this.items_by_key[eYo.Key.NAME],
          this.items_by_key[eYo.Key.TARGETS]
        ]
      },
      items_by_key () {
        return {
          [eYo.Key.NAME]: {
            key: eYo.Key.NAME,
            title: this.$$t('block.placeholder.name')
          },
          [eYo.Key.TARGETS]: {
            key: eYo.Key.TARGETS,
            title: `${this.slotholder('eyo-slotholder-inline')},…`
          }
        }
      },
      selected_item () {
        return this.items_by_key[this.variant]
      }
    },
    methods: {
      $$doSynchronize (eyo) {
        this.variant_ = eyo.variant_p
        this.name_ = eyo.name_p
      },
      $$class (key) {
        return `eyo-code and item text${key.length ? '' : ' placeholder'}`
      }
    }
  }
</script>
<style>
  #block-assignment .eyo-dropdown .btn {
    vertical-align: top;
  }
</style>
