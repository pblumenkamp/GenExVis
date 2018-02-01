import Vue from 'vue'
import Vuex from 'vuex'
import api from './api.js'

Vue.use(Vuex)
const apiRoot = 'http://localhost:8000'

const store = new Vuex.Store({
  strict: true,
  state: {
    deseq2_objects: []
  },
  mutations: {

  },
  actions: {
    parse_deseq2_files
  }
})

export default store
