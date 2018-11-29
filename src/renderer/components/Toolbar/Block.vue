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
  <b-btn-toolbar id="toolbar-block" key-nav  aria-label="Block toolbar" justify :style="style">
    <b-btn-group class="b3k-edit">
      <block-primary v-if="isSelected($$.eYo.DelegateSvg.Expr.primary.eyo.getModel().xml.types) || isSelected([$$.eYo.T3.Stmt.call_stmt])" :eyo="eyo" :step="step" :slotholder="slotholder"></block-primary>
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
      <block-import v-else-if="isSelected($$.eYo.T3.Stmt.import_stmt)" :eyo="eyo" :step="step" :slotholder="slotholder"></block-import>
      <block-variant v-else-if="isSelected([$$.eYo.T3.Stmt.global_global, $$.eYo.T3.Stmt.global_nonlocal, $$.eYo.T3.Stmt.global_del])" :eyo="eyo" :step="step" :modifiable="modifiable" :text="true" child_id="block-g-n-d" :slotholder="slotholder"></block-variant>
      <block-default :eyo="eyo" :step="step" :slotholder="slotholder" :modifiable="modifiable" v-else-if="eyo"></block-default>
      <block-none v-else></block-none>
      <block-comment :eyo="eyo" :step="step" ></block-comment>
    </b-btn-group>
    <b-btn-group class="b3k-cpl">
      <block-copy-paste />
      <block-layout />    
    </b-btn-group>
    <block-common :eyo="eyo" :step="step" />
  </b-btn-toolbar>
</template>

<script>
  import {mapState} from 'vuex'

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
  import BlockVariant from './Block/Variant.vue'
  import BlockDefault from './Block/Default.vue'
  import BlockDecorator from './Block/Decorator.vue'
  import BlockStarred from './Block/Starred.vue'
  import BlockNone from './Block/None.vue'
  import BlockCopyPaste from './Block/CopyPaste.vue'
  import BlockLayout from './Block/Layout.vue'
  import BlockExcept from './Block/Except.vue'
  import BlockFuncdef from './Block/Funcdef.vue'
  import BlockImport from './Block/Import.vue'

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
      BlockVariant,
      BlockDefault,
      BlockDecorator,
      BlockStarred,
      BlockNone,
      BlockCopyPaste,
      BlockLayout,
      BlockExcept,
      BlockFuncdef,
      BlockImport
    },
    mounted () {
      this.theta = this.$store.state.UI.toolbarBlockVisible ? 1 : 0
    },
    computed: {
      slotholder () {
        var d = eYo.Shape.definitionWithConnection()
        var one_rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
        return function (className) {
          return `<div class="eyo-slot-holder${className ? ' ' + className : ''}"><svg xmlns="http://www.w3.org/2000/svg" height="${Math.trunc(1.75 * one_rem)}" width="${Math.trunc(2 * one_rem)}"><path class="eyo-path-contour" d="${d} z"></path></svg></div>`
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
      style () {
        return `right: ${100 * (1 - this.theta)}%;`
      },
      modifiable () {
        return this.isSelected(eYo.T3.Expr.Check.or_expr_all)
      },
      ...mapState({
        toolbarBlockVisible: state => state.UI.toolbarBlockVisible,
        selectedBlockId: state => state.UI.selectedBlockId,
        step: state => state.UI.selectedBlockStep,
        selectedBlockType: state => state.UI.selectedBlockType
      })
    },
    watch: {
      toolbarBlockVisible (newValue, oldValue) {
        this.theta = newValue ? 0 : 1
        eYo.$$.TweenLite.to(this, 1, {theta: 1 - this.theta})
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
  #toolbar-block {
    position: relative;
    padding: 0.25rem;
    text-align:center;
    height: 2.25rem;
    font-size: 1rem;
  }
  #toolbar-block .input-group {
    padding: 0;
  }
  .b3k-edit .btn-group,
  .b3k-edit .dropdown-toggle {
    margin:0;
  }
  #toolbar-block label.btn:first-child {
    padding-left:0.25rem;
  }
  #toolbar-block label {
    margin:0;
  }
  #toolbar-block .dropdown-toggle-split {
      padding-right: 0.5rem;
      padding-left: 0.5rem;
  }
  .btn-secondary:hover .eyo-code-reserved {
    color: #fff;
  }
  .b3k-edit .item {
    display: inline-block;
  }
  .btn .eyo-slot-holder .eyo-path-contour {
    stroke-width: 2px;
  }
  .dropdown-item:hover .eyo-slot-holder .eyo-path-contour {
    stroke: rgb(100,100,100);
  }
  .eyo-btn-inert:focus,
  .eyo-btn-inert:hover,
  .eyo-btn-inert:active,
  .eyo-btn-inert:not(:disabled):not(.disabled):active,
  .eyo-btn-inert:not(:disabled):not(.disabled).active {
    color: #212529;
    background-color: white;
    border-color: inherit;
    box-shadow: none;
  }
  #toolbar-block .btn-group:first-child,
  #toolbar-block .btn-group .btn-group {
    padding-left:0;
  }
  #toolbar-block .btn-group:last-child {
    padding-right:0;
  }
  #toolbar-block .btn-group .btn-group {
    margin: 0;
  }
  #toolbar-block .btn-group .btn-group:not(:first-child) {
    padding-left: 0;
  }
  #toolbar-block .btn-group .btn-group:not(:last-child):not(.dropdown) {
    padding-right: 0;
  }
  .b3k-edit-content {
    border-radius: inherit;
  }
  .eyo-slot-holder {
    display: inline-block;
    vertical-align: middle;
    position: relative;
    top: -0.0625rem;
  }
  .b3k-edit,
  .b3k-edit .btn-group {
    border-radius: 0.25rem;
  }
  .b3k-edit-content .eyo-label {
    color: #212529;
    background-color: white;
  }
  .b3k-edit-content .eyo-label {
    border-radius: inherit;
  }
  .b3k-edit-content:not(:first-child),
  .input-group-text:not(:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .b3k-edit .b3k-edit:not(:first-child) {
    margin-left:0.25rem;
  }
  .b3k-edit .b3k-edit:not(:last-child) {
    margin-right:0.25rem;
  }
  .btn:active .eyo-code,
  .btn:active .eyo-code-reserved,
  .btn:hover .eyo-code,
  .btn:hover .eyo-code-reserved,
  .dropdown.show .dropdown-toggle .eyo-code,
  .dropdown.show .dropdown-toggle .eyo-code-reserved {
    color: white !important;
  }

  /* Start here */
  .b3k-edit .item.btn-group {
    background-color: transparent!important;
  }
  #toolbar-block .btn {
    padding: 0rem 0.25rem;
    border-radius: 0.25rem;
  }
  .b3k-edit .item:not(.btn-group),
  .b3k-edit .dropdown>.btn {
    padding: 0rem 0.25rem;
    border: 1px solid #ced4da!important;
    border-radius: 0.25rem!important;
    background: rgba(255, 255, 255, 0.333);
    color: #212529;
  }
  .b3k-edit .deeper .item:not(.btn-group),
  .b3k-edit .deeper .dropdown>.btn {
    border-radius: 0.875rem!important;
  }
  .b3k-edit .item.no-text {
    background: transparent;
  }
  .b3k-cpl .btn-group:not(:first-child) {
    margin-left: 0.25rem!important;
  }
  .b3k-cpl .btn-group:not(:last-child) {
    margin-right: 0.25rem!important;
  }
  .b3k-cpl .btn:not(:first-child),
  .b3k-cpl .dropdown:not(:first-child)>.btn {
    border-top-left-radius: 0!important;
    border-bottom-left-radius: 0!important;
  }
  .b3k-cpl .btn:not(:last-child),
  .b3k-cpl .dropdown:not(:last-child)>.btn {
    border-top-right-radius: 0!important;
    border-bottom-right-radius: 0!important;
    margin-right: -1px!important;
  }
  .b3k-edit *:not(.deeper)>.item:not(.btn-group):not(:first-child),
  .b3k-edit .btn-group:not(:first-child):not(.deeper)>.item:not(.btn-group),
  .b3k-edit .btn-group:not(:first-child)>.btn-group:first-child:not(.deeper)>.item:not(.btn-group),
  .b3k-edit .item:not(:first-child)>.btn,
  .b3k-edit .btn-group:not(:first-child)>.dropdown>.btn,
  .b3k-edit .btn-group:not(:first-child)>.btn-group>.dropdown>.btn,
  .b3k-edit .deeper>.item:not(:first-child),
  .b3k-edit>.dropdown:not(:first-child)>.btn {
    border-top-left-radius: 0!important;
    border-bottom-left-radius: 0!important;
  }
  .b3k-edit .deeper>.item:first-child {
    padding-left:0.5rem;
  }
  .b3k-edit .deeper>.item:last-child {
    padding-right:0.5rem;
  }
  .b3k-edit *:not(.deeper)>.item:not(.btn-group):not(:last-child),
  .b3k-edit .btn-group:not(:last-child):not(.deeper)>.item:not(.btn-group),
  .b3k-edit .btn-group:not(:last-child)>.btn-group:not(.deeper)>.item:not(.btn-group),
  .b3k-edit *:not(.deeper) .dropdown:not(:last-child)>.btn,
  .b3k-edit .btn-group:not(:last-child):not(.deeper)>.dropdown>.btn,
  .b3k-edit .btn-group:not(:last-child)>.btn-group:not(.deeper)>.dropdown>.btn,
  .b3k-edit .deeper>.item:not(:last-child),
  .b3k-edit>.dropdown:not(:last-child)>.btn {
    border-top-right-radius: 0!important;
    border-bottom-right-radius: 0!important;
    margin-right: -1px!important;
  }
  .b3k-edit .dropdown>.btn::after {
    color: #212529;
    opacity: 0.2;
  }
  .b3k-edit .dropdown>.btn:hover::after {
    color: white;
    opacity: 0.8;
  }
  .b3k-edit .dropdown>.btn:hover::after {
    color: rgba(255, 255, 255, 0.666);
  }
  .b3k-edit .btn:hover,
  .b3k-edit .btn:active,
  .bk3-edit .deeper {
    color: white;
    background-color: #6c757d;
    border-color: #6c757d;
  }
  .bk3-edit .deeper {
    border-style: solid;
    border-width: 1px;
  }
  .b3k-edit .item:not(.dropdown):focus,
  .b3k-edit .dropdown>.btn:focus,
  .b3k-edit .dropdown-item:focus {
    box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.5);
    z-index: 1;
  }
  .b3k-edit .item,
  .b3k-edit .btn,
  .b3k-edit .eyo-slot-holder,
  .b3k-edit .dropdown-item {
    height: 1.75rem;
    line-height: 1.75rem;
  }
  .b3k-edit .eyo-with-slot-holder .dropdown-item {
    height: 2.5rem;
    line-height: 2.5rem;
  }
  #toolbar-block .dropdown>.btn {
    padding-right: 1rem;
    vertical-align: baseline;
  }
  #toolbar-block .dropdown:not(:last-child)>.btn {
    padding-right: 0.75rem;
  }

  /* merge: eyo-form-input-text */
  .b3k-edit .item.text:not(.dropdown),
  .b3k-edit .item.text.dropdown>.btn:not(:hover) {
    color: #212529;
    background: white;
  }
  .b3k-edit input.item {
    text-align: left;
    width: 8rem;
  }
  .b3k-edit .item.w-2rem {
    width: 2rem;
  }
  .b3k-edit .mw-4rem>.dropdown-menu {
    width: 4rem;
    min-width: 4rem;
  }
  .b3k-edit .mw-6rem>.dropdown-menu {
    width: 6rem;
    min-width: 6rem;
  }
  .b3k-edit .mw-8rem>.dropdown-menu {
    width: 8rem;
    min-width: 8rem;
  }
  .b3k-edit .item.w-12rem {
    width: 12rem;
  }
  .b3k-edit input.item.w-16rem {
    width: 16rem;
  }
  .b3k-edit .item.placeholder {
    font-style: oblique;
    color: rgb(21, 25, 29, 0.2);
  }
  .b3k-edit .item input[type="checkbox"] {
    vertical-align: baseline;
    position:relative;
    bottom:0.125rem;
  }
</style>
