<template>
  <b-button-toolbar id="info-primary" key-nav  aria-label="Info toolbar primary" justify>
    <b-button-group class="mx-1">
      <b-btn id="A" v-on:click=" doSite('http://edython.eu')" title="Aller au site Edython" v-tippy>
        <img src="static/icon_light.svg" height="32" alt="Edython"/>
      </b-btn>
    </b-button-group>
    <common></common>
  </b-button-toolbar>
</template>

<script>
  import Common from './Common.vue'

  export default {
    name: 'info-primary',
    data: function () {
      return {
      }
    },
    components: {
      Common
    }
  }
</script>
<style>
</style>
