import { createStore } from 'vuex'

import modules1 from './modules/modules1'

import getters from './getters'

const store = createStore({
  modules: {
    mo1: modules1,
  },
  getters
})

export default store