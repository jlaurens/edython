<template>
  <g :transform="verticalMirror">
    <path d="M 32,1 4,1 A 3,3 0 0 0 3,3 L 3,31 32,31 M 32,6 2,6" />
    <icon-eye
      :dx="1"
      :dy="4"
      :open="hide"
    />
  </g>
</template>

<script>
import IconEye from './IconEye.vue'
  
export default {
  components: {
    IconEye
  },
  props: {
    left: {
      type: Boolean,
      default: true
    },
    hide: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    verticalMirror () {
      return this.left
        ? ''
        : 'translate(32 0)scale(-1 1)'
    }
  }
}
</script>
