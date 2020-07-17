<template>
  <div>
    <h1 class="header">Downloads</h1>
    <div>
      <!-- Table with two cols: Options and select files -->
      <b-card class="downloadCard">
        <b-container>
          <b-row>
            <b-col>
              <h4>Select parameters</h4>
              <table style="width:100%; border: none">
                <tr>
                  <b-form-checkbox v-model="roundedValues">
                    Rounded Values
                  </b-form-checkbox>
                </tr>
                <!-- Empty table row -->
                <tr style="height: 1.5rem !important; background-color: white">
                  <td colspan="1"></td>
                </tr>
                <tr>
                  <b-form-checkbox v-model="log2Tick">
                    log2fold Change
                  </b-form-checkbox>
                </tr>
                <tr>
                  <b-form-checkbox v-model="pAdjTick">
                    p value (adjusted)
                  </b-form-checkbox>
                </tr>
                <tr>
                  <b-form-checkbox v-model="meanTick">
                    base mean
                  </b-form-checkbox>
                </tr>
                <tr>
                  <b-form-checkbox v-model="lfcseTick">
                    lfcSE
                  </b-form-checkbox>
                </tr>
                <tr>
                  <b-form-checkbox v-model="statTick">
                    stat
                  </b-form-checkbox>
                </tr>
                <tr>
                  <b-form-checkbox v-model="pTick">
                    p value
                  </b-form-checkbox>
                </tr>
              </table>
            </b-col>
            <b-col>
              <h4>Select files</h4>
              <multiselect
                v-model="selectedConditionPairs"
                :options="conditionPairs"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                :show-labels="true"
                :preselect-first="true"
                track-by="name"
                label="name"
                placeholder="Choose files"
                selected-label="Selected"
                select-label="Click to select"
                deselect-label="Click to remove"
              >
                <template slot="selection" slot-scope="{ values, search, isOpen }">
                  <span v-if="values.length && !isOpen" class="multiselect__single">{{ values.length }} options selected</span>
                </template>
              </multiselect>
            </b-col>
          </b-row>
        </b-container>
      </b-card>
      <br>
      <b-card class="downloadCard">
        <div v-if="selectedConditionPairs.length > 0">
          <h4 style="text-align: center">Representative Download Preview</h4>
          <!--Example table display -->
          <div style="max-width: 1350px; overflow: auto">
            <table style="width:100%; table-layout: auto; border: 1px solid black; border-collapse: collapse">
              <tr v-for="item in tablePreview" :key="item[0]">
                <td v-for="(value, index_j) in item" :key="index_j" style="border: 1px solid black;">{{ value }}</td>
              </tr>
            </table>
          </div>
        </div>
      </b-card>
      <div class="downloadButtonWrapper">
        <br>
        <button
          id="downloadButton"
          :disabled="setButtonDisable1"
          class="btn btn-dark btn-sm"
          title="Download table as .csv"
          @click="downloadCSV()"
        >
          <font-awesome-icon :icon="faDownload" /> Download .csv file
        </button>
      </div>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css">
</style>
<style type="text/css">
  .downloadButtonWrapper {
    text-align: right;
  }
  #downloadButton {
    font-size: 1rem;
    width: 15rem;
    height: 3rem;
  }
  .downloadCard {
    height: 50%;
    border: 1px solid lightslategray;
  }
</style>

<script>
  // imports
  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faDownload} from '@fortawesome/free-solid-svg-icons'
  import Multiselect from 'vue-multiselect'

  export default {
    components: {
      FontAwesomeIcon,
      Multiselect
    },
    data () {
      return {
        // ticks in tickBoxes to select data and data options
        log2Tick: true,
        pAdjTick: true,
        meanTick: true,
        lfcseTick: true,
        pTick: true,
        statTick: true,
        roundedValues: true,
        // dropdown related
        // selectedConditionPairs = array of comparisons selected
        selectedConditionPairs: [],
      }
    },
    computed: {
      // getting conditions to display in multiselect
      conditionPairs () {
        let allConditionPairs = this.$store.state.currentDGE.conditionPairs
        return allConditionPairs.map(conPair => (
          {
            name: conPair.condition1 + ' vs. ' + conPair.condition2,
            conditionPair: conPair
          }
        ))
      },
      // isTableToLarge () {
      //   let numberOfGenes = this.$store.state.dgeData.length
      //   let selectedConditionPairs = this.selectedConditionPairs
      //   return numberOfGenes*(selectedConditionPairs*5)+1 > 2000000
      // },
      tableColumnHeaders () {
        // creating columnHeaders
        let columnHeaders = ['name']
        this.selectedConditionPairs.forEach(() => {
          // columnHeaders.push('log2foldChange', 'p value (adjusted)', 'base mean', 'lfcSE', 'p value', 'stat')
          if (this.log2Tick) {
            columnHeaders.push('log2foldChange')
          }
          if (this.pAdjTick) {
            columnHeaders.push('p value (adjusted)')
          }
          if (this.meanTick) {
            columnHeaders.push('base mean')
          }
          if (this.lfcseTick) {
            columnHeaders.push('lfcSE')
          }
          if (this.statTick) {
            columnHeaders.push('stat')
          }
          if (this.pTick) {
            columnHeaders.push('p value')
          }
        })
        return columnHeaders
      },
      tableConditionPairHeader () {
        let uniqueColumnHeaders = Array.from(new Set(this.tableColumnHeaders))
        // creating 1st row with filenames, resetting fileCounter
        // first row with file names
        let topColumns = [""]
        for (let {name} of this.selectedConditionPairs) {
          topColumns.push(name)
          for (let i = 0; i < uniqueColumnHeaders.length - 2; i++) {
            topColumns.push("")
          }
        }
        return topColumns
      },
      tablePreview () {
        let dge = this.$store.state.currentDGE
        return [this.tableConditionPairHeader, this.tableColumnHeaders].concat(this.getTableContent(Math.min(dge.length, 5)))
      },
      setButtonDisable1 () {
        return this.selectedConditionPairs.length === 0 || this.$store.state.currentDGE.geneNames.size === 0
      },
      faDownload () {
        return faDownload
      }
    },
    methods: {
      getTableContent (numberOfRows) {
        let dge = this.$store.state.currentDGE
        numberOfRows = (numberOfRows) ? numberOfRows : dge.length
        let rowData = []
        // iterate data
        for (let geneName of dge.geneNames) {
          // write only numberOfRows lines into table
          if (rowData.length >= numberOfRows) {
            break
          }
          let row = []
          let gene = dge.getGene(geneName)
          row.push(geneName)
          for (let {conditionPair} of this.selectedConditionPairs) {
            let deseq2Analysis = gene.getDESEQ2Analysis(conditionPair)
            // myData ist eine DEseq2 Analyse für ein Gen und ein Condition Pair
            let baseMean = deseq2Analysis.baseMean
            let log2FoldChange = deseq2Analysis.log2FoldChange
            let lfcSE = deseq2Analysis.lfcSE
            let stat = deseq2Analysis.stat
            let pValue = deseq2Analysis.pValue
            let pAdj = deseq2Analysis.pAdj
            if (this.roundedValues === true) {
              baseMean = Math.round(baseMean * 100) / 100
              log2FoldChange = Math.round(log2FoldChange * 100) / 100
              lfcSE = Math.round(lfcSE * 100) / 100
              stat = Math.round(stat * 100) / 100
              pValue = Math.round(pValue * 100) / 100
              pAdj = Math.round(pAdj * 100) / 100
            }
            // order is important
            // oneEntry.push(mylog2fold, mypAdj, myMean, mylfcSE, mypValue, myStat)
            if (this.log2Tick) {
              row.push(log2FoldChange)
            }
            if (this.pAdjTick) {
              row.push(pAdj)
            }
            if (this.meanTick) {
              row.push(baseMean)
            }
            if (this.lfcseTick) {
              row.push(lfcSE)
            }
            if (this.statTick) {
              row.push(stat)
            }
            if (this.pTick) {
              row.push(pValue)
            }
          }
          // so far: array of arrays with inner array = one entry (entries in correct order)
          rowData.push(row)
        }
        return rowData
      },
      downloadCSV () {
        // expression to add row information taken from:
        // https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
        // to write csv, one 1D big array is needed. In order to give row info, we need newlines between each entry (inner array)
        let csvData = this.getTableContent()
        let csvTops = this.tableConditionPairHeader
        let csvHeaders = this.tableColumnHeaders
        csvData.unshift(csvHeaders)
        csvData.unshift(csvTops)
        let csvContent = csvData.map(e => e.join(',')).join('\n')
        // function to download csv taken from:
        // https://stackoverflow.com/questions/23301467/javascript-exporting-large-text-csv-file-crashes-google-chrome
        function downloadFile (data, fileName) {
          let blob = new Blob([data], {type: 'application/csv;charset=utf-8;'})
          if (window.navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, fileName)
          } else {
            let link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.style = 'invisibility: hidden'
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
        }

        downloadFile(csvContent, 'testDeseqOverview.csv')
      }
    }
  }
</script>
