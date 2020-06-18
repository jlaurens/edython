<template>
  <b-btn-group
    id="b3k-primary-variant"
  >
    <b-dd
      variant="outline-secondary"
      class="eyo-code item text eyo-with-slotholder mw-6rem"
    >
      <template
        slot="button-content"
      >
        <span
          class="eyo-code"
          v-html="selected.title || selected.content"
        />
      </template>
      <b-dd-item-button
        v-for="choice in choices"
        :key="choice.key"
        class="eyo-code"
        @click="selected = choice"
        v-html="choice.content"
      />
    </b-dd>
    <b-input
      v-if="selected.key === $$.eYo.Key.ALIASED"
      v-model="alias"
      type="text"
      class="item text"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
    />
    <b-btn-group
      v-if="showAnnotation"
    >
      <div
        class="eyo-code-reserved item text"
      >
        :
      </div>
      <b-input
        v-if="!eyo.annotation_t"
        v-model="annotation"
        type="text"
        class="item text"
        :style="{fontFamily: $$.eYo.Font.familyMono}"
      />
      <div
        v-else
        class="item text"
        v-html="slotholder('eyo-slotholder-inline')"
      />
    </b-btn-group>
    <b-btn-group
      v-if="showDefinition"
    >
      <div
        class="eyo-code-reserved item text"
      >
        =
      </div>
      <b-input
        v-model="definition"
        type="text"
        class="item text"
        :style="{fontFamily: $$.eYo.Font.familyMono}"
      />
    </b-btn-group>
    <keyword
      v-if="showKeyword"
      :slotholder="slotholder"
    />
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

import Keyword from './Keyword.vue'

export default {
    name: 'InfoPrimaryVariant',
    components: {
        Keyword
    },
    props: {
        slotholder: {
            type: Function,
            default: function (item) {
                return item
            }
        },
        ismethod: {
            type: Boolean,
            default: false
        },
        keyword: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            saved_step: 0,
            can_call_: true,
            can_andef_: true,
            variant_: eYo.Key.NONE,
            annotation_: undefined,
            definition_: undefined,
            alias_: undefined,
            hasKeyword_: false
        }
    },
    computed: {
        ...mapState('Selected', [
            'step'
        ]),
        ...mapGetters('Selected', [
            'eyo'
        ]),
        showAnnotation () {
            if (this.can_andef) {
                var v = this.variant
                return v === eYo.Key.ANNOTATED || v === eYo.Key.ANNOTATED_DEFINED
            }
            return false
        },
        showDefinition () {
            if (this.can_andef) {
                var v = this.variant
                return v === eYo.Key.DEFINED || v === eYo.Key.ANNOTATED_DEFINED
            }
            return false
        },
        showKeyword () {
            return this.variant === eYo.Key.CALL_EXPR && (this.keyword || this.hasKeyword_)
        },
        keywordArguments () {
            this.$$synchronize(this.step)
            return this.keywordArguments_
        },
        can_call () {
            this.$$synchronize(this.step)
            return this.can_call_
        },
        can_andef () {
            this.$$synchronize(this.step)
            return this.can_andef_
        },
        variant () {
            this.$$synchronize(this.step)
            return this.variant_
        },
        annotation: {
            get () {
                this.$$synchronize(this.step)
                return this.annotation_
            },
            set (newValue) {
                this.eyo.annotation_p = newValue
            }
        },
        definition: {
            get () {
                this.$$synchronize(this.step)
                return this.definition_
            },
            set (newValue) {
                this.eyo.definition_p = newValue
            }
        },
        alias: {
            get () {
                this.$$synchronize(this.step)
                return this.alias_
            },
            set (newValue) {
                this.eyo.alias_p = newValue
            }
        },
        selected: {
            get () {
                this.$$synchronize(this.step)
                return this.by_key[this.variant]
            },
            set (newValue) {
                this.eyo.variant_p = newValue.key
            }
        },
        by_key () {
            return {
                [eYo.Key.NONE]: {
                    content: '&nbsp;',
                    key: eYo.Key.NONE
                },
                [eYo.Key.CALL_EXPR]: {
                    content: `<span>(</span>${this.slotholder('eyo-slotholder')}<span>)</span>`,
                    key: eYo.Key.CALL_EXPR
                },
                [eYo.Key.SLICING]: {
                    content: `<span>[</span>${this.slotholder('eyo-slotholder')}<span>]</span>`,
                    key: eYo.Key.SLICING
                },
                [eYo.Key.ALIASED]: {
                    content: '<span class="eyo-code eyo-code-reserved">as</span>',
                    key: eYo.Key.ALIASED
                },
                [eYo.Key.ANNOTATED]: {
                    title: '&nbsp;',
                    content: `<span class="eyo-code-reserved">:</span>${this.slotholder('eyo-slotholder')}`,
                    key: eYo.Key.ANNOTATED
                },
                [eYo.Key.DEFINED]: {
                    title: '&nbsp;',
                    content: `<span class="eyo-code-reserved">=</span>${this.slotholder('eyo-slotholder')}`,
                    key: eYo.Key.DEFINED
                },
                [eYo.Key.ANNOTATED_DEFINED]: {
                    title: '&nbsp;',
                    content: `<span class="eyop-code-reserved">:</span>${this.slotholder('eyo-slotholder')}<span class="eyo-code-reserved">=</span>${this.slotholder('eyo-slotholder')}`,
                    key: eYo.Key.ANNOTATED_DEFINED
                }
            }
        },
        choices () {
            var item = this.eyo.item_p
            return item && (item.isMethod || item.isFunction || item.isClass)
                ? [
                    this.by_key[eYo.Key.NONE],
                    this.by_key[eYo.Key.CALL_EXPR]
                ]
                : this.can_call
                    ? this.can_andef
                        ? [
                            this.by_key[eYo.Key.NONE],
                            this.by_key[eYo.Key.CALL_EXPR],
                            this.by_key[eYo.Key.SLICING],
                            this.by_key[eYo.Key.ALIASED],
                            this.by_key[eYo.Key.ANNOTATED],
                            this.by_key[eYo.Key.DEFINED],
                            this.by_key[eYo.Key.ANNOTATED_DEFINED]
                        ]
                        : [
                            this.by_key[eYo.Key.NONE],
                            this.by_key[eYo.Key.CALL_EXPR],
                            this.by_key[eYo.Key.SLICING],
                            this.by_key[eYo.Key.ALIASED]
                        ]
                    : this.can_andef
                        ? [
                            this.by_key[eYo.Key.NONE],
                            this.by_key[eYo.Key.SLICING],
                            this.by_key[eYo.Key.ALIASED],
                            this.by_key[eYo.Key.ANNOTATED],
                            this.by_key[eYo.Key.DEFINED],
                            this.by_key[eYo.Key.ANNOTATED_DEFINED]
                        ]
                        : [
                            this.by_key[eYo.Key.NONE],
                            this.by_key[eYo.Key.SLICING],
                            this.by_key[eYo.Key.ALIASED]
                        ]
        }
    },
    methods: {
        $$doSynchronize (eyo) {
            this.variant_ = eyo.variant_p
            this.annotation_ = eyo.annotation_p
            this.definition_ = eyo.definition_p
            this.alias_ = eyo.alias_p
            var item = this.eyo.item_p
            this.can_call_ = !item || (item.type !== 'attribute' && item.type !== 'data' && item.type !== 'first last data') // that would let functions and methods
            this.can_andef_ = !item
        }
    }
}
</script>
<style>
</style>
  
