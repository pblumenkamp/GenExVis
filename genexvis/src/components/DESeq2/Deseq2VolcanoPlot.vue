/*eslint-env node*/
<template>
  <div style="text-align: center">
    <h1 class="header">Volcano Plot</h1>

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
      id="deseq2volcanoplot_highcharts"
      ref="deseq2volcanoplot_highcharts"
      style="height: 40rem; min-width: 60%; max-width: 90%; margin: 1rem auto 0;"
    ></div>

    <div v-if="selectedCondition1 && selectedCondition2">
      <hr>
      <b-container fluid border="1">
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
  const CHART_ID = 'deseq2volcanoplot_highcharts'

  export default {
    name: 'DESeq2VolcanoPlot',
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
              text: 'Log2 Fold Change',
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
              text: (this.useAdjPValue) ? '-Log10 (Adjusted P-Value)' : '-Log10 (P-Value)',
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
                useHTML: true,
                headerFormat: '',
                pointFormat: '<b>{point.gene}</b><br>' +
                'log2 fold change: {point.x:.3f}<br>' +
                'base mean: {point.baseMean:.3f}<br>' +
                ((this.useAdjPValue) ? 'adjusted p-value' : 'p-value') + ': {point.yTooltip}'
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
            //name: '|log2 fold change >= 2 AND p-value <= ' + vue.pThreshold.toExponential(2),
            name: 'Statistically significant AND highly expressed',
            color: '#cc1926',
            zIndex: 2,
            id: 0,
            data: []
          },
          {
            //name: '|log2 fold change| >= 2 OR p-value <= ' + vue.pThreshold.toExponential(2),
            name: 'Statistically significant OR highly expressed',
            color: '#ccc223',
            zIndex: 1,
            id: 1,
            data: []
          },
          {
            name: 'Neither statistically significant nor highly expressed',
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
          let pValue = (vue.useAdjPValue) ? analysis.pAdj : analysis.pValue
          let dataPoint = {
            gene: geneName,
            x: analysis.log2FoldChange,
            y: -Math.log10(pValue),
            yTooltip: pValue.toExponential(2),
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

        const chart = Highcharts.chart(CHART_ID, options)
        vue.$charts.length = 0
        vue.$charts.push(chart)
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
