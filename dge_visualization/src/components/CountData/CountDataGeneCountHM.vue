<template>
  <div>
    <h1>
      Gene counts
    </h1>

    <div id="container" style="height: 400px; min-width: 60%; max-width: 60%; margin: 0 auto"></div>
  </div>
</template>

<script>
  var Highcharts = require('highcharts/highmaps')

  export default {
    name: 'CountDataGeneCountHM',
    data () {
      return {
        options: {}
      }
    },
    methods: {
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

        let seqRunNamesMap = {}
        let seqRunNames = []
        let seqRunIndex = 0
        let geneNames = []
        let geneNameIndex = 0

        let countData = this.$store.state.dgeData.getAllUnnormalizedCountData('WT')
        for (let geneName of Object.keys(countData)) {
          let gene = countData[geneName]
          geneNames.push(geneName)
          for (let seqRun of Object.keys(gene)) {
            if (!seqRunNamesMap.hasOwnProperty(seqRun)) {
              seqRunNamesMap[seqRun] = seqRunIndex++
              seqRunNames.push(seqRun)
            }
            let dataPoint = [
              seqRunNamesMap[seqRun],
              geneNameIndex,
              gene[seqRun]
            ]
            series[0].data.push(dataPoint)
          }
          geneNameIndex++
        }

        options.xAxis.categories = seqRunNames
        options.yAxis.categories = geneNames

        Highcharts.chart('container', options)
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
    mounted () {
      this.$nextTick(() => {
        this.drawData()
      })
    }
  }
</script>
