import "core-js/stable"
import "regenerator-runtime/runtime"

import lodash from 'lodash'
import pako from 'pako'
import gsap from 'gsap'
import tippy from 'tippy.js/dist/tippy-bundle.umd.js'
import axios from 'axios'
import Stacktrace from 'stack-trace'

eYo.$$ = {
  process, // usefull only in electron
  goog,
  eYo,
  pako,
  _: lodash,
  gsap,
  tippy,
  http: axios,
  Stacktrace
}
