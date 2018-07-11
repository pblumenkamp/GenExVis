<template>
  <div style="width: 100%; height: 600px">
    <div style="padding: 4px;">
      <!--<div style="float: left;">-->
          <!--<button :disabled="!showGrid" @click="showGrid=false">Destroy Grid</button>-->
          <!--<button :disabled="showGrid" @click="showGrid=true">Create Grid</button>-->
      <!--</div>-->
      <div>
          <h1>Overview Table</h1>
          {{rowCount}}
      </div>
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
        <button class="btn btn-primary" @click="fillthebasket()">Import Genes</button>
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
                 :cellClicked="onCellClicked"
                 :cellDoubleClicked="onCellDoubleClicked"
                 :cellContextMenu="onCellContextMenu"
                 :cellValueChanged="onCellValueChanged"
                 :cellFocused="onCellFocused"
                 :rowSelected="onRowSelected"
                 :selectionChanged="onSelectionChanged"
                 :beforeFilterChanged="onBeforeFilterChanged"
                 :afterFilterChanged="onAfterFilterChanged"
                 :filterModified="onFilterModified"
                 :beforeSortChanged="onBeforeSortChanged"
                 :afterSortChanged="onAfterSortChanged"
                 :virtualRowRemoved="onVirtualRowRemoved"
                 :rowClicked="onRowClicked"
                 :gridReady="onReady"

                 :columnEverythingChanged="onColumnEvent"
                 :columnRowGroupChanged="onColumnEvent"
                 :columnValueChanged="onColumnEvent"
                 :columnMoved="positionchange"
                 :columnVisible="visionchange"
                 :columnGroupOpened="true"
                 :columnResized="onColumnEvent"
                 :columnPinnedCountChanged="onColumnEvent"/>
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
        console.log(storearray[0])
        this.$store.commit(ADD_POSITION, storearray)
        console.log('>>> PositionStore: ')
        console.log(this.$store.state.positionstore)
      },
      testalert () {
        console.log(this.$store.state.positionstore)
        console.log(this.$store.state.visionstore)
      },
      visionchange () {
        let filestore = this.$store.state.filelist
        let fileamount = filestore.length
        let bigarray = []
        let columngroups = this.gridOptions.columnApi.getAllDisplayedColumnGroups()
        console.log(columngroups)
        for (let i = 1; i < fileamount + 1; i++) {
          let basictemplate = {'_log2FoldChange': true, '_pAdj': true, '_baseMean': true, '_lfcSE': true, '_pValue': true, '_stat': true}
          console.log(i)
          console.log(columngroups[i])
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
      },
      setback () {
        this.$store.commit(ADD_POSITION, null)
        this.$store.commit(ADD_VISION, null)
        this.createColumnDefs()
      },
      createRowData () {
        const rowData = []
        let store = this.$store.state.dgeData._data
        for (let gene in store) {
          var dict = {}
          dict.name = store[gene]._name
          let list = store[gene]._deseq2_analyses
          for (let entry in list) {
            // entry = 0, 1, 2 ...
            // probably try entry OF list
            let subentry = list[entry]
            for (let element in subentry) {
              dict[element] = subentry[element]
            }
          }
          rowData.push(dict)
        }
        this.rowData = rowData
      },
      createColumnDefs () {
        let filestore = this.$store.state.filelist
        let fileamount = filestore.length
        let positionarray = []
        let visionarray = []
        if (this.$store.state.positionstore !== null) {
          console.log('>>> ist NICHT null ...')
          positionarray = this.$store.state.positionstore
        } else {
          console.log('>>> positionStore === null')
          for (let i = 0; i < fileamount; i++) {
            positionarray.push(this.positiondict)
          }
        }
        if (this.$store.state.visionstore !== null) {
          console.log('>>> ist NICHT null ...')
          visionarray = this.$store.state.visionstore
        } else {
          console.log('>>> visionStore === null')
          for (let i = 0; i < fileamount; i++) {
            visionarray.push(this.visiondict)
          }
        }
        console.log('>>> STORAGES: ')
        console.log(positionarray)
        console.log(visionarray)
        // for (let i = 0; i < fileamount; i++) {
        //   positionarray.push(this.positiondict)
        //   visionarray.push(this.visiondict)
        // }
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
        // let bool = true
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
            entrydict = {
              headerName: this.namedict[entry],
              field: entry,
              width: 150,
              filter: 'agNumberColumnFilter',
              hide: specvisarray[entry],
              columnGroupShow: showstate
            }
            colcounter = colcounter + 1
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

      onCellClicked (event) {
        // console.log('onCellClicked: ' + event.rowIndex + ' ' + event.colDef.field)
      },

      onCellValueChanged (event) {
        console.log('onCellValueChanged: ' + event.oldValue + ' to ' + event.newValue)
      },

      onCellDoubleClicked (event) {
        console.log('onCellDoubleClicked: ' + event.rowIndex + ' ' + event.colDef.field)
      },

      onCellContextMenu (event) {
        console.log('onCellContextMenu: ' + event.rowIndex + ' ' + event.colDef.field)
      },

      onCellFocused (event) {
        console.log('onCellFocused: (' + event.rowIndex + ',' + event.colIndex + ')')
      },

      // taking out, as when we 'select all', it prints to much to the console!!
      onRowSelected (event) {
        //                console.log('onRowSelected: ' + event.node.data.name);
      },

      onSelectionChanged () {
        let selectedRows = this.gridOptions.api.getSelectedRows()
        let selectedRowsString = []
        selectedRows.forEach(function (selectedRow) {
          selectedRowsString.push(selectedRow.name)
        })
        document.querySelector('#selectedRows').innerHTML = selectedRowsString
      },

      onBeforeFilterChanged () {
        console.log('beforeFilterChanged')
      },

      onAfterFilterChanged () {
        console.log('afterFilterChanged')
      },

      onFilterModified () {
        console.log('onFilterModified')
      },

      onBeforeSortChanged () {
        console.log('onBeforeSortChanged')
      },

      onAfterSortChanged () {
        console.log('onAfterSortChanged')
      },

      onVirtualRowRemoved (event) {
        // because this event gets fired LOTS of times, we don't print it to the
        // console. if you want to see it, just uncomment out this line
        // console.log('onVirtualRowRemoved: ' + event.rowIndex);
      },

      onRowClicked (event) {
        // console.log('onRowClicked: ' + event.node.data.name)
      },

      onQuickFilterChanged (event) {
        this.gridOptions.api.setQuickFilter(event.target.value)
      },

      // here we use one generic event to handle all the column type events.
      // the method just prints the event name
      onColumnEvent (event) {
        console.log('onColumnEvent: ' + event)
      }
    },
    beforeMount () {
      console.log('>>> PRESTORE:')
      console.log(this.$store.state.positionstore)
      console.log(this.$store.state.visionstore)
      this.createRowData()
      this.createColumnDefs()
      this.gridOptions = {
        rowSelection: 'multiple',
        rowMultiSelectWithClick: true
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
