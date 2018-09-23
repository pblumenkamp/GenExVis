<template>
  <div style="text-align: center">

    <h1>
      Top {{ this.selectedAmount }} Genes ({{ this.selectedValue }})
    </h1>

    <b-form-select v-model="selectedCondition1" style="width: auto" @change="selectedCondition2 = ''">
      <template slot="first">
        <option :value="''" disabled>-- Please select the first condition --</option>
      </template>
      <option v-for="cond in Array.from(dgeConditions[0])" :value="cond">{{ cond }}</option>
    </b-form-select>

    <b-form-select v-model="selectedCondition2" style="width: auto" :disabled="selectedCondition1 === ''" @input="mountData()">
      <template slot="first">
        <option :value="''" disabled>-- Please select the second condition --</option>
      </template>
      <option v-for="cond in Array.from(dgeConditions[1])" :value="cond" :disabled="!conditions2.has(cond)">{{ cond }}</option>
    </b-form-select>

    <b-form-select v-model="selectedValue" style="width: auto" @input="mountData()">
      <template slot="first">
        <option :value="''" disabled>-- Please select measurement value --</option>
      </template>
      <option v-for="measure in optionsValue" :value="measure">{{ measure }}</option>
    </b-form-select>

    <b-form-select v-model="selectedAmount" style="width: auto" @input="createRanking()">
      <template slot="first">
        <option :value="''" disabled>-- Please select amount --</option>
      </template>
      <option v-for="amount in optionsAmount" :value="amount">{{ amount }}</option>
    </b-form-select>

    <!--<div id="container" style="min-width: 310px; height: 400px; max-width: 800px; margin: 0 auto">-->
    <!--<button @click="drawData">GO!</button>-->
    <div id="blupp"></div>

    <hr>

    <div v-if="selectedCondition1 && selectedCondition2">
      <table>
        <tr v-for="(value, key, index) in this.rankingdict">
          <td style="width:5%"><div style="font-size:4rem"><b>{{ index+1 }}.</b></div></td>
          <td style="width:10%"><div style="font-size:1.5rem"><b> {{ key }}:</b></div>
            <p>{{ value }}</p></td>
          <td style="width:85%"><div :id="key" style="min-width: 310px; height: 400px; max-width: 80%; margin: 0 auto">{{ key }}</div>
            <hr>
          </td>
        </tr>
      </table>
    </div>
  </div>

</template>

<script>
  import {ConditionPair} from '../../utilities/dge'
  import {SET_SUBDGE} from '../../store/action_constants'

  let Highcharts = require('highcharts')
  require('highcharts/modules/exporting')(Highcharts)
  require('highcharts/modules/offline-exporting')(Highcharts)

  export default {
    name: 'Deseq2MAPlot',
    data () {
      return {
        selectedCondition1: '',
        selectedCondition2: '',
        selectedValue: 'p value',
        selectedAmount: 10,
        optionsAmount: [5, 10, 20, 50],
        optionsValue: ['p value', 'p value (adjusted)'],
        optionsDict: {'p value': 'pValue', 'p value (adjusted)': 'pAdj'},
        yAxisMax: 0,
        datadict: {},
        reversedict: {},
        rankingarray: [],
        rankingdict: {}
      }
    },
    methods: {
      mountData () {
        this.datadict = {}
        let valueS = this.optionsDict[this.selectedValue]
        let dge = this.$store.state.currentDGE.getAllGenesFromDESeq2(this.selectedCondition1, this.selectedCondition2)
        for (let geneName of dge.geneNames) {
          let gene = dge.getGene(geneName)
          let analysis = gene.getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2))
          let value = analysis[valueS]
          this.datadict[geneName] = value
        }
        this.fillLists()
      },
      fillLists () {
        this.reversedict = {}
        this.rankingarray = {}
        let tempdict = {}
        let temparray = []
        for (let key in this.datadict) {
          let value = this.datadict[key]
          temparray.push(value) // save values in list (for sorting later)
          if (tempdict[value] === undefined) {
            tempdict[value] = [key] // key always in a list (for multiple entries)
          } else {
            tempdict[value].push(key)
          }
        }
        this.reversedict = tempdict
        temparray = temparray.sort()
        this.rankingarray = temparray
        this.createRanking()
      },
      changeSelectedAmount () {
        this.createRanking()
      },
      createRanking () {
        this.rankingdict = {}
        // console.log('createRanking: ' + this.selectedAmount)
        let maxcount = this.selectedAmount
        if (maxcount > this.rankingarray.length) {
          maxcount = this.rankingarray.length
        }
        // console.log('maxcount: ' + maxcount)
        // console.log(this.rankingarray)
        for (let counter = 0; counter < maxcount;) {
          let key = this.rankingarray[counter]
          let keylist = this.reversedict[key]
          for (let value of keylist) {
            this.rankingdict[value] = key
            counter++
          }
        }
        // console.log(this.rankingdict)
      },
      drawData () {
        let categories = ['t0', 't1', 't2', 't3', 't4', 't5']
        let counter = 0
        for (let element in this.rankingdict) {
          console.log(element)
          if (counter === (this.selectedAmount)) {
            break
          }
          let options = {
            chart: {
              type: 'scatter',
              zoomType: 'xy'
            },
            title: {
              text: 'Count Table Values (Counts vs. Condition)'
            },
            xAxis: {
              categories: categories,
              title: {
                enabled: true,
                text: 'Condition'
              },
              startOnTick: true,
              endOnTick: true,
              showLastLabel: true
            },
            yAxis: {
              min: 0,
              max: 40000,
              title: {
                text: 'Reads'
              }
            },
            legend: {
              layout: 'vertical',
              align: 'left',
              verticalAlign: 'top',
              x: 100,
              y: 70,
              floating: true,
              backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
              borderWidth: 1
            },
            tooltip: {
              useHTML: true,
              headerFormat: '<table>',
              pointFormat:
              '<tr><td>Value:</td><td style="font-size:1rem"><b>{point.y} reads</b></td></tr>' +
              '<tr><td>Condition:</td><td><b>{point.cond}</b></td></tr>' +
              '<tr><td>Source File:</td><td><b>{point.file}</b></td></tr>',
              footerFormat: '</table>',
              followPointer: true
            },
            plotOptions: {
              scatter: {
                marker: {
                  radius: 5,
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
                }
              }
            },
            series: [{
              name: 'miseq/hiseq',
              color: 'rgba(223, 83, 83, .5)',
              data: [[0, 161.2], [1, 190.4], [2, 177.1], [3, 165.6], [4, 190.0], [5, 188.2]]
            }]
          }
          let data = this.createData(element, categories)
          options.series[0].data = data
          counter = counter + 1
          Highcharts.chart(element, options)
        }
      },
      createData (element, categories) {
        let yAxisList = []
        let dataList = []
        console.log(this.$store.state.currentDGE.getAllUnnormalizedCountDataByGene(element))
        let geneCountData = this.$store.state.currentDGE.getAllUnnormalizedCountDataByGene(element)
        // this.$store.state.currentDGE._getAllCountDataByGene(element, 'unnormalized')
        for (let entry in geneCountData) {
          let index = categories.indexOf(entry)
          let entryList = geneCountData[entry]
          for (let subentry in entryList) {
            let pointDict = {}
            pointDict['x'] = index
            pointDict['y'] = entryList[subentry]
            pointDict['cond'] = entry
            pointDict['file'] = subentry
            dataList.push(pointDict)
          }
        }
        return(dataList)
      },
      generateYAxisMax (yList) {
        let max = Math.max(yList)
        this.yAxisMax = max
      },
      collectData () {
        this.tableData = []
        let storage = this.$store.state.currentDGE
        for (let geneName of this.rowNames) {
          let tableRow = {}
          let deseq2Analysis = storage.getGene(geneName).getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2))
          for (let colName of this.tableHeader) {
            tableRow[colName] = deseq2Analysis[colName]
          }
          tableRow.name = geneName
          this.tableData.push(tableRow)
        }
      },
      createSubset () {
        let geneNames = []
        for (let geneName of this.rowNames) {
          geneNames.push(geneName)
        }
        geneNames.sort()
        this.$store.dispatch(SET_SUBDGE, {geneList: geneNames})
      }
    },
    computed: {
      dgeConditions () {
        let conditions1 = new Set()
        let conditions2 = new Set()
        for (let {condition1, condition2} of this.$store.state.currentDGE.conditionPairs) {
          conditions1.add(condition1)
          conditions2.add(condition2)
        }
        return [conditions1, conditions2]
      },
      conditions2 () {
        let conditions2 = new Set()
        for (let {condition1, condition2} of this.$store.state.currentDGE.conditionPairs) {
          if (condition1 === this.selectedCondition1) {
            conditions2.add(condition2)
          }
        }
        return conditions2
      },
      pThreshold () {
        return parseFloat(this.inputPThreshold)
      },
      dge () {
        return this.$store.state.currentDGE
      }
    },
    watch: {
      dge (newDGE, oldDGE) {
        this.clearChart()
      }
    },
    beforeMount () {
      this.mountData()
      this.changeSelectedAmount()
      this.createRanking()
    },
    updated () {
      this.drawData()
    }
  }
</script>
<style scoped>
  tr, th, td {
    border: 0px solid lightgrey;
    border-collapse: collapse;
    padding-left: 0.4rem;
    text-align: left;
    vertical-align: center;
  }
  th {
    background-color: #F6F8F7;
  }
</style>
