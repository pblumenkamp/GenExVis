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
          <b-card id="filesBox" v-if="this.$store.state.deseqlist.length > 0" class="filesBox">
            DESeq2 Files:
            <li v-for="fileName in this.$store.state.deseqlist" style="margin-left: 0.5rem">
              <small>{{ fileName }}</small>
            </li>
          </b-card>
          <b-card id="countBox" v-if="this.$store.state.countlist.length > 0" class="filesBox">
            Count files:
            <li v-for="fileName in this.$store.state.countlist" style="margin-left: 0.5rem">
              <small>{{ fileName }}</small>
            </li>
          </b-card>
          <b-card id="genesBox" v-if="this.$store.state.subDGE.geneNames.size > 0" class="card genesBox-small">
            Current Subset:
            <table style="width: 100%; border: 0px solid black">
              <tr>
                <td width="50%">
                  <b>{{ this.numberWithCommas(this.$store.state.subDGE.length) }}</b> genes
                </td>
                <td width="50%">
                  <span style="float: right" @click="showGenes = true; openGenesWindow()" v-if="!showGenes">
                    <font-awesome-icon :icon="faPlusCircle"></font-awesome-icon>
                  </span>
                  <span style="float: right" @click="showGenes = false; openGenesWindow()" v-else>
                    <font-awesome-icon :icon="faMinusCircle"></font-awesome-icon>
                  </span>
                </td>
              </tr>
            </table>
            <table style="width: 100%; border: 1px solid lightslategray" >
             <tr>
               <td>
                 <div id="genesWindow" class="genes-table-closed">
                   <button v-for="gene in Array.from(this.$store.state.subDGE.geneNames)" @click="removeGene(gene)"
                           type="button" class="btn btn-outline-dark btn-xs gene-button" style="margin: 0.1rem">{{ gene }}
                   </button>
                 </div>
               </td>
             </tr>
            </table>
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
  import faPlusCircle from '@fortawesome/fontawesome-free-solid/faPlusCircle'
  import faMinusCircle from '@fortawesome/fontawesome-free-solid/faMinusCircle'

  export default {
    name: 'DESeq2',
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        showGenes: false
      }
    },
    methods: {
      openGenesWindow () {
        console.log(this.showGenes)
        console.log(document.getElementById('genesWindow').className)
        if (this.showGenes === true) {
          document.getElementById('genesWindow').className = 'genes-table-open'
          document.getElementById('genesBox').className = 'card genesBox-large'
        } else {
          document.getElementById('genesWindow').className = 'genes-table-closed'
          document.getElementById('genesBox').className = 'card genesBox-small'
        }
      },
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
      },
      faPlusCircle () {
        return faPlusCircle
      },
      faMinusCircle () {
        return faMinusCircle
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
  .genesBox-small {
    height: 20rem;
    margin-top: 0.5rem
  }
  .genesBox-large {
    height: 100%;
    margin-top: 0.5rem
  }
  .genes-table-closed {
    text-align: left;
    overflow-y: scroll;
    height: 12rem;
    width:  100%;
  }
  .genes-table-open {
    text-align: left;
    overflow-y: scroll;
    height: 100%;
    width:  100%;
  }
  .gene-button {
    font-size: 0.7rem;
    height: 1.8rem;
    width: 6.5rem;
  }
</style>
