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
    <div style="clear: both;"></div>
    <div style="padding: 4px; float:left;" class="toolbar">
      <span>
        <b-button @click="gridOptions.api.selectAll()">Select All</b-button>
        <b-button @click="gridOptions.api.deselectAll()">Clear Selection</b-button>
        <b-button @click="fillthebasket">Einkaufskorb</b-button>
      </span>
      <!--<label>-->
          <!--<input type="checkbox" v-model="showToolPanel"/>-->
          <!--Show Tool Panel-->
      <!--</label>-->
      <!--<button @click="createRowData()">Refresh Data</button>-->
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
                 :columnGroupOpened="onColumnEvent"
                 :columnResized="onColumnEvent"
                 :columnPinnedCountChanged="onColumnEvent"/>
    <div>
      <b-card>
        <p id="selectedRows"></p>
      </b-card>
    </div>
  </div>
</template>

<script>
  import {ADD_GENE} from '@/store/mutation_constants'
  import {AgGridVue} from 'ag-grid-vue'
  // import {ProficiencyFilter} from './proficiencyFilter'
  // import {SkillFilter} from './skillFilter'
  import DateComponent from './DateComponent.vue'
  // import HeaderGroupComponent from './HeaderGroupComponent.vue'
  // import RefData from './refData'

  export default {
    data () {
      return {
        gridOptions: null,
        columnDefs: null,
        rowData: null,
        showToolPanel: false,
        rowCount: null,
        setRowHeight: 500
      }
    },
    components: {
      'ag-grid-vue': AgGridVue
    },
    methods: {
      fillthebasket () {
        // this.$store.commit(ADD_GENE, node.data.name)
        let genestaken = this.gridOptions.api.getSelectedRows()
        for (let element of genestaken) {
          let control = false
          for (let entry of this.$store.state.genelist) {
            if (element.name === entry) {
              control = true
            }
          }
          console.log(control)
          if (control === false) {
            this.$store.commit(ADD_GENE, element.name)
            this.$store.state.genelist.sort()
          }
          // this.$store.commit(ADD_GENE, element.name)
        }
      },
      createRowData () {
        const rowData1 = []
        let store = this.$store.state.dgeData._data
        for (let gene in store) {
          var dict = {}
          dict.name = store[gene]._name
          let list = store[gene]._deseq2_analyses
          for (let entry in list) {
            // probably try entry OF list
            let subentry = list[entry]
            for (let element in subentry) {
              dict[element] = subentry[element]
            }
            // console.log(dict)
            // console.log(superentry)
            // dict._baseMean = superentry._baseMean
            // dict._lfcSE = superentry._lfcSE
            // dict._log2FoldChange = superentry._log2FoldChange
          }
          rowData1.push(dict)
        }
        // const rowData2 = []
        // for (let i = 0; i < 200; i++) {
        //   const countryData = RefData.COUNTRIES[i % RefData.COUNTRIES.length]
        //   rowData2.push({
        //     name: RefData.FIRST_NAMES[i % RefData.FIRST_NAMES.length] + ' ' + RefData.LAST_NAMES[i % RefData.LAST_NAMES.length],
        //     // skills: {
        //     //   android: Math.random() < 0.4,
        //     //   html5: Math.random() < 0.4,
        //     //   mac: Math.random() < 0.4,
        //     //   windows: Math.random() < 0.4,
        //     //   css: Math.random() < 0.4
        //     // },
        //     dob: RefData.DOBs[i % RefData.DOBs.length],
        //     address: RefData.ADDRESSES[i % RefData.ADDRESSES.length],
        //     years: Math.round(Math.random() * 100),
        //     proficiency: Math.round(Math.random() * 100),
        //     country: countryData.language,
        //     continent: countryData.continent,
        //     language: countryData.country,
        //     mobile: createRandomPhoneNumber(),
        //     landline: createRandomPhoneNumber()
        //   })
        // }
        this.rowData = rowData1
      },
      createColumnDefs () {
        const columnDefs = [
          // {
          //   headerName: '',
          //   width: 30,
          //   checkboxSelection: true,
          //   suppressSorting: true,
          //   suppressMenu: true,
          //   pinned: true
          // },
          {
            headerName: 'Name',
            field: 'name',
            width: 150,
            pinned: true
          }
          // {
          //   headerName: 'Employee',
          //   headerGroupComponentFramework: HeaderGroupComponent,
          //   children: [
          //     {
          //       headerName: 'Name',
          //       field: 'name',
          //       width: 150,
          //       pinned: true
          //     },
          //     {
          //       headerName: 'DOB',
          //       field: 'dob',
          //       width: 120,
          //       pinned: true,
          //       cellRenderer: (params) => {
          //         return this.pad(params.value.getDate(), 2) + '/' +
          //                                 this.pad(params.value.getMonth() + 1, 2) + '/' +
          //                                 params.value.getFullYear()
          //       },
          //       filter: 'date',
          //       columnGroupShow: 'open'
          //     }
          //   ]
          // }
        ]
        let filestore = this.$store.state.filelist
        // let datastore = this.$store.state.dgeData._data
        // let testdict = {}
        for (let entry in filestore) {
          columnDefs.push(
            {
              headerName: filestore[entry],
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
        console.log('onRowClicked: ' + event.node.data.name)
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

  // function skillsCellRenderer (params) {
  //   let data = params.data
  //   let skills = []
  //   RefData.IT_SKILLS.forEach(function (skill) {
  //     if (data && data.skills && data.skills[skill]) {
  //       skills.push('<img src="images/skills/' + skill + '.png" width="16px" title="' + skill + '" />')
  //     }
  //   })
  //   return skills.join(' ')
  // }

  // function countryCellRenderer (params) {
  //   let flag = "<img border='0' width='15' height='10' style='margin-bottom: 2px' src='images/flags/" + RefData.COUNTRY_CODES[params.value] + ".png'>"
  //   return flag + ' ' + params.value
  // }

  // function createRandomPhoneNumber () {
  //   let result = '+'
  //   for (let i = 0; i < 12; i++) {
  //     result += Math.round(Math.random() * 10)
  //     if (i === 2 || i === 5 || i === 8) {
  //       result += ' '
  //     }
  //   }
  //   return result
  // }

  // function percentCellRenderer (params) {
  //   let value = params.value
  //
  //   let eDivPercentBar = document.createElement('div')
  //   eDivPercentBar.className = 'div-percent-bar'
  //   eDivPercentBar.style.width = value + '%'
  //   if (value < 20) {
  //     eDivPercentBar.style.backgroundColor = 'red'
  //   } else if (value < 60) {
  //     eDivPercentBar.style.backgroundColor = '#ff9900'
  //   } else {
  //     eDivPercentBar.style.backgroundColor = '#00A000'
  //   }
  //   let eValue = document.createElement('div')
  //   eValue.className = 'div-percent-value'
  //   eValue.innerHTML = value + '%'
  //   let eOuterDiv = document.createElement('div')
  //   eOuterDiv.className = 'div-outer-div'
  //   eOuterDiv.appendChild(eValue)
  //   eOuterDiv.appendChild(eDivPercentBar)
  //   return eOuterDiv
  // }
  </script>

  <style>
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
