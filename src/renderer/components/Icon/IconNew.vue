<template>
  <g>
      <path d="M 18,1 5,1 5,31 27,31 27,10 z"/>
      <path d="M 18,1 18,10 27,10"/>
      <svg width="32" height="32" v-show="edited">
        <text id="edited-mark" x="50%" y="50%" alignment-baseline="middle" text-anchor="middle" :style="{fontFamily: eYo.Font.familySans}">!</text>      
      </svg>    
  </g>
</template>

<script>
  export default {
    computed: {
      edited: function () {
        return this.variant === 'edited'
      }
    },
    props: {
      variant: {
        type: [String],
        default: ''
      }
    }
  }
</script>