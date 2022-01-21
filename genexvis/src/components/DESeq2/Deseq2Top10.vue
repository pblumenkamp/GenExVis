<template>
  <div style="text-align: center">
    <h1 class="header">Top {{ selectedAmount }} Genes</h1>

    <b-form-select v-model="selectedCondition1"
                   style="width: auto"
                   @input="selectedCondition2 = '', statusUpdate()">
      <template slot="first">
        <option :value="''" disabled>
          -- Please select the first condition --
        </option>
      </template>
      <option v-for="cond in conditions" :value="cond">{{ cond }}</option>
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
      <option v-for="cond in conditionMate" :value="cond">
        {{ cond }}
      </option>
    </b-form-select>

    <b-form-select v-model="selectedNormalization" style="margin-left: 2rem; width: auto"
                   @input="statusUpdate()">
      <template slot="first">
        <option :value="''" disabled>-- Please select a normalization method --</option>
      </template>
      <option v-for="cond in registeredNormalizationMethods" :value="cond">
        {{ cond }}
      </option>
    </b-form-select>

    <div v-if="selectedCondKey && selectedNormalization" v-bind:class="{'mainPartHidden': !showMainPage, 'mainPartVisible': showMainPage }" align="center" style="margin-top: 2rem;">

      <hr>

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
                      <b-form-input v-model="commonMaxValue" style="width: 80%" type="number" min="0"
                                    oninput="this.value = Math.abs(this.value)"
                                    placeholder="Please type in number"
                                    @keydown.enter.native="setCommonMax()"></b-form-input>
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
                  <td>
                    <b-form-checkbox style="float: left;"
                                     v-model="isExponential"
                                     @input="updateHighcharts()"></b-form-checkbox>
                    <b>Rounded values</b><hr>
                  </td>
                  <td>
                  </td>
                </tr>
                <tr>
                  <td>
                    <b-form-checkbox style="float: left;" v-model="showPlotTitle" @input="statusUpdate"></b-form-checkbox>
                    <b>Show plot title:</b><hr>
                  </td>
                  <td>
                  </td>
                </tr>
              </table>

            </td>
            <td class="orderColumns">

              <b-card>
                <table class="rankingTable" style="width: 100%; text-align: left">
                  <tr class="rankingRows" v-for="(number, index) in this.selectedAmount">
                    <td class="rankingColumns" style="width:16.5rem">
                      <div style="font-size:3.5rem"><b>{{ number }}.</b></div>
                      <div style="font-size:1.5rem"><b> {{ returnKey(index) }}</b>
                        <span title="Add the Gene to Subset" @click="addGene(generateKey(index))">
                          <font-awesome-icon class="text-secondary" style="cursor: pointer;" :icon="faPlusCircle"></font-awesome-icon>
                        </span>
                      </div>
                      <div v-if="!isExponential">     {{ nameNegotiator() }}: <p>{{ generateValue(index) }}</p></div>
                      <div v-else-if="isExponential"> {{ nameNegotiator() }}: <p>{{ returnAlteredValue(generateValue(index)) }}</p></div>
                    </td>
                    <td class="rankingColumns">
                      <div :id="generateKey(index)" :ref="returnKey(index)" style="height: 400px; min-width: 40%; max-width: 80%; margin: 1rem auto;"> no count data </div>
                      <hr style="margin-bottom: 2rem">
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

  let Highcharts = require('highcharts');
  require('highcharts/modules/exporting')(Highcharts);
  require('highcharts/modules/offline-exporting')(Highcharts);

  export default {
    name: 'Deseq2MAPlot',
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        updateCheck: false,
        showMainPage: false,
        isExponential: true,
        showPlotTitle: false,
        commonMaxValue: null,
        selectedCondition1: '',
        selectedCondition2: '',
        selectedDistributionType: 'p-value (adjusted)',
        selectedTrueDistributionType: 'pAdj',
        selectedNormalization: '',
        selectedAmount: 10,
        selectedCondKey: null,
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
      forceUpdate () {
        this.$forceUpdate()
      },
      updateHighcharts() {
        if (this.showPlotTitle === true) {
          this.drawHighcharts();
        }
      },
      statusUpdate () {
        if (this.selectedCondition1 !== '' && this.selectedCondition2 !== '' && this.selectedNormalization !== '') {
          this.updateCheck = true;
          this.negotiateData();
        } else {
          this.updateCheck = false;
        }
      },
      negotiateData () {
        let cond1 = this.selectedCondition1;
        let cond2 = this.selectedCondition2;

        this.updateDistriType();
        this.checkSelections(cond1, cond2);

        if (this.selectedCondKey === null) {
          this.generateCondEntry(cond1, cond2)
          // because selectedCondKey === null:
          // generateCondEntry defines this.selectedCondKey = conditionKey;
        } else {
          this.checkDistriExistence(cond1, cond2);
        }
      },
      updateDistriType () {
        this.selectedTrueDistributionType = this.optionsDict[this.selectedDistributionType]
      },
      checkSelections (cond1, cond2) {
        let condKey = cond1 + cond2;
        // let condKeyReversed = cond2 + cond1;

        if (this.FINALSTORAGE.hasOwnProperty(condKey)) {
          this.selectedCondKey = condKey;
        // } else if (this.FINALSTORAGE.hasOwnProperty(condKeyReversed)) {
        //   this.selectedCondKey = condKeyReversed;
        } else {
          this.selectedCondKey = null;
        }
      },
      checkDistriExistence (cond1, cond2) {
        let conditionKey = this.selectedCondKey;
        let finalStorage = this.FINALSTORAGE[conditionKey];
        let distributionKey = this.selectedTrueDistributionType;

        if (finalStorage.hasOwnProperty(distributionKey)) {
          // pass
        } else {
          let firstDict = this.FINALSTORAGE[conditionKey];
          let secondDict = this.collectAnalysisData(cond1, cond2);
          this.FINALSTORAGE[conditionKey] = {
            ... firstDict,
            ... secondDict
          }
        }
      },
      generateCondEntry (cond1, cond2) {
        let conditionKey = cond1 + cond2;
        this.selectedCondKey = conditionKey;

        this.FINALSTORAGE[conditionKey] = this.collectAnalysisData(cond1, cond2);
      },
      collectAnalysisData (cond1, cond2) {
        let basicDistributionDict = {'pValue': ['pValue', true], 'pAdj': ['pAdj', true], 'log2FoldChange': ['log2FoldChange', false], 'log2FoldChange_reverse': ['log2FoldChange', true]};
        //  basicDistributionDict = {<chosen option>: [<data source>, <reverse data>]}
        let dge = this.$store.state.currentDGE.getAllGenesFromDESeq2(cond1, cond2)
        let chosenKey = this.optionsDict[this.selectedDistributionType];
        let trueKey = basicDistributionDict[chosenKey][0]
        let trueKeyInversion = basicDistributionDict[chosenKey][1]

        let valueDict = {}
        let valueList = []

        for (let geneName of dge.geneNames) {
          let gene = dge.getGene(geneName)
          let value = gene.getDESEQ2Analysis(new ConditionPair(cond1, cond2))[trueKey]
          if (!isNaN(value)) {
            valueList.push(value)
            valueDict = this.insertAnalysisData(valueDict, geneName, value)
          }
        }

        this.checkMaxCount(valueList.length);
        let mainList = valueList.sort(function (a, b) { return b - a });
        if (trueKeyInversion) {
          mainList.reverse()
        }

        let collectedDataDict = {};
        collectedDataDict[chosenKey] = this.createRankingDict(valueDict, mainList)

        return (collectedDataDict)
      },
      insertAnalysisData (dict, geneName, value) {
        let key = geneName;
        if (dict[value] === undefined) {
          dict[value] = [key] // if no key for a value: Open new key-list (key always in a list (for multiple entries))
        } else {
          dict[value].push(key) // if key-list existing: Add current key.
        }
        return (dict)
      },
      checkMaxCount (length) {
        this.maxcount = length;
        if (this.selectedAmount > this.maxcount) {
          this.selectedAmount = this.maxcount
        }
      },
      createRankingDict (valueDict, valueList) {
        for (let counter = 0; counter < 5;) {
          counter++
        }
        // valueList must be sorted
        let tempDict = {};
        let maxcount = this.maxcount;
        let indexcount = 0;
        let previousValue = null;

        for (let counter = 0; counter < maxcount;) {
          let value = valueList[counter];
          // value can show up more than once: index needs to be pushed
          if (value === previousValue) {
            indexcount++
          } else {
            indexcount = 0
          }
          let key = valueDict[value][indexcount];
          tempDict[key] = value;
          previousValue = value;
          counter++
        }
        return (tempDict)
      },
      drawHighcharts () {
        this.$charts.length = 0;
        this.updateCheck = false;
        let categories = this.registeredConditions;
        let conditionKey = this.selectedCondKey;
        let distributionKey = this.selectedTrueDistributionType;

        let counter = 0;

        for (let element in this.FINALSTORAGE[conditionKey][distributionKey]) {
          // this.entryData = 50 elements. Check if selected amount is probably lower (default is 10)
          if (counter === (this.selectedAmount)) {
            break
          }
          let plotTitle = '';
          let plotSubtitle = '';

          if (this.showPlotTitle === true) {
            let showCounter = counter + 1;
            let currentDistribution = this.nameNegotiator();
            let currentValue = this.FINALSTORAGE[conditionKey][distributionKey][element];
            let currentAlteredValue = this.returnAlteredValue(currentValue);
            plotTitle = element + ', ' + this.selectedCondition1 + ' vs. ' + this.selectedCondition2;

            if (this.isExponential === true) {
              plotSubtitle = currentDistribution + ': ' + currentAlteredValue + ', ' + showCounter + '. rank'
            } else {
              plotSubtitle = currentDistribution + ': ' + currentValue + ', ' + showCounter + '. rank'
            }
          }

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

          this.highestValue.sort(function (a, b) { return b - a });

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
          geneCountData = this.$store.state.currentDGE.getAllDeseq2CountDataByGene(element)
        } else {
          geneCountData = this.$store.state.currentDGE.getAllUnnormalizedCountDataByGene(element)
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

            this.highestValue.push(value)
          }
        }
        return (dataList)
      },
      amountNegotiator () {
        if (this.selectedAmount > this.maxcount) {
          this.selectedAmount = this.maxcount
        }
      },
      nameNegotiator () {
        let nameDict = {'p-value': 'p-value', 'p-value (adjusted)': 'adjusted p-value', 'log2 fold change (ascending)': 'log2 fold change', 'log2 fold change (descending)': 'log2 fold change'};
        return (nameDict[this.selectedDistributionType])
      },
      // Return block
      returnKey (index) {
        let htmlref = this.generateKey(index);
        return (htmlref)
      },
      generateKey (index) {
        let data = this.FINALSTORAGE[this.selectedCondKey][this.selectedTrueDistributionType];
        let object = Object.keys(data);
        return (object[index])
      },
      generateValue (index) {
        let data = this.FINALSTORAGE[this.selectedCondKey][this.selectedTrueDistributionType];

        let object = Object.values(data);
        return (object[index])
      },
      returnAlteredValue (value) {
        if (this.nameNegotiator() === 'log2 fold change') {
          value = Math.round(value * 100) / 100;
          return (value)
        } else {
          value = value.toExponential(2);
          return (value)
        }
      },
      // END Return block
      setCommonMax () {
        if (this.commonMaxValue === '' || this.commonMaxValue === '0') {
          this.commonMaxValue = null
        }
        this.drawHighcharts()
      },
      addGene (key) {
        let geneList = [key];
        let currentSubDGE = this.$store.state.subDGE.geneNames;
        for (let entry of currentSubDGE) {
          if (entry !== key) {
            geneList.push(entry)
          }
        }
        geneList.sort();
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
      conditions () {
        return Array.from(this.$store.state.registeredConditions).sort()
      },
      conditionMate () {
        return Array.from(this.$store.state.currentDGE.getConditionMatesOf(this.selectedCondition1)).sort()
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
    updated () {
      if (this.updateCheck === true) {
        this.showMainPage = true;
        this.amountNegotiator();
        this.drawHighcharts()
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
