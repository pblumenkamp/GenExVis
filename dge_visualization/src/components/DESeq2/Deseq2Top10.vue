<template>
  <div style="text-align: center">

    <h1>
      Top {{ this.selectedAmount }} Genes ({{this.selectedDistributionType}})
    </h1>

    <b-form-select v-model="selectedCondition1" style="width: auto" @change="selectedCondition2 = ''" @input="statusUpdate()">
      <template slot="first">
        <option :value="''" disabled>-- Please select the first condition --</option>
      </template>
      <option v-for="cond in Array.from(dgeConditions[0])" :value="cond">{{ cond }}</option>
    </b-form-select>

    <b-form-select v-model="selectedCondition2" style="width: auto" :disabled="selectedCondition1 === ''" @input="mountData(), statusUpdate()">
      <template slot="first">
        <option :value="''" disabled>-- Please select the second condition --</option>
      </template>
      <option v-for="cond in Array.from(dgeConditions[1])" :value="cond" :disabled="!conditions2.has(cond)">{{ cond }}
      </option>
    </b-form-select>

    <b-form-select v-model="selectedDistributionType" style="width: auto; margin-left: 2rem" @input="statusUpdate()">
      <template slot="first">
        <option :value="''" disabled>-- Please select distribution type --</option>
      </template>
      <option v-for="distribution in optionsDistributionType" :value="distribution">{{ distribution }}</option>
    </b-form-select>

    <div v-if="selectedCondition1 && selectedCondition2 && selectedDistributionType" align="center">

      <p></p>

      <table id="mainControl" style="text-align: center">
        <tr>
          <td></td>
          <td></td>
          <td>Common Max Value:</td>
          <td>Ranking Size:</td>
        </tr>
        <tr>
          <td>Exponential p-values:</td>
          <td><b-form-checkbox style="float: left;" v-model="isExponential"></b-form-checkbox></td>
          <td>
            <b-input-group>
              <b-form-input v-model="commonMaxValue" type="number"
                            placeholder="Please type in number" @keydown.enter.native="commonMaxNegotiator()" style="width: auto"></b-form-input>
              <b-input-group-append>
                <b-btn @click="drawData()">></b-btn>
              </b-input-group-append>
            </b-input-group>
          </td>
          <td>
            <b-form-select v-model="selectedAmount" style="width: 15rem" @input="createRanking(), statusUpdate()">
              <template slot="first">
                <option :value="''" disabled></option>
              </template>
              <option v-for="amount in optionsAmount" :value="amount">{{ amount }}</option>
            </b-form-select>
          </td>
        </tr>
      </table>

      <div v-if="selectedAmount" align="center">

        <hr>
        <table id="mainRanking" style="text-align: left">
          <tr v-for="(value, key, index) in this.FINALRANKING">
            <td style="width:5%"><div style="font-size:4rem"><b>{{ index+1 }}.</b></div></td>
            <td style="width:10%"><div style="font-size:1.75rem"><b> {{ key }}</b></div>
              <div v-if="!isExponential">p-value: <p>{{ value }}</p></div>
              <div v-else-if="isExponential">p-value: <p>{{ value.toExponential(2) }}</p></div></td>
            <td style="width:85%"><div :id="key" style="min-width: 310px; height: 400px; max-width: 80%; margin: 0 auto"> no count data </div>
              <hr>
            </td>
          </tr>
        </table>

      </div>
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
        updateCheck: true,
        isExponential: false,
        commonMaxValue: null,
        selectedCondition1: '',
        selectedCondition2: '',
        selectedDistributionType: 'p-value',
        selectedAmount: 10,
        optionsAmount: [5, 10, 20, 50],
        optionsDistributionType: ['p-value', 'adj. p-value'],
        optionsDict: {'p-value': 'pValue', 'adj. p-value': 'pAdj'},
        yAxisMax: 0,
        datadict: {},
        reversedict: {},
        rankingdict: {},
        FINALRANKING: {}
      }
    },
    methods: {
      mountData () {
        let mainDict = {}
        let pvalDict = {}
        let padjDict = {}
        let dge = this.$store.state.currentDGE.getAllGenesFromDESeq2(this.selectedCondition1, this.selectedCondition2)

        for (let geneName of dge.geneNames) {
          let gene = dge.getGene(geneName)
          let analysis = gene.getDESEQ2Analysis(new ConditionPair(this.selectedCondition1, this.selectedCondition2))
          for (let currentKey in this.optionsDict) {
            let trueKey = this.optionsDict[currentKey]
            let value = analysis[trueKey]
            if (trueKey === 'pValue') {
              pvalDict[geneName] = value
            }
            if (trueKey === 'pAdj') {
              padjDict[geneName] = value
            }
          }
        }
        mainDict['pValue'] = pvalDict
        mainDict['pAdj'] = padjDict
        this.datadict = mainDict
        this.fillLists()
      },
      fillLists () {
        let dataDict = this.datadict
        let optionsDict = this.optionsDict
        let reverseDict = {}
        let rankingDict = {}
        for (let currentKey in optionsDict) {
          let tempDict = {}
          let tempArray = []
          let trueKey = this.optionsDict[currentKey]
          let trueData = dataDict[trueKey]
          for (let key in trueData) {
            let value = trueData[key]
            tempArray.push(value) // save values in list (for sorting later)
            if (tempDict[value] === undefined) {
              tempDict[value] = [key] // if no key for a value: Open new key-list (key always in a list (for multiple entries))
            } else {
              tempDict[value].push(key) // if key-list existing: Add current key.
            }
          }
          reverseDict[trueKey] = tempDict
          rankingDict[trueKey] = tempArray.sort()
          this.reversedict = reverseDict
          this.rankingdict = rankingDict
        }
        this.createRanking()
      },
      commonMaxNegotiator () {
        if (this.commonMaxValue === '' || this.commonMaxValue === '0') {
          this.commonMaxValue = null
        }
        this.drawData()
      },
      createRanking () {
        let selectedDistributionType = this.selectedDistributionType

        let tempRankingDict = {}
        let trueValue = this.optionsDict[selectedDistributionType]
        let rankingArray = this.rankingdict[trueValue]
        let reverseDict = this.reversedict[trueValue]
        let maxcount = this.selectedAmount

        if (maxcount > rankingArray.length) {
          maxcount = rankingArray.length
        }
        for (let counter = 0; counter < maxcount;) {
          let key = rankingArray[counter]
          let keylist = reverseDict[key]
          for (let value of keylist) {
            tempRankingDict[value] = key // for every value: 1 key list (=probably more than 1 key)
            counter++
          }
        }
        this.FINALRANKING = tempRankingDict
      },
      statusUpdate () {
        this.updateCheck = true
      },
      drawData () {
        this.updateCheck = false
        let categories = ['t0', 't1', 't2', 't3', 't4', 't5']
        let counter = 0
        for (let element in this.FINALRANKING) {
          if (counter === (this.selectedAmount)) {
            break
          }
          let options = {
            chart: {
              type: 'scatter',
              zoomType: 'xy'
            },
            title: {
              text: ''
            },
            xAxis: {
              categories: categories,
              title: {
                enabled: true,
                text: 'Conditions'
              },
              startOnTick: true,
              endOnTick: true,
              showLastLabel: true
            },
            yAxis: {
              min: 0,
              max: this.commonMaxValue,
              title: {
                text: 'Reads'
              }
            },
            legend: {
              enabled: false
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
              name: 'READS',
              color: 'rgba(223, 83, 83, .5)',
              data: [[0, 161.2], [1, 190.4], [2, 177.1], [3, 165.6], [4, 190.0], [5, 188.2]]
            }]
          }
          let data = this.createData(element, categories)
          if (data.length === 0) {
            // pass
          } else {
            options.series[0].data = data
            counter = counter + 1
            Highcharts.chart(element, options)
          }
        }
      },
      createData (element, categories) {
        let dataList = []
        // console.log(this.$store.state.currentDGE.getAllUnnormalizedCountDataByGene(element))
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
        return (dataList)
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
      dge: function (newDGE, oldDGE) {
        this.clearChart()
      }
    },
    updated () {
      if (this.updateCheck === true) {
        this.drawData()
      }
    }
  }
</script>
<style scoped>
  tr, th, td {
    border: 0px solid lightgrey;
    border-collapse: collapse;
    padding-left: 0.4rem;
    vertical-align: center;
  }
  th {
    background-color: #F6F8F7;
  }
</style>
