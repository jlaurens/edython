<template>
  <g :transform="transform">
    <path d="M 9,12 h 9 a 11,11 0 0,1 11,11 l -5,0 a 5,5 0 0,0 -5,-5 h -9 v 2.5 l-4.5,-5.5 l 4.5,-5.5 Z" />
  </g>
</template>

<script>
export default {
    props: {
        redo: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        transform: function () {
            return this.redo ? 'matrix(-1,0,0,1,32,0)' : ''
        }
    }
}
</script>