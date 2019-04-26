<template xmlns:position="http://www.w3.org/1999/xhtml">
  <div style="width: 100%; height: 600px">
    <div style="text-align: center">
      <h1>Downloads</h1>
    </div>
    <table style="height: 30rem; width: 100%; text-align: center; align-content: center"
         border="0px solid black">
      <!-- Download properties selection area-->
      <tr>
        <td style="width: 70%">
          <!-- Table with two cols: Options and select files -->
          <b-card style="height: 90%; border: 1px solid lightslategray">
            <table style="width:100%" border="0px solid black">
            </table>
          </b-card>
        </td>

      </tr>
      <!-- Download preview area: Table with 5 rows (or selection, if less than 3 genes are selected)-->
      <tr>
      </tr>
    </table>
  </div>
</template>

<script>
  // imports
  // import {AgGridVue} from 'ag-grid-vue'
  // import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  // import faUndoAlt from '@fortawesome/fontawesome-free-solid/faUndoAlt'
  // import faDownload from '@fortawesome/fontawesome-free-solid/faDownload'
  // exports
  export default {
    name: 'Deseq2Download'
  }
</script>

<style scoped>

</style>
