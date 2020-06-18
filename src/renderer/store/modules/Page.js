const state = {
    toolbarMainHeight: 0,
    toolbarBrickHeight: 0
}

const mutations = {
    setToolbarMainHeight (state, height) {
        state.toolbarMainHeight = height
    },
    setToolbarBrickHeight (state, height) {
        state.toolbarBrickHeight = height
    }
}

const actions = {
}

const getters = {
}

const model = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}

export default model
