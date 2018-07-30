<template>
  <div id="toolbar-info" :style="style">
    <b-button-toolbar key-nav  aria-label="Info toolbar" justify>
      <b-button-group class="mx-1">
        <span>id:&nbsp;<span class="code">{{selectedId}}</span></span>
      </b-button-group>
      <b-button-group class="mx-1">
        <b-btn id="A" v-on:click=" doSite('http://edython.eu')" title="Aller au site Edython" v-tippy>
          <img src="static/icon_light.svg" height="32" alt="Edython"/>
        </b-btn>
      </b-button-group>
    </b-button-toolbar>
  </div>
</template>

<script>
  export default {
    name: 'toolbar-info',
    data: function () {
      return {
        step: 0
      }
    },
    components: {
    },
    computed: {
      toolbarInfoVisible () {
        return this.$store.state.UI.toolbarInfoVisible
      },
      style () {
        return ['width: ', 100 * this.step, '%;'].join('')
      },
      selectedId () {
        return this.$store.state.UI.selectedBlockId || '…'
      }
    },
    watch: {
      toolbarInfoVisible (newValue, oldValue) {
        this.step = newValue ? 0 : 1
        this.$$.TweenLite.to(this, 1, {step: 1 - this.step})
      }
    },
    methods: {
      doSite (url) {
        if (this.$$.electron && this.$$.electron.shell) {
          // we *are i electron
          this.$$.electron.shell.openExternal(url)
        } else {
          var win = window.open(url, '_blank')
          win.focus()
        }
      }
    }
  }
</script>
<style>
#toolbar-info {
  padding: 0.25rem;
  text-align:center;
  height: 2.25rem;
}
#toolbar-info .btn {
  padding: 0rem 0.5rem;
  height: 1.75rem;
  vertical-align:middle;
}
</style>
