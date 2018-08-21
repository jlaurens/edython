<template>
  <b-form-input id="eyo-info-parent" v-model="parent" type="text" size="10" class="btn btn-outline-secondary eyo-form-input-text" :style='{fontFamily: $$.eYo.Font.familyMono}' v-if="can"></b-form-input>
</template>

<script>
  export default {
    name: 'info-primary-option',
    props: {
      selectedBlock: {
        type: Object,
        default: undefined
      }
    },
    computed: {
      can () {
        var block = this.selectedBlock
        return block && (block.eyo.data.dotted.get() === eYo.Key.PARENT)
      },
      parent: {
        get () {
          var block = this.selectedBlock
          return block && block.eyo.data.parent.get()
        },
        set (newValue) {
          var block = this.selectedBlock
          block && block.eyo.data.parent.set(newValue)
        }
      }
    }
  }
</script>
<style>
  .btn .eyo-info-primary-option {
    padding-right: 0.75rem;
  }
  .dropdown-item.eyo-info-primary-option {
    padding-right: 0.5rem;
  }
  .eyo-form-input-text {
    text-align: left;
    width:8rem;
  }
  .btn-outline-secondary.eyo-form-input-text:hover {
    background: white;
    color: black;
  }
  .eyo-info-primary-option0 {
    display: inline-block;
    position: relative;
    top: -0rem;
  }
  .eyo-info-primary-option1 {
    position: relative;
    top: 0rem;
  }
</style>
  