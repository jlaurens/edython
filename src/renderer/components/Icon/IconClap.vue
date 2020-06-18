<template>
  <g>
    <path
      id="p-clap-static"
      d="m 22,31 -18,0 0,-16 24,0 0,11"
    />
    <g
      id="p-clap-mobile"
      transform="translate(-0.5,-2) rotate(-19,4,15)"
    >
      <path
        id="p-clap-mobile-contour"
        d="m 4,11 24,0 0,4 -24,0 z"
      />
      <g
        id="p-clap-mobile-strips"
        :fill="iconColor"
      >
        <path
          id="p-clap-mobile-strip-1"
          d="m 4,14 3,-3 -3,0 z"
        />
        <path
          id="p-clap-mobile-strip-2"
          d="m 9,15 4,-4 2,0 -4,4 z"
        />
        <path
          id="p-clap-mobile-strip-3"
          d="m 17,15 4,-4 2,0 -4,4 z"
        />
        <path
          id="p-clap-mobile-strip-4"
          d="m 25,15 3,-3 0,3 z"
        />
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