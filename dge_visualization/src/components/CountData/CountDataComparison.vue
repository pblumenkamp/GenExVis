<template>
  <div style="text-align: center">
    <h1>Gene Count Comparison</h1>

    <b-form-select v-model="selectedCondition1" style="width: auto" @change="selectedCondition2 = ''">
      <template slot="first">
        <option :value="''" disabled>-- Please select the first condition --</option>
      </template>
      <option v-for="cond in Array.from(dgeConditions)" :value="cond">{{ cond }}</option>
    </b-form-select>

    <b-form-select v-model="selectedCondition2" style="width: auto" @input="drawData"
                   :disabled="selectedCondition1 === ''">
      <template slot="first">
        <option :value="''" disabled>-- Please select the second condition --</option>
      </template>
      <option v-for="cond in Array.from(dgeConditions)" :value="cond" :disabled="cond === selectedCondition1">{{ cond }}
      </option>
    </b-form-select>

    <br>

    <b-form-select v-model="selectedNormalization" style="width: auto; margin-top: 1rem">
      <template slot="first">
        <option :value="''" disabled>-- Please select a normalization method --</option>
      </template>
      <option v-for="normalization in registeredNormalizationMethods" :value="normalization">{{ normalization }}</option>
    </b-form-select>

    <div id="countdata_countvscount" ref="countdata_countvscount"
         style="height: 40rem; min-width: 60%; max-width: 90%; margin: 0 auto"></div>

    <div v-if="selectedCondition1 && selectedCondition2">
      <hr>
      <b-container fluid border="1">
        <b-row class="my-1">
          <b-col sm="3"><label>use logarithmic scale</label></b-col>
          <b-col sm="3">
            <b-form-checkbox v-model="useLogarithmicScale" style="float: left;" @input="drawData"></b-form-checkbox>
          </b-col>
          <b-col sm="3"><label>color of significant genes</label></b-col>
          <b-col sm="3">
            <b-form-input type='color' v-model="colorSignificantGenes" style="float: left; padding: 0.05rem; min-width: 1rem; max-width: 2rem" @input="drawData"></b-form-input>
          </b-col>
        </b-row>
        <b-row class="my-3">
          <b-col sm="3"><label style="margin-top: 0.4rem;">adjusted p-value threshold</label></b-col>
          <b-col sm="3">
            <b-form-input type="number" v-model="adjPValueThreshold" step="0.001" max="1" min="0" style="width: 5rem;"
                          @change="drawData"></b-form-input>
          </b-col>
          <b-col sm="3"><label style="margin-top: 0.4rem;">log2 fold change band</label></b-col>
          <b-col sm="3">
            <b-form-input type="number" v-model="log2FoldChange" step="1"min="0" style="width: 5rem;"
                          @change="drawData"></b-form-input>
          </b-col>
        </b-row>
      </b-container>
      <hr>
      <b-container fluid border="1">
        <b-row align="left">
          <b-col sm="12">
            <span>
              <button type="button" class="btn btn-default table-button" @click="sortGenes">Sort Genes</button>
              <button type="button" class="btn btn-default table-button" @click="clearTable">Clear Table</button>
              <button class="btn btn-primary table-button" @click="createSubset()">Create Subset</button>
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
  const CHART_ID = 'countdata_countvscount'

  export default {
    name: 'DESeq2VolcanoPlot',
    data () {
      return {
        selectedCondition1: '',
        selectedCondition2: '',
        selectedNormalization: '',
        useLogarithmicScale: false,
        colorSignificantGenes: '#cc1926',
        log2FoldChange: '1',
        adjPValueThreshold: '0.01',
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
        let vue = this
        if (!(vue.selectedCondition1 && vue.selectedCondition2)) {
          return
        }

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
            text: `${vue.selectedCondition1} vs. ${vue.selectedCondition2}`
          },
          xAxis: {
            type: (this.useLogarithmicScale) ? 'logarithmic' : 'linear',
            title: {
              text: `${vue.selectedCondition1} (counts)`,
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
            min: (vue.useLogarithmicScale) ? 0.01 : 0
          },
          yAxis: {
            type: (this.useLogarithmicScale) ? 'logarithmic' : 'linear',
            title: {
              text: `${vue.selectedCondition2} (counts)`,
              style: {
                color: AXIS_COLOR
              }
            },
            labels: {
              style: {
                color: AXIS_COLOR
              }
            },
            min: (vue.useLogarithmicScale) ? 0.01 : 0
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
                radius: 2.5,
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
              }
            }
          },
          tooltip: {
            useHTML: true,
            headerFormat: '',
            pointFormat: '<b>{point.gene}</b><table style="margin-top: 0.5rem">' +
              `<tr><td>${this.selectedCondition1}:</td><td style="padding-left: 0.25rem; text-align: right">{point.x:,.1f}</td></tr>` +
              `<tr><td>${this.selectedCondition2}:</td><td style="padding-left: 0.25rem; text-align: right">{point.y:,.1f}</td></tr>` +
              '<tr style="height: 0.5rem"><td colspan="2"></td></tr>' +
              '<tr><td><b>{point.analysisDescription}</b></td></tr>' +
              '<tr><td>log2 fold change:</td><td style="padding-left: 0.25rem; text-align: right">{point.log2FC:,.3f}</td></tr>' +
              '<tr><td>p-value:</td><td style="padding-left: 0.25rem; text-align: right">{point.pValue}</td></tr>' +
              '<tr><td>adjusted p-value:</td><td style="padding-left: 0.25rem; text-align: right">{point.pAdj}</td></tr>',
            footerFormat: '</table>',
            followPointer: true
          },
          series: [{
            name: 'Genes',
            color: '#000000',
            id: 0,
            zIndex: 1,
            data: []
          }, {
            name: 'Significant genes outside of LFC band ',
            color: vue.colorSignificantGenes + '88',
            id: 1,
            zIndex: 2,
            data: []
          }, {
            name: '',
            type: 'line',
            lineWidth: 1,
            dashStyle: 'dot',
            color: '#7d7d80',
            id: 2,
            zIndex: 0,
            showInLegend: false,
            data: [],
            marker: {
              enabled: false
            },
            states: {
              hover: {
                lineWidth: 0
              }
            },
            enableMouseTracking: false
          }, {
            name: '',
            type: 'line',
            lineWidth: 1,
            color: '#5666ba',
            id: 3,
            zIndex: 0,
            showInLegend: false,
            data: [],
            marker: {
              enabled: false
            },
            states: {
              hover: {
                lineWidth: 0
              }
            },
            enableMouseTracking: false
          }, {
            name: '',
            type: 'line',
            lineWidth: 1,
            color: '#5666ba',
            id: 4,
            zIndex: 0,
            showInLegend: false,
            data: [],
            marker: {
              enabled: false
            },
            states: {
              hover: {
                lineWidth: 0
              }
            },
            enableMouseTracking: false
          }]
        }

        let series = options.series

        series[0].data = []
        series[1].data = []
        let dge = vue.$store.state.currentDGE
        let maxValue = 0
        for (let geneName of dge.geneNames) {
          let gene = dge.getGene(geneName)
          let countsA = Object.values(gene.getCountData(this.selectedNormalization, this.selectedCondition1))
          let countsB = Object.values(gene.getCountData(this.selectedNormalization, this.selectedCondition2))
          let analysis = gene.getDESEQ2Analysis(new ConditionPair(vue.selectedCondition1, vue.selectedCondition2))
          if (analysis === null) {
            analysis = gene.getDESEQ2Analysis(new ConditionPair(vue.selectedCondition2, vue.selectedCondition1))
          }
          let meanA = countsA.reduce((a, b) => a + b, 0) / countsA.length
          let meanB = countsB.reduce((a, b) => a + b, 0) / countsB.length
          let dataPoint = {
            gene: geneName,
            x: (vue.useLogarithmicScale) ? meanA + 0.01 : meanA,
            y: (vue.useLogarithmicScale) ? meanB + 0.01 : meanB,
            pValue: analysis.pValue.toExponential(2),
            pAdj: analysis.pAdj.toExponential(2),
            log2FC: analysis.log2FoldChange,
            analysisDescription: `${analysis.conditions.condition1} vs. ${analysis.conditions.condition2}`
          }

          maxValue = Math.max(dataPoint.x, dataPoint.y, maxValue)

          if (dataPoint.pAdj <= parseFloat(vue.adjPValueThreshold) && (dataPoint.log2FC >= parseFloat(vue.log2FoldChange) || dataPoint.log2FC <= -parseFloat(vue.log2FoldChange))) {
            options.series[1].data.push(dataPoint)
          } else {
            options.series[0].data.push(dataPoint)
          }
        }

        options.series[2].data = [(vue.useLogarithmicScale) ? [0.01, 0.01] : [0, 0], [maxValue, maxValue]]
        options.series[3].data = [(vue.useLogarithmicScale) ? [0.01, 0.01] : [0, 0], [maxValue, maxValue / Math.pow(2, vue.log2FoldChange)]]
        options.series[4].data = [(vue.useLogarithmicScale) ? [0.01, 0.01] : [0, 0], [maxValue / Math.pow(2, vue.log2FoldChange), maxValue]]

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
        return this.$store.state.registeredConditions.slice().sort()
      },
      /* dgeConditions () {
        let conditions1 = new Set()
        let conditions2 = new Set()
        for (let {condition1, condition2} of this.$store.state.currentDGE.conditionPairs) {
          if (this.$store.state.registeredConditions.indexOf(condition1) === -1 ||
              this.$store.state.registeredConditions.indexOf(condition2) === -1) {
            continue
          }
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
      }, */
      registeredNormalizationMethods () {
        if (this.$store.state.currentDGE.normalizationMethods.length > 0) {
          this.selectedNormalization = this.$store.state.currentDGE.normalizationMethods[0]
        }
        return this.$store.state.currentDGE.normalizationMethods
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
