# Packaging the app

Managing the packages is definitely a nightmare, merely due to versioning.

Here is a configuration from scratch.

## Global packages

### @vue/cli

sudo npm install -g @vue/cli

## Scratch install

```
npm install --save debug
npm install --save follow-redirects
npm install --save axios
npm install --save vue
npm install --save vue-drawer-layout vue-i18n vue-router vue-split-panel vue-tippy vue-template-compiler
npm install --save jquery bootstrap-vue
npm install --save css-element-queries
npm install --save element-resize-detector
npm install --save file-saver
npm install --save gsap
npm install --save lodash
npm install --save pako
npm install --save stack-trace
npm install --save braces
npm install --save popper tippy.js
npm install --save xregexp
npm install --save electron
npm install --save chalk
npm install --save cfonts
npm install --save del

```

```
npm install --save-dev --ignore-scripts install-peers
npm install --save-dev webpack
npm install --save-dev webpack-dev-server
npm install --save-dev webpack-hot-middleware
npm install --save-dev raw-loader
npm install --save-dev sass-loader
npm install --save-dev style-loader
npm install --save-dev url-loader
npm install --save-dev node-loader
npm install --save-dev copy-webpack-plugin
npm install --save-dev eslint
npm install --save-dev eslint-plugin-vue@latest
npm install --save-dev eslint-friendly-formatter
npm install --save-dev clean-css
npm install --save-dev terser
npm install --save-dev electron-builder
npm install --save-dev electron-debug
npm install --save-dev electron-devtools-installer
npm install --save-dev devtron
npm install --save-dev file-loader
npm install --save-dev sass-loader
npm install --save-dev style-loader
npm install --save-dev karma
npm install --save-dev mocha
npm install --save-dev node-sass
npm install --save-dev postcss-import
npm install --save-dev postcss-url
npm install --save-dev chai
npm install --save-dev cross-env
npm install --save-dev babel-eslint
```

```
npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
npm WARN deprecated fsevents@1.2.13: fsevents 1 will break on node v14+ and could be using insecure binaries. Upgrade to fsevents 2.

npm WARN notsup Unsupported engine for watchpack-chokidar2@2.0.0: wanted: {"node":"<8.10.0"} (current: {"node":"12.16.1","npm":"6.14.4"})
npm WARN notsup Not compatible with your version of node/npm: watchpack-chokidar2@2.0.0
```

## Production packages

### axios:Promise based HTTP client for the browser and node.js

```
npm install --save debug follow-redirects axios
```

### vue

```
npm install --save vue
```

### vue extensions

```
npm install --save vue-drawer-layout
npm install --save vue-i18n
npm install --save vue-router
npm install --save vue-split-panel
npm install --save vue-tippy
npm install --save vue-template-compiler
```

### vuex

```
npm install --save vuex
npm install --save vuex-persist
```

### vue-electron

```
npm install --save vue-electron
```

### jquery

```
npm install --save jquery
```

### bootstrap-vue

Problem with popper.js

```
npm install --save bootstrap-vue
```

### css-element-queries: An event-based CSS element dimension query

```
npm install --save css-element-queries
```

### element-resize-detector: Optimized cross-browser resize listener for elements.

```
npm install --save element-resize-detector
```

### file-saver:  the solution to saving files on the client-side

```
npm install --save file-saver
```

### gsap: high-performance animations

```
npm install --save gsap
```

### lodash: 

```
npm install --save lodash
```

### pako: zlib port to javascript, very fast!

```
npm install --save pako
```

### stack-trace: Get v8 stack traces as an array of CallSite objects.

```
npm install --save stack-trace
```

### tippy: the complete tooltip, popover, dropdown, and menu solution for the web, powered by Popper.

```
npm install --save popper
npm install --save tippy.js
```

### xregexp

```
npm install --save xregexp
```

### electron: 

```
npm install --save electron
```

### chalk: Terminal string styling done right

```
npm install --save chalk
```

### cfonts: This is a silly little command line tool for sexy fonts in the console. Give your cli some love.

```
npm install --save cfonts
```

### del: Delete files and directories using globs.

```
npm install --save del
```

### fsevents

There is a problem of version here

## Developpement packages

### install-peers: Automatically installs project's peerDependencies (as devDependencies).

```
npm install --save-dev --ignore-scripts install-peers
```

### ESLint

```
npm install --save-dev eslint eslint-plugin-vue@next
```

### eslint-friendly-formatter

```
npm install --save-dev eslint-friendly-formatter
```

### clean-css is a fast and efficient CSS optimizer

```
npm install --save-dev clean-css
```

### terser: A JavaScript parser and mangler/compressor toolkit for ES6+.

"^3.14.1"
```
npm install --save-dev terser
```

### electron-builder

```
npm install --save-dev electron-builder
```

### electron-debug

```
npm install --save-dev electron-debug
```

### electron-devtools-installer

```
npm install --save-dev electron-devtools-installer
```

### webpack

```
npm install --save-dev webpack webpack-dev-server webpack-hot-middleware
```

### file-loader: resolves import/require()

```
npm install --save-dev file-loader
```

### karma: A simple tool that allows you to execute JavaScript code in multiple real browsers.

```
npm install --save-dev karma
```

### mocha: Simple, flexible, fun JavaScript test framework for Node.js & The Browser

```
npm install --save-dev mocha
```

### raw-loader: A loader for webpack that allows importing files as a String.

```
npm install --save-dev raw-loader
```

### sass-loader: Loads a Sass/SCSS file and compiles it to CSS.

```
npm install --save-dev sass-loader
```

### style-loader: Inject CSS into the DOM.

```
npm install --save-dev style-loader
```

### url-loader: A loader for webpack which transforms files into base64 URIs.

```
npm install --save-dev url-loader
```

### node-loader: A loader for webpack.

```
npm install --save-dev node-loader
```

### node-sass: Wrapper around libsass.

```
npm install --save-dev node-sass
```

### copy-webpack-plugin: Copies individual files or entire directories, which already exist, to the build directory.

```
npm install --save-dev copy-webpack-plugin
```


### postcss-import: PostCSS plugin to transform @import rules by inlining content.

```
npm install --save-dev postcss-import
```

### postcss-url: PostCSS plugin to rebase, inline or copy on url().

```
npm install --save-dev postcss-url
```

### chai: Chai is a BDD / TDD assertion library for node and the browser that can be delightfully paired with any javascript testing framework.

```
npm install --save-dev chai
```

### css-loader: interprets @import and url() like import/require() and will resolve them.

```
npm install --save-dev css-loader
```

### cross-env: Run scripts that set and use environment variables across platforms

```
npm install --save-dev cross-env
```

### Electron

#### devtron: An Electron DevTools extension to help you inspect, monitor, and debug your app.

```
npm install --save-dev devtron
```

### babel

#### babel-eslint

```
npm install --save-dev babel-eslint
````
