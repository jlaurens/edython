<template>
  <b-btn-group
    id="brick-primary-keyword"
  >
    <b-btn-group
      v-for="choice in choices"
      :key="choice.key"
      class="eyo-code"
    >
      <div
        class="item"
      >
        <input
          v-model="choice.model"
          type="checkbox"
        >
      </div>
      <div
        v-tippy
        class="eyo-label eyo-code item text"
        :title="choice.title"
      >
        {{ choice.content }}
      </div>
    </b-btn-group>
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
    name: 'BrickPrimaryKeyword',
    props: {
        slotholder: {
            type: Function,
            default: function (item) {
                return item
            }
        }
    },
    data () {
        return {
            saved_step: undefined,
            choices_by_key_: undefined,
            target_by_name_: undefined
        }
    },
    computed: {
        ...mapState('Selected', [
            'step'
        ]),
        ...mapGetters('Selected', [
            'eyo'
        ]),
        list () {
            return this.eyo.n_ary_s.connection.targetBlock()
        },
        target_by_name () {
            this.$$synchronize(this.step)
            return this.target_by_name_
        },
        choices () {
            this.$$synchronize(this.step)
            return this.choices_
        },
        knownKeys () {
            return [ // used to order keys
                'sep',
                'end',
                'flush',
                'file',
                'maxsplit'
            ]
        }
    },
    methods: {
        $$doSynchronize (brick) {
            this.target_by_name_ = {}
            this.choices_ = []
            var item = brick.item_p
            if (item && ((item.isFunction && brick.dotted === 0) || item.isMethod)) {
                var kwargs = item.kwargs
                if (kwargs) {
                    if (brick) {
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
                                    var t_eyo = target.eyo
                                    if (!t_eyo.dotted_p) { // no `foo.bar` candidates
                                        var name = t_eyo.name_p
                                        if (names.indexOf(name) >= 0) {
                                            this.target_by_name_[name] = target
                                        }
                                    }
                                }
                            }
                            for (var i = 0; i < kwargs.length; ++i) {
                                var arg = kwargs[i]
                                var key = arg.name
                                var choice = {
                                    key: key,
                                    content: `${key}=…`
                                }
                                var title = this.$$t(`brick.keyword.${item.module.name}.${item.name}.${key}`) || this.$$t(`brick.keyword.${item.module.name}.${key}`) || this.$$t(`brick.keyword.${item.name}.${key}`) || this.$$t(`brick.keyword.${key}`)
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
                                    return (newValue) => { // eslint-disable-line no-unused-vars
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
