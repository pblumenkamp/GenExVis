<template>
  <div style="width: 100%; height: 100%">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
    <b-container fluid>
      <b-row rows="12">
        <b-col class="col" cols="1">
          <b-nav vertical class="deseq2Navbar">
            <b-nav-item to="/deseq2/overview">Overview</b-nav-item>
            <b-nav-item to="/deseq2/volcano_plot">Volcano Plot</b-nav-item>
            <b-nav-item to="/deseq2/ma_plot">MA Plot</b-nav-item>
            <b-nav-item to="/deseq2/distributions">Distributions</b-nav-item>
            <b-nav-item to="/deseq2/top_10">Top 10</b-nav-item>
          </b-nav>
        </b-col>
        <b-col class="col" cols="9">
          <router-view/>
        </b-col>
        <b-col class="col" cols="2">
          <b-card v-if="this.$store.state.deseqlist.length > 0" class="filesBox">
            DESeq2 Files:
            <li v-for="fileName in this.$store.state.deseqlist" style="margin-left: 0.5rem">
              <small>{{ fileName }}</small>
            </li>
          </b-card>
          <b-card v-if="this.$store.state.countlist.length > 0" class="filesBox">
            Count files:
            <li v-for="fileName in this.$store.state.countlist" style="margin-left: 0.5rem">
              <small>{{ fileName }}</small>
            </li>
          </b-card>
          <b-card v-if="this.$store.state.subDGE.geneNames.size > 0" class="genesBox" style="margin-top: 0.5rem">
            Genes In Subset: <b>{{ this.numberWithCommas(this.$store.state.subDGE.length) }}</b>
            <p></p>
            <button v-for="gene in Array.from(this.$store.state.subDGE.geneNames)" @click="removeGene(gene)"
                    type="button" class="btn btn-outline-dark btn-sm" style="margin: 0.1rem">{{ gene }}
            </button>
            <p></p>
            <button @click="clearSubset()" class="btn btn-dark btn-sm" style="float: right">
              <font-awesome-icon :icon="faTrashAlt"></font-awesome-icon> Clear
            </button>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import {SET_SUBDGE} from '../../store/action_constants'

  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faTrashAlt from '@fortawesome/fontawesome-free-solid/faTrashAlt'

  export default {
    name: 'DESeq2',
    components: {
      FontAwesomeIcon
    },
    methods: {
      removeGene (item) {
        let geneList = []
        for (let entry of this.$store.state.subDGE.geneNames) {
          if (entry !== item) {
            geneList.push(entry)
          }
        }
        this.$store.dispatch(SET_SUBDGE, {geneList: geneList})
      },
      clearSubset () {
        this.$store.dispatch(SET_SUBDGE, {geneList: []})
      },
      numberWithCommas (number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
    },
    computed: {
      faTrashAlt () {
        return faTrashAlt
      }
    }
  }
</script>

<style scoped>
  .filesBox {
    text-align: left;
    overflow-y: scroll;
    overflow-x: scroll;
    height: auto;
    max-height: 25rem;
    white-space: nowrap;
    padding: 0.5rem
  }

  .genesBox {
    text-align: left;
    height: fit-content;
    /*margin: 0;*/
  }

  .col {
    /*border: 1px solid limegreen;*/
    /*height: 500px;*/
  }

  .deseq2Navbar {
    height: 100%; /* 100% Full-height */
    position: fixed; /* Stay in place */
    z-index: 1; /* Stay on top */
    overflow-x: hidden; /* Disable horizontal scroll */
    padding-top: 2rem; /* Place content 60px from the top */
  }
</style>
