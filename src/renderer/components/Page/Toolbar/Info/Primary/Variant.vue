<template>
  <b-button-group class="mx-1">
    <b-dropdown :id="id" class="eyo-dropdown" v-if="variants && variants.length" variant="outline-secondary">
      <template slot="button-content"><div class="eyo-info-primary-variant eyo-code eyo-content" v-html="selected.selected || selected.content"></div></template>
      <b-dropdown-item-button v-for="variant in variants" v-on:click="selected = variant" :key="variant.key" class="eyo-info-primary-variant eyo-code" v-html="variant.content"></b-dropdown-item-button>
    </b-dropdown>
    <b-form-input v-model="name" type="text" size="10" class="btn btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}' v-if="selected.key === $$.eYo.Key.NAME"></b-form-input>
  </b-button-group>
</template>

<script>
  export default {
    name: 'info-primary-variant',
    data () {
      return {
        dataKey: 'variant'
      }
    },
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
      id () {
        return 'eyo-info-' + this.dataKey
      },
      data () {
        var block = this.selectedBlock
        return block && block.eyo.data[this.dataKey]
      },
      name: {
        get () {
          var block = this.selectedBlock
          return block && block.eyo.data.name.get()
        },
        set (newValue) {
          var block = this.selectedBlock
          block && block.eyo.data.name.set(newValue)
        }
      },
      selected: {
        get () {
          var key = this.data
            ? this.data.get()
            : this.dataKey.charAt(0).toUpperCase() + this.dataKey.slice(1)
          return this.items[key]
        },
        set (newValue) {
          // do not change if the type is identifier
          if (newValue.key === eYo.Key.EXPRESSION) {
            var block = this.selectedBlock
            if (block.type === eYo.T3.Expr.identifier) {
              return
            }
          }
          this.data && this.data.set(newValue.key)
        }
      },
      items () {
        return {
          [eYo.Key.NAME]: {
            content: this.name || this.$t('message.name'),
            selected: '&nbsp;',
            key: eYo.Key.NAME
          },
          [eYo.Key.EXPRESSION]: {
            content: '<div class="eyo-info-primary-variant0">' + this.placeholder('eyo-info-primary-variant1') + '</div>',
            key: eYo.Key.EXPRESSION
          }
        }
      },
      variants () {
        return [
          this.items[eYo.Key.NAME],
          this.items[eYo.Key.EXPRESSION]
        ]
      }
    }
  }
</script>
<style>
  .btn .eyo-info-primary-variant {
    padding-right: 0.75rem;
  }
  .dropdown-item.eyo-info-primary-variant {
    padding-right: 0.5rem;
  }
  .eyo-form-input-text {
    text-align: left;
    width:10rem;
  }
  .btn-outline-secondary.eyo-form-input-text:hover {
    background: white;
    color: black;
  }
</style>
