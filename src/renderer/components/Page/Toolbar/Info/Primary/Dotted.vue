<template>
  <b-dropdown id="info-primary-dotted" class="eyo-dropdown" variant="outline-secondary">
    <template slot="button-content"><div class="eyo-info-primary-dotted eyo-code eyo-content" v-html="selected.title || selected.content"></div></template>
    <b-dropdown-item-button v-for="item in items" v-on:click="selected = item" :key="item.key" class="eyo-info-primary-dotted eyo-code" v-html="item.content"></b-dropdown-item-button>
    <b-dropdown-divider></b-dropdown-divider>
    <b-dropdown-item-button v-for="item in modules" v-on:click="selected = item" :key="item.key" class="eyo-info-primary-dotted eyo-code" v-html="item.content"></b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    data () {
      return {
        selected_: undefined
      }
    },
    name: 'info-primary-dotted',
    props: {
      selectedBlock: {
        type: Object,
        default: undefined
      },
      placeholder: {
        type: Function,
        default: function (item) {
          return item
        }
      }
    },
    computed: {
      selected: {
        get () {
          // guess from the selected block
          var block = this.selectedBlock
          if (block) {
            var eyo = block.eyo
            var dotted = eyo.data.dotted.get()
            var candidate = this.items_[dotted]
            if (dotted === 1) {
              if (!eyo.slots.holder.targetBlock()) {
                var holder = eyo.data.holder.get()
                var module = this.modules_[holder]
                if (module) {
                  candidate = module
                }
              }
            }
            this.selected_ = candidate
          }
          return this.selected_ || this.items[0]
        },
        set (newValue) {
          this.selected_ = newValue
          newValue.action.call(this, newValue)
          this.selectedBlock.eyo.render()
        }
      },
      items_ () {
        return {
          0: {
            key: 0,
            content: '&nbsp;',
            action (item) {
              var block = this.selectedBlock
              block && block.eyo.data.dotted.set(item.key)
            }
          },
          1: {
            key: 1,
            content: '….',
            title: '….',
            action (item) {
              var block = this.selectedBlock
              block && block.eyo.data.dotted.set(item.key)
            }
          },
          2: {
            key: 2,
            content: '..',
            title: '..',
            action (item) {
              var block = this.selectedBlock
              block && block.eyo.data.dotted.set(item.key)
            }
          }
        }
      },
      items () {
        return [
          this.items_[0],
          this.items_[1],
          this.items_[2]
        ]
      },
      modules__ () {
        return ['turtle', 'random', 'math', 'cmath']
      },
      modules_ () {
        var modules = {}
        var i = 0
        var module
        while ((module = this.modules__[i++])) {
          modules[module] = {
            key: module,
            content: module + '.',
            action (item) {
              var block = this.selectedBlock
              if (block) {
                var eyo = block.eyo
                eyo.data.dotted.set(1)
                eyo.data.holder.set(item.key)
                var target = eyo.slots.holder.targetBlock()
                target && target.unplug()
              }
            }
          }
        }
        return modules
      },
      modules () {
        return [
          this.modules_['turtle'],
          this.modules_['random'],
          this.modules_['math'],
          this.modules_['cmath']
        ]
      }
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
  