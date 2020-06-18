<template>
  <g>
    <path
      class="circled"
      :d="pathDef"
    />
    <path
      class="info"
      :d="infoDef"
    />
  </g>
</template>

<script>
export default {
    props: {
        radius: {
            type: Number,
            default: 9
        }
    },
    computed: {
        pathDef: function () {
            var R = this.radius.toString()
            return ['M 10 10 m -', R, ',0 a ', R, ',', R, ' 0 1,0 ', R, ',-', R, ' a ', R, ',', R, ' 0 0,0 -', R, ', ', R].join('')
        },
        infoDef: function () {
            return ['M 10 ', 10 + this.radius * 5 / 9.5, ' 10 ', 10 - this.radius * 0.5 / 9.5,
                ' m 0,', -this.radius * 4 / 9.5, ' l 0,-0.001'].join('')
        }
    }
}
</script>

<style>
  path.circled {
    stroke-width:1.5;
  }
  path.info {
    stroke-width:3.5;
    stroke-linecap: round;
  }
</style>
