<!--
  This template is divided into 2 parts:
  1) the block edition
    a) block content
    b) comment if any
  2) the block actions
    a) copy/paste
    b) common stuff to be defined later
-->
<template>
  <b-btn-toolbar id="block-toolbar" key-nav  aria-label="Block toolbar" justify :style="style">
    <b-btn-group class="eyo-block-edit">
      <block-primary v-if="isSelected($$.eYo.DelegateSvg.Expr.primary.eyo.getModel().xml.types)" :eyo="eyo" :step="step" :slotholder="slotholder" :modifiable="modifiable"></block-primary>
      <block-primary v-else-if="isSelected([$$.eYo.T3.Stmt.call_stmt])" :eyo="eyo" :step="step" :slotholder="slotholder"></block-primary>
      <block-literal v-else-if="isSelected([$$.eYo.T3.Expr.shortliteral, $$.eYo.T3.Expr.longliteral, $$.eYo.T3.Expr.shortbytesliteral, $$.eYo.T3.Expr.longbytesliteral, $$.eYo.T3.Expr.shortstringliteral, $$.eYo.T3.Expr.longstringliteral, $$.eYo.T3.Stmt.docstring_stmt])" :eyo="eyo" :step="step" :modifiable="modifiable"></block-literal>
      <block-number v-else-if="isSelected([$$.eYo.T3.Expr.integer,
      $$.eYo.T3.Expr.floatnumber,
      $$.eYo.T3.Expr.imagnumber])" :eyo="eyo" :step="step" :modifiable="modifiable"></block-number>
      <block-print v-else-if="isSelected([$$.eYo.T3.Expr.builtin__print_expr, $$.eYo.T3.Stmt.builtin__print_stmt])" :eyo="eyo" :step="step" :modifiable="modifiable"></block-print>
      <block-unary v-else-if="isSelected($$.eYo.T3.Expr.u_expr)" :eyo="eyo" :step="step" :slotholder="slotholder" :modifiable="modifiable"></block-unary>
      <block-binary v-else-if="isSelected([
        $$.eYo.T3.Expr.binary,
        $$.eYo.T3.Expr.a_expr,
        $$.eYo.T3.Expr.m_expr, $$.eYo.T3.Expr.shift_expr, $$.eYo.T3.Expr.and_expr, $$.eYo.T3.Expr.xor_expr,
        $$.eYo.T3.Expr.or_expr,
        $$.eYo.T3.Expr.power
      ])" :eyo="eyo" :step="step" :slotholder="slotholder" :modifiable="modifiable"></block-binary>
      <block-assignment v-else-if="isSelected($$.eYo.T3.Stmt.assignment_stmt)" :eyo="eyo" :step="step" :slotholder="slotholder"></block-assignment>
      <block-builtin v-else-if="isSelected($$.eYo.T3.Expr.builtin__object)" :eyo="eyo" :step="step" :modifiable="modifiable"></block-builtin>
      <block-augmented-assignment v-else-if="isSelected($$.eYo.T3.Stmt.augmented_assignment_stmt)" :eyo="eyo" :step="step" :slotholder="slotholder"></block-augmented-assignment>
      <block-any-expression v-else-if="isSelected($$.eYo.T3.Expr.any)" :eyo="eyo" :step="step" :slotholder="slotholder" :modifiable="modifiable"></block-any-expression>
      <block-expression-statement v-else-if="isSelected($$.eYo.T3.Stmt.expression_stmt)" :eyo="eyo" :step="step" :slotholder="slotholder"></block-expression-statement>
      <block-decorator v-else-if="isSelected($$.eYo.T3.Stmt.decorator_stmt)" :eyo="eyo" :step="step" :slotholder="slotholder"></block-decorator>
      <block-starred v-else-if="isSelected([
        $$.eYo.T3.Expr.star_expr,
        $$.eYo.T3.Expr.expression_star,
        $$.eYo.T3.Expr.expression_star_star,
        $$.eYo.T3.Expr.target_star,
        $$.eYo.T3.Expr.star,
        $$.eYo.T3.Expr.parameter_star,
        $$.eYo.T3.Expr.parameter_star_star
      ])" :eyo="eyo" :step="step" :slotholder="slotholder"></block-starred>
      <block-except v-else-if="isSelected([
        $$.eYo.T3.Stmt.except_part,
        $$.eYo.T3.Stmt.void_except_part
      ])" :eyo="eyo" :step="step" :slotholder="slotholder"></block-except>
      <block-funcdef v-else-if="isSelected($$.eYo.T3.Stmt.funcdef_part)" :eyo="eyo" :step="step"></block-funcdef>
      <block-default :eyo="eyo" :step="step" :slotholder="slotholder" :modifiable="modifiable" v-else-if="eyo"></block-default>
      <block-none v-else></block-none>
      <block-comment :eyo="eyo" :step="step" ></block-comment>
    </b-btn-group>
    <b-btn-group>
      <block-copy-paste />
      <block-layout />    
    </b-btn-group>
    <block-common :eyo="eyo" :step="step" />
  </b-btn-toolbar>
</template>

<script>
  import BlockCommon from './Block/Common.vue'
  import BlockComment from './Block/Comment.vue'
  import BlockBuiltin from './Block/Builtin.vue'
  import BlockModifier from './Block/Modifier.vue'
  import BlockPrimary from './Block/Primary.vue'
  import BlockLiteral from './Block/Literal.vue'
  import BlockNumber from './Block/Number.vue'
  import BlockPrint from './Block/Print.vue'
  import BlockUnary from './Block/Unary.vue'
  import BlockBinary from './Block/Binary.vue'
  import BlockAnyExpression from './Block/AnyExpression.vue'
  import BlockExpressionStatement from './Block/ExpressionStatement.vue'
  import BlockAssignment from './Block/Assignment.vue'
  import BlockAugmentedAssignment from './Block/AugmentedAssignment.vue'
  import BlockValue from './Block/Value.vue'
  import BlockDefault from './Block/Default.vue'
  import BlockDecorator from './Block/Decorator.vue'
  import BlockStarred from './Block/Starred.vue'
  import BlockNone from './Block/None.vue'
  import BlockCopyPaste from './Block/CopyPaste.vue'
  import BlockLayout from './Block/Layout.vue'
  import BlockExcept from './Block/Except.vue'
  import BlockFuncdef from './Block/Funcdef.vue'

  export default {
    name: 'toolbar-block',
    data: function () {
      return {
        saved_step: 0,
        theta: 0
      }
    },
    components: {
      BlockComment,
      BlockCommon,
      BlockBuiltin,
      BlockModifier,
      BlockPrimary,
      BlockLiteral,
      BlockNumber,
      BlockPrint,
      BlockUnary,
      BlockBinary,
      BlockAnyExpression,
      BlockExpressionStatement,
      BlockAssignment,
      BlockAugmentedAssignment,
      BlockValue,
      BlockDefault,
      BlockDecorator,
      BlockStarred,
      BlockNone,
      BlockCopyPaste,
      BlockLayout,
      BlockExcept,
      BlockFuncdef
    },
    mounted () {
      this.theta = this.$store.state.UI.toolbarEditVisible ? 1 : 0
    },
    computed: {
      slotholder () {
        var d = eYo.Shape.definitionWithConnection()
        var one_rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
        return function (className) {
          return `<div class="eyo-block-slotholder${className ? ' ' + className : ''}"><svg xmlns="http://www.w3.org/2000/svg" height="${Math.trunc(1.75 * one_rem)}" width="${Math.trunc(2 * one_rem)}"><path class="eyo-path-contour" d="${d} z"></path></svg></div>`
        }
      },
      selectedBlock () {
        var id = this.$store.state.UI.selectedBlockId
        var block = id && eYo.App.workspace.blockDB_[id]
        return block
      },
      eyo () {
        return this.selectedBlock && this.selectedBlock.eyo
      },
      step () {
        return this.$store.state.UI.selectedBlockStep
      },
      selectedBlockType () {
        var type = this.$store.state.UI.selectedBlockType
        return type ? type.substring(4) : null
      },
      toolbarEditVisible () {
        return this.$store.state.UI.toolbarEditVisible
      },
      style () {
        return `right: ${100 * (1 - this.theta)}%;`
      },
      modifiable () {
        return this.isSelected(eYo.T3.Expr.Check.or_expr_all)
      }
    },
    watch: {
      toolbarEditVisible (newValue, oldValue) {
        this.theta = newValue ? 0 : 1
        this.$$.TweenLite.to(this, 1, {theta: 1 - this.theta})
      }
    },
    methods: {
      isSelected (type) {
        if (goog.isArray(type)) {
          for (var i = 0, t; (t = type[i++]) ;) {
            if (t === this.$store.state.UI.selectedBlockType) {
              return true
            }
          }
        } else {
          return type === this.$store.state.UI.selectedBlockType
        }
      }
    }
  }
</script>
<style>
  .eyo-btn-inert {
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    border-radius: 0.25rem;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  #block-toolbar {
    position: relative;
    padding: 0.25rem;
    text-align:center;
    height: 2.25rem;
    font-size: 1rem;
  }
  #block-toolbar input[type="checkbox"]:first-child {
    padding-left: 0.5rem;
  }
  #block-toolbar .input-group-text {
    padding: 0 0.25rem;
  }
  .eyo-block-edit .info,
  .eyo-block-slotholder,
  #block-toolbar .btn,
  #block-toolbar .input-group-text {
    height: 1.75rem;
  }
  #block-toolbar .btn:not(.input-group):not(.dropdown-toggle),
  .eyo-btn-inert:not(.input-group) {
    padding: 0rem 0.25rem;
  }
  #block-toolbar .input-group {
    padding: 0;
  }
  #block-toolbar .btn-group,
  #block-toolbar .dropdown-toggle {
    padding: 0 0.25rem;
    margin:0;
  }
  #block-toolbar label.btn:first-child {
    padding-left:0.25rem;
  }
  #block-toolbar label {
    margin:0;
  }
  #block-toolbar .dropdown-toggle {
    padding-left: 0.25rem;
    padding-right: 1rem;
  }
  #block-toolbar .dropdown-toggle-split {
      padding-right: 0.5rem;
      padding-left: 0.5rem;
  }
  .btn-secondary:hover .eyo-code-reserved {
    color: #fff;
  }
  .eyo-block-edit .info,
  .eyo-block-slotholder {
    display: inline-block;
  }
  .btn .eyo-block-slotholder .eyo-path-contour {
    stroke-width: 2px;
  }
  .dropdown-item:hover .eyo-block-slotholder .eyo-path-contour {
    stroke: rgb(100,100,100);
  }
  .eyo-form-input-text {
    text-align: left;
    width: 8rem;
  }
  .btn-outline-secondary.eyo-form-input-text:hover {
    background: white;
    color: black;
  }
  .eyo-btn-inert:focus,
  .eyo-btn-inert:hover,
  .eyo-btn-inert:active,
  .eyo-btn-inert:not(:disabled):not(.disabled):active,
  .eyo-btn-inert:not(:disabled):not(.disabled).active {
    color: inherit;
    background-color: white;
    border-color: inherit;
    box-shadow: none;
  }
  #block-toolbar .btn-group:first-child,
  #block-toolbar .btn-group .btn-group {
    padding-left:0;
  }
  #block-toolbar .btn-group:last-child {
    padding-right:0;
  }
  #block-toolbar .btn-group .btn-group {
    margin: 0;
  }
  #block-toolbar .btn-group .btn-group:not(:first-child) {
    padding-left: 0;
  }
  #block-toolbar .btn-group .btn-group:not(:last-child) {
    padding-right: 0;
  }
  #block-toolbar .btn-group.eyo-block-edit .btn-group:not(:first-child) .eyo-btn-inert:not(:first-child),
  #block-toolbar .btn-group.eyo-block-edit .btn-group:not(:first-child) .eyo-btn-inert,
  #block-toolbar .btn-group.eyo-block-edit .btn-group:not(:first-child) .btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .eyo-slot-holder {
    display: inline-block;
    vertical-align: middle;
    position: relative;
    top: -0.0625rem;
  }
  .eyo-block-edit {
    border-radius: 0.25rem;
  }
  .eyo-block-edit-content .eyo-label {
    background-color: white;
  }
  .eyo-block-edit-content .eyo-label {
    border-radius: inherit;
  }
  .eyo-block-edit-content .input-group-text:not(last-child),
  .eyo-block-edit-content .b-dropdown:not(:last-child) .btn {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    margin-right: -1px;
  }
  .eyo-block-edit-content:not(:first-child),
  .input-group-text:not(:first-child),
  .eyo-block-edit .eyo-form-input-text:not(:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .eyo-block-edit .btn-group:not(:last-child) .b-dropdown:not(last-child) .btn,
  .eyo-block-edit .btn-group:not(:last-child) .eyo-btn-inert,
  .eyo-block-edit .eyo-form-input-text:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right-width: 0;
  }
  .eyo-block-edit .info {
    background-color: inherit;
  }
  .eyo-text-dropdown {
    background-color: white;
  }
  .eyo-text-dropdown .btn {
    border-color: inherit;
    border: 1px solid #ced4da;
    line-height: 1.75rem;
  }
  .eyo-dropdown .btn::after,
  .eyo-text-dropdown .btn::after {
    position: absolute;
    right: 0.2rem;
    bottom: 0.25rem;
    opacity: 0.666;
  }
  .eyo-block-edit .eyo-form-input-text {
    border: 1px solid #ced4da;
    background: white;
    font-size: 1.1rem;
  }
</style>
