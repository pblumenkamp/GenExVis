<template xmlns:position="http://www.w3.org/1999/xhtml" xmlns:overflow="http://www.w3.org/1999/xhtml">
  <div style="width: 100%; height: 600px">
    <div style="text-align: center">
      <h1>Deseq2 - Downloads</h1>
    </div>
    <div v-if="showGrid">

    </div>
          <!-- Table with two cols: Options and select files -->
    <b-card style="height: 50%; border: 1px solid lightslategray">
      <table style="width:100%" border="0px solid black">
          <td width="50%">
            <tr>
              <div>
                <b-form-checkbox v-model="roundedValues"
                                 @change="toggleRoundingChange">
                  Rounded Values
                </b-form-checkbox>
              </div>
            </tr>
            <tr>
            <b-form-checkbox v-model="log2Tick"
                             @change="toggleLog2Change">
              log2fold Change
            </b-form-checkbox>
            <tr>
              <b-form-checkbox v-model="pAdjTick"
                               @change="togglePadjChange">
                p value (adjusted)
              </b-form-checkbox>
            </tr>
            <tr>
            <b-form-checkbox v-model="meanTick"
                               @change="toggleMeanChange">
                base mean
              </b-form-checkbox>
            </tr>
            <tr>
              <b-form-checkbox v-model="lfcseTick"
                               @change="toggleLFCSEchange">
                lfcSE
              </b-form-checkbox>
            </tr>
            <tr>
              <b-form-checkbox v-model="pTick"
                               @change="togglePchange">
                p value
              </b-form-checkbox>
            </tr>
            <tr>
              <b-form-checkbox v-model="statTick"
                               @change="toggleStatChange">
                stat
              </b-form-checkbox>
            </tr>
          </td>
            <!-- Dropdown menu for fileselection-->
        <td width="50%">
              <h4>Select files</h4>
              <multiselect
                v-model="selected"
                :options="options"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                :show-labels="true"
                placeholder="Choose files"
                selected-label="Selected"
                select-label="Click to select"
                deselect-label="Click to remove"
              >
                <template
                  slot="selection"
                  slot-scope="{ values, search, isOpen }">
                  <span class="multiselect__single" v-if="values.length &amp;&amp; !isOpen">{{ values.length }} options selected</span>
                </template>
              </multiselect>
          <!--
              <h4>Selected files</h4>
              <pre>{{ selected }}</pre> -->
        </td>
      </table>
    </b-card>
    <div>
      <br>
      <button
        :disabled="buttonDisabled1"
        id = 'downloadCSV'
        class="btn btn-dark btn-sm"
        title="Download table as .csv"
        @click="downloadCSV()"
        style = "width: 100%"
      >
        <font-awesome-icon :icon="faDownload"></font-awesome-icon> Download full .csv
      </button>
    </div>
    <div>
      <br>
      <button
        :disabled="buttonDisabled2"
        id = 'downloadSub'
        class="btn btn-dark btn-sm"
        title="Download table as .csv"
        @click="downloadSub()"
        style = "width: 100%"
      >
        <font-awesome-icon :icon="faDownload"></font-awesome-icon> Download subset .csv
      </button>
    </div>
  </div>
</template>

<script>
  // imports
  import faDownload from '@fortawesome/fontawesome-free-solid/faDownload'
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import Multiselect from 'vue-multiselect'
  import {ConditionPair} from '../../utilities/dge'
  export default {
    data () {
      return {
        // currentDGE data (all)
        topColumns: null,
        columnHeaders: null,
        rowData: null,
        // subDGE data (subset)
        subTopColumns: null,
        subColumnHeaders: null,
        subRowData: null,
        conditionPairList: [],
        // ticks in tickBoxes to select data and data options
        log2Tick: true,
        pAdjTick: true,
        meanTick: true,
        lfcseTick: true,
        pTick: true,
        statTick: true,
        roundedValues: true,
        showGrid: true,
        buttonDisabled1: true,
        buttonDisabled2: true,
        // dropdown related
        // selected = array of comparisons selected
        selected: [],
        // comparisons choosable in dropdown (according to uploaded files)
        options: []
      }
    },
    components: {
      FontAwesomeIcon,
      Multiselect
    },
    methods: {
      setButtonDisable1 () {
        if (this.selected.length === 0 || this.$store.state.currentDGE.geneNames.size === 0) {
          this.buttonDisabled1 = true
        } else {
          this.buttonDisabled1 = false
        }
      },
      setButtonDisable2 () {
        if (this.selected.length === 0 || this.$store.state.subDGE.geneNames.size === 0) {
          this.buttonDisabled2 = true
        } else {
          this.buttonDisabled2 = false
        }
      },
      getMyConditions () {
        console.log('creating conditions')
        let conditionDicts = this.$store.state.currentDGE.conditionPairs
        let myConditions = []
        let i = 0
        while (i < conditionDicts.length) {
          let first = conditionDicts[i]['_condition1']
          let second = conditionDicts[i]['_condition2']
          myConditions.push(first + ' vs. ' + second + ' ')
          i = i + 1
        }
        // only for display in the dropdown
        this.options = myConditions
      },
      getSelected () {
        this.selected = this.selected
      },
      getConditionPairs () {
        console.log('getConditionPairs')
        let conditionPairList = []
        // console.log(this.selected)
        for (let i = 0; i < this.selected.length; i++) {
          // splitting at space to get e.g. t1, vs., t2
          // console.log(this.selected[i])
          let first = this.selected[i].slice(0, 2)
          let second = this.selected[i].slice(7, 9)
          conditionPairList.push(new ConditionPair(first, second))
        }
        this.conditionPairList = conditionPairList
      },
      makeCurrentData () {
        console.log('creating currentData')
        let fileCounter = this.selected.length
        // creating columnHeaders
        let columnHeaders = []
        while (fileCounter > 0) {
          // columnHeaders.push('log2foldChange', 'p value (adjusted)', 'base mean', 'lfcSE', 'p value', 'stat')
          if (this.log2Tick === true) {
            columnHeaders.push('log2foldChange')
          }
          if (this.pAdjTick === true) {
            columnHeaders.push('p value (adjusted)')
          }
          if (this.meanTick === true) {
            columnHeaders.push('base mean')
          }
          if (this.lfcseTick === true) {
            columnHeaders.push('lfcSE')
          }
          if (this.pTick === true) {
            columnHeaders.push('p value')
          }
          if (this.statTick === true) {
            columnHeaders.push('stat')
          }
          fileCounter = fileCounter - 1
        }
        // creating array to fit spaces of fileNames (unique elements only)
        // https://stackoverflow.com/questions/15052702/count-unique-elements-in-array-without-sorting
        let uniqueColumnHeaders = columnHeaders.filter(function (v, i) { return i === columnHeaders.lastIndexOf(v) })
        // console.log(uniqueColumnHeaders)
        // adding name only in the beginning of the column headers
        columnHeaders.unshift('name')
        this.columnHeaders = columnHeaders
        // console.log(columnHeaders)
        // creating 1st row with filenames, resetting fileCounter
        // first row with file names
        let topColumns = []
        fileCounter = 0
        while (fileCounter < this.selected.length) {
          topColumns.push(this.selected[fileCounter])
          // six empty cells will be added only for the first
          // filename, since the columnheader "name" appears only once
          let spaceArray1 = []
          let k = 0
          // "empty" cells to move fileName to the right position according to length of 2nd column with
          // categories chosen
          while (k < uniqueColumnHeaders.length) {
            spaceArray1.push(' ')
            k = k + 1
          }
          topColumns.push(spaceArray1)
          fileCounter = fileCounter + 1
        }
        // console.log(fileCounter)
        // removing 1st array element, which was shown as object[object] in csv
        // topColumns.shift()
        // top columns need to be flattened
        topColumns = [].concat.apply([], topColumns)
        this.topColumns = topColumns
        // console.log(topColumns)
        //
        //
        //
        // creating correct row data
        let rowData = []
        // rowData.push(topColumns)
        // rowData.push(columnHeaders)
        let oneEntry = []
        // let rowCounter = 0
        let store = this.$store.state.currentDGE
        // iterate data
        for (let geneName of store.geneNames) {
          let gene = store.getGene(geneName)
          let myName = gene.name
          oneEntry.push(myName)
          for (let i = 0; i < this.conditionPairList.length; i++) {
            let myPair = this.conditionPairList[i]
            // console.log('myPair') FOR LOOP!
            // console.log(myPair) FOR LOOP!
            let myData = gene.getDESEQ2Analysis(myPair)
            // console.log('myData') FOR LOOP
            // myData ist eine DEseq2 Analyse für ein Gen und ein Condition Pair
            // console.log(myData) wenn einkommentiert, dann innerhalb FOR LOOP, Achtung!
            let myMean = myData.baseMean
            let mylog2fold = myData.log2FoldChange
            let mylfcSE = myData.lfcSE
            let myStat = myData.stat
            let mypValue = myData.pValue
            let mypAdj = myData.pAdj
            if (this.roundedValues === true) {
              myMean = Math.round(myMean * 100) / 100
              mylog2fold = Math.round(mylog2fold * 100) / 100
              mylfcSE = Math.round(mylfcSE * 100) / 100
              myStat = Math.round(myStat * 100) / 100
              mypValue = Math.round(mypValue * 100) / 100
              mypAdj = Math.round(mypAdj * 100) / 100
            }
            // order is important
            // oneEntry.push(mylog2fold, mypAdj, myMean, mylfcSE, mypValue, myStat)
            if (this.log2Tick === true) {
              oneEntry.push(mylog2fold)
            }
            if (this.pAdjTick === true) {
              oneEntry.push(mypAdj)
            }
            if (this.meanTick === true) {
              oneEntry.push(myMean)
            }
            if (this.lfcseTick === true) {
              oneEntry.push((mylfcSE))
            }
            if (this.pTick === true) {
              oneEntry.push(mypValue)
            }
            if (this.statTick === true) {
              oneEntry.push(myStat)
            }
          }
          // so far: array of arrays with inner array = one entry (entries in correct order)
          rowData.push(oneEntry)
          oneEntry = []
        }
        this.rowData = rowData
        // console.log(rowData)
        // let rowDatasplit = rowData.map(e => e.join(',')).join('\n')
        // console.log(rowDatasplit)
      },
      makeSubData () {
        console.log('creating subData')
        let fileCounter = this.selected.length
        // creating columnHeaders
        let subColumnHeaders = []
        while (fileCounter > 0) {
          // columnHeaders.push('log2foldChange', 'p value (adjusted)', 'base mean', 'lfcSE', 'p value', 'stat')
          if (this.log2Tick === true) {
            subColumnHeaders.push('log2foldChange')
          }
          if (this.pAdjTick === true) {
            subColumnHeaders.push('p value (adjusted)')
          }
          if (this.meanTick === true) {
            subColumnHeaders.push('base mean')
          }
          if (this.lfcseTick === true) {
            subColumnHeaders.push('lfcSE')
          }
          if (this.pTick === true) {
            subColumnHeaders.push('p value')
          }
          if (this.statTick === true) {
            subColumnHeaders.push('stat')
          }
          fileCounter = fileCounter - 1
        }
        // creating array to fit spaces of fileNames (unique elements only)
        // https://stackoverflow.com/questions/15052702/count-unique-elements-in-array-without-sorting
        let uniqueColumnHeaders = subColumnHeaders.filter(function (v, i) { return i === subColumnHeaders.lastIndexOf(v) })
        // console.log(uniqueColumnHeaders)
        // adding name only in the beginning of the column headers
        subColumnHeaders.unshift('name')
        this.subColumnHeaders = subColumnHeaders
        // console.log(columnHeaders)
        // creating 1st row with filenames, resetting fileCounter
        // first row with file names
        let subTopColumns = []
        fileCounter = 0
        while (fileCounter < this.selected.length) {
          subTopColumns.push(this.selected[fileCounter])
          // six empty cells will be added only for the first
          // filename, since the columnheader "name" appears only once
          let spaceArray1 = []
          let k = 0
          // "empty" cells to move fileName to the right position according to length of 2nd column with
          // categories chosen
          while (k < uniqueColumnHeaders.length) {
            spaceArray1.push(' ')
            k = k + 1
          }
          subTopColumns.push(spaceArray1)
          fileCounter = fileCounter + 1
        }
        // console.log(fileCounter)
        // removing 1st array element, which was shown as object[object] in csv
        // topColumns.shift()
        // top columns need to be flattened
        subTopColumns = [].concat.apply([], subTopColumns)
        this.subTopColumns = subTopColumns
        // console.log(topColumns)
        //
        //
        //
        // creating correct row data
        let subRowData = []
        // rowData.push(topColumns)
        // rowData.push(columnHeaders)
        let oneEntry = []
        // let rowCounter = 0
        let store = this.$store.state.subDGE
        // iterate data
        for (let geneName of store.geneNames) {
          let gene = store.getGene(geneName)
          let myName = gene.name
          oneEntry.push(myName)
          for (let i = 0; i < this.conditionPairList.length; i++) {
            let myPair = this.conditionPairList[i]
            // console.log('myPair') FOR LOOP!
            // console.log(myPair) FOR LOOP!
            let myData = gene.getDESEQ2Analysis(myPair)
            // console.log('myData') FOR LOOP
            // myData ist eine DEseq2 Analyse für ein Gen und ein Condition Pair
            // console.log(myData) wenn einkommentiert, dann innerhalb FOR LOOP, Achtung!
            let myMean = myData.baseMean
            let mylog2fold = myData.log2FoldChange
            let mylfcSE = myData.lfcSE
            let myStat = myData.stat
            let mypValue = myData.pValue
            let mypAdj = myData.pAdj
            if (this.roundedValues === true) {
              myMean = Math.round(myMean * 100) / 100
              mylog2fold = Math.round(mylog2fold * 100) / 100
              mylfcSE = Math.round(mylfcSE * 100) / 100
              myStat = Math.round(myStat * 100) / 100
              mypValue = Math.round(mypValue * 100) / 100
              mypAdj = Math.round(mypAdj * 100) / 100
            }
            // order is important
            // oneEntry.push(mylog2fold, mypAdj, myMean, mylfcSE, mypValue, myStat)
            if (this.log2Tick === true) {
              oneEntry.push(mylog2fold)
            }
            if (this.pAdjTick === true) {
              oneEntry.push(mypAdj)
            }
            if (this.meanTick === true) {
              oneEntry.push(myMean)
            }
            if (this.lfcseTick === true) {
              oneEntry.push((mylfcSE))
            }
            if (this.pTick === true) {
              oneEntry.push(mypValue)
            }
            if (this.statTick === true) {
              oneEntry.push(myStat)
            }
          }
          // so far: array of arrays with inner array = one entry (entries in correct order)
          subRowData.push(oneEntry)
          oneEntry = []
        }
        this.subRowData = subRowData
        // console.log(rowData)
        // let rowDatasplit = rowData.map(e => e.join(',')).join('\n')
        // console.log(rowDatasplit)
      },
      // toggling changes affecting data and recalculation of data
      toggleRoundingChange () {
        this.roundedValues = false
      },
      toggleLog2Change () {
        this.log2Tick = false
        this.makeCurrentData()
        this.makeSubData()
      },
      togglePadjChange () {
        this.pAdjTick = false
        this.makeCurrentData()
        this.makeSubData()
      },
      toggleMeanChange () {
        this.meanTick = false
        this.makeCurrentData()
        this.makeSubData()
      },
      toggleLFCSEchange () {
        this.lfcseTick = false
        this.makeCurrentData()
        this.makeSubData()
      },
      togglePchange () {
        this.pTick = false
        this.makeCurrentData()
        this.makeSubData()
      },
      toggleStatChange () {
        this.statTick = false
        this.makeCurrentData()
        this.makeSubData()
      },
      downloadCSV () {
        // for not appending to the already downloaded (each click made 1 header more etc)
        this.makeCurrentData()
        // expression to add row information taken from:
        // https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
        // to write csv, one 1D big array is needed. In order to give row info, we need newlines between each entry (inner array)
        let csvData = this.rowData
        let csvTops = this.topColumns
        let csvHeaders = this.columnHeaders
        csvData.unshift(csvHeaders)
        csvData.unshift(csvTops)
        let csvContent = csvData.map(e => e.join(',')).join('\n')
        // function to download csv taken from:
        // https://stackoverflow.com/questions/23301467/javascript-exporting-large-text-csv-file-crashes-google-chrome
        function downloadFile (data, fileName) {
          let csvData = data
          let blob = new Blob([csvData], {type: 'application/csv;charset=utf-8;'})
          if (window.navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, fileName)
          } else {
            let link = document.createElement('a')
            let csvUrl = URL.createObjectURL(blob)
            link.href = csvUrl
            link.style = 'invisibility: hidden'
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
        }

        downloadFile(csvContent, 'testDeseqOverview.csv')
        console.log('end of download function')
      },
      downloadSub () {
        // for not appending to the already downloaded (each click made 1 header more etc)
        this.makeSubData()
        // expression to add row information taken from:
        // https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
        // to write csv, one 1D big array is needed. In order to give row info, we need newlines between each entry (inner array)
        let csvData = this.subRowData
        let csvTops = this.subTopColumns
        let csvHeaders = this.subColumnHeaders
        csvData.unshift(csvHeaders)
        csvData.unshift(csvTops)
        // flatten array of arrays at commas, add newlines between the single innere arrays (which are not present anymore)
        let csvContent = csvData.map(e => e.join(',')).join('\n')
        // function to download csv taken from:
        // https://stackoverflow.com/questions/23301467/javascript-exporting-large-text-csv-file-crashes-google-chrome
        function downloadFile (data, fileName) {
          let csvData = data
          let blob = new Blob([csvData], {type: 'application/csv;charset=utf-8;'})
          if (window.navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, fileName)
          } else {
            let link = document.createElement('a')
            let csvUrl = URL.createObjectURL(blob)
            link.href = csvUrl
            link.style = 'invisibility: hidden'
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
        }
        downloadFile(csvContent, 'testDeseqOverview.csv')
        console.log('end of subset download function')
      }
    },
    computed: {
      faDownload () {
        return faDownload
      }
    },
    beforeMount () {
      console.log('>>> start')
      this.setButtonDisable1()
      this.setButtonDisable2()
      this.getMyConditions()
      console.log(this.options)
      this.getSelected()
      this.getConditionPairs()
      console.log('beforeMount')
      console.log(this.selected)
      this.makeCurrentData()
      this.makeSubData()
    },
    updated () {
      this.setButtonDisable1()
      this.setButtonDisable2()
      this.getSelected()
      this.getConditionPairs()
      // console.log(this.selected)
      // console.log(this.conditionPairList)
      console.log('updated')
    }
  }
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css">
</style>
