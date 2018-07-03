<template>
  <g>
    <path
      id="p-clap-static"
      d="m 22,31 -18,0 0,-16 24,0 0,11"/>
    <g
      transform="translate(-0.5,-2) rotate(-19,4,15)"
      id="p-clap-mobile">
      <path
        id="p-clap-mobile-contour"
        d="m 4,11 24,0 0,4 -24,0 z" />
      <g :fill="iconColor"
        id="p-clap-mobile-strips">
        <path
          d="m 4,14 3,-3 -3,0 z"
          id="p-clap-mobile-strip-1" />
        <path
          d="m 9,15 4,-4 2,0 -4,4 z"
          id="p-clap-mobile-strip-2" />
        <path
          d="m 17,15 4,-4 2,0 -4,4 z"
          id="p-clap-mobile-strip-3" />
        <path
          d="m 25,15 3,-3 0,3 z"
          id="p-clap-mobile-strip-4" />
      </g>
    </g>
  </g>
</template>

<script>
  export default {
    props: {
      iconColor: {
        type: String,
        default: 'currentColor'
      }
    }
  }
</script>