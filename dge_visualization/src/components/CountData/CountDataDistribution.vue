<template>
  <div style="text-align: center">
    <h1>Gene Count Histogram</h1>

    <b-form-select v-model="selectedNormalization" style="width: auto" class="mb-2" @input="selectedCondition = ''">
      <template slot="first">
        <option :value="''" disabled>-- Please select a normalization method --</option>
      </template>
      <option v-for="cond in registeredNormalizationMethods" :value="cond">{{ cond }}</option>
    </b-form-select>

    <b-form-select v-model="selectedCondition" :disabled="selectedNormalization === ''" style="width: auto" class="mb-2" @input="initializeSettings">
      <template slot="first">
        <option :value="''" disabled>-- Please select a condition --</option>
      </template>
      <option v-for="cond in countDataConditions" :value="cond">{{ cond }}</option>
    </b-form-select>

    <hr>

    <div id="countdata_genecount_distribution_highcharts" ref="countdata_genecount_distribution_highcharts"
         style="height: 40rem; min-width: 60%; max-width: 90%; margin: 0 auto"></div>

    <div v-if="selectedNormalization && selectedCondition">
      <hr>
      <b-container fluid border="1" style="text-align: right">
        <b-row class="my-2">
          <b-col sm="2"><label>logarithmic y-axis</label></b-col>
          <b-col sm="10">
            <b-form-checkbox v-model="useLogYAxis" style="float: left;" @input="updateYAxis"></b-form-checkbox>
          </b-col>
        </b-row>
        <b-row class="my-2">
          <b-col sm="2"><label>min value x-axis</label></b-col>
          <b-col sm="2">
            <b-form-input v-model="xAxisMinValue" :state="validMinValue" type="number" step="100" style="float: left; width: 6rem;" @change="updateXAxis"></b-form-input>
          </b-col>
          <b-col sm="2"><label>max value x-axis</label></b-col>
          <b-col sm="2">
            <b-form-input v-model="xAxisMaxValue" :state="validMaxValue" type="number" step="100" style="float: left; width: 6rem;" @change="updateXAxis"></b-form-input>
          </b-col>
          <b-col sm="2"><label>stepsize</label></b-col>
          <b-col sm="2">
            <b-form-input v-model="xAxisStepsize" :state="validStepsize" type="number" min="0" step="1" style="float: left; width: 6rem;" @change="updateXAxis"></b-form-input>
          </b-col>
        </b-row>
        <b-row class="my-3">
          <b-col sm="12" style="text-align: center">
            <b-button @click="resetSettings">Reset</b-button>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
  let Highcharts = require('highcharts')
  require('highcharts/modules/exporting')(Highcharts)
  require('highcharts/modules/offline-exporting')(Highcharts)

  let debounce = require('lodash.debounce')

  const AXIS_COLOR = '#000000'
  const CHART_ID = 'countdata_genecount_distribution_highcharts'

  let chart = {}

  export default {
    name: 'CountData_Distribution',
    data () {
      return {
        selectedNormalization: '',
        selectedCondition: '',
        xAxisMinValue: 0,
        xAxisMaxValue: 1000,
        xAxisStepsize: 100,
        useLogYAxis: false
      }
    },
    methods: {
      drawData () {
        let vue = this

        if (!(vue.selectedNormalization)) {
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
            text: `${vue.selectedCondition}`
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
                return '<b>' + this.point.category + ' ≤ Average Gene Counts < ' + this.series.data[this.point.index + 1].category + '</b><br>Frequency: ' + this.y
              } else {
                return '<b> Average Counts = ' + this.point.category + '</b><br>Frequency: ' + this.y
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

        let data = vue.createHistogram(parseFloat(vue.xAxisMinValue), parseFloat(vue.xAxisMaxValue),
          parseFloat(vue.xAxisStepsize), vue.countDataForCondition)

        options.series[0].data = data.data
        options.xAxis.categories = data.categories
        options.subtitle.text = `${data.usedCounts} of ${data.maxCounts} genes`

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
      resetSettings () {
        let data = this.countDataForCondition
        console.log(data)

        this.xAxisMinValue = 0
        let max = Math.max(...data)
        console.log(max)
        this.xAxisMaxValue = (Math.floor(max / Math.pow(10, Math.floor(Math.log10(max)))) + 1) * Math.pow(10, Math.floor(Math.log10(max)))
        this.xAxisStepsize = 1000

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
        this.resetSettings()
        this.drawData()
      },
      clearChart () {
        this.selectedNormalization = ''
        let node = this.$refs[CHART_ID]
        while (node.firstChild) {
          node.removeChild(node.firstChild)
        }
      }
    },
    computed: {
      registeredNormalizationMethods () {
        return this.$store.state.currentDGE.normalizationMethods
      },
      dgeConditions () {
        let conditions1 = new Set()
        let conditions2 = new Set()
        for (let {condition1, condition2} of this.$store.state.currentDGE.conditionPairs) {
          conditions1.add(condition1)
          conditions2.add(condition2)
        }
        return [conditions1, conditions2]
      },
      dge () {
        return this.$store.state.currentDGE
      },
      validMinValue () {
        return (this.xAxisMinValue >= 0 && this.xAxisMaxValue > this.xAxisMinValue) ? null : false
      },
      validMaxValue () {
        return (this.xAxisMaxValue > this.xAxisMinValue) ? null : false
      },
      validStepsize () {
        return (this.xAxisStepsize > 0) ? null : false
      },
      allCountData () {
        return this.$store.state.currentDGE.getCountData(this.selectedNormalization)
      },
      countDataConditions () {
        return Object.getOwnPropertyNames(this.allCountData).sort()
      },
      countDataForCondition () {
        let countData = this.allCountData[this.selectedCondition]
        let data = []
        for (let geneName of Object.getOwnPropertyNames(countData)) {
          let gene = countData[geneName]
          let sum = Object.keys(gene).map(key => gene[key]).reduce(function (a, b) { return a + b })
          data.push(sum / Object.keys(gene).length)
        }
        return data
      }
    },
    watch: {
      dge () {
        this.clearChart()
      }
    }
  }
</script>
