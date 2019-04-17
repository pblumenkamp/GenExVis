<template>
  <div id="app">
    <main-header />
    <router-view />
  </div>
</template>

<script>
  import MainHeader from '@/components/MainHeader.vue'

  export default {
    name: 'App',
    components: {
      MainHeader
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /*text-align: center;*/
    color: #2c3e50;
  }
</style>
