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

    <b-form-select v-model="selectedCondition2" style="width: auto" @input="drawData" :disabled="selectedCondition1 === ''">
      <template slot="first">
        <option :value="''" disabled>-- Please select the second condition --</option>
      </template>
      <option v-for="cond in Array.from(dgeConditions[1])" :value="cond" :disabled="!conditions2.has(cond)">{{ cond }}</option>
    </b-form-select>

    <div v-if="selectedCondition1 && selectedCondition2">
      <highcharts :options="options" ref="highcharts" style="width: 60%; margin: auto;"></highcharts>

      <hr>

      <b-container fluid>
        <b-row class="my-1">
          <b-col sm="3"><label>p-value threshold</label></b-col>
          <b-col sm="9"><b-form-input type="number" v-model="pThreshold" step="0.001" max="1" min="0" style="width: auto;" @change="updatePThreshold"></b-form-input></b-col>
          <b-col sm="3"><label>use adjusted p-value</label></b-col>
          <b-col sm="9"><b-form-checkbox v-model="useAdjPValue" @input="drawData"></b-form-checkbox></b-col>
        </b-row>
      </b-container>


    </div>

  </div>
</template>

<script>
  import {ConditionPair} from '@/utilities/dge'

  const AXIS_COLOR = '#000000'

  export default {
    name: 'DESeq2VolcanoPlot',
    data () {
      return {
        selectedCondition1: '',
        selectedCondition2: '',
        pThreshold: 0.01,
        useAdjPValue: false,
        options: {}
      }
    },
    methods: {
      drawData () {
        this.options = {
          chart: {
            type: 'scatter',
            zoomType: 'xy'
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
                //               formatter: function () {
//                  return this.point.name
//                }
                headerFormat: '',
                pointFormat: '<b>{point.gene}</b><br>log2 fold change: {point.x:.3f}<br>' +
                ((this.useAdjPValue) ? 'adjusted p-value' : 'p-value') + ': {point.yTooltip}'
              }
            }
          },
          series: [{
            name: '|log2 fold change| >= 2 AND p-value >= ' + this.pThreshold,
            color: '#cc1926',
            zIndex: 2,
            id: 0,
            data: [{gene: 'abc', x: 0, y: 0}]
          },
          {
            name: '|log2 fold change| >= 2 OR p-value >= ' + this.pThreshold,
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

        let series = this.options.series

        series[0].data = []
        series[1].data = []
        series[2].data = []
        let dge = this.$store.state.dgeData.getAllGenesFromDESeq2(this.selectedCondition1, this.selectedCondition2)
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
            this.options.series[0].data.push(dataPoint)
          } else if (Math.abs(dataPoint.x) >= 2 || dataPoint.y >= logPThreshold) {
            this.options.series[1].data.push(dataPoint)
          } else {
            this.options.series[2].data.push(dataPoint)
          }
        }
      },
      updatePThreshold () {
        this.drawData()
        /* let chart = this.$refs.highcharts.chart
        chart.update({
          yAxis: {
            plotLines: [{
              value: -Math.log10(this.pThreshold),
              color: 'black',
              dashStyle: 'shortdash',
              width: 1,
              label: {
                text: 'p-value: ' + this.pThreshold
              }
            }]
          }
        })
        chart.update({
          series: [
            {
              name: '|log2 fold change| >= 2 || p-value >= ' + this.pThreshold,
              id: 1
            },
            {
              name: '|log2 fold change| >= 2 && p-value >= ' + this.pThreshold,
              id: 0
            }
          ]
        }) */
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
      }
    }
  }
</script>
