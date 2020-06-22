<template>
  <b-btn-group>
    <div
      class="item text eyo-code-reserved"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
    >
      @
    </div>
    <b-dd
      class="eyo-dropdown"
      variant="outline-secondary"
    >
      <b-dd-item-button
        v-for="choice in mainChoices"
        :key="choice"
        class="brick-variant eyo-code"
        @click="mainChooser = choice"
        v-html="mainContent(choice)"
      />
    </b-dd>    
    <b-form-input
      v-model="name"
      v-tippy
      type="text"
      :class="$$class(name)"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
      :title="title"
    />
    <b-dd
      class="eyo-dropdown"
      variant="outline-secondary"
    >
      <b-dd-item-button
        v-for="choice in choices"
        :key="choice"
        class="brick-variant eyo-code"
        @click="chooser = choice"
        v-html="content(choice)"
      />
    </b-dd>    
    <div
      v-if="chooser === $$.eYo.Key.N_ARY"
      class="item text"
      v-html="ry"
    />
    <div
      v-else-if="chooser !== $$.eYo.Key.NONE"
      class="item text eyo-code-reserved"
    >
      .{{ property }}
    </div>
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import Comment from './Comment.vue'

export default {
  name: 'InfoDecorator',
  components: {
        Comment // eslint-disable-line 
  },
  props: {
    slotholder: {
      type: Function,
      default: function (item) {
        return item
      }
    }
  },
  data: function () {
    return {
      saved_step: undefined,
      property_: undefined,
      name_: undefined,
      mainChooser_: undefined,
      chooser_: undefined
    }
  },
  computed: {
    ...mapState('Selected', [
      'step'
    ]),
    ...mapGetters('Selected', [
      'eyo'
    ]),
    ry () {
      return `(${this.slotholder('eyo-slotholder-inline')}):`
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
    property () {
      this.$$synchronize(this.step)
      return this.property_
    },
    mainChooser: {
      get () {
        this.$$synchronize(this.step)
        return this.mainChooser_
      },
      set (newValue) {
        this.eyo.mainChooser_p = newValue
      }
    },
    chooser: {
      get () {
        this.$$synchronize(this.step)
        return this.chooser_
      },
      set (newValue) {
        this.eyo.chooser_p = newValue
      }
    },
    mainChoices () {
      return this.eyo.mainChooser_d.getAll()
    },
    choices () {
      return this.eyo.chooser_d.getAll()
    },
    title () {
      return this.$$t('brick.tooltip.decorator.input')
    }
  },
  methods: {
    mainContent (choice) {
      if (choice === eYo.Key.NONE) {
        return '…'
      } else if (choice === eYo.Key.N_ARY) {
        return '…'
      } else if (choice === eYo.Key.SETTER) {
        return '…'
      } else if (choice === eYo.Key.DELETER) {
        return '…'
      } else {
        return choice
      }
    },
    content (choice) {
      if (choice === eYo.Key.NONE) {
        return ''
      } else if (choice === eYo.Key.N_ARY) {
        return '(…)'
      } else if (choice === eYo.Key.SETTER) {
        return '.setter'
      } else if (choice === eYo.Key.DELETER) {
        return '.deleter'
      } else {
        return ''
      }
    },
    $$doSynchronize (eyo) {
      this.property_ = eyo.property_p
      this.name_ = eyo.name_p
      this.mainChooser_ = eyo.mainChooser_p
      this.chooser_ = eyo.chooser_p
    },
    $$class (name) { // eslint-disable-line no-unused-vars
      return `item text w-24rem${[
        eYo.Key.STATICMETHOD,
        eYo.Key.CLASSMETHOD,
        eYo.Key.PROPERTY
      ].indexOf(this.mainChooser) < 0 ? '' : ' eyo-code-reserved'}`
    }
  }
}
</script>
<style>
</style>
