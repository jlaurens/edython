<template>
  <b-btn-group id="eyo-block-primary-holder">
    <b-form-input v-model="holder" type="text" class="eyo-btn-inert btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}' v-if="canHolder"></b-form-input>
    <b-dropdown id="block-primary-dotted" class="eyo-dropdown" variant="outline-secondary">
      <template slot="button-content"><div class="eyo-block-primary-dotted eyo-code eyo-content" v-html="selectedItem.title"></div></template>
      <b-dropdown-item-button v-for="item in dottedItems" v-on:click="selectedItem = item" :key="item.key" class="eyo-block-primary-dotted eyo-code" v-html="item.content"></b-dropdown-item-button>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item-button v-for="item in moduleItems" v-on:click="selectedItem = item" :key="item.key" class="eyo-block-primary-dotted eyo-code" v-html="item.content"></b-dropdown-item-button>
    </b-dropdown>
  </b-btn-group>
</template>

<script>
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
      canHolder () {
        return this.dotted === 1
      },
      holder: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.holder_
        },
        set (newValue) {
          this.eyo.holder_p = newValue
        }
      },
      dotted: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
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
              ? '<b>' + module + '.</b>'
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
      this.$$synchronize()
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
    updated () {
      this.$$synchronize()
    },
    methods: {
      $$synchronize () {
        if (!this.eyo) {
          return
        }
        this.saved_step = this.eyo.change.step
        this.holder_ = this.eyo.holder_p
        this.dotted_ = this.eyo.dotted_p
      }
    }
  }
</script>
<style>
    .Xbtn .eyo-block-primary-dotted {
    padding-right: 0.75rem;
  }
  .Xdropdown-item.eyo-block-primary-dotted {
    padding-right: 0.5rem;
  }
  .Xeyo-block-primary-dotted2 {
    display: inline-block
  }
</style>
  
