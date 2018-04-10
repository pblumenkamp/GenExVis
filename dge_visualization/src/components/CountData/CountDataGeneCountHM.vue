<template>
  <div>
    <h1>
      Gene counts
    </h1>

    <div>
      <span @click="showCollapsedConditions = true" v-if="!showCollapsedConditions" style="cursor: pointer">
        <font-awesome-icon :icon="faPlusCircle"></font-awesome-icon>
      </span>
      <span @click="showCollapsedConditions = false" v-else style="cursor: pointer">
        <font-awesome-icon :icon="faMinusCircle"></font-awesome-icon>
      </span>
      Settings
      <b-collapse id="registeredConditions" class="mt-2" v-model="showCollapsedConditions">
        <b-card>
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
                <b-col sm="3"><label style="margin-top: 0.4rem;">intermediate color stop (value between 0 and 1)</label></b-col>
                <b-col sm="9"><b-form-input type="number" v-model="intermediateColorStop" step="0.1" max="1" min="0" style="width: 10rem;" @change="drawData"></b-form-input></b-col>
              </b-row>
              <b-row class="my-1">
                <b-col sm="3"><label style="margin-top: 0.4rem;">max value (no max value: 0)</label></b-col>
                <b-col sm="9"><b-form-input type="number" v-model="maxValue" step="100" min="0" style="width: 10rem;" @change="drawData"></b-form-input></b-col>
              </b-row>
            </b-container>
          </div>
        </b-card>
      </b-collapse>
    </div>


    <div id="countdatagenecounthm_highcharts"
         style="height: 400px; min-width: 60%; max-width: 60%; margin: 0 auto"></div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faPlusCircle from '@fortawesome/fontawesome-free-solid/faPlusCircle'
  import faMinusCircle from '@fortawesome/fontawesome-free-solid/faMinusCircle'

  var Highcharts = require('highcharts/highmaps')

  export default {
    name: 'CountDataGeneCountHM',
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        options: {},
        showCollapsedConditions: true,
        selectedConditions: [...this.$store.state.registeredConditions],
        allConditionsSelected: true,
        indeterminate: false,
        intermediateColorStop: 0.1,
        maxValue: 0
      }
    },
    methods: {
      toggleAllConditions (checked) {
        this.selectedConditions = checked ? this.registeredConditions.slice(0) : []
      },
      drawData () {
        let options = {
          chart: {
            type: 'heatmap',
            height: '200%',
            zoomType: 'xy',
            marginBottom: 80,
            plotBorderWidth: 1
          },
          boost: {
            useGPUTranslations: true
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
              [0, '#FFFFFF'],
              [0.1, '#276dff'],
              [1, '#ff3a44']]
          },
          legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            margin: 0,
            symbolHeight: 300
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
          for (let [seqRun, seqRunCond] of Object.entries(this.$store.state.dgeData.seqRuns)) {
            if (seqRunCond === cond) {
              seqRunNames.push(seqRun)
              seqRunNamesMap[seqRun] = seqRunIndex++
            }
          }
        }
        console.log(seqRunNamesMap)
        let geneNames = Array.from(this.$store.state.dgeData.geneNames).sort()
        let geneNamesMapping = {}
        for (let [index, geneName] of geneNames.entries()) {
          geneNamesMapping[geneName] = index
        }

        let countData = this.$store.state.dgeData.getAllUnnormalizedCountData()
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

        Highcharts.chart('countdatagenecounthm_highcharts', options)
        this.options = options
      }
    },
    mounted () {
      this.$nextTick(() => {
        this.drawData()
      })
    },
    computed: {
      registeredConditionsOptions () {
        let conds = []
        for (let cond of this.registeredConditions) {
          conds.push({
            text: cond,
            value: cond
          })
        }
        return conds
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
      }
    }
  }
</script>
