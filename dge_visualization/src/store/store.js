import Vue from 'vue'
import Vuex from 'vuex'

import {STORE_DESEQ2_STATISTICS, EXTEND_FILE_LIST, REGISTER_CONDITION, STORE_COUNT_TABLE} from './action_constants'
import {ADD_DATA, ADD_FILE, ADD_CONDITION, ADD_COUNT_DATA, ADD_SEQRUN_MAPPING} from './mutation_constants'
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
    },
    [ADD_COUNT_DATA] (state, {geneName, normalization, condition, values}) {
      if (normalization === 'unnormalized') {
        state.dgeData.addUnnormalizedCountData(geneName, condition, values)
      } else if (normalization === 'deseq2') {
        state.dgeData.addDeseq2CountData(geneName, condition, values)
      }
    },
    [ADD_SEQRUN_MAPPING] (state, mapping) {
      state.setSeqRunMapping(mapping)
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
    },
    [EXTEND_FILE_LIST] ({commit, state}, {filelist}) {
      commit(ADD_FILE, filelist)
      console.log((filelist))
    },
    [REGISTER_CONDITION] ({commit, state}, {conditionName}) {
      return new Promise((resolve, reject) => {
        for (let registeredCond of state.registeredConditions) {
          if (conditionName === registeredCond) {
            reject(new Error(`Condition ${conditionName} already registered!`))
          }
        }
        commit(ADD_CONDITION, conditionName)
        resolve()
      })
    },
    [STORE_COUNT_TABLE] ({commit, state}, {table, headerConditionMapping, geneColumn, normalization}) {
      return new Promise((resolve, reject) => {
        commit(ADD_SEQRUN_MAPPING, {
          mapping: headerConditionMapping
        })
        for (let gene of table) {
          let countData = {}
          // get all conditions
          for (let {condition} of headerConditionMapping) {
            if (!countData.hasOwnProperty(condition)) {
              countData[condition] = {}
            }
          }
          // fill conditions with values
          for (let {header, condition} of headerConditionMapping) {
            if (gene.hasOwnProperty(header)) {
              countData[condition][header] = parseFloat(gene[header])
            }
          }
          for (let cond of Object.keys(countData)) {
            commit(ADD_COUNT_DATA, {
              geneName: gene[geneColumn],
              normalization: normalization,
              condition: cond,
              values: countData[cond]
            })
          }
        }
        resolve()
      })
    }
  }
})

export default store
