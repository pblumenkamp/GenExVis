import Vue from 'vue'
import Vuex from 'vuex'

import {EventBus, Events} from '../utilities/event_bus'

import {STORE_DESEQ2_STATISTICS, EXTEND_FILE_LIST, REGISTER_CONDITION, SEARCH_REGEX, STORE_COUNT_TABLE, SET_SUBDGE, CLEAR_SUBDGE, RESET_DGE} from './action_constants'
import {ADD_DATA, ADD_DESEQ, ADD_COUNT, ADD_CONDITION, REMOVE_CONDITION, ADD_COUNT_DATA, ADD_GENE, DEL_GENE, ADD_STRUC, ADD_SEQRUN_MAPPING, ADD_SUBSET_DGE, SWITCH_DGE, CLEAR_DGE, CLEAR_LISTS, CLEAR_CONDITIONS} from './mutation_constants'
import {DGE} from '../utilities/dge'
import {parseDeseq2} from '../utilities/deseq2'

Vue.use(Vuex)

let mainDGE = new DGE()

const store = new Vuex.Store({
  strict: true,
  state: {
    currentDGE: mainDGE,
    dgeData: mainDGE,
    subDGE: new DGE(),
    useSubDGE: false,
    registeredConditions: [],
    deseqlist: [],
    countlist: [],
    genelist: [],
    strucStorage: null
  },
  mutations: {
    [ADD_DATA] (state, dgeData) {
      state.dgeData.mergeDGEs(dgeData)
    },
    [ADD_DESEQ] (state, file) {
      state.deseqlist.push(file)
    },
    [ADD_COUNT] (state, file) {
      state.countlist.push(file)
    },
    [ADD_GENE] (state, gene) {
      state.genelist.push(gene)
      state.genelist.sort()
    },
    [DEL_GENE] (state, gene) {
      let index = 0
      for (let entry of state.genelist) {
        if (entry === gene) {
          state.genelist.splice(index, 1)
        }
        index = index + 1
      }
    },
    [ADD_STRUC] (state, array) {
      state.strucStorage = array
    },
    [ADD_CONDITION] (state, conditionName) {
      state.registeredConditions.push(conditionName)
    },
    [REMOVE_CONDITION] (state, conditionName) {
      let index = state.registeredConditions.indexOf(conditionName)
      if (index > -1) {
        state.registeredConditions.splice(index, 1)
      }
    },
    [ADD_COUNT_DATA] (state, {geneName, normalization, condition, values}) {
      if (normalization === 'unnormalized') {
        state.dgeData.addUnnormalizedCountData(geneName, condition, values)
      } else if (normalization === 'deseq2') {
        state.dgeData.addDeseq2CountData(geneName, condition, values)
      }
    },
    [ADD_SEQRUN_MAPPING] (state, {normalization, mapping}) {
      state.dgeData.setSeqRunMapping(normalization, mapping)
    },
    [ADD_SUBSET_DGE] (state, {subsetDGE}) {
      state.subDGE = subsetDGE
      if (state.useSubDGE) {
        state.currentDGE = state.subDGE
      }
    },
    [SWITCH_DGE] (state, {useSubDGE}) {
      if (useSubDGE) {
        state.useSubDGE = true
        state.currentDGE = state.subDGE
      } else {
        state.useSubDGE = false
        state.currentDGE = state.dgeData
      }
    },
    [CLEAR_DGE] (state, {}) {
      state.subDGE.clear()
      mainDGE.clear()
      state.currentDGE = mainDGE
    },
    [CLEAR_LISTS] (state, {}) {
      state.countlist.splice(0, state.countlist.length)
      state.deseqlist.splice(0, state.deseqlist.length)
    },
    [CLEAR_CONDITIONS] (state, {}) {
      state.registeredConditions.splice(0, state.registeredConditions.length)
    }
  },
  actions: {
    [STORE_DESEQ2_STATISTICS] ({commit, state}, {deseq2Contents, progress}) { // deseq2Content: [{content: <Content as String>, conditions: [c1, c2]}, ...]
      return new Promise((resolve, reject) => {
        try {
          progress.max = deseq2Contents.length
          for (let {content, conditions} of deseq2Contents) {
            let dge = parseDeseq2(content, conditions)
            commit(ADD_DATA, dge)
            progress.counter++
          }
          progress.done = true
          progress.counter = 0
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    },
    [EXTEND_FILE_LIST] ({commit, state}, {deseqlist}) {
      commit(ADD_DESEQ, deseqlist)
    },
    [REGISTER_CONDITION] ({commit, state}, {conditionName}) {
      return new Promise((resolve, reject) => {
        for (let registeredCond of state.registeredConditions) {
          if (conditionName === registeredCond) {
            reject(new Error(`Condition ${conditionName} already registered!`))
            return
          }
        }
        commit(ADD_CONDITION, conditionName)
        resolve()
      })
    },
    [SEARCH_REGEX] ({commit, state}, {regex}) {
      console.log(regex)
    },
    [STORE_COUNT_TABLE] ({commit, state}, {table, headerConditionMapping, geneColumn, normalization}) {
      return new Promise((resolve, reject) => {
        commit(ADD_SEQRUN_MAPPING, {
          normalization: normalization,
          mapping: headerConditionMapping
        })
        for (let gene of table) {
          let countData = {}
          // get all conditions
          for (let [, condition] of Object.entries(headerConditionMapping)) {
            if (!countData.hasOwnProperty(condition)) {
              countData[condition] = {}
            }
          }
          // fill conditions with values
          for (let [seqRun, condition] of Object.entries(headerConditionMapping)) {
            if (gene.hasOwnProperty(seqRun)) {
              countData[condition][seqRun] = parseFloat(gene[seqRun])
            }
          }
          for (let cond of Object.keys(countData)) {
            commit(ADD_COUNT_DATA, {
              geneName: (gene[geneColumn] === '') ? '' : gene[geneColumn].replace(/['"]+/g, ''),
              normalization: normalization,
              condition: cond,
              values: countData[cond]
            })
          }
        }
        resolve()
      })
    },
    [SET_SUBDGE] ({commit, state}, {geneList}) {
      return new Promise((resolve, reject) => {
        let subsetDGE = state.dgeData.getSubset(geneList)
        commit(ADD_SUBSET_DGE, {subsetDGE: subsetDGE})
        resolve()
      })
    },
    [CLEAR_SUBDGE] ({commit, state}) {
      return new Promise((resolve, reject) => {
        let subsetDGE = state.dgeData.getSubset([])
        commit(ADD_SUBSET_DGE, {subsetDGE: subsetDGE})
        resolve()
      })
    },
    [RESET_DGE] ({commit, state}, {}) {
      return new Promise((resolve, reject) => {
        commit(CLEAR_DGE, {})
        commit(CLEAR_LISTS, {})
        commit(CLEAR_CONDITIONS, {})
        EventBus.$emit(Events.CLEAR_ALL_IMPORT)
        resolve()
      })
    }
  }
})

export default store
