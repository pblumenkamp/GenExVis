import Vue from 'vue'
import Vuex from 'vuex'

import {STORE_DESEQ2_STATISTICS, EXTEND_FILE_LIST, REGISTER_CONDITION} from './action_constants'
import {ADD_DATA, ADD_FILE, ADD_CONDITION} from './mutation_constants'
import {DGE} from '../utilities/dge'
import {parseDeseq2} from '../utilities/deseq2'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: true,
  state: {
    dgeData: new DGE(),
    registeredConditions: [],
    filelist: []
  },
  mutations: {
    [ADD_DATA] (state, dgeData) {
      state.dgeData.mergeDGEs(dgeData)
    },
    [ADD_FILE] (state, file) {
      state.filelist.push(file)
    },
    [ADD_CONDITION] (state, conditionName) {
      state.registeredConditions.push(conditionName)
    }
  },
  actions: {
    [STORE_DESEQ2_STATISTICS] ({commit, state}, {deseq2Contents, progress}) { // deseq2Content: [{content: <Content as String>, conditions: [c1, c2]}, ...]
      return new Promise((resolve, reject) => {
        progress.max = deseq2Contents.length

        for (let {content, conditions} of deseq2Contents) {
          let dge = parseDeseq2(content, conditions)
          commit(ADD_DATA, dge)
          progress.counter++
        }
        progress.done = true
        progress.counter = 0
        resolve()
      })
    }
  },
  [EXTEND_FILE_LIST] ({commit, state}, {filelist}) {
    commit(ADD_FILE, filelist)
    console.log((filelist))
  },
  [REGISTER_CONDITION] ({commit, state}, {conditionName}) {
    commit(conditionName)
  }
})

export default store
