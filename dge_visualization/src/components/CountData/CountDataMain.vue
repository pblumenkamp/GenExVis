<template>
  <b-container fluid >
    <b-row>
      <b-col class="col" cols="1">
        <b-nav vertical class="left_navbar">
          <b-nav-item to="/countdata/genecount_hm">Gene count heat map</b-nav-item>
          <b-nav-item to="/countdata/genecount_distribution">Gene count histogram</b-nav-item>
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
    name: 'CountData'
  }
</script>
