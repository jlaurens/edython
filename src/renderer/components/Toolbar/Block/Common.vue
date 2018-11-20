<template>
  <b-button-group v-if="locked || toolbarInfoDebug">
    <span>info:&nbsp;<span class="eyo-code small">{{info}}</span></span>
  </b-button-group>
</template>

<script>
  export default {
    name: 'info-common',
    props: {
      eyo: {
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
        var type = this.eyo.type
        var id = this.eyo.block_.id
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