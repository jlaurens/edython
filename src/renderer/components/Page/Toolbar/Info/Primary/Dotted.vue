<template>
  <b-button-group class="mx-1">
    <b-form-input id="eyo-info-primary-holder" v-model="blockHolder" type="text" size="10" class="btn btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}' v-if="canHolder"></b-form-input>
    <b-dropdown id="info-primary-dotted" class="eyo-dropdown" variant="outline-secondary">
    <template slot="button-content"><div class="eyo-info-primary-dotted eyo-code eyo-content" v-html="selectedItem.title"></div></template>
    <b-dropdown-item-button v-for="item in dottedItems" v-on:click="selectedItem = item" :key="item.key" class="eyo-info-primary-dotted eyo-code" v-html="item.content"></b-dropdown-item-button>
    <b-dropdown-divider></b-dropdown-divider>
    <b-dropdown-item-button v-for="item in moduleItems" v-on:click="selectedItem = item" :key="item.key" class="eyo-info-primary-dotted eyo-code" v-html="item.content"></b-dropdown-item-button>
    </b-dropdown>
  </b-button-group>
</template>

<script>
  export default {
    data () {
      return {
        selectedItem_: undefined,
        blockHolder_: undefined,
        blockDotted_: undefined
      }
    },
    name: 'info-primary-dotted',
    props: {
      selectedBlock: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      canHolder () {
        return this.blockDotted === 1
      },
      blockHolder: {
        get () {
          return this.blockHolder_
        },
        set (newValue) {
          this.blockHolder_ = newValue
          this.selectedBlock.eyo.holder_p = newValue
        }
      },
      blockDotted: {
        get () {
          return this.blockDotted_
        },
        set (newValue) {
          this.blockDotted_ = newValue
          this.selectedBlock.eyo.dotted_p = newValue
        }
      },
      selectedItem: {
        get () {
          return this.selectedItem_
        },
        set (newValue) {
          this.selectedItem_ = newValue
          if (newValue.action) {
            newValue.action.call(this, newValue)
          } else {
            this.blockDotted = newValue.key
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
            content: module + '.',
            title: '.',
            action (item) {
              // this.selectedBlock.eyo.changeBegin()
              this.blockDotted = 1
              this.blockHolder = item.key
              // var target = this.selectedBlock.eyo.slots.holder.targetBlock()
              // target && target.unplug()
              // this.selectedBlock.eyo.changeEnd()
              // this.selectedBlock.eyo.render()
            }
          }
        }
        return d
      },
      dotKeys () {
        return [0, 1, 2]
      },
      moduleKeys () {
        return ['turtle', 'random', 'math', 'cmath']
      }
    },
    created () {
      this.blockDotted_ = this.selectedBlock.eyo.dotted_p
      this.blockHolder_ = this.selectedBlock.eyo.holder_p
      var dotted = this.blockDotted
      var candidate = this.dottedItems[dotted]
      if (dotted === 1) {
        var eyo = this.selectedBlock.eyo
        if (!eyo.slots.holder.targetBlock()) {
          var module = this.moduleItems[this.blockHolder]
          if (module) {
            candidate = module
          }
        }
      }
      this.selectedItem_ = candidate || this.dottedItems[0]
    }
  }
</script>
<style>
    .btn .eyo-info-primary-dotted {
    padding-right: 0.75rem;
  }
  .dropdown-item.eyo-info-primary-dotted {
    padding-right: 0.5rem;
  }
  .eyo-info-primary-dotted2 {
    display: inline-block
  }
</style>
  