<template>
  <div id="toolbar-info" :style="style">
    <div v-if="this.isSelected(this.$$.eYo.T3.Expr.primary)">
      <info-primary :selected-block="selectedBlock"></info-primary>
    </div>
    <div v-if="this.isSelected([this.$$.eYo.T3.Expr.shortliteral, this.$$.eYo.T3.Expr.longliteral, this.$$.eYo.T3.Expr.shortbytesliteral, this.$$.eYo.T3.Expr.longbytesliteral, this.$$.eYo.T3.Expr.shortstringliteral, this.$$.eYo.T3.Expr.longstringliteral, this.$$.eYo.T3.Stmt.docstring_stmt])">
      <info-literal :selected-block="selectedBlock"></info-literal>
    </div>
    <div v-else-if="this.isSelected([this.$$.eYo.T3.Expr.builtin__print_expr, this.$$.eYo.T3.Stmt.builtin__print_stmt])">
      <info-print :selected-block="selectedBlock"></info-print>
    </div>
    <div v-else-if="this.isSelected(this.$$.eYo.T3.Stmt.augmented_assignment_stmt)">
        <info-augmented-assignment :selected-block="selectedBlock"></info-augmented-assignment>
    </div>
    <div v-else-if="selectedBlock">
      <info-default :selected-block="selectedBlock"></info-default>
    </div>
    <div v-else>
      <info-none></info-none>
    </div>
  </div>
</template>

<script>
  import InfoPrimary from './Info/Primary.vue'
  import InfoLiteral from './Info/Literal.vue'
  import InfoPrint from './Info/Print.vue'
  import InfoAssignment from './Info/Assignment.vue'
  import InfoAugmentedAssignment from './Info/AugmentedAssignment.vue'
  import InfoDefault from './Info/Default.vue'
  import InfoNone from './Info/None.vue'

  export default {
    name: 'toolbar-info',
    data: function () {
      return {
        step: 0
      }
    },
    components: {
      InfoPrimary,
      InfoLiteral,
      InfoPrint,
      InfoAssignment,
      InfoAugmentedAssignment,
      InfoDefault,
      InfoNone
    },
    mounted () {
      this.step = this.$store.state.UI.toolbarInfoVisible ? 1 : 0
    },
    computed: {
      selectedBlock () {
        var id = this.$store.state.UI.selectedBlockId
        var block = id && this.$$.eYo.App.workspace.blockDB_[id]
        return block
      },
      selectedBlockType () {
        var type = this.$store.state.UI.selectedBlockType
        return type ? type.substring(4) : null
      },
      toolbarInfoVisible () {
        return this.$store.state.UI.toolbarInfoVisible
      },
      style () {
        return ['width: ', 100 * this.step, '%;'].join('')
      }
    },
    watch: {
      toolbarInfoVisible (newValue, oldValue) {
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
#toolbar-info {
  padding: 0.25rem;
  text-align:center;
  height: 2.25rem;
  font-size: 0.9rem;
}
#toolbar-info .btn {
  padding: 0rem 0.5rem;
  height: 1.75rem;
  vertical-align:middle;
}
</style>
