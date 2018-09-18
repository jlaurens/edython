<template>
  <b-dropdown id="info-unary-operator" class="eyo-dropdown" v-if="data" variant="outline-secondary">
    <template slot="button-content"><span class="info-unary-operator eyo-code eyo-content" v-html="formatter(operator)"></span></template>
    <b-dropdown-item-button v-for="item in operators" v-on:click="operator = item" :key="item" class="info-unary-operator eyo-code" v-html="formatter(item)"></b-dropdown-item-button>
    </b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
  export default {
    name: 'info-unary-operator',
    data () {
      return {
        operator_: '?'
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
          return item.length ? '<div class="eyo-info-primary-variant2">' + item + '</div>' + this.my_placeholder : '&nbsp;'
        }
      },
      dataKey: {
        type: String,
        default: 'operator'
      }
    },
    computed: {
      data () {
        return this.eyo.data[this.dataKey]
      },
      operator: {
        get () {
          return this.operator_
        },
        set (newValue) {
          this.operator_ = newValue
          this.data && this.data.change(newValue)
        }
      },
      operators () {
        return this.data.getAll()
      },
      my_placeholder () {
        return this.placeholder('eyo-info-primary-variant1')
      }
    },
    created () {
      this.operator_ = this.data
        ? this.data.get()
        : '?'
    }
  }
</script>
<style>
  .info-unary-operator {
    padding-right: 0.75rem;
  }
</style>
  