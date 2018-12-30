<template>
  <b-btn-group v-if="locked || toolbarInfoDebug">
    <span>info:&nbsp;<span class="eyo-code small">{{info}}</span></span>
  </b-btn-group>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    name: 'info-common',
    props: {
      locked: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      ...mapGetters('Selected', [
        'eyo',
        'step'
      ]),
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
