<template>
  <g>
      <path d="M 21,16 21,1 1,1 1,21 16,21"/>
      <path d="M 11,24 11,31 31,31 31,11 24,11"/>
      <g :transform="transform">
        <path d="M 16,3 16,29" />
        <path d="M 13.5,24.5 16,29 18.5,24.5" />  
      </g>
  </g>
</template>

<script>
  export default {
    computed: {
      transform: function () {
        return this.front ? 'rotate(135, 16, 16)' : 'rotate(-45, 16, 16)'
      }
    },
    props: {
      front: {
        type: Boolean,
        default: true
      }
    }
  }
</script>
