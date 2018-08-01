<template>
  <div id="toolbar-info" :style="style">
    <div v-if="this.isSelected(this.$$.eYo.T3.Expr.primary)">
      <info-primary></info-primary>
    </div>
    <div v-if="this.isSelected(this.$$.eYo.T3.Expr.shortliteral) || this.isSelected(this.$$.eYo.T3.Expr.longliteral)">
      <info-shortliteral></info-shortliteral>
    </div>
    <div v-else-if="this.isSelected(this.$$.eYo.T3.Expr.builtin__print_expr) || this.isSelected(this.$$.eYo.T3.Stmt.builtin__print_stmt)">
      <info-print></info-print>
    </div>
    <div v-else-if="selectedBlockType">
      <info-default></info-default>
    </div>
    <div v-else>
      <info-none></info-none>
    </div>
  </div>
</template>

<script>
  import InfoPrimary from './Info/Primary.vue'
  import InfoShortliteral from './Info/Shortliteral.vue'
  import InfoPrint from './Info/Print.vue'
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
      InfoShortliteral,
      InfoPrint,
      InfoDefault,
      InfoNone
    },
    computed: {
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
        return type === this.$store.state.UI.selectedBlockType
      }
    }
  }
</script>
<style>
#toolbar-info {
  padding: 0.25rem;
  text-align:center;
  height: 2.25rem;
}
#toolbar-info .btn {
  padding: 0rem 0.5rem;
  height: 1.75rem;
  vertical-align:middle;
}
</style>
