<template>
  <div style="text-align: center">
    <h1>
      Top {{ this.selectedAmount }} {{ this.selectedValue }} values
    </h1>

    <b-form-select v-model="selectedValue" style="width: auto">
      <template slot="first">
        <option :value="''" disabled>-- Please select measurement value --</option>
      </template>
      <option v-for="measure in optionsValue" :value="measure">{{ measure }}</option>
    </b-form-select>

    <b-form-select v-model="selectedAmount" style="width: auto">
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

      <b-form-select v-model="selectedCondition2" style="width: auto" :disabled="selectedCondition1 === ''">
        <template slot="first">
          <option :value="''" disabled>-- Please select the second condition --</option>
        </template>
        <option v-for="cond in Array.from(dgeConditions[1])" :value="cond" :disabled="!conditions2.has(cond)">{{ cond }}</option>
      </b-form-select>
    </div>
    <div v-if="selectedCondition1 && selectedCondition2 && testalert()">

      <hr>

      <div>{{ this.selectedValue }}</div>

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
        datadict: {gene1: 1.2, gene2: 2.3, gene3: 3.4, gene4: 4.5, gene5: 5.6, gene6: 6.7, gene8: 1.2, gene9: 2.0, gene10: 6.1},
        testarray: [],
        reversedict: {},
        rankingarray: []
      }
    },
    methods: {
      testalert () {
        let bigarray = []
        for (let key in this.datadict) {
          let tempdict = {}
          let temparray = []
          console.log(key)
          let value = this.datadict[key]
          console.log(value)
          if (bigarray[value] === undefined) {
            tempdict[value] = [key] // key always in list (for multiple entries)
          } else {
            // console.log(bigarray[value])
          }
          bigarray.push(tempdict)
        }
        console.log(bigarray)
        console.log(bigarray.sort())
      },
      pickdata () {
        // nuffin
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
