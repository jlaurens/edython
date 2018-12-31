<template>
  <b-btn-group v-if="locked || toolbarInfoDebug">
    <span>info:&nbsp;<span class="eyo-code small">{{info}}</span></span>
  </b-btn-group>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  export default {
    name: 'info-common',
    props: {
      locked: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      ...mapState('Selected', [
        'id'
      ]),
      ...mapGetters('Selected', [
        'type'
      ]),
      toolbarInfoDebug () {
        return this.$store.state.UI.toolbarInfoDebug
      },
      info () {
        var type = this.type
        var id = this.id
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
