<template>
  <b-container fluid>
    <b-row>
      <b-col cols="10">
        <b-row>
          <b-col class="col" cols="2">
            <b-nav vertical class="left_navbar">
              <b-nav-item to="/countdata/genecount_hm">Gene count heat map</b-nav-item>
              <b-nav-item to="/countdata/genecount_distribution">Gene count histogram</b-nav-item>
              <b-nav-item to="/countdata/genecount_comparison">Gene count comparison</b-nav-item>
            </b-nav>
          </b-col>
          <b-col cols="10">
            <router-view />
          </b-col>
        </b-row>
      </b-col>

      <b-col cols="2">
        <b-card v-if="this.$store.state.deseqlist.length > 0" class="filesBox">
          DESeq2 Files:
          <li
            v-for="fileName in this.$store.state.deseqlist"
            :key="fileName"
            style="margin-left: 0.5rem"
          >
            <small>{{ fileName }}</small>
          </li>
        </b-card>
        <b-card v-if="this.$store.state.countlist.length > 0" class="filesBox">
          Count files:
          <li
            v-for="fileName in this.$store.state.countlist"
            :key="fileName"
            style="margin-left: 0.5rem"
          >
            <small>{{ fileName }}</small>
          </li>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  export default {
    name: 'CountData'
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
</style>
