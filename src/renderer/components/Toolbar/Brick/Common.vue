<template>
  <b-btn-group>
    <common-start
      v-if="isSelected($$.eYo.T3.Stmt.start_stmt)">
    </common-start>
    <b-btn-group
      v-else-if="locked || toolbarInfoDebug"
    ><span>info:&nbsp;<span class="eyo-code small">{{info}}</span></span>
    </b-btn-group>
  </b-btn-group>
</template>

<script>
  import {mapState, mapGetters} from 'vuex'

  import CommonStart from './Common/Start'

  export default {
    name: 'info-common',
    props: {
      locked: {
        type: Boolean,
        default: false
      }
    },
    components: {
      CommonStart
    },
    computed: {
      ...mapState('Selected', [
        'id'
      ]),
      ...mapGetters('Selected', [
        'type'
      ]),
      ...mapState('UI', [
        'toolbarInfoDebug'
      ]),
      info () {
        var type = this.type
        var id = this.id
        return type ? [type.substring(4), id].join('/') : '…'
      }
    },
    methods: {
      isSelected (type) {
        return (type.some && type.some(t => t === this.type)) || type === this.type
      }
    }
  }
</script>
<style scoped>
.small {
  font-size: 0.9rem;
}
</style>
