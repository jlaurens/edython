<template>
  <div class="eyo-check-mark">
    <span v-if="checked">✓</span>
  </div>
</template>

<script>
export default {
  props: {
    checked: {
      type: Boolean,
      default: false
    }
  }
}
</script>
<style scoped>
  .eyo-check-mark {
    display: inline-block;
    width: 1rem;
    text-align: left;
  }
</style>