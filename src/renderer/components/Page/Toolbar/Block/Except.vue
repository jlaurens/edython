<template>
  <b-button-toolbar id="info-except" key-nav  aria-label="Info decorator" justify>
    <b-button-group class="mx-1">
        <span class="btn btn-outline-secondary eyo-code eyo-code-reserved" :style="{fontFamily: $$.eYo.Font.familyMono}">except</span>
        <b-dropdown id="info-variant" class="eyo-dropdown" variant="outline-secondary">
        <b-dropdown-item-button v-for="choice in choices" v-on:click="choose(choice)" :key="choice" class="info-variant eyo-code" v-html="content(choice)"></b-dropdown-item-button>
      </b-dropdown>    
      <b-form-input v-if="can_expression" v-model="expression" type="text" class="btn btn-outline-secondary eyo-form-input-text eyo-form-input-text-any-expression eyo-width-10" :title="$t('message.except_expression')" v-tippy  :style="{fontFamily: $$.eYo.Font.familyMono}"></b-form-input>
      <span v-if="can_alias" class="btn btn-outline-secondary eyo-code-reserved" :style="{fontFamily: $$.eYo.Font.familyMono}"" >as</span>
      <b-form-input v-if="can_alias" v-model="alias" type="text" class="btn btn-outline-secondary eyo-form-input-text eyo-form-input-text-any-expression eyo-width-10" :style="{fontFamily: $$.eYo.Font.familyMono}"" :title="$t('message.except_alias')" v-tippy ></b-form-input>
      <!--span v-if="property !== $$.eYo.Key.GETTER" class="eyo-code-reserved btn btn-outline-secondary">.{{property}}</span-->
    </b-button-group>
    <comment :eyo="eyo"></comment>
  </b-button-toolbar>
</template>

<script>
  import Comment from './Comment.vue'

  export default {
    name: 'info-decorator',
    data: function () {
      return {
        step_: undefined,
        expression_: undefined,
        alias_: undefined,
        variant_: undefined
      }
    },
    components: {
      Comment
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      variant () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.variant_
      },
      choices () {
        return this.eyo.variant_d.getAll()
      },
      can_expression () {
        return this.variant !== eYo.Key.NONE && !this.eyo.expression_s.targetBlock()
      },
      expression: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
          return this.expression_
        },
        set (newValue) {
          this.eyo.expression_p = newValue
        }
      },
      can_alias () {
        return this.variant === eYo.Key.ALIASED && !this.eyo.alias_s.targetBlock()
      },
      alias: {
        get () {
          (this.step_ !== this.eyo.change.step) && this.synchronize()
          return this.alias_
        },
        set (newValue) {
          this.eyo.alias_p = newValue
        }
      }
    },
    created () {
      this.synchronize()
    },
    updated () {
      this.synchronize()
    },
    methods: {
      content (choice) {
        if (choice === eYo.Key.NONE) {
          return 'except:'
        } else if (choice === eYo.Key.EXPRESSION) {
          return 'except …:'
        } else /* if (choice === eYo.Key.ALIASED) */ {
          return 'except … as …:'
        }
      },
      choose (choice) {
        this.eyo.variant_p = choice
      },
      synchronize () {
        this.step_ = this.eyo.change.step
        this.variant_ = this.eyo.variant_p
        this.expression_ = this.eyo.expression_p
        this.alias_ = this.eyo.alias_p
      }
    }
  }
</script>
<style>
  #info-decorator {
    padding: 0 0.25rem;
  }
  .eyo-width-10 {
    width: 10rem;
  }
  .btn-outline-secondary.eyo-code-reserved,
  .btn-outline-secondary.eyo-code-reserved:hover,
  .btn-outline-secondary.eyo-code-reserved:active,
  .btn-outline-secondary.eyo-code-reserved:not(:disabled):not(.disabled):active,
  .btn-outline-secondary.eyo-code-reserved:not(:disabled):not(.disabled).active {
    color: rgba(0, 84, 147, 0.75);
    background-color: white;
    border-color: inherit;
    font-weight: bold;
    box-shadow: none;
  }
  .btn-outline-secondary.eyo-code-reserved:focus, .btn-outline-secondary.eyo-code-reserved.focus,
  .btn.eyo-code-reserved:focus, .btn.eyo-code-reserved.focus {
      box-shadow: none;
  }
</style>