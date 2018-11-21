<template>
  <b-button-group id="block-print" key-nav  aria-label="Block toolbar print" justify>
    <b-button-group id='info-print-keyword' class="mr-2">
    <div class="input-group btn-outline-secondary eyo-btn-inert">
      <div class="input-group-prepend">
        <div class="input-group-text">
          <input type="checkbox" v-model="sep">
        </div>
        <input type="text" readOnly class="eyo-code" value="sep=…"  style="width: 4rem;">
      </div>
      <div class="input-group-prepend">
        <div class="input-group-text">
          <input type="checkbox" v-model="end">
        </div>
      </div>
      <input type="text" readOnly class="eyo-code" value="end=…"  style="width: 4rem;">
      <div class="input-group-prepend">
        <div class="input-group-text">
          <input type="checkbox" v-model="flush">
        </div>
      </div>
      <input type="text" readOnly class="eyo-code" value="flush=…"  style="width: 6rem;">
      <div class="input-group-prepend">
        <div class="input-group-text">
          <input type="checkbox" v-model="file" :disabled="!can_file">
        </div>
      </div>
      <input type="text" readOnly class="eyo-code" value="file=…"  style="width: 5rem;" :disabled="!can_file">
    </div>
    </b-button-group>
    <comment :eyo="eyo"></comment>
  </b-button-group>
</template>

<script>
  import Comment from './Comment.vue'

  export default {
    name: 'info-print',
    data () {
      return {
        step_: undefined,
        has_: undefined
      }
    },
    components: {
      Comment
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      list () {
        return this.eyo.block_.getInput(eYo.Key.N_ARY).connection.targetBlock()
      },
      has () {
        (this.step_ !== this.eyo.change.step) && this.synchronize()
        return this.has_
      },
      data () {
        return this.eyo.data
      },
      sep: {
        get () {
          return !!this.has['sep']
        },
        set (newValue) {
          this.do('sep')
        }
      },
      end: {
        get () {
          return !!this.has['end']
        },
        set (newValue) {
          this.do('end')
        }
      },
      file: {
        get () {
          return !!this.has['file']
        },
        set (newValue) {
          this.do('file')
        }
      },
      flush: {
        get () {
          return !!this.has['flush']
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
        return 'Séparateur de champs'
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
      this.synchronize()
    },
    updated () {
      this.synchronize()
    },
    methods: {
      synchronize () {
        if (this.step_ !== this.eyo.change.step) {
          this.step_ = this.eyo.change.step
          var has = {}
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
                  if (target.eyo.data.name) {
                    has[target.eyo.data.name.get()] = target
                  } else {
                    console.log(target)
                  }
                }
              }
            }
          }
          this.has_ = has
        }
      },
      do (key) {
        eYo.Events.groupWrap(
          () => {
            var B = this.has[key]
            if (B) {
              B.unplug()
              B.dispose()
              return
            }
            this.eyo.changeWrap(
              function () {
                var block = this.eyo.block_
                B = eYo.DelegateSvg.newBlockReady(block.workspace, {
                  type: eYo.T3.Expr.keyword_item,
                  data: key
                })
                var list = this.list
                var c8n = list.inputList[list.inputList.length - 1].connection
                c8n.connect(B.outputConnection)
              },
              this
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
  #block-print-keyword {
    margin: 0;
    padding: 0 0.25rem;
  }
  #block-print-keyword label {
    margin: 0;
    padding-right: 0.25rem;
  }
  #block-print-keyword input {
    position: relative;
    top: -0.0625rem;
  }
  .input-group .input:last-child {
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
</style>
