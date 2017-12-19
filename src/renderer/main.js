import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

// using ES6 modules
import VueSplit from 'vue-split-panel'

Vue.use(VueSplit)

// require('blockly/blockly_compressed.js') 7 minutes compilation
require('goog/base.js')
require('goog/structs/map.js')
require('goog/ui/modalpopup.js')
require('goog/ui/dialog.js')
require('goog/ui/submenurenderer.js')
require('goog/ui/submenu.js')
require('goog/ui/popupmenu.js')

require('blockly/blocks_compressed.js')
require('blockly/python_compressed.js')
require('blockly/msg/js/fr.js')

require('ezp/core/ezp.js')
require('ezp/msg/js/base.js')
require('ezp/core/ui.js')
require('ezp/css/ezp.css')

require('ezp/closure/menurenderer.js')
require('ezp/closure/menu.js')
require('ezp/closure/popupmenu.js')
require('ezp/closure/menuitemrenderer.js')
require('ezp/closure/menuitem.js')
require('ezp/closure/submenu.js')
require('ezp/closure/submenurenderer.js')

require('ezp/blockly/ezp/constants.js')
require('ezp/blockly/ezp/ezphelper.js')
require('ezp/blockly/block.js')
require('ezp/blockly/ezp/delegate.js')
require('ezp/blockly/block_svg.js')
require('ezp/blockly/xml.js')
require('ezp/blockly/ezp/delegate_svg.js')
require('ezp/blockly/ezp/delegate_svg_val.js')
require('ezp/blockly/ezp/delegate_svg_stt.js')
require('ezp/blockly/ezp/delegate_svg_ctl.js')
require('ezp/blockly/ezp/delegate_svg_grp.js')
require('ezp/blockly/ezp/delegate_svg_prc.js')
require('ezp/blockly/variables.js')
require('ezp/blockly/ezp/variables_menu.js')
require('ezp/blockly/workspace.js')
require('ezp/blockly/workspace_svg.js')
require('ezp/blockly/field_label.js')
require('ezp/blockly/field_textinput.js')
require('ezp/blockly/field_dropdown.js')
require('ezp/blockly/ezp/field_options.js')
require('ezp/blockly/ezp/field_options_code.js')
require('ezp/blockly/ezp/field_options_print.js')
require('ezp/blockly/field_variable.js')
require('ezp/blockly/ezp/blocks-val.js')
require('ezp/blockly/ezp/blocks-stt.js')
require('ezp/blockly/ezp/blocks-grp.js')
require('ezp/blockly/ezp/blocks-ctl.js')
require('ezp/blockly/ezp/blocks-prc.js')
require('ezp/blockly/ezp/blocks-xtd.js')
require('ezp/blockly/rendered_connection.js')

require('ezp/blockly/python/val.js')
require('ezp/blockly/python/stt.js')
require('ezp/blockly/python/grp.js')
require('ezp/blockly/python/prc.js')
require('ezp/blockly/python/ctl.js')

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

window.ezP.Vue = {
  getBus: function () {
    return this.bus_ || (this.bus_ = new Vue())
  }
}
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
