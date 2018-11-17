<template>
  <b-button-toolbar id="info-decorator" key-nav  aria-label="Info decorator" justify>
    <b-button-toolbar>
      <b-button-group>
        <b-form-input v-model="myName" type="text" class="btn btn-outline-secondary eyo-form-input-text eyo-form-input-text-any-expression" :style='{fontFamily: $$.eYo.Font.familyMono}' :title="title" v-tippy ></b-form-input>
        <b-dropdown id="info-variant" class="eyo-dropdown" variant="outline-secondary">
          <b-dropdown-item-button v-for="choice in choices" v-on:click="choose(choice)" :key="choice" class="info-variant eyo-code">{{choice}}</b-dropdown-item-button>
        </b-dropdown>    
        <span v-if="property !== $$.eYo.Key.GETTER" class="eyo-code-reserved btn btn-outline-secondary">.{{property}}</span>
      </b-button-group>
      <comment :eyo="eyo" :comment-variant="commentVariant" v-on:synchronize="synchronize"></comment>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
  </b-button-toolbar>
</template>

<script>
  import Comment from './Comment.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-decorator',
    data: function () {
      return {
        variant_: undefined,
        commentVariant_: undefined,
        property_: undefined,
        myName: undefined
      }
    },
    components: {
      Comment,
      Common
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      slotholder: {
        type: Function,
        default: function (item) {
          return item
        }
      }
    },
    computed: {
      property () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.property_
      },
      variant () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.variant_
      },
      commentVariant () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.commentVariant_
      },
      choices () {
        return this.eyo.data.chooser.getAll()
      }
    },
    created () {
      this.synchronize()
    },
    methods: {
      choose (choice) {
        this.eyo.chooser_p = choice
      },
      synchronize () {
        this.variant_ = this.eyo.variant_p
        this.commentVariant_ = this.eyo.comment_variant_p
        this.property_ = this.eyo.property_p
        this.myName = this.eyo.name_p
      }
    }
  }
</script>
<style>
  #info-decorator {
    padding: 0 0.25rem;
  }
</style>
