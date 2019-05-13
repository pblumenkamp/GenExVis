<template>
  <div style="width: 100%; height: 600px">
    <div style="text-align: center">
      <h1>DESeq2 - Overview</h1>
    </div>

    <div style="clear: both;"></div>

    <div>
      <!-- Design selection -->
      <table style="height: 10rem; width: 100%; text-align: center; align-content: center"
             border="0px solid black">
        <tr>
          <td style="width: 15%">
            <b-card style="height: 100%; border: 0px solid lightslategray">
              <table align="center" border="0px solid black">
                <tr>
                  <td>
                    <i>themes</i>
                  </td>
                </tr>
                <tr style="height: 100%">
                  <td style="height: 100%">
                    <div class="btn-group-vertical basic-button" style="height: 100%">
                      <button type="button" class="btn btn-sm button-balham" @click="changeDesign('balham')">Balham</button>
                      <button type="button" class="btn btn-sm button-fresh" @click="changeDesign('fresh')">Fresh</button>
                      <button type="button" class="btn btn-sm button-balhamdark" @click="changeDesign('balham-dark')">Dark</button>
                      <button type="button" class="btn btn-sm button-blue" @click="changeDesign('blue')">Blue</button>
                    </div>
                  </td>
                </tr>
              </table>
            </b-card>
          </td>
          <!-- subset area -->
          <td style="width: 70%">
            <b-card style="height: 90%; border: 1px solid lightslategray">
              <table style="width:100%" border="0px solid black">
                <tr>
                  <td style="width: 40%; border: 1px solid gainsboro">
                    <div><a style="font-size:2.5rem" title="The currently chosen amount of genes">{{ rowChosenAmount }} / <b title="The total amount of genes">{{ rowTotalAmount }} </b></a></div>
                  </td>
                  <td style="width: 60%; border: 1px solid gainsboro">
                    <div id="currentlyChosen" class="currentlyChosen">
                      Currently chosen:
                      <p id="selectedRows"> </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <div style="padding: 0.25rem;" class="btn-group basic-button main-control">
                      <button title="Selects all genes" id="selectAllButton"
                              class="btn btn-default main-control-button" @click="gridOptions.api.selectAllFiltered()"> Select All </button>
                      <button title="Creates a new subset of the currently chosen genes" id="createSubsetButton"
                              class="btn btn-dark main-control-button" @click="toggleSubsetCreation()">Create Subset</button>
                      <button title="Adds a gene to a existing subset" id="addGenesButton"
                              class="btn btn-dark main-control-button" @click="addGene()">+ Add Genes</button>
                      <button title="Undoes the current selection of genes" id="deselectAllButton"
                              class="btn btn-default main-control-button" @click="gridOptions.api.deselectAll()">Clear Selection</button>
                    </div>
                  </td>
                </tr>
              </table>
            </b-card>
          </td>
          <!-- Area right of subset table: Filter bar, view change (rounded), reset table button -->
          <td style="width: 15%" align="left">
            <b-card style="height: 100%; border: 0px solid lightslategray">
              <div>
                <div>
                  <input @keyup="onQuickFilterChanged" type="text" id="quickFilterInput" placeholder="Type text to filter..."/>
                  <hr>
                  <b-form-checkbox v-model="roundedValues"
                                   @change="toggleRoundingChange">
                    Rounded Values
                  </b-form-checkbox>
                </div>
                <hr>
                <div class="basic-button">
                  <button class="btn-xl basic-button"
                          title="Resets the table, with all columns and column groups"
                          @click="toggleTableReset()">
                    <font-awesome-icon :icon="faUndoAlt"></font-awesome-icon> Reset Table
                  </button>
                </div>
              </div>
            </b-card>
          </td>
        </tr>
      </table>
    </div><p></p>

    <div v-if="this.excessLength === false">
      <ag-grid-vue id="main-table" class="main-table ag-theme-balham" align="left"
                   :gridOptions="gridOptions"
                   :columnDefs="columnDefs"
                   :rowData="rowData"

                   :groupHeaders="true"

                   @modelUpdated="onModelUpdated"
                   @selectionChanged="onSelectionChanged"
                   @columnVisible="onVisionChanged"
                   @columnMoved="onPositionChanged"
                   @gridReady="onReady"
      />
    </div>
    <div v-else class="main-table" >
      <br>
      <table width="100%">
        <tr align="center">
          <th></th>
          <th><h2>Unfortunately the table was too large to display</h2></th>
          <th></th>
        </tr>
        <tr align="center">
          <th></th>
          <th><h3>You can download the full table below</h3></th>
          <th></th>
        </tr>
        <tr align="center">
          <th></th>
          <th>
            <table layout="fixed">
              <td width="33%">
                <button
                  id = 'downloadCSV'
                  class="btn btn-dark btn-sm"
                  title="Download table as .csv"
                  @click="downloadCSV"
                  style = "width: 100%"
                >
                  <font-awesome-icon :icon="faDownload"></font-awesome-icon> Download .csv
                </button>
              </td>
              <td width="33%">
              </td>
              <td width="33%">
                <div>
                  <b-form-checkbox v-model="roundedValues2"
                                   @change="toggleRoundingChange2">
                    Rounded Values
                  </b-form-checkbox>
                </div>
              </td>
            </table>
          </th>
          <th></th>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
  import {ADD_STRUC} from '../../store/mutation_constants'
  import {SET_SUBDGE} from '../../store/action_constants'
  import {AgGridVue} from 'ag-grid-vue'

  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faUndoAlt, faDownload} from '@fortawesome/free-solid-svg-icons'

  export default {
    data () {
      return {
        roundedValues2: true,
        roundedValues: true,
        gridOptions: null,
        columnDefs: null,
        excessLength: false,
        rowData: null,
        log2foldlist: [],
        log2foldmin: 0,
        log2foldmax: 0,
        rowTotalAmount: null,
        rowChosenAmount: 0,
        nameDict: {
          '_log2FoldChange': 'log2 fold change',
          '_pAdj': 'p value (adjusted)',
          '_baseMean': 'base mean',
          '_lfcSE': 'lfcSE',
          '_pValue': 'p value',
          '_stat': 'stat'
        },
        design: 'main-table ag-theme-balham',
        strucStorage: null
      }
    },
    components: {
      'ag-grid-vue': AgGridVue,
      FontAwesomeIcon
    },
    methods: {
      changeDesign (element) {
        let design = 'main-table ag-theme-' + element
        document.getElementById('main-table').className = design
        this.design = design
      },
      addGene () {
        let genesToAdd = this.gridOptions.api.getSelectedRows()
        let geneList = []
        let currentSubDGE = this.$store.state.subDGE.geneNames
        if (currentSubDGE.size === 0) {
          this.toggleSubsetCreation()
        } else {
          for (let entry of currentSubDGE) {
            let check = true
            for (let coentry of genesToAdd) {
              if (entry === coentry) {
                check = false
              } else {
                geneList.push(coentry.name)
              }
            }
            if (check === true) {
              geneList.push(entry)
            }
          }
          geneList.sort()
          this.$store.dispatch(SET_SUBDGE, {geneList: geneList})
        }
      },
      checkGeneAmount () {
        console.log('checkGeneAmount')
        let fileList = this.$store.state.deseqlist.length
        let fileLength = this.$store.state.dgeData.length
        this.rowTotalAmount = fileLength

        console.log(fileList, fileLength)

        if (fileList * 6 * fileLength > 2000000) {
          this.excessLength = true
        }
      },
      checkStorage () {
        let strucStorage = this.$store.state.strucStorage
        if (strucStorage === null) {
          this.createStrucStorage()
        } else {
          this.strucStorage = strucStorage
          // createColumnDefs takes non-null strucStorage from previous visit
        }
      },
      createStrucStorage () {
        let fileStore = this.$store.state.deseqlist
        let fileAmount = fileStore.length

        let strucStorage = {}
        let strucArray = []
        strucArray.push([undefined, ['Name', 'name']])
        for (let i = 1; i < fileAmount + 1; i++) {
          let childArray = []
          let headerName = fileStore[i - 1]
          let openByDefault = true
          for (let entry in this.nameDict) {
            let fieldArray = [this.nameDict[entry], entry + '_' + i]
            childArray.push(fieldArray)
          }
          strucArray.push([headerName, childArray, openByDefault])
        }
        strucStorage['data'] = strucArray
        strucStorage['design'] = 'main-table ag-theme-balham'
        this.strucStorage = strucStorage
      },
      createRowData () {
        console.log('CREATE ROW DATA:')
        const rowData = []
        let store = this.$store.state.dgeData

        let rowCounter = 0

        for (let geneName of store.geneNames) {
          if (rowCounter > 0) {
            let gene = store.getGene(geneName)
            let dict = {}
            dict.name = gene.name
            let analysescounter = 1
            for (let analysis of gene.deseq2Analyses) {
              for (let element in analysis) {
                let currentcell = analysis[element]
                if (element !== '_conditions' && isNaN(currentcell)) {
                  currentcell = null
                } else {
                  if (element === '_log2FoldChange') {
                    this.log2foldlist.push(currentcell)
                  }
                }
                let elementValue = element + '_' + analysescounter
                dict[elementValue] = currentcell
              }
              analysescounter = analysescounter + 1
            }
            rowData.push(dict)
          }
          rowCounter = rowCounter + 1
        }

        console.log(rowData)
        this.rowData = rowData
      },
      // visualisation of log2FoldChange
      minmaxdefine () {
        let log2foldlist = this.log2foldlist
        let min = Math.min(...log2foldlist)
        let max = Math.max(...log2foldlist)
        this.log2foldmin = min
        this.log2foldmax = max
      },
      chooseDesign () {
        // designStorage is simply the string name of the design
        let designStorage = this.strucStorage['design']
        document.getElementById('main-table').className = designStorage
      },
      createColumnDefs () {
        const columnDefs = []
        let strucStorage = this.strucStorage['data']
        for (let file of strucStorage) {
          if (file[0] === undefined || file[0] === 'name') {
            columnDefs.push(this.nameColumn())
          } else {
            let openBool = file[2]
            let datadict = {
              headerName: file[0],
              openByDefault: openBool,
              children: this.createChildren(file[1])
            }
            columnDefs.push(datadict)
          }
        }
        this.columnDefs = columnDefs
      },
      nameColumn () {
        // returns the first - always same - name column
        let dataDict = {
          headerName: 'Name',
          field: 'name',
          width: 150,
          hide: false,
          pinned: false
        }
        return (dataDict)
      },
      createChildren (columnArray) {
        let returnArray = []
        let colCounter = 0
        for (let column of columnArray) {
          let showstate = null
          if (colCounter > 1) { showstate = 'closed' }
          let formattedValue = this.roundingFormatter
          console.log('   !! ' + formattedValue)
          let entryDict = {
            headerName: column[0],
            field: column[1],
            width: 150,
            filter: 'agNumberColumnFilter',
            columnGroupShow: showstate,
            cellStyle: {textAlign: 'right'}
          }
          if (column[0] === 'log2 fold change') {
            entryDict['cellRenderer'] = this.percentCellRenderer
          } else {
            entryDict['cellRenderer'] = this.negotiateShowValue
          }
          returnArray.push(entryDict)
          colCounter = colCounter + 1
        }
        return (returnArray)
      },
      roundingFormatter (number) {
        console.log('is called')
        let testValue = number.value + '€'

        return testValue

        // if (this.roundedValues === true) {
        //   if (number.colDef.headerName === 'p value' || number.colDef.headerName === 'p value (adjusted)') {
        //     if (number.value !== null) {
        //       return (number.value.toExponential(2))
        //     } else {
        //       return (null)
        //     }
        //   } else {
        //     return (this.returnRoundValue(number.value))
        //   }
        // } else {
        //   return (null)
        // }
        // return null
      },
      negotiateShowValue (params) {
        let value = params.value
        if (value === null || value === 0) {
          // real 0s are ag-grid-conform saved as string text
          // Therefore, int 0s are "wrong"
          return ('no data')
        } else {
          if (params.colDef.headerName === 'p value' || params.colDef.headerName === 'p value (adjusted)') {
            return (this.returnExponentialValue(value))
          } else {
            return (this.returnRoundedValue(value))
          }
        }
      },
      // visualisation of log2FoldChange
      percentCellRenderer (params) {
        let value = params.value
        let showvalue = params.value

        let min = this.log2foldmin
        let max = this.log2foldmax

        let table = document.createElement('table')
        table.align = 'center'
        table.style.width = 100 + '%'
        table.style.height = 100 + '%'
        let firstrow = document.createElement('tr')
        // all 4 parts (2 bars, 2 spaces)
        let leftbar = document.createElement('td')
        let rightbar = document.createElement('td')
        let leftpush = document.createElement('td')
        let rightpush = document.createElement('td')
        //
        leftbar.style.padding = 0
        rightbar.style.padding = 0
        leftpush.style.padding = 0
        rightpush.style.padding = 0

        if (value < 0) {
          let percent = (value * 50) / min
          leftpush.style.width = (50 - percent) + '%'
          leftbar.style.width = percent + '%'
          rightbar.style.width = 25 + '%'
          rightpush.style.width = 25 + '%'
          leftbar.style.backgroundColor = 'rgba(238, 16, 16, 0.4)'
        } else {
          let percent = (value * 50) / max
          leftpush.style.width = 25 + '%'
          leftbar.style.width = 25 + '%'
          rightbar.style.width = percent + '%'
          rightpush.style.width = (50 - percent) + '%'
          rightbar.style.backgroundColor = 'rgba(16, 16, 238, 0.4)'
        }

        firstrow.append(leftpush, leftbar, rightbar, rightpush)
        table.append(firstrow)

        let div1 = document.createElement('div')
        let div2 = document.createElement('div')
        div1.id = 'child_1'
        div2.id = 'child_2'
        // o!
        div1.style.position = 'absolute'
        div2.style.position = 'absolute'
        div2.style.width = 100 + '%'
        div2.style.height = 100 + '%'
        div2.align = 'center'
        // x!
        div1.innerHTML = this.returnRoundedValue(showvalue)
        div1.style.cssText = 'text-align:right'
        div2.append(table)
        let parent = document.createElement('div')
        parent.id = 'parent'
        // o!
        parent.style.position = 'relative'
        parent.style.width = 100 + '%'
        parent.style.height = 100 + '%'
        parent.align = 'center'
        // x!
        parent.append(div2)
        parent.append(div1)
        if (value !== null) {
          return parent
        } else {
          return ('no data')
        }
      },
      returnRoundedValue (rawValue) {
        if (this.roundedValues === true) {
          return this.returnRoundValue(rawValue)
        } else {
          return rawValue
        }
      },
      returnExponentialValue (rawValue) {
        if (this.roundedValues === true) {
          return rawValue.toExponential(2)
        } else {
          return rawValue
        }
      },
      returnRoundValue (value) {
        return Math.round(value * 100) / 100
      },
      toggleRoundingChange () {
        this.roundedValues = false
        this.createRowData()
      },
      toggleRoundingChange2 () {
        this.roundedValues2 = false
      },
      toggleTableReset () {
        this.createStrucStorage()
        this.createColumnDefs()
      },
      toggleSubsetCreation () {
        let temparray = []
        let genestaken = this.gridOptions.api.getSelectedRows()
        for (let element of genestaken) {
          temparray.push(element.name)
        }
        this.$store.dispatch(SET_SUBDGE, {geneList: temparray})
      },
      pad (num, totalStringSize) {
        let asString = num + ''
        while (asString.length < totalStringSize) asString = '0' + asString
        return asString
      },
      calculateRowCount () {
        if (this.gridOptions.api && this.rowData) {
          let totalRows = this.rowData.length
          // let model = this.gridOptions.api.getModel()
          // let processedRows = model.getRowCount()
          // this.rowTotalAmount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString()
          // this.rowTotalAmount = totalRows.toLocaleString()
          this.rowTotalAmount = totalRows
        }
      },
      onModelUpdated () {
        this.calculateRowCount()
      },
      onReady () {
        this.calculateRowCount()
      },
      onSelectionChanged () {
        let selectedRows = this.gridOptions.api.getSelectedRows()
        let selectedRowsString = []
        selectedRows.forEach(function (selectedRow) {
          selectedRowsString.push(' ' + selectedRow.name)
        })
        let rawRowAmount = selectedRowsString.length
        let rowChosenAmount = this.numberWithCommas(rawRowAmount)
        this.rowChosenAmount = rowChosenAmount
        this.selectionNegotiator(rawRowAmount)
        document.querySelector('#selectedRows').innerHTML = selectedRowsString
      },
      selectionNegotiator (rowChosenAmount) {
        // select all: id="selectAllButton"; clear selection: id="deselectAllButton"; create a subset: id="createSubsetButton"; add genes: id="addGenesButton"
        if (rowChosenAmount === this.rowTotalAmount) {
          document.getElementById('selectAllButton').disabled = true
          document.getElementById('deselectAllButton').disabled = false
          document.getElementById('createSubsetButton').disabled = false
          document.getElementById('addGenesButton').disabled = false
        } else if (rowChosenAmount < this.rowTotalAmount && rowChosenAmount !== 0) {
          document.getElementById('selectAllButton').disabled = false
          document.getElementById('deselectAllButton').disabled = false
          document.getElementById('createSubsetButton').disabled = false
          document.getElementById('addGenesButton').disabled = false
        } else if (rowChosenAmount === 0) {
          document.getElementById('selectAllButton').disabled = false
          document.getElementById('deselectAllButton').disabled = true
          document.getElementById('createSubsetButton').disabled = true
          document.getElementById('addGenesButton').disabled = true
        }
      },
      onVisionChanged () {
        this.readStructure()
        this.createColumnDefs()
      },
      onPositionChanged () {
        this.onVisionChanged()
      },
      numberWithCommas (number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      },
      onQuickFilterChanged (event) {
        this.gridOptions.api.setQuickFilter(event.target.value)
      },
      insertGridOptions () {
        this.gridOptions = {
          rowSelection: 'multiple',
          rowMultiSelectWithClick: true,
          suppressPropertyNamesCheck: true,
          icons: {
            columnGroupOpened: '<i style="font-size:1.2rem;" class="fa fa-arrow-circle-left"/>',
            columnGroupClosed: '<i style="font-size:1.2rem;" class="fa fa-arrow-circle-right"/>'
          },
          rowHeight: 30,
          defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true
          }
        }
      },
      readStructure () {
        let strucStorage = {}
        let strucArray = []
        let columngroups = this.gridOptions.columnApi.getAllDisplayedColumnGroups()
        for (let entry of columngroups) {
          let childArray = []
          let fileName = entry.originalColumnGroup.colGroupDef.headerName
          let openByDefault = entry.originalColumnGroup.expanded
          let children = entry.children
          for (let child of children) {
            let fieldArray = [child.colDef.headerName, child.colDef.field]
            childArray.push(fieldArray)
          }
          strucArray.push([fileName, childArray, openByDefault])
        }
        strucStorage['data'] = strucArray
        strucStorage['design'] = this.design
        this.strucStorage = strucStorage
      },
      pushStructure () {
        let strucStorage = this.strucStorage
        this.$store.commit(ADD_STRUC, strucStorage)
      },
      // Miri
      downloadCSV () {
        // first row with file names
        let topColumns = []
        let fileCounter = 0
        let fileList = this.$store.state.deseqlist
        for (let file of fileList) {
          if (file[0] === undefined || file[0] === 'name') {
            topColumns.push(this.nameColumn())
          } else {
            topColumns.push(file)
            // six empty cells will be added only for the first
            // filename, since the columnheader "name" appears only once
            if (fileCounter < 1) {
              // console.log(this.$store.state.deseqlist)
              // "empty" cells to move fileName to the right position
              topColumns.push(' ', ' ', ' ', ' ', ' ', ' ')
            } else {
              // console.log(this.$store.state.deseqlist)
              // "empty" cells to move filenames above column headers to right pos
              topColumns.push(' ', ' ', ' ', ' ', ' ')
            }
          }
          fileCounter = fileCounter + 1
        }
        console.log(fileCounter)
        // removing 1st array element, which was shown as object[object] in csv
        // topColumns.shift()
        console.log(topColumns)
        // creating columnHeaders
        let columnHeaders = []
        while (fileCounter > 0) {
          columnHeaders.push('log2foldChange', 'p value (adjusted)', 'base mean', 'lfcSE', 'p value', 'stat')
          fileCounter = fileCounter - 1
        }
        // adding name only in the beginning of the column headers
        columnHeaders.unshift('name')
        console.log(columnHeaders)
        // creating correct row data
        let rowData = []
        rowData.push(topColumns)
        rowData.push(columnHeaders)
        let oneEntry = []
        // let rowCounter = 0
        let store = this.$store.state.currentDGE
        // iterate data
        for (let geneName of store.geneNames) {
          let gene = store.getGene(geneName)
          let myName = gene.name
          oneEntry.push(myName)
          for (let analysis of gene.deseq2Analyses) {
            let myMean = analysis.baseMean
            let mylog2fold = analysis.log2FoldChange
            let mylfcSE = analysis.lfcSE
            let myStat = analysis.stat
            let mypValue = analysis.pValue
            let mypAdj = analysis.pAdj
            if (this.roundedValues2 === true) {
              myMean = Math.round(myMean * 100) / 100
              mylog2fold = Math.round(mylog2fold * 100) / 100
              mylfcSE = Math.round(mylfcSE * 100) / 100
              myStat = Math.round(myStat * 100) / 100
              mypValue = Math.round(mypValue * 100) / 100
              mypAdj = Math.round(mypAdj * 100) / 100
            }
            // order is important
            oneEntry.push(mylog2fold, mypAdj, myMean, mylfcSE, mypValue, myStat)
          }
          // so far: array of arrays with inner array = one entry (entries in correct order)
          rowData.push(oneEntry)
          oneEntry = []
        }
        console.log(rowData)
        // expression to add row information taken from:
        // https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
        // to write csv, one 1D big array is needed. In order to give row info, we need newlines between each entry (inner array)
        let csvContent = rowData.map(e => e.join(',')).join('\n')
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
      }
    },
    computed: {
      faUndoAlt () {
        return faUndoAlt
      },
      faDownload () {
        return faDownload
      }
    },
    beforeMount () {
      this.checkGeneAmount()

      if (this.excessLength === false) {
        this.checkStorage()
        this.createRowData()
        this.minmaxdefine()
        this.createColumnDefs()
        this.insertGridOptions()
      }
    },
    mounted () {
      if (this.excessLength === false) {
        this.selectionNegotiator(0)
        this.chooseDesign()
      }
    },
    beforeDestroy () {
      if (this.excessLength === false) {
        this.readStructure()
        this.pushStructure()
      }
    }
  }
</script>

<style scoped>
  label {
    font-weight: normal !important;
    text-align: right;
  }
  button {
    border: 1px solid grey; /* Green border */
    padding: 10px 24px; /* Some padding */
    float: left; /* Float the buttons side by side */
  }
  .currentlyChosen {
    text-align: left;
    overflow-y: scroll;
    height: 6rem;
    width:  100%;
    padding: 1rem;
  }
  .main-table {
    /*adjustments for the main ag-grid table*/
    border: 1px solid dimgrey;
    width: 100%;
    height: 30rem;
  }
  .button-balham {
    background-color: lightgrey;
    height: 2rem;
  }
  .button-fresh {
    background-color: grey;
    height: 2rem;
  }
  .button-balhamdark {
    background-color: darkslategrey;
    height: 2rem;
    color: white;
  }
  .button-blue {
    background-color: cornflowerblue;
    height: 2rem;
  }
  .btn-group:after {
    content: "";
    clear: both;
    display: table;
  }
  .btn-sm {
    width: 100%;
  }
  .main-control-button {
    width: 11rem
  }
  /* Adds a background color on hover */
  .basic-button button:hover:enabled {
    background-color: deepskyblue;
  }

  /* Miri centered download button for .xlsx
  position relative to parent element*/
  /*.centerButton {
    position: relative;
    left: 45%;
  }*/
  @media(max-width: 1500px) {
    td {
      display: table-row;
      text-align: center;
    }
    .main-control-button {
      width: 8.5rem;
    }
  }
</style>
