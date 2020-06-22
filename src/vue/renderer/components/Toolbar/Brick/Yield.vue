<template>
  <b-btn-group
    id="brick-yield"
    key-nav 
    aria-label="Block yield"
  >
    <div
      class="item text eyo-code-reserved"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
    >
      yield
    </div>
    <b-dd
      class="eyo-dropdown eyo-with-slotholder"
      variant="outline-secondary"
      text=""
    >
      <b-dd-item-button
        v-for="choice in choices"
        :key="choice"
        class="eyo-code"
        @click="$$choose(choice)"
        v-html="$$content(choice)"
      />
    </b-dd>
    <b-btn-group
      v-if="showFrom"
    >
      <div
        class="item text eyo-code-reserved"
        :style="{fontFamily: $$.eYo.Font.familyMono}"
      >
        from
      </div><div
        v-if="eyo.from_t"
        class="item text"
        v-html="slotholder('eyo-slotholder-inline')"
      /><b-form-input
        v-else
        v-model="from"
        v-tippy
        type="text"
        :class="$$class(from)"
        :placeholder="$$t('brick.placeholder.expression')"
        :title="$$t('brick.except.expression')"
        :style="{fontFamily: $$.eYo.Font.familyMono}"
      />
    </b-btn-group><div
      v-else-if="showExpression"
      class="item text"
      v-html="slotholder('eyo-slotholder-inline')"
    />
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'InfoYield',
  props: {
    slotholder: {
      type: Function,
      default: function (item) {
        return item
      }
    }
  },
  data: function () {
    return {
      saved_step: undefined,
      expression_: undefined,
      from_: undefined,
      variant_: undefined
    }
  },
  computed: {
    ...mapState('Selected', [
      'step'
    ]),
    ...mapGetters('Selected', [
      'eyo'
    ]),
    showExpression () {
      return this.variant === eYo.Key.EXPRESSION
    },
    showFrom () {
      return this.variant === eYo.Key.FROM
    },
    variant: {
      get () {
        this.$$synchronize(this.step)
        return this.variant_
      },
      set (newValue) {
        this.eyo.variant_p = newValue
      }
    },
    from: {
      get () {
        this.$$synchronize(this.step)
        return this.from_
      },
      set (newValue) {
        this.eyo.from_p = newValue
      }
    },
    choices () {
      this.$$synchronize(this.step)
      return this.eyo.variant_d.getAll()
    }
  },
  methods: {
    $$doSynchronize (eyo) {
      this.variant_ = eyo.variant_p
      this.expression_ = eyo.expression_p
      this.from_ = eyo.from_p
    },
    $$choose (variant) {
      this.eyo.variant_p = variant
    },
    $$content (variant) {
      if (variant === eYo.Key.EXPRESSION) {
        return `${this.slotholder('eyo-slotholder-inline')}`
      } else if (variant === eYo.Key.FROM) {
        return '<span class="eyo-code-reserved">from …</span>'
      } else {
        return ''
      }
    },
    $$class (key) {
      return `eyo-code and item text${key.length ? '' : ' placeholder'} w-10rem`
    }
  }
}
</script>
<style>
</style>
