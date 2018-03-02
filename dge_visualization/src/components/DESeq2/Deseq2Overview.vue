<template>
  <div>
    DESeq2 Overview

    <ul v-for="element in deseq2Data">
      <li >element.file.name</li>
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
      deseq2Data () {
        return this.$store.deseq2Objects
      }
    }
  }
</script>
