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
        responsive
        sticky-header="400px"
        primary-key="name"
        :items="tableData"
        :fields="header"
      />
    </b-card>
  </div>
</template>

<script>
  import {SET_SUBDGE} from '../../store/action_constants'

  export default {
    name: 'CountTable',
    props: {
      features: {
        type: Array,
        required: true
      },
      normalization: {
        type: String,
        required: true
      }
    },
    data () {
      return {

      }
    },
    computed: {
      header () {
        const vue = this
        const head = [
          {
            key: 'name',
            label: 'Feature Name',
            headerTitle: 'Feature Name',
            headerAbbr: 'Feature',
            sortable: true
          }]
        for (let column of vue.headerOrder) {
          head.push({
            key: column,
            label: column,
            headerTitle: column,
            headerAbbr: column,
            sortable: true,
            tdClass: 'number_column'
          })
        }
        console.log(head)
        return head
      },
      conditions () {
        const vue = this
        let storage = vue.$store.state.currentDGE
        let conditions = []
        for (let condition of Object.values(storage.seqRuns[vue.normalization])) {
          if (!(condition in conditions)) {
            conditions.push(condition)
          }
        }
        return conditions.sort()
      },
      headerOrder () {
        const vue = this
        const storage = vue.$store.state.currentDGE
        const samples = Object.keys(storage.seqRuns[vue.normalization]).sort()
        let order = []
        for (const condition of vue.conditions) {
          console.log(condition)
          for (let sample of samples) {
            if (condition === storage.seqRuns[vue.normalization][sample]) {
              order.push(sample)
            }
          }
        }
        return order
      },
      sortedFeatures () {
        return this.features.slice().sort()
      },
      tableData () {
        let data = []
        let storage = this.$store.state.currentDGE
        let countData = storage.getCountData(this.normalization)
        for (let feature of this.features) {
          let dataRow = {}
          for (let condition of Object.values(countData)) {
            for (let sample of Object.keys(condition[feature])) {
              dataRow[sample] = condition[feature][sample]
            }
          }

          dataRow['name'] = feature
          data.push(dataRow)
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
