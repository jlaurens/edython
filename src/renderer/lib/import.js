import 'babel-polyfill'
import lodash from 'lodash'
import pako from 'pako'
import {TweenLite} from 'gsap/TweenMax'
import tippy from 'tippy.js/dist/tippy.js'
import axios from 'axios'
import Stacktrace from 'stack-trace'

eYo.$$ = {
  process, // usefull only in electron
  goog,
  eYo,
  pako,
  _: lodash,
  TweenLite,
  tippy,
  http: axios,
  Stacktrace
}
