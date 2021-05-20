const state = () => {
  return {
    count: 32
  }
}

const mutations = {
  addCount (state, val) {
    state.count = state.count + val
  }
}

const actions = {
  addCount1 (context, val) {
    context.commit('addCount', val)
  }
}


export default {
  namespaced: true,
  state,
  mutations,
  actions
}