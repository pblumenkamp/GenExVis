
<template>
  <div>
    <h1>Volcano Plot</h1>

    <b-form-select v-model="selectedCondition1" style="width: auto" @change="selectedCondition2 = ''">
      <template slot="first">
        <option :value="''" disabled>-- Please select the first condition --</option>
      </template>
      <option v-for="cond in Array.from(dgeConditions[0])" :value="cond">{{ cond }}</option>
    </b-form-select>

    <b-form-select v-model="selectedCondition2" style="width: auto" @input="drawData" :disabled="selectedCondition1 === ''">
      <template slot="first">
        <option :value="''" disabled>-- Please select the second condition --</option>
      </template>
      <option v-for="cond in Array.from(dgeConditions[1])" :value="cond" :disabled="!conditions2.has(cond)">{{ cond }}</option>
    </b-form-select>

    <div id="deseq2volcanoplot_highcharts" ref="deseq2volcanoplot_highcharts" style="height: 400px; min-width: 60%; max-width: 60%; margin: 0 auto"></div>
      <!--<highcharts :options="options" ref="highcharts" style="width: 60%; margin: auto;"></highcharts>-->

    <div v-if="selectedCondition1 && selectedCondition2">
      <hr>
      <b-container fluid border="1">
        <b-row class="my-1">
          <b-col sm="3"><label style="margin-top: 0.4rem;">p-value threshold</label></b-col>
          <b-col sm="9"><b-form-input type="number" v-model="inputPThreshold" step="0.001" max="1" min="0" style="width: 10rem;" @change="updatePThreshold"></b-form-input></b-col>
        </b-row>
        <b-row class="my-1">
          <b-col sm="3"><label>use adjusted p-value</label></b-col>
          <b-col sm="9"><b-form-checkbox v-model="useAdjPValue" style="float: left;" @input="drawData"></b-form-checkbox></b-col>
        </b-row>
        <b-row align="left">
          <b-col sm="12">
            <span>
              <button type="button" class="btn btn-default" @click="sortingGenes">Sort Genes</button>
              <button type="button" class="btn btn-default" @click="clearingTable">Clear Table</button>
              <button class="btn btn-primary" @click="fillthebasket()">Import Genes</button>
            </span>
          </b-col>
        </b-row>
        <b-row align="left">
          <b-col sm="12">
            <b-card>
              <!--<div border="1px" align="left" style="font-family: Ubuntu;"></div>-->
              <table width="100%">
                <thead>
                <tr>
                  <th width="14%" v-for="key in gridColumns">
                    {{ key }}
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="entry of gridData">
                  <td width="14%" v-for="key of gridColumns">
                    {{ entry[key] }}
                  </td>
                </tr>
                </tbody>
              </table>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
      </div>
    </div>
</template>

<script>
  import {ConditionPair} from '../../utilities/dge'
  import {SET_SUBDGE} from '../../store/action_constants'

  let Highcharts = require('highcharts')
  require('highcharts/modules/exporting')(Highcharts)
  require('highcharts/modules/offline-exporting')(Highcharts)

  const AXIS_COLOR = '#000000'
  const CHART_ID = 'deseq2volcanoplot_highcharts'

  export default {
    name: 'DESeq2VolcanoPlot',
    data () {
      return {
        selectedCondition1: '',
        selectedCondition2: '',
        inputPThreshold: '0.001',
        useAdjPValue: false,
        gridColumns: ['name', 'baseMean', 'log2FoldChange', 'lfcSE', 'stat', 'pValue', 'pAdj'],
        gridEntries: [],
        gridData: []
      }
    },
    components: {
      template: '#grid-template'
    },
    methods: {
      clearingTable () {
        console.log('clearingTable1 ' + this.gridData)
        this.gridEntries = []
        this.gridData = []
        console.log('clearingTable2 ' + this.gridData)
      },
      sortingGenes () {
        this.gridEntries.sort()
        this.collectingData()
      },
      collectingData () {
        console.log('collectingData ' + this.gridData)
        this.gridData.length = 0
        let storage = this.$store.state.dgeData
        for (let entry of this.gridEntries) {
          let dict = {}
          let dataArray = storage.getGene(entry)._deseq2_analyses
          for (let entry of this.gridColumns) {
            for (let subentry of dataArray) {
              dict[entry] = subentry[entry]
            }
          }
          dict.name = entry.toString()
          this.gridData.push(dict)
        }
      },
      fillthebasket () {
        console.log('import activated')
        let temparray = []
        let genestaken = this.gridEntries
        console.log(genestaken)
        for (let element of genestaken) {
          temparray.push(element)
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
        temparray.sort()
        this.$store.dispatch(SET_SUBDGE, {geneList: temparray})
        console.log(this.$store.state.subDGE)
      },
      drawData () {
        if (!(this.selectedCondition1 && this.selectedCondition2)) {
          return
        }
        // pulling down the current "this"
        let upperthis = this
        let options = {
          chart: {
            type: 'scatter',
            zoomType: 'xy'
          },
          navigation: {
            buttonOptions: {
              align: 'right',
              height: 30,
              width: 36,
              symbolStroke: '#ffffff',
              symbolSize: 18,
              symbolX: 18,
              symbolY: 15,
              symbolStrokeWidth: 1.5,
              theme: {
                fill: '#7d7d7d'
              }
            }
          },
          title: {
            text: `${this.selectedCondition1} vs. ${this.selectedCondition2}`
          },
          xAxis: {
            title: {
              text: 'log2 (fold change)',
              style: {
                color: AXIS_COLOR
              }
            },
            lineColor: AXIS_COLOR,
            tickColor: AXIS_COLOR,
            labels: {
              style: {
                color: AXIS_COLOR
              }
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true
          },
          yAxis: {
            title: {
              text: '-log10 (p-value)',
              style: {
                color: AXIS_COLOR
              }
            },
            labels: {
              style: {
                color: AXIS_COLOR
              }
            },
            plotLines: [{
              value: -Math.log10(this.pThreshold),
              color: 'black',
              dashStyle: 'shortdash',
              width: 1,
              label: {
                text: 'p-value: ' + this.pThreshold
              }
            }]
          },
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          },
          plotOptions: {
            series: {
              allowPointSelect: true,
              point: {
                events: {
                  click: function (event) {
                    let gridEntries = upperthis.gridEntries
                    let gridStorage = upperthis.gridData
                    if (gridEntries.length !== 0) {
                      if (event.ctrlKey === true || event.shiftKey === true) {
                        gridEntries.push(this.gene)
                      } else {
                        gridEntries.length = 0
                        gridEntries.push(this.gene)
                      }
                    } else {
                      gridStorage.length = 0
                      gridEntries.push(this.gene)
                    }
                    upperthis.collectingData()
                    // ------------------------
                    //
                    // let dict = {}
                    // let dataarray = testvar.getGene(this.gene)._deseq2_analyses
                    // for (let entry of gridColumns) {
                    //   for (let subentry of dataarray) {
                    //     dict[entry] = subentry[entry]
                    //   }
                    // }
                    // dict.name = this.gene
                    // if (Object.keys(gridstorage).length !== 0) {
                    //   if (event.ctrlKey === true || event.shiftKey === true) {
                    //     gridstorage.push(dict)
                    //   } else {
                    //     gridstorage.length = 0
                    //     gridstorage.push(dict)
                    //   }
                    // } else {
                    //   gridstorage.push(dict)
                    // }
                  }
                }
              }
            },
            scatter: {
              turboThreshold: Number.MAX_VALUE,
              boostThreshold: 1000,
              marker: {
                symbol: 'circle',
                radius: 3,
                states: {
                  hover: {
                    enabled: true,
                    lineColor: 'rgb(100,100,100)'
                  }
                }
              },
              states: {
                hover: {
                  marker: {
                    enabled: false
                  }
                }
              },
              tooltip: {
                // POINT INFORMATION
                headerFormat: '',
                pointFormat: '<b>{point.gene}</b><br>' +
                'log2 fold change: {point.x:.3f}<br>' +
                ((this.useAdjPValue) ? 'adjusted p-value' : 'p-value') + ': {point.yTooltip}'
              }
            }
          },
          series: [{
            name: '|log2 fold change| >= 2 AND p-value <= ' + this.pThreshold.toExponential(2),
            color: '#cc1926',
            zIndex: 2,
            id: 0,
            data: [{gene: 'abc', x: 0, y: 0}]
          },
          {
            name: '|log2 fold change| >= 2 OR p-value <= ' + this.pThreshold.toExponential(2),
            color: '#ccc223',
            zIndex: 1,
            id: 1,
            data: [{gene: 'abc', x: 0, y: 0}]
          },
          {
            name: 'Rest',
            color: '#000000',
            zIndex: 0,
            id: 2,
            data: [{gene: 'abc', x: 0, y: 0}]
          }]
        }

        let series = options.series

        series[0].data = []
        series[1].data = []
        series[2].data = []
        let dge = this.$store.state.currentDGE.getAllGenesFromDESeq2(this.selectedCondition1, this.selectedCondition2)
        let logPThreshold = -Math.log10(this.pThreshold)
        for (let geneName of dge.geneNames) {
          let gene = dge.getGene(geneName)
          let analysis = gene.getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2))
          let y = (this.useAdjPValue) ? analysis.pAdj : analysis.pValue
          let dataPoint = {
            gene: geneName,
            x: analysis.log2FoldChange,
            y: -Math.log10(y),
            yTooltip: y.toExponential(2)
          }

          if (Math.abs(dataPoint.x) >= 2 && dataPoint.y >= logPThreshold) {
            options.series[0].data.push(dataPoint)
          } else if (Math.abs(dataPoint.x) >= 2 || dataPoint.y >= logPThreshold) {
            options.series[1].data.push(dataPoint)
          } else {
            options.series[2].data.push(dataPoint)
          }
        }

        Highcharts.chart(CHART_ID, options)
      },
      clearChart () {
        this.selectedCondition1 = ''
        this.selectedCondition2 = ''
        let node = this.$refs[CHART_ID]
        while (node.firstChild) {
          node.removeChild(node.firstChild)
        }
      },
      updatePThreshold () {
        this.drawData()
      }
    },
    computed: {
      dgeConditions () {
        let conditions1 = new Set()
        let conditions2 = new Set()
        for (let {condition1, condition2} of this.$store.state.currentDGE.conditionPairs) {
          conditions1.add(condition1)
          conditions2.add(condition2)
        }
        return [conditions1, conditions2]
      },
      conditions2 () {
        let conditions2 = new Set()
        for (let {condition1, condition2} of this.$store.state.currentDGE.conditionPairs) {
          if (condition1 === this.selectedCondition1) {
            conditions2.add(condition2)
          }
        }
        return conditions2
      },
      pThreshold () {
        return parseFloat(this.inputPThreshold)
      },
      dge () {
        return this.$store.state.currentDGE
      }
    },
    watch: {
      dge (newDGE, oldDGE) {
        this.clearChart()
      }
    }
  }
</script>
<style scoped>
  tr, th, td {
    border: 1px solid lightgrey;
    border-collapse: collapse;
    font-family: Ubuntu;
  }
  th {
    background-color: #F6F8F7;
  }
</style>
