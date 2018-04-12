<template>
  <div>
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

    <div id="deseq2maplot_highcharts" style="height: 400px; min-width: 60%; max-width: 60%; margin: 0 auto"></div>

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
    </div>
  </div>
</template>

<script>
  import {ConditionPair} from '@/utilities/dge'

  var Highcharts = require('highcharts')

  const AXIS_COLOR = '#000000'

  export default {
    name: 'Deseq2MAPlot',
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
        let options = {
          chart: {
            type: 'scatter',
            zoomType: 'xy'
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
            scatter: {
              turboThreshold: 50000,
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
                'base mean count: {point.x:.2f}<br>' +
                'log2 fold change: {point.y:.2f}<br>' +
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
        let dge = this.$store.state.dgeData.getAllGenesFromDESeq2(this.selectedCondition1, this.selectedCondition2)
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

        Highcharts.chart('deseq2maplot_highcharts', options)
      },
      updatePThreshold () {
        this.drawData()
      }
    },
    computed: {
      dgeConditions () {
        let conditions1 = new Set()
        let conditions2 = new Set()
        for (let {condition1, condition2} of this.$store.state.dgeData.conditionPairs) {
          conditions1.add(condition1)
          conditions2.add(condition2)
        }
        return [conditions1, conditions2]
      },
      conditions2 () {
        let conditions2 = new Set()
        for (let {condition1, condition2} of this.$store.state.dgeData.conditionPairs) {
          if (condition1 === this.selectedCondition1) {
            conditions2.add(condition2)
          }
        }
        return conditions2
      },
      pThreshold () {
        return parseFloat(this.inputPThreshold)
      }
    }
  }
</script>
