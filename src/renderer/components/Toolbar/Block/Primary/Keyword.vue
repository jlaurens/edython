<template>
  <b-btn-group id="block-primary-keyword">
    <b-btn-group v-for="choice in choices" :key="choice.key" class="eyo-code">
      <div class="item">
        <input type="checkbox" v-model="choice.model">
      </div>
      <div class="eyo-label eyo-code item text" :title="choice.title" v-tippy >{{choice.content}}</div>
    </b-btn-group>
  </b-btn-group>
</template>

<script>
  export default {
    name: 'block-primary-keyword',
    data () {
      return {
        saved_step: undefined,
        choices_by_key_: undefined,
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
      choices () {
        (this.saved_step === this.step) || this.$$synchronize()
        return this.choices_
      }
    },
    created () {
      this.knownKeys = [ // used to order keys
        'sep',
        'end',
        'flush',
        'file',
        'maxsplit'
      ]
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
        this.target_by_name_ = {}
        this.choices_ = []
        var item = this.eyo.item_p
        if (item && ((item.isFunction && this.eyo.dotted_p === 0) || item.isMethod)) {
          var kwargs = item.kwargs
          if (kwargs) {
            var block = this.eyo.block_
            if (block) {
              // extract the name component
              var list = this.list
              var c10r = list.eyo.consolidator
              if (!c10r.hasInputForType(list, eYo.T3.Expr.comprehension)) {
                var names = kwargs.map((arg) => {
                  return arg.name
                })
                var io = c10r.getIO(list)
                var input
                while ((input = c10r.nextInputForType(io, [
                  eYo.T3.Expr.identifier_defined,
                  eYo.T3.Expr.keyword_item
                ]))) {
                  var target = input.connection.targetBlock()
                  if (target) {
                    var name = target.eyo.name_p
                    if (names.indexOf(name) >= 0) {
                      this.target_by_name_[name] = target
                    }
                  }
                }
                for (var i = 0; i < kwargs.length; ++i) {
                  var arg = kwargs[i]
                  var key = arg.name
                  var choice = {
                    key: key,
                    content: `${key}=…`,
                    title: this.$$t(`message.kwarg_${item.module.name}_${item.name}_${key}`) || this.$$t(`message.kwarg_${item.name}_${key}`) || this.$$t(`message.kwarg_${key}`)
                  }
                  var title = this.$$t(`message.kwarg_${item.module.name}_${item.name}_${key}`) || this.$$t(`message.kwarg_${item.name}_${key}`) || this.$$t(`message.kwarg_${key}`)
                  if (title) {
                    choice.title = title.replace('{{default}}', arg.default)
                  }
                  // setup the associate model
                  var getter = (key) => {
                    return () => { // do NOT catch this
                      return !!this.target_by_name[key]
                    }
                  }
                  var setter = (key) => {
                    return (newValue) => { // do NOT catch this
                      this.do(key)
                    }
                  }
                  Object.defineProperties(choice, {
                    model: {
                      get: getter(key), // necessary to catch `key`
                      set: setter(key) // necessary to catch `key`
                    }
                  })
                  // prepare sorting
                  var index = this.knownKeys.indexOf(key)
                  choice.index = index >= 0 ? index : Infinity
                  // record the choice
                  this.choices_.push(choice)
                }
                this.choices.sort((a, b) => {
                  return a.index - b.index
                })
              }
            }
          }
        }
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
                  name_d: key
                })
                var list = this.list
                var c8n = list.inputList[list.inputList.length - 1].connection
                c8n.connect(B.outputConnection)
              }
            )
          }
        )
      }
    }
  }
</script>
<style>
</style>
