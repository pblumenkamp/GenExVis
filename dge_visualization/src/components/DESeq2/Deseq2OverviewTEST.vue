<template>
  <div id="DESeq2OverviewTEST">
    <br>
    <p>entry FOR this.$store.state.dgeData._data</p>
    <!--<ul v-for="item in deseq2DataX">-->
      <li>{{ deseq2DataX }}</li>
    <!--</ul>-->
  </div>
</template>

<script>
export default {
  name: 'DESeq2OverviewTEST',
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
