<template>
  <b-button-toolbar id="info-print" key-nav  aria-label="Info toolbar print" justify>
    <b-button-toolbar>
      <div id='info-print-keyword' class="btn btn-outline-secondary">
        <input type="checkbox" id="info-print-sep" v-model="sep">
        <label for="info-print-sep" class="eyo-code">sep=…</label>
        <input type="checkbox" id="info-print-end" v-model="end">
        <label for="info-print-end" class="eyo-code">end=…</label>
        <input type="checkbox" id="info-print-file" v-model="file" :disabled="!can_file">
        <label for="info-print-file" class="eyo-code" :disabled="!can_file">file=…</label>
      </div>
      <comment :selected-block="selectedBlock"></comment>
    </b-button-toolbar>
    <common :selected-block="selectedBlock"></common>
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
      selectedBlock: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      list () {
        var block = this.selectedBlock
        if (block) {
          return block.getInput(eYo.Key.ARGUMENTS).connection.targetBlock()
        }
      },
      has () {
        var has = {}
        var block = this.selectedBlock
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
        return this.selectedBlock.eyo.data
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
      }
    },
    methods: {
      do (key) {
        eYo.Events.setGroup(true)
        try {
          var B = this.has[key]
          if (B) {
            B.unplug()
            B.dispose()
            return
          }
          var block = this.selectedBlock
          B = eYo.DelegateSvg.newBlockComplete(block.workspace, {
            type: eYo.T3.Expr.keyword_item,
            data: key
          })
          var list = this.list
          var c8n = list.inputList[list.inputList.length - 1].connection
          c8n.connect(B.outputConnection)
          B.eyo.beReady(B)
          block.eyo.render(block)
        } catch (err) {
          console.error(err)
          throw err
        } finally {
          eYo.Events.setGroup(false)
        }
      },
      do_sep () {
        this.do('sep')
      },
      do_file () {
        this.do('file')
      },
      do_end () {
        this.do('end')
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
