<template>
  <b-btn-group id="block-primary-ry" key-nav  aria-label="Block toolbar primary">
    <b-form-input id="eyo-block-primary-mandatory" v-model="myMandatory" type="text" class="eyo-btn-inert btn-outline-secondary eyo-form-input-text-ry" :style='{fontFamily: $$.eYo.Font.familyMono}' :disabled="!can_ry"></b-form-input>
    <b-dropdown id="block-unary-operator" class="eyo-dropdown eyo-dropdown-ry" variant="outline-secondary" :disabled="!can_ry">
      <b-dropdown-item-button v-for="item in items" v-on:click="myMandatory = item" :key="item" class="eyo-code eyo-content" v-html="item"></b-dropdown-item-button>
      </b-dropdown-item-button>
    </b-dropdown>
    <span class="eyo-btn-inert btn-outline-secondary eyo-form-input-text">{{'≤ # args ≤'}}</span>
    <b-form-input id="eyo-block-primary-ary" v-model="myAry" type="text" class="eyo-btn-inert btn-outline-secondary eyo-form-input-text-ry" :style='{fontFamily: $$.eYo.Font.familyMono}' :disabled="!can_ry"></b-form-input>
    <b-dropdown id="block-unary-operator" class="eyo-dropdown eyo-dropdown-ry" variant="outline-secondary" :disabled="!can_ry">
      <b-dropdown-item-button v-for="item in items" v-on:click="myAry = item" :key="item" class="eyo-code eyo-content" v-html="item"></b-dropdown-item-button>
      </b-dropdown-item-button>
    </b-dropdown>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'block-primary-ry',
    data: function () {
      return {
        mandatory_: undefined,
        ary_: undefined,
        items: ['0', '1', '2', '3', '4', '5', '∞']
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      can_ry: {
        type: Boolean,
        default: true
      },
      mandatory: {
        type: Number,
        default: 0
      },
      ary: {
        type: Number,
        default: Infinity
      }
    },
    computed: {
      myAry: {
        get () {
          return this.ary === Infinity
            ? '∞'
            : this.ary.toString()
        },
        set (newValue) {
          var filtered = newValue === '∞'
            ? Infinity
            : Number(newValue)
          if (!isNaN(filtered)) {
            this.eyo.ary_p = filtered
            this.$emit('synchronize')
          }
        }
      },
      myMandatory: {
        get () {
          return this.mandatory === Infinity
            ? '∞'
            : this.mandatory.toString()
        },
        set (newValue) {
          var filtered = newValue === '∞'
            ? Infinity
            : Number(newValue)
          if (!isNaN(filtered)) {
            this.eyo.mandatory_p = filtered
            this.$emit('synchronize')
          }
        }
      }
    }
  }
</script>
<style scoped>
  .block-primary-ry {
    padding-right:1rem;
  }
  .eyo-form-input-text-ry {
    width:2rem;
  }
  #block-primary-ry .eyo-form-input-text {
    width: 6.5rem;
  }
</style>
