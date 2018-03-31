<template>
  <div id="DESeq2Overview" align="left">
    <ul v-for="item in deseq2DataX">
    <!--<li>{{ deseq2DataX }}</li>-->
      <p>{{ item }}</p>
    </ul>
  </div>
</template>


<script>
  export default {
    name: 'DESeq2Overview',
    data () {
      return {}
    },
    computed: {
      deseq2DataX () {
        return this.$store.state.dgeData._data
      }
    }
  }
</script>
