<template>
  <div>
    <h1>
      Gene counts
    </h1>

    <div>
      <div>
        <span @click="showCollapsedConditions = true" v-if="!showCollapsedConditions" style="cursor: pointer">
          <font-awesome-icon :icon="faPlusCircle"></font-awesome-icon>
        </span>
        <span @click="showCollapsedConditions = false" v-else style="cursor: pointer">
          <font-awesome-icon :icon="faMinusCircle"></font-awesome-icon>
        </span>
        Settings
      </div>
      <b-collapse id="registeredConditions" class="mt-2" v-model="showCollapsedConditions">
        <b-card style="width: 70%; margin:0 auto">
          <b-form-select v-model="selectedNormalization" style="width: auto" class="mb-2">
            <template slot="first">
              <option :value="''" disabled>-- Please select a normalization method --</option>
            </template>
            <option v-for="cond in Array.from(registeredNormalizationMethods)" :value="cond">{{ cond }}</option>
          </b-form-select>
          <b-form-group label="Use conditions:">
            <b-form-checkbox v-model="allConditionsSelected"
                             :indeterminate="indeterminate"
                             @change="toggleAllConditions"
            >
              Select All
            </b-form-checkbox>
            <b-form-checkbox-group id="countdatagenecounthm_condition_checkboxes" class="mt-2"
                                   name="condition_checkboxes"
                                   v-model="selectedConditions">
              <b-form-checkbox v-for="cond in registeredConditions" :key="cond" :value="cond">{{cond}}</b-form-checkbox>
            </b-form-checkbox-group>
          </b-form-group>
          <div>
            <hr>

            <b-container fluid>
              <b-row class="my-1">
                <b-col sm="3"><label style="margin-top: 0.4rem;">start color:</label></b-col>
                <b-col sm="1">
                  <b-form-input type="color" v-model="color1" @change="updateColorAxisStops"></b-form-input>
                </b-col>
                <b-col sm="3"><label style="margin-top: 0.4rem;">intermediate color:</label></b-col>
                <b-col sm="1">
                  <b-form-input type="color" v-model="color2" @change="updateColorAxisStops"></b-form-input>
                </b-col>
                <b-col sm="3"><label style="margin-top: 0.4rem;">end color:</label></b-col>
                <b-col sm="1">
                  <b-form-input type="color" v-model="color3" @change="updateColorAxisStops"></b-form-input>
                </b-col>
              </b-row>
              <b-row class="my-1">
                <b-col sm="4"><label style="margin-top: 0.4rem;">intermediate color stop (value between 0 and 1)</label>
                </b-col>
                <b-col sm="8">
                  <b-form-input type="number" v-model="intermediateColorStop" step="0.1" max="1" min="0"
                                style="width: 10rem;"></b-form-input>
                </b-col>
              </b-row>
              <b-row class="my-1">
                <b-col sm="4"><label style="margin-top: 0.4rem;">max value</label></b-col>
                <b-col sm="8">
                  <b-form-input type="number" v-model="maxValue" step="100" min="0"
                                style="width: 10rem;"></b-form-input>
                </b-col>
              </b-row>
            </b-container>
          </div>
        </b-card>
      </b-collapse>
    </div>

    <div id="countdatagenecounthm_highcharts"
         style="min-width: 60%; max-width: 60%; margin: 0 auto"></div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faPlusCircle from '@fortawesome/fontawesome-free-solid/faPlusCircle'
  import faMinusCircle from '@fortawesome/fontawesome-free-solid/faMinusCircle'

  let Highcharts = require('highcharts/highmaps')
  require('highcharts/modules/exporting')(Highcharts)
  require('highcharts/modules/offline-exporting')(Highcharts)

  let debounce = require('lodash.debounce')

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
    methods: {
      toggleAllConditions (checked) {
        this.selectedConditions = checked ? this.registeredConditions.slice(0) : []
      },
      drawData () {
        if (Object.keys(chart).length !== 0) {
          chart.showLoading()
        }
        conditionMapping = this.$store.state.currentDGE.seqRuns
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
              align: 'left',
              height: 40,
              width: 48,
              symbolStroke: '#ffffff',
              symbolSize: 24,
              symbolX: 24,
              symbolY: 20,
              symbolStrokeWidth: 2,
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
              [0, this.color1],
              [this.intermediateColorStop, this.color2],
              [1, this.color3]]
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
          options.colorAxis['max'] = this.maxValue
        }

        let seqRunNamesMap = {}
        let seqRunNames = []
        let seqRunIndex = 0
        for (let cond of this.selectedConditions) {
          for (let [seqRun, seqRunCond] of Object.entries(this.$store.state.currentDGE.seqRuns)) {
            if (seqRunCond === cond) {
              seqRunNames.push(seqRun)
              seqRunNamesMap[seqRun] = seqRunIndex++
            }
          }
        }
        let geneNames = Array.from(this.$store.state.currentDGE.geneNames).sort()
        let geneNamesMapping = {}
        for (let [index, geneName] of geneNames.entries()) {
          geneNamesMapping[geneName] = index
        }

        let countData = (this.selectedNormalization === 'unnormalized')
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

        chart = Highcharts.chart('countdatagenecounthm_highcharts', options)
        chart.hideLoading()
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
    },
    mounted () {
      /*      this.$nextTick(() => {
       // eslint-disable-next-line
       let prom = new Promise((resolve) => {
       setTimeout(this.drawData, 50)
       resolve()
       })
       }) */
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
      }
    },
    watch: {
      selectedConditions (newVal, oldVal) {
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
      intermediateColorStop (newVal, oldVal) {
        this.updateColorAxisStops()
      },
      maxValue (newVal, oldVal) {
        this.updateColorAxisMax()
      },
      selectedNormalization (newVal, oldVal) {
        this.drawData()
      }
    }
  }
</script>
