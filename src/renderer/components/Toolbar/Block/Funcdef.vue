<template>
  <b-btn-group id="block-funcdef" key-nav  aria-label="Block decorator" justify>
    <b-btn-group>
      <label for="block-funcdef-name"" class="btn-outline-secondary"><span :style="{fontFamily: $$.eYo.Font.familyMono}" class="eyo-code-reserved">def</span></label>
      <b-form-input id="block-funcdef-name" v-model="name" type="text" class="btn-outline-secondary eyo-form-input-text eyo-form-input-text-any-expression eyo-width-10" :style='{fontFamily: $$.eYo.Font.familyMono}' :title="title" v-tippy ></b-form-input>
      <label class="btn-outline-secondary" :style="{fontFamily: $$.eYo.Font.familyMono}">(…)<span  class="eyo-code-reserved">:</span> </label>  
    </b-btn-group>
    <comment :eyo="eyo" :step="step"></comment>
  </b-btn-group>
</template>

<script>
  import Comment from './Comment.vue'

  export default {
    name: 'block-funcdef',
    data: function () {
      return {
        saved_step: undefined,
        name_: undefined
      }
    },
    components: {
      Comment
    },
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
      title () {
        return this.$$t('block.tooltip.funcdef.name')
      },
      name: {
        get () {
          (this.saved_step === this.step) || this.$$synchronize()
          return this.name_
        },
        set (newValue) {
          this.eyo.name_p = newValue
        }
      }
    },
    created () {
      this.$$synchronize()
    },
    beforeUpdate () {
      (this.saved_step === this.step) || this.$$synchronize()
    },
    methods: {
      $$synchronize () {
        if (!this.eyo || (this.saved_step === this.step)) {
          return
        }
        var eyo = this.eyo
        this.saved_step = eyo.change.step
        this.name_ = eyo.name_p
      }
    }
  }
</script>
<style>
</style>
