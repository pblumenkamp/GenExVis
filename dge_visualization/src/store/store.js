import Vue from 'vue'
import Vuex from 'vuex'

import {STORE_DESEQ2_STATISTICS} from './action_constants'
import {SAVE_DESEQ2_DATA} from './mutation_constants'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: true,
  state: {
    deseq2Objects: []
  },
  mutations: {
    [SAVE_DESEQ2_DATA] (state, deseq2Data) {
      state.deseq2Objects = deseq2Data
    }
  },
  actions: {
    [STORE_DESEQ2_STATISTICS] ({commit}, {deseq2Objects, progress}) {
      return new Promise((resolve, reject) => {
        let deseq2Statistics = [deseq2Objects[0]]
        let countGenes = 0
        for (let i = 1; i < deseq2Objects.length; i++) {
          countGenes += deseq2Objects[i].length
        }
        progress.max = countGenes

        for (let i = 1; i < deseq2Objects.length; i++) {
          let deseq2Obj = deseq2Objects[i]
          for (let newGene of deseq2Obj) {
            for (let existingGene of deseq2Statistics[0]) {
              if (newGene.gene_name === existingGene.gene_name) {
                existingGene.deseq2.push(newGene.deseq2[0])
                progress.counter++
                break
              }
            }
          }
        }
        commit(SAVE_DESEQ2_DATA, deseq2Statistics)
        progress.done = true
        progress.counter = 0
        resolve()
      })
    }
  }
})

export default store
