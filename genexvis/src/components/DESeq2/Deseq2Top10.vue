<template>
  <div style="text-align: center">
    <h1 class="header">Top {{ truePossibleAmount }} Genes</h1>

    <b-form-select v-model="selectedCondition1"
                   style="width: auto"
                   @input="selectedCondition2 = '', statusUpdate()">
      <template slot="first">
        <option :value="''" disabled>
          -- Please select the first condition --
        </option>
      </template>
      <option v-for="cond in conditions" :value="cond" :key="cond">{{ cond }}</option>
    </b-form-select>

    <b-form-select v-model="selectedCondition2"
                   style="width: auto"
                   :disabled="selectedCondition1 === ''"
                   @input="statusUpdate()">
      <template slot="first">
        <option :value="''" disabled>
          -- Please select the second condition --
        </option>
      </template>
      <option v-for="cond in conditionMate" :value="cond" :key="cond">
        {{ cond }}
      </option>
    </b-form-select>

    <b-form-select v-model="selectedNormalization" style="margin-left: 2rem; width: auto"
                   @input="statusUpdate()">
      <template slot="first">
        <option :value="''" disabled>-- Please select a normalization method --</option>
      </template>
      <option v-for="cond in registeredNormalizationMethods" :value="cond" :key="cond">
        {{ cond }}
      </option>
    </b-form-select>

    <div v-if="selectedCondition1 && selectedCondition2 && selectedNormalization" v-bind:class="{'mainPartHidden': !showMainPage, 'mainPartVisible': showMainPage }" align="center" style="margin-top: 2rem;">

      <hr>

      <div align="center">
        <table class="orderTable" style="width: 100%">
          <tr class="orderRows" style="width: 100%">
            <td class="orderColumns" style="width: 20rem; vertical-align: top" align="right">
              <table class="controlTable" style="position: fixed" align="right">
                <tr>
                  <td><b>Use distribution type:</b></td>
                  <td></td>
                </tr>
                <tr>
                  <td>
                    <b-form-select v-model="selectedDistributionType" style="width: auto">
                      <template slot="first">
                        <option :value="''" disabled>-- Please select distribution type --</option>
                      </template>
                      <option v-for="distribution in optionsDistributionType" :value="distribution.value" :key="distribution.value">{{ distribution.text }}</option>
                    </b-form-select>
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
                    <b-form-select v-model="selectedAmount" style="width: auto">
                      <option v-for="amount in optionsAmount" :value="amount" :key="amount">{{ amount }}</option>
                    </b-form-select>
                    genes
                    <hr>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td>
                    <b-form-checkbox style="float: left;" v-model="isRounded"></b-form-checkbox>
                    <b>Rounded values</b><hr>
                  </td>
                  <td>
                  </td>
                </tr>
                <tr>
                  <td>
                    <b-form-checkbox style="float: left;" v-model="showPlotTitle"></b-form-checkbox>
                    <b>Show plot title:</b><hr>
                  </td>
                  <td>
                  </td>
                </tr>
              </table>

            </td>
            <td class="orderColumns">
              <b-card style="padding-top=0" no-body>
                <table class="rankingTable" style="width: 100%; text-align: left">
                  <tr class="rankingRows" v-for="number in truePossibleAmount" :key="number">
                    <td class="rankingColumns">
                      <div style="font-size:1.5rem; padding-top: 1.5rem; margin-left: 2rem; margin-rigt: 2rem">
                        <b>{{ number }}. </b>
                        <span v-tooltip="{content: getGeneName(number -1, selectedDistributionType), placement: 'top'}">
                          <b>{{ getShortGeneName(number -1, selectedDistributionType) }}</b>
                        </span>
                        <span title="Add the Gene to Subset" @click="addGene(getGeneName(number - 1, selectedDistributionType))">
                          <font-awesome-icon class="text-secondary" style="cursor: pointer;" :icon="faPlusCircle"></font-awesome-icon>
                        </span>
                      </div>
                      <div :id="getGeneName(number - 1, selectedDistributionType)" :ref="getGeneName(number - 1, selectedDistributionType)" style="height: 400px; min-width: 40%; max-width: 80%; margin: 2rem auto;"> no count data </div>
                      <div style="text-align: center; padding-bottom: 2rem">
                        <span>
                          <b>{{ (selectedDistributionType === 'pValue') ? 'pValue' : 'pAdj' }}:</b> 
                          {{ formatNumber(getValue(number - 1, selectedDistributionType, (selectedDistributionType === 'pValue') ? 'pValue' : 'pAdj'), isRounded) }}  
                        </span>
                        <span style="padding-left: 5rem">
                          <b>log2 fold change:</b> 
                          {{ formatNumber(getValue(number - 1, selectedDistributionType, 'log2FoldChange'), false, (isRounded) ? 2 : null) }}
                        </span>
                      </div>
                    </td>
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

  let Highcharts = require('highcharts');
  require('highcharts/modules/exporting')(Highcharts);
  require('highcharts/modules/offline-exporting')(Highcharts);

  export default {
    name: 'Deseq2Top10',
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        updateCheck: false,
        showMainPage: false,
        isRounded: true,
        showPlotTitle: false,
        selectedCondition1: '',
        selectedCondition2: '',
        selectedDistributionType: 'pAdj',
        selectedNormalization: '',
        selectedAmount: 10,
        optionsAmount: [5, 10, 20, 50],
        entryData: null,
        optionsDistributionType: [
          {text: 'p-value', value: 'pValue'},
          {text: 'p-value (adjusted)', value: 'pAdj'}, 
          {text: 'log2 fold change (ascending)', value: 'log2FoldChange'}, 
          {text: 'log2 fold change (descending)', value: 'log2FoldChange_reverse'}
        ],
        cachedData: {} // {<Condition_Key>: {<Ranking_Parameter/selectedDistributionType>: [Gene_Names]}}
      }
    },
    computed: {
      selectedDistributionTableLabel () {
        let vue = this
        let nameDict = {'pValue': 'p-value', 'pAdj': 'adjusted p-value', 'log2FoldChange': 'log2 fold change', 'log2FoldChange_reverse': 'log2 fold change'};
        return nameDict[vue.selectedDistributionType]
      },
      truePossibleAmount () {
        let vue = this
        let condKey = vue.getConditionKey(vue.selectedCondition1, vue.selectedCondition2)
        if (vue.selectedCondition1 && vue.selectedCondition2) {
          let geneNames = vue.dge.geneNames
          if (geneNames.size < vue.selectedAmount) {
            return geneNames.size
          }
        }
        return vue.selectedAmount
      },
      registeredNormalizationMethods () {
        return this.$store.state.currentDGE.normalizationMethods
      },
      registeredConditions () {
        return this.$store.state.registeredConditions
      },
      conditions () {
        return Array.from(this.$store.state.registeredConditions).sort()
      },
      conditionMate () {
        return Array.from(this.$store.state.currentDGE.getConditionMatesOf(this.selectedCondition1)).sort()
      },
      dge () {
        return this.$store.state.currentDGE
      },
      faPlusCircle () {
        return faPlusCircle
      }
    },
    methods: {
      statusUpdate () {
        if (this.selectedCondition1 !== '' && this.selectedCondition2 !== '' && this.selectedNormalization !== '') {
          this.updateCheck = true;
          this.checkData();
        } else {
          this.updateCheck = false;
        }
      },
      checkData () {
        let vue = this
        let cond1 = vue.selectedCondition1;
        let cond2 = vue.selectedCondition2;

        if (cond1 && cond2) {
          this.generateCondEntry(cond1, cond2, vue.selectedDistributionType)
        }
      },
      generateCondEntry (cond1, cond2, sortingParameter) {
        let vue = this
        let conditionKey = vue.getConditionKey(cond1, cond2)
        if (!vue.cachedData.hasOwnProperty(conditionKey)) {
          vue.$set(vue.cachedData, conditionKey, {})
        }
        let cachedConditionData = vue.cachedData[conditionKey]
        if (!cachedConditionData.hasOwnProperty(sortingParameter)) {
          vue.$set(vue.cachedData[conditionKey], sortingParameter, vue.collectAnalysisData(cond1, cond2, sortingParameter))
        }
      },
      // Return a list of gene names sorted by <sortingParameter> from the DESeq2 analysis of <cond1> vs. <cond2>
      // cond1, cond2: see this.selectedCondition1
      // sortingParameter: pAdj, pValue, log2FoldChange, log2FoldChange_reverse
      collectAnalysisData (cond1, cond2, sortingParameter) {
        let vue = this
        //  basicDistributionDict = {<chosen option>: [<data source>, <reverse data>]}
        let basicDistributionDict = {'pValue': ['pValue', true], 'pAdj': ['pAdj', true], 'log2FoldChange': ['log2FoldChange', true], 'log2FoldChange_reverse': ['log2FoldChange', false]};
        let dge = vue.dge.getAllGenesFromDESeq2(cond1, cond2)
        let trueSortingParameter = basicDistributionDict[sortingParameter][0]
        let reversedOrder = basicDistributionDict[sortingParameter][1]

        let condPair = new ConditionPair(cond1, cond2)
        // Convert Set to Array
        let geneNames = Array.from(dge.geneNames)
        // Use two sorting functions to prevent the usage of Array.prototype.reverse()
        // NaN values will always be at the end of the list
        if (reversedOrder) {
          geneNames.sort( function (a, b) { 
            let a_value = dge.getGene(a).getDESEQ2Analysis(condPair)[trueSortingParameter]
            let b_value = dge.getGene(b).getDESEQ2Analysis(condPair)[trueSortingParameter]
            if (isNaN(a_value)) {
              return 1
            } else if (isNaN(b_value)) {
              return -1
            } else {
              return a_value - b_value
            }
          })
        } else {
          geneNames.sort( function (a, b) { 
            let a_value = dge.getGene(a).getDESEQ2Analysis(condPair)[trueSortingParameter]
            let b_value = dge.getGene(b).getDESEQ2Analysis(condPair)[trueSortingParameter]
            if (isNaN(a_value)) {
              return 1
            } else if (isNaN(b_value)) {
              return -1
            } else {
              return b_value - a_value 
            }
          })
        }
        // Only the top X entries are relevant, where x is the biggest entry in vue.optionsAmount
        geneNames = geneNames.slice(0,vue.optionsAmount.slice(-1))
        return geneNames
      },
      drawHighcharts (cond1, cond2, sortingParameter) {
        let vue = this
        vue.$charts.length = 0
        vue.updateCheck = false
        let categories = this.registeredConditions
        let conditionKey = vue.getConditionKey(cond1, cond2)

        let fontSize = '1rem'
        let counter = 0

        // Create Chart for the entries 0 to <vue.truePossibleAmount>
        for (let element of this.cachedData[conditionKey][sortingParameter].slice(0, vue.truePossibleAmount)) {
          let plotTitle = (this.showPlotTitle === true) ? element : ''

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
              text: plotTitle
            },
            xAxis: {
              categories: categories,
              labels: {
                style: {
                  fontSize: fontSize
                }
              },
              startOnTick: true,
              endOnTick: true,
              showLastLabel: true
            },
            yAxis: {
              min: 0,
              title: {
                text: 'Reads',
                style: {
                  fontSize: fontSize
                }
              },
              labels: {
                style: {
                  fontSize: fontSize
                }
              },
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
                  menuItems: ["printChart", "separator", "downloadPNG", "downloadJPEG", "downloadPDF", "downloadSVG"]
                }
              }
            },
            series: [{
              name: 'READS',
              color: 'rgba(223, 83, 83, .5)'
            }]
          };
          let dataList = this.createData(element, categories);

          let data = dataList;
          if (data.length === 0) {
            // pass
          } else {
            options.series[0].data = data;
            counter = counter + 1;
            const chart = Highcharts.chart(element, options);
            this.$charts.push(chart)
          }
        }
      },
      createData (element, categories) {
        let dataList = [];
        let geneCountData = null;
        if (this.selectedNormalization === 'deseq2') {
          geneCountData = this.dge.getAllDeseq2CountDataByGene(element)
        } else {
          geneCountData = this.dge.getAllUnnormalizedCountDataByGene(element)
        }

        for (let entry in geneCountData) {
          let index = categories.indexOf(entry);
          let entryList = geneCountData[entry];
          for (let subentry in entryList) {
            let pointDict = {};
            let value = parseInt(entryList[subentry]);
            pointDict['x'] = index;
            pointDict['y'] = value;
            pointDict['cond'] = entry;
            pointDict['file'] = subentry;
            dataList.push(pointDict);
          }
        }
        return (dataList)
      },
      getGeneName (index, deseq2Stat) {
        let conditionKey = this.getConditionKey(this.selectedCondition1, this.selectedCondition2)
        if (!this.cachedData.hasOwnProperty(deseq2Stat)) {
          this.generateCondEntry(this.selectedCondition1, this.selectedCondition2, deseq2Stat)
        }
        return this.cachedData[conditionKey][deseq2Stat][index]
      },
      getShortGeneName (index, deseq2Stat) {
        let vue = this
        let letterPerSide = 25
        let geneName = vue.getGeneName(index, deseq2Stat)
        if (geneName === undefined) {
          return ""
        } else {
          return (geneName.length > letterPerSide * 2 + 3) ? geneName.slice(0,letterPerSide) + '...' + geneName.slice(-letterPerSide) : geneName
        }
      },
      //Get Value for index
      //indexList: Defines for which list this index is (see cachedData)
      //deseq2Stat: What value should be returned (valid values: pValue, pValue, log2FoldChange)
      getValue (index, indexListName, deseq2Stat) {
        let vue = this
        let condPair = new ConditionPair(vue.selectedCondition1, vue.selectedCondition2)
        let geneName = vue.getGeneName(index, indexListName)
        if (geneName === undefined) {
          return "NA"
        } else {
          return vue.dge.getGene(geneName).getDESEQ2Analysis(condPair)[deseq2Stat]
        }
      },
      getConditionKey (cond1, cond2) {
        return cond1 + '_' + cond2
      },
      formatNumber (number, convertExponential, roundDigits = null) {
        if (isNaN(number)) {
          return 'NaN'
        }

        let value = number
        if (convertExponential && roundDigits !== null) {
          value = value.toExponential(roundDigits)
        } else if (convertExponential) {
          value = value.toExponential(2)
        } else if (roundDigits !== null) {
          value = Math.round(value * Math.pow(10, roundDigits)) / Math.pow(10, roundDigits)
        }

        return value
      },
      addGene (geneName) {
        let geneList = [geneName];
        let currentSubDGE = this.$store.state.subDGE.geneNames;
        for (let entry of currentSubDGE) {
          if (entry !== geneName) {
            geneList.push(entry)
          }
        }
        geneList.sort();
        this.$store.dispatch(SET_SUBDGE, {geneList: geneList})
      }
    },
    watch: {
      selectedAmount (val, oldVal) {
        let vue = this
        vue.$nextTick(function () {
          if (val > oldVal) {
            vue.drawHighcharts(vue.selectedCondition1, vue.selectedCondition2, vue.selectedDistributionType)
          }
        })
      },
      showPlotTitle (val, oldVal) {
        let vue = this
        vue.$nextTick(function () {
          if (val !== oldVal) {
            vue.drawHighcharts(vue.selectedCondition1, vue.selectedCondition2, vue.selectedDistributionType)
          }
        })
      },
      selectedDistributionType (val, oldVal) {
        let vue = this
        vue.statusUpdate()
        vue.$nextTick(function () {
          if (val !== oldVal) {
            vue.drawHighcharts(vue.selectedCondition1, vue.selectedCondition2, vue.selectedDistributionType)
          }
        })
      },
      selectedCondition1 (val, oldVal) {
        let vue = this
        vue.statusUpdate()
        vue.$nextTick(function () {
          if (val !== oldVal && vue.selectedCondition1 !== '' && vue.selectedCondition2 !== '' && vue.selectedNormalization !== '') {
            vue.drawHighcharts(vue.selectedCondition1, vue.selectedCondition2, vue.selectedDistributionType)
          }
        })
      },
      selectedCondition2 (val, oldVal) {
        let vue = this
        vue.statusUpdate()
        vue.$nextTick(function () {
          if (val !== oldVal && vue.selectedCondition1 !== '' && vue.selectedCondition2 !== '' && vue.selectedNormalization !== '') {
            vue.drawHighcharts(vue.selectedCondition1, vue.selectedCondition2, vue.selectedDistributionType)
          }
        })
      },
      selectedNormalization (val, oldVal) {
        let vue = this
        vue.$nextTick(function () {
          if (val !== oldVal && vue.selectedCondition1 !== '' && vue.selectedCondition2 !== '' && vue.selectedNormalization !== '') {
            vue.drawHighcharts(vue.selectedCondition1, vue.selectedCondition2, vue.selectedDistributionType)
          }
        })
      },
    },
    updated () {
      if (this.updateCheck === true) {
        this.showMainPage = true;
        this.drawHighcharts(this.selectedCondition1, this.selectedCondition2, this.selectedDistributionType)
      }
    }
  }
</script>

<style scoped>
  .mainPartHidden {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.5s linear;
  }
  .mainPartVisible {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.5s linear;
  }

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
  #Deseq2Top10mainPart {
    transition: display 1.5s;
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
