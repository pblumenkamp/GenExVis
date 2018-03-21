<template>
  <b-container fluid >
    <b-row>
      <b-col class="col" cols="1">
        <b-nav vertical class="deseq2Navbar">
          <b-nav-item to="/deseq2/upload">Upload</b-nav-item>
          <b-nav-item to="/deseq2/overview">Overview</b-nav-item>
          <b-nav-item to="/deseq2/volcano_plot">Volcano Plot</b-nav-item>
        </b-nav>
      </b-col>
      <b-col>
        <router-view/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  export default {
    name: 'DESeq2'
  }
</script>

<style>
  .deseq2Navbar {
    height: 100%; /* 100% Full-height */
    position: fixed; /* Stay in place */
    z-index: 1; /* Stay on top */
    overflow-x: hidden; /* Disable horizontal scroll */
    padding-top: 2rem; /* Place content 60px from the top */
  }
</style>
