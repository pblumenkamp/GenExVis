<template>
  <div>
    <div style="text-align: left; display: flex; flex-direction: row; justify-content: space-between">
      <span>
        <button class="btn btn-primary table-button" @click="createSubset()">Create Subset</button>
      </span>
      <b-pagination
        v-model="currentPage"
        :total-rows="features.length"
        :per-page="featuresPerSite"
      />
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
        currentPage: 1,
        featuresPerSite: 50,
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
            stickyColumn: true,
            sortable: false
          }]
        for (let column of vue.headerOrder) {
          head.push({
            key: column,
            label: column,
            headerTitle: column,
            headerAbbr: column,
            sortable: false,
            tdClass: 'number_column'
          })
        }
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
        const vue = this
        if (vue.sortedFeatures.length === 0) {
          return []
        }
        let data = []
        let storage = vue.$store.state.currentDGE
        let countData = storage.getCountData(vue.normalization)
        for (let feature of vue.sortedFeatures.slice((vue.currentPage-1)*vue.featuresPerSite, Math.min((vue.currentPage)*vue.featuresPerSite+1, vue.sortedFeatures.length+1))) {
          let dataRow = {}
          for (let condition of Object.values(countData)) {
            for (let sample of Object.keys(condition[feature])) {
              dataRow[sample] = condition[feature][sample].toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
            }
          }

          dataRow['name'] = feature
          data.push(dataRow)
        }
        return data
      },
    },
    watch: {
      features () {
        this.currentPage = 1
      }
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
