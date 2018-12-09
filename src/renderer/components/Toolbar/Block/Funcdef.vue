<template>
  <b-btn-group id="block-funcdef" key-nav  aria-label="Block decorator" justify>
    <b-btn-group>
      <label for="block-funcdef-name"" class="btn-outline-secondary"><span :style="{fontFamily: $$.eYo.Font.familyMono}" class="eyo-code-reserved">def</span></label>
      <b-form-input id="block-funcdef-name" v-model="name" type="text" class="btn-outline-secondary w-30rem" :style='{fontFamily: $$.eYo.Font.familyMono}' :title="title" v-tippy ></b-form-input>
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
          this.$$synchronize(this.step)
          return this.name_
        },
        set (newValue) {
          this.eyo.name_p = newValue
        }
      }
    },
    methods: {
      $$doSynchronize (eyo) {
        this.name_ = eyo.name_p
      }
    }
  }
</script>
<style>
</style>
