/* eslint-disable */
<template>
  <div style="margin: 0 auto; width: 95%">
    <h1><b>Changelogs</b></h1>
    <h2 id="03" class="changelog">0.3</h2>
    <h3 id="added6changes" class="changelog">Added (6 changes)</h3>
    <ul>
      <li>Added a check if a gene name column was selected on count table import.</li>
      <li>Added a validation check for conditions.</li>
      <li>Added counts-versus-counts scatter plot.</li>
      <li>Added documentation on "Import data" page.</li>
      <li>Added option to download all imported data as CSV.</li>
      <li>Added Top 10 ranking page.</li>
    </ul>
    <h3 id="changed2changes" class="changelog">Changed (2 changes)</h3>
    <ul>
      <li>Improved space management and scalability of site.</li>
      <li>Redesign DESeq2 overview page.</li>
    </ul>
    <h3 id="fixed1change" class="changelog">Fixed (1 change)</h3>
    <ul>
      <li>The first gene is now visible in the "Overview" table.</li>
    </ul>
    <h2 id="02" class="changelog">0.2</h2>
    <h3 id="added5changes" class="changelog">Added (5 changes)</h3>
    <ul>
      <li>Added colored bars for log2 fold change in Deseq2 overview table.</li>
      <li>Added histogram for gene counts.</li>
      <li>Added histograms for p-value and log fold change.</li>
      <li>Added selection table for MA plot.</li>
      <li>Conditions are now removable via Import data page.</li>
    </ul>
    <h3 id="changed3changes" class="changelog">Changed (3 changes)</h3>
    <ul>
      <li>Enlarged size of all charts but heat map.</li>
      <li>Renamed and remodeled upload page.</li>
      <li>Renamed "Data Upload" to "Data Import" and removed the word "Upload" completly.</li>
    </ul>
    <h3 id="fixed2changes" class="changelog">Fixed (2 changes)</h3>
    <ul>
      <li>Fixed bug that created empty data entries if a DESeq2 file contains empty lines.</li>
      <li>Fixed column duplications in "Deseq2 Overview" page.</li>
    </ul>
    <h2 id="01" class="changelog">0.1</h2>
    <h3 id="added1change" class="changelog">Added (1 change)</h3>
    <ul>
      <li>First release.</li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'Changelogs'
  }
</script>

<style scoped>
  h2.changelog {
    line-height: 3rem;
    color: black;
  }

  h2.changelog:after {
    content: ' ';
    display: block;
    border: 1px solid #d0d0d0;
  }

  h3.changelog {
    font-size: 1.5rem;
  }
</style>
