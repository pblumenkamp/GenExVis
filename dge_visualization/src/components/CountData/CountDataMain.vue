<template>
  <b-container fluid >
    <b-row>
      <b-col class="col" cols="1">
        <b-nav vertical class="left_navbar">
          <b-nav-item to="/countdata/genecounthm">Gene count heat map</b-nav-item>
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
