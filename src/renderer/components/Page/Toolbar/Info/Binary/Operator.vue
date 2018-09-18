<template>
  <b-dropdown id="info-binary-operator" class="eyo-dropdown" v-if="data" variant="outline-secondary">
    <template slot="button-content"><span class="info-binary-operator eyo-code eyo-content" v-html="formatter(operator)"></span></template>
    <b-dropdown-item-button v-for="item in operatorsA" v-on:click="operator = item" :key="item" class="info-binary-operator eyo-code" v-html="formatter(item)">
    </b-dropdown-item-button>
    <b-dropdown-divider></b-dropdown-divider>
    <b-dropdown-item-button v-for="item in operatorsB" v-on:click="operator = item" :key="item" class="info-binary-operator eyo-code" v-html="formatter(item)">
    </b-dropdown-item-button>            
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-binary-operator',
    data: function () {
      return {
        operators: {
          num: ['+', '-', '*', '/', '//', '%', '@'],
          bin: ['<<', '>>', '&', '^', '|']
        }
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      placeholder: {
        type: Function,
        default: function (item) {
          return item
        }
      },
      formatter: {
        type: Function,
        default: function (item) {
          return item.length ? this.my_placeholder + '<div class="eyo-info-primary-variant2">' + item + '</div>' + this.my_placeholder : '&nbsp;'
        }
      },
      dataKey: {
        type: String,
        default: 'operator'
      }
    },
    computed: {
      data () {
        return this.eyo && this.eyo.data[this.dataKey]
      },
      operator: {
        get () {
          return this.data
            ? this.data.get()
            : '?'
        },
        set (newValue) {
          this.data && this.data.set(newValue)
          this.eyo.render()
        }
      },
      operatorsA () {
        return this.operators.bin.indexOf(this.operator) >= 0
          ? this.operators.bin
          : this.operators.num
      },
      operatorsB () {
        return this.operators.bin.indexOf(this.operator) >= 0
          ? this.operators.num
          : this.operators.bin
      },
      my_placeholder () {
        return this.placeholder('eyo-info-primary-variant1')
      }
    }
  }
</script>
<style>
  .info-binary-operator {
    padding-right: 0.75rem;
  }
</style>
  