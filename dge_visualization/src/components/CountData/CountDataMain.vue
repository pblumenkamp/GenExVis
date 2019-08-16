<template>
  <b-container fluid>
    <b-row>
      <b-col cols="10">
        <router-view />
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
  #style-1::-webkit-scrollbar-track
  {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    border-radius: 10px;
    background-color: #F5F5F5;
  }

  #style-1::-webkit-scrollbar
  {
    width: 12px;
    background-color: #F5F5F5;
  }

  #style-1::-webkit-scrollbar-thumb
  {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    background-color: #555;
  }
</style>
