<template>
  <b-container fluid >
    <b-row>
      <b-col class="col" cols="1">
        <b-nav vertical class="left_navbar">
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
