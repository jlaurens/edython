<template>
  <g>
    <g
      v-if="keyx === 'f'">
      <path d="M 4,4 h24 v24 h-24 z"/>
    </g>
    <g
      v-if="keyx === 'h'">
      <path d="M 4,4 h12 v24 h-12 z"/> 
      <path d="M 4,4 m 16,0 h8 v24 h-8 z"/>
    </g>
    <g
      v-if="keyx === 'v'">
      <path d="M 4,4 h24 v10 h-24 z"/>
      <path d="M 4,18 h24 v10 h-24 z"/>
    </g>
    <g
      v-if="keyx === 'hf'">
      <path d="M 4,4 h12 v10 h-12 z"/>
      <path d="M 4,4 m 16,0 h8 v10 h-8 z"/>
      <path d="M 4,18 h24 v10 h-24 z"/>
    </g>
    <g
      v-if="keyx === 'fh'">
      <path d="M 4,4 h24 v10 h-24 z"/>
      <path d="M 4,18 h8 v10 h-8 z"/>
      <path d="M 4,18 m 12,0 h12 v10 h-12 z"/>
    </g>
    <g
      v-if="keyx === 'vf'">
      <path d="M 4,4 h12 v10 h-12 z"/> 
      <path d="M 4,18 h12 v10 h-12 z"/> 
      <path d="M 4,4 m 16,0 h8 v24 h-8 z"/>
    </g>
    <g
      v-if="keyx === 'fv'">
      <path d="M 4,4 h24 v10 h-24 z"/>
      <path d="M 4,18 h8 v10 h-8 z"/>
      <path d="M 4,18 m 12,0 h12 v10 h-12 z"/>
    </g>
    <g
      v-if="keyx === 'vv'">
      <path d="M 4,4 h12 v12 h-12 z"/> 
      <path d="M 4,20 h12 v8 h-12 z"/> 
      <path d="M 4,4 m 16,0 h8 v8 h-8 z"/>
      <path d="M 4,16 m 16,0 h8 v12 h-8 z"/>
    </g>
    <g
      v-if="keyx === 'hh'">
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