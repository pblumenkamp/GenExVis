<template>
  <div style="width: 100%; height: 600px">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
    <div style="text-align: center">
      <h1>DESeq2 - Overview</h1>
    </div>

    <div style="clear: both;"></div>

    <div>
      <table style="width: 100%; text-align: center">
        <tr>
          <td style="width:25%;">
            <div>Selected / Total</div>
            <div style="font-size:2.5rem;">{{ rowAmount }} / <b>{{ rowCount }}</b></div>
          </td>
          <td>
            <div style="padding: 0.25rem;" class="btn-group btn-group-sm">
              <button type="button" class="btn btn-default" @click="toggleTableReset()">Reset Table</button>
              <button type="button" class="btn btn-default" @click="gridOptions.api.selectAllFiltered()">Select All</button>
              <button type="button" class="btn btn-default" @click="gridOptions.api.deselectAll()">Clear Selection</button>
              <button type="button" class="btn btn-primary" @click="toggleSubsetCreation()">Create A Subset</button>
              <button type="button" class="btn btn-dark btn-sm" @click="addGene()">+ Add Genes</button>
            </div>
          </td>
          <td align="left">
            <div>
              <input @keyup="onQuickFilterChanged" type="text" id="quickFilterInput" placeholder="Type text to filter..."/>
            </div>
            <div>
              <b-form-checkbox v-model="roundedValues"
                               @change="toggleRoundingChange">
                Rounded Values
              </b-form-checkbox>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div style="clear: both;"></div>
    <ag-grid-vue style="width: 100%; height: 500px;" class="ag-theme-balham" align="left"
                 :gridOptions="gridOptions"
                 :columnDefs="columnDefs"
                 :rowData="rowData"
                 :showToolPanel="showToolPanel"

                 :rowHeight=30
                 :enableColResize="true"
                 :enableSorting="true"
                 :enableFilter="true"
                 :groupHeaders="true"

                 :modelUpdated="onModelUpdated"
                 :selectionChanged="onSelectionChanged"
                 :gridReady="onReady"/>
    <div>
      <b-card class="currentlychosen">
        Currently chosen:
        <p id="selectedRows"> </p>
      </b-card>
    </div>
  </div>
</template>

<script>
  import {ADD_STRUC} from '../../store/mutation_constants'
  import {SET_SUBDGE} from '../../store/action_constants'

  import {AgGridVue} from 'ag-grid-vue'
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'

  export default {
    data () {
      return {
        roundedValues: true,
        gridOptions: null,
        columnDefs: null,
        rowData: null,
        showToolPanel: false,
        log2foldlist: [],
        log2foldmin: 0,
        log2foldmax: 0,
        rowCount: null,
        rowAmount: 0,
        setRowHeight: 500,
        nameDict: {
          '_log2FoldChange': 'log2 fold change',
          '_pAdj': 'p value (adjusted)',
          '_baseMean': 'base mean',
          '_lfcSE': 'lfcSE',
          '_pValue': 'p value',
          '_stat': 'stat'
        },
        strucStorage: null
      }
    },
    components: {
      'ag-grid-vue': AgGridVue,
      FontAwesomeIcon
    },
    methods: {
      addGene () {
        let genesToAdd = this.gridOptions.api.getSelectedRows()
        let geneList = []
        let currentSubDGE = this.$store.state.subDGE.geneNames
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
      },
      checkStorage () {
        let mainStrucStore = this.$store.state.strucStore
        if (mainStrucStore === null) {
          this.createStrucStorage()
        } else {
          this.strucStorage = mainStrucStore
          // createColumnDefs takes non-null strucStorage from previous visit
        }
      },
      createStrucStorage () {
        let fileStore = this.$store.state.deseqlist
        let fileAmount = fileStore.length

        let strucArray = []
        strucArray.push([undefined, ['Name', 'name']])
        for (let i = 1; i < fileAmount + 1; i++) {
          let childArray = []
          let headerName = fileStore[i - 1]
          for (let entry in this.nameDict) {
            let fieldArray = [this.nameDict[entry], entry + '_' + i]
            childArray.push(fieldArray)
          }
          strucArray.push([headerName, childArray])
        }
        this.strucStorage = strucArray
      },
      createRowData () {
        const rowData = []
        let store = this.$store.state.dgeData
        for (let geneName of store.geneNames) {
          let gene = store.getGene(geneName)
          let dict = {}
          dict.name = gene.name
          let analysesList = gene.deseq2Analyses
          let analysescounter = 1
          for (let analysis of analysesList) {
            for (let element in analysis) {
              let currentcell = analysis[element]
              if (element !== '_conditions' && isNaN(currentcell)) {
                currentcell = null
              } else {
                if (element === '_log2FoldChange') {
                  this.log2foldlist.push(currentcell)
                }
              }
              dict[element + '_' + analysescounter] = currentcell
            }
            analysescounter = analysescounter + 1
          }
          rowData.push(dict)
        }
        this.rowData = rowData
      },
      minmaxdefine () {
        let log2foldlist = this.log2foldlist
        let min = Math.min(...log2foldlist)
        let max = Math.max(...log2foldlist)
        this.log2foldmin = min
        this.log2foldmax = max
      },
      createColumnDefs () {
        const columnDefs = []
        let strucStorage = this.strucStorage
        for (let file of strucStorage) {
          if (file[0] === undefined) {
            columnDefs.push(this.nameColumn())
          } else {
            let openBool = true
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
          let entryDict = {
            headerName: column[0],
            field: column[1],
            width: 150,
            filter: 'agNumberColumnFilter',
            columnGroupShow: showstate,
            valueFormatter: formattedValue,
            cellStyle: {textAlign: 'right'}
          }
          if (column[0] === 'log2 fold change') {
            entryDict['cellRenderer'] = this.percentCellRenderer
          }
          returnArray.push(entryDict)
          colCounter = colCounter + 1
        }
        return (returnArray)
      },
      roundingFormatter (number) {
        if (this.roundedValues === true) {
          if (number.colDef.headerName === 'p value' || number.colDef.headerName === 'p value (adjusted)') {
            try {
              return number.value.toExponential(2)
            } catch (err) {
              return null
            }
          } else {
            return this.returnRoundValue(number.value)
          }
        } else {
          return null
        }
      },
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
        div1.innerHTML = this.negotiateShowvalue(showvalue)
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
        }
      },
      negotiateShowvalue (showvalue) {
        if (this.roundedValues === true) {
          return this.returnRoundValue(showvalue)
        } else {
          return showvalue
        }
      },
      returnRoundValue (value) {
        return Math.round(value * 100) / 100
      },
      toggleRoundingChange () {
        this.roundedValues = false
        this.createRowData()
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
          // this.rowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString()
          this.rowCount = totalRows.toLocaleString()
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
          selectedRowsString.push(selectedRow.name)
        })
        let rowAmount = this.numberWithCommas(selectedRowsString.length)
        this.rowAmount = rowAmount
        document.querySelector('#selectedRows').innerHTML = selectedRowsString
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
            columnGroupOpened: '<i style="font-size:1.2rem;" class="fa fa-arrow-circle-right"/>',
            columnGroupClosed: '<i style="font-size:1.2rem;" class="fa fa-arrow-circle-left"/>'
          }
        }
      },
      readStructure () {
        let strucArray = []
        let columngroups = this.gridOptions.columnApi.getAllDisplayedColumnGroups()
        for (let entry of columngroups) {
          let childArray = []
          let fileName = entry.originalColumnGroup.colGroupDef.headerName
          let children = entry.children
          for (let child of children) {
            let fieldArray = [child.colDef.headerName, child.colDef.field]
            childArray.push(fieldArray)
          }
          strucArray.push([fileName, childArray])
        }
        this.$store.commit(ADD_STRUC, strucArray)
      }
    },
    beforeMount () {
      this.checkStorage()
      this.createRowData()
      this.minmaxdefine()
      this.createColumnDefs()
      this.insertGridOptions()
    },
    beforeDestroy () {
      this.readStructure()
    }
  }
</script>

<style scoped>
  rightAlign {
    text-align: right;
  }
  .currentlychosen {
    text-align: left;
    overflow-y: scroll;
    height: 10rem;
    padding: 1rem
  }
  label {
    font-weight: normal !important;
    text-align: right;
  }
  .btn-group button {
    border: 1px solid grey; /* Green border */
    padding: 10px 24px; /* Some padding */
    float: left; /* Float the buttons side by side */
  }
  /* Clear floats (clearfix hack) */
  .btn-group:after {
    content: "";
    clear: both;
    display: table;
  }
  /* Add a background color on hover */
  .btn-group button:hover {
    background-color: deepskyblue;
  }
  /* Breaking columns when screen gets too small */
  @media(max-width: 1500px) {
    td {
      display: table-row;
      text-align: center;
    }
  }
</style>
