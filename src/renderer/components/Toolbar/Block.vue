<template>
  <b-button-toolbar id="block-toolbar" key-nav  aria-label="Block toolbar" justify :style="style">
    <block-primary v-if="isSelected($$.eYo.DelegateSvg.Expr.primary.eyo.getModel().xml.types)" :eyo="eyo" :slotholder="slotholder" :modifiable="modifiable"></block-primary>
    <block-primary v-else-if="isSelected([$$.eYo.T3.Stmt.call_stmt])" :eyo="eyo" :slotholder="slotholder"></block-primary>
    <block-literal v-else-if="isSelected([$$.eYo.T3.Expr.shortliteral, $$.eYo.T3.Expr.longliteral, $$.eYo.T3.Expr.shortbytesliteral, $$.eYo.T3.Expr.longbytesliteral, $$.eYo.T3.Expr.shortstringliteral, $$.eYo.T3.Expr.longstringliteral, $$.eYo.T3.Stmt.docstring_stmt])" :eyo="eyo" :modifiable="modifiable"></block-literal>
    <block-number v-else-if="isSelected([$$.eYo.T3.Expr.integer,
    $$.eYo.T3.Expr.floatnumber,
    $$.eYo.T3.Expr.imagnumber])" :eyo="eyo" :modifiable="modifiable"></block-number>
    <block-print v-else-if="isSelected([$$.eYo.T3.Expr.builtin__print_expr, $$.eYo.T3.Stmt.builtin__print_stmt])" :eyo="eyo" :modifiable="modifiable"></block-print>
    <block-unary v-else-if="isSelected($$.eYo.T3.Expr.u_expr)" :eyo="eyo" :slotholder="slotholder" :modifiable="modifiable"></block-unary>
    <block-binary v-else-if="isSelected([
      $$.eYo.T3.Expr.binary,
      $$.eYo.T3.Expr.a_expr,
      $$.eYo.T3.Expr.m_expr, $$.eYo.T3.Expr.shift_expr, $$.eYo.T3.Expr.and_expr, $$.eYo.T3.Expr.xor_expr,
      $$.eYo.T3.Expr.or_expr,
      $$.eYo.T3.Expr.power
    ])" :eyo="eyo" :slotholder="slotholder" :modifiable="modifiable"></block-binary>
    <block-assignment v-else-if="isSelected($$.eYo.T3.Stmt.assignment_stmt)" :eyo="eyo" :slotholder="slotholder"></block-assignment>
    <block-builtin v-else-if="isSelected($$.eYo.T3.Expr.builtin__object)" :eyo="eyo" :modifiable="modifiable"></block-builtin>
    <block-augmented-assignment v-else-if="isSelected($$.eYo.T3.Stmt.augmented_assignment_stmt)" :eyo="eyo" :slotholder="slotholder"></block-augmented-assignment>
    <block-any-expression v-else-if="isSelected($$.eYo.T3.Expr.any)" :eyo="eyo" :slotholder="slotholder" :modifiable="modifiable"></block-any-expression>
    <block-expression-statement v-else-if="isSelected($$.eYo.T3.Stmt.expression_stmt)" :eyo="eyo" :slotholder="slotholder"></block-expression-statement>
    <block-decorator v-else-if="isSelected($$.eYo.T3.Stmt.decorator_stmt)" :eyo="eyo" :slotholder="slotholder"></block-decorator>
    <block-starred v-else-if="isSelected([
      $$.eYo.T3.Expr.star_expr,
      $$.eYo.T3.Expr.expression_star,
      $$.eYo.T3.Expr.expression_star_star,
      $$.eYo.T3.Expr.target_star,
      $$.eYo.T3.Expr.star,
      $$.eYo.T3.Expr.parameter_star,
      $$.eYo.T3.Expr.parameter_star_star
    ])" :eyo="eyo" :slotholder="slotholder"></block-starred>
    <block-except v-else-if="isSelected([
      $$.eYo.T3.Stmt.except_part,
      $$.eYo.T3.Stmt.void_except_part
    ])" :eyo="eyo" :slotholder="slotholder"></block-except>
    <block-default :eyo="eyo" :slotholder="slotholder" :modifiable="modifiable" v-else-if="eyo"></block-default>
    <block-none v-else></block-none>
    <b-btn-group>
      <block-copy-paste />
      <block-layout />    
    </b-btn-group>
    <block-common :eyo="eyo" />
  </b-button-toolbar>
</template>

<script>
  import BlockCommon from './Block/Common.vue'
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

  export default {
    name: 'toolbar-block',
    data: function () {
      return {
        step: 0
      }
    },
    components: {
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
      BlockExcept
    },
    mounted () {
      this.step = this.$store.state.UI.toolbarEditVisible ? 1 : 0
    },
    computed: {
      slotholder () {
        var d = eYo.Shape.definitionWithConnection()
        var one_rem = parseInt(getComputedStyle(document.documentElement).fontSize)
        return function (className) {
          return '<div class="eyo-block-slotholder' + (className ? ' ' : '') + className + '"><svg xmlns="http://www.w3.org/2000/svg" height="' + (1.75 * one_rem) + '" width="' + (2 * one_rem) + '"><path class="eyo-path-contour" d="' + d + ' z"></path></svg></div>'
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
      selectedBlockType () {
        var type = this.$store.state.UI.selectedBlockType
        return type ? type.substring(4) : null
      },
      toolbarEditVisible () {
        return this.$store.state.UI.toolbarEditVisible
      },
      style () {
        return `right: ${100 * (1 - this.step)}%;`
      },
      modifiable () {
        return this.isSelected(eYo.T3.Expr.Check.or_expr_all)
      }
    },
    watch: {
      toolbarEditVisible (newValue, oldValue) {
        this.step = newValue ? 0 : 1
        this.$$.TweenLite.to(this, 1, {step: 1 - this.step})
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
#block-toolbar {
  position: relative;
  padding: 0.25rem;
  text-align:center;
  height: 2.25rem;
  font-size: 0.9rem;
}
#block-toolbar .btn {
  height: 1.75rem;
  padding: 0rem 0.5rem;
  vertical-align:middle;
}
#block-toolbar .btn-group {
  padding: 0;
  margin:0;
}
#block-toolbar .btn-group .btn-group {
  margin: 0;
}
.btn-outline-secondary {
  background-color: rgba(255,255,255,90);
}
.dropdown-toggle-split {
    padding-right: 0.5rem;
    padding-left: 0.5rem;
}
.btn-secondary:hover .eyo-code-reserved {
  color: #fff;
}
.eyo-block-slotholder {
  display: inline-block;
  height: 1.75rem;
}
.btn .eyo-block-slotholder .eyo-path-contour {
  stroke-width: 2px;
}
.dropdown-item:hover .eyo-block-slotholder .eyo-path-contour {
  stroke: rgb(100,100,100);
}
.eyo-block-primary-variant1 {
  display: inline-block;
}
.eyo-block-primary-variant2 {
  display: inline-block;
  position: relative;
  top: -0.45rem;
}
.eyo-block-primary-variant3 {
  display: inline-block;
  position: relative;
  top: 0.45rem;
}
.eyo-form-input-text {
  text-align: left;
  width: 8rem;
}
.btn-outline-secondary.eyo-form-input-text:hover {
  background: white;
  color: black;
}
.eyo-button-group {
  padding-right: 0.25rem;
}
.eyo-block-primary-variant1, .eyo-block-primary-variant2 {
  display: inline;
}
</style>
