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
              <button type="button" class="btn btn-default" @click="setback()">Reset Table</button>
              <button type="button" class="btn btn-default" @click="gridOptions.api.selectAllFiltered()">Select All</button>
              <button type="button" class="btn btn-default" @click="gridOptions.api.deselectAll()">Clear Selection</button>
              <button type="button" class="btn btn-primary" @click="fillthebasket()">Create A Subset</button>
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
                 :gridReady="onReady"

                 :columnMoved="positionchange"
                 :columnVisible="true"
                 :columnGroupOpened="true"/>
    <div>
      <b-card class="currentlychosen">
        Currently chosen:
        <p id="selectedRows"> </p>
      </b-card>
    </div>
  </div>
</template>

<script>
  import {SET_SUBDGE} from '../../store/action_constants'
  import {ADD_VISION, ADD_POSITION} from '../../store/mutation_constants'

  import {AgGridVue} from 'ag-grid-vue'
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'

  export default {
    data () {
      return {
        roundedValues: false,
        gridOptions: null,
        columnDefs: null,
        rowData: null,
        showToolPanel: false,
        log2foldlist: [],
        log2foldmin: 0,
        log2foldmax: 0,
        // columnGroupOpened: true,
        rowCount: null,
        rowAmount: 0,
        setRowHeight: 500,
        namedict: {
          '_log2FoldChange': 'log2 fold change',
          '_pAdj': 'p value (adjusted)',
          '_baseMean': 'base mean',
          '_lfcSE': 'lfcSE',
          '_pValue': 'p value',
          '_stat': 'stat'
        },
        tagdict: {
          'log2 fold change': '_log2FoldChange',
          'p value (adjusted)': '_pAdj',
          'base mean': '_baseMean',
          'lfcSE': '_lfcSE',
          'p value': '_pValue',
          'stat': '_stat'
        },
        visiondict: [],
        positiondict: []
      }
    },
    components: {
      'ag-grid-vue': AgGridVue,
      FontAwesomeIcon
    },
    methods: {
      toggleRoundingChange () {
        this.roundedValues = false
        this.createRowData()
      },
      setback () {
        this.$store.commit(ADD_POSITION, null)
        this.$store.commit(ADD_VISION, null)
        this.createColumnDefs()
      },
      createstoredict () {
        let basics = ['_log2FoldChange', '_pAdj', '_baseMean', '_lfcSE', '_pValue', '_stat']
        let visionarray = []
        let positionarray = []
        let filestore = this.$store.state.deseqlist
        let fileamount = filestore.length
        for (let i = 0; i < fileamount + 1; i++) {
          let visiondict = {}
          let positiondict = {}
          for (let entry of basics) {
            visiondict[entry + '_' + (i - 0)] = false
            positiondict[entry + '_' + (i - 0)] = entry
          }
          visionarray.push(visiondict)
          positionarray.push(positiondict)
        }
        this.visiondict = visionarray
        this.positiondict = positionarray
      },
      positionchange () {
        let tempdict = {}
        let positionarray = []
        let columns = this.gridOptions.columnApi.getAllGridColumns()
        let counter = 0
        for (let col of columns) {
          let colname = col.colDef.headerName
          let colfield = col.colDef.field
          let tag = this.tagdict[colname]
          if (colname !== 'Name') {
            tempdict[colfield] = tag
            counter = counter + 1
          }
          if (counter === 6) {
            positionarray.push(tempdict)
            tempdict = {}
            counter = 0
          }
        }
        this.$store.commit(ADD_POSITION, positionarray)
      },
      visionchange () {
        console.log('Something happend')
        let filestore = this.$store.state.deseqlist
        let fileamount = filestore.length
        let visionarray = []
        let columngroups = this.gridOptions.columnApi.getAllDisplayedColumnGroups()
        console.log('columnGroups:')
        console.log(columngroups)
        console.log('fileamount: ' + fileamount)
        for (let i = 0; i < fileamount + 1; i++) {
          let tempdict = {}
          let basictemplate = {'_log2FoldChange': true, '_pAdj': true, '_baseMean': true, '_lfcSE': true, '_pValue': true, '_stat': true}
          let childrenarray = columngroups[i]['children']
          console.log(childrenarray)
          // starting at 1 (0 = name column)
          for (let key in basictemplate) {
            let fullkey = key + '_' + (i)
            console.log(fullkey)
            let bool = true
            for (let entry of childrenarray) {
              if (fullkey === entry.colDef['field']) {
                bool = false
              }
            }
            tempdict[fullkey] = bool
          }
          visionarray.push(tempdict)
        }
        this.$store.commit(ADD_VISION, visionarray)
        this.createColumnDefs()
      },
      fillthebasket () {
        let temparray = []
        let genestaken = this.gridOptions.api.getSelectedRows()
        for (let element of genestaken) {
          temparray.push(element.name)
        }
        this.$store.dispatch(SET_SUBDGE, {geneList: temparray})
      },
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
      createColumnDefs () {
        let filestore = this.$store.state.deseqlist
        let fileamount = filestore.length
        let positionarray = []
        let visionarray = []
        console.log(positionarray, visionarray)
        if (this.$store.state.positionstore !== null) {
          positionarray = this.$store.state.positionstore
        } else {
          positionarray = this.positiondict
        }
        if (this.$store.state.visionstore !== null) {
          visionarray = this.$store.state.visionstore
        } else {
          visionarray = this.visiondict
        }
        const columnDefs = [
          {
            headerName: 'Name',
            field: 'name',
            width: 150,
            hide: false,
            pinned: false
          }
        ]
        let counter = 1
        for (let i = 1; i < fileamount + 1; i++) {
          let childrenarray = []
          // let specposarray = positionarray[i]
          // let specvisarray = visionarray[i]
          let headerName = filestore[i - 1]
          let bool = true
          if (fileamount > 1) {
            bool = false
            // fileamount > 1 => file entry semi-closed (first 2 open)
          }
          let datadict = {
            headerName: headerName,
            openByDefault: bool
            // children added here (see below)
          }
          console.log(bool)
          let colcounter = 0
          // for (let entry in specposarray) {
          //   console.log(entry)
          //   let simpleentry = specposarray[entry]
          //   let nameentry = this.namedict[simpleentry]
          //   let entrydict = {}
          //   let showstate = 'close'
          //   if (colcounter > 1) { showstate = 'open' }
          //   if (simpleentry === '_log2FoldChange') {
          for (let entry in this.namedict) {
            let nameentry = this.namedict[entry]
            let entrydict = {}
            let showstate = null
            let formattedValue = this.roundingFormatter
            if (colcounter > 1) { showstate = 'open' }
            entrydict = {
              headerName: nameentry,
              field: entry + '_' + counter,
              width: 150,
              filter: 'agNumberColumnFilter',
              // hide: specvisarray[entry],
              columnGroupShow: showstate,
              valueFormatter: formattedValue,
              cellStyle: {textAlign: 'right'}
            }

            if (entry === '_log2FoldChange') {
              entrydict['cellRenderer'] = this.percentCellRenderer
            }

            // if (specvisarray[entry] === false) {
            //   colcounter = colcounter + 1
            // }
            colcounter = colcounter + 1
            childrenarray.push(entrydict)
          }
          datadict.children = childrenarray
          columnDefs.push(datadict)
          counter = counter + 1
        }
        this.columnDefs = columnDefs
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
            return this.roundValue(number.value)
          }
        } else {
          return null
        }
      },
      // exponentialFormatter (number) {
      //   if (this.roundedValues === true) {
      //     return this.exponentialValue(number.value)
      //   } else {
      //     return null
      //   }
      // },
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
        // console.log('onModelUpdated')
        this.calculateRowCount()
      },
      onReady () {
        // console.log('onReady')
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
      minmaxdefine () {
        let log2foldlist = this.log2foldlist
        let min = Math.min(...log2foldlist)
        let max = Math.max(...log2foldlist)
        this.log2foldmin = min
        this.log2foldmax = max
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
          return this.roundValue(showvalue)
        } else {
          return showvalue
        }
      },
      roundValue (value) {
        return Math.round(value * 100) / 100
      }
    },
    beforeMount () {
      this.createstoredict()
      this.createRowData()
      this.minmaxdefine()
      this.createColumnDefs()
      this.gridOptions = {
        rowSelection: 'multiple',
        rowMultiSelectWithClick: true,
        suppressPropertyNamesCheck: true,
        icons: {
          columnGroupOpened: '<i style="font-size:1.2rem;" class="fa fa-arrow-circle-right"/>',
          columnGroupClosed: '<i style="font-size:1.2rem;" class="fa fa-arrow-circle-left"/>'
        }
      }
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
