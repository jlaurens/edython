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
  <b-btn-toolbar
    id="toolbar-block"
    ref="toolbar"
    key-nav
    aria-label="Block toolbar"
    justify
    :style="style">
    <b-btn-group class="b3k-edit">
      <block-primary
        v-if="isSelected($$.eYo.DelegateSvg.Expr.primary.eyo.getModel().xml.types) || isSelected([$$.eYo.T3.Stmt.call_stmt])"
        :slotholder="slotholder"
      />
      <block-literal
        v-else-if="isSelected([
          $$.eYo.T3.Expr.shortliteral,
          $$.eYo.T3.Expr.longliteral,
          $$.eYo.T3.Expr.shortbytesliteral,
          $$.eYo.T3.Expr.longbytesliteral,
          $$.eYo.T3.Expr.shortstringliteral, $$.eYo.T3.Expr.longstringliteral,
          $$.eYo.T3.Stmt.docstring_stmt
        ])"
        :modifiable="modifiable"
      />
      <block-number
        v-else-if="isSelected([
          $$.eYo.T3.Expr.integer,
          $$.eYo.T3.Expr.floatnumber,
          $$.eYo.T3.Expr.imagnumber
        ])"
        :modifiable="modifiable"
      />
      <block-unary
        v-else-if="isSelected($$.eYo.T3.Expr.u_expr)"
        :slotholder="slotholder"
        :modifiable="modifiable"
      />
      <block-binary
        v-else-if="isSelected([
          $$.eYo.T3.Expr.binary,
          $$.eYo.T3.Expr.a_expr,
          $$.eYo.T3.Expr.m_expr,
          $$.eYo.T3.Expr.shift_expr,
          $$.eYo.T3.Expr.and_expr,
          $$.eYo.T3.Expr.xor_expr,
          $$.eYo.T3.Expr.or_expr,
          $$.eYo.T3.Expr.power
        ])"
        :slotholder="slotholder"
        :modifiable="modifiable"
      />
      <block-comparison
        v-else-if="isSelected([
          $$.eYo.T3.Expr.comparison,
          $$.eYo.T3.Expr.number_comparison,
          $$.eYo.T3.Expr.object_comparison
        ])"
        :slotholder="slotholder"
        :modifiable="modifiable"
      />
      <block-test
        v-else-if="isSelected([
          $$.eYo.T3.Expr.or_test,
          $$.eYo.T3.Expr.and_test
        ])"
        :slotholder="slotholder"
        :modifiable="modifiable"
      />
      <block-assignment
        v-else-if="isSelected($$.eYo.T3.Stmt.assignment_stmt)"
        :slotholder="slotholder"
      />
      <block-builtin
        v-else-if="isSelected($$.eYo.T3.Expr.builtin__object)"
        :modifiable="modifiable"
      />
      <block-augmented-assignment
        v-else-if="isSelected($$.eYo.T3.Stmt.augmented_assignment_stmt)"
        :slotholder="slotholder"
      />
      <block-expression-statement
        v-else-if="isSelected($$.eYo.T3.Stmt.expression_stmt)"
        :slotholder="slotholder"
      />
      <block-decorator
        v-else-if="isSelected($$.eYo.T3.Stmt.decorator_stmt)"
        :slotholder="slotholder"
      />
      <block-starred
        v-else-if="isSelected([
          $$.eYo.T3.Expr.star_expr,
          $$.eYo.T3.Expr.expression_star,
          $$.eYo.T3.Expr.expression_star_star,
          $$.eYo.T3.Expr.target_star,
          $$.eYo.T3.Expr.star,
          $$.eYo.T3.Expr.parameter_star,
          $$.eYo.T3.Expr.parameter_star_star
        ])"
        :slotholder="slotholder"
      />
      <block-except
        v-else-if="isSelected([
          $$.eYo.T3.Stmt.except_part,
          $$.eYo.T3.Stmt.void_except_part
        ])"
        :slotholder="slotholder"
      />
      <block-funcdef
        v-else-if="isSelected($$.eYo.T3.Stmt.funcdef_part)"
        :slotholder="slotholder"
      />
      <block-classdef
        v-else-if="isSelected($$.eYo.T3.Stmt.classdef_part)"
        :slotholder="slotholder"
      />
      <block-import
        v-else-if="isSelected($$.eYo.T3.Stmt.import_stmt)"
        :slotholder="slotholder"
      />
      <block-pcb-gnd-r
        v-else-if="isSelected([
          $$.eYo.T3.Stmt.pass_stmt,
          $$.eYo.T3.Stmt.continue_stmt,
          $$.eYo.T3.Stmt.break_stmt,
          $$.eYo.T3.Stmt.global_stmt,
          $$.eYo.T3.Stmt.nonlocal_stmt,
          $$.eYo.T3.Stmt.del_stmt,$$.eYo.T3.Stmt.return_stmt
        ])"
        :slotholder="slotholder"
      />
      <block-proper-slice
        v-else-if="isSelected($$.eYo.T3.Expr.proper_slice)"
        :slotholder="slotholder"
      />
      <block-range
        v-else-if="isSelected([
          $$.eYo.T3.Expr.builtin__range_expr,
          $$.eYo.T3.Expr.random__randrange
        ])"
        :slotholder="slotholder"
      />
      <block-any-expression
        v-else-if="isSelected($$.eYo.T3.Expr.any)"
        :slotholder="slotholder"
      />
      <block-assert
        v-else-if="isSelected($$.eYo.T3.Stmt.assert_stmt)"
        :slotholder="slotholder"
      />
      <block-raise
        v-else-if="isSelected($$.eYo.T3.Stmt.raise_stmt)"
        :slotholder="slotholder"
      />
      <block-yield
        v-else-if="isSelected([
          $$.eYo.T3.Expr.yield_expression,
          $$.eYo.T3.Stmt.yield_stmt
        ])"
        :slotholder="slotholder"
      />
      <block-branch
        v-else-if="isSelected([
          $$.eYo.T3.Stmt.if_part,
          $$.eYo.T3.Stmt.elif_part,
          $$.eYo.T3.Stmt.else_part,
          $$.eYo.T3.Stmt.last_else_part,
          $$.eYo.T3.Stmt.try_else_part,
          $$.eYo.T3.Stmt.while_part
        ])"
        :slotholder="slotholder" />
      <block-default
        v-else-if="eyo"
        :slotholder="slotholder"
        :modifiable="modifiable"></block-default>
      <span v-else class="info">{{this.$$t('block.no_selection')}}</span>
      <block-comment />
    </b-btn-group>
    <block-common />
  </b-btn-toolbar>
</template>

<script>
  import {mapState, mapMutations, mapGetters} from 'vuex'

  import BlockCommon from './Block/Common.vue'
  import BlockComment from './Block/Comment.vue'
  import BlockBuiltin from './Block/Builtin.vue'
  import BlockModifier from './Block/Modifier.vue'
  import BlockPrimary from './Block/Primary.vue'
  import BlockLiteral from './Block/Literal.vue'
  import BlockNumber from './Block/Number.vue'
  import BlockUnary from './Block/Unary.vue'
  import BlockBinary from './Block/Binary.vue'
  import BlockComparison from './Block/Comparison.vue'
  import BlockTest from './Block/Test.vue'
  import BlockAnyExpression from './Block/AnyExpression.vue'
  import BlockExpressionStatement from './Block/ExpressionStatement.vue'
  import BlockAssignment from './Block/Assignment.vue'
  import BlockAugmentedAssignment from './Block/AugmentedAssignment.vue'
  import BlockValue from './Block/Value.vue'
  import BlockVariant from './Block/Variant.vue'
  import BlockDefault from './Block/Default.vue'
  import BlockDecorator from './Block/Decorator.vue'
  import BlockStarred from './Block/Starred.vue'
  import BlockExcept from './Block/Except.vue'
  import BlockFuncdef from './Block/Funcdef.vue'
  import BlockClassdef from './Block/Classdef.vue'
  import BlockImport from './Block/Import.vue'
  import BlockProperSlice from './Block/ProperSlice.vue'
  import BlockPcbGndR from './Block/PcbGndR.vue'
  import BlockAssert from './Block/Assert.vue'
  import BlockRaise from './Block/Raise.vue'
  import BlockYield from './Block/Yield.vue'
  import BlockRange from './Block/Range.vue'
  import BlockBranch from './Block/Branch.vue'

  var ResizeSensor = require('css-element-queries/src/ResizeSensor')

  export default {
    name: 'toolbar-block',
    data: function () {
      return {
        saved_step: 0,
        theta: 0,
        resizeSensor: undefined
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
      BlockUnary,
      BlockBinary,
      BlockComparison,
      BlockTest,
      BlockAnyExpression,
      BlockExpressionStatement,
      BlockAssignment,
      BlockAugmentedAssignment,
      BlockValue,
      BlockVariant,
      BlockDefault,
      BlockDecorator,
      BlockStarred,
      BlockExcept,
      BlockFuncdef,
      BlockClassdef,
      BlockImport,
      BlockProperSlice,
      BlockPcbGndR,
      BlockAssert,
      BlockRaise,
      BlockYield,
      BlockRange,
      BlockBranch
    },
    computed: {
      ...mapState('UI', [
        'toolbarBlockVisible'
      ]),
      ...mapState('Selected', [
        'step'
      ]),
      ...mapGetters('Selected', [
        'eyo',
        'type'
      ]),
      slotholder () {
        var d = eYo.Shape.definitionWithConnection()
        var one_rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
        return function (className) {
          return `<div class="eyo-slotholder${className ? ' ' + className : ''}"><svg xmlns="http://www.w3.org/2000/svg" height="${Math.trunc(1.75 * one_rem)}" width="${Math.trunc(2 * one_rem)}"><path class="eyo-path-contour" d="${d} z"></path></svg></div>`
        }
      },
      style () {
        return `right: ${100 * (1 - this.theta)}%;`
      },
      modifiable () {
        return this.isSelected(eYo.T3.Expr.Check.or_expr_all)
      }
    },
    mounted () {
      this.theta = this.toolbarBlockVisible ? 1 : 0
      if (!this.resizeSensor) {
        this.resizeSensor = new ResizeSensor(this.$refs.toolbar.$el, this.$$didResize)
      }
      this.$$didResize()
    },
    watch: {
      toolbarBlockVisible (newValue, oldValue) {
        this.theta = newValue ? 0 : 1
        eYo.$$.TweenLite.to(this, 1, {theta: 1 - this.theta})
      }
    },
    methods: {
      ...mapMutations('Page', [
        'setToolbarBlockHeight'
      ]),
      $$didResize () {
        var top = this.$$top()
        var bottom = this.$$bottom()
        if (bottom - top < Infinity) {
          this.setToolbarBlockHeight(bottom - top)
        }
      },
      isSelected (type) {
        if (goog.isArray(type)) {
          return type.some(t => t === this.type)
        } else {
          return type === this.type
        }
      }
    }
  }
</script>
<style>
  #toolbar-block {
    position: relative;
    padding: 0;
    text-align:center;
    height: 2.25rem;
    font-size: 1rem;
    display: flex;
    max-width: calc(100%);
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
  .btn .eyo-slotholder .eyo-path-contour {
    stroke-width: 2px;
  }
  .dropdown-item:hover .eyo-slotholder .eyo-path-contour {
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
  #toolbar-block .btn-group .btn-group {
    padding-left:0;
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
  .eyo-slotholder {
    display: inline-block;
    vertical-align: middle;
    position: relative;
    top: -0.0625rem;
  }
  .eyo-slotholder-inline {
    top: -0.17rem;
  }
  .b3k-edit.btn-group {
    display: flex;
    flex-wrap: wrap;
    padding: 0.25rem;
    padding-bottom: 0;
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
  .b3k-edit .bl-:not(:first-child)>.btn {
    border-left-width: 0px;
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
    min-width:1.25rem;
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
  .b3k-edit .eyo-slotholder,
  .b3k-edit .dropdown-item {
    height: 1.75rem;
    line-height: 1.75rem;
  }
  .b3k-edit .eyo-with-slotholder .dropdown-item {
    height: 2.5rem;
    line-height: 2.5rem;
    padding: 0.25rem;
  }
  #toolbar-block .dropdown>.btn {
    padding-right: 1rem;
    vertical-align: baseline;
  }
  #toolbar-block .dropdown:not(:last-child)>.btn {
    padding-right: 0.75rem;
  }

  .b3k-edit .item.text:not(.dropdown),
  .b3k-edit .item.text.dropdown>.btn:not(:hover) {
    color: #212529;
    background: white;
  }
  .b3k-edit .item.text.invalid,
  .eyo-code-reserved.invalid {
    color: crimson !important;
  }
  .b3k-edit .disabled>.item.text,
  .b3k-edit .disabled.item.text {
    color: inherit;
    background: inherit;
  }
  .b3k-edit input.item {
    text-align: left;
    width: 8rem;
  }
  .b3k-edit .item.w-1rem {
    width: calc(0.75 * 1rem); /**/
    min-width: calc(0.75 * 1rem);
  }
  .b3k-edit .item.w-2rem {
    width: calc(0.75 * 2rem); /**/
    min-width: calc(0.75 * 2rem);
  }
  .b3k-edit .item.w-4rem {
    width: calc(0.75 * 4rem); /**/
    min-width: calc(0.75 * 4rem);
  }
  .b3k-edit .mw-4rem>.dropdown-menu {
    width: calc(0.75 * 4rem); /**/
    min-width: calc(0.75 * 4rem);
  }
  .b3k-edit .mw-6rem>.dropdown-menu {
    width: calc(0.75 * 6rem); /**/
    min-width: calc(0.75 * 6rem);
  }
  .b3k-edit .mw-8rem>.dropdown-menu {
    width: calc(0.75 * 8rem); /**/
    min-width: calc(0.75 * 8rem);
  }
  .b3k-edit .mw-10rem>.dropdown-menu {
    width: calc(0.75 * 10rem); /**/
    min-width: calc(0.75 * 10rem);
  }
  .b3k-edit .item.w-10rem {
    width: calc(0.75 * 10rem);
  }
  .b3k-edit .item.w-12rem {
    width: calc(0.75 * 12rem);
  }
  .b3k-edit input.item.w-16rem {
    width: calc(0.75 * 16rem);
  }
  .b3k-edit input.item.w-20rem {
    width: calc(0.75 * 20rem);
  }
  .b3k-edit input.item.w-30rem {
    width: calc(0.75 * 30rem);
  }
  .b3k-edit input.item.w-24rem {
    width: calc(0.75 * 24rem);
  }
  .b3k-edit .item.placeholder {
    font-style: oblique;
    color: rgb(21, 25, 29, 0.7);
  }
  .b3k-edit .item input[type="checkbox"] {
    vertical-align: baseline;
    position:relative;
    bottom:0.125rem;
  }
  /* bad taste */
  .b3k-edit .eyo-code-reserved .btn {
    font-family: DejaVuSansMono, monospace !important;
    font-weight: bold;
  }
  .b3k-edit .eyo-code-reserved .btn:not(:hover) {
    color: rgba(0, 84, 147, 0.75) !important;
  }
  .b3k-edit .info {
    color:rgba(26, 29, 21, 0.5);
    font-style: italic;
  }
  .b3k-edit dropdown-item {
    padding: 0 0.25rem;
  }
</style>
