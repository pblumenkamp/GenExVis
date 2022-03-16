/* eslint-disable */
<template>
  <div>
    <b-card>
      <h1 class="header" style="text-align: left">Changelogs</h1>
      <h2 class="changelog">0.4.1</h2>
      <h3 class="changelog">Changed</h3>
      <ul>
        <li>Columns in TopX charts are now sorted for a more constant experience.</li>
        <li>Default of file name changed to 'genexvis_export.csv'.</li>
      </ul>
      <h3 class="changelog">Fixed</h3>
      <ul>
        <li>Fixed a crash when opening the overview table with large datasets.</li>
      </ul>
      <h2 class="changelog">0.4.0</h2>
      <div>Revamp of the whole software. Many fixes and additions to prepare GenExVis for public release.</div>
      <h2 class="changelog">0.3.0</h2>
      <h3 class="changelog">Added</h3>
      <ul>
        <li>Added a check if a gene name column was selected on count table import.</li>
        <li>Added a validation check for conditions.</li>
        <li>Added counts-versus-counts scatter plot.</li>
        <li>Added documentation on "Import data" page.</li>
        <li>Added option to download all imported data as CSV.</li>
        <li>Added Top 10 ranking page.</li>
      </ul>
      <h3 class="changelog">Changed</h3>
      <ul>
        <li>Improved space management and scalability of site.</li>
        <li>Redesign DESeq2 overview page.</li>
      </ul>
      <h3 class="changelog">Fixed</h3>
      <ul>
        <li>The first gene is now visible in the "Overview" table.</li>
      </ul>
      <h2 class="changelog">0.2.0</h2>
      <h3 class="changelog">Added</h3>
      <ul>
        <li>Added colored bars for log2 fold change in Deseq2 overview table.</li>
        <li>Added histogram for gene counts.</li>
        <li>Added histograms for p-value and log fold change.</li>
        <li>Added selection table for MA plot.</li>
        <li>Conditions are now removable via Import data page.</li>
      </ul>
      <h3 class="changelog">Changed</h3>
      <ul>
        <li>Enlarged size of all charts but heat map.</li>
        <li>Renamed and remodeled upload page.</li>
        <li>Renamed "Data Upload" to "Data Import" and removed the word "Upload" completly.</li>
      </ul>
      <h3 class="changelog">Fixed</h3>
      <ul>
        <li>Fixed bug that created empty data entries if a DESeq2 file contains empty lines.</li>
        <li>Fixed column duplications in "Deseq2 Overview" page.</li>
      </ul>
      <h2 class="changelog">0.1.0</h2>
      <h3 class="changelog">Added</h3>
      <ul>
        <li>First release.</li>
      </ul>
    </b-card>
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
