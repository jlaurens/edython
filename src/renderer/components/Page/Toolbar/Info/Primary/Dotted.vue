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
          if (!this.selected_) {
            var block = this.selectedBlock
            var dotted = block && block.eyo.data.dotted.get()
            if (dotted === eYo.Key.MODULE) {
              this.selected_ = this.modules_[block && block.eyo.data.module.get()]
            } else {
              this.selected_ = this.items_[dotted]
            }
          }
          return this.selected_ || this.items[dotted]
        },
        set (newValue) {
          this.selected_ = newValue
          newValue.action.call(this, newValue)
          this.selectedBlock.eyo.render()
        }
      },
      items_ () {
        return {
          [eYo.Key.NONE]: {
            key: eYo.Key.NONE,
            content: '&nbsp;',
            action (item) {
              var block = this.selectedBlock
              block && block.eyo.data.dotted.set(item.key)
            }
          },
          [eYo.Key.PARENT]: {
            key: eYo.Key.PARENT,
            content: '<span class="eyo-placeholder">' + this.$t('message.' + eYo.Key.PARENT) + '.</span>',
            title: '.',
            action (item) {
              var block = this.selectedBlock
              block && block.eyo.data.dotted.set(item.key)
            }
          },
          [eYo.Key.ROOT]: {
            key: eYo.Key.ROOT,
            content: this.placeholder('eyo-info-primary-dotted1') + '<div class="eyo-info-primary-dotted2">.</div>',
            action (item) {
              var block = this.selectedBlock
              block && block.eyo.data.dotted.set(item.key)
            }
          }
        }
      },
      items () {
        return [
          this.items_[eYo.Key.NONE],
          this.items_[eYo.Key.PARENT],
          this.items_[eYo.Key.ROOT]
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
              block && block.eyo.data.dotted.set(eYo.Key.MODULE)
              block && block.eyo.data.module.set(item.key)
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
  