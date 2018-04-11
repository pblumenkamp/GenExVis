<template>
  <div>
    <div>
      <b-form-file id="inputCountTable" v-model="file" placeholder="Choose a file..." @input="uploadCountTable" style="width: 50%"></b-form-file>
      <div style="margin-left: 1rem; margin-top: 1rem">
        Normalization method:
        <b-form-select v-model="selectedNormalization" style="width: auto; margin-left: 0.5rem">
          <option v-for="norm in normalization" :value="norm.toLowerCase()">{{ norm }}</option>
        </b-form-select>
      </div>
    </div>

    <div v-if="headerConditionMapping.length !== 0">
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
          <b-button @click="integrateCountTable">Import files</b-button>
        </b-row>
      </b-container>
    </div>

    <b-container fluid v-if="uploadingFinished">
      <b-row>
          <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
      </b-row>

      <b-table
        responsive
        striped
        hover
        :items="items"
        :current-page="currentPage"
        :per-page="perPage"
        style="width: auto;"></b-table>
    </b-container>
  </div>
</template>

<script>
  import {STORE_COUNT_TABLE} from '@/store/action_constants'

  export default {
    name: 'count-table-upload',
    data () {
      return {
        file: null,
        items: [],  // [{<col_name>: <value>}, ...] each list entry one row
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
      uploadCountTable () {
        var vueData = this
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
                this.headerConditionMapping.push({
                  header: colName,
                  condition: ''
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
        let usedColumns = {}
        let geneColumn = ''
        for (let {header, condition} of this.headerConditionMapping) {
          if (condition !== '') {
            if (condition === '$$GENE_NAME$$') {
              geneColumn = header
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
          console.log(this.$store.state.dgeData)
        })
      }
    },
    computed: {
      registeredConditions () {
        return this.$store.state.registeredConditions
      }
    }
  }
</script>
