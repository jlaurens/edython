// Do not save this store
// Used by Quote.Vue

const state = {
    invalidDelimiter: undefined,
    invalidDelimiterId: undefined
}

const mutations = {
    setInvalidDelimiter (state, newValue) {
        state.invalidDelimiter = newValue
    },
    setInvalidDelimiterId (state, newValue) {
        state.invalidDelimiterId = newValue
    }
}

const actions = {
}

const getters = {
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
