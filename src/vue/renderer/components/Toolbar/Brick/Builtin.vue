<template>
  <b-dd
    v-if="values && values.length"
    id="brick-builtin"
    class="item text"
    variant="outline-secondary"
  >
    <template
      slot="button-content"
    >
      <span
        class="brick-value eyo-code-reserved eyo-content" 
        v-html="value"
      />
    </template>
    <b-dd-item-button
      v-for="item in values" 
      :key="item"
      class="brick-value eyo-code-reserved"
      @click="value = item" 
      v-html="item"
    />
  </b-dd>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'InfoValue',
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
      return this.eyo.value_d.getAll()
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
</style>
  
