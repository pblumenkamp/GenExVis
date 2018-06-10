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
                 :columnMoved="onColumnEvent"
                 :columnVisible="onColumnEvent"
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
  // import {ADD_GENE} from '../../store/mutation_constants'
  import {SET_SUBDGE} from '../../store/action_constants'
  import {AgGridVue} from 'ag-grid-vue'
  import DateComponent from './DateComponent.vue'

  export default {
    data () {
      return {
        gridOptions: null,
        columnDefs: null,
        rowData: null,
        showToolPanel: false,
        columnGroupOpened: true,
        rowCount: null,
        setRowHeight: 500
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
          // let control = false
          // for (let entry of this.$store.state.genelist) {
          //   if (element.name === entry) {
          //     control = true
          //   }
          // }
          // if (control === false) {
          //   this.$store.commit(ADD_GENE, element.name)
          //   this.$store.commit(ADD_GENE, element.name)
          // }
        }
        this.$store.dispatch(SET_SUBDGE, {geneList: temparray})
        console.log(this.$store.state.subDGE)
      },
      createRowData () {
        const rowData1 = []
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
          rowData1.push(dict)
        }
        this.rowData = rowData1
      },
      createColumnDefs () {
        const columnDefs = [
          {
            headerName: 'Name',
            field: 'name',
            width: 150,
            pinned: true
          }
        ]
        let filestore = this.$store.state.filelist
        let counter = 0
        let bool = true
        // let datastore = this.$store.state.dgeData._data
        // let testdict = {}
        for (let entry in filestore) {
          console.log(counter)
          if (counter !== 0) {
            bool = false
          }
          columnDefs.push(
            {
              headerName: filestore[entry],
              openByDefault: bool,
              children: [
                {
                  headerName: 'base mean',
                  field: '_baseMean',
                  width: 150,
                  filter: 'agNumberColumnFilter'
                },
                {
                  headerName: 'lfcSE',
                  field: '_lfcSE',
                  width: 150,
                  filter: 'agNumberColumnFilter'
                },
                {
                  headerName: 'log2 fold change',
                  field: '_log2FoldChange',
                  width: 150,
                  filter: 'agNumberColumnFilter',
                  columnGroupShow: 'open'
                },
                {
                  headerName: 'p value',
                  field: '_pValue',
                  width: 150,
                  filter: 'agNumberColumnFilter',
                  columnGroupShow: 'open'
                },
                {
                  headerName: 'p value (adjusted)',
                  field: '_pAdj',
                  width: 150,
                  filter: 'agNumberColumnFilter',
                  columnGroupShow: 'open'
                },
                {
                  headerName: 'stat',
                  field: '_stat',
                  width: 150,
                  filter: 'agNumberColumnFilter',
                  columnGroupShow: 'open'
                }
              ]
            }
          )
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
      this.gridOptions = {
        rowSelection: 'multiple',
        rowMultiSelectWithClick: true
      }
      this.gridOptions.dateComponentFramework = DateComponent
      this.createRowData()
      this.createColumnDefs()
    }
  }
</script>

<style>
  .currentlychosen {
    text-align: left;
    overflow-y: scroll;
    height: 150px;
    padding: 1rem
  }
  .ag-cell {
      padding-top: 2px !important;
      padding-bottom: 2px !important;
      text-align: center;
  }

  .customHeaderLabel {
      margin-right: 5px;
      margin-top: 3px;
      float: right;
  }

  label {
      font-weight: normal !important;
      text-align: right;
  }

  .div-percent-bar {
      display: inline-block;
      height: 100%;
      position: relative;
      z-index: 0;
  }

  .div-percent-value {
      position: absolute;
      padding-left: 4px;
      font-weight: bold;
      font-size: 13px;
      z-index: 100;
  }

  .div-outer-div {
      display: inline-block;
      height: 100%;
      width: 100%;
  }

  .ag-menu {
      z-index: 200;
      text-align-all: center;
  }
</style>
