<template>
  <g>
    <path d="M 1,3 31,3 31,8 1,8 z" />
    <path :d="left" />
    <path :d="right" />
  </g>
</template>


<script>
export default {
    props: {
        variant: {
            type: [String],
            default: 'show'
        }
    },
    computed: {
        left: function () {
            return this.variant === 'show'
                ? 'M 1,12 18,12 18,30 1,30 z'
                : 'M 1,12 31,12 31,30 1,30 z'
        },
        right: function () {
            return this.variant === 'show'
                ? 'M 22,12 31,12 31,30 22,30 z'
                : ''
        }
    }
}
</script>