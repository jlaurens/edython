<template>
  <b-container
    id="Main"
    class="h-100 fluid">
    <div
      id="MainToolbar"
      ref="elMainToolbar">
        <main-toolbar></main-toolbar>
    </div>
    <div
      id="MainPage"
      ref="elMainPage">
      <main-page></main-page>
    </div>
    <document-controller
      ref="documentController"></document-controller>
    <dialog-library
      ref="dialogLibrary"></dialog-library>
  </b-container>
</template>

<script>
  import {mapState} from 'vuex'
  
  import MainToolbar from '@@/Toolbar/Main'
  import MainPage from './Main/Page'
  import DocumentController from '@env/DocumentController'
  // import DocumentController from '@@/../env/web/DocumentController'
  import DialogLibrary from './DialogLibrary'

  export default {
    name: 'Main',
    components: {
      MainToolbar,
      MainPage,
      DocumentController,
      DialogLibrary
    },
    computed: {
      ...mapState('Pref', [
        'tipsDisabled'
      ]),
      ...mapState('Page', [
        'toolbarMainHeight'
      ])
    },
    watch: {
      toolbarMainHeight (newValue, oldValue) {
        var div = this.$refs.elMainToolbar
        div.style.height = `${newValue}px`
        div = this.$refs.elMainPage
        div.style.top = `${newValue}px`
        div.style.height = `calc(100% - ${newValue}px)`
      },
      tipsDisabled (newValue, oldValue) {
        var tippies = Array.from(document.querySelectorAll('[data-tippy]'), el => el._tippy)
        var i = 0
        if (newValue) {
          for (var t in tippies) {
            if (t.state.visible) {
              t.hide()
            }
            t.disable()
          }
        } else {
          for (var t in tippies) {
            t.enable()
          }
        }
      }
    }
  }
</script>
<style>
  #Main {
    position: relative;
    left: 0px;
    top: 0px;
    margin: 0;
    padding: 0;
    overflow-y: hidden; /* Extra white space at the bottom, where does it come from ? This BAD VERY trick is here to ignore such space. */
  }
  #MainPage {
    width: 100%;
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
