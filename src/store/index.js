import Vue from 'vue'
import Vuex from 'vuex'
import main from './modules/main'
import editor from './modules/editor'
import app from './modules/app'

Vue.use(Vuex)
;[main, editor, app].forEach(({ state, getters }) => {
  Object.entries(state).forEach(([k]) => {
    if (!getters[k]) getters[k] = state => state[k]
  })
})

export default new Vuex.Store({
  modules: {
    main,
    editor,
    app
  }
})
