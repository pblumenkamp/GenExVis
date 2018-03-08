import Vue from 'vue'
import Vuex from 'vuex'

import {STORE_DESEQ2_STATISTICS} from './action_constants'
import {ADD_DATA} from './mutation_constants'

import {DGE} from '../utilities/dge'
import {parseDeseq2} from '../utilities/deseq2'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: true,
  state: {
    dgeData: new DGE()
  },
  mutations: {
    [ADD_DATA] (state, dgeData) {
      state.dgeData.mergeDGEs(dgeData)
    }
  },
  actions: {
    [STORE_DESEQ2_STATISTICS] ({commit, state}, {deseq2Contents, progress}) {  // deseq2Content: [{content: <Content as String>, conditions: [c1, c2]}, ...]
      return new Promise((resolve, reject) => {
        progress.max = deseq2Contents.length

        for (let {content, conditions} of deseq2Contents) {
          let dge = parseDeseq2(content, conditions)
          commit(ADD_DATA, dge)
          progress.counter++
        }

/*
        let deseq2Statistics = [deseq2Content[0]]
        let countGenes = 0
        for (let i = 1; i < deseq2Content.length; i++) {
          countGenes += deseq2Content[i].length
        }
        progress.max = countGenes

        for (let i = 1; i < deseq2Content.length; i++) {
          let deseq2Obj = deseq2Content[i]
          for (let newGene of deseq2Obj) {
            for (let existingGene of deseq2Statistics[0]) {
              if (newGene.gene_name === existingGene.gene_name) {
                existingGene._deseq2.push(newGene._deseq2[0])
                progress.counter++
                break
              }
            }
          }
        }
*/
        progress.done = true
        progress.counter = 0
        resolve()
      })
    }
  }
})

export default store
