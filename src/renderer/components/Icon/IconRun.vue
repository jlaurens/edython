<template>
  <g>
    <path
      d="M 16,16 m 12,0 l-18,-10 0,20 z"
      :stroke="color"
    ></path>
  </g>
</template>

<script>
  export default {
    props: {
      running: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      color () {
        return this.running ? '#f9951b' : ''
      }
    }
  }
</script>
