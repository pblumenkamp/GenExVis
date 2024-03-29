/*eslint-env node*/
<template>
  <div style="text-align: center">
    <h1 class="header">MA Plot</h1>

    <b-form-select v-model="selectedCondition1" style="width: auto; margin-right: 0.5rem" @change="selectedCondition2 = ''">
      <template slot="first">
        <option :value="''" disabled>
          -- Please select the first condition --
        </option>
      </template>
      <option
        v-for="cond in conditions"
        :key="cond"
        :value="cond"
      >
        {{ cond }}
      </option>
    </b-form-select>

    <b-form-select
      v-model="selectedCondition2"
      style="width: auto; margin-left: 0.5rem"
      :disabled="selectedCondition1 === ''"
      @input="drawData"
    >
      <template slot="first">
        <option :value="''" disabled>
          -- Please select the second condition --
        </option>
      </template>
      <option
        v-for="cond in conditionMate"
        :key="cond"
        :value="cond"
      >
        {{ cond }}
      </option>
    </b-form-select>

    <div
      id="deseq2maplot_highcharts"
      ref="deseq2maplot_highcharts"
      style="height: 40rem; min-width: 60%; max-width: 90%; margin: 1rem auto 0;"
    ></div>

    <div v-if="selectedCondition1 && selectedCondition2">
      <hr>

      <b-container fluid>
        <b-row class="my-1">
          <b-col sm="3">
            <label style="margin-top: 0.4rem;">p-value threshold</label>
          </b-col>
          <b-col sm="9">
            <b-form-input
              v-model="inputPThreshold"
              type="number"
              min="0"
              max="1"
              step="0.001"
              style="width: 10rem;"
              @change="updatePThreshold"
            />
          </b-col>
        </b-row>
        <b-row class="my-1">
          <b-col sm="3">
            <label>use adjusted p-value</label>
          </b-col>
          <b-col sm="9">
            <b-form-checkbox v-model="useAdjPValue" style="float: left;" @input="drawData" />
          </b-col>
        </b-row>
      </b-container>
      <hr>
      <gene-table :features="rowNames" :condition-a="selectedCondition1" :condition-b="selectedCondition2" />
    </div>
  </div>
</template>

<script>
  import {ConditionPair} from '../../utilities/dge'
  import GeneTable from '../Utils/GeneTable'


  let Highcharts = require('highcharts')
  require('highcharts/modules/exporting')(Highcharts)
  require('highcharts/modules/offline-exporting')(Highcharts)

  const AXIS_COLOR = '#000000'
  const CHART_ID = 'deseq2maplot_highcharts'

  export default {
    name: 'Deseq2MAPlot',
    components: {
      GeneTable
    },
    data () {
      return {
        selectedCondition1: '',
        selectedCondition2: '',
        inputPThreshold: '0.001',
        useAdjPValue: true,
        rowNames: [],
      }
    },
    computed: {
      conditions () {
        return Array.from(this.$store.state.registeredConditions).sort()
      },
      conditionMate () {
        return Array.from(this.dge.getConditionMatesOf(this.selectedCondition1)).sort()
      },
      pThreshold () {
        return parseFloat(this.inputPThreshold)
      },
      dge () {
        return this.$store.state.currentDGE
      }
    },
    watch: {
      dge () {
        this.clearChart()
      }
    },
    methods: {
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
              text: 'Base Mean Count',
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
              text: 'Log2 Fold Change',
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
                    if (event.ctrlKey === true || event.shiftKey === true) {
                      vue.rowNames.push(this.gene)
                    } else {
                      vue.rowNames = []
                      vue.rowNames.push(this.gene)
                    }
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
          exporting: {
            buttons: {
              contextButton: {
                menuItems: ["printChart", "separator", "downloadPNG", "downloadJPEG", "downloadPDF", "downloadSVG"]
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
            name: ((this.useAdjPValue) ? 'adjusted p-value' : 'p-value') + ' > ' + this.pThreshold.toExponential(2),
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

        const chart = Highcharts.chart(CHART_ID, options)
        vue.$charts.length = 0
        vue.$charts.push(chart)

        const delay = ms => new Promise(res => setTimeout(res, ms))
        delay(1000).then(() => {
          for (const chart of vue.$charts) {
            chart.reflow()
          }
        })
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
    }
  }
</script>

<style scoped>

</style>
