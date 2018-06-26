<template>
  <div>
    <h1>
      Volcano Plot
    </h1>

    <b-form-select v-model="selectedCondition1" style="width: auto" @change="selectedCondition2 = ''">
      <template slot="first">
        <option :value="''" disabled>-- Please select the first condition --</option>
      </template>
      <option v-for="cond in Array.from(dgeConditions[0])" :value="cond">{{ cond }}</option>
    </b-form-select>

    <b-form-select v-model="selectedCondition2" style="width: auto" @input="drawData"
                   :disabled="selectedCondition1 === ''">
      <template slot="first">
        <option :value="''" disabled>-- Please select the second condition --</option>
      </template>
      <option v-for="cond in Array.from(dgeConditions[1])" :value="cond" :disabled="!conditions2.has(cond)">{{ cond }}
      </option>
    </b-form-select>

    <div id="deseq2volcanoplot_highcharts" ref="deseq2volcanoplot_highcharts"
         style="height: 400px; min-width: 60%; max-width: 60%; margin: 0 auto"></div>
    <!--<highcharts :options="options" ref="highcharts" style="width: 60%; margin: auto;"></highcharts>-->

    <div v-if="selectedCondition1 && selectedCondition2">
      <hr>

      <b-container fluid>
        <b-row class="my-1">
          <b-col sm="3"><label style="margin-top: 0.4rem;">p-value threshold</label></b-col>
          <b-col sm="9">
            <b-form-input type="number" v-model="inputPThreshold" step="0.001" max="1" min="0" style="width: 10rem;"
                          @change="updatePThreshold"></b-form-input>
          </b-col>
        </b-row>
        <b-row class="my-1">
          <b-col sm="3"><label>use adjusted p-value</label></b-col>
          <b-col sm="9">
            <b-form-checkbox v-model="useAdjPValue" style="float: left;" @input="drawData"></b-form-checkbox>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
  import {ConditionPair} from '../../utilities/dge'

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
        useAdjPValue: false
      }
    },
    methods: {
      drawData () {
        let vue = this
        if (!(vue.selectedCondition1 && vue.selectedCondition2)) {
          return
        }

        /* let pointTooltip = (function (data, cond1, cond2) {
          let tooltip = '<table>' +
            '<tr><td>log2 fold change:</td><td></td><td></td><td>{point.x:.3f}</td></tr>' +
            '<tr><td>base mean:</td><td></td><td></td><td>{point.baseMean:.3f}</td></tr>'
          if (data.normalizationMethods.size !== 0) {
            tooltip += '<tr><td>counts:</td></tr>'
            for (let normalization of data.normalizationMethods) {
              tooltip += '<tr><td></td><td>' + normalization + '</td></tr>' +
                '<tr><td></td><td></td><td>' + cond1 + ':</td> <td>{point.' + normalization + '_counts1}</td></tr>' +
                '<tr><td></td><td></td><td>' + cond2 + ':</td> <td>{point.' + normalization + '_counts2}</td></tr>'
            }
          }
          tooltip += '<tr><td>' + ((vue.useAdjPValue) ? 'adjusted p-value' : 'p-value') + ':</td><td></td><td></td><td>{point.yTooltip}</td></tr></table>'
          return tooltip
        }(vue.$store.state.currentDGE, vue.selectedCondition1, vue.selectedCondition2)) */

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
              value: -Math.log10(vue.pThreshold),
              color: 'black',
              dashStyle: 'shortdash',
              width: 1,
              label: {
                text: 'p-value: ' + vue.pThreshold
              }
            }]
          },
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          },
          plotOptions: {
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
                useHTML: true,
                headerFormat: '',
                pointFormat: '<b>{point.gene}</b><br>' +
                'log2 fold change: {point.x:.3f}<br>' +
                'base mean: {point.baseMean:.3f}<br>' +
                ((this.useAdjPValue) ? 'adjusted p-value' : 'p-value') + ': {point.yTooltip}'
              }
            }
          },
          series: [{
            name: '|log2 fold change|cd ..' +
            ' >= 2 AND p-value <= ' + vue.pThreshold.toExponential(2),
            color: '#cc1926',
            zIndex: 2,
            id: 0,
            data: []
          },
          {
            name: '|log2 fold change| >= 2 OR p-value <= ' + vue.pThreshold.toExponential(2),
            color: '#ccc223',
            zIndex: 1,
            id: 1,
            data: []
          },
          {
            name: 'Rest',
            color: '#000000',
            zIndex: 0,
            id: 2,
            data: []
          }]
        }

        let series = options.series

        series[0].data = []
        series[1].data = []
        series[2].data = []
        let dge = vue.$store.state.currentDGE.getAllGenesFromDESeq2(vue.selectedCondition1, vue.selectedCondition2)
        let logPThreshold = -Math.log10(vue.pThreshold)
        for (let geneName of dge.geneNames) {
          let gene = dge.getGene(geneName)
          let analysis = gene.getDESEQ2Analysis(new ConditionPair(vue.selectedCondition1, vue.selectedCondition2))
          let y = (vue.useAdjPValue) ? analysis.pAdj : analysis.pValue
          let dataPoint = {
            gene: geneName,
            x: analysis.log2FoldChange,
            y: -Math.log10(y),
            yTooltip: y.toExponential(2),
            baseMean: analysis.baseMean
          }

          if (gene.normalizationMethods.length !== 0) {
            let average = list => {
              let sum = 0
              let n = 0
              for (let key in list) {
                if (list.hasOwnProperty(key)) {
                  sum += list[key]
                  n++
                }
              }
              return sum / n
            }
            for (let normalization of gene.normalizationMethods) {
              dataPoint[normalization + '_counts1'] = average(gene.getCountData(normalization, vue.selectedCondition1))
              dataPoint[normalization + '_counts2'] = average(gene.getCountData(normalization, vue.selectedCondition2))
            }
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
