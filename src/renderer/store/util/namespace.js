// namespace.js helper utility
// https://github.com/vuejs/vuex/issues/335

function mapValues (obj, f) {
    const res = {}
    Object.keys(obj).forEach(key => {
        res[key] = f(obj[key], key)
    })
    return res
}

export default (module, types) => {
    const newObj = {}
    mapValues(types, (names, type) => {
        newObj[type] = {}
        types[type].forEach(name => {
            var newKey = module + '_' + name
            newObj[type][name] = newKey
        })
    })
    return newObj
}
