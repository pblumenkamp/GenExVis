<template>
  <div style="text-align: center">
    <h1>
      Top {{ this.selectedAmount }} {{ this.selectedValue }} values
    </h1>

    <b-form-select v-model="selectedValue" style="width: auto" @input="mountData()">
      <template slot="first">
        <option :value="''" disabled>-- Please select measurement value --</option>
      </template>
      <option v-for="measure in optionsValue" :value="measure">{{ measure }}</option>
    </b-form-select>

    <b-form-select v-model="selectedAmount" style="width: auto" @input="createRanking()">
      <template slot="first">
        <option :value="''" disabled>-- Please select measurement value --</option>
      </template>
      <option v-for="amount in optionsAmount" :value="amount">{{ amount }}</option>
    </b-form-select>

    <div v-if="selectedValue && selectedAmount">

      <hr>

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
    </div>
    <div v-if="selectedCondition1 && selectedCondition2">

      <hr>
      <div>{{ this.selectedAmount }}</div>
      <!--<div>gene1, gene8, gene9, gene2, gene3, gene4, gene5, gene10, gene6</div>-->
      <div align="left "v-for="(value, key, index) in this.rankingdict">
        {{ index+1 }}. {{ key }}: {{ value }}
      </div>
    </div>
  </div>
</template>

<script>
  import {ConditionPair} from '../../utilities/dge'
  import {SET_SUBDGE} from '../../store/action_constants'

  // let Highcharts = require('highcharts')
  // require('highcharts/modules/exporting')(Highcharts)
  // require('highcharts/modules/offline-exporting')(Highcharts)

  // const AXIS_COLOR = '#000000'
  // const CHART_ID = 'deseq2maplot_highcharts'

  export default {
    name: 'Deseq2MAPlot',
    data () {
      return {
        selectedCondition1: '',
        selectedCondition2: '',
        selectedValue: '',
        selectedAmount: 10,
        optionsAmount: [5, 10, 20, 50],
        optionsValue: ['base mean', 'log2 fold change', 'lfcSE', 'stat', 'p value', 'p value (adjusted)'],
        optionsDict: {'base mean': 'baseMean', 'log2 fold change': 'log2FoldChange', 'lfcSE': 'lfcSE', 'stat': 'stat', 'p value': 'pValue', 'p value (adjusted)': 'pAdj'},
        // datadict: {gene1: 5.6, gene2: 2.3, gene3: 3.4, gene4: 4.5, gene5: 1.2, gene6: 6.7, gene7: 8.8, gene8: 1.2, gene9: 2, gene10: 6.1, gene11: 3.5, gene12: 6.9, gene13: 3.7, gene14: 1.8, gene15: 5.3, gene16: 4.2, gene17: 0.4, gene18: 0.8, gene19: 4.6, gene20: 9.5},
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
        console.log(this.datadict)
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
        console.log('createRanking: ' + this.selectedAmount)
        let maxcount = this.selectedAmount
        if (maxcount > this.rankingarray.length) {
          maxcount = this.rankingarray.length
        }
        console.log('maxcount: ' + maxcount)
        console.log(this.rankingarray)
        for (let counter = 0; counter < maxcount;) {
          let key = this.rankingarray[counter]
          let keylist = this.reversedict[key]
          for (let value of keylist) {
            this.rankingdict[value] = key
            counter++
            console.log(counter + ' || ' + maxcount)
          }
        }
        console.log(this.rankingdict)
      },
      clearTable () {
        this.rowNames = []
        this.tableData = []
      },
      sortGenes () {
        this.rowNames.sort()
        this.collectData()
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
    }
  }
</script>
<style scoped>
  tr, th, td {
    border: 1px solid lightgrey;
    border-collapse: collapse;
    padding-left: 0.4rem;
  }
  th {
    background-color: #F6F8F7;
  }
  .table-button {
    margin: 0.2rem 0.2rem 0.4rem;
  }
</style>
