<template>
  <g>
    <path
      d="M 5,29 l0,-25 c 12,-3 10,3 21,0 l0,15 c -12,3 -10,-3 -22,0"
      :stroke="stroke"
    ></path>
  </g>
</template>

<script>
  export default {
    props: {
      running: {
        type: Boolean,
        default: false
      },
      active: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      stroke () {
        return this.running
          ? '#f9951b'
          : this.active
            ? '#8dee3f'
            : 'white'
      // },
      // pathClass () {
      //   return this.running
      //     ? 'orange'
      //     : this.active
      //       ? 'green'
      //       : 'white'
      }
    }
  }
</script>
<style>
  path.orange {
    stroke: #f9951b;
  }
  path.green {
    stroke: #8dee3f;
  }
  path.white {
    stroke: white;
  }
</style>
