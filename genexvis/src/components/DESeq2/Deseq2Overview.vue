<template>
  <div>
    <div style="text-align: center">
      <h1 class="header">Overview</h1>
    </div>

    <div v-if="!this.isTableTooBig">
      <div class="structureFlex">
        <div class="structureFlexCell topStructureFlexCell">

          <div class="tableWrapper">
            <table class="geneAmountTable">
              <tr style="color: #ffffff">
                <td class="tableColumn1">
                  {{ rowTotalAmount }}
                </td>
                <td class="tableColumn2">
                  TOTAL
                </td>
              </tr>
              <tr style="color: #93baff">
                <td class="tableColumn1">
                  {{ rowChosenAmount }}
                </td>
                <td class="tableColumn2">
                  selected
                </td>
              </tr>
            </table>
          </div>

        </div>
        <div class="structureFlexCell" style="flex: 1">
          <div class="flexButtonWrapper">
            <div class="btn-group-vertical basic-button flexButtonGroup">
              <button title="Selects all genes" id="selectAllButton"
                      class="btn flexButtonType1 main-control-button"
                      :disabled="isDisabledSelectAllButton"
                      @click="gridOptions.api.selectAllFiltered()">
                <font-awesome-icon :icon="faGlobe"></font-awesome-icon>
                select all
              </button>
              <button title="Undoes the current selection of genes" id="deselectAllButton"
                      class="btn flexButtonType1 main-control-button"
                      :disabled="isDisabledDeselectAllButton"
                      @click="gridOptions.api.deselectAll()">
                <font-awesome-icon icon="trash-alt" style="margin-right: 0.2rem" />
                clear
              </button>
            </div>
          </div>
        </div>
        <div class="structureFlexCell">

          <div class="chosenCellWrapper">
            <div style="height: 20%">
              Currently chosen:
            </div>
            <div class="well selectedRowsflexWell">
              <template v-for="(element, index) in this.rowChosenList">
                <a>{{ index+1 }}. {{ element }}</a><br>
              </template>
            </div>
          </div>

        </div>
        <div style="flex: 1;" class="structureFlexCell">
          <div class="btn-group-vertical basic-button flexButtonGroup">
            <button title="Creates a new subset of the currently chosen genes" id="createSubsetButton"
                    class="btn btn-dark main-control-button" :disabled="isDisabledCreateSubset"
                    @click="createAndFillNewSubset">
              <font-awesome-icon :icon="faCube"></font-awesome-icon>
              create</button>
            <button title="Adds a gene to a existing subset" id="addGenesButton"
                    class="btn btn-dark main-control-button" :disabled="isDisabledAddGeneToSubset"
                    @click="addSelectedGenesToSubset">
              <font-awesome-icon :icon="faPlusCircle"></font-awesome-icon>
              add</button>
            <button title="Adds a gene to a existing subset"
                    class="btn btn-dark main-control-button" 
                    :disabled="isDisabledClearSubset"
                    @click="clearSubset">
              <font-awesome-icon icon="trash-alt" style="margin-right: 0.2rem" />
              delete
            </button>
          </div>
        </div>
        <div class="structureFlexCell bottomStructureFlexCell">
          <div class="tableWrapper divWrapper">
            <div class="structureFlexOptions">

              <div class="flexOptionsWrapper">
                <input @keyup="onQuickFilterChanged" type="text" id="quickFilterInput" placeholder="Type text to filter..."/>
              </div>

            </div>
            <div class="structureFlexOptions">

              <div class="flexOptionsWrapper">
                <b-form-checkbox v-model="roundedValues"
                                 @change="toggleRoundingChange">
                  Rounded Values
                </b-form-checkbox>
              </div>

            </div>
            <div class="structureFlexOptions">

              <div class="flexOptionsWrapper">
                <button class="btn resetTableButton"
                        title="Resets the table, with all columns and column groups"
                        @click="toggleTableReset()">
                  <font-awesome-icon :icon="faUndoAlt"></font-awesome-icon> Reset Table
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
      <p></p>

      <div style="border: 5px solid white; border-radius: 5px">
        <ag-grid-vue
          id="main-table"
          class="main-table ag-theme-fresh"
          align="left"

          :gridOptions="gridOptions"
          :columnDefs="columnDefs"
          :rowData="rowData"
          :icons="icons"

          :groupHeaders="true"

          @modelUpdated="onModelUpdated"
          @selectionChanged="onSelectionChanged"
          @columnVisible="onVisionChanged"
          @columnMoved="onPositionChanged"
          @gridReady="onReady"
        />
      </div>
    </div>

    <div v-else class="main-no-table" style="height: 80vh">
      <div>
        <h2 style="text-align: center">Unfortunately the table was too large to display.</h2>
        <h3 style="text-align: center">You can try working with an subset or you can save the full table below:</h3>
        <table style="width: 100%">
          <tr style="text-align: center">
            <td style="width: 25%"></td>
            <td>
                <button
                    id = 'downloadCSV'
                    class="btn btn-dark btn-sm"
                    title="Download table as .csv"
                    @click="downloadCSV"
                >
                  <font-awesome-icon :icon="faDownload"></font-awesome-icon> Download .csv
                </button>
              </td>
              <td style="width: 10%"></td>
              <td>
                <b-form-checkbox v-model="roundedValues2" @change="toggleRoundingChange2">
                  Rounded Values
                </b-form-checkbox>
              </td>
              <td style="width: 25%"></td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
  import {ADD_STRUC} from '../../store/mutation_constants'
  import {SET_SUBDGE, CLEAR_SUBDGE} from '../../store/action_constants'
  import {AgGridVue} from 'ag-grid-vue'

  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faUndoAlt, faDownload, faGlobe, faTrashAlt, faArrowCircleRight, faArrowCircleLeft, faCube, faPlusCircle} from '@fortawesome/free-solid-svg-icons'

  export default {
    data () {
      return {
        roundedValues2: true,
        roundedValues: true,
        gridOptions: null,
        columnDefs: null,
        rowData: null,
        icons: null,

        log2foldlist: [],
        log2foldmin: 0,
        log2foldmax: 0,
        rowTotalAmount: null,
        rowChosenAmount: 0,
        rowChosenList: [],
        nameDict: {
          '_log2FoldChange': 'log2 fold change',
          '_pAdj': 'p value (adjusted)',
          '_baseMean': 'base mean',
          '_lfcSE': 'lfcSE',
          '_pValue': 'p value',
          '_stat': 'stat'
        },
        design: 'main-table ag-theme-fresh',
        strucStorage: null
      }
    },
    components: {
      'ag-grid-vue': AgGridVue,
      FontAwesomeIcon
    },
    methods: {
      addSelectedGenesToSubset () {
        let vue = this
        let currentSubDGE = vue.$store.state.subDGE.geneNames;
        let genesToAdd = vue.gridOptions.api.getSelectedRows();
        let geneList = [];
        if (currentSubDGE.size === 0) {
          vue.createAndFillNewSubset()
        } else {
          for (let entry of currentSubDGE) {
            geneList.push(entry)
          }
          for (let entry of genesToAdd) {
            if (!geneList.includes(entry.name)) {
              geneList.push(entry.name)
            }
          }
          vue.$store.dispatch(SET_SUBDGE, {geneList: geneList})
        }
      },
      createAndFillNewSubset () {
        let genesToAdd = this.gridOptions.api.getSelectedRows();
        let geneList = [];
        for (let element of genesToAdd) {
          geneList.push(element.name)
        }
        this.$store.dispatch(SET_SUBDGE, {geneList: geneList})
      },
      clearSubset () {
        this.$store.dispatch(CLEAR_SUBDGE)
      },
      checkStorage () {
        let strucStorage = this.$store.state.strucStorage;
        if (strucStorage === null) {
          this.createStrucStorage()
        } else {
          this.strucStorage = strucStorage
          // createColumnDefs takes non-null strucStorage from previous visit
        }
      },
      createStrucStorage () {
        let fileStore = this.$store.state.deseqlist;
        let fileAmount = fileStore.length;

        let strucStorage = {};
        let strucArray = [];
        strucArray.push([undefined, ['Name', 'name']]);
        for (let i = 1; i < fileAmount + 1; i++) {
          let childArray = [];
          let headerName = fileStore[i - 1];
          let openByDefault = true;
          for (let entry in this.nameDict) {
            let fieldArray = [this.nameDict[entry], entry + '_' + i];
            childArray.push(fieldArray)
          }
          strucArray.push([headerName, childArray, openByDefault])
        }
        strucStorage['data'] = strucArray;
        strucStorage['design'] = 'main-table ag-theme-fresh';
        this.strucStorage = strucStorage
      },
      createRowData () {
        const rowData = [];
        let store = this.$store.state.dgeData;

        let rowCounter = 0;

        for (let geneName of store.geneNames) {
          let gene = store.getGene(geneName);
          let dict = {};
          dict.name = gene.name;
          let analysescounter = 1;
          for (let analysis of gene.deseq2Analyses) {
            for (let element in analysis) {
              let currentcell = analysis[element];
              if (element !== '_conditions' && isNaN(currentcell)) {
                currentcell = null
              } else {
                if (element === '_log2FoldChange') {
                  this.log2foldlist.push(currentcell)
                }
              }
              let elementValue = element + '_' + analysescounter;
              dict[elementValue] = currentcell
            }
            analysescounter = analysescounter + 1
          }
          rowData.push(dict);
          rowCounter = rowCounter + 1
        }

        this.rowData = rowData
      },
      // visualisation of log2FoldChange
      minmaxdefine () {
        let log2foldlist = this.log2foldlist;
        let min = Math.min(...log2foldlist);
        let max = Math.max(...log2foldlist);
        this.log2foldmin = min;
        this.log2foldmax = max
      },
      chooseDesign () {
        // designStorage is simply the string name of the design
        let designStorage = this.strucStorage['design'];
        document.getElementById('main-table').className = designStorage
      },
      createColumnDefs () {
        const columnDefs = [];
        let strucStorage = this.strucStorage['data'];
        for (let file of strucStorage) {
          if (file[0] === undefined || file[0] === 'name') {
            columnDefs.push(this.nameColumn())
          } else {
            let openBool = file[2];
            let datadict = {
              headerName: file[0],
              openByDefault: openBool,
              children: this.createChildren(file[1])
            };
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
        };
        return (dataDict)
      },
      createChildren (columnArray) {
        let returnArray = [];
        let colCounter = 0;
        for (let column of columnArray) {
          let showstate = null;
          if (colCounter > 1) { showstate = 'closed' }
          let formattedValue = this.roundingFormatter;
          let entryDict = {
            headerName: column[0],
            field: column[1],
            width: 150,
            filter: 'agNumberColumnFilter',
            columnGroupShow: showstate,
            cellStyle: {textAlign: 'right'}
          };
          if (column[0] === 'log2 fold change') {
            entryDict['cellRenderer'] = this.percentCellRenderer
          } else {
            entryDict['cellRenderer'] = this.negotiateShowValue
          }
          returnArray.push(entryDict);
          colCounter = colCounter + 1
        }
        return (returnArray)
      },
      roundingFormatter (number) {
        let testValue = number.value + '€';

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
        let value = params.value;
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
        let value = params.value;
        let showvalue = params.value;

        let min = this.log2foldmin;
        let max = this.log2foldmax;

        let table = document.createElement('table');
        table.align = 'center';
        table.style.width = 100 + '%';
        table.style.height = 100 + '%';
        let firstrow = document.createElement('tr');
        // all 4 parts (2 bars, 2 spaces)
        let leftbar = document.createElement('td');
        let rightbar = document.createElement('td');
        let leftpush = document.createElement('td');
        let rightpush = document.createElement('td');
        //
        leftbar.style.padding = 0;
        rightbar.style.padding = 0;
        leftpush.style.padding = 0;
        rightpush.style.padding = 0;

        if (value < 0) {
          let percent = (value * 50) / min;
          leftpush.style.width = (50 - percent) + '%';
          leftbar.style.width = percent + '%';
          rightbar.style.width = 25 + '%';
          rightpush.style.width = 25 + '%';
          leftbar.style.backgroundColor = 'rgba(238, 16, 16, 0.4)'
        } else {
          let percent = (value * 50) / max;
          leftpush.style.width = 25 + '%';
          leftbar.style.width = 25 + '%';
          rightbar.style.width = percent + '%';
          rightpush.style.width = (50 - percent) + '%';
          rightbar.style.backgroundColor = 'rgba(16, 16, 238, 0.4)'
        }

        firstrow.append(leftpush, leftbar, rightbar, rightpush);
        table.append(firstrow);

        let div1 = document.createElement('div');
        let div2 = document.createElement('div');
        div1.id = 'child_1';
        div2.id = 'child_2';
        // o!
        div1.style.position = 'absolute';
        div2.style.position = 'absolute';
        div2.style.width = 100 + '%';
        div2.style.height = 100 + '%';
        div2.align = 'center';
        // x!
        div1.innerHTML = this.returnRoundedValue(showvalue);
        div1.style.cssText = 'text-align:right';
        div2.append(table);
        let parent = document.createElement('div');
        parent.id = 'parent';
        // o!
        parent.style.position = 'relative';
        parent.style.width = 100 + '%';
        parent.style.height = 100 + '%';
        parent.align = 'center';
        // x!
        parent.append(div2);
        parent.append(div1);
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
        this.roundedValues = false;
        this.createRowData()
      },
      toggleRoundingChange2 () {
        this.roundedValues2 = false
      },
      toggleTableReset () {
        this.createStrucStorage();
        this.createColumnDefs()
      },
      pad (num, totalStringSize) {
        let asString = num + '';
        while (asString.length < totalStringSize) asString = '0' + asString;
        return asString
      },
      calculateRowCount () {
        if (this.gridOptions.api && this.rowData) {
          let totalRows = this.rowData.length;
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
          selectedRowsString.push(selectedRow.name)
        })
        let rawRowAmount = selectedRowsString.length
        this.rowChosenAmount = this.numberWithCommas(rawRowAmount)
        this.rowChosenList = selectedRowsString
        document.querySelector('#selectedRows').innerHTML = selectedRowsString
      },
      onVisionChanged () {
        this.readStructure();
        this.createColumnDefs()
      },
      onPositionChanged () {
        this.onVisionChanged()
      },
      numberWithCommas (number) {
        // return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return number.toString()
      },
      onQuickFilterChanged (event) {
        this.gridOptions.api.setQuickFilter(event.target.value)
      },
      insertGridOptions () {
        this.gridOptions = {
          rowSelection: 'multiple',
          rowMultiSelectWithClick: true,
          suppressPropertyNamesCheck: true,
          rowHeight: 30,
          defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true
          }
        }
      },
      createIcons () {
        this.icons = {
          groupExpanded: '<font-awesome-icon    :icon="this.faArrowCircleRight"></font-awesome-icon>',
          groupContracted: '<font-awesome-icon  :icon="this.faArrowCircleRight"></font-awesome-icon>',
          // font-awesome-icons not working
        }
      },
      readStructure () {
        let strucStorage = {};
        let strucArray = [];
        let columngroups = this.gridOptions.columnApi.getAllDisplayedColumnGroups();
        for (let entry of columngroups) {
          let childArray = [];
          let fileName = entry.originalColumnGroup.colGroupDef.headerName;
          let openByDefault = entry.originalColumnGroup.expanded;
          let children = entry.children;
          for (let child of children) {
            let fieldArray = [child.colDef.headerName, child.colDef.field];
            childArray.push(fieldArray)
          }
          strucArray.push([fileName, childArray, openByDefault])
        }
        strucStorage['data'] = strucArray;
        strucStorage['design'] = this.design;
        this.strucStorage = strucStorage
      },
      pushStructure () {
        let strucStorage = this.strucStorage;
        this.$store.commit(ADD_STRUC, strucStorage)
      },
      downloadCSV () {
        // first row with file names
        let topColumns = [];
        let fileCounter = 0;
        let fileList = this.$store.state.deseqlist;
        for (let file of fileList) {
          if (file[0] === undefined || file[0] === 'name') {
            topColumns.push(this.nameColumn())
          } else {
            topColumns.push(file);
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
        // removing 1st array element, which was shown as object[object] in csv
        // topColumns.shift()
        // creating columnHeaders
        let columnHeaders = [];
        while (fileCounter > 0) {
          columnHeaders.push('log2foldChange', 'p value (adjusted)', 'base mean', 'lfcSE', 'p value', 'stat');
          fileCounter = fileCounter - 1
        }
        // adding name only in the beginning of the column headers
        columnHeaders.unshift('name');
        // creating correct row data
        let rowData = [];
        rowData.push(topColumns);
        rowData.push(columnHeaders);
        let oneEntry = [];
        // let rowCounter = 0
        let store = this.$store.state.currentDGE;
        // iterate data
        for (let geneName of store.geneNames) {
          let gene = store.getGene(geneName);
          let myName = gene.name;
          oneEntry.push(myName);
          for (let analysis of gene.deseq2Analyses) {
            let myMean = analysis.baseMean;
            let mylog2fold = analysis.log2FoldChange;
            let mylfcSE = analysis.lfcSE;
            let myStat = analysis.stat;
            let mypValue = analysis.pValue;
            let mypAdj = analysis.pAdj;
            if (this.roundedValues2 === true) {
              myMean = Math.round(myMean * 100) / 100;
              mylog2fold = Math.round(mylog2fold * 100) / 100;
              mylfcSE = Math.round(mylfcSE * 100) / 100;
              myStat = Math.round(myStat * 100) / 100;
              mypValue = Math.round(mypValue * 100) / 100;
              mypAdj = Math.round(mypAdj * 100) / 100
            }
            // order is important
            oneEntry.push(mylog2fold, mypAdj, myMean, mylfcSE, mypValue, myStat)
          }
          // so far: array of arrays with inner array = one entry (entries in correct order)
          rowData.push(oneEntry);
          oneEntry = []
        }
        // expression to add row information taken from:
        // https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
        // to write csv, one 1D big array is needed. In order to give row info, we need newlines between each entry (inner array)
        let csvContent = rowData.map(e => e.join(',')).join('\n');
        // function to download csv taken from:
        // https://stackoverflow.com/questions/23301467/javascript-exporting-large-text-csv-file-crashes-google-chrome
        function downloadFile (data, fileName) {
          let csvData = data;
          let blob = new Blob([csvData], {type: 'application/csv;charset=utf-8;'});
          if (window.navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, fileName)
          } else {
            let link = document.createElement('a');
            let csvUrl = URL.createObjectURL(blob);
            link.href = csvUrl;
            link.style = 'invisibility: hidden';
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link)
          }
        }
        downloadFile(csvContent, 'GenExVis_Table.csv')
      }
    },
    computed: {
      isDisabledClearSubset () {
        return !(this.$store.state.subDGE.geneNames.size > 0)
      },
      isDisabledCreateSubset () {
        return !(this.rowChosenList.length > 0)
      },
      isDisabledAddGeneToSubset () {
        return !(this.rowChosenList.length > 0)
      },
      isDisabledSelectAllButton () {
        return this.rowChosenList.length === this.rowTotalAmount
      },
      isDisabledDeselectAllButton () {
        return !(this.rowChosenList.length > 0)
      },
      faUndoAlt () {
        return faUndoAlt
      },
      faDownload () {
        return faDownload
      },
      faGlobe () {
        return faGlobe
      },
      faCube () {
        return faCube
      },
      faPlusCircle () {
        return faPlusCircle
      },
      faArrowCircleRight () {
        return faArrowCircleRight
      },
      faArrowCircleLeft () {
        return faArrowCircleLeft
      },
      maxRowAmount () {
        return this.$store.state.currentDGE.length;
      },
      maxColAmount () {
        return this.$store.state.deseqlist.length;
      },
      isTableTooBig () {
        var vue = this
        // each field has 6 values
        return (vue.maxRowAmount * 6 * vue.maxColAmount) > 1500000
      }
    },
    beforeMount () {
      var vue = this
      if (vue.isTableTooBig === false) {
        vue.checkStorage();
        vue.createRowData();
        vue.minmaxdefine();
        vue.createColumnDefs();
        vue.insertGridOptions();
        vue.createIcons()
      }
    },
    mounted () {
      var vue = this
      if (vue.isTableTooBig === false) {
        vue.chooseDesign()
      }
    },
    beforeDestroy () {
      var vue = this
      if (vue.isTableTooBig === false) {
        vue.readStructure();
        vue.pushStructure()
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
    float: left; /* Float the buttons side by side */
  }

  .structureFlex {
    display: flex;

    height: 10rem;
  }
  .structureFlexCell {
    flex: 2;

    /*border: 1px solid dimgrey;*/
    background-color: #ffffff;
    text-align: center;
    vertical-align: bottom;

    padding: 0.8rem;
  }
  .chosenCellWrapper {
    height: 100%;
  }
  .topStructureFlexCell {
    border-radius: 10px 0 0 10px;
  }
  .bottomStructureFlexCell {
    border-radius: 0 10px 10px 0;
  }
  .selectedRowsflexWell {
    height: 80%;
    border: 1px solid lightgrey;
    border-radius: 5px;
    text-align: left;

    overflow-y: scroll;

    padding: 0.5rem;
  }
  .tableWrapper {
    height: 100%;
    width: 100%;
    border-radius: 5px;

    background-color: #6c757d;
  }
  .geneAmountTable {
    height: 100%;
    width: 100%;
  }
  .tableColumn1 {
    width: 60%;

    font-size: 2.2rem;
    font-weight: bold;
    text-align: right;
  }
  .tableColumn2 {
    width: 40%;

    font-size: 1.4rem;
    text-align: left;

    padding-left: 0.4rem;}
  .flexButtonWrapper {
    height: 100%;
  }
  .flexButtonGroup {
    height: 100%;
    width: 100%;
  }
  .flexButtonType1 {
    height: inherit;
    min-width: 6rem;

    color: white;
    font-size: 1.2rem;

    background-color: #4285f4;
  }
  .flexButtonType1:hover {
    background-color: #c3ddff
  }
  .currentlyChosen {
    text-align: left;
    overflow-y: scroll;
    height: 6rem;
    width:  100%;
    padding: 1rem;
  }
  .divWrapper {
    padding: 0.6rem;
  }
  .structureFlexOptions {
    height: 33%;
    padding: 0.1rem;
  }
  .flexOptionsWrapper {
    margin: 0 auto;
    display: inline-block;
    width: 80%
  }
  #quickFilterInput {
    width: 80%;
  }
  .resetTableButton {
    min-height: 1rem;
    width: 100%;

    background-color: #e3e2df;
    color: #6e2727;
    white-space: nowrap;
    border: 1px solid dimgrey;
    border-radius: 5px;
  }




  .main-table {
    /*adjustments for the main ag-grid table*/
    width: 100%;
    height: 30rem;
  }
  .main-no-table {
    display: flex; 
    flex-direction: column; 
    justify-content: center; 
    align-items: center;
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
    /*width: 11rem*/
  }
  /* Adds a background color on hover */
  .basic-button button:hover:enabled {
    /*background-color: deepskyblue;*/
  }

  /* Miri centered download button for .xlsx
  position relative to parent element*/
  /*.centerButton {
    position: relative;
    left: 45%;
  }*/
  @media(max-width: 1500px) {
    /*td {*/
    /*  display: table-row;*/
    /*  text-align: center;*/
    /*}*/
    /*.main-control-button {*/
    /*  width: 8.5rem;*/
    /*}*/
  }
</style>
