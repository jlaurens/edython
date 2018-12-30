<template>
  <b-btn-group
    v-if="show_dotted"
    id="b3k-primary-holder">
    <div
      v-if="canHolder && eyo.holder_t"
      class="item text"
      v-html="slotholder('eyo-slotholder-inline')"
      ></div>
    <b-input
      v-else-if="canHolder"
      v-model="holder"
      type="text"
      class="eyo-code item text"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
      ></b-input>
    <div
      v-if="ismethod"
      class="item text">.</div>
    <b-dd
      v-else
      id="block-primary-dotted"
      class="eyo-dropdown eyo-code-reserved item text"
      variant="outline-secondary">
      <template
        slot="button-content"
        ><div
          class="b3k-primary-dotted eyo-code eyo-content"
          v-html="selectedItem.title"
          ></div
        ></template>
      <b-dd-item-button
        v-for="item in dottedItems"
        @click="selectedItem = item"
        :key="item.key"
        class="b3k-primary-dotted eyo-code" v-html="item.content"
        ></b-dd-item-button>
      <b-dd-divider></b-dd-divider>
      <b-dd-item-button
        v-for="item in moduleItems"
        @click="selectedItem = item"
        :key="item.key"
        class="b3k-primary-dotted eyo-code"
        v-html="item.content"
        ></b-dd-item-button>
    </b-dd>
  </b-btn-group>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  export default {
    data () {
      return {
        saved_step: undefined,
        selectedItem_: undefined,
        holder_: undefined,
        dotted_: undefined
      }
    },
    name: 'info-primary-dotted',
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
    computed: {
      show_dotted () {
        return this.ismethod || this.blockEditShowDotted
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
      },
      ...mapState({
        blockEditShowDotted: state => state.UI.blockEditShowDotted
      }),
      ...mapGetters('Selected', [
        'eyo',
        'step'
      ])
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
  
