<template>
  <b-button-toolbar id="info-primary-ry" key-nav  aria-label="Info toolbar primary" justify>
    <b-btn-group>
      <b-form-input id="eyo-info-primary-mandatory" v-model="myMandatory" type="text" class="btn btn-outline-secondary eyo-form-input-text-ry" :style='{fontFamily: $$.eYo.Font.familyMono}' :disabled="!can_ry"></b-form-input>
      <b-dropdown id="info-unary-operator" class="eyo-dropdown eyo-dropdown-ry" variant="outline-secondary" :disabled="!can_ry">
        <template slot="button-content"><span class="eyo-code eyo-content">&nbsp;</span></template>
        <b-dropdown-item-button v-for="item in items" v-on:click="myMandatory = item" :key="item" class="eyo-code eyo-content" v-html="item"></b-dropdown-item-button>
        </b-dropdown-item-button>
      </b-dropdown>
      <span class="btn btn-outline-secondary eyo-form-input-text">{{'≤ # args ≤'}}</span>
      <b-form-input id="eyo-info-primary-ary" v-model="myAry" type="text" class="btn btn-outline-secondary eyo-form-input-text-ry" :style='{fontFamily: $$.eYo.Font.familyMono}' :disabled="!can_ry"></b-form-input>
      <b-dropdown id="info-unary-operator" class="eyo-dropdown eyo-dropdown-ry" variant="outline-secondary" :disabled="!can_ry">
        <template slot="button-content"><span class="eyo-code eyo-content">&nbsp;</span></template>
        <b-dropdown-item-button v-for="item in items" v-on:click="myAry = item" :key="item" class="eyo-code eyo-content" v-html="item"></b-dropdown-item-button>
        </b-dropdown-item-button>
      </b-dropdown>
    </b-btn-group>
  </b-button-toolbar>
</template>

<script>
  export default {
    name: 'info-primary-ry',
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
          this.eyo.ary_p = newValue === '∞'
            ? Infinity
            : Number(newValue)
          console.log('this.eyo.ary_p = ', this.eyo.ary_p, newValue, Number(newValue))
          this.$emit('synchronize')
        }
      },
      myMandatory: {
        get () {
          return this.mandatory === Infinity
            ? '∞'
            : this.mandatory.toString()
        },
        set (newValue) {
          this.eyo.mandatory_p = newValue === '∞'
            ? Infinity
            : Number(newValue)
          this.$emit('synchronize')
        }
      }
    }
  }
</script>
<style scoped>
  .info-primary-ry {
    padding-right:1rem;
  }
  .eyo-form-input-text-ry {
    width:2rem;
  }
</style>
