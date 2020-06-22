<template>
  <b-btn-group
    v-if="show_dotted"
    id="b3k-primary-holder"
  >
    <div
      v-if="canHolder && eyo.holder_t"
      class="item text"
      v-html="slotholder('eyo-slotholder-inline')"
    />
    <b-input
      v-else-if="canHolder"
      v-model="holder"
      type="text"
      class="eyo-code item text"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
    />
    <div
      v-if="ismethod"
      class="item text"
    >
      .
    </div>
    <b-dd
      v-else
      id="brick-primary-dotted"
      class="eyo-dropdown eyo-code-reserved item text"
      variant="outline-secondary"
    >
      <template
        slot="button-content"
      >
        <div
          class="b3k-primary-dotted eyo-code eyo-content"
          v-html="selectedItem.title"
        />
      </template>
      <b-dd-item-button
        v-for="item in dottedItems"
        :key="item.key"
        class="b3k-primary-dotted eyo-code"
        @click="selectedItem = item"
        v-html="item.content"
      />
      <b-dd-divider />
      <b-dd-item-button
        v-for="item in moduleItems"
        :key="item.key"
        class="b3k-primary-dotted eyo-code"
        @click="selectedItem = item"
        v-html="item.content"
      />
    </b-dd>
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'InfoPrimaryDotted',
  props: {
    slotholder: {
      type: Function,
      default: function (item) {
        return item
      }
    },
    ismethod: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      saved_step: undefined,
      selectedItem_: undefined,
      holder_: undefined,
      dotted_: undefined
    }
  },
  computed: {
    ...mapState('Selected', [
      'step'
    ]),
    ...mapGetters('Selected', [
      'eyo'
    ]),
    ...mapState({
      brickEditShowDotted: state => state.UI.brickEditShowDotted
    }),
    show_dotted () {
      return this.ismethod || this.brickEditShowDotted
    },
    canHolder () {
      return this.dotted === 1
    },
    holder: {
      get () {
        this.$$synchronize(this.step)
        return this.holder_
      },
      set (newValue) {
        this.eyo.holder_p = newValue
      }
    },
    dotted: {
      get () {
        this.$$synchronize(this.step)
        return this.dotted_
      },
      set (newValue) {
        this.eyo.dotted_p = newValue
      }
    },
    selectedItem: {
      get () {
        var dotted = this.dotted
        var candidate = this.dottedItems[dotted]
        if (dotted === 1) {
          var eyo = this.eyo
          if (!eyo.slots.holder.targetBlock()) {
            var module = this.moduleItems[this.holder]
            if (module) {
              candidate = module
            }
          }
        }
        return candidate || this.dottedItems[0]
      },
      set (newValue) {
        if (newValue.action) {
          newValue.action.call(this, newValue)
        } else {
          this.dotted = newValue.key
        }
      }
    },
    dottedItems () {
      return {
        0: {
          key: 0,
          content: '&nbsp;',
          title: '&nbsp;'
        },
        1: {
          key: 1,
          content: '….',
          title: '.'
        },
        2: {
          key: 2,
          content: '..',
          title: '..'
        }
      }
    },
    moduleItems () {
      var d = {}
      var i = 0
      var module
      while ((module = this.moduleKeys[i++])) {
        d[module] = {
          key: module,
          content: this.holder === module
            ? `<b>${module}.</b>`
            : module + '.',
          title: '.',
          action (item) {
            // this.eyo.changeBegin()
            this.dotted = 1
            this.holder = item.key
          }
        }
      }
      return d
    },
    dotKeys () {
      return [0, 1, 2]
    },
    moduleKeys () {
      return [
        'turtle',
        'math',
        'decimal',
        'fraction',
        'statistics',
        'random',
        'cmath',
        'string'
      ]
    }
  },
  created () {
    var dotted = this.dotted
    var candidate = this.dottedItems[dotted]
    if (dotted === 1) {
      if (!this.eyo.holder_s.targetBlock()) {
        var module = this.moduleItems[this.holder]
        if (module) {
          candidate = module
        }
      }
    }
    this.selectedItem_ = candidate || this.dottedItems[0]
  },
  methods: {
    $$doSynchronize (eyo) {
      this.holder_ = eyo.holder_p
      this.dotted_ = eyo.dotted_p
      var item = eyo.item_p
      this.isMethod_ = item && item.isMethod
    }
  }
}
</script>
<style>
</style>
  
