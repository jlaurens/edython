import store from '@@/../store'

// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
eYo.App.copyTextToClipboard = function (text) {
    const { clipboard } = require('electron')
    clipboard.writeText(text)
}

eYo.App.didCopyBrick = function (brick, xml) {
    const { clipboard } = require('electron')
    const p = new eYo.Py.Exporter()
    const code = p.export(brick, { is_deep: true })
    clipboard.write({ text: code, html: xml })
    console.error('didCopyBrick', xml)
    store.commit('Clipboard/didCopyBrick', xml)
}
