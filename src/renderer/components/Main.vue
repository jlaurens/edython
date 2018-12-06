<template>
  <b-container id="Main" class="m-0 px-1 h-100 fluid">
    <main-toolbar></main-toolbar>
    <main-Page></main-Page>
    <main-web-load></main-web-load>
    <main-modal></main-modal>
  </b-container>
</template>

<script>
  import {mapState} from 'vuex'

  import MainToolbar from '@@/Toolbar/Main'
  import MainPage from './Main/Page'
  import MainWebLoad from './Main/WebLoad'
  import MainModal from './Main/Modal'
  
  export default {
    name: 'Main',
    components: {
      MainToolbar,
      MainWebLoad,
      MainPage,
      MainModal
    },
    computed: {
      ...mapState('Pref', {
        tipsDisabled: state => state.tipsDisabled
      })
    },
    watch: {
      tipsDisabled (newValue, oldValue) {
        var tippies = Array.from(document.querySelectorAll('[data-tippy]'), el => el._tippy)
        var i = 0
        if (newValue) {
          for (; i < tippies.length; ++i) {
            var t = tippies[i]
            if (t.state.visible) {
              t.hide()
            }
            t.disable()
          }
        } else {
          for (; i < tippies.length; ++i) {
            tippies[i].enable()
          }
        }
      }
    }
  }
</script>
<style>
  #Main {
    position: absolute;
    left: 0px;
    top: 0px;
  }
  .eyo-dropdown .btn {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: left;
    padding-top: 0px;
    padding-bottom: 0px;
    vertical-align: baseline;
  }
  /* main toolbar ? */
  .dropdown>.btn::after {
    position: absolute;
    right: 0.2rem;
    bottom: 0.25rem;
    opacity: 0.666;
  }
</style>
