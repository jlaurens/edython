<template>
  <g :transform="verticalMirror">
    <path d="M 31,1 4,1 A 3,3 0 0 0 3,3 L 3,31 31,31 M 31,6 2,6"/>
    <path d="M 9,19 A 10,10 0 0 1 25,19 M 17,13 17,10 M 10,15 9,12 M 24,15 25,12" :transform="horizontalMirror"/>
    <path v-if="hide" d="M 17,18.5 A 1.25,1.25 0 0 1 17,21 A 1.25,1.25 0 0 1 17,18.5 z"/>
  </g>
</template>

<script>
  export default {
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
      },
      horizontalMirror () {
        return this.hide
          ? ''
          : 'translate(0 36)scale(1 -1)'
      }
    }
  }
</script>
