<template>
  <div style="width: 100%; height: 100%">
    <b-container fluid>
      <b-row rows="12">
        <b-col class="col" cols="1" >
          <b-nav vertical class="deseq2Navbar">
            <b-nav-item to="/deseq2/overview">Overview</b-nav-item>
            <b-nav-item to="/deseq2/volcano_plot">Volcano Plot</b-nav-item>
            <b-nav-item to="/deseq2/ma_plot">MA Plot</b-nav-item>
          </b-nav>
        </b-col>
        <b-col class="col" cols="9">
          <router-view/>
        </b-col>
        <b-col class="col" cols="2">
          <b-card v-if="!(this.$store.state.dgeData.conditionPairs.length == 0)" class="text-left">
            Files:
            <li v-for="file in this.$store.state.filelist">
              <small>{{ file }}</small>
            </li>
          </b-card>
          <b-card v-if="!(this.$store.state.dgeData.conditionPairs.length == 0)" class="text-left" >
            Genes:
            <li v-for="item of this.$store.state.subDGE._data">
              <!--<button type="button" class="btn btn-outline-dark btn-sm">{{ item.name }}</button>-->
              <small>{{ item.name }}</small>
            </li>
          </b-card>
          <b-card v-if="!(this.$store.state.dgeData.conditionPairs.length == 0)" class="text-left">
            Entries:
            <!--<li v-for="item in this.$store.state.genelist" style="list-style: none">
              <button type="button" class="btn btn-outline-dark btn-sm" @click="removeitem(item)">{{ item }}</button>
            </li>-->
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
  <!--<b-container fluid >-->
    <!--<b-row>-->
      <!--<b-col class="col" cols="1">-->
        <!--<b-nav vertical class="left_navbar">-->
          <!--<b-nav-item to="/deseq2/overview">Overview</b-nav-item>-->
          <!--<b-nav-item to="/deseq2/volcano_plot">Volcano Plot</b-nav-item>-->
          <!--<b-nav-item to="/deseq2/ma_plot">MA Plot</b-nav-item>-->
        <!--</b-nav>-->
      <!--</b-col>-->
      <!--<b-col>-->
        <!--<router-view/>-->
      <!--</b-col>-->
    <!--</b-row>-->
  <!--</b-container>-->
</template>

<script>
  import {DEL_GENE} from '@/store/mutation_constants'
  export default {
    name: 'DESeq2',
    methods: {
      removeitem (item) {
        this.$store.commit(DEL_GENE, item)
        // this.$store.state.genelist.splice(item)
        console.log(item)
        console.log(this.$store.state.genelist)
      }
    }
  }
</script>

<style>
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
