# Packaging the app

Managing the packages is definitely a nightmare, merely due to versioning.

Here is a configuration from scratch.

## Global packages

### @vue/cli

sudo npm install -g @vue/cli

## Scratch install

```
npm install --save debug follow-redirects axios
npm install --save vue
npm install --save vue-drawer-layout
npm install --save vue-i18n
npm install --save vue-router
npm install --save vue-split-panel
npm install --save vue-tippy
npm install --save vue-template-compiler
npm install --save vuex
npm install --save vuex-persist
npm install --save vue-electron
npm install --save @intlify/vue-i18n-loader
npm install --save jquery
npm install --save bootstrap-vue
npm install --save css-element-queries
npm install --save element-resize-detector
npm install --save file-saver
npm install --save gsap
npm install --save lodash
npm install --save pako
npm install --save stack-trace
npm install --save popper
npm install --save tippy.js
npm install --save xregexp
npm install --save chalk
npm install --save cfonts
npm install --save del
```

```
npm install --save-dev --ignore-scripts install-peers
npm install --save-dev eslint
npm install --save-dev eslint-config-standard eslint-plugin-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-node
npm install --save-dev eslint-friendly-formatter
npm install --save-dev eslint-loader
npm install --save-dev eslint-plugin-vue@next
npm install --save-dev babel-eslint
npm install --save-dev clean-css
npm install --save-dev terser
npm install --save-dev electron
npm install --save-dev electron-builder
npm install --save-dev electron-debug
npm install --save-dev electron-devtools-installer
npm install --save-dev webpack webpack-cli webpack-dev-server webpack-hot-middleware
npm install --save-dev html-webpack-plugin
npm install --save-dev terser-webpack-plugin
npm install --save-dev file-loader
npm install --save-dev raw-loader
npm install --save-dev vue-loader
npm install --save-dev vue-html-loader
npm install --save-dev css-loader
npm install --save-dev node-loader
npm install --save-dev sass-loader
npm install --save-dev style-loader
npm install --save-dev url-loader
npm install --save-dev node-loader
npm install --save-dev babili-webpack-plugin
npm install --save-dev copy-webpack-plugin
npm install --save-dev mini-css-extract-plugin
npm install --save-dev karma
npm install --save-dev mocha
npm install --save-dev node-sass
npm install --save-dev postcss-import
npm install --save-dev postcss-url
npm install --save-dev chai
npm install --save-dev cross-env
npm install --save-dev devtron
npm install --save-dev @babel/core
npm install --save-dev @babel/preset-env
npm install --save-dev babel-register
npm install --save-dev babel-loader
npm install --save-dev babel-plugin-transform-runtime
npm install --save-dev babel-preset-minify
npm install --save-dev @babel/transform-runtime
npm install --save-dev @babel/plugin-proposal-function-bind
npm install --save-dev @babel/plugin-proposal-export-default-from
npm install --save-dev @babel/plugin-proposal-logical-assignment-operators
npm install --save-dev @babel/plugin-proposal-optional-chaining
npm install --save-dev @babel/plugin-proposal-pipeline-operator
npm install --save-dev @babel/plugin-proposal-nullish-coalescing-operator
npm install --save-dev @babel/plugin-transform-runtime
npm install --save-dev @babel/plugin-proposal-do-expressions
npm install --save-dev @babel/plugin-proposal-decorators
npm install --save-dev @babel/plugin-proposal-function-sent
npm install --save-dev @babel/plugin-proposal-export-namespace-from
npm install --save-dev @babel/plugin-proposal-numeric-separator
npm install --save-dev @babel/plugin-proposal-throw-expressions
npm install --save-dev @babel/plugin-syntax-dynamic-import
npm install --save-dev @babel/plugin-syntax-import-meta
npm install --save-dev @babel/plugin-proposal-class-properties
npm install --save-dev @babel/plugin-proposal-json-strings
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

#### vue extensions

```
npm install --save vue-drawer-layout
npm install --save vue-i18n
npm install --save vue-router
npm install --save vue-split-panel
npm install --save tippy.js
npm install --save vue-tippy
npm install --save vue-template-compiler
```

#### vuex

```
npm install --save vuex
npm install --save vuex-persist
```

#### vue-electron

```
npm install --save vue-electron
```

#### @intlify/vue-i18n-loader: vue-i18n loader for custom blocks

```
npm install --save @intlify/vue-i18n-loader
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
npm install --save-dev eslint
```

#### Standard: Is it necessary ?

```
npm install --save-dev eslint-config-standard eslint-plugin-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-node
```

#### eslint-friendly-formatter

```
npm install --save-dev eslint-friendly-formatter
```

#### eslint-loader: A ESlint loader for webpack
See `webpack.debug.config.js` for example.

```
npm install --save-dev eslint-loader
```

#### Vue

```
npm install --save-dev eslint-plugin-vue@next
```

#### babel-eslint

```
npm install --save-dev babel-eslint
```

### clean-css is a fast and efficient CSS optimizer

```
npm install --save-dev clean-css
```

### terser: A JavaScript parser and mangler/compressor toolkit for ES6+.

"^3.14.1"
```
npm install --save-dev terser
npm install --save-dev terser-webpack-plugin
```

### electron: 

```
npm install --save-dev electron
```

#### electron-builder

```
npm install --save-dev electron-builder
```

#### electron-debug

```
npm install --save-dev electron-debug
```

#### electron-devtools-installer

```
npm install --save-dev electron-devtools-installer
```

### webpack

```
npm install --save-dev webpack
npm install --save-dev webpack-cli
```

#### Server

##### webpack-dev-server: Serves a webpack app. Updates the browser on changes.

See `.electron-vue/dev-server.js`.
Run from `npm run dev`.

```
npm install --save-dev webpack-dev-server
```

##### webpack-hot-middleware: Webpack hot reloading you can attach to your own server

See `.electron-vue/dev-client.js`

```
npm install --save-dev webpack-hot-middleware
```

#### html-webpack-plugin: Plugin that simplifies creation of HTML files to serve your bundles
See `webpack.debug.config.js` for example.

```
npm install --save-dev html-webpack-plugin
```

#### file-loader: resolves import/require()

UNUSED.
```
npm install --save-dev file-loader
```

#### raw-loader: A loader for webpack that allows importing files as a String.
See `webpack.debug.config.js` for example.

```
npm install --save-dev raw-loader
```

#### vue-loader: webpack loader for Vue Single-File Components.
See `webpack.debug.config.js` for example.

```
npm install --save-dev vue-loader
```

#### vue-html-loader: Exports HTML as string.
HTML is minimized when the compiler demands.
See `webpack.debug.config.js` for example.

```
npm install --save-dev vue-html-loader
```

#### css-loader: interprets @import and url() like import/require() and will resolve them.
See `webpack.debug.config.js` for example.

```
npm install --save-dev css-loader
```

#### node-loader:
See `webpack.debug.config.js` for example.

```
npm install --save-dev node-loader
```

#### sass-loader: Loads a Sass/SCSS file and compiles it to CSS.

See [https://vue-loader.vuejs.org/guide/pre-processors.html#sass]

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

### Webpack plugins

#### babili-webpack-plugin:
See `webpack.debug.config.js` for example.

```
npm install --save-dev babili-webpack-plugin
```

#### copy-webpack-plugin: Copies individual files or entire directories, which already exist, to the build directory.
See `webpack.debug.config.js` for example.

```
npm install --save-dev copy-webpack-plugin
```

#### mini-css-extract-plugin: Copies individual files or entire directories, which already exist, to the build directory.
See `webpack.debug.config.js` for example.

```
npm install --save-dev mini-css-extract-plugin
```

### karma: A simple tool that allows you to execute JavaScript code in multiple real browsers.

```
npm install --save-dev karma
```

### mocha: Simple, flexible, fun JavaScript test framework for Node.js & The Browser

```
npm install --save-dev mocha
```

### node-sass: Wrapper around libsass.

```
npm install --save-dev node-sass
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

### cross-env: Run scripts that set and use environment variables across platforms

```
npm install --save-dev cross-env
```

### Electron

#### devtron: An Electron DevTools extension to help you inspect, monitor, and debug your app.

```
npm install --save-dev devtron
```

### Babel

#### @babel/core: Babel compiler core.

```
npm install --save-dev @babel/core
```

#### @babel/preset-env: Babel compiler core.

```
npm install --save-dev @babel/preset-env
```

#### babel-register
The require hook will bind itself to node's require and automatically compile files on the fly.

```
npm install --save-dev babel-register
```

#### babel-loader:
See `webpack.debug.config.js` for example.

```
npm install --save-dev babel-loader
```

#### @babel/plugin-transform-runtime:
Externalise references to helpers and builtins, automatically polyfilling your code without polluting globals. (This plugin is recommended in a library/tool)
See `.babelrc`.

```
npm install --save-dev @babel/plugin-transform-runtime
```

#### babel-preset-minify: Babel preset for all minify plugins.
See `.babelrc`.

```
npm install --save-dev babel-preset-minify
```

#### Babel presets.
See `.babelrc`.

```
npm install --save-dev @babel/transform-runtime
npm install --save-dev @babel/plugin-proposal-function-bind
npm install --save-dev @babel/plugin-proposal-export-default-from
npm install --save-dev @babel/plugin-proposal-logical-assignment-operators
npm install --save-dev @babel/plugin-proposal-optional-chaining
npm install --save-dev @babel/plugin-proposal-pipeline-operator
npm install --save-dev @babel/plugin-proposal-nullish-coalescing-operator
npm install --save-dev @babel/plugin-proposal-do-expressions
npm install --save-dev @babel/plugin-proposal-decorators
npm install --save-dev @babel/plugin-proposal-function-sent
npm install --save-dev @babel/plugin-proposal-export-namespace-from
npm install --save-dev @babel/plugin-proposal-numeric-separator
npm install --save-dev @babel/plugin-proposal-throw-expressions
npm install --save-dev @babel/plugin-syntax-dynamic-import
npm install --save-dev @babel/plugin-syntax-import-meta
npm install --save-dev @babel/plugin-proposal-class-properties
npm install --save-dev @babel/plugin-proposal-json-strings
```


