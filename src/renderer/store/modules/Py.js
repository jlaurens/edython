const state = {
    started1: false,
    running1: false
}

const mutations = {
    setStarted1 (state, yorn) {
        state.started1 = !!yorn
    },
    setRunning1 (state, yorn) {
        console.log('setRunning1', yorn)
        state.running1 = !!yorn
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
