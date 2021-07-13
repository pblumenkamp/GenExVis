<template>
  <div>
    <div style="text-align: center">
      <file-chooser :clear_value="clear_value" @change="loadFiles" />
    </div>

    <div v-if="headerConditionMapping.length !== 0" style="margin-top: 3rem">
      <div style="text-align: center">
        Normalization method:
        <b-form-select v-model="selectedNormalization" style="width: auto; margin-left: 0.5rem">
          <option
            v-for="norm in normalization"
            :key="norm"
            :value="norm.toLowerCase()"
          >
            {{ norm }}
          </option>
        </b-form-select>
      </div>
      <b-container>
        <b-row v-for="mapping in headerConditionMapping" :key="mapping.header" style="margin: 1rem">
          <b-col style="padding-top: 0.4rem">
            {{ mapping.header }}
          </b-col>
          <b-col>
            <b-form-select v-model="mapping.condition" @input="validate">
              <option value="">-- Ignore --</option>
              <option value="$$FEATURE_NAME$$">-- Feature name --</option>
              <option
                v-for="cond in registeredConditions"
                :key="cond"
                :value="cond"
              >
                {{ cond }}
              </option>
            </b-form-select>
          </b-col>
        </b-row>
        <b-row>
          <div style="width: 10rem; margin: 1rem auto 0;">
            <b-button
              :disabled="disabledImportButton"
              style="margin-bottom: 0.7rem; margin-right: 0.5rem"
              @click="integrateCountTable"
            >
              Import files
            </b-button>
            <font-awesome-icon
              v-if="importingFiles"
              :icon="faSpinner"
              pulse
              size="2x"
              class="text-secondary"
            />
            <font-awesome-icon
              v-if="importingDone"
              :icon="faCheckCircle"
              size="2x"
              class="text-secondary"
            />
            <font-awesome-icon
              v-if="missingGeneColumn"
              :icon="faTimesCircle"
              size="2x"
              class="text-secondary"
            />
          </div>
        </b-row>
        <b-row>
          <div style="margin: 0 auto;">
            <span v-if="missingGeneColumn" style="color: red">No "gene name" column selected</span>
          </div>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
  import {STORE_COUNT_TABLE} from '@/store/action_constants'
  import {ADD_COUNT} from '@/store/mutation_constants'

  import {EventBus, Events} from '../../utilities/event_bus.js'

  import FileChooser from '../Misc/FileChooser'

  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faSpinner, faCheckCircle, faTimesCircle} from '@fortawesome/free-solid-svg-icons'

  export default {
    name: 'CountTableImport',
    components: {
      FontAwesomeIcon,
      FileChooser
    },
    data () {
      return {
        file: null,
        items: [],  // [{<col_name>: <value>}, ...] each list entry one row
        importingFiles: false,
        importingDone: false,
        disabledImportButton: false,
        missingGeneColumn: false,
        normalization: ['Unnormalized', 'DESeq2'],
        selectedNormalization: 'unnormalized',
        headerConditionMapping: [],      // [{header: <string>, condition: <string>}, ...],
        clear_value: 0,
        event_bus_callbacks: {}
      }
    },
    computed: {
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
      }
    },
    watch: {
      registeredConditions (conditions) {
        for (let i = 0; i < this.headerConditionMapping.length; i++) {
          if (conditions.indexOf(this.headerConditionMapping[i].condition) === -1) {
            this.headerConditionMapping[i].condition = ''
          }
          this.headerConditionMapping[i].condition = this.suggestregex(this.headerConditionMapping[i].header)
        }
      }
    },
    methods: {
      validate (value) {
        if (value === '$$FEATURE_NAME$$') {
          this.missingGeneColumn = false
        }
      },
      loadFiles (event) {
        this.file = event.target.files[0]
        this.disabledImportButton = false
        this.importingDone = false
        this.missingGeneColumn = false
        this.importCountTable()
      },
      importCountTable () {
        let vueData = this
        vueData.headerConditionMapping = []
        this.readCountTable(vueData.file)
          .then(({table, colNames}) => {
            for (let colName of colNames) {
              if (['geneid', 'gene', 'feature'].includes(colName.toLowerCase())) {
                vueData.headerConditionMapping.push({
                  header: colName,
                  condition: '$$FEATURE_NAME$$'
                })
              } else {
                let regexcondition = vueData.suggestregex(colName)
                this.headerConditionMapping.push({
                  header: colName,
                  condition: regexcondition
                })
              }
            }
            vueData.items = table
          })
      },
      readCountTable (file) {
        const reader = new FileReader()

        return new Promise((resolve, reject) => {
          reader.onerror = () => {
            reader.abort()
            reject(new DOMException('Problem parsing input file.'))
          }

          reader.onload = () => {
            let text = reader.result
            let content = text.split('\n')
            if (content[0][0] === '#') {
              content.shift()
            }
            while (content[content.length - 1] === '') {
              content.pop()
            }
            let header = content[0].split('\t').map(entry => entry.replace(/^"|"$/g, ''))
            let results = {table: [], colNames: header}

            for (let i = 1, contentLength = content.length; i < contentLength; i++) {
              let entry = content[i].split('\t')
              let parsedEntry = {}

              for (let j = 0, headerLength = header.length; j < headerLength; j++) {
                parsedEntry[header[j]] = entry[j]
              }
              results.table.push(parsedEntry)
            }

            resolve(results)
          }
          reader.readAsText(file)
        })
      },
      integrateCountTable () {
        let filename = this.file.name
        let usedColumns = {}
        let geneColumn = ''
        for (let {header, condition} of this.headerConditionMapping) {
          if (condition !== '') {
            if (condition === '$$FEATURE_NAME$$') {
              geneColumn = header
            } else if (this.registeredConditions.indexOf(condition) === -1) {
              continue
            } else {
              usedColumns[header] = condition
            }
          }
        }
        if (geneColumn === '') {
          this.missingGeneColumn = true
          return
        }
        this.disabledImportButton = true
        this.importingFiles = true
        this.$store.commit(ADD_COUNT, filename)
        this.$store.dispatch(STORE_COUNT_TABLE, {
          table: this.items,
          headerConditionMapping: usedColumns,
          geneColumn: geneColumn,
          normalization: this.selectedNormalization
        }).then(() => {
          this.importingFiles = false
          this.importingDone = true
        })
      },
      suggestregex (column) {
        let tempdict = {}
        let suggestion = ''
        for (let entry of this.$store.state.registeredConditions) {
          let regex = RegExp(entry.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i')
          let match = regex.exec(column)
          if (match !== null) {
            tempdict[match.index] = entry
          }
        }
        let keyarray = Object.keys(tempdict)
        let keylength = Object.keys(tempdict).length
        if (keylength === 1) {
          suggestion = tempdict[keyarray[0]]
        }
        return suggestion
      }
    },
    mounted () {
      const vue = this
      vue.event_bus_callbacks[Events.CLEAR_ALL_IMPORT] = () => {
        vue.clear_value += 1
        vue.selectedNormalization = 'unnormalized'
        vue.file = null
        console.log('items')
        console.log(vue.items)
        vue.items.splice(0, vue.items.length)
        console.log(vue.items)
        vue.importingFiles = false
        vue.importingDone = false
        vue.disabledImportButton = false
        vue.missingGeneColumn = false
        console.log('headerCond')
        console.log(vue.headerConditionMapping)
        vue.headerConditionMapping.splice(0, vue.headerConditionMapping.length)
        console.log(vue.headerConditionMapping)
      }
      EventBus.$on(Events.CLEAR_ALL_IMPORT, vue.event_bus_callbacks[Events.CLEAR_ALL_IMPORT])
    },
    destroyed () {
      const vue = this
      EventBus.$off(Events.CLEAR_ALL_IMPORT, vue.event_bus_callbacks[Events.CLEAR_ALL_IMPORT])
    }
  }
</script>
