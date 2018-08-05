<template>
  <b-button-group v-if="locked || toolbarInfoDebug" class="mx-1">
    <span>info:&nbsp;<span class="eyo-code small">{{info}}</span></span>
  </b-button-group>
</template>

<script>
  export default {
    name: 'info-common',
    props: {
      selectedBlock: {
        type: Object,
        default: undefined
      },
      locked: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      toolbarInfoDebug () {
        return this.$store.state.UI.toolbarInfoDebug
      },
      info () {
        var type = this.selectedBlock.type
        var id = this.selectedBlock.id
        return type ? [type.substring(4), id].join('/') : '…'
      }
    }
  }
</script>
<style scoped>
.small {
  font-size: 0.9rem;
}
</style>