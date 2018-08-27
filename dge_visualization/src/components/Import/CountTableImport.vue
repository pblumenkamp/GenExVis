<template>
  <div>
    <div style="text-align: center">
      <!--<b-form-file id="inputCountTable" v-model="file" placeholder="Choose a file..." @input="importCountTable" style="width: 50%"></b-form-file>-->
      <file-chooser @change="loadFiles"></file-chooser>
    </div>

    <div v-if="headerConditionMapping.length !== 0" style="margin-top: 3rem">
      <div style="text-align: center">
        Normalization method:
        <b-form-select v-model="selectedNormalization" style="width: auto; margin-left: 0.5rem">
          <option v-for="norm in normalization" :value="norm.toLowerCase()">{{ norm }}</option>
        </b-form-select>
      </div>
      <b-container>
        <b-row v-for="mapping in headerConditionMapping" :key="mapping.header" style="margin: 1rem">
          <b-col style="padding-top: 0.4rem">
            {{mapping.header}}
          </b-col>
          <b-col>
            <b-form-select v-model="mapping.condition">
              <option value="">-- Ignore --</option>
              <option value="$$GENE_NAME$$">-- Gene name --</option>
              <option v-for="cond in registeredConditions" :value="cond">{{cond}}</option>
            </b-form-select>
          </b-col>
        </b-row>
        <b-row>
          <div style="width: 10rem; margin: 1rem auto 0;">
            <b-button @click="integrateCountTable" style="margin-right: 0.2rem">Import files</b-button>
            <font-awesome-icon :icon="faSpinner" pulse size="2x" v-if="importingFiles" class="text-secondary" style="margin-top: 0.5rem"></font-awesome-icon>
            <font-awesome-icon :icon="faCheckCircle" size="2x" v-if="importingDone" class="text-secondary" style="margin-top: 0.5rem"></font-awesome-icon>
          </div>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
  import {STORE_COUNT_TABLE} from '@/store/action_constants'
  import {ADD_COUNT} from '@/store/mutation_constants'

  import FileChooser from '../Misc/FileChooser'

  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'
  import faCheckCircle from '@fortawesome/fontawesome-free-solid/faCheckCircle'

  export default {
    name: 'count-table-import',
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
        currentPage: 0,
        perPage: 10,
        totalRows: 0,
        uploadingFinished: false,
        normalization: ['Unnormalized', 'DESeq2'],
        selectedNormalization: 'unnormalized',
        headerConditionMapping: []      // [{header: <string>, condition: <string>}, ...]
      }
    },
    methods: {
      loadFiles (event) {
        this.file = event.target.files[0]
        this.importCountTable()
      },
      importCountTable () {
        let vueData = this
        this.uploadingFinished = true

        this.readCountTable(vueData.file)
          .then(({table, colNames}) => {
            for (let colName of colNames) {
              if (colName.toLowerCase() === 'geneid') {
                this.headerConditionMapping.push({
                  header: colName,
                  condition: '$$GENE_NAME$$'
                })
              } else {
                let regexcondition = this.suggestregex(colName)
                this.headerConditionMapping.push({
                  header: colName,
                  condition: regexcondition
                })
              }
            }
            this.totalRows = table.length
            this.items = table
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
            let header = content[0].split('\t')
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
        this.$store.commit(ADD_COUNT, filename)
        this.importingFiles = true
        let usedColumns = {}
        let geneColumn = ''
        for (let {header, condition} of this.headerConditionMapping) {
          if (condition !== '') {
            if (condition === '$$GENE_NAME$$') {
              geneColumn = header
            } else if (this.registeredConditions.indexOf(condition) === -1) {
              continue
            } else {
              usedColumns[header] = condition
            }
          }
        }
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
    computed: {
      registeredConditions () {
        return this.$store.state.registeredConditions
      },
      faSpinner () {
        return faSpinner
      },
      faCheckCircle () {
        return faCheckCircle
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
    }
  }
</script>
