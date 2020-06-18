<template>
  <b-btn
    id="toolbar-btn-copy-python"
    v-tippy
    :title="title"
    :disabled="!canDoIt"
    @click="doIt()"
  >
    <icon-base
      :width="32"
      :height="32"
      :icon-name="name"
    >
      <icon-copy-python :footstep="footstep" />
    </icon-base>
  </b-btn>
</template>

<script>
import {mapGetters} from 'vuex'

import IconBase from '@@/Icon/IconBase.vue'
import IconCopyPython from '@@/Icon/IconCopyPython.vue'

export default {
    name: 'CopyPython',
    components: {
        IconBase,
        IconCopyPython
    },
    props: {
        deep: {
            type: Boolean,
            default: false
        },
        copy: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            footstep: 1
        }
    },
    computed: {
        ...mapGetters('Selected', [
            'eyo'
        ]),
        name () {
            return this.$$t('toolbar.name.copy_python')
        },
        title () {
            return this.$$t('toolbar.tooltip.copy_python')
        },
        canDoIt () {
            return !!this.eyo
        }
    },
    methods: {
        doIt () {
            var brick = this.eyo && this.eyo.brick_
            if (brick) {
                var p = new eYo.Py.Exporter()
                var code = p.export(brick, {is_deep: true})
                eYo.App.copyTextToClipboard(code)
                this.footstep = 0
                eYo.$$.TweenLite.to(this, 0.5, {footstep: 1})
            }
        }
    }
}
</script>
