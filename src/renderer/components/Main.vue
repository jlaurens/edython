<template>
  <b-container
    id="Main"
    class="h-100 fluid"
  >
    <div
      id="MainToolbar"
      ref="elMainToolbar"
    >
      <main-toolbar />
    </div>
    <div
      id="MainPage"
      ref="elMainPage"
    >
      <main-page />
    </div>
    <document-controller
      ref="documentController"
    />
    <dialog-library
      ref="dialogLibrary"
    />
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
        toolbarMainHeight (newValue, oldValue) { //eslint-disable-line no-unused-vars
            var div = this.$refs.elMainToolbar
            div.style.height = `${newValue}px`
            div = this.$refs.elMainPage
            div.style.top = `${newValue}px`
            div.style.height = `calc(100% - ${newValue}px)`
        },
        tipsDisabled (newValue, oldValue) { //eslint-disable-line no-unused-vars
            var tippies = Array.from(document.querySelectorAll('[data-tippy]'), el => el._tippy)
            if (newValue) {
                for (let t of tippies) {
                    if (t.state.visible) {
                        t.hide()
                    }
                    t.disable()
                }
            } else {
                for (let t of tippies) {
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
