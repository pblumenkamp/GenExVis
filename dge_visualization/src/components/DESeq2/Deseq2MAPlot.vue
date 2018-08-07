<template>
  <div style="text-align: center">
    <h1>
      MA Plot
    </h1>

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

    <div id="deseq2maplot_highcharts" ref="deseq2maplot_highcharts" style="height: 40rem; min-width: 60%; max-width: 90%; margin: 0 auto"></div>

    <div v-if="selectedCondition1 && selectedCondition2">
      <hr>

      <b-container fluid>
        <b-row class="my-1">
          <b-col sm="3"><label style="margin-top: 0.4rem;">p-value threshold</label></b-col>
          <b-col sm="9"><b-form-input type="number" v-model="inputPThreshold" step="0.001" max="1" min="0" style="width: 10rem;" @change="updatePThreshold"></b-form-input></b-col>
        </b-row>
        <b-row class="my-1">
          <b-col sm="3"><label>use adjusted p-value</label></b-col>
          <b-col sm="9"><b-form-checkbox v-model="useAdjPValue" style="float: left;" @input="drawData"></b-form-checkbox></b-col>
        </b-row>
      </b-container>

      <hr>

      <b-container fluid border="1" style="margin-bottom: 2rem">
        <b-row align="left">
          <b-col sm="12">
            <span>
              <button type="button" class="btn btn-default table-button" @click="sortGenes">Sort Genes</button>
              <button type="button" class="btn btn-default table-button" @click="clearTable">Clear Table</button>
              <button class="btn btn-primary table-button" @click="createSubset()">Import Genes</button>
            </span>
          </b-col>
        </b-row>
        <b-row align="left">
          <b-col sm="12">
            <b-card>
              <table width="100%">
                <thead>
                <tr>
                  <th width="14%" v-for="key in tableHeader">
                    {{ key }}
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="entry of tableData">
                  <td width="14%" v-for="key of tableHeader">
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
  const CHART_ID = 'deseq2maplot_highcharts'

  export default {
    name: 'Deseq2MAPlot',
    data () {
      return {
        selectedCondition1: '',
        selectedCondition2: '',
        inputPThreshold: '0.001',
        useAdjPValue: false,
        tableHeader: ['name', 'baseMean', 'log2FoldChange', 'lfcSE', 'stat', 'pValue', 'pAdj'],
        rowNames: [],
        tableData: []
      }
    },
    methods: {
      clearTable () {
        this.rowNames = []
        this.tableData = []
      },
      sortGenes () {
        this.rowNames.sort()
        this.collectData()
      },
      collectData () {
        this.tableData = []
        let storage = this.$store.state.currentDGE
        for (let geneName of this.rowNames) {
          let tableRow = {}
          let deseq2Analysis = storage.getGene(geneName).getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2))
          for (let colName of this.tableHeader) {
            tableRow[colName] = deseq2Analysis[colName]
          }
          tableRow.name = geneName
          this.tableData.push(tableRow)
        }
      },
      createSubset () {
        let geneNames = []
        for (let geneName of this.rowNames) {
          geneNames.push(geneName)
        }
        geneNames.sort()
        this.$store.dispatch(SET_SUBDGE, {geneList: geneNames})
      },
      drawData () {
        if (!(this.selectedCondition1 && this.selectedCondition2)) {
          return
        }
        let vue = this
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
            type: 'logarithmic',
            min: 1,
            title: {
              text: 'base mean count',
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
            showLastLabel: true,
            tickInterval: 1
          },
          yAxis: {
            title: {
              text: 'log2 (fold change)',
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
              value: 0,
              color: '#ff0000',
              dashStyle: 'solid',
              width: 2
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
                    if (vue.rowNames.length !== 0) {
                      if (event.ctrlKey === true || event.shiftKey === true) {
                        vue.rowNames.push(this.gene)
                      } else {
                        vue.rowNames = []
                        vue.rowNames.push(this.gene)
                      }
                    } else {
                      vue.tableData = []
                      vue.rowNames.push(this.gene)
                    }
                    vue.collectData()
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
                headerFormat: '',
                pointFormat: '<b>{point.gene}</b><br>' +
                'base mean: {point.x:.3f}<br>' +
                'log2 fold change: {point.y:.3f}<br>' +
                'p-value: {point.pValue}<br>' +
                'adjusted p-value: {point.adjPValue}'
              }
            }
          },
          series: [{
            name: ((this.useAdjPValue) ? 'adjusted p-value' : 'p-value') + ' <= ' + this.pThreshold.toExponential(2),
            color: '#ba0001',
            zIndex: 1,
            id: 0,
            data: [{gene: 'abc', x: 1, y: 1, pValue: 1, adjPValue: 1}]
          },
          {
            name: 'Rest',
            color: '#000000',
            id: 1,
            zIndex: 0,
            data: [{gene: 'abc', x: 1, y: 1, pValue: 1, adjPValue: 1}]
          }]
        }

        let series = options.series

        series[0].data = []
        series[1].data = []
        let dge = this.$store.state.currentDGE.getAllGenesFromDESeq2(this.selectedCondition1, this.selectedCondition2)
        for (let geneName of dge.geneNames) {
          let gene = dge.getGene(geneName)
          let analysis = gene.getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2))
          if (analysis.baseMean > 0) {
            let dataPoint = {
              gene: geneName,
              x: analysis.baseMean,
              y: analysis.log2FoldChange,
              pValue: analysis.pValue.toExponential(2),
              adjPValue: analysis.pAdj.toExponential(2)
            }

            if ((this.useAdjPValue && analysis.pAdj <= this.pThreshold) || (!this.useAdjPValue && analysis.pValue <= this.pThreshold)) {
              options.series[0].data.push(dataPoint)
            } else {
              options.series[1].data.push(dataPoint)
            }
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
    padding-left: 0.4rem;
  }
  th {
    background-color: #F6F8F7;
  }
  .table-button {
    margin: 0.2rem 0.2rem 0.4rem;
  }
</style>
