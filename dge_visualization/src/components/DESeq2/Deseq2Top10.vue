<template>
  <div style="text-align: center">
    <h1>
      Top {{ selectedAmount }} Genes
    </h1>

    <b-form-select
      v-model="selectedCondition1"
      style="width: auto"
      @change="selectedCondition2 = ''"
      @input="statusUpdate()"
    >
      <template slot="first">
        <option :value="''" disabled>
          -- Please select the first condition --
        </option>
      </template>
      <option v-for="cond in Array.from(dgeConditions[0])" :value="cond">{{ cond }}</option>
    </b-form-select>

    <b-form-select
      v-model="selectedCondition2"
      style="width: auto"
      :disabled="selectedCondition1 === ''"
      @input="statusUpdate()"
    >
      <template slot="first">
        <option :value="''" disabled>
          -- Please select the second condition --
        </option>
      </template>
      <option v-for="cond in Array.from(dgeConditions[1])" :value="cond" :disabled="!conditions2.has(cond)">
        {{ cond }}
      </option>
    </b-form-select>

    <b-form-select v-model="selectedNormalization" style="margin-left: 2rem; width: auto" @input="statusUpdate()">
      <template slot="first">
        <option :value="''" disabled>-- Please select a normalization method --</option>
      </template>
      <option v-for="cond in registeredNormalizationMethods" :value="cond">
        {{ cond }}
      </option>
    </b-form-select>

    <hr style="margin-top: 2rem; margin-bottom: 2rem">

    <div v-if="selectedCondition1 && selectedCondition2 && selectedDistributionType && selectedNormalization" align="center" style="margin-top: 2rem">
      <div v-if="selectedAmount" align="center">

        <table class="orderTable" style="width: 100%">
          <tr class="orderRows" style="width: 100%">
            <td class="orderColumns" style="width: 22.5rem; vertical-align: top" align="right">

              <table class="controlTable" style="position: fixed" align="right">
                <tr>
                  <td><b>Use distribution type:</b></td>
                  <td></td>
                </tr>
                <tr>
                  <td>
                    <b-form-select v-model="selectedDistributionType" style="width: auto" @input="statusUpdate()">
                      <template slot="first">
                        <option :value="''" disabled>-- Please select distribution type --</option>
                      </template>
                      <option v-for="distribution in optionsDistributionType" :value="distribution">{{ distribution }}</option>
                    </b-form-select>
                    <hr>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td><b>Common max value:</b></td>
                  <td></td>
                </tr>
                <tr>
                  <td>
                    <b-input-group>
                      <b-form-input v-model="commonMaxValue" style="width: 80%" type="number"
                                    placeholder="Please type in number" @keydown.enter.native="setCommonMax()"></b-form-input>
                    </b-input-group>
                    <i id="highestValue" class="additionalInformation">Highest present value: {{ highestValue[0] }}</i>
                    <hr>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td><b>Ranking size:</b></td>
                  <td></td>
                </tr>
                <tr>
                  <td>
                    Display the top
                    <b-form-select v-model="selectedAmount" style="width: auto" @input="statusUpdate()">
                      <option v-for="amount in optionsAmount" :value="amount">{{ amount }}</option>
                    </b-form-select>
                    genes
                    <hr>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td><b>Rounded values:</b><hr></td>
                  <td>
                    <b-form-checkbox style="float: left;" v-model="isExponential"></b-form-checkbox>
                  </td>
                </tr>
                <tr>
                  <td><b>Show plot title:</b><hr></td>
                  <td>
                    <b-form-checkbox style="float: left;" v-model="showPlotTitle" @input="statusUpdate"></b-form-checkbox>
                  </td>
                </tr>
              </table>

            </td>
            <td class="orderColumns">

              <b-card>
                <table class="rankingTable" style="width: 100%; text-align: left">
                  <tr class="rankingRows" v-for="(number, index) in this.selectedAmount">
                    <td class="rankingColumns" style="width:16.5rem">
                      <!--<div style="font-size:4rem"><b>{{ number }}.</b></div>-->
                      <!--<div style="font-size:1.75rem"><b> {{ generateKey(index) }}</b>-->
                        <!--<span @click="addGene(generateKey(index))">-->
                          <!--<font-awesome-icon style="color: cornflowerblue" :icon="faPlusCircle"></font-awesome-icon>-->
                      <div style="font-size:2rem"><b>{{ number }}.</b></div>
                      <div style="font-size:1.75rem"><b> {{ returnKey(index) }}</b>
                        <span title="Add the Gene to Subset" @click="addGene(generateKey(index))">
                          <font-awesome-icon class="text-secondary" style="cursor: pointer;" :icon="faPlusCircle"></font-awesome-icon>
                        </span>
                      </div>
                      <div v-if="!isExponential">     {{ nameNegotiator() }}: <p>{{ generateValue(index) }}</p></div>
                      <div v-else-if="isExponential"> {{ nameNegotiator() }}: <p>{{ returnAlteredValue(generateValue(index)) }}</p></div>
                    </td>
                    <td class="rankingColumns">
                      <div :id="generateKey(index)" :ref="returnKey(index)" style="height: 400px; max-width: 80%; margin: 0 auto"> no count data </div>
                      <!--<hr style="margin-bottom: 2rem">-->
                    </td>
                  </tr>
                  <tr>
                    <hr style="margin-bottom: 2rem">
                  </tr>
                </table>
              </b-card>

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

  import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
  import {faPlusCircle} from '@fortawesome/free-solid-svg-icons'

  let Highcharts = require('highcharts')
  require('highcharts/modules/exporting')(Highcharts)
  require('highcharts/modules/offline-exporting')(Highcharts)

  export default {
    name: 'Deseq2MAPlot',
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        updateCheck: true,
        isExponential: true,
        showPlotTitle: false,
        commonMaxValue: null,
        selectedCondition1: '',
        selectedCondition2: '',
        selectedDistributionType: 'p-value',
        selectedNormalization: '',
        selectedAmount: 10,
        maxcount: 50,
        optionsAmount: [5, 10, 20, 50],
        entryData: null,
        optionsDistributionType: ['p-value', 'p-value (adjusted)', 'log2 fold change (ascending)', 'log2 fold change (descending)'],
        optionsDict: {'p-value': 'pValue', 'p-value (adjusted)': 'pAdj', 'log2 fold change (ascending)': 'log2FoldChange', 'log2 fold change (descending)': 'log2FoldChange_reverse'},
        highestValue: [],
        FINALSTORAGE: {}
      }
    },
    methods: {
      mountData () {
        let mainStorage = {}
        let condArray = this.$store.state.currentDGE.conditionPairs
        for (let condPair of condArray) {
          let cond1 = condPair['condition1']
          let cond2 = condPair['condition2']
          let dictName = condPair['_condition1'] + condPair['_condition2']
          let condDict = this.collectAnalysisData(cond1, cond2)
          mainStorage[dictName] = condDict
        }
        this.FINALSTORAGE = mainStorage
      },
      collectAnalysisData (cond1, cond2) {
        let dge = this.$store.state.currentDGE.getAllGenesFromDESeq2(cond1, cond2)
        let distributionDictionary = {'pValue': [true, false], 'pAdj': [true, false], 'log2FoldChange': [false, true]}
        // distributionDictionary = {'OPTION': ['inversion, invert ranking?', 'reversion, provide reversion?']}
        let mainStorage = this.collectDataByKey(dge, distributionDictionary, cond1, cond2)
        return (mainStorage)
      },
      collectDataByKey (dge, distributionDictionary, cond1, cond2) {
        let mainStorage = {}

        for (let key in distributionDictionary) {
          let dataLists = this.collectData(dge, cond1, cond2, key)
          let valueDict = dataLists[0]
          let valueList = dataLists[1]

          this.checkMaxCount(valueList.length)

          let inversion = distributionDictionary[key][0]
          let reversion = distributionDictionary[key][1]
          let mainList = valueList.sort(function (a, b) { return b - a })
          let reverseList = valueList.sort(function (a, b) { return b - a })

          if (inversion === false) {
            reverseList.reverse()
          } else {
            mainList.reverse()
          }
          if (reversion === false) {
            mainStorage[key] = this.createRankingDict(valueDict, mainList)
          } else {
            mainStorage[key] = this.createRankingDict(valueDict, mainList)
            mainStorage[key + '_reverse'] = this.createRankingDict(valueDict, reverseList.reverse())
          }
        }
        return (mainStorage)
      },
      collectData (dge, cond1, cond2, key) {
        let valueDict = {}
        let valueList = []
        for (let geneName of dge.geneNames) {
          let value = dge.getGene(geneName).getDESEQ2Analysis(new ConditionPair(cond1, cond2))[key]
          if (isNaN(value)) {
            // console.log('Found NaN value in: ' + geneName)
          } else {
            valueDict = this.insertAnalysisData(valueDict, geneName, value)
            valueList.push(value)
          }
        }
        return ([valueDict, valueList])
      },
      insertAnalysisData (dict, geneName, value) {
        let optionDict = dict
        let key = geneName
        if (optionDict[value] === undefined) {
          optionDict[value] = [key] // if no key for a value: Open new key-list (key always in a list (for multiple entries))
        } else {
          optionDict[value].push(key) // if key-list existing: Add current key.
        }
        return (optionDict)
      },
      checkMaxCount (length) {
        this.maxcount = length
        if (this.selectedAmount > this.maxcount) {
          this.selectedAmount = this.maxcount
        }
      },
      createRankingDict (valueDict, valueList) {
        for (let counter = 0; counter < 5;) {
          counter++
        }
        // valueList must be sorted
        let tempDict = {}
        let maxcount = this.maxcount
        let indexcount = 0
        let previousValue = null

        for (let counter = 0; counter < maxcount;) {
          let value = valueList[counter]
          if (value === previousValue) {
            indexcount++
          } else {
            indexcount = 0
          }
          let key = valueDict[value][indexcount]
          tempDict[key] = value
          previousValue = value
          counter++
        }
        return (tempDict)
      },

      statusUpdate () {
        this.amountNegotiator()
        if (this.selectedCondition1 !== '' && this.selectedCondition2 !== '' && this.selectedNormalization !== '') {
          this.updateCheck = true
          this.createGlobalEntryData()
        } else {
          this.updateCheck = false
        }
      },
      createGlobalEntryData () {
        this.highestValue = []
        let data = this.FINALSTORAGE[this.selectedCondition1 + this.selectedCondition2][this.optionsDict[this.selectedDistributionType]]
        this.entryData = data
      },
      drawData () {
        this.updateCheck = false
        let categories = this.registeredConditions
        let plotTitle = ''
        let plotSubtitle = ''
        let counter = 0
        for (let element in this.entryData) {
          // this.entryData = 50 elements. Check if selected amount is probably lower (default is 10)
          if (counter === (this.selectedAmount)) {
            break
          }

          if (this.showPlotTitle === true) {
            let showCounter = counter + 1
            let currentDistribution = this.nameNegotiator()
            let currentValue = this.entryData[element]
            let currentAlteredValue = this.returnAlteredValue(currentValue)
            plotTitle = element + ', ' + this.selectedCondition1 + ' vs. ' + this.selectedCondition2

            if (this.isExponential === true) {
              plotSubtitle = currentDistribution + ': ' + currentAlteredValue + ', ' + showCounter + '. rank' + ', ' + this.selectedNormalization
            } else {
              plotSubtitle = currentDistribution + ': ' + currentValue + ', ' + showCounter + '. rank' + ', ' + this.selectedNormalization
            }
          }

          let options = {
            chart: {
              type: 'scatter',
              zoomType: 'xy'
            },
            title: {
              text: plotTitle
            },
            subtitle: {
              text: plotSubtitle
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
              '<tr><td>reads:</td><td><b>{point.y:,.2f}</b></td></tr>' +
              '<tr><td>sample:</td><td><b>{point.file}</b></td></tr>',
              footerFormat: '</table>',
              followPointer: false
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
            exporting: {
              buttons: {
                contextButton: {
                  menuItems: ['downloadPNG', 'downloadSVG', 'separator']
                }
              }
            },
            series: [{
              name: 'READS',
              color: 'rgba(223, 83, 83, .5)'
            }]
          }
          let dataList = this.createData(element, categories)

          this.highestValue.sort(function (a, b) { return b - a })

          let data = dataList
          if (data.length === 0) {
            // pass
          } else {
            options.series[0].data = data
            counter = counter + 1
            Highcharts.chart(element, options)
          }
        }
      },
      amountNegotiator () {
        if (this.selectedAmount > this.maxcount) {
          this.selectedAmount = this.maxcount
        }
      },
      nameNegotiator () {
        let nameDict = {'p-value': 'p-value', 'p-value (adjusted)': 'adjusted p-value', 'log2 fold change (ascending)': 'log2 fold change', 'log2 fold change (descending)': 'log2 fold change'}
        return (nameDict[this.selectedDistributionType])
      },
      // Return block
      returnKey (index) {
        let htmlref = this.generateKey(index)
        return (htmlref)
      },
      generateKey (index) {
        let data = this.entryData
        let object = Object.keys(data)
        return (object[index])
      },
      generateValue (index) {
        let data = this.entryData
        let object = Object.values(data)
        return (object[index])
      },
      returnAlteredValue (value) {
        if (this.nameNegotiator() === 'log2 fold change') {
          value = Math.round(value * 100) / 100
          return (value)
        } else {
          value = value.toExponential(2)
          return (value)
        }
      },
      // END Return block
      createData (element, categories) {
        let dataList = []
        let geneCountData = null
        if (this.selectedNormalization === 'deseq2') {
          geneCountData = this.$store.state.currentDGE.getAllDeseq2CountDataByGene(element)
        } else {
          geneCountData = this.$store.state.currentDGE.getAllUnnormalizedCountDataByGene(element)
        }

        for (let entry in geneCountData) {
          let index = categories.indexOf(entry)
          let entryList = geneCountData[entry]
          for (let subentry in entryList) {
            let pointDict = {}
            let value = parseInt(entryList[subentry])
            pointDict['x'] = index
            pointDict['y'] = value
            pointDict['cond'] = entry
            pointDict['file'] = subentry
            dataList.push(pointDict)

            this.highestValue.push(value)
          }
        }
        return (dataList)
      },
      setCommonMax () {
        if (this.commonMaxValue === '' || this.commonMaxValue === '0') {
          this.commonMaxValue = null
        }
        this.drawData()
      },
      addGene (key) {
        let geneList = [key]
        let currentSubDGE = this.$store.state.subDGE.geneNames
        for (let entry of currentSubDGE) {
          if (entry !== key) {
            geneList.push(entry)
          }
        }
        geneList.sort()
        this.$store.dispatch(SET_SUBDGE, {geneList: geneList})
      }
    },
    computed: {
      registeredNormalizationMethods () {
        return this.$store.state.currentDGE.normalizationMethods
      },
      registeredConditions () {
        return this.$store.state.registeredConditions
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
      },
      faPlusCircle () {
        return faPlusCircle
      }
    },
    watch: {
      dge (newDGE, oldDGE) {
        this.updateCheck = true
        this.selectedAmount = 10
        this.selectedAmount = 10
        this.mountData()
        this.statusUpdate()
      }
    },
    beforeMount () {
      this.mountData()
    },
    updated () {
      if (this.updateCheck === true) {
        this.amountNegotiator()
        this.drawData()
      }
    }
  }
</script>

<style scoped>
  tr, th, td {
    border: 0px solid green;
    border-collapse: collapse;
    padding-left: 0.4rem;
    vertical-align: center;
  }
  th {
    background-color: #F6F8F7;
  }
  .rankingRows {
    border-bottom: 1px solid lightgrey;
  }
  .additionalInformation {
    color: lightslategrey;
  }
  @media(max-width: 1600px) {
    tr, th, td {
      border: 0px solid darkorange;
    }
    .rankingTable {
      display: table;
    }
    .rankingRows {
      display: contents;
    }
    .rankingColumns {
      display: table-row;
    }
  }
  @media(max-width: 1200px) {
    tr, th, td {
      border: 0px solid red;
    }
    .orderTable {
      display: table;
    }
    .orderRows {
      display: contents;
    }
    .orderColumns {
      display: table-row
    }

    .controlTable {
      display: contents; /* contents: only working value */
    }

    .rankingTable {
      display: table;
    }
    .rankingRows {
      display: contents;
    }
    .rankingColumns {
      display: table-row;
    }
    td {
      width: 100%;
    }
  }
</style>
