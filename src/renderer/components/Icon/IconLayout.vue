<template>
  <g>
    <g
      v-if="keyx === 'F'">
      <path d="M 4,4 h24 v24 h-24 z"/>
    </g>
    <g
      v-if="keyx === 'H'">
      <path d="M 4,4 h12 v24 h-12 z"/> 
      <path d="M 4,4 m 16,0 h8 v24 h-8 z"/>
    </g>
    <g
      v-if="keyx === 'V'">
      <path d="M 4,4 h24 v10 h-24 z"/>
      <path d="M 4,18 h24 v10 h-24 z"/>
    </g>
    <g
      v-if="keyx === 'HF'">
      <path d="M 4,4 h12 v10 h-12 z"/>
      <path d="M 4,4 m 16,0 h8 v10 h-8 z"/>
      <path d="M 4,18 h24 v10 h-24 z"/>
    </g>
    <g
      v-if="keyx === 'FH'">
      <path d="M 4,4 h24 v10 h-24 z"/>
      <path d="M 4,18 h8 v10 h-8 z"/>
      <path d="M 4,18 m 12,0 h12 v10 h-12 z"/>
    </g>
    <g
      v-if="keyx === 'VF'">
      <path d="M 4,4 h12 v10 h-12 z"/> 
      <path d="M 4,18 h12 v10 h-12 z"/> 
      <path d="M 4,4 m 16,0 h8 v24 h-8 z"/>
    </g>
    <g
      v-if="keyx === 'FV'">
      <path d="M 4,4 h24 v10 h-24 z"/>
      <path d="M 4,18 h8 v10 h-8 z"/>
      <path d="M 4,18 m 12,0 h12 v10 h-12 z"/>
    </g>
    <g
      v-if="keyx === 'VV'">
      <path d="M 4,4 h12 v12 h-12 z"/> 
      <path d="M 4,20 h12 v8 h-12 z"/> 
      <path d="M 4,4 m 16,0 h8 v8 h-8 z"/>
      <path d="M 4,16 m 16,0 h8 v12 h-8 z"/>
    </g>
    <g
      v-if="keyx === 'FF'">
      <path d="M 4,4 h12 v12 h-12 z"/> 
      <path d="M 4,20 h8 v12 h-8 z"/> 
      <path d="M 4,16 h8 v8 h-8 z"/>
      <path d="M 4,16 m 12,0 h2 v8 h-12 z"/>
    </g>
  </g>
</template>

<script>
export default {
  props: {
    keyx: {
      type: String,
      default: 'F'
    }
  },
  computed: {
  }
}
</script>

<style>
</style>