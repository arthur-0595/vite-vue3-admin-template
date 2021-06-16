import router from '../../router'

const state = () => {
  return {
    routes: [],
  }
}

const mutations = {
  getRoutes(state, routes) {
    state.routes = routes
  },
  removeRoutes(state) {
    state.routes = []
  },
}

const actions = {
  getRoutes({ commit }) {
    const routes = router.options.routes[0].children
    commit('getRoutes', routes)
  },
  removeRoutes({ commit }) {
    commit('removeRoutes')
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
