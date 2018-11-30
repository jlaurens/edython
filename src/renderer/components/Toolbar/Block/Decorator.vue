<template>
  <b-btn-toolbar id="block-decorator" key-nav  aria-label="Block decorator" justify>
    <b-btn-group>
      <b-form-input v-model="name" type="text" class="btn-outline-secondary eyo-form-input-text eyo-form-input-text-any-expression eyo-width-10" :style='{fontFamily: $$.eYo.Font.familyMono}' :title="title" v-tippy ></b-form-input>
      <b-dd id="block-variant" class="eyo-dropdown" variant="outline-secondary">
        <b-dd-item-button v-for="choice in choices" v-on:click="choose(choice)" :key="choice" class="block-variant eyo-code" v-html="content(choice)"></b-dd-item-button>
      </b-dd>    
      <span v-if="property !== $$.eYo.Key.GETTER" class="eyo-code-reserved btn btn-outline-secondary">.{{property}}</span>
    </b-btn-group>
    <comment :eyo="eyo" :step="step"></comment>
  </b-btn-toolbar>
</template>

<script>
  import Comment from './Comment.vue'

  export default {
    name: 'info-decorator',
    data: function () {
      return {
        saved_step: undefined,
        property_: undefined,
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
      name () {
        this.$$synchronize(this.step)
        return this.name_
      },
      property () {
        this.$$synchronize(this.step)
        return this.property_
      },
      choices () {
        return this.eyo.data.chooser.getAll()
      },
      title () {
        return this.$$t('block.tooltip.decorator.input')
      }
    },
    created () {
      this.$$synchronize(this.step)
    },
    beforeUpdate () {
      this.$$synchronize(this.step)
    },
    methods: {
      content (choice) {
        if (choice === eYo.Key.NONE) {
          return '@…'
        } else if (choice === eYo.Key.N_ARY) {
          return '@…(…)'
        } else if (choice === eYo.Key.SETTER) {
          return '@….setter'
        } else if (choice === eYo.Key.DELETER) {
          return '@….deleter'
        } else {
          return '@' + choice
        }
      },
      choose (choice) {
        this.eyo.chooser_p = choice
      },
      $$doSynchronize (eyo) {
        this.property_ = eyo.property_p
        this.name_ = eyo.name_p
      }
    }
  }
</script>
<style>
  #block-decorator {
    padding: 0 0.25rem;
  }
  .eyo-width-10 {
    width: 10rem;
  }
</style>
