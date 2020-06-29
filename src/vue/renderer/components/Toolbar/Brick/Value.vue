<template>
  <b-dd
    v-if="values && values.length"
    :id="childId"
    class="item text"
    variant="outline-secondary"
  >
    <template
      slot="button-content"
    >
      <span 
        class="brick-value eyo-code eyo-content"
        v-html="formatter(value)"
      />
    </template>
    <b-dd-item-button
      v-for="item in values"
      :key="item"
      class="brick-value eyo-code"
      @click="value = item"
      v-html="formatter(item)"
    />
  </b-dd>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'InfoValue',
  props: {
    childId: {
      type: String,
      default: 'Block-value'
    },
    formatter: {
      type: Function,
      default: function (item) {
        return item && item.length
          ? this.$$t(`brick.${({
            '*': 'star',
            '**': 'two_stars',
            '.': 'dot',
            '..': 'two_dots'
          }[item] || item)}`) || item
          : '&nbsp;'
      }
    }
  },
  data () {
    return {
      saved_step: undefined,
      value_: undefined
    }
  },
  computed: {
    ...mapState('Selected', [
      'step'
    ]),
    ...mapGetters('Selected', [
      'eyo'
    ]),
    value: {
      get () {
        this.$$synchronize(this.step)
        return this.value_
      },
      set (newValue) {
        this.eyo.value_p = newValue
      }
    },
    values () {
      this.$$synchronize(this.step)
      return (this.eyo.value_d && this.eyo.value_d.getAll()) || []
    }
  },
  methods: {
    $$doSynchronize (eyo) {
      this.value_ = eyo.value_p
    }
  }
}
</script>
<style>
  .info-value {
    padding-right:0.75rem;
  }
</style>
  
