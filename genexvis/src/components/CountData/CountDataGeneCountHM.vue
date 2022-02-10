/*eslint-env node*/
<template>
  <div>
    <h1 class="header">Gene Counts Heat Map</h1>

    <div>
      <div>
        <span v-if="!showCollapsedConditions" style="cursor: pointer" @click="showCollapsedConditions = true">
          <font-awesome-icon :icon="faPlusCircle" />
        </span>
        <span v-else style="cursor: pointer" @click="showCollapsedConditions = false">
          <font-awesome-icon :icon="faMinusCircle" />
        </span>
        Settings
      </div>
      <b-collapse id="registeredConditions" v-model="showCollapsedConditions" class="mt-2">
        <b-card class="text-center">
          <b-form-select v-model="selectedNormalization" style="width: auto" class="mb-2">
            <template slot="first">
              <option :value="''" disabled>-- Please select a normalization method --</option>
            </template>
            <option
              v-for="cond in registeredNormalizationMethods"
              :key="cond"
              :value="cond"
            >
              {{ cond }}
            </option>
          </b-form-select>

          <b-form-group label="Use conditions:">
            <b-form-checkbox
              v-model="allConditionsSelected"
              :indeterminate="indeterminate"
              @change="toggleAllConditions"
            >
              Select All
            </b-form-checkbox>
            <b-form-checkbox-group
              id="countdatagenecounthm_condition_checkboxes"
              v-model="selectedConditions"
              name="condition_checkboxes"
              class="mt-2"
            >
              <b-form-checkbox v-for="cond in registeredConditions" :key="cond" :value="cond">
                {{ cond }}
              </b-form-checkbox>
            </b-form-checkbox-group>
          </b-form-group>

          <div>
            <hr>
            <b-container fluid>
              <b-row class="my-1">
                <b-col sm="3">
                  <label style="margin-top: 0.4rem;">start color:</label>
                </b-col>
                <b-col sm="1">
                  <b-form-input
                    v-model="color1"
                    type="color"
                    style="padding: 0.05rem; min-width: 1rem"
                    @change="updateColorAxisStops"
                  />
                </b-col>
                <b-col sm="3">
                  <label style="margin-top: 0.4rem;">intermediate color:</label>
                </b-col>
                <b-col sm="1">
                  <b-form-input
                    v-model="color2"
                    type="color"
                    style="padding: 0.05rem; min-width: 1rem"
                    @change="updateColorAxisStops"
                  />
                </b-col>
                <b-col sm="3">
                  <label style="margin-top: 0.4rem;">end color:</label>
                </b-col>
                <b-col sm="1">
                  <b-form-input
                    v-model="color3"
                    type="color"
                    style="padding: 0.05rem; min-width: 1rem"
                    @change="updateColorAxisStops"
                  />
                </b-col>
              </b-row>
              <b-row class="my-1">
                <b-col sm="5">
                  <label style="margin-top: 0.4rem;">intermediate color stop (value between 0 and 1):</label>
                </b-col>
                <b-col sm="7">
                  <b-form-input
                    v-model="intermediateColorStop"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    style="width: 10rem;"
                  />
                </b-col>
              </b-row>
              <b-row class="my-1">
                <b-col sm="5"><label style="margin-top: 0.4rem;">max value:</label></b-col>
                <b-col sm="7">
                  <b-form-input
                    v-model="maxValue"
                    type="number"
                    min="0"
                    step="100"
                    style="width: 10rem;"
                  />
                </b-col>
              </b-row>
            </b-container>
          </div>
        </b-card>
      </b-collapse>
    </div>

    <div
      id="countdatagenecounthm_highcharts"
      ref="countdatagenecounthm_highcharts"
      style="min-width: 60%; max-width: 90%; margin: 1rem auto 0;"
    ></div>
  </div>
</template>

<script>
  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faPlusCircle, faMinusCircle} from '@fortawesome/free-solid-svg-icons'

  let Highcharts = require('highcharts/highmaps')
  require('highcharts/modules/exporting')(Highcharts)
  require('highcharts/modules/offline-exporting')(Highcharts)

  let debounce = require('lodash.debounce')

  const CHART_ID = 'countdatagenecounthm_highcharts'

  let chart = {}
  let conditionMapping = {}

  export default {
    name: 'CountDataGeneCountHM',
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        selectedNormalization: '',
        showCollapsedConditions: true,
        selectedConditions: [...this.$store.state.registeredConditions],
        allConditionsSelected: true,
        indeterminate: false,
        intermediateColorStop: 0.1,
        maxValue: 0,
        color1: '#FFFFFF',
        color2: '#276dff',
        color3: '#ff3a44'
      }
    },
    computed: {
      registeredNormalizationMethods () {
        return this.$store.state.currentDGE.normalizationMethods
      },
      registeredConditions () {
        return this.$store.state.registeredConditions
      },
      faPlusCircle () {
        return faPlusCircle
      },
      faMinusCircle () {
        return faMinusCircle
      },
      dge () {
        return this.$store.state.currentDGE
      }
    },
    watch: {
      selectedConditions (newVal) {
        // Handle changes in individual flavour checkboxes
        if (newVal.length === 0) {
          this.indeterminate = false
          this.allConditionsSelected = false
        } else if (newVal.length === this.registeredConditions.length) {
          this.indeterminate = false
          this.allConditionsSelected = true
        } else {
          this.indeterminate = true
          this.allConditionsSelected = false
        }
        this.drawData()
      },
      intermediateColorStop () {
        this.updateColorAxisStops()
      },
      maxValue () {
        this.updateColorAxisMax()
      },
      selectedNormalization () {
        this.drawData()
      },
      dge () {
        this.clearChart()
      }
    },
    methods: {
      toggleAllConditions (checked) {
        this.selectedConditions = checked ? this.registeredConditions.slice(0) : []
      },
      drawData () {
        let vue = this
        if (!vue.selectedNormalization) {
          return
        }
        conditionMapping = vue.$store.state.currentDGE.seqRuns[vue.selectedNormalization]
        let options = {
          chart: {
            type: 'heatmap',
            height: '200%',
            zoomType: 'xy',
            marginBottom: 80,
            plotBorderWidth: 1
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
          loading: {
            hideDuration: 500,
            showDuration: 500
          },
          title: {
            text: ''
          },
          xAxis: {
            categories: [],
            labels: {
              enabled: true,
              rotation: 90
            },
            opposite: true
          },
          yAxis: {
            categories: [],
            reversed: true,
            showLastLabel: true,
            endOnTick: true
          },
          colorAxis: {
            min: 0,
            stops: [
              [0, vue.color1],
              [vue.intermediateColorStop, vue.color2],
              [1, vue.color3]]
          },
          legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            margin: 5,
            symbolHeight: 300
          },
          tooltip: {
            formatter: function () {
              return 'Gene: <b>' + this.series.yAxis.categories[this.point.y] +
                '</b><br>Sequencing run: <b>' + this.series.xAxis.categories[this.point.x] +
                '</b><br>Condition: <b>' + conditionMapping[this.series.xAxis.categories[this.point.x]] +
                '</b><br>Counts: <b>' + this.point.value + '</b>'
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
            name: 'count per gene',
            turboThreshold: Number.MAX_VALUE,
            boostThreshold: 100,
            data: [[0, 0, 10], [0, 1, 100], [1, 0, 20], [1, 1, 200]]
          }]
        }

        let series = options.series

        series[0].data = []

        if (this.maxValue !== 0) {
          options.colorAxis['max'] = vue.maxValue
        }

        let seqRunNamesMap = {}
        let seqRunNames = []
        let seqRunIndex = 0
        for (let cond of vue.selectedConditions) {
          for (let [seqRun, seqRunCond] of Object.entries(vue.$store.state.currentDGE.seqRuns[vue.selectedNormalization])) {
            if (seqRunCond === cond) {
              seqRunNames.push(seqRun)
              seqRunNamesMap[seqRun] = seqRunIndex++
            }
          }
        }
        let geneNames = Array.from(vue.$store.state.currentDGE.geneNames).sort()
        let geneNamesMapping = {}
        for (let [index, geneName] of geneNames.entries()) {
          geneNamesMapping[geneName] = index
        }

        let countData = (vue.selectedNormalization === 'unnormalized')
          ? this.$store.state.currentDGE.getAllUnnormalizedCountData()
          : this.$store.state.currentDGE.getAllDeseq2CountData()
        for (let [condition, genes] of Object.entries(countData)) {
          if (this.selectedConditions.indexOf(condition) === -1) {
            continue
          }
          for (let [geneName, seqRuns] of Object.entries(genes)) {
            for (let [seqRun, value] of Object.entries(seqRuns)) {
              let dataPoint = [
                seqRunNamesMap[seqRun],
                geneNamesMapping[geneName],
                value
              ]
              series[0].data.push(dataPoint)
            }
          }
        }
        options.xAxis.categories = seqRunNames
        options.yAxis.categories = geneNames

        chart = Highcharts.chart(CHART_ID, options)
        chart.hideLoading()
        vue.$charts.length = 0
        vue.$charts.push(chart)

        const delay = ms => new Promise(res => setTimeout(res, ms))
        delay(5000).then(() => {
          for (const chart of vue.$charts) {
            chart.reflow()
          }
        })
      },
      clearChart () {
        this.selectedNormalization = ''
        let node = this.$refs[CHART_ID]
        while (node.firstChild) {
          node.removeChild(node.firstChild)
        }
      },
      updateColorAxisStops: debounce(
        function () {
          if (Object.keys(chart).length !== 0) {
            chart.update({
              colorAxis: {
                stops: [
                  [0, this.color1],
                  [this.intermediateColorStop, this.color2],
                  [1, this.color3]
                ]
              }
            })
          }
        },
        500),
      updateColorAxisMax: debounce(
        function () {
          if (Object.keys(chart).length !== 0) {
            chart.update({
              colorAxis: {
                max: (this.maxValue === 0) ? undefined : this.maxValue
              }
            })
          }
        },
        500
      )
    }
  }
</script>
