import Vue from 'vue'
import Vuex from 'vuex'

import {STORE_DESEQ2_STATISTICS, EXTEND_FILE_LIST, REGISTER_CONDITION, SEARCH_REGEX, STORE_COUNT_TABLE, SET_SUBDGE} from './action_constants'
import {ADD_DATA, ADD_FILE, ADD_CONDITION, ADD_COUNT_DATA, ADD_GENE, DEL_GENE, ADD_REGEX, ADD_SEQRUN_MAPPING, ADD_SUBSET_DGE, SWITCH_DGE} from './mutation_constants'
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
    filelist: [],
    genelist: [],
    regexlist: []
  },
  mutations: {
    [ADD_DATA] (state, dgeData) {
      state.dgeData.mergeDGEs(dgeData)
    },
    [ADD_FILE] (state, file) {
      state.filelist.push(file)
    },
    [ADD_GENE] (state, gene) {
      state.genelist.push(gene)
      state.genelist.sort()
    },
    [DEL_GENE] (state, gene) {
      let index = 0
      for (let entry of state.genelist) {
        if (entry === gene) {
          console.log('entry: ' + gene)
          console.log(index)
          state.genelist.splice(index, 1)
        }
        index = index + 1
      }
    },
    [ADD_REGEX] (state, regex) {
      let condregex = RegExp(regex)
      // console.log(condregex)
      state.regexlist.push(condregex)
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
    [ADD_SEQRUN_MAPPING] (state, {mapping}) {
      state.dgeData.setSeqRunMapping(mapping)
    },
    [ADD_SUBSET_DGE] (state, {subsetDGE}) {
      state.subDGE = subsetDGE
    },
    [SWITCH_DGE] (state, {useSubDGE}) {
      if (useSubDGE) {
        state.useSubDGE = true
        state.currentDGE = state.subDGE
      } else {
        state.useSubDGE = false
        state.currentDGE = state.dgeData
      }
    }
  },
  actions: {
    [STORE_DESEQ2_STATISTICS] ({commit, state}, {deseq2Contents, progress}) { // deseq2Content: [{content: <Content as String>, conditions: [c1, c2]}, ...]
      return new Promise((resolve, reject) => {
        progress.max = deseq2Contents.length

        for (let {content, conditions} of deseq2Contents) {
          // console.log(content)
          // console.log(conditions)
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
    [SEARCH_REGEX] (state, regex) {
      console.log('hier ist nichts ' + regex)
    },
    [STORE_COUNT_TABLE] ({commit, state}, {table, headerConditionMapping, geneColumn, normalization}) {
      return new Promise((resolve, reject) => {
        commit(ADD_SEQRUN_MAPPING, {
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
              geneName: gene[geneColumn],
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
    }
  }
})

export default store
