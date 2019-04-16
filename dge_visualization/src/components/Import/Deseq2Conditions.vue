<template>
  <b-container>
    <b-row v-for="{file, index, conditions, validEntry, errorText} in getDataObject" :key="file.name"
           :style="{margin: '0.5rem', 'background-color': (validEntry !== false) ? '' : '#ff000055'}">
      <b-col sm="5" class="align-self-center">
        <b>{{index+1}}.</b> {{file.name}}
      </b-col>
      <b-col sm="3">
        <b-form-select v-model="conditions[0]" :options="registeredConditions"
                       style="margin-top: 3%; margin-bottom: 3%">
          <template slot="first">
            <option :value="''" disabled>-- Condition 1 --</option>
          </template>
        </b-form-select>
      </b-col>
      <b-col sm="3">
        <b-form-select v-model="conditions[1]" :options="registeredConditions"
                       style="margin-top: 3%; margin-bottom: 3%">
          <template slot="first">
            <option :value="''" disabled>-- Condition 2 --</option>
          </template>
        </b-form-select>
      </b-col>
      <b-col sm="1" class="align-self-center text-center">
        <span v-tooltip="{content: errorText, placement: 'right-center', offset: 50}" style="cursor: pointer">
          <font-awesome-icon :icon="faInfoCircle" v-if="validEntry === false" class="text-secondary"
                             transform="grow-10" :style="{'color': '#FF0000'}"></font-awesome-icon>
        </span>
      </b-col>
    </b-row>
    <div style="width: 10rem; margin: 2rem auto 0;">
      <b-button @click="parseDataObject" style="float: left; margin-right: 1rem">Import files</b-button>
      <font-awesome-icon :icon="faSpinner" pulse size="2x" v-if="importingFiles" class="text-secondary"
                         style="margin-top: 0.1rem"></font-awesome-icon>
      <font-awesome-icon :icon="faCheckCircle" size="2x" v-if="importingDone" class="text-secondary"
                         style="margin-top: 0.1rem"></font-awesome-icon>
      <font-awesome-icon :icon="faTimesCircle" size="2x" v-if="importingFailed" class="text-secondary"
                         style="margin-top: 0.1rem"></font-awesome-icon>
    </div>
    <b-progress v-if="!progress.done" :value="progress.counter" :max="progress.max" animated
                style="margin-top: 5rem"></b-progress>
  </b-container>
</template>

<script>
  import {STORE_DESEQ2_STATISTICS} from '@/store/action_constants'
  import {ADD_DESEQ} from '@/store/mutation_constants'

  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faSpinner, faCheckCircle, faTimesCircle, faInfoCircle} from '@fortawesome/free-solid-svg-icons'

  export default {
    name: 'deseq2-conditions',
    props: ['files'],
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        dataObject: [],  // [{file: <file_obj>, conditions: [<cond1 as string>, <cond2 as string>], index: <unique identifier>}, ...]
        importingFiles: false,
        importingDone: false,
        importingFailed: false,
        parsedDeseq2Data: [],
        progress: {counter: 0, max: 1000, done: true}
      }
    },
    methods: {
      parseDataObject () {
        let vue = this
        if (!vue.validate(vue.dataObject)) {
          vue.importingFailed = true
          return
        }
        vue.importingDone = false
        vue.importingFailed = false
        vue.importingFiles = true
        vue.progress.done = false
        let promises = []
        let files = []
        for (let {file, conditions} of this.dataObject) {
          promises.push(this.readDeseq2FileAsText(file, conditions))
          files.push(file.name)
        }

        for (let filename of files) {
          vue.$store.commit(ADD_DESEQ, filename)
        }

        Promise.all(promises)
          .then(values => {
            vue.$store.dispatch(STORE_DESEQ2_STATISTICS, {deseq2Contents: values, progress: vue.progress})
              .then(() => {
                vue.importingFiles = false
                vue.importingDone = true
              })
          }, reason => {
            console.warn(reason)
          })
      },
      validate (data) {
        let valid = true
        for (let i = 0; i < data.length - 1; i++) {
          let entry = data[i]
          if (entry.conditions[0] === entry.conditions[1]) {
            valid = false
            entry.validEntry = false
            data[i].errorText = 'Conditions must differ in a DESeq2 comparison'
          } else {
            entry.validEntry = null
          }
        }
        for (let i = 0; i < data.length - 1; i++) {
          let entryA = data[i]
          let sameConds = []
          for (let j = i + 1; j < data.length; j++) {
            let entryB = data[j]
            if (entryB.validEntry !== false) {
              if (entryA.conditions[0] === entryB.conditions[0] && entryA.conditions[1] === entryB.conditions[1]) {
                if (entryA.validEntry !== false) {
                  entryA.validEntry = false
                  valid = false
                  sameConds.push(i)
                }
                entryB.validEntry = false
                sameConds.push(j)
              }
            }
          }
          for (let i of sameConds) {
            data[i].errorText = `Multiple files/rows contain the same comparison: ${sameConds.map(x => x + 1).join(', ')}`
          }
        }
        return valid
      },
      readDeseq2FileAsText (file, conditions) {
        const reader = new FileReader()

        return new Promise((resolve, reject) => {
          reader.onerror = () => {
            reader.abort()
            reject(new DOMException('Problem parsing input file.'))
          }

          reader.onload = () => {
            resolve({content: reader.result, conditions: conditions})
          }
          reader.readAsText(file)
        })
      },
      suggestregex (filename) {
        let suggestionlist = ['', '']
        let tempdict = {}
        // versus check block
        let vsbool = false
        let vsindex = 0
        let vsregex = RegExp('[^a-z0-9]vs[^a-z0-9]', 'i')
        let vsmatch = vsregex.exec(filename)
        if (vsmatch !== null) {
          vsbool = true
          vsindex = vsmatch.index
        }
        // versus check block END
        for (let entry of this.$store.state.registeredConditions) {
          let regex = RegExp('[^a-z0-9]*' + entry.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i')
          let match = regex.exec(filename)
          if (match !== null) {
            tempdict[match.index] = entry
          }
        }
        let keyarray = Object.keys(tempdict)
        let keylength = Object.keys(tempdict).length
        if (keylength === 2) {
          for (let i = 0; i <= 1; i++) {
            suggestionlist[i] = tempdict[keyarray[i]]
          }
        } else if (keylength === 1 && vsbool === true) {
          if (keyarray[0] > vsindex) {
            suggestionlist[1] = tempdict[keyarray[0]]
          } else {
            suggestionlist[0] = tempdict[keyarray[0]]
          }
        } else if (keylength === 1 && vsbool === false) {
          // (before 20.06.2018) suggestionlist[0] = tempdict[keyarray[0]]
          // (now) pass
        }
        return suggestionlist
      }
    },
    computed: {
      getDataObject () {
        let dataObject = []
        let index = 0
        for (var file of this.files) {
          let sugglist = this.suggestregex(file.name)
          dataObject.push({file: file, conditions: sugglist, index: index, validEntry: null, errorText: ''})
          index++
        }
        this.dataObject = dataObject
        return dataObject
      },
      registeredConditions () {
        return this.$store.state.registeredConditions
      },
      faSpinner () {
        return faSpinner
      },
      faCheckCircle () {
        return faCheckCircle
      },
      faTimesCircle () {
        return faTimesCircle
      },
      faInfoCircle () {
        return faInfoCircle
      }
    },
    watch: {
      registeredConditions (conditions) {
        for (let i = 0; i < this.dataObject.length; i++) {
          for (let j = 0; j < 2; j++) {
            if (conditions.indexOf(this.dataObject[i].conditions[j]) === -1) {
              this.dataObject[i].conditions[j] = ''
            }
            this.dataObject[i].conditions = this.suggestregex(this.dataObject[i].header)
          }
        }
      }
    }
  }
</script>

<style>
  .tooltip {
    display: block !important;
    z-index: 10000;
  }

  .tooltip .tooltip-inner {
    background: black;
    color: white;
    border-radius: 16px;
    padding: 5px 10px 4px;
  }

  .tooltip .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: black;
  }

  .tooltip[x-placement^="top"] {
    margin-bottom: 5px;
  }

  .tooltip[x-placement^="top"] .tooltip-arrow {
    border-width: 5px 5px 0 5px;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    bottom: -5px;
    left: calc(50% - 5px);
    margin-top: 0;
    margin-bottom: 0;
  }

  .tooltip[x-placement^="bottom"] {
    margin-top: 5px;
  }

  .tooltip[x-placement^="bottom"] .tooltip-arrow {
    border-width: 0 5px 5px 5px;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    border-top-color: transparent !important;
    top: -5px;
    left: calc(50% - 5px);
    margin-top: 0;
    margin-bottom: 0;
  }

  .tooltip[x-placement^="right"] {
    margin-left: 5px;
  }

  .tooltip[x-placement^="right"] .tooltip-arrow {
    border-width: 5px 5px 5px 0;
    border-left-color: transparent !important;
    border-top-color: transparent !important;
    border-bottom-color: transparent !important;
    left: -5px;
    top: calc(50% - 5px);
    margin-left: 0;
    margin-right: 0;
  }

  .tooltip[x-placement^="left"] {
    margin-right: 5px;
  }

  .tooltip[x-placement^="left"] .tooltip-arrow {
    border-width: 5px 0 5px 5px;
    border-top-color: transparent !important;
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    right: -5px;
    top: calc(50% - 5px);
    margin-left: 0;
    margin-right: 0;
  }

  .tooltip[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
  }

  .tooltip[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
  }
</style>
