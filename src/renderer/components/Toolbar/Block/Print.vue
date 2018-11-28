<template>
  <b-btn-group id="block-print" class="b3k-edit-content btn-outline-secondary" aria-label="Block print edit content" justify>
    <div class="item">
      <input type="checkbox" v-model="sep">
    </div>
    <div class="eyo-label eyo-code item text">sep=…</div>
    <div class="item">
      <input type="checkbox" v-model="end">
    </div>
    <div class="eyo-label eyo-code item text">end=…</div>
    <div class="item">
      <input type="checkbox" v-model="flush">
    </div>
    <div class="eyo-label eyo-code item text">flush=…</div>
    <div class="item">
      <input type="checkbox" v-model="file" :disabled="!can_file">
    </div>
    <div class="eyo-label eyo-code item text">file=…</div>
    <keyword :eyo="eyo" :step="step"></keyword>
  </b-btn-group>
</template>

<script>
  import Keyword from './Primary/Keyword'

  export default {
    name: 'info-print',
    components: {
      Keyword
    },
    data () {
      return {
        saved_step: undefined,
        target_by_name_: undefined
      }
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      },
      step: {
        type: Number,
        default: 0
      }
    },
    computed: {
      list () {
        return this.eyo.n_ary_s.connection.targetBlock()
      },
      target_by_name () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.target_by_name_
      },
      data () {
        return this.eyo.data
      },
      sep: {
        get () {
          return !!this.target_by_name['sep']
        },
        set (newValue) {
          this.do('sep')
        }
      },
      end: {
        get () {
          return !!this.target_by_name['end']
        },
        set (newValue) {
          this.do('end')
        }
      },
      file: {
        get () {
          return !!this.target_by_name['file']
        },
        set (newValue) {
          this.do('file')
        }
      },
      flush: {
        get () {
          return !!this.target_by_name['flush']
        },
        set (newValue) {
          this.do('flush')
        }
      },
      can_file () {
        return false
      },
      content_sep () {
        return 'sep=…'
      },
      title_sep () {
        return this.$$t('block.tooltip.keyword.sep')
      },
      content_file () {
        return 'file=…'
      },
      title_file () {
        return 'Fichier de sortie'
      },
      content_end () {
        return 'end=…'
      },
      title_end () {
        return 'Séparateur de fin de ligne (End of line)'
      },
      content_flush () {
        return 'flush=…'
      },
      title_flush () {
        return 'Affichage immédiat (y compris ce qui est en attente)'
      }
    },
    created () {
      this.$$synchronize()
    },
    beforeUpdate () {
      (this.saved_step === this.step) || this.$$synchronize()
    },
    methods: {
      $$synchronize () {
        if (!this.eyo || (this.saved_step === this.step)) {
          return
        }
        this.saved_step = this.step
        var target_by_name = {}
        var block = this.eyo.block_
        if (block) {
          var list = this.list
          var c10r = list.eyo.consolidator
          if (!c10r.hasInputForType(list, eYo.T3.Expr.comprehension)) {
            var io = c10r.getIO(list)
            var input
            while ((input = c10r.nextInputForType(io, [
              eYo.T3.Expr.identifier_defined,
              eYo.T3.Expr.keyword_item
            ]))) {
              var target = input.connection.targetBlock()
              if (target) {
                if (target.eyo.name_d) {
                  target_by_name[target.eyo.name_p] = target
                } else {
                  console.log(target)
                }
              }
            }
          }
        }
        this.target_by_name_ = target_by_name
      },
      do (key) {
        eYo.Events.groupWrap(
          () => {
            var B = this.target_by_name[key]
            if (B) {
              B.unplug()
              B.dispose()
              return
            }
            this.eyo.changeWrap(
              () => {
                var B = eYo.DelegateSvg.newBlockReady(this.eyo.workspace, {
                  type: eYo.T3.Expr.keyword_item,
                  data: key
                })
                var list = this.list
                var c8n = list.inputList[list.inputList.length - 1].connection
                c8n.connect(B.outputConnection)
              }
            )
          }
        )
      },
      do_sep () {
        this.do('sep')
      },
      do_file () {
        this.do('file')
      },
      do_end () {
        this.do('end')
      },
      do_flush () {
        this.do('flush')
      }
    }
  }
</script>
<style>
</style>
