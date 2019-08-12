/*eslint-env node*/
<template>
  <div style="text-align: center">
    <h1>DESeq2 - Statistics Distribution</h1>

    <b-form-select v-model="selectedCondition1" style="width: auto" @change="selectedCondition2 = ''">
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
      style="width: auto"
      :disabled="selectedCondition1 === ''"
      @input="initializeSettings"
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

    <b-form-select v-model="selectedDistributionType" style="width: auto; margin-left: 2rem" @input="initializeSettings">
      <template slot="first">
        <option :value="distributionTypes[0]">
          {{ distributionTypes[0] }}
        </option>
      </template>
      <option
        v-for="cond in Array.from(distributionTypes.slice(1))"
        :key="cond"
        :value="cond"
      >
        {{ cond }}
      </option>
    </b-form-select>

    <hr>

    <div
      id="deseq2_pvalue_distribution_highcharts"
      ref="deseq2_pvalue_distribution_highcharts"
      style="height: 40rem; min-width: 60%; max-width: 90%; margin: 0 auto"
    ></div>

    <div v-if="selectedCondition1 && selectedCondition2">
      <hr>
      <b-container fluid border="1" style="text-align: right">
        <b-row class="my-2">
          <b-col sm="2">
            <label>logarithmic y-axis</label>
          </b-col>
          <b-col sm="10">
            <b-form-checkbox v-model="useLogYAxis" style="float: left;" @input="updateYAxis" />
          </b-col>
        </b-row>
        <template v-if="selectedDistributionType === 'p-value' || selectedDistributionType === 'adj. p-value'">
          <b-row class="my-2">
            <b-col sm="2">
              <label>min value x-axis</label>
            </b-col>
            <b-col sm="2">
              <b-form-input
                v-model="xAxisMinValue"
                :state="validPValueMin"
                type="number"
                step="0.01"
                max="1"
                min="0"
                style="float: left; width: 6rem;"
                @change="updateXAxis"
              />
            </b-col>
            <b-col sm="2">
              <label>max value x-axis</label>
            </b-col>
            <b-col sm="2">
              <b-form-input
                v-model="xAxisMaxValue"
                :state="validPValueMax"
                type="number"
                step="0.01"
                max="1"
                min="0"
                style="float: left; width: 6rem;"
                @change="updateXAxis"
              />
            </b-col>
            <b-col sm="2">
              <label>stepsize</label>
            </b-col>
            <b-col sm="2">
              <b-form-input
                v-model="xAxisStepsize"
                :state="validPValueStepsize"
                type="number"
                step="0.01"
                max="1"
                min="0"
                style="float: left; width: 6rem;"
                @change="updateXAxis"
              />
            </b-col>
          </b-row>
          <b-row class="my-3">
            <b-col sm="12" style="text-align: center">
              <b-button @click="resetPValueSettings">
                Reset
              </b-button>
            </b-col>
          </b-row>
        </template>
        <template v-if="selectedDistributionType === 'log2 fold change'">
          <b-row class="my-2">
            <b-col sm="2">
              <label>min value x-axis</label>
            </b-col>
            <b-col sm="2">
              <b-form-input
                v-model="xAxisMinValue"
                type="number"
                step="1"
                style="float: left; width: 6rem;"
                @change="updateXAxis"
              />
            </b-col>
            <b-col sm="2">
              <label>max value x-axis</label>
            </b-col>
            <b-col sm="2">
              <b-form-input
                v-model="xAxisMaxValue"
                type="number"
                step="1"
                style="float: left; width: 6rem;"
                @change="updateXAxis"
              />
            </b-col>
            <b-col sm="2">
              <label>stepsize</label>
            </b-col>
            <b-col sm="2">
              <b-form-input
                v-model="xAxisStepsize"
                :state="validLFCStepsize"
                type="number"
                min="0"
                step="1"
                style="float: left; width: 6rem;"
                @change="updateXAxis"
              />
            </b-col>
          </b-row>
          <b-row class="my-3">
            <b-col sm="12" style="text-align: center">
              <b-button @click="resetLFCSettings">
                Reset
              </b-button>
            </b-col>
          </b-row>
        </template>
      </b-container>
    </div>
  </div>
</template>

<script>
  import {ConditionPair} from '../../utilities/dge'

  let Highcharts = require('highcharts')
  require('highcharts/modules/exporting')(Highcharts)
  require('highcharts/modules/offline-exporting')(Highcharts)

  let debounce = require('lodash.debounce')

  const AXIS_COLOR = '#000000'
  const CHART_ID = 'deseq2_pvalue_distribution_highcharts'

  let chart = {}

  export default {
    name: 'Deseq2Distributions',
    data () {
      return {
        selectedCondition1: '',
        selectedCondition2: '',
        selectedDistributionType: 'p-value (adjusted)',
        distributionTypes: ['p-value', 'p-value (adjusted)', 'log2 fold change'],
        xAxisMinValue: 0,
        xAxisMaxValue: 1,
        xAxisStepsize: 0.01,
        useLogYAxis: false,
        bins: 80
      }
    },
    computed: {
      conditions () {
        return Array.from(this.$store.state.registeredConditions).sort()
      },
      conditionMate () {
        return Array.from(this.dge.getConditionMatesOf(this.selectedCondition1)).sort()
      },
      dge () {
        return this.$store.state.currentDGE
      },
      validPValueMin () {
        return (this.xAxisMinValue >= 0 && this.xAxisMaxValue > this.xAxisMinValue) ? null : false
      },
      validPValueMax () {
        return (this.xAxisMaxValue <= 1 && this.xAxisMaxValue > this.xAxisMinValue) ? null : false
      },
      validPValueStepsize () {
        return (this.xAxisStepsize > 0 && this.xAxisStepsize < 1) ? null : false
      },
      validLFCStepsize () {
        return (this.xAxisStepsize > 0) ? null : false
      },
      lfcData () {
        let data = []
        let dge = this.$store.state.currentDGE.getAllGenesFromDESeq2(this.selectedCondition1, this.selectedCondition2)
        for (let geneName of dge.geneNames) {
          let gene = dge.getGene(geneName)
          let analysis = gene.getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2))
          let value = analysis.log2FoldChange
          if (!isNaN(value)) {
            data.push(value)
          }
        }
        return data
      },
      pValueData () {
        let data = []
        let dge = this.$store.state.currentDGE.getAllGenesFromDESeq2(this.selectedCondition1, this.selectedCondition2)
        for (let geneName of dge.geneNames) {
          let gene = dge.getGene(geneName)
          let analysis = gene.getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2))
          let value = analysis.pValue
          if (!isNaN(value)) {
            data.push(value)
          }
        }
        return data
      },
      adjustedPValueData () {
        let data = []
        let dge = this.$store.state.currentDGE.getAllGenesFromDESeq2(this.selectedCondition1, this.selectedCondition2)
        for (let geneName of dge.geneNames) {
          let gene = dge.getGene(geneName)
          let analysis = gene.getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2))
          let value = analysis.pAdj
          if (!isNaN(value)) {
            data.push(value)
          }
        }
        return data
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

        if (vue.xAxisMinValue >= vue.xAxisMaxValue || vue.xAxisStepsize <= 0) {
          return
        }

        let options = {
          chart: {
            type: 'column',
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
          subtitle: {
            text: ''
          },
          legend: {
            enabled: false
          },
          xAxis: {
            title: {
              text: this.selectedDistributionType,
              style: {
                color: AXIS_COLOR
              }
            },
            lineColor: AXIS_COLOR,
            tickColor: AXIS_COLOR,
            labels: {
              style: {
                color: AXIS_COLOR
              },
              rotation: -90
            },
            categories: [],
            crosshair: true,
            tickmarkPlacement: 'on',
            startOnTick: true,
            endOnTick: false
          },
          yAxis: {
            title: {
              text: 'Frequency',
              style: {
                color: AXIS_COLOR
              }
            },
            labels: {
              style: {
                color: AXIS_COLOR
              }
            }
          },
          tooltip: {
            headerFormat: '',
            formatter: function () {
              if (this.point.index < this.series.data.length - 2) {
                return '<b>' + this.point.category + ' ≤ p-value < ' + this.series.data[this.point.index + 1].category + '</b><br>Frequency: ' + this.y
              } else {
                return '<b> p-value = ' + this.point.category + '</b><br>Frequency: ' + this.y
              }
            }
          },
          plotOptions: {
            column: {
              grouping: false,
              pointPlacement: 0.5,
              borderWidth: 0.1,
              groupPadding: 0,
              shadow: false,
              pointPadding: 0
            }
          },
          series: [
            {
              name: 'distribution',
              data: []
            }
          ]
        }

        if (vue.useLogYAxis) {
          options.yAxis = Object.assign(options.yAxis, {
            type: 'logarithmic',
            minorTickInterval: 0.1
          })
        }

        let data
        switch (vue.selectedDistributionType) {
          case 'p-value':
            data = vue.createHistogram(parseFloat(vue.xAxisMinValue) || 0, parseFloat(vue.xAxisMaxValue) || 1,
              parseFloat(vue.xAxisStepsize) || 0.01, vue.pValueData)
            break
          case 'p-value (adjusted)':
            data = vue.createHistogram(parseFloat(vue.xAxisMinValue) || 0, parseFloat(vue.xAxisMaxValue) || 1,
              parseFloat(vue.xAxisStepsize) || 0.01, vue.adjustedPValueData)
            break
          case 'log2 fold change':
            try {
              data = vue.createHistogram(parseFloat(vue.xAxisMinValue), parseFloat(vue.xAxisMaxValue),
                parseFloat(vue.xAxisStepsize), vue.lfcData)
            } catch (err) {
              return
            }
            break
        }

        options.series[0].data = data.data
        options.xAxis.categories = data.categories
        options.subtitle.text = `${data.usedCounts} of ${data.maxCounts} counts`

        chart = Highcharts.chart(CHART_ID, options)
      },
      createHistogram (minValue, maxValue, stepsize, data) {
        let stepsizeDecimals = (Math.floor(stepsize) === stepsize) ? 0 : stepsize.toString().split('.')[1].length
        let minDecimals = (Math.floor(minValue) === minValue) ? 0 : minValue.toString().split('.')[1].length
        let maxDecimals = (Math.floor(maxValue) === maxValue) ? 0 : maxValue.toString().split('.')[1].length
        let decimals = Math.max(stepsizeDecimals, minDecimals, maxDecimals)
        let powerOfTen = Math.pow(10, decimals)
        let bins = Math.floor((maxValue * powerOfTen - minValue * powerOfTen) * (1 / (stepsize * powerOfTen)) + 1)

        let binnedData = new Array(bins)
        binnedData.fill(0)
        for (let datapoint of data) {
          if (datapoint >= minValue && datapoint <= (bins - 1) * stepsize + minValue) {
            binnedData[Math.floor((datapoint * powerOfTen - minValue * powerOfTen) * (1 / (stepsize * powerOfTen)))]++
          }
        }
        let usedCounts = binnedData.reduce((a, b) => a + b, 0)
        binnedData.push(null)

        let categories = new Array(bins)
        categories.fill(0)
        categories = categories.map((x, i) => (minValue + (i * stepsize)).toFixed(decimals))
        categories.push('')

        return {data: binnedData, categories: categories, usedCounts: usedCounts, maxCounts: data.length}
      },
      resetPValueSettings () {
        this.xAxisMinValue = 0
        this.xAxisMaxValue = 1
        this.xAxisStepsize = 0.01

        this.drawData()
      },
      resetLFCSettings () {
        let data = this.lfcData

        this.xAxisMinValue = Math.floor(Math.min(...data))
        this.xAxisMaxValue = Math.ceil(Math.max(...data))
        this.xAxisStepsize = 1

        this.drawData()
      },
      updateYAxis () {
        if (this.useLogYAxis) {
          chart.update({
            yAxis: {
              type: 'logarithmic',
              minorTickInterval: 0.1
            }
          })
        } else {
          chart.update({
            yAxis: {
              type: 'linear',
              minorTickInterval: undefined
            }
          })
        }
      },
      updateXAxis: debounce(
        function () {
          this.drawData()
        },
        500),
      initializeSettings () {
        if (this.selectedDistributionType === 'log2 fold change') {
          this.resetLFCSettings()
        } else {
          this.resetPValueSettings()
        }
        this.drawData()
      },
      clearChart () {
        this.selectedCondition1 = ''
        this.selectedCondition2 = ''
        let node = this.$refs[CHART_ID]
        while (node.firstChild) {
          node.removeChild(node.firstChild)
        }
      }
    }
  }
</script>
