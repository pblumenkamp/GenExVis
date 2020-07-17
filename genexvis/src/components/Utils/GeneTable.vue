<template>
  <div>
    <div style="text-align: left">
      <span>
        <button class="btn btn-primary table-button" @click="createSubset()">Create Subset</button>
      </span>
    </div>
    <b-card>
      <b-table
        striped
        hover
        bordered
        sticky-header="400px"
        primary-key="name"
        :items="tableData"
        :fields="header"
      />
    </b-card>
  </div>
</template>

<script>
  import {ConditionPair} from '../../utilities/dge'
  import {SET_SUBDGE} from '../../store/action_constants'

  export default {
    name: 'GeneTable',
    props: {
      features: {
        type: Array,
        required: true
      },
      conditionA: {
        type: String,
        required: true
      },
      conditionB: {
        type: String,
        required: true
      }
    },
    data () {
      return {
        header: [
          {
            key: 'name',
            label: 'Feature Name',
            headerTitle: 'Feature Name',
            headerAbbr: 'Feature',
            sortable: true
          },
          {
            key: 'baseMean',
            label: 'Base Mean',
            headerTitle: 'Base Mean',
            headerAbbr: 'Mean',
            sortable: true,
            tdClass: 'number_column'
          },
          {
            key: 'log2FoldChange',
            label: 'Log2 Fold Change',
            headerTitle: 'Log2 Fold Change',
            headerAbbr: 'LFC',
            sortable: true,
            tdClass: 'number_column'
          },
          {
            key: 'lfcSE',
            label: 'LFC Standard Error',
            headerTitle: 'LFC Standard Error',
            headerAbbr: 'LFC SE',
            sortable: true,
            tdClass: ['number_column', 'shrinkFaster']
          },
          {
            key: 'stat',
            label: 'Stat',
            headerTitle: 'Stat',
            headerAbbr: 'Stat',
            sortable: true,
            tdClass: 'number_column'
          },
          {
            key: 'pValue',
            label: 'P-Value',
            headerTitle: 'P-Value',
            headerAbbr: 'pVal',
            sortable: true,
            tdClass: 'number_column'
          },
          {
            key: 'pAdj',
            label: 'adjusted P-Value',
            headerTitle: 'adjusted P-Value',
            headerAbbr: 'adj pVal',
            sortable: true,
            tdClass: 'number_column'
          }
        ]
      }
    },
    computed: {
      sortedFeatures () {
        return this.features.slice().sort()
      },
      conditionPair () {
        return new ConditionPair(this.conditionA, this.conditionB)
      },
      tableData () {
        let data = []
        let storage = this.$store.state.currentDGE
        for (let geneName of this.sortedFeatures) {
          let tableRow = {}
          let deseq2Analysis = storage.getGene(geneName).getDESEQ2Analysis(this.conditionPair)
          for (let colName of ['baseMean', 'log2FoldChange', 'lfcSE', 'stat']) {
            tableRow[colName] = deseq2Analysis[colName].toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
          }
          for (let colName of ['pValue', 'pAdj']) {
            tableRow[colName] = deseq2Analysis[colName].toExponential(2)
          }
          tableRow.name = geneName
          data.push(tableRow)
        }
        return data
      },
    },
    methods: {
      createSubset () {
        this.$store.dispatch(SET_SUBDGE, {geneList: this.sortedFeatures})
      },
    }
  }
</script>

<style>
  td.number_column {
    text-align: right;
  }
</style>

<style scoped>
  .table-button {
    margin: 0.2rem 0.2rem 0.4rem;
  }
</style>
