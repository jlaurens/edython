<template>
  <b-btn-group
    id="brick-except"
    key-nav
    aria-label="Brick exception"
  >
    <div
      class="item text eyo-code-reserved"
      :style="{fontFamily: $$.eYo.Font.familyMono}"
    >
      except
    </div>
    <div class="item">
      <input
        v-model="showError"
        type="checkbox"
        aria-label="Checkbox to activate the error field"
      >
    </div>
    <b-btn-group :class="showError ? '' : 'disabled'">
      <div
        v-if="eyo.expression_t"
        class="item text"
        v-html="slotholder('eyo-slotholder-inline')"
      />
      <b-form-input
        v-else
        v-model="expression"
        v-tippy
        type="text"
        :class="$$class(expression)"
        :placeholder="$$t('brick.placeholder.expression')"
        :title="$$t('brick.except.expression')"
        :style="{fontFamily: $$.eYo.Font.familyMono}"
      />
    </b-btn-group>
    <div class="item">
      <input
        v-model="showAlias"
        type="checkbox"
        aria-label="Checkbox to activate the alias field"
        :disabled="!showError"
      >
    </div>
    <b-btn-group :class="showAlias && showError ? '' : 'disabled'">
      <div
        class="item text eyo-code-reserved"
        :style="{fontFamily: $$.eYo.Font.familyMono}"
      >
        as
      </div>
      <div
        v-if="eyo.alias_t"
        class="item text"
        v-html="slotholder('eyo-slotholder-inline')"
      />
      <b-form-input
        v-else
        v-model="alias"
        v-tippy
        type="text"
        :class="$$class(alias)"
        :style="{fontFamily: $$.eYo.Font.familyMono}"
        :placeholder="$$t('brick.placeholder.alias')"
        :title="$$t('brick.except.alias')"
      />
    </b-btn-group>
  </b-btn-group>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'InfoDecorator',
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
      alias_: undefined,
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
    showError: {
      get () {
        return this.variant !== eYo.Key.NONE
      },
      set (newValue) {
        if (newValue) {
          if (this.variant !== eYo.Key.ALIASED) {
            this.variant = eYo.Key.EXPRESSION
          }
        } else {
          this.variant = eYo.Key.NONE
        }
      }
    },
    showAlias: {
      get () {
        return this.variant === eYo.Key.ALIASED
      },
      set (newValue) {
        this.variant = newValue ? eYo.Key.ALIASED : eYo.Key.EXPRESSION
      }
    },
    classAlias () {
      return `eyo-code and item${this.showAlias ? ' text' : ''} w-10rem`
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
    can_expression () {
      return this.variant !== eYo.Key.NONE && !this.eyo.expression_t
    },
    expression: {
      get () {
        this.$$synchronize(this.step)
        return this.expression_
      },
      set (newValue) {
        this.eyo.expression_p = newValue
      }
    },
    can_alias () {
      return this.variant === eYo.Key.ALIASED && !this.eyo.alias_s.targetBlock()
    },
    alias: {
      get () {
        this.$$synchronize(this.step)
        return this.alias_
      },
      set (newValue) {
        this.eyo.alias_p = newValue
      }
    }
  },
  methods: {
    content (choice) {
      if (choice === eYo.Key.NONE) {
        return 'except:'
      } else if (choice === eYo.Key.EXPRESSION) {
        return 'except …:'
      } else /* if (choice === eYo.Key.ALIASED) */ {
        return 'except … as …:'
      }
    },
    choose (choice) {
      this.eyo.variant_p = choice
    },
    $$doSynchronize (eyo) {
      this.variant_ = eyo.variant_p
      this.expression_ = eyo.expression_p
      this.alias_ = eyo.alias_p
    },
    $$class (key) {
      return `eyo-code and item text${key.length ? '' : ' placeholder'} w-10rem`
    }
  }
}
</script>
<style>
</style>
