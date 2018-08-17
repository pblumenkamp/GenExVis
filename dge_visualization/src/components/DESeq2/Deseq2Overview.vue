<template>
  <div style="width: 100%; height: 600px">
    <div style="text-align: center">
     <h1>Overview Table</h1>
     {{rowCount}}
    </div>

    <div style="clear: both;"></div>
    <div style="padding: 4px;" class="toolbar">
      <!--<span style="margin-left: 20px;">-->
        <!--Column API:-->
        <!--<button @click="gridOptions.columnApi.setColumnVisible('country', false)">Hide Country Column</button>-->
        <!--<button @click="gridOptions.columnApi.setColumnVisible('country', true)">Show Country Column</button>-->
      <!--</span>-->
    </div>

    <div style="padding: 4px; float:left;" class="toolbar">
      <span>
        <button type="button" class="btn btn-default" @click="gridOptions.api.selectAllFiltered()">Select All</button>
        <button type="button" class="btn btn-default" @click="gridOptions.api.deselectAll()">Clear Selection</button>
        <button type="button" class="btn btn-default" @click="setback()">Set back</button>
        <!--<button type="button" class="btn btn-default" @click="testalert()">TESTING</button>-->
        <button class="btn btn-primary" @click="fillthebasket()">Create Subset</button>
      </span>
    </div>

    <div style="float: right;">
      <input @keyup="onQuickFilterChanged" type="text" id="quickFilterInput"
             placeholder="Type text to filter..."/>
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
                 :columnVisible="visionchange"
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
  import {AgGridVue} from 'ag-grid-vue'
  import {ADD_VISION, ADD_POSITION} from '../../store/mutation_constants'

  export default {
    data () {
      return {
        gridOptions: null,
        columnDefs: null,
        rowData: null,
        showToolPanel: false,
        log2foldlist: [],
        log2foldmin: 0,
        log2foldmax: 0,
        // columnGroupOpened: true,
        rowCount: null,
        setRowHeight: 500,
        namedict: {
          '_log2FoldChange': 'log2 fold change',
          '_pAdj': 'p value (adjusted)',
          '_baseMean': 'base mean',
          '_lfcSE': 'lfcSE',
          '_pValue': 'p value',
          '_stat': 'stat'
        },
        visiondict: {
          '_log2FoldChange': false,
          '_pAdj': false,
          '_baseMean': false,
          '_lfcSE': false,
          '_pValue': false,
          '_stat': false
        },
        positiondict: [
          '_log2FoldChange',
          '_pAdj',
          '_baseMean',
          '_lfcSE',
          '_pValue',
          '_stat'
        ]
      }
    },
    components: {
      'ag-grid-vue': AgGridVue
    },
    methods: {
      fillthebasket () {
        let temparray = []
        let genestaken = this.gridOptions.api.getSelectedRows()
        for (let element of genestaken) {
          temparray.push(element.name)
        }
        this.$store.dispatch(SET_SUBDGE, {geneList: temparray})
      },
      positionchange () {
        let temparray = []
        let storearray = []
        let columns = this.gridOptions.columnApi.getAllGridColumns()
        let counter = 0
        for (let col of columns) {
          let colname = col.colDef.field
          if (colname !== 'name') {
            temparray.push(colname)
            counter = counter + 1
          }
          if (counter === 6) {
            // this.$store.commit(ADD_POSITION, temparray)
            storearray.push(temparray)
            temparray = []
            counter = 0
          }
        }
        this.$store.commit(ADD_POSITION, storearray)
      },
      testalert () {
        console.log(this.$store.state.positionstore)
        console.log(this.$store.state.visionstore)
      },
      visionchange () {
        let filestore = this.$store.state.deseqlist
        let fileamount = filestore.length
        let bigarray = []
        let columngroups = this.gridOptions.columnApi.getAllDisplayedColumnGroups()
        for (let i = 1; i < fileamount + 1; i++) {
          let basictemplate = {'_log2FoldChange': true, '_pAdj': true, '_baseMean': true, '_lfcSE': true, '_pValue': true, '_stat': true}
          let childrenarray = columngroups[i]['children']
          for (let key in basictemplate) {
            for (let entry of childrenarray) {
              if (key === entry.colDef['field']) {
                basictemplate[key] = false
              }
            }
          }
          bigarray.push(basictemplate)
        }
        this.$store.commit(ADD_VISION, bigarray)
        this.createColumnDefs()
      },
      setback () {
        this.$store.commit(ADD_POSITION, null)
        this.$store.commit(ADD_VISION, null)
        this.createColumnDefs()
      },
      createRowData () {
        const rowData = []
        let store = this.$store.state.dgeData
        for (let geneName of store.geneNames) {
          let gene = store.getGene(geneName)
          let dict = {}
          dict.name = gene.name
          let analysesList = gene.deseq2Analyses
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
              dict[element] = currentcell
              // console.log(subentry[element])
              // if (element === '_log2FoldChange' && subentry[element] !== 'NaN') {
              //   if (!isNaN(subentry[element])) {
              //     this.log2foldlist.push(subentry[element])
              //   }
              // }
            }
          }
          rowData.push(dict)
        }
        console.log(rowData)
        this.rowData = rowData
      },
      createColumnDefs () {
        let filestore = this.$store.state.deseqlist
        let fileamount = filestore.length
        let positionarray = []
        let visionarray = []
        if (this.$store.state.positionstore !== null) {
          positionarray = this.$store.state.positionstore
        } else {
          for (let i = 0; i < fileamount; i++) {
            positionarray.push(this.positiondict)
          }
        }
        if (this.$store.state.visionstore !== null) {
          visionarray = this.$store.state.visionstore
        } else {
          for (let i = 0; i < fileamount; i++) {
            visionarray.push(this.visiondict)
          }
        }
        const columnDefs = [
          {
            headerName: 'Name',
            field: 'name',
            width: 150,
            hide: false,
            pinned: true
          }
        ]
        let counter = 0
        for (let i = 0; i < fileamount; i++) {
          let childrenarray = []
          let specposarray = positionarray[i]
          let specvisarray = visionarray[i]
          let headerName = filestore[i]
          let bool = true
          if (counter > 0) {
            bool = false
            // fileamount > 1 => file entry semi-closed (first 2 open)
          }
          let datadict = {
            headerName: headerName,
            openByDefault: bool
          }
          let colcounter = 0
          for (let entry of specposarray) {
            let entrydict = {}
            let showstate = 'close'
            if (colcounter > 1) { showstate = 'open' }
            if (entry === '_log2FoldChange') {
              entrydict = {
                headerName: this.namedict[entry],
                field: entry,
                width: 150,
                cellRenderer: this.percentCellRenderer,
                filter: 'agNumberColumnFilter',
                hide: specvisarray[entry],
                columnGroupShow: showstate
              }
            } else {
              entrydict = {
                headerName: this.namedict[entry],
                field: entry,
                width: 150,
                filter: 'agNumberColumnFilter',
                hide: specvisarray[entry],
                columnGroupShow: showstate
              }
            }
            if (specvisarray[entry] === false) {
              colcounter = colcounter + 1
            }
            childrenarray.push(entrydict)
          }
          datadict.children = childrenarray
          columnDefs.push(datadict)
          counter = counter + 1
        }
        this.columnDefs = columnDefs
      },
      pad (num, totalStringSize) {
        let asString = num + ''
        while (asString.length < totalStringSize) asString = '0' + asString
        return asString
      },
      calculateRowCount () {
        if (this.gridOptions.api && this.rowData) {
          let model = this.gridOptions.api.getModel()
          let totalRows = this.rowData.length
          let processedRows = model.getRowCount()
          this.rowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString()
        }
      },
      onModelUpdated () {
        console.log('onModelUpdated')
        this.calculateRowCount()
      },
      onReady () {
        console.log('onReady')
        this.calculateRowCount()
      },
      onSelectionChanged () {
        let selectedRows = this.gridOptions.api.getSelectedRows()
        let selectedRowsString = []
        selectedRows.forEach(function (selectedRow) {
          selectedRowsString.push(selectedRow.name)
        })
        document.querySelector('#selectedRows').innerHTML = selectedRowsString
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
        // if (value === null) {
        //   value = 0
        // }
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
        div1.innerHTML = showvalue
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
        // let wrapper = document.getElementById('TEST')
        // wrapper.append(parent)
        if (value !== null) {
          return parent
        }
      }
    },
    beforeMount () {
      this.createRowData()
      this.minmaxdefine()
      this.createColumnDefs()
      this.gridOptions = {
        rowSelection: 'multiple',
        rowMultiSelectWithClick: true,
        suppressPropertyNamesCheck: true
      }
    }
  }
</script>

<style scoped>
  .currentlychosen {
    text-align: left;
    overflow-y: scroll;
    height: 150px;
    padding: 1rem
  }
  label {
    font-weight: normal !important;
    text-align: right;
  }
</style>
