<template>
  <b-container fluid>
    <b-row>
      <b-col cols="2">
        <b-nav vertical>
          <b-nav-item to="/deseq2/upload">Upload</b-nav-item>
          <b-nav-item to="/deseq2/overview">Overview</b-nav-item>
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
</style>
