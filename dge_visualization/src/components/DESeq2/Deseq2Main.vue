<template>
  <div style="width: 100%; height: 100%">
    <b-container fluid>
      <b-row rows="12">
        <b-col class="col" cols="1" >
          <b-nav vertical class="deseq2Navbar">
            <b-nav-item to="/deseq2/upload">Upload</b-nav-item>
            <b-nav-item to="/deseq2/overview">Overview</b-nav-item>
            <b-nav-item to="/deseq2/richgrid">Rich Grid?</b-nav-item>
            <b-nav-item to="/deseq2/volcano_plot">Volcano Plot</b-nav-item>
          </b-nav>
        </b-col>
        <b-col class="col" cols="9">
          --- ANCHOR ROUTER ---
          <router-view/>
        </b-col>
        <b-col v-if="!(this.$store.state.dgeData.conditionPairs.length == 0)" class="col" cols="2">
          --- ANCHOR UPLOAD ---
          <b-card class="text-left">
            <li v-for="item in this.$store.state.filelist">
              <small>{{ item }}</small>
            </li>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  export default {
    name: 'DESeq2'
  }
</script>

<style>
  .col {
    border: 1px solid limegreen;
    height: 500px;
  }
  .deseq2Navbar {
    height: 100%; /* 100% Full-height */
    position: fixed; /* Stay in place */
    z-index: 1; /* Stay on top */
    overflow-x: hidden; /* Disable horizontal scroll */
    padding-top: 2rem; /* Place content 60px from the top */
  }
</style>
