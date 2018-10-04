<template>
  <b-button-toolbar id="info-print" key-nav  aria-label="Info toolbar print" justify>
    <b-button-toolbar>
      <div id='info-print-keyword' class="btn btn-outline-secondary">
        <input type="checkbox" id="info-print-sep" v-model="sep">
        <label for="info-print-sep" class="eyo-code">sep=…</label>
        <input type="checkbox" id="info-print-end" v-model="end">
        <label for="info-print-end" class="eyo-code">end=…</label>
        <input type="checkbox" id="info-print-flush" v-model="flush">
        <label for="info-print-flush" class="eyo-code">flush=…</label>
        <input type="checkbox" id="info-print-file" v-model="file" :disabled="!can_file">
        <label for="info-print-file" class="eyo-code" :disabled="!can_file">file=…</label>
      </div>
      <comment :eyo="eyo"></comment>
    </b-button-toolbar>
    <common :eyo="eyo"></common>
  </b-button-toolbar>
</template>

<script>
  import Comment from './Comment.vue'
  import Common from './Common.vue'

  export default {
    name: 'info-print',
    data: function () {
      return {
      }
    },
    components: {
      Comment,
      Common
    },
    props: {
      eyo: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      list () {
        return this.eyo.block_.getInput(eYo.Key.ARGUMENTS).connection.targetBlock()
      },
      has () {
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
        return has
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
    methods: {
      do (key) {
        eYo.Events.groupWrap(
          this,
          function () {
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
  #info-print-keyword {
    margin: 0 0.25rem;
    padding: 0 0.25rem;
  }
  #info-print-keyword label {
    margin: 0;
    padding-right: 0.25rem;
  }
  #info-print-keyword input {
    position: relative;
    top: -0.0625rem;
  }
</style>
