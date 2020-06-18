eYo.mixinR(eYo.App, {
    TUTORIAL: '0-tutorial',
    BASIC: '1-basic',
    NORMAL: '2-normal',
    TEACHER: '3-teacher'
})

const state = {
    panelsWidth: 0,
    displayMode: undefined,
    selectedMode: eYo.App.TUTORIAL,
    toolbarBrickVisible: undefined,
    toolbarRyVisible: undefined,
    toolbarInfoDebug: undefined,
    brickEditShowRy: undefined,
    brickEditShowDotted: undefined
}

const mutations = {
    setPanelsWidth (state, newWidth) {
        state.panelsWidth = newWidth
    },
    setDisplayMode (state, mode) {
        if ([eYo.App.CONSOLE_ONLY, eYo.App.WORKSPACE_ONLY].indexOf(mode) < 0) {
            state.displayMode = undefined
        } else {
            state.displayMode = mode
        }
    },
    selectMode (state, mode) {
        state.selectedMode = mode
        this.commit('UI/setToolbarBrickVisible', mode !== eYo.App.TUTORIAL)
        var yorn = mode !== eYo.App.TUTORIAL && mode !== eYo.App.BASIC
        this.commit('UI/setBrickEditShowRy', yorn)
        this.commit('UI/setBrickEditShowDotted', yorn)
    },
    setToolbarBrickVisible (state, yorn) {
        state.toolbarBrickVisible = !!yorn
    },
    setToolbarRyVisible (state, yorn) {
        state.toolbarRyVisible = !!yorn
    },
    setToolbarBrickDebug (state, yorn) {
        state.toolbarInfoDebug = !!yorn
    },
    setBrickEditShowRy (state, yorn) {
        state.brickEditShowRy = !!yorn
    },
    setBrickEditShowDotted (state, yorn) {
        state.brickEditShowDotted = !!yorn
    },
    reset () {
        this.commit('UI/setPanelsWidth', 0)
        this.commit('UI/setDisplayMode', false)
        this.commit('UI/selectMode', eYo.App.TUTORIAL)
        this.commit('UI/setToolbarBrickVisible', false)
        this.commit('UI/setToolbarRyVisible', false)
        this.commit('UI/setToolbarBrickDebug', false)
        this.commit('UI/setBrickEditShowRy', false)
        this.commit('UI/setBrickEditShowDotted', false)
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
